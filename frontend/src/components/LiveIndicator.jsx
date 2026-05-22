export default function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live</span>
    </div>
  );
}

