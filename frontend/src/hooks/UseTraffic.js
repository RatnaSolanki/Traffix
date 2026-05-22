/**
 * useTraffic.js — live WebSocket hook with mock-data fallback
 * Place at: frontend/src/hooks/useTraffic.js
 *
 * Outputs data in the EXACT same shape as mockData.js so
 * Overview.jsx and Simulation.jsx need minimal changes.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import {
  junctionsData as mockJunctions,
  chartData as mockChart,
  overviewMetrics as mockMetrics,
  simulationData as mockSimulation,
  alertsData as mockAlerts,
} from "../data/mockData";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ─── shape transformers ───────────────────────────────────────────────────────

function congestionFromSaturation(pct) {
  if (pct >= 90) return "critical";
  if (pct >= 75) return "high";
  if (pct >= 50) return "medium";
  return "low";
}

function toJunctionShape(j, idx) {
  const signals = j.signals || [];
  const directions = {};
  signals.forEach((s) => {
    const key = s.direction[0].toUpperCase();
    directions[key] = s.vehicleCount || 0;
  });
  const summary = j.summary || {};
  const satPct = summary.saturationPct || 0;
  return {
    id: j.junction?.id || idx + 1,
    name: j.junction?.name || `Junction ${idx + 1}`,
    severity: congestionFromSaturation(satPct),
    avgVehicles: summary.totalVehicles || 0,
    directions,
    signalDuration: signals[0]?.aiStats?.aiGreenTime || mockJunctions[idx]?.signalDuration || 30,
    coordinates: {
      x: j.junction?.x_pos ? Math.round((j.junction.x_pos / 680) * 100) : (mockJunctions[idx]?.coordinates?.x || 50),
      y: j.junction?.y_pos ? Math.round((j.junction.y_pos / 460) * 100) : (mockJunctions[idx]?.coordinates?.y || 50),
    },
    summary,
    rawSignals: signals,
  };
}

function toSimulationShape(rawJunctions) {
  if (!rawJunctions.length) return mockSimulation;
  const junctionList = rawJunctions.map((j) => ({
    id: j.junction?.id || j.junction?._id,
    name: j.junction?.name || "Junction",
    _mongoId: j.junction?.id,
  }));
  const first = rawJunctions[0];
  const signalData = {};
  const signalStates = {};
  (first?.signals || []).forEach((s) => {
    const dir = s.direction[0].toUpperCase();
    signalStates[dir] = s.phase || "red";
    signalData[dir] = {
      state: s.phase || "red",
      timer: s.aiStats?.aiGreenTime || 30,
      vehicles: s.vehicleCount || 0,
      aiGreenTime: s.aiStats?.aiGreenTime || 30,
      fixedWaitTime: s.aiStats?.fixedWaitTime || 45,
      aiWaitTime: s.aiStats?.aiWaitTime || 30,
      improvementPct: s.aiStats?.improvementPct || 0,
      priority: s.aiStats?.priority || 0,
      reason: s.aiStats?.reason || "",
      congestionLevel: s.congestionLevel || "low",
      websterGreenTime: s.aiStats?.websterGreenTime || 30,
      qAdjustment: s.aiStats?.qAdjustment || 0,
    };
  });
  return {
    junctions: junctionList,
    signals: signalData,
    signalStates,
    congestionLevel: first?.summary?.saturationStatus || "low",
    totalVehicles: first?.summary?.totalVehicles || 0,
    summary: first?.summary || {},
  };
}

function toMetricsShape(systemStats, rawJunctions) {
  if (!systemStats) return mockMetrics;
  return [
    { label: "Total Junctions",          value: rawJunctions.length,                                                    change: "+0",                              icon: "GitBranch"   },
    { label: "Avg Vehicles/Lane",         value: String(Math.round(systemStats.totalVehicles / Math.max(rawJunctions.length, 1))), change: "+live",                  icon: "Car"         },
    { label: "Active Alerts",             value: rawJunctions.filter((j) => ["critical","high"].includes(j.summary?.saturationStatus)).length, change: "live",        icon: "AlertTriangle"},
    { label: "Optimizer Decisions Today", value: Math.round(systemStats.totalVehicles * 0.12),                           change: "+live",                            icon: "Cpu"         },
    { label: "Wait Time Saved",           value: `${Math.round(systemStats.avgImprovement || 0)}%`,                      change: `+${systemStats.avgImprovement||0}%`, icon: "Clock"      },
  ];
}

const chartHistoryRef = { current: [...mockChart] };

function buildChartPoint(rawJunctions) {
  const now = new Date();
  const label = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const point = { time: label };
  const keys = ["MP_Nagar","Habibganj","Roshanpura","Arera"];
  rawJunctions.slice(0, 4).forEach((j, i) => {
    point[keys[i]] = j.summary?.totalVehicles || 0;
  });
  return point;
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function useTraffic() {
  const socketRef = useRef(null);
  const [connected,       setConnected]       = useState(false);
  const [junctionsData,   setJunctionsData]   = useState(mockJunctions);
  const [simulationData,  setSimulationData]  = useState(mockSimulation);
  const [overviewMetrics, setOverviewMetrics] = useState(mockMetrics);
  const [chartData,       setChartData]       = useState(mockChart);
  const [alertsData,      setAlertsData]      = useState(mockAlerts);
  const [systemStats,     setSystemStats]     = useState(null);
  const [tick,            setTick]            = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket","polling"] });
    socketRef.current = socket;
    socket.on("connect",    () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("traffic:update", (data) => {
      const raw = data.junctions || [];
      if (!raw.length) return;

      const liveJunctions = raw.map(toJunctionShape);
      const liveSim       = toSimulationShape(raw);
      const liveMetrics   = toMetricsShape(data.systemStats, raw);
      const newPoint      = buildChartPoint(raw);
      const history       = [...chartHistoryRef.current.slice(-11), newPoint];
      chartHistoryRef.current = history;

      const liveAlerts = liveJunctions
        .filter((j) => j.severity === "critical" || j.severity === "high")
        .map((j, i) => ({
          id: i + 1,
          severity: j.severity,
          junction: j.name,
          message: j.severity === "critical"
            ? `Critical congestion — ${j.avgVehicles} vehicles queued`
            : `High vehicle count — AI signal optimisation active`,
          time: "just now",
          status: "active",
        }));

      setJunctionsData(liveJunctions);
      setSimulationData(liveSim);
      setOverviewMetrics(liveMetrics);
      setChartData(history);
      setSystemStats(data.systemStats || null);
      setTick(data.tick);
      if (liveAlerts.length) setAlertsData(liveAlerts);
    });

    return () => socket.disconnect();
  }, []);

  const triggerEmergency = useCallback((junctionId, direction) => {
    socketRef.current?.emit("control:emergency", { junctionId, direction });
  }, []);

  const triggerIncident = useCallback((junctionId) => {
    socketRef.current?.emit("control:incident", { junctionId });
  }, []);

  const setTimeOverride = useCallback((hour) => {
    socketRef.current?.emit("control:setTime", hour);
  }, []);

  return {
    connected,
    junctionsData,
    simulationData,
    overviewMetrics,
    chartData,
    alertsData,
    systemStats,
    tick,
    triggerEmergency,
    triggerIncident,
    setTimeOverride,
  };
}