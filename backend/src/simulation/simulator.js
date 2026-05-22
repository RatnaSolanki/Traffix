/**
 * Traffix — AI Simulation Engine
 * SIH25050: Smart Traffic Management System
 */

const mongoose        = require("mongoose");
const Junction        = require("../models/Junction");
const Signal          = require("../models/Signal");
const TrafficSnapshot = require("../models/TrafficSnapshot");
const RLDecision      = require("../models/RLDecision");

// ── Updated, valid fallback data (ObjectId hex)
const FALLBACK_JUNCTIONS = [
  { _id: "6611abde6b9887ca83802401", name: "MP Nagar Square",     city: "Bhopal", x_pos: 180, y_pos: 140, isActive: true },
  { _id: "6611abde6b9887ca83802402", name: "Habibganj Crossing",  city: "Bhopal", x_pos: 380, y_pos: 140, isActive: true },
  { _id: "6611abde6b9887ca83802403", name: "Roshanpura Junction", city: "Bhopal", x_pos: 180, y_pos: 310, isActive: true },
  { _id: "6611abde6b9887ca83802404", name: "Arera Colony Gate",   city: "Bhopal", x_pos: 380, y_pos: 310, isActive: true },
  { _id: "6611abde6b9887ca83802405", name: "Bittan Market",       city: "Bhopal", x_pos: 530, y_pos: 225, isActive: true },
];

const FALLBACK_SIGNALS = {
  "6611abde6b9887ca83802401": [
    { direction: "north", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "south", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "east",  phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "west",  phase: "red",   greenDuration: 30, redDuration: 60 },
  ],
  "6611abde6b9887ca83802402": [
    { direction: "north", phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "south", phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "east",  phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "west",  phase: "green", greenDuration: 30, redDuration: 60 },
  ],
  "6611abde6b9887ca83802403": [
    { direction: "north", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "south", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "east",  phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "west",  phase: "red",   greenDuration: 30, redDuration: 60 },
  ],
  "6611abde6b9887ca83802404": [
    { direction: "north", phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "south", phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "east",  phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "west",  phase: "green", greenDuration: 30, redDuration: 60 },
  ],
  "6611abde6b9887ca83802405": [
    { direction: "north", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "south", phase: "green", greenDuration: 30, redDuration: 60 },
    { direction: "east",  phase: "red",   greenDuration: 30, redDuration: 60 },
    { direction: "west",  phase: "red",   greenDuration: 30, redDuration: 60 },
  ],
};

// Constants
const TICK_MS         = 2000;
const SNAPSHOT_EVERY  = 3;
const DECISION_EVERY  = 10;
const CYCLE_MAX       = 120;
const CYCLE_MIN       = 60;
const GREEN_MAX       = 90;
const GREEN_MIN       = 10;
const FIXED_GREEN     = 30;
const SATURATION_FLOW = 1800;
const LOST_TIME       = 4;
const ALPHA           = 0.15;
const GAMMA           = 0.90;
const EPSILON_START   = 0.3;
const EPSILON_MIN     = 0.05;
const EPSILON_DECAY   = 0.995;

// Module state
let io         = null;
let tickCount  = 0;
const junctionState = {};
const qTable    = {};
const epsilons  = {};

// ...All your other functions such as getTimeProfile, generateVehicleCount, Q-learning, etc...

// Replace this with your full body from above as needed.

const ACTIONS = [-10, -5, 0, +5, +10];

function getTimeBand(hour) {
  if (hour >= 8  && hour <= 10) return "peak_morning";
  if (hour >= 17 && hour <= 20) return "peak_evening";
  if (hour >= 23 || hour <= 5)  return "off_peak";
  return "normal";
}

function getStateKey(congestionLevel, direction) {
  const hour = new Date().getHours();
  return `${congestionLevel}|${getTimeBand(hour)}|${direction}`;
}

function initQTable(junctionId) {
  if (!qTable[junctionId]) {
    qTable[junctionId]  = {};
    epsilons[junctionId] = EPSILON_START;
  }
}

function getQValues(junctionId, stateKey) {
  if (!qTable[junctionId][stateKey]) {
    qTable[junctionId][stateKey] = ACTIONS.map((_, i) => i === 2 ? 0.1 : 0.0);
  }
  return qTable[junctionId][stateKey];
}

function selectAction(junctionId, stateKey) {
  const epsilon = epsilons[junctionId] || EPSILON_START;
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * ACTIONS.length);
  }
  const qValues = getQValues(junctionId, stateKey);
  return qValues.indexOf(Math.max(...qValues));
}

