import foodModel from "../models/foodModles.js";
import fs from "fs";
const addFood = async (req, res) => {
  let image_filename = `${req.file.filename}`;

  const { name, description, price, category } = req.body;
  if (!name || !description || !price || !category) {
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
    image: image_filename,
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
    res.json({ sucess: false, data: "Error" });
  }
};
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    await foodModel.findByIdAndDelete(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => console.log("Image removed"));
    res.json({ success: true, message: "Food removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Error" });
  }
};
export { addFood, listFood, removeFood };
