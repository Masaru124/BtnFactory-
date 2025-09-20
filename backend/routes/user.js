const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");

const User = require("../models/User");
const Order = require("../models/Order");
const Challan = require("../models/Challan");
const CustomerHistory = require("../models/CustomerHistory");

const authenticateToken = require("../middleware/authenticateToken");

const router = express.Router();

// 🔐 Protect all user routes
router.use(authenticateToken);

/* ------------------------- PROFILE ------------------------- */

// ✅ Get logged-in user profile
router.get("/profile", (req, res) => {
  res.json({
    username: req.user.username,
    fullName: req.user.fullName,
    // roles: req.user.roles,
    // departments: req.user.departments,
  });
});

// ✅ Update logged-in user profile
router.put("/profile", async (req, res) => {
  try {
    const { fullName } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (fullName) user.fullName = fullName;
    user.updatedAt = new Date();

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        username: user.username,
        fullName: user.fullName,
        // roles: user.roles,
        // departments: user.departments,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
});

/* ------------------------- ORDERS ------------------------- */

// ✅ Get all orders for logged-in user
router.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({
      createdDate: -1,
    });
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
});

// ✅ Validate token for order tracking
router.post("/orders/validate-token", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const order = await Order.findOne({ token });
    if (!order) return res.status(404).json({ message: "Invalid token" });

    res.json({ valid: true, order });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error validating token", error: err.message });
  }
});

// ✅ Create order for logged-in user
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
      toolNumber,
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

    // Required fields validation
    const requiredFields = {
      companyName,
      poNumber,
      poDate,
      casting,
      thickness,
      holes,
      boxType,
      rate,
      toolNumber,
    };
    const missing = Object.entries(requiredFields).filter(([_, v]) => !v);
    if (missing.length > 0) {
      return res.status(400).json({
        message: "Missing required fields",
        missingFields: missing.map(([k]) => k),
      });
    }

    // Check duplicate PO number for this user
    const existingOrder = await Order.findOne({
      poNumber: poNumber.trim(),
      userId: req.user._id,
    });
    if (existingOrder) {
      return res
        .status(409)
        .json({ message: "PO Number already exists for this user" });
    }

    // Generate unique token
    const token = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newOrder = new Order({
      userId: req.user._id,
      companyName: companyName.trim(),
      poNumber: poNumber.trim(),
      poDate: new Date(poDate),
      casting: casting.trim(),
      thickness: thickness.trim(),
      holes: holes.trim(),
      boxType: boxType.trim(),
      rate: parseFloat(rate),
      toolNumber: parseInt(toolNumber),
      rawMaterials,
      linings: linings?.trim(),
      laser: laser?.trim(),
      polishType: polishType?.trim(),
      quantity: quantity ? parseInt(quantity) : undefined,
      packingOption: packingOption?.trim(),
      buttonImage,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
      poImage,
      status: "Pending",
      createdDate: new Date(),
      token,
    });

    await newOrder.save();

    res.status(201).json({
      message: "✅ Order created successfully",
      token: newOrder.token,
      order: newOrder,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating order", error: err.message });
  }
});

// ✅ Track order by token (logged-in user)
router.get("/orders/track/:token", async (req, res) => {
  try {
    const order = await Order.findOne({
      token: req.params.token,
      userId: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
});

module.exports = router;
