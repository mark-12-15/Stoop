type Props = { used: number; limit: number };

export default function FreePlanBanner({ used, limit }: Props) {
  const pct = Math.min(100, (used / limit) * 100);
  const isNearLimit = used >= limit - 1;

  return (
    <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1.5">
      <span className={`text-xs font-bold uppercase tracking-wide ${isNearLimit ? "text-red-500" : "text-slate-400"}`}>
        Free
      </span>
      <div className="w-16 h-1.5 bg-slate-300 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isNearLimit ? "bg-red-500" : "bg-blue-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{used}/{limit} Active</span>
    </div>
  );
}
