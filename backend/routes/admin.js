const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const {
  validateRoles,
  validateDepartments,
} = require("../utils/validateRolesDepartments");
const multer = require("multer");
const path = require("path");
const router = express.Router();

router.use(authenticateToken);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this folder exists or create it
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Admin route to add user
router.post("/users", authorizeRoles(["admin"]), async (req, res) => {
  const { username, password, roles, departments } = req.body;

  if (!validateRoles(roles)) {
    return res.status(400).json({ message: "Invalid roles" });
  }
  if (!validateDepartments(departments)) {
    return res.status(400).json({ message: "Invalid departments" });
  }

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

// Admin route to get all users
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

// Admin route to delete a user by username
router.delete(
  "/users/:username",
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { username } = req.params;

    try {
      const deletedUser = await User.findOneAndDelete({ username });
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

// Admin route to update user roles and departments
router.put(
  "/users/:username/role",
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { username } = req.params;
    const { roles, departments } = req.body;

    if (!validateRoles(roles)) {
      return res.status(400).json({ message: "Invalid roles" });
    }
    if (!validateDepartments(departments)) {
      return res.status(400).json({ message: "Invalid departments" });
    }

    try {
      const user = await User.findOne({ username });
      if (!user) return res.status(404).json({ message: "User not found" });

      user.roles = roles;
      user.departments = departments;
      await user.save();
      res.json({ message: "User roles and departments updated" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating user roles", error: err.message });
    }
  }
);

// New Admin route to add order with file upload
const crypto = require("crypto"); // for random token generation

router.post(
  "/orders/user",
  authorizeRoles(["user"]),
  upload.single("poImage"),
  async (req, res) => {
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

        // ✅ New optional fields
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

      // Enhanced validation with specific field checks
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

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!req.body[field] || req.body[field].toString().trim() === "") {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Missing required fields",
          missingFields: missingFields,
        });
      }

      // Validate numeric fields
      const numericFields = { rate, toolNumber, quantity };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value !== undefined && value !== null && isNaN(Number(value))) {
          return res.status(400).json({
            message: `Invalid ${field} value. Must be a number.`,
          });
        }
      }

      // Check for duplicate PO number
      const existingOrder = await Order.findOne({ poNumber: poNumber.trim() });
      if (existingOrder) {
        return res.status(409).json({
          message: "PO Number already exists",
          details: "An order with this PO number already exists in the system",
        });
      }

      const poImagePath = req.file ? req.file.path : null;

      const token = crypto.randomBytes(4).toString("hex").toUpperCase();
      console.log("Generated token:", token);

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

        // Save new optional fields
        toolNumber: parseInt(toolNumber),
        rawMaterials,
        linings: linings ? linings.trim() : undefined,
        laser: laser ? laser.trim() : undefined,
        polishType: polishType ? polishType.trim() : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        packingOption: packingOption ? packingOption.trim() : undefined,
        buttonImage,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order created successfully",
        token: newOrder.token,
        order: newOrder,
      });
    } catch (err) {
      console.error("Error creating order:", err);

      // Handle validation errors
      if (err.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: Object.values(err.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }

      // Handle duplicate key errors
      if (err.code === 11000) {
        return res.status(409).json({
          message: "Duplicate entry",
          error: "An order with this information already exists",
        });
      }

      res.status(500).json({
        message: "Error creating order",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

router.post(
  "/orders",
  authorizeRoles(["admin"]),
  upload.single("poImage"),
  async (req, res) => {
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

        // ✅ New optional fields
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

      // Enhanced validation with specific field checks
      const requiredFields = {
        companyName: "Company Name",
        poNumber: "PO Number",
        poDate: "PO Date",
        casting: "Casting Type",
        thickness: "Thickness",
        holes: "Holes",
        boxType: "Box Type",
        rate: "Rate",
        toolNumber: "Tool Number"
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!req.body[field] || req.body[field].toString().trim() === "") {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: "Missing required fields",
          missingFields: missingFields
        });
      }

      // Validate numeric fields
      const numericFields = { rate, toolNumber, quantity };
      for (const [field, value] of Object.entries(numericFields)) {
        if (value !== undefined && value !== null && isNaN(Number(value))) {
          return res.status(400).json({
            message: `Invalid ${field} value. Must be a number.`
          });
        }
      }

      // Check for duplicate PO number
      const existingOrder = await Order.findOne({ poNumber: poNumber.trim() });
      if (existingOrder) {
        return res.status(409).json({
          message: "PO Number already exists",
          details: "An order with this PO number already exists in the system"
        });
      }

      const poImagePath = req.file ? req.file.path : null;

      const token = crypto.randomBytes(4).toString("hex").toUpperCase();
      console.log("Generated token:", token);

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

        // ✅ Save new optional fields
        toolNumber: parseInt(toolNumber),
        rawMaterials,
        linings: linings ? linings.trim() : undefined,
        laser: laser ? laser.trim() : undefined,
        polishType: polishType ? polishType.trim() : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
        packingOption: packingOption ? packingOption.trim() : undefined,
        buttonImage,
        dispatchDate: dispatchDate ? new Date(dispatchDate) : undefined,
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order created successfully",
        token: newOrder.token,
        order: newOrder,
      });
    } catch (err) {
      console.error("Error creating order:", err);

      // Handle validation errors
      if (err.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: Object.values(err.errors).map(e => e.message).join(', ')
        });
      }

      // Handle duplicate key errors
      if (err.code === 11000) {
        return res.status(409).json({
          message: "Duplicate entry",
          error: "An order with this information already exists"
        });
      }

      res.status(500).json({
        message: "Error creating order",
        error: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
  }
);