function updateQTable(junctionId, stateKey, actionIndex, reward, nextStateKey) {
  const qValues     = getQValues(junctionId, stateKey);
  const nextQValues = getQValues(junctionId, nextStateKey);
  const maxNextQ    = Math.max(...nextQValues);

  qValues[actionIndex] = qValues[actionIndex]
    + ALPHA * (reward + GAMMA * maxNextQ - qValues[actionIndex]);

  epsilons[junctionId] = Math.max(
    EPSILON_MIN,
    (epsilons[junctionId] || EPSILON_START) * EPSILON_DECAY
  );
}

// (Other compute functions: computeCongestionLevel, computeJunctionState, etc...)

async function tick() {
  tickCount++;

  try {
    let junctions = [];
    try {
      junctions = await Junction.find({ isActive: true }).lean();
    } catch (dbErr) {
      junctions = FALLBACK_JUNCTIONS;
    }
    if (!junctions.length) junctions = FALLBACK_JUNCTIONS;
    
    const allJunctionStates = [];

    for (const junction of junctions) {
      const junctionId = junction._id.toString();

      if (!junctionState[junctionId]) {
        junctionState[junctionId] = {
          lastAvgWait:       null,
          emergencyActive:   false,
          emergencyDirection: null,
          incidentActive:    false,
        };
      }
      initQTable(junctionId);

      const jState  = junctionState[junctionId];
      let signals = [];
      try {
        signals = await Signal.find({ junction: junction._id }).lean();
      } catch (e) {}
      if (!signals.length) {
        signals = (FALLBACK_SIGNALS[junctionId] || []).map(sig => ({
          junction: junction._id,
          ...sig,
        }));
      }

      if (!signals.length) continue;

      // --- YOU MUST PROVIDE THE IMPLEMENTATIONS BELOW ---
      const snapshots = signals.map(sig => {
        const count = /* your generateVehicleCount */ 15; // Replace with your logic
        return {
          junction:        junction._id,
          direction:       sig.direction,
          vehicleCount:    count,
          densityScore:    /* computeDensityScore */ 20,  // Replace with your logic
          congestionLevel: /* computeCongestionLevel */ "medium", // Replace with your logic
        };
      });

      // ...rest of tick logic (TrafficSnapshot.insertMany, computeJunctionState, etc)...
    }

    // --- Emit block unchanged ---
    if (io && allJunctionStates.length) {
      io.emit("traffic:update", {
        tick:         tickCount,
        timestamp:    new Date().toISOString(),
        junctions:    allJunctionStates,
        systemStats:  {}, // or your computeSystemStats function output
      });
    }

  } catch (err) {
    console.error("[Traffix] Tick error:", err.message);
  }
}

// --- Socket handlers ---
function registerSocketHandlers(socket) {
  socket.on("control:emergency", ({ junctionId, direction }) => {
    if (junctionState[junctionId]) {
      junctionState[junctionId].emergencyActive    = true;
      junctionState[junctionId].emergencyDirection = direction;
      setTimeout(() => {
        if (junctionState[junctionId]) {
          junctionState[junctionId].emergencyActive    = false;
          junctionState[junctionId].emergencyDirection = null;
        }
      }, 15000);
      socket.emit("control:ack", { type: "emergency", junctionId, direction });
    }
  });

  socket.on("control:incident", ({ junctionId }) => {
    if (junctionState[junctionId]) {
      junctionState[junctionId].incidentActive = true;
      setTimeout(() => {
        if (junctionState[junctionId]) junctionState[junctionId].incidentActive = false;
      }, 20000);
      socket.emit("control:ack", { type: "incident", junctionId });
    }
  });

  socket.on("control:setTime", (hour) => {
    process.env.TRAFFIX_HOUR_OVERRIDE = String(Math.max(0, Math.min(23, hour)));
    socket.emit("control:ack", { type: "setTime", hour });
  });

  socket.on("disconnect", () => {
    console.log(`[Traffix] Client disconnected: ${socket.id}`);
  });
}

// --- MODULE EXPORTS ---
function startSimulator(socketIoInstance) {
  io = socketIoInstance;
  if (io) {
    io.on("connection", (socket) => {
      console.log(`[Traffix] Client connected: ${socket.id}`);
      registerSocketHandlers(socket);
    });
  }
  setInterval(tick, TICK_MS);
  console.log(`[Traffix] Simulator started — ticking every ${TICK_MS}ms`);
  console.log(`[Traffix] Algorithm: Webster's Formula + Q-Learning (ε-greedy)`);
  tick();
}

function getJunctionState(junctionId) { return junctionState[junctionId] || null; }
function getQTableSnapshot() { return qTable; }

module.exports = { startSimulator, getJunctionState, getQTableSnapshot };