const express = require("express");
const router = express.Router();
const Junction = require("../models/Junction");
const Signal = require("../models/Signal");
const TrafficSnapshot = require("../models/TrafficSnapshot");

// GET /api/junctions - sabhi junctions with signals
router.get("/", async (req, res) => {
  try {
    const junctions = await Junction.find({ isActive: true });

    const result = await Promise.all(
      junctions.map(async (j) => {
        const signals = await Signal.find({ junction: j._id });

        const latestSnapshots = await TrafficSnapshot.find({ junction: j._id })
          .sort({ createdAt: -1 })
          .limit(4);

        return {
          ...j.toObject(),
          signals,
          latestSnapshots,
        };
      })
    );

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/junctions/:id - single junction
router.get("/:id", async (req, res) => {
  try {
    const junction = await Junction.findById(req.params.id);
    if (!junction) {
      return res.status(404).json({ success: false, error: "Junction not found" });
    }

    const signals = await Signal.find({ junction: junction._id });

    const snapshots = await TrafficSnapshot.find({ junction: junction._id })
      .sort({ createdAt: -1 })
      .limit(40);

    res.json({ success: true, data: { ...junction.toObject(), signals, snapshots } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/junctions/:id/override - manual signal override
router.post("/:id/override", async (req, res) => {
  try {
    const { direction, greenDuration, reason } = req.body;

    if (!direction || !greenDuration) {
      return res.status(400).json({ success: false, error: "direction aur greenDuration required hai" });
    }

    const green = parseInt(greenDuration);
    if (green < 10 || green > 120) {
      return res.status(400).json({ success: false, error: "greenDuration 10-120 seconds hona chahiye" });
    }

    await Signal.findOneAndUpdate(
      { junction: req.params.id, direction },
      { greenDuration: green, redDuration: 120 - green, phase: "green" }
    );

    res.json({ success: true, message: `Override applied: ${direction} → ${green}s green` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;