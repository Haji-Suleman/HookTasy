import mongoose from "mongoose";
import orderModel from "../models/orderModels.js";
import foodModel from "../models/foodModles.js";
import Stripe from "stripe";

import { sendOrderEmail } from "../Mail/Nodemail.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Your prices are stored in USD; this converts them to PKR for Stripe.
// Change it if you want a different rate.
const USD_TO_PKR = 80;

// First image of a product, whether stored as a string or { url } / { src }
const firstImage = (product) => {
  const raw = Array.isArray(product?.images) ? product.images[0] : product?.image;
  return typeof raw === "string" ? raw : raw?.url || raw?.src || "";
};

// Returns a plain copy of the order where every item has its pdfLink
// and first image (img), read from the products collection. Works even if
// the order schema does not store them.
const withPdfLinks = async (order, productIds = []) => {
  const plain = order.toObject();

  const items = await Promise.all(
    plain.items.map(async (item, idx) => {
      let product = null;

      const id = productIds[idx];
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        product = await foodModel.findById(id).select("pdfLink images image");
      }
      if (!product) {
        product = await foodModel.findOne({ name: item.name }).select("pdfLink images image");
      }

      return {
        ...item,
        pdfLink: item.pdfLink || product?.pdfLink || "",
        img: firstImage(product),
      };
    })
  );

  return { ...plain, items };
};

// placing user order
const placeOrder = async (req, res) => {
  const frontend_url = "https://zootsyshop.com";
  try {
    const { userId, items, address } = req.body;

    // 1. Only the email is required from the customer
    const email = String(address?.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.json({ success: false, message: "Please enter a valid email address." });
    }

    // 2. Each item needs a product id and a quantity
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Your cart is empty." });
    }

    const requested = items.map((i) => ({
      id: String(i._id || i.id || ""),
      quantity: Number(i.quantity),
    }));

    const badRequest = requested.some(
      (i) =>
        !mongoose.Types.ObjectId.isValid(i.id) ||
        !Number.isInteger(i.quantity) ||
        i.quantity < 1
    );
    if (badRequest) {
      return res.json({ success: false, message: "Invalid items in your cart." });
    }

    // 3. Name, price and pdfLink come from the database, not from the browser
    const products = await foodModel.find({
      _id: { $in: [...new Set(requested.map((i) => i.id))] },
    });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const cleanItems = requested.map((i) => {
      const p = productMap.get(i.id);
      return p
        ? {
          name: String(p.name || "").trim(),
          price: Number(p.price),
          quantity: i.quantity,
          pdfLink: String(p.pdfLink || "").trim(),
        }
        : null;
    });

    const invalid =
      cleanItems.some((i) => i === null) ||
      cleanItems.some((i) => !i.name || !/^https?:\/\//i.test(i.pdfLink));
    if (invalid) {
      return res.json({ success: false, message: "Invalid items in your cart." });
    }

    // 4. Total is calculated here, not trusted from the browser (no delivery fee)
    const amount = cleanItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder = new orderModel({
      userId,
      items: cleanItems,
      amount,
      address: { email },
      emailSent: false, // the confirmation email has not been sent yet
    });
    await newOrder.save();

    const line_items = cleanItems.map((item) => ({
      price_data: {
        currency: "pkr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100 * USD_TO_PKR),
      },
      quantity: item.quantity,
    }));

    // Product ids (same order as the order's items) so the confirmation email
    // can always find each pdfLink and image. Stripe metadata values max out at 500 chars.
    const productIdsMeta = requested.map((i) => i.id).join(",");

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      customer_email: email,
      metadata: {
        orderId: String(newOrder._id),
        ...(productIdsMeta.length <= 500 ? { productIds: productIdsMeta } : {}),
      },
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    // remember which Stripe session belongs to this order
    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    return res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log("Error in placing order:", error);
    return res.json({ success: false, message: "Error" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.json({ success: false, message: "Invalid order reference." });
    }

    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found." });

    console.log("[verify] hit:", orderId, "| payment:", order.payment, "| emailSent:", order.emailSent);

    // the list of patterns the verify page shows
    const buildDownloads = async (orderDoc, productIds = []) => {
      const full = await withPdfLinks(orderDoc, productIds);
      return full.items.map((i) => ({ name: i.name, pdfLink: i.pdfLink, img: i.img }));
    };

    // Sends the confirmation email at most once, and retries after a failure.
    // Returns true = sent, false = failed (retried on the next verify), null = nothing to do.
    // Only orders stored with emailSent: false are touched, so old orders never get a surprise email.
    const sendEmailOnce = async (productIds = []) => {
      // atomic claim: only one request can flip emailSent from false to true
      const claimed = await orderModel.findOneAndUpdate(
        { _id: orderId, payment: true, emailSent: false },
        { emailSent: true },
        { new: true }
      );
      if (!claimed) {
        console.log("[verify] email skipped (already sent, being sent, or legacy order):", orderId);
        return null;
      }

      try {
        const orderForEmail = await withPdfLinks(claimed, productIds);
        await sendOrderEmail(orderForEmail);
        return true;
      } catch (mailError) {
        console.log("Confirmation email failed:", mailError);
        // release the claim so the next verify call tries again
        await orderModel.updateOne({ _id: orderId }, { emailSent: false });
        return false;
      }
    };

    // already confirmed earlier (page refreshed, or a previous email failed)
    if (order.payment) {
      const result = await sendEmailOnce();
      const items = await buildDownloads(order);
      return res.json({
        success: true,
        email: order.address?.email,
        items,
        emailSent: result !== false,
      });
    }

    if (!order.stripeSessionId) {
      return res.json({ success: false, message: "No payment found for this order." });
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
    if (session.payment_status === "paid") {
      // atomic: only the first request flips payment to true
      const updated = await orderModel.findOneAndUpdate(
        { _id: orderId, payment: false },
        { payment: true, status: "Paid" },
        { new: true }
      );

      const productIds = (session.metadata?.productIds || "")
        .split(",")
        .filter(Boolean);

      const result = await sendEmailOnce(productIds);
      const items = await buildDownloads(updated || order, productIds);
      return res.json({
        success: true,
        email: order.address?.email,
        items,
        emailSent: result !== false,
      });
    }

    return res.json({ success: false, message: "Payment was not completed." });
  } catch (error) {
    console.log("Error verifying order:", error);
    return res.json({ success: false, message: "Could not verify payment." });
  }
};

// orders of one user
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// listing all orders for the admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// updating the order status from the admin panel
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    return res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };