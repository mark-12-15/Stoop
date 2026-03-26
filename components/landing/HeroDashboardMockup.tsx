const tickets = [
  {
    label: "Leaking faucet — Unit 4B",
    status: "Open",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    label: "HVAC filter replacement",
    status: "Closed",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Broken window latch — 12A",
    status: "Open",
    badge: "bg-amber-100 text-amber-700",
  },
];

const stats = [
  { label: "Open", value: "3", color: "text-amber-500" },
  { label: "This Month", value: "$840", color: "text-blue-600" },
  { label: "Properties", value: "8", color: "text-emerald-500" },
];

export default function HeroDashboardMockup() {
  return (
    <div className="relative w-full max-w-md select-none pb-8 pr-4">
      <div className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-slate-200/60 overflow-hidden">
        {/* Browser chrome */}
        <div className="bg-gray-50 px-4 py-3 flex items-center gap-1.5 border-b border-gray-200">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
          <div className="flex-1 ml-3 bg-white rounded-md border border-gray-200 text-xs text-gray-400 px-3 py-1 text-center truncate">
            app.stoopkeep.com/dashboard
          </div>
        </div>

        {/* Dashboard body */}
        <div className="p-4 bg-slate-50 space-y-3">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map(({ label, value, color }) => (
              <div
                key={label}
                className="bg-white rounded-xl p-3 border border-gray-100"
              >
                <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-extrabold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Ticket list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {tickets.map((t, i) => (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2.5 text-xs ${
                  i !== tickets.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <span className="text-slate-700 truncate mr-2">{t.label}</span>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.badge}`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>

          {/* Export button hint */}
          <button className="w-full bg-blue-600 text-white text-xs font-semibold py-2 rounded-lg opacity-90">
            Export Schedule E CSV →
          </button>
        </div>
      </div>

      {/* Floating badge — clear of card content */}
      <div className="absolute bottom-2 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg whitespace-nowrap">
        Schedule E Ready ✓
      </div>
    </div>
  );
}
