export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-traffix-bg border border-traffix-border rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === tab.value
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
              : 'text-traffix-muted hover:text-white hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

