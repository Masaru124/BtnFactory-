const express = require('express');
const Order = require('../models/Order');
const Challan = require('../models/Challan');
const CustomerHistory = require('../models/CustomerHistory');
const PromotionScheme = require('../models/PromotionScheme');
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

// Get all challans for logged in user
router.get('/challans', async (req, res) => {
  try {
    const challans = await Challan.find({ userId: req.user._id });
    res.json(challans);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching challans', error: err.message });
  }
});

// Get customer history for logged in user
router.get('/customer-history', async (req, res) => {
  try {
    const history = await CustomerHistory.find({ customerName: req.user.name });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching customer history', error: err.message });
  }
});

// Get promotion schemes
router.get('/promotion-schemes', async (req, res) => {
  try {
    const promotions = await PromotionScheme.find();
    res.json(promotions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching promotion schemes', error: err.message });
  }
});

module.exports = router;
