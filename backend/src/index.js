const express  = require("express");
const http     = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors     = require("cors");
const path     = require("path");
require("dotenv").config();

const junctionsRouter  = require("./routes/junctions");
const analyticsRouter  = require("./routes/analytics");
const alertsRouter     = require("./routes/alerts");
const simulationRouter = require("./routes/simulation");
const { startSimulator } = require("./simulation/simulator");

const app    = express();
const server = http.createServer(app);         // wrap Express in http.Server

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ── REST Routes ───────────────────────────────────────────────────────────────
app.use("/api/junctions",   junctionsRouter);
app.use("/api/analytics",   analyticsRouter);
app.use("/api/alerts",      alertsRouter);
app.use("/api/simulation",  simulationRouter);

app.get("/api/health", (req, res) => {
  res.json({
    status:   "ok",
    project:  "Traffix",
    message:  "AI-powered Traffic Management System",
    algorithm: "Webster's Formula + Q-Learning (ε-greedy)",
  });
});

// ── MongoDB + Server start ────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // IMPORTANT: pass `io` to simulator so it can emit live updates
    startSimulator(io);

    // Use server.listen (not app.listen) — needed for WebSocket support
    server.listen(process.env.PORT || 3000, () => {
      console.log(`🚦 Traffix running on http://localhost:${process.env.PORT || 3000}`);
      console.log(`   WebSocket ready for frontend connections`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });