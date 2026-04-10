const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    junction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Junction",
      required: true,
    },
    alertType: {
      type: String,
      default: "congestion",
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      required: true,
    },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Alert", alertSchema);