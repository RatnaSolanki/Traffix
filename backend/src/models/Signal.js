const mongoose = require("mongoose");

const signalSchema = new mongoose.Schema(
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
    phase: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: "red",
    },
    greenDuration: { type: Number, default: 30 },
    redDuration: { type: Number, default: 60 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Signal", signalSchema);