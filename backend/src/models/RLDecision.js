const mongoose = require("mongoose");

/**
 * RLDecision — stores every AI signal timing decision.
 * Used by the Q-Learning feedback loop to compute rewards
 * and by the frontend analytics dashboard.
 */
const rlDecisionSchema = new mongoose.Schema(
  {
    junction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Junction",
      required: true,
    },

    // Signal timing plan for this cycle (one entry per direction)
    phase_plan: [
      {
        direction:    { type: String, enum: ["north", "south", "east", "west"] },
        websterGreen: { type: Number },   // Webster's theoretical optimum
        qAdjustment:  { type: Number },   // Q-Learning correction (-10 to +10)
        finalGreen:   { type: Number },   // Actual applied green time
        priority:     { type: Number },   // Heuristic priority score [0–1]
        vehicleCount: { type: Number },
        waitTime:     { type: Number },   // Estimated wait time (seconds)
      },
    ],

    // Cycle-level stats
    cycleLength:   { type: Number, required: true },
    totalVehicles: { type: Number, default: 0 },
    avgDelaySaved: { type: Number, default: 0 },   // seconds saved vs fixed timer

    // Q-Learning metadata
    reward:    { type: Number, default: 0 },        // reward signal for this cycle
    epsilon:   { type: Number, default: 0.3 },      // exploration rate at time of decision
    algorithm: { type: String, default: "Webster+QLearning-v2" },
  },
  { timestamps: true }
);

// Index for fast junction queries
rlDecisionSchema.index({ junction: 1, createdAt: -1 });

module.exports = mongoose.model("RLDecision", rlDecisionSchema);