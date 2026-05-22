import { GitBranch, Car, AlertTriangle, Cpu, Clock } from 'lucide-react';

const iconMap = {
  GitBranch,
  Car,
  AlertTriangle,
  Cpu,
  Clock,
};

export default function MetricCard({ label, value, change, icon }) {
  const Icon = iconMap[icon] || GitBranch;
  const isPositive = change.startsWith('+');

  return (
    <div className="card card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-red-500/10 text-red-400'
          }`}
        >
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-traffix-muted">{label}</p>
    </div>
  );
}

