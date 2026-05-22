import { useState, useEffect } from 'react';

const signalColors = {
  green: 'bg-emerald-500 shadow-emerald-500/50',
  yellow: 'bg-yellow-500 shadow-yellow-500/50',
  red: 'bg-red-500 shadow-red-500/50',
};

const vehicleColors = [
  'bg-blue-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-sky-500',
  'bg-teal-500',
];

export default function SimulationIntersection({ isPaused, onReset }) {
  const [signals, setSignals] = useState({
    N: 'red',
    S: 'red',
    E: 'green',
    W: 'green',
  });

  const [vehicles, setVehicles] = useState({
    N: [0, 1, 2],
    S: [0, 1],
    E: [0, 1, 2, 3],
    W: [0, 1, 2],
  });

  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCycle((prev) => {
        const next = (prev + 1) % 4;
        if (next === 0) {
          setSignals({ N: 'red', S: 'red', E: 'green', W: 'green' });
        } else if (next === 1) {
          setSignals({ N: 'red', S: 'red', E: 'yellow', W: 'yellow' });
        } else if (next === 2) {
          setSignals({ N: 'green', S: 'green', E: 'red', W: 'red' });
        } else {
          setSignals({ N: 'yellow', S: 'yellow', E: 'red', W: 'red' });
        }

        // Randomly update vehicles
        setVehicles((prev) => ({
          N: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => i),
          S: Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => i),
          E: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => i),
          W: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => i),
        }));

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    if (onReset) {
      setCycle(0);
      setSignals({ N: 'red', S: 'red', E: 'green', W: 'green' });
      setVehicles({
        N: [0, 1, 2],
        S: [0, 1],
        E: [0, 1, 2, 3],
        W: [0, 1, 2],
      });
    }
  }, [onReset]);

  return (
    <div className="relative w-full max-w-xl mx-auto aspect-square">
      {/* Roads */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Horizontal Road */}
        <div className="absolute w-full h-32 bg-traffix-card border-y border-traffix-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 border-t-2 border-dashed border-traffix-border/50" />
          </div>
        </div>
        {/* Vertical Road */}
        <div className="absolute h-full w-32 bg-traffix-card border-x border-traffix-border">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-full w-0.5 border-l-2 border-dashed border-traffix-border/50" />
          </div>
        </div>
      </div>

      {/* Intersection Center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-traffix-bg border border-traffix-border rounded-lg flex items-center justify-center z-10">
        <span className="text-xs font-bold text-traffix-muted">INTERSECTION</span>
      </div>

      {/* Traffic Lights */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col gap-1 z-20">
        <div className={`w-4 h-4 rounded-full ${signalColors[signals.N]} shadow-lg`} />
        <span className="text-[10px] text-traffix-muted text-center">N</span>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col gap-1 z-20">
        <span className="text-[10px] text-traffix-muted text-center">S</span>
        <div className={`w-4 h-4 rounded-full ${signalColors[signals.S]} shadow-lg`} />
      </div>
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
        <div className={`w-4 h-4 rounded-full ${signalColors[signals.W]} shadow-lg`} />
        <span className="text-[10px] text-traffix-muted">W</span>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
        <span className="text-[10px] text-traffix-muted">E</span>
        <div className={`w-4 h-4 rounded-full ${signalColors[signals.E]} shadow-lg`} />
      </div>

      {/* Vehicles - North */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-1 p-2">
        {vehicles.N.map((_, i) => (
          <div
            key={`N-${i}`}
            className={`w-6 h-10 rounded ${vehicleColors[i % vehicleColors.length]} opacity-90`}
          />
        ))}
      </div>

      {/* Vehicles - South */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col gap-1 p-2">
        {vehicles.S.map((_, i) => (
          <div
            key={`S-${i}`}
            className={`w-6 h-10 rounded ${vehicleColors[i % vehicleColors.length]} opacity-90`}
          />
        ))}
      </div>

      {/* Vehicles - West */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-row-reverse gap-1 p-2">
        {vehicles.W.map((_, i) => (
          <div
            key={`W-${i}`}
            className={`w-10 h-6 rounded ${vehicleColors[i % vehicleColors.length]} opacity-90`}
          />
        ))}
      </div>

      {/* Vehicles - East */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-row gap-1 p-2">
        {vehicles.E.map((_, i) => (
          <div
            key={`E-${i}`}
            className={`w-10 h-6 rounded ${vehicleColors[i % vehicleColors.length]} opacity-90`}
          />
        ))}
      </div>
    </div>
  );
}

