const mongoose = require("mongoose");

const rlDecisionSchema = new mongoose.Schema(
  {
    junction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Junction",
      required: true,
    },
    direction: {
      type: String,
      enum: ["north", "south", "east", "west"],
      required: true,
    },
    oldGreen: { type: Number, required: true },
    newGreen: { type: Number, required: true },
    vehicleCount: { type: Number, required: true },
    reward: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RLDecision", rlDecisionSchema);