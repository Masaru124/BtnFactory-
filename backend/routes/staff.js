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

// 6FD7B644
// Staff route to update raw material details for an order
// Add raw materials to an existing order
router.post(
  "/orders/raw-material/:token",
  authorizeRoles(["staff"]),
  async (req, res) => {
    const { token } = req.params;
    const { materials } = req.body;

    if (!Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({ message: "No materials provided" });
    }

    if (
      materials.some((m) => !m.materialName || !m.quantity || !m.totalPrice)
    ) {
      return res.status(400).json({
        message: "Each material must include all fields",
      });
    }

    try {
      const order = await Order.findOne({ token });
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // ✅ Push new materials instead of replacing
      const newMaterials = materials.map((m) => ({
        materialName: m.materialName,
        quantity: m.quantity,
        totalPrice: m.totalPrice,
        updatedAt: new Date(),
      }));

      order.rawMaterials.push(...newMaterials); // append array
      await order.save();

      res.status(201).json({
        message: "✅ Raw materials added to order",
        rawMaterials: order.rawMaterials,
      });
    } catch (err) {
      console.error("❌ Error adding raw materials:", err.message);
      res.status(500).json({
        message: "Server error adding raw materials",
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

// Polish route to update polish process data for an order
router.put(
  "/orders/polish-process/:token",
  authorizeRoles(["staff"]),
  async (req, res) => {
    const { token } = req.params;
    const {
      totalSheets,
      polishDate,
      receivedDate,
      startTime,
      endTime,
      GrossWeight,
      WtinKg,
    } = req.body;
    try {
      const order = await Order.findOne({ token });
      if (!order) return res.status(404).json({ message: "Order not found" });
      order.polishProcess = {
        totalSheets,
        polishDate,
        receivedDate,
        startTime,
        endTime,
        GrossWeight,
        WtinKg,
      };
      await order.save();
      res.json({ message: "Polish process data updated" });
    } catch (err) {
      res.status(400).json({
        message: "Error updating polish process data",
        error: err.message,
      });
    }
  }
);

//Turning route to update turning process data for an order
router.put(
  "/orders/turning-process/:token",
  authorizeRoles(["staff"]),
  async (req, res) => {
    const { token } = req.params;
    const {
      totalSheets,
      turningDate,
      receivedDate,
      startTime,
      endTime,
      GrossWeight,
      WtinKg,
      FinishThickness,
    } = req.body;
    try {
      const order = await Order.findOne({ token });
      if (!order) return res.status(404).json({ message: "Order not found" });
      order.turningProcess = {
        totalSheets,
        turningDate,
        receivedDate,
        startTime,
        endTime,
        GrossWeight,
        WtinKg,
        FinishThickness,
      };
      await order.save();
      res.json({ message: "Turning process data updated" });
    } catch (err) {
      res.status(400).json({
        message: "Error updating turning process data",
        error: err.message,
      });
    }
  }
);
