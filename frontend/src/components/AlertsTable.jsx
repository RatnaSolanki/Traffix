import { CheckCircle } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function AlertsTable({ alerts, onResolve }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-traffix-border">
              <th className="text-left text-xs font-semibold text-traffix-muted uppercase tracking-wider px-4 py-3">
                Severity
              </th>
              <th className="text-left text-xs font-semibold text-traffix-muted uppercase tracking-wider px-4 py-3">
                Junction
              </th>
              <th className="text-left text-xs font-semibold text-traffix-muted uppercase tracking-wider px-4 py-3">
                Message
              </th>
              <th className="text-left text-xs font-semibold text-traffix-muted uppercase tracking-wider px-4 py-3">
                Time
              </th>
              <th className="text-right text-xs font-semibold text-traffix-muted uppercase tracking-wider px-4 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-traffix-border">
            {alerts.map((alert) => (
              <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                <td className="px-4 py-3">
                  <SeverityBadge severity={alert.severity} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-white">{alert.junction}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-traffix-muted">{alert.message}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-traffix-muted">{alert.time}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {alert.status === 'active' ? (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 text-blue-400 text-xs font-medium rounded-lg transition-all"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

