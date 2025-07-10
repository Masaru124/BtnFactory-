const express = require('express');
const crypto = require('crypto');
const Order = require('../models/Order');
const Challan = require('../models/Challan');
const CustomerHistory = require('../models/CustomerHistory');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.use(authenticateToken);

// Get all orders for logged in user
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders', error: err.message });
  }
});

// Validate token
router.post('/orders/validate-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }
  try {
    const order = await Order.findOne({ token });
    if (!order) {
      return res.status(404).json({ message: 'Invalid token' });
    }
    res.json({ valid: true, order });
  } catch (err) {
    res.status(500).json({ message: 'Error validating token', error: err.message });
  }
});

// Create order for logged in user
router.post('/orders', async (req, res) => {
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
      rawMaterials, // new field for raw materials
    } = req.body;

    if (!companyName || !poNumber || !poDate || !casting || !thickness || !holes || !boxType || !rate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate unique token
    const token = crypto.randomBytes(4).toString('hex').toUpperCase();

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
      status: 'Pending',
      createdDate: new Date(),
      token,
      rawMaterials, // save raw materials
    });

    await newOrder.save();

    res.status(201).json({
      message: 'Order created successfully',
      token: newOrder.token,
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating order', error: err.message });
  }
});

router.get("/track/:token", authenticateToken, async (req, res) => {
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

module.exports = router;
