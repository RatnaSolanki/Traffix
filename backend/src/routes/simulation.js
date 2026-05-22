const express = require("express");
const router = express.Router();
const Junction = require("../models/Junction");
const Signal = require("../models/Signal");
const TrafficSnapshot = require("../models/TrafficSnapshot");
const RLDecision = require("../models/RLDecision");

// Wait time estimate karna (same formula jo simulator mein hai)
function estimateWait(vehicles, greenTime) {
  const capacity = Math.floor(greenTime / 2.5);
  const overflow = Math.max(0, vehicles - capacity);
  return overflow * 2.5 + greenTime / 2;
}

// GET /api/simulation/:junctionId
router.get("/:junctionId", async (req, res) => {
  try {
    const junction = await Junction.findById(req.params.junctionId);
    if (!junction) {
      return res.status(404).json({ success: false, error: "Junction not found" });
    }

    // Signals fetch karo
    const signals = await Signal.find({ junction: junction._id });

    // Har direction ka latest snapshot
    const signalData = await Promise.all(
      signals.map(async (sig) => {
        const latest = await TrafficSnapshot.findOne({
          junction: junction._id,
          direction: sig.direction,
        }).sort({ createdAt: -1 });

        const vehicleCount = latest?.vehicleCount || 0;
        const densityScore = latest?.densityScore || 0;
        const congestionLevel = latest?.congestionLevel || "low";

        // AI mode wait time
        const aiGreenTime = Math.min(90, Math.max(15, Math.round(vehicleCount * 1.4)));
        const aiWait = estimateWait(vehicleCount, aiGreenTime);

        // Fixed mode wait time (hamesha 30s green)
        const fixedWait = estimateWait(vehicleCount, 30);

        // Improvement %
        const improvement = fixedWait > 0
          ? (((fixedWait - aiWait) / fixedWait) * 100).toFixed(1)
          : 0;

        return {
          direction:       sig.direction,
          phase:           sig.phase,
          greenDuration:   sig.greenDuration,
          redDuration:     sig.redDuration,
          vehicleCount,
          densityScore,
          congestionLevel,
          aiStats: {
            aiGreenTime,
            aiWaitTime:      parseFloat(aiWait.toFixed(1)),
            fixedWaitTime:   parseFloat(fixedWait.toFixed(1)),
            improvementPct:  parseFloat(improvement),
            waitSaved:       parseFloat((fixedWait - aiWait).toFixed(1)),
          },
        };
      })
    );

    // Overall junction stats
    const totalVehicles = signalData.reduce((a, b) => a + b.vehicleCount, 0);
    const avgAiWait = (
      signalData.reduce((a, b) => a + b.aiStats.aiWaitTime, 0) / signalData.length
    ).toFixed(1);
    const avgFixedWait = (
      signalData.reduce((a, b) => a + b.aiStats.fixedWaitTime, 0) / signalData.length
    ).toFixed(1);
    const avgImprovement = (
      signalData.reduce((a, b) => a + b.aiStats.improvementPct, 0) / signalData.length
    ).toFixed(1);

    // Recent decisions
    const recentDecisions = await RLDecision.find({ junction: junction._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        junction: {
          id:   junction._id,
          name: junction.name,
          city: junction.city,
        },
        signals: signalData,
        summary: {
          totalVehicles,
          avgAiWait:       parseFloat(avgAiWait),
          avgFixedWait:    parseFloat(avgFixedWait),
          avgImprovement:  parseFloat(avgImprovement),
          totalDecisions:  recentDecisions.length,
        },
        recentDecisions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/simulation — sabhi junctions ki list (dropdown ke liye)
router.get("/", async (req, res) => {
  try {
    const junctions = await Junction.find({ isActive: true }).select("name city");
    res.json({ success: true, data: junctions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;