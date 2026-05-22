import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const directionConfig = {
  N: { icon: ArrowUp, label: 'North' },
  S: { icon: ArrowDown, label: 'South' },
  E: { icon: ArrowRight, label: 'East' },
  W: { icon: ArrowLeft, label: 'West' },
};

const stateColors = {
  green: 'bg-emerald-500 shadow-emerald-500/50',
  yellow: 'bg-yellow-500 shadow-yellow-500/50',
  red: 'bg-red-500 shadow-red-500/50',
};

export default function SignalStatusCard({ signals }) {
  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-white mb-4">Signal Status</h4>
      <div className="space-y-3">
        {Object.entries(signals).map(([dir, data]) => {
          const config = directionConfig[dir];
          const Icon = config.icon;
          return (
            <div
              key={dir}
              className="flex items-center justify-between p-3 bg-traffix-bg rounded-lg border border-traffix-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-traffix-card border border-traffix-border flex items-center justify-center">
                  <Icon className="w-4 h-4 text-traffix-muted" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{config.label}</p>
                  <p className="text-xs text-traffix-muted">{data.vehicles} vehicles</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-traffix-muted">{data.timer}s</span>
                <div
                  className={`w-4 h-4 rounded-full shadow-lg ${stateColors[data.state]}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

