const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const User = require("./models/User");
const userRoutes = require("./routes/user");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // keep secrets in .env

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

// --- Routes ---

// 🔐 Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { username: user.username, roles: user.roles },
      JWT_SECRET
    );

    res.json({ token, roles: user.roles });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
});

// 📝 Register
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const newUser = new User({ username, password, roles: ["user"] });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ message: "Registration error", error: err.message });
  }
});

// 🔐 Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (!req.user.roles.includes("admin")) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

// 👥 Admin - Create User
app.post("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  const { username, password, roles } = req.body;
  try {
    const newUser = new User({ username, password, roles });
    await newUser.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ message: "Error creating user", error: err.message });
  }
});

// 👥 Admin - Get All Users
app.get("/api/admin/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "username roles");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
});

// 👥 Admin - Update User Role
app.put("/api/admin/users/:username/role", authenticateToken, requireAdmin, async (req, res) => {
  const { username } = req.params;
  const { roles } = req.body;
  const validRoles = ["admin", "staff", "user"];

  if (!Array.isArray(roles) || roles.some((role) => !validRoles.includes(role))) {
    return res.status(400).json({ message: "Invalid roles" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.roles = roles;
    await user.save();

    res.json({ message: "User roles updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating roles", error: err.message });
  }
});

// Product schema
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
});
const Product = mongoose.model("Product", productSchema);

// Delivery schema
const deliverySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  status: { type: String, enum: ["pending", "shipped", "delivered"], default: "pending" },
});
const Delivery = mongoose.model("Delivery", deliverySchema);

// 📦 Admin - Add Product
app.post("/api/admin/products", authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, price, stock } = req.body;
  try {
    const product = new Product({ name, description, price, stock });
    await product.save();
    res.status(201).json({ message: "Product added" });
  } catch (err) {
    res.status(400).json({ message: "Error adding product", error: err.message });
  }
});

// 📦 Staff - Update Product Stock
app.put("/api/staff/products/:id", authenticateToken, async (req, res) => {
  if (!req.user.roles.includes("staff")) return res.sendStatus(403);

  const { stock } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.stock = stock;
    await product.save();
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(400).json({ message: "Error updating stock", error: err.message });
  }
});

// 🚚 Staff - Create Delivery
app.post("/api/staff/delivery", authenticateToken, async (req, res) => {
  if (!req.user.roles.includes("staff")) return res.sendStatus(403);

  const { productId, quantity, status } = req.body;
  try {
    const delivery = new Delivery({ productId, quantity, status });
    await delivery.save();
    res.status(201).json({ message: "Delivery created" });
  } catch (err) {
    res.status(400).json({ message: "Error creating delivery", error: err.message });
  }
});

// Default admin
const createDefaultAdmin = async () => {
  const exists = await User.findOne({ username: "admin" });
  if (!exists) {
    const admin = new User({ username: "admin", password: "admin123", roles: ["admin"] });
    await admin.save();
    console.log("✅ Default admin created (admin/admin123)");
  }
};

// Custom Routes
app.use("/api/user", authenticateToken, userRoutes);
const adminRoutes = require("./routes/admin");
app.use("/api/admin", authenticateToken, requireAdmin, adminRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  createDefaultAdmin();
});
