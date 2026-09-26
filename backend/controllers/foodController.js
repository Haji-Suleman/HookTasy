import foodModel from "../models/foodModles.js";
import fs from "fs";

const addFood = async (req, res) => {
  // req.files comes from multer's upload.array("images", n)
  if (!req.files || req.files.length === 0) {
    return res.status(400).send("At least one image is required");
  }

  const image_filenames = req.files.map((file) => file.filename);

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

    // remove every image associated with this food item
    if (Array.isArray(food.images)) {
      food.images.forEach((imgName) => {
        fs.unlink(`uploads/${imgName}`, (err) => {
          if (err) console.log("Error removing image:", imgName, err);
          else console.log("Image removed:", imgName);
        });
      });
    }

    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};

export { addFood, listFood, removeFood };