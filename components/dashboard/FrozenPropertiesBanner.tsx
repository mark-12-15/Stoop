import Link from "next/link";

export default function FrozenPropertiesBanner({ frozenCount }: { frozenCount: number }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between">
      <p className="text-sm text-amber-800">
        <span className="font-semibold">⚠️ Your plan is now Free.</span>{" "}
        {frozenCount} {frozenCount === 1 ? "property has" : "properties have"} been paused
        to meet the 3-property limit.
      </p>
      <div className="flex items-center gap-3 shrink-0">
        <Link
          href="/properties"
          className="text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
        >
          Manage Properties
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Upgrade to Pro →
        </Link>
      </div>
    </div>
  );
}
