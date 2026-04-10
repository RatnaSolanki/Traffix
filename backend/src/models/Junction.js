const mongoose = require("mongoose");

const junctionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    city: {
      type: String,
      default: "Bhopal",
    },
    x_pos: { type: Number, required: true },
    y_pos: { type: Number, required: true },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Junction", junctionSchema);