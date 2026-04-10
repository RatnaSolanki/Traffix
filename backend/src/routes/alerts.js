const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// GET /api/alerts
router.get("/", async (req, res) => {
  try {
    const resolved = req.query.resolved === "true";
    const alerts = await Alert.find({ isResolved: resolved })
      .populate("junction", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/alerts/:id/resolve
router.patch("/:id/resolve", async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { isResolved: true });
    res.json({ success: true, message: "Alert resolved" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;