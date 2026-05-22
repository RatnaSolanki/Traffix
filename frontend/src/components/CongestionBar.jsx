const levels = [
  { label: 'Low', color: 'bg-emerald-500', width: '25%' },
  { label: 'Medium', color: 'bg-yellow-500', width: '25%' },
  { label: 'High', color: 'bg-orange-500', width: '25%' },
  { label: 'Critical', color: 'bg-red-500', width: '25%' },
];

export default function CongestionBar({ level }) {
  const activeIndex = levels.findIndex((l) => l.label.toLowerCase() === level.toLowerCase());

  return (
    <div className="card">
      <h4 className="text-sm font-semibold text-white mb-4">Congestion Level</h4>
      <div className="flex h-3 rounded-full overflow-hidden bg-traffix-bg border border-traffix-border">
        {levels.map((l, index) => (
          <div
            key={l.label}
            className={`flex-1 transition-all duration-500 ${
              index <= activeIndex ? l.color : 'bg-transparent'
            } ${index > 0 ? 'border-l border-traffix-bg' : ''}`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {levels.map((l) => (
          <span
            key={l.label}
            className={`text-xs font-medium ${
              l.label.toLowerCase() === level.toLowerCase()
                ? 'text-white'
                : 'text-traffix-muted'
            }`}
          >
            {l.label}
          </span>
        ))}
      </div>
      <div className="mt-4 p-3 bg-traffix-bg rounded-lg border border-traffix-border">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${levels[activeIndex]?.color || 'bg-gray-500'}`} />
          <span className="text-sm font-medium text-white capitalize">{level}</span>
          <span className="text-xs text-traffix-muted ml-auto">Current Status</span>
        </div>
      </div>
    </div>
  );
}

