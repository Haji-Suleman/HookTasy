import foodModel from "../models/foodModles.js";

import { v2 as cloudinary } from "cloudinary";


const addFood = async (req, res) => {
  // req.files comes from multer's upload.array("images", n)
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("At least one image is required");
  }

  const image_filenames = req.files.map((file) => file.path);

  const { name, description, price, category, pdfLink } = req.body;
  if (!name || !description || !price || !category || !pdfLink) {
    return res.status(400).send("All fields are required");
  }

  const priceNum = parseFloat(price);
  if (isNaN(priceNum)) {
    return res.status(400).send("Invalid price");
  }

  const food = new foodModel({
    name,
    description,
    price: priceNum,
    category,
    pdfLink,
    images: image_filenames,
  });

  try {
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log("Error details:", error);
    res.json({ success: false, message: "Error", error: error.message });
  }
};

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, data: "Error" });
  }
};

const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.json({ success: false, message: "Food not found" });
    }

    await foodModel.findByIdAndDelete(req.body.id);

    if (Array.isArray(food.images)) {
      for (const imgUrl of food.images) {
        // Extract Cloudinary public_id from the URL
        const parts = imgUrl.split("/");
        const fileWithExt = parts[parts.length - 1];
        const publicId = `zootsy-food/${fileWithExt.split(".")[0]}`;

        cloudinary.uploader.destroy(publicId, (err, result) => {
          if (err) console.log("Error removing image:", publicId, err);
          else console.log("Image removed:", publicId, result);
        });
      }
    }

    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
}

export { addFood, listFood, removeFood };