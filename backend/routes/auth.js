const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config');

const router = express.Router();

 // Login route
router.post('/login', async (req, res) => {
  let { username, password } = req.body;
  if (typeof username === 'string') {
    username = username.trim();
  }
  const user = await User.findOne({ username });
  console.log('Login attempt for user:', username);
  if (!user) {
    console.log('User not found');
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  // For demo, plain text password check (not secure)
  if (user.password !== password) {
    console.log('Invalid password');
    return res.status(400).json({ message: 'Invalid username or password' });
  }

  console.log('User roles:', user.roles);
  const token = jwt.sign({ username: user.username, roles: user.roles, departments: user.departments }, JWT_SECRET);
  const responsePayload = { token, roles: user.roles, departments: user.departments };
  console.log('Login response payload:', responsePayload);
  res.json(responsePayload);
});

// Registration route for new users
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const newUser = new User({ username, password, role: 'user' });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user', error: err.message });
  }
});

module.exports = router;
