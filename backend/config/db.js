import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("🚀 Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(
      "mongodb://localhost:27017/ecommerceFoodWeb"
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ DB connection failed:", error);
    process.exit(1);
  }
};
// The connection fo the database

// "mongodb://localhost:27017/ecommerceFoodWeb"
//("mongodb+srv://banol33255:newwelthypassword@cluster0.w3qrw.mongodb.net/food-web");
