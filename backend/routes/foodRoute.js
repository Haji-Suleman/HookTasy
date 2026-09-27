import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import 'dotenv/config'
import {
  addFood,
  listFood,
  removeFood,
} from "../controllers/foodController.js";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.ClOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.ClOUDINARY_API_SECRET,
});

// Image Storage Engine (Cloudinary instead of disk)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "zootsy-food",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const uploads = multer({ storage: storage });
const foodRouter = express.Router();

// POST route to handle adding food
foodRouter.post("/add", uploads.array("images", 10), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
export default foodRouter;