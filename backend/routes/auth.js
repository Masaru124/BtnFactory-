const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");

const router = express.Router();

// Login route
router.post("/login", async (req, res) => {
  let { username, password } = req.body;
  if (typeof username === "string") {
    username = username.trim();
  }
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // For demo, plain text password check (not secure)
  if (user.password !== password) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign(
    {
      username: user.username,
      roles: user.roles,
      departments: user.departments,
    },
    JWT_SECRET
  );
  const responsePayload = {
    token,
    roles: user.roles,
    departments: user.departments,
  };
  res.json(responsePayload);
});

// Registration route for new users
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const newUser = new User({ username, password, role: "user" });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error registering user", error: err.message });
  }
});

module.exports = router;
