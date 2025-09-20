const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");

const User = require("../models/User");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  validateRoles,
  validateDepartments,
} = require("../utils/validateRolesDepartments");

const router = express.Router();

// Middleware: Require authentication for all routes
router.use(authenticateToken);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/* ------------------- USER ROUTES ------------------- */

// Add user (admin only)
router.post("/users", authorizeRoles(["admin"]), async (req, res) => {
  const { username, password, roles, departments } = req.body;

  if (!validateRoles(roles))
    return res.status(400).json({ message: "Invalid roles" });
  if (!validateDepartments(departments))
    return res.status(400).json({ message: "Invalid departments" });

  try {
    const newUser = new User({ username, password, roles, departments });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating user", error: err.message });
  }
});

// Get all users (admin only)
router.get("/users", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "username roles departments");
    res.json(users);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching users", error: err.message });
  }
});

// Delete user by username (admin only)
router.delete(
  "/users/:username",
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({
        username: req.params.username,
      });
      if (!deletedUser)
        return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting user", error: err.message });
    }
  }
);

// Update user roles & departments (admin only)
router.put(
  "/users/:username/role",
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { roles, departments } = req.body;

    if (!validateRoles(roles))
      return res.status(400).json({ message: "Invalid roles" });
    if (!validateDepartments(departments))
      return res.status(400).json({ message: "Invalid departments" });

    try {
      const user = await User.findOne({ username: req.params.username });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.roles = roles;
      user.departments = departments;
      await user.save();

      res.json({ message: "User roles and departments updated" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating user", error: err.message });
    }
  }
);

/* ------------------- ORDER ROUTES ------------------- */

// Helper: Create new order
async function createOrder(req, res) {
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
    } = req.body;

    // Validate required fields
    const requiredFields = {
      companyName: "Company Name",
      poNumber: "PO Number",
      poDate: "PO Date",
      casting: "Casting Type",
      thickness: "Thickness",
      holes: "Holes",
      boxType: "Box Type",
      rate: "Rate",
      toolNumber: "Tool Number",
    };

    const missingFields = Object.entries(requiredFields)
      .filter(
        ([field]) =>
          !req.body[field] || req.body[field].toString().trim() === ""
      )
      .map(([_, label]) => label);

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json({ message: "Missing required fields", missingFields });
    }

    // Validate numeric fields
    const numericFields = { rate, toolNumber, quantity };
    for (const [field, value] of Object.entries(numericFields)) {
      if (value !== undefined && isNaN(Number(value))) {
        return res
          .status(400)
          .json({ message: `Invalid ${field} value. Must be a number.` });
      }
    }

    // Check duplicate PO number
    if (await Order.findOne({ poNumber: poNumber.trim() })) {
      return res.status(409).json({
        message: "PO Number already exists",
        details: "An order with this PO number already exists in the system",
      });
    }

    // Validate rawMaterials if provided
    const validatedRawMaterials = [];
    if (rawMaterials && Array.isArray(rawMaterials)) {
      rawMaterials.forEach((material) => {
        validatedRawMaterials.push({
          materialName: material.materialName || "",
          quantity: Number(material.quantity) || 0,
          totalPrice: Number(material.totalPrice) || 0,
          updatedAt: new Date(),
        });
      });
    }

    const poImagePath = req.file ? req.file.path : null;
    const token = crypto.randomBytes(4).toString("hex").toUpperCase();

    const newOrder = new Order({
      companyName: companyName.trim(),
      poNumber: poNumber.trim(),
      poDate: new Date(poDate),
      poImage: poImagePath,
      casting: casting.trim(),
      thickness: thickness.trim(),
      holes: holes.trim(),
      boxType: boxType.trim(),
      rate: parseFloat(rate),
      status: "Pending",
      createdDate: new Date(),
      token,
      toolNumber: parseInt(toolNumber),
      rawMaterials,
      linings: linings?.trim(),
      laser: laser?.trim(),
      polishType: polishType?.trim(),
      quantity: quantity ? parseInt(quantity) : undefined,
      packingOption: packingOption?.trim(),
      buttonImage,
      dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "Order created successfully", token, order: newOrder });
  } catch (err) {
    console.error("Error creating order:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        error: Object.values(err.errors)
          .map((e) => e.message)
          .join(", "),
      });
    }

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Duplicate entry",
        error: "An order with this information already exists",
      });
    }

    res.status(500).json({ message: "Error creating order" });
  }
}

