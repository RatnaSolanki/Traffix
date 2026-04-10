const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const junctionsRouter = require("./routes/junctions");
const analyticsRouter = require("./routes/analytics");
const alertsRouter = require("./routes/alerts");
const { startSimulator } = require("./simulation/simulator");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/junctions", junctionsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/alerts", alertsRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    project: "Traffix",
    message: "AI-powered Traffic Management System",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Traffix running on http://localhost:3000`);
    });
    startSimulator();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });