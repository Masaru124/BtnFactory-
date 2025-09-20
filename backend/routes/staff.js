const express = require("express");
const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const Product = require("../models/Product");
const authenticateToken = require("../middleware/authenticateToken");
const authorizeRoles = require("../middleware/authorizeRoles");

const router = express.Router();

// ✅ Require staff authentication for all routes
router.use(authenticateToken, authorizeRoles(["staff"]));

/* ------------------------- PRODUCT MANAGEMENT ------------------------- */

// Update product stock
router.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    product.stock = stock;
    await product.save();
    res.json({ message: "✅ Product stock updated", product });
  } catch (err) {
    if (err.name === "CastError" && err.kind === "ObjectId") {
      return res.status(404).json({ message: "Product not found" });
    }
    res
      .status(400)
      .json({ message: "Error updating product", error: err.message });
  }
});

/* ------------------------- DELIVERY MANAGEMENT ------------------------- */

// Create a new delivery
router.post("/delivery", async (req, res) => {
  const { productId, quantity, status } = req.body;
  try {
    const newDelivery = new Delivery({ productId, quantity, status });
    await newDelivery.save();
    res
      .status(201)
      .json({ message: "✅ Delivery created", delivery: newDelivery });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error creating delivery", error: err.message });
  }
});

/* ------------------------- ORDER RAW MATERIALS ------------------------- */

// Add raw materials to an existing order
router.post("/orders/raw-material/:token", async (req, res) => {
  const { token } = req.params;
  const { materials } = req.body;

  if (!Array.isArray(materials) || materials.length === 0) {
    return res.status(400).json({ message: "No materials provided" });
  }

  if (materials.some((m) => !m.materialName || !m.quantity || !m.totalPrice)) {
    return res.status(400).json({
      message: "Each material must include materialName, quantity, and totalPrice",
    });
  }
  
  // Validate numeric fields
  for (const material of materials) {
    if (isNaN(Number(material.quantity))) {
      return res.status(400).json({ message: "quantity must be a number" });
    }
    if (isNaN(Number(material.totalPrice))) {
      return res.status(400).json({ message: "totalPrice must be a number" });
    }
  }

  try {
    const order = await Order.findOne({ token });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const newMaterials = materials.map((m) => ({
      materialName: m.materialName,
      quantity: Number(m.quantity),
      totalPrice: Number(m.totalPrice),
      updatedAt: new Date(),
    }));

    order.rawMaterials.push(...newMaterials);
    await order.save();

    res.status(201).json({
      message: "✅ Raw materials added to order",
      rawMaterials: order.rawMaterials,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Server error adding raw materials",
        error: err.message,
      });
  }
});

/* ------------------------- ORDER PROCESS UPDATES ------------------------- */

// Update casting process
router.put("/orders/casting-process/:token", async (req, res) => {
  const { token } = req.params;
  const { rawMaterialsUsed, sheetsMade, sheetsWasted, startTime, endTime } = req.body;

  try {
    const order = await Order.findOne({ token });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Validate numeric fields
    const castingProcess = {};
    
    // Add validation for numeric fields
    if (rawMaterialsUsed !== undefined) {
      if (isNaN(Number(rawMaterialsUsed))) {
        return res.status(400).json({ message: "rawMaterialsUsed must be a number" });
      }
      castingProcess.rawMaterialsUsed = Number(rawMaterialsUsed);
    }
    
    if (sheetsMade !== undefined) {
      if (isNaN(Number(sheetsMade))) {
        return res.status(400).json({ message: "sheetsMade must be a number" });
      }
      castingProcess.sheetsMade = Number(sheetsMade);
    }
    
    if (sheetsWasted !== undefined) {
      if (isNaN(Number(sheetsWasted))) {
        return res.status(400).json({ message: "sheetsWasted must be a number" });
      }
      castingProcess.sheetsWasted = Number(sheetsWasted);
    }
    
    // Validate date fields
    if (startTime) {
      try {
        const parsedDate = new Date(startTime);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "startTime must be a valid date" });
        }
        castingProcess.startTime = parsedDate;
      } catch (err) {
        return res.status(400).json({ message: "startTime must be a valid date" });
      }
    }
    
    if (endTime) {
      try {
        const parsedDate = new Date(endTime);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: "endTime must be a valid date" });
        }
        castingProcess.endTime = parsedDate;
      } catch (err) {
        return res.status(400).json({ message: "endTime must be a valid date" });
      }
    }
    
    castingProcess.updatedAt = new Date();
    
    // Update the order with validated data
    order.castingProcess = castingProcess;
    await order.save();
    
    res.json({
      message: "✅ Casting process updated",
      castingProcess: order.castingProcess,
    });
  } catch (err) {
    res.status(400).json({ 
      message: "Error updating casting process", 
      error: err.message 
    });
  }
});

// Update polish process
router.put("/orders/polish-process/:token", async (req, res) => {
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

    // Validate numeric fields
    const polishProcess = {};
    
    // Add validation for numeric fields
    if (totalSheets !== undefined) {
      if (isNaN(Number(totalSheets))) {
        return res.status(400).json({ message: "totalSheets must be a number" });
      }
      polishProcess.totalSheets = Number(totalSheets);
    }
    
    if (GrossWeight !== undefined) {
      if (isNaN(Number(GrossWeight))) {
        return res.status(400).json({ message: "GrossWeight must be a number" });
      }
      polishProcess.GrossWeight = Number(GrossWeight);
    }
    
    if (WtinKg !== undefined) {
      if (isNaN(Number(WtinKg))) {
        return res.status(400).json({ message: "WtinKg must be a number" });
      }
      polishProcess.WtinKg = Number(WtinKg);
    }
    
    // Validate date fields
    const dateFields = { polishDate, receivedDate, startTime, endTime };
    for (const [fieldName, value] of Object.entries(dateFields)) {
      if (value) {
        try {
          const parsedDate = new Date(value);
          if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: `${fieldName} must be a valid date` });
          }
          polishProcess[fieldName] = parsedDate;
        } catch (err) {
          return res.status(400).json({ message: `${fieldName} must be a valid date` });
        }
      }
    }
    
    polishProcess.updatedAt = new Date();
    
    // Update the order with validated data
    order.polishProcess = polishProcess;
    await order.save();
    
    res.json({
      message: "✅ Polish process updated",
      polishProcess: order.polishProcess,
    });
  } catch (err) {
    res.status(400).json({ 
      message: "Error updating polish process", 
      error: err.message 
    });
  }
});

// Update turning process
router.put("/orders/turning-process/:token", async (req, res) => {
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

    // Validate numeric fields
    const turningProcess = {};
    
    // Add validation for numeric fields
    const numericFields = { totalSheets, GrossWeight, WtinKg };
    for (const [fieldName, value] of Object.entries(numericFields)) {
      if (value !== undefined) {
        if (isNaN(Number(value))) {
          return res.status(400).json({ message: `${fieldName} must be a number` });
        }
        turningProcess[fieldName] = Number(value);
      }
    }
    
    // FinishThickness can be a string measurement like '1.8mm'
    if (FinishThickness !== undefined) {
      turningProcess.FinishThickness = FinishThickness;
    }
    
    // Validate date fields
    const dateFields = { turningDate, receivedDate, startTime, endTime };
    for (const [fieldName, value] of Object.entries(dateFields)) {
      if (value) {
        try {
          const parsedDate = new Date(value);
          if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: `${fieldName} must be a valid date` });
          }
          turningProcess[fieldName] = parsedDate;
        } catch (err) {
          return res.status(400).json({ message: `${fieldName} must be a valid date` });
        }
      }
    }
    
    turningProcess.updatedAt = new Date();
    
    // Update the order with validated data
    order.turningProcess = turningProcess;
    await order.save();
    
    res.json({
      message: "✅ Turning process updated",
      turningProcess: order.turningProcess,
    });
  } catch (err) {
    res.status(400).json({ 
      message: "Error updating turning process", 
      error: err.message 
    });
  }
});

/* ------------------------- ORDER VIEW ------------------------- */

// Get order by token (staff only, but admin has a similar route in admin.js)
router.get("/orders/:token", async (req, res) => {
  try {
    const order = await Order.findOne({ token: req.params.token });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching order", error: err.message });
  }
});

module.exports = router;
