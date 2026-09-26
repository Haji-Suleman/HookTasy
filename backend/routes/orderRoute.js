import express from "express";
import authMiddleware from "../middlewares/auth.js";
import mailMiddleWare from "../middlewares/mailing.js";
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
} from "../controllers/orderController.js";
import Mail from "../Mail/Nodemail.js";
const orderRouter = express.Router();
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get("/list", listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/mail", mailMiddleWare, Mail);
export default orderRouter;
