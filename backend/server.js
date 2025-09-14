const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const authenticateToken = require("./middleware/authenticateToken");
const authorizeRoles = require("./middleware/authorizeRoles");

const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const staffRoutes = require("./routes/staff");

const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Default admin
const createDefaultAdmin = async () => {
  const exists = await User.findOne({ username: "admin" });
  if (!exists) {
    const admin = new User({
      username: "admin",
      password: "admin123",
      roles: ["admin"],
    });
    await admin.save();
    console.log("✅ Default admin created (admin/admin123)");
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authenticateToken, userRoutes);
app.use(
  "/api/admin",
  authenticateToken,
  authorizeRoles(["admin"]),
  adminRoutes
);
app.use(
  "/api/staff",
  authenticateToken,
  authorizeRoles(["staff"]),
  staffRoutes
);

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
  createDefaultAdmin();
});