// Create order (user)
router.post(
  "/orders/user",
  authorizeRoles(["user"]),
  upload.single("poImage"),
  createOrder
);

// Create order (admin)
router.post(
  "/orders",
  authorizeRoles(["admin"]),
  upload.single("poImage"),
  createOrder
);

// Track order by token
router.get("/orders/track/:token", async (req, res) => {
  try {
    const order = await Order.findOne({ token: req.params.token });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
});

// Get all orders (admin only)
router.get("/orders", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching orders", error: err.message });
  }
});

// Update full order (admin only, includes rawMaterials + department processes + nested dates)
router.put("/orders/:poNumber", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const { poNumber } = req.params;

    if (!poNumber) {
      return res.status(400).json({ message: "PO Number is required." });
    }

    // Find order by PO number (case-insensitive)
    const order = await Order.findOne({
      poNumber: new RegExp(`^${poNumber}$`, "i"),
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const updateData = req.body;

    const safeParseNumber = (value) => {
      const parsed = Number(value);
      return isNaN(parsed) ? 0 : parsed;
    };

    const safeParseDate = (value) => {
      try {
        const date = new Date(value);
        return isNaN(date.getTime()) ? new Date() : date;
      } catch {
        return new Date();
      }
    };

    Object.keys(updateData).forEach((key) => {
      // Skip protected fields
      if (["_id", "createdDate", "userId", "token", "poNumber"].includes(key))
        return;

      // Top-level numbers
      if (["rate", "quantity", "toolNumber"].includes(key)) {
        order[key] = safeParseNumber(updateData[key]);
        return;
      }

      // Top-level dates
      if (["poDate", "dispatchDate"].includes(key)) {
        order[key] = safeParseDate(updateData[key]);
        return;
      }

      // Nested objects
      const nestedFields = [
        "castingProcess",
        "turningProcess",
        "polishProcess",
      ];
      if (nestedFields.includes(key) && typeof updateData[key] === "object") {
        Object.entries(updateData[key]).forEach(([nestedKey, value]) => {
          if (order[key]) order[key][nestedKey] = value;
        });
        return;
      }

      // Raw materials array
      if (key === "rawMaterials" && Array.isArray(updateData.rawMaterials)) {
        order.rawMaterials = updateData.rawMaterials.map((rm) => ({
          materialName: rm.materialName || "",
          quantity: safeParseNumber(rm.quantity),
          totalPrice: safeParseNumber(rm.totalPrice),
          updatedAt: rm.updatedAt ? safeParseDate(rm.updatedAt) : new Date(),
        }));
        return;
      }

      // Fallback
      order[key] = updateData[key];
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed.", errors: err.errors });
    }
    console.error("Error updating order:", err);
    res
      .status(500)
      .json({ message: "Error updating order.", error: err.message });
  }
});

// Delete order by ID or PO Number (admin only)
router.delete(
  "/orders/:identifier",
  authorizeRoles(["admin"]),
  async (req, res) => {
    try {
      const { identifier } = req.params;
      if (!identifier)
        return res
          .status(400)
          .json({ message: "Order identifier is required" });

      const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
      const query = isObjectId
        ? { _id: identifier }
        : { poNumber: new RegExp(`^${identifier}$`, "i") };

      const deletedOrder = await Order.findOneAndDelete(query);
      if (!deletedOrder)
        return res.status(404).json({ message: "Order not found" });

      res.json({
        success: true,
        message: "Order deleted successfully",
        deletedOrderId: deletedOrder._id,
        poNumber: deletedOrder.poNumber,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting order", error: err.message });
    }
  }
);

module.exports = router;
