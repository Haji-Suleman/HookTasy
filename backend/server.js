import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import compression from "compression";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ Middlewares
const allowedOrigins = [
  "https://admin-iota-gray-50.vercel.app",   // admin panel
  "https://hook-tasy.vercel.app",           // the storefront (replace with the real address)
  "http://localhost:5173",                   // local dev
  "http://localhost:5174",                   // add any other local port you use
];
app.use(cors.allowedOrigins(allowedOrigins))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// ✅ Ensure DB is connected before any route handles the request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API working");
});

// ✅ API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ✅ Error handler — must be LAST, after all routes
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// ✅ Start server (used for local dev; Vercel ignores this and calls the exported app directly)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;