const express = require("express");
const router = express.Router();
const TrafficSnapshot = require("../models/TrafficSnapshot");
const RLDecision = require("../models/RLDecision");
const Alert = require("../models/Alert");
const Junction = require("../models/Junction");

// GET /api/analytics/summary
router.get("/summary", async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

    const totalJunctions = await Junction.countDocuments({ isActive: true });
    const activeAlerts = await Alert.countDocuments({ isResolved: false });
    const totalDecisions = await RLDecision.countDocuments();

    const recentSnapshots = await TrafficSnapshot.find({
      createdAt: { $gte: fiveMinAgo },
    });

    const avgVehicles =
      recentSnapshots.length > 0
        ? (recentSnapshots.reduce((a, b) => a + b.vehicleCount, 0) / recentSnapshots.length).toFixed(1)
        : 0;

    const recentDecisions = await RLDecision.find({
      createdAt: { $gte: fiveMinAgo },
    });

    const avgReward =
      recentDecisions.length > 0
        ? (recentDecisions.reduce((a, b) => a + b.reward, 0) / recentDecisions.length).toFixed(2)
        : 0;

    const congestion = {
      low: recentSnapshots.filter((s) => s.congestionLevel === "low").length,
      medium: recentSnapshots.filter((s) => s.congestionLevel === "medium").length,
      high: recentSnapshots.filter((s) => s.congestionLevel === "high").length,
      critical: recentSnapshots.filter((s) => s.congestionLevel === "critical").length,
    };

    res.json({
      success: true,
      data: { totalJunctions, activeAlerts, totalDecisions, avgVehicles, avgReward, congestion },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/timeseries?minutes=10
router.get("/timeseries", async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes) || 10;
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const snapshots = await TrafficSnapshot.find({ createdAt: { $gte: since } })
      .populate("junction", "name")
      .sort({ createdAt: 1 });

    res.json({ success: true, data: snapshots });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/analytics/decisions
router.get("/decisions", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const decisions = await RLDecision.find()
      .populate("junction", "name")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ success: true, data: decisions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;