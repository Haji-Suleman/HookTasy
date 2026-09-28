import userModel from "../models/userModels.js";

// add item to user cart
const addToCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.json({ success: false, message: "Missing userId or itemId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Works whether cartData is a plain object or undefined
    const cartData = user.cartData ? { ...user.cartData } : {};
    cartData[itemId] = (cartData[itemId] || 0) + 1;

    user.cartData = cartData;
    await user.save();

    return res.json({ success: true, message: "Added to the cart", cartData });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Error" });
  }
};

// remove item from user cart
const removeFromCart = async (req, res) => {
  try {
    const { userId, itemId } = req.body;
    if (!userId || !itemId) {
      return res.json({ success: false, message: "Missing userId or itemId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const cartData = user.cartData ? { ...user.cartData } : {};
    if (cartData[itemId] > 1) {
      cartData[itemId] -= 1;
    } else {
      delete cartData[itemId];   // last one → remove entirely
    }

    user.cartData = cartData;
    await user.save();

    return res.json({ success: true, message: "Removed from cart", cartData });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Error" });
  }
};

// fetch user cart
const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.json({ success: false, message: "Missing userId" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, cartData: user.cartData || {} });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: "Error" });
  }
};

export { addToCart, removeFromCart, getCart };