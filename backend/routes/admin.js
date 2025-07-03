const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");
const { validateRoles, validateDepartments } = require("../utils/validateRolesDepartments");
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
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
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
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
});

// Admin route to get all users
router.get("/users", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const users = await User.find({}, "username roles departments");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// Admin route to delete a user by username
router.delete("/users/:username", authorizeRoles(["admin"]), async (req, res) => {
  const { username } = req.params;

  try {
    const deletedUser = await User.findOneAndDelete({ username });
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
});

// Admin route to update user roles and departments
router.put("/users/:username/role", authorizeRoles(["admin"]), async (req, res) => {
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
    res.status(500).json({ message: "Error updating user roles", error: err.message });
  }
});


// New Admin route to add order with file upload
const crypto = require("crypto"); // for random token generation

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
      } = req.body;

      if (!companyName || !poNumber || !poDate || !casting || !thickness || !holes || !boxType || !rate) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const poImagePath = req.file ? req.file.path : null;

      // ✅ Generate unique token (e.g. 8-character alphanumeric)
      const token = crypto.randomBytes(4).toString("hex").toUpperCase();

      const newOrder = new Order({
        companyName,
        poNumber,
        poDate: new Date(poDate),
        poImage: poImagePath,
        casting,
        thickness,
        holes,
        boxType,
        rate: parseFloat(rate),
        status: "Pending",
        createdDate: new Date(),
        token, // ✅ save token
      });

      await newOrder.save();

      res.status(201).json({
        message: "Order created successfully",
        token: newOrder.token, // ✅ return token to frontend
        order: newOrder,
      });
    } catch (err) {
      res.status(500).json({ message: "Error creating order", error: err.message });
    }
  }
);


router.get("/orders/track/:token", async (req, res) => {
  try {
    const order = await Order.findOne({ token: req.params.token });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err.message });
  }
});


// Optional: get all orders
router.get("/orders", authorizeRoles(["admin"]), async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders", error: err.message });
  }
});

module.exports = router;
