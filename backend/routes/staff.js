const express = require('express');
const Product = require('../models/Product');
const Delivery = require('../models/Delivery');
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

module.exports = router;
