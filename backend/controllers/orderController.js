import orderModel from "../models/orderModels.js";
import userModel from "../models/userModels.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//placing user order
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    const { userId, items, address } = req.body;

    // 1. Only the email is required from the customer
    const email = String(address?.email || "").trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.json({ success: false, message: "Please enter a valid email address." });
    }

    // 2. Each item needs a product name and a quantity
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Your cart is empty." });
    }
    const cleanItems = items.map((i) => ({
      name: String(i.name || "").trim(),
      price: Number(i.price),
      quantity: Number(i.quantity),
    }));
    const invalid = cleanItems.some(
      (i) => !i.name || !(i.price > 0) || !Number.isInteger(i.quantity) || i.quantity < 1
    );
    if (invalid) {
      return res.json({ success: false, message: "Invalid items in your cart." });
    }

    // 3. Total is calculated here, not trusted from the browser (no delivery fee)
    const amount = cleanItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const newOrder = new orderModel({
      userId,
      items: cleanItems,      // name, price, quantity for each product
      amount,
      address: { email },     // email only
    });
    await newOrder.save();

    const line_items = cleanItems.map((item) => ({
      price_data: {
        currency: "pkr",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100 * 80),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      customer_email: email,  // prefilled in Stripe, and the receipt goes here
      metadata: { orderId: String(newOrder._id) },
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log("Error in placing order:", error);
    return res.json({ success: false, message: "Error" });
  }
};
const verifyOrder = async (req, res) => {
  const { orderId, sessionId } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.json({ success: false, message: "Order not found." });

    // already confirmed (e.g. the page was refreshed)
    if (order.payment) return res.json({ success: true, email: order.address?.email });

    // ask Stripe, don't trust the browser
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid" && session.metadata?.orderId === String(order._id)) {
      order.payment = true;
      order.status = "Paid";
      await order.save();
      return res.json({ success: true, email: order.address?.email });
    }
    return res.json({ success: false, message: "Payment was not completed." });
  } catch (error) {
    console.log("Error verifying order:", error);
    return res.json({ success: false, message: "Could not verify payment." });
  }
};
// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// listing all the order for the admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    return res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: "Error" });
  }
};

// api for updating the order status
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
