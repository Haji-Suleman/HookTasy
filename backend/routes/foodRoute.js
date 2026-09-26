import express from "express";
import multer from "multer";
import {
  addFood,
  listFood,
  removeFood,
} from "../controllers/foodController.js";

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage: storage });
const foodRouter = express.Router();

// POST route to handle adding food
foodRouter.post("/add", uploads.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
export default foodRouter;