// router.get("/orders/track/:token", async (req, res) => {
//   try {
//     const order = await Order.findOne({ token: req.params.token });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.json(order);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching order", error: err.message });
//   }
// });

router.get("/orders/track/:token", async (req, res) => {
  try {
    console.log("Received token:", req.params.token); // 👈 log it

    const order = await Order.findOne({ token: req.params.token });
    if (!order) {
      console.log("No order found for token:", req.params.token); // 👈 log failure
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("❌ Track error:", err.message);
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
});

// Optional: get all orders
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

// Admin route to update an order by identifier (ID or PO Number)
router.put(
  "/orders/:identifier",
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { identifier } = req.params;
    const updateData = req.body;

    try {
      // Validate identifier exists
      if (!identifier) {
        return res
          .status(400)
          .json({ message: "Order identifier is required" });
      }

      // Build query (case-insensitive for poNumber)
      const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
      const query = isObjectId
        ? { _id: identifier }
        : { poNumber: { $regex: new RegExp(`^${identifier}$`, "i") } };

      // Remove fields that shouldn't be updated directly
      const restrictedFields = ["_id", "createdDate", "token", "userId"];
      restrictedFields.forEach((field) => delete updateData[field]);

      // Convert numeric fields
      if (updateData.rate) updateData.rate = parseFloat(updateData.rate);
      if (updateData.quantity)
        updateData.quantity = parseInt(updateData.quantity);
      if (updateData.toolNumber)
        updateData.toolNumber = parseInt(updateData.toolNumber);

      // Convert date fields
      if (updateData.poDate) updateData.poDate = new Date(updateData.poDate);
      if (updateData.dispatchDate)
        updateData.dispatchDate = new Date(updateData.dispatchDate);

      // Find and update
      const updatedOrder = await Order.findOneAndUpdate(
        query,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          message: "Order not found",
          details: `No order found with ${
            isObjectId ? "ID" : "PO Number"
          }: ${identifier}`,
        });
      }

      // Success response
      res.json({
        success: true,
        message: "Order updated successfully",
        order: updatedOrder,
      });
    } catch (err) {
      console.error("Update order error:", err);

      // Handle validation errors
      if (err.name === "ValidationError") {
        return res.status(400).json({
          message: "Validation error",
          error: Object.values(err.errors)
            .map((e) => e.message)
            .join(", "),
        });
      }

      // Handle cast errors
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid data format" });
      }

      // Generic error response
      res.status(500).json({
        message: "Error updating order",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

// Admin route to delete an order by ID
const mongoose = require("mongoose");

router.delete(
  "/orders/:identifier",
  authorizeRoles(["admin"]),
  async (req, res) => {
    const { identifier } = req.params;

    try {
      // Validate identifier exists
      if (!identifier) {
        return res
          .status(400)
          .json({ message: "Order identifier is required" });
      }

      // Build query (case-insensitive for poNumber)
      const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
      const query = isObjectId
        ? { _id: identifier }
        : { poNumber: { $regex: new RegExp(`^${identifier}$`, "i") } };

      // Find and delete
      const deletedOrder = await Order.findOneAndDelete(query);

      if (!deletedOrder) {
        return res.status(404).json({
          message: "Order not found",
          details: `No order found with ${
            isObjectId ? "ID" : "PO Number"
          }: ${identifier}`,
        });
      }

      // Success response
      res.json({
        success: true,
        message: "Order deleted successfully",
        deletedOrderId: deletedOrder._id,
        poNumber: deletedOrder.poNumber,
      });
    } catch (err) {
      console.error("Delete order error:", err);

      // Handle specific error types
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid order ID format" });
      }

      // Generic error response
      res.status(500).json({
        message: "Error deleting order",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  }
);

module.exports = router;
