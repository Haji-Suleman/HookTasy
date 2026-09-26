import orderModel from "../models/orderModels.js";

const mailing = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    let orderData = await orderModel.findById(orderId);

    if (!orderData)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    let { items, amount, address } = orderData;
    req.body.name = address.firstName + " " + address.lastName;
    req.body.email = address.email;
    req.body.items = items;
    req.body.amount = amount;
    next(); // ✅ Proceed to the next middleware
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export default mailing;
