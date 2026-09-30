// models/foodModles.js
import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  pdfLink: { type: String, required: true },
  images: { type: [String], required: true },
  videos: { type: [String] }
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;