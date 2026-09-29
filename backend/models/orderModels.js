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
  stripeSessionId: { type: String },
});