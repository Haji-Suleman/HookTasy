import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import compression from "compression";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import path from "path";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // compress response bodies

// ✅ Static folder for uploaded images
app.use("/images", express.static(path.join(__dirname, "uploads")));

// ✅ API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ DB Connection
connectDB();

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API working");
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
