const express = require("express");
const crypto = require("crypto");
const Order = require("../models/Order");
const Challan = require("../models/Challan");
const CustomerHistory = require("../models/CustomerHistory");
const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// 🔐 Protect all routes by default
router.use(authenticateToken);

// ✅ GET user profile
router.get("/profile", (req, res) => {
  res.json({
    username: req.user.username,
    roles: req.user.roles,
    departments: req.user.departments,
    fullName: req.user.fullName
  });
});

// ✅ UPDATE user profile
router.put("/profile", async (req, res) => {
  try {
    const { fullName } = req.body;
    
    // Update user in database
    const user = await req.user.model('User').findById(req.user._id);
    if (fullName) user.fullName = fullName;
    await user.save();
    
    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        fullName: user.fullName,
        roles: user.roles,
        departments: user.departments
      }
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating profile",
      error: err.message
    });
  }
});

// ✅ GET all orders for the logged-in user
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching orders",
      error: err.message,
    });
  }
});

// ✅ Validate token
router.post("/orders/validate-token", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    const order = await Order.findOne({ token });
    if (!order) {
      return res.status(404).json({ message: "Invalid token" });
    }
    res.json({ valid: true, order });
  } catch (err) {
    res.status(500).json({
      message: "Error validating token",
      error: err.message,
    });
  }
});

// ✅ Create order for the logged-in user
router.post("/orders", async (req, res) => {
  try {
    const {
      companyName,
      poNumber,
      poDate,
      casting,
      thickness,
      holes,
      boxType,
      rate,
      rawMaterials,
      linings,
      laser,
      polishType,
      quantity,
      packingOption,
      buttonImage,
      dispatchDate,
      poImage,
    } = req.body;

    // Validate required fields
    if (
      !companyName ||
      !poNumber ||
      !poDate ||
      !casting ||
      !thickness ||
      !holes ||
      !boxType ||
      !rate
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Generate unique token
    const token = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newOrder = new Order({
      userId: req.user._id,
      companyName,
      poNumber,
      poDate: new Date(poDate),
      casting,
      thickness,
      holes,
      boxType,
      rate: parseFloat(rate),
      rawMaterials,
      linings,
      laser,
      polishType,
      quantity,
      packingOption,
      buttonImage,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
      poImage,
      status: "Pending",
      createdDate: new Date(),
      token,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      token: newOrder.token,
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating order",
      error: err.message,
    });
  }
});

// ✅ Track order by token (optionally remove auth if public)
router.get("/track/:token", async (req, res) => {
  try {
    const order = await Order.findOne({ token: req.params.token });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching order",
      error: err.message,
    });
  }
});

module.exports = router;
