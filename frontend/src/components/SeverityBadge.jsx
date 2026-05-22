const severityConfig = {
  low: { label: 'Low', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  medium: { label: 'Medium', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  high: { label: 'High', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  critical: { label: 'Critical', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function SeverityBadge({ severity }) {
  const config = severityConfig[severity] || severityConfig.low;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

