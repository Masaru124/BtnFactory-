const express = require('express');
const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRoles = require('../middleware/authorizeRoles');

const router = express.Router();

router.use(authenticateToken);

// Staff route to manage products (update stock)
router.put('/products/:id', authorizeRoles(['staff']), async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock = stock;
    await product.save();
    res.json({ message: 'Product stock updated' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
});

// Staff route to manage delivery
router.post('/delivery', authorizeRoles(['staff']), async (req, res) => {
  const { productId, quantity, status } = req.body;
  try {
    const newDelivery = new Delivery({ productId, quantity, status });
    await newDelivery.save();
    res.status(201).json({ message: 'Delivery created' });
  } catch (err) {
    res.status(400).json({ message: 'Error creating delivery', error: err.message });
  }
});

// Staff route to update raw material details for an order
router.put('/orders/raw-material/:token', authorizeRoles(['staff']), async (req, res) => {
  const { token } = req.params;
  const { materialName, quantity, totalPrice } = req.body;
  try {
    const order = await Order.findOne({ token });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.rawMaterial = { materialName, quantity, totalPrice };
    await order.save();
    res.json({ message: 'Raw material details updated' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating raw material details', error: err.message });
  }
});

// Staff route to update casting process data for an order
router.put('/orders/casting-process/:token', authorizeRoles(['staff']), async (req, res) => {
  const { token } = req.params;
  const { rawMaterialsUsed, sheetsMade, sheetsWasted, startTime, endTime } = req.body;
  try {
    const order = await Order.findOne({ token });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.castingProcess = { rawMaterialsUsed, sheetsMade, sheetsWasted, startTime, endTime };
    await order.save();
    res.json({ message: 'Casting process data updated' });
  } catch (err) {
    res.status(400).json({ message: 'Error updating casting process data', error: err.message });
  }
});

module.exports = router;
