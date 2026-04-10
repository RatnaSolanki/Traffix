const Junction = require("../models/Junction");
const Signal = require("../models/Signal");
const TrafficSnapshot = require("../models/TrafficSnapshot");
const RLDecision = require("../models/RLDecision");
const Alert = require("../models/Alert");

// ── helpers ──────────────────────────────────────────────────────────────────

function getHourFactor() {
  // DEMO MODE - realistic mix hamesha
  const factors = [0.95, 0.85, 0.75, 1.0, 0.65, 0.90];
  return factors[Math.floor(Math.random() * factors.length)];

  // Real time-based (production ke liye uncomment karo):
  // const hour = new Date().getHours();
  // if (hour >= 8  && hour <= 10) return 1.0;   // morning peak
  // if (hour >= 17 && hour <= 19) return 0.95;  // evening peak
  // if (hour >= 11 && hour <= 16) return 0.55;  // afternoon
  // if (hour >= 20 && hour <= 22) return 0.35;  // night
  // return 0.15;                                 // late night
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCongestionLevel(density) {
  if (density >= 0.85) return "critical";
  if (density >= 0.60) return "high";
  if (density >= 0.35) return "medium";
  return "low";
}

function estimateWait(vehicles, greenTime) {
  const capacity = Math.floor(greenTime / 2.5);
  const overflow = Math.max(0, vehicles - capacity);
  return overflow * 2.5 + greenTime / 2;
}

// ── optimizer ─────────────────────────────────────────────────────────────────

async function optimizeSignal(junctionId, direction, vehicleCount, currentGreen) {
  const newGreen = Math.min(90, Math.max(15, Math.round(vehicleCount * 1.4)));

  const waitBefore = estimateWait(vehicleCount, currentGreen);
  const waitAfter  = estimateWait(vehicleCount, newGreen);
  const reward     = parseFloat((waitBefore - waitAfter).toFixed(2));

  if (newGreen !== currentGreen) {
    await Signal.findOneAndUpdate(
      { junction: junctionId, direction },
      { greenDuration: newGreen, redDuration: 120 - newGreen }
    );

    await RLDecision.create({
      junction:     junctionId,
      direction,
      oldGreen:     currentGreen,
      newGreen,
      vehicleCount,
      reward,
    });
  }

  return { newGreen, reward };
}

// ── alert generator ───────────────────────────────────────────────────────────

async function maybeRaiseAlert(junctionId, direction, density, vehicleCount) {
  if (density < 0.85) return;

  const existing = await Alert.findOne({
    junction:   junctionId,
    isResolved: false,
    severity:   "critical",
  });

  if (!existing) {
    await Alert.create({
      junction:  junctionId,
      alertType: "congestion",
      severity:  "critical",
      message:   `Critical congestion on ${direction} lane — ${vehicleCount} vehicles detected`,
    });
    console.log(`🚨 Alert raised: ${direction} lane critical`);
  }
}

// ── phase cycler ──────────────────────────────────────────────────────────────

async function phaseCyclerTick() {
  try {
    const signals = await Signal.find();

    for (const sig of signals) {
      let nextPhase;
      if (sig.phase === "green")       nextPhase = "yellow";
      else if (sig.phase === "yellow") nextPhase = "red";
      else                             nextPhase = "green";

      await Signal.findByIdAndUpdate(sig._id, { phase: nextPhase });
    }
  } catch (err) {
    console.error("Phase cycler error:", err.message);
  }
}

// ── main tick ─────────────────────────────────────────────────────────────────

async function simulationTick() {
  try {
    const factor      = getHourFactor();
    const junctions   = await Junction.find({ isActive: true });
    const dirVariance = { north: 1.0, south: 0.85, east: 0.75, west: 0.65 };
    const maxVehicles = 70;

    for (const junction of junctions) {
      const signals = await Signal.find({ junction: junction._id });

      for (const signal of signals) {
        const multiplier   = dirVariance[signal.direction] || 1.0;
        const vehicleCount = Math.min(
          maxVehicles,
          Math.round(randomBetween(10, maxVehicles) * factor * multiplier)
        );
        const densityScore    = parseFloat((vehicleCount / maxVehicles).toFixed(3));
        const congestionLevel = getCongestionLevel(densityScore);

        // Snapshot save karo
        await TrafficSnapshot.create({
          junction:      junction._id,
          direction:     signal.direction,
          vehicleCount,
          densityScore,
          congestionLevel,
        });

        // Optimize signal
        await optimizeSignal(
          junction._id,
          signal.direction,
          vehicleCount,
          signal.greenDuration
        );

        // Alert check
        await maybeRaiseAlert(
          junction._id,
          signal.direction,
          densityScore,
          vehicleCount
        );
      }
    }

    console.log(`✅ Tick complete — factor: ${factor.toFixed(2)}`);
  } catch (err) {
    console.error("Simulator tick error:", err.message);
  }
}

// ── start ─────────────────────────────────────────────────────────────────────

function startSimulator() {
  console.log("🚗 Simulator started — generating traffic data every 5s");

  // Turant ek baar chalao
  simulationTick();

  // Phir har 5 seconds
  setInterval(simulationTick, 5000);

  // Phase cycling har 8 seconds
  setInterval(phaseCyclerTick, 8000);
}

module.exports = { startSimulator };