// models/foodModles.js
import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  pdfLink: { type: String },
  images: { type: [String], required: true }, // array instead of single string
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;