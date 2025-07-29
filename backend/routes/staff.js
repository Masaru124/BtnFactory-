const express = require("express");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

router.use(authenticateToken);

// Staff route to manage products (update stock)
router.put("/products/:id", authorizeRoles(["staff"]), async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.stock = stock;
    await product.save();
    res.json({ message: "Product stock updated" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error updating product", error: err.message });
  }
});

// Staff route to manage delivery
router.post("/delivery", authorizeRoles(["staff"]), async (req, res) => {
  const { productId, quantity, status } = req.body;
  try {
    const newDelivery = new Delivery({ productId, quantity, status });
    await newDelivery.save();
    res.status(201).json({ message: "Delivery created" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating delivery", error: err.message });
  }
});

// Staff route to update raw material details for an order
router.put(
  "/orders/raw-material/:token",
  authorizeRoles(["staff"]),
  async (req, res) => {
    const { token } = req.params;
    const { materialName, quantity, totalPrice } = req.body;

    if (!materialName || !quantity || !totalPrice) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const order = await Order.findOne({ token });
      if (!order) {
        console.warn(`❌ Order with token ${token} not found`);
        return res.status(404).json({ message: "Order not found" });
      }

      order.rawMaterial = {
        materialName,
        quantity,
        totalPrice,
        updatedAt: new Date(),
      };

      await order.save();

      console.log(`✅ Raw material updated for token ${token}`);
      res.json({
        message: "Raw material details updated",
        rawMaterial: order.rawMaterial,
      });
    } catch (err) {
      console.error("❌ Error updating raw material:", err.message);
      res.status(500).json({
        message: "Server error updating raw material details",
        error: err.message,
      });
    }
  }
);

// Staff route to update casting process data for an order
router.put(
  "/orders/casting-process/:token",
  authorizeRoles(["staff"]),
  async (req, res) => {
    const { token } = req.params;
    const { rawMaterialsUsed, sheetsMade, sheetsWasted, startTime, endTime } =
      req.body;
    try {
      const order = await Order.findOne({ token });
      if (!order) return res.status(404).json({ message: "Order not found" });

      order.castingProcess = {
        rawMaterialsUsed,
        sheetsMade,
        sheetsWasted,
        startTime,
        endTime,
      };
      await order.save();
      res.json({ message: "Casting process data updated" });
    } catch (err) {
      res.status(400).json({
        message: "Error updating casting process data",
        error: err.message,
      });
    }
  }
);

router.get(
  "/orders/:token",
  authenticateToken, // ✅ Ensure token is required
  authorizeRoles(["staff", "admin"]), // ✅ Ensure only staff/admin can access
  async (req, res) => {
    try {
      const order = await Order.findOne({ token: req.params.token });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order); // ✅ This must be valid JSON
    } catch (err) {
      res.status(500).json({
        message: "Error fetching order",
        error: err.message,
      });
    }
  }
);

module.exports = router;
