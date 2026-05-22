import SeverityBadge from './SeverityBadge';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export default function JunctionCard({ junction }) {
  const maxVal = Math.max(...Object.values(junction.directions));

  return (
    <div className="card card-hover cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-white">{junction.name}</h3>
          <p className="text-xs text-traffix-muted mt-1">Avg: {junction.avgVehicles} vehicles</p>
        </div>
        <SeverityBadge severity={junction.severity} />
      </div>

      <div className="space-y-2">
        {[
          { key: 'N', icon: ArrowUp, label: 'North' },
          { key: 'S', icon: ArrowDown, label: 'South' },
          { key: 'E', icon: ArrowRight, label: 'East' },
          { key: 'W', icon: ArrowLeft, label: 'West' },
        ].map(({ key, icon: Icon, label }) => {
          const value = junction.directions[key];
          const percentage = (value / maxVal) * 100;
          return (
            <div key={key} className="flex items-center gap-2">
              <Icon className="w-3 h-3 text-traffix-muted shrink-0" />
              <span className="text-xs text-traffix-muted w-12 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 bg-traffix-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-white w-8 text-right">{value}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-traffix-border flex items-center justify-between">
        <span className="text-xs text-traffix-muted">Signal Duration</span>
        <span className="text-sm font-semibold text-blue-400">{junction.signalDuration}s</span>
      </div>
    </div>
  );
}

