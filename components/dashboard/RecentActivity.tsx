import Link from "next/link";

type Property = { address: string; unit_number: string | null };
export type ActivityTicket = {
  id: string;
  status: string;
  is_emergency: boolean;
  final_cost: number | null;
  closed_at: string | null;
  updated_at: string;
  description: string | null;
  ai_summary: string | null;
  properties: Property | null;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function statusInfo(t: ActivityTicket) {
  if (t.status === "closed") return { icon: "✅", label: `Closed${t.final_cost ? ` · $${t.final_cost}` : ""}` };
  if (t.status === "pending_receipt") return { icon: "⚠️", label: "Missing Receipt" };
  if (t.is_emergency) return { icon: "🔴", label: "Urgent" };
  return { icon: "🟡", label: t.status === "action_required" ? "Action Required" : "To Do" };
}

export default function RecentActivity({ tickets }: { tickets: ActivityTicket[] }) {
  if (tickets.length === 0) return null;

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
        Recent Activity
      </h2>
      <div className="space-y-2">
        {tickets.map((t) => {
          const { icon, label } = statusInfo(t);
          const title = t.ai_summary ?? t.description ?? "Untitled ticket";
          const loc = t.properties?.unit_number
            ? `Unit ${t.properties.unit_number}`
            : t.properties?.address ?? "";

          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <span className="text-base shrink-0 mt-0.5">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {loc && <>{loc} · </>}{label} · {timeAgo(t.updated_at)}
                  </p>
                  {t.status === "pending_receipt" && (
                    <Link href={`/tickets/${t.id}`}
                      className="inline-block mt-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700">
                      Upload Receipt →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center">
        <Link href="/tickets" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View All Tickets →
        </Link>
      </div>
    </div>
  );
}
