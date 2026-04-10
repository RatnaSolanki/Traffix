const mongoose = require("mongoose");

const trafficSnapshotSchema = new mongoose.Schema(
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
    vehicleCount: { type: Number, required: true },
    densityScore: { type: Number, required: true },
    congestionLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrafficSnapshot", trafficSnapshotSchema);