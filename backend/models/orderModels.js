import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: [orderItemSchema], required: true },
  amount: { type: Number, required: true },
  address: {
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  status: { type: String, default: "Awaiting Payment" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;