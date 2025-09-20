// This file contains the fix for the casting process validation issue

// Update casting process route with proper validation
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
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error updating casting process",
      error: err.message,
    });
  }
});