"use client";

import { useState } from "react";
import Link from "next/link";

type ClosedTicket = { final_cost: number | null; closed_at: string | null };

type Props = {
  todoCount: number;
  urgentCount: number;
  missingCount: number;
  closedTickets: ClosedTicket[];
  defaultYear: number;
};

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function StatCards({ todoCount, urgentCount, missingCount, closedTickets, defaultYear }: Props) {
  const [taxYear, setTaxYear] = useState(defaultYear);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const taxYearTickets = closedTickets.filter(
    (t) => t.closed_at && new Date(t.closed_at).getFullYear() === taxYear
  );
  const taxYearTotal = taxYearTickets.reduce((s, t) => s + (t.final_cost ?? 0), 0);

  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 3);
  const last3Tickets = closedTickets.filter((t) => t.closed_at && new Date(t.closed_at) >= cutoff);
  const last3Total = last3Tickets.reduce((s, t) => s + (t.final_cost ?? 0), 0);

  const cardBase = "bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col";

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* TO DO */}
      <div className={cardBase}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">🔔 To Do</p>
        <p className="text-4xl font-extrabold text-slate-900 leading-none mb-1">{todoCount}</p>
        {urgentCount > 0 && (
          <p className="text-xs text-red-500 font-medium mb-2">🔴 {urgentCount} Urgent</p>
        )}
        <Link href="/tickets?filter=todo" className="mt-auto text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All →
        </Link>
      </div>

      {/* TAX YEAR */}
      <div className={cardBase}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">💰 Tax Year</p>
          <select
            value={taxYear}
            onChange={(e) => setTaxYear(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-0.5 text-slate-600 focus:outline-none focus:border-blue-400"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{fmt(taxYearTotal)}</p>
        <p className="text-xs text-slate-400 mb-2">{taxYearTickets.length} Tickets</p>
        <Link href={`/tickets?year=${taxYear}&status=closed`} className="mt-auto text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All →
        </Link>
      </div>

      {/* MISSING RECEIPTS */}
      <div className={cardBase}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-500 mb-2">⚠️ Missing Receipts</p>
        <p className="text-4xl font-extrabold text-slate-900 leading-none mb-3">{missingCount}</p>
        <Link href="/tickets?filter=pending_receipt" className="mt-auto text-xs font-semibold text-amber-600 hover:text-amber-700">
          Add Receipt →
        </Link>
      </div>

      {/* LAST 3 YEARS */}
      <div className={cardBase}>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">📄 Last 3 Years</p>
        <p className="text-3xl font-extrabold text-slate-900 leading-none mb-1">{fmt(last3Total)}</p>
        <p className="text-xs text-slate-400 mb-2">{last3Tickets.length} Tickets · IRS Ready</p>
        <Link href="/tickets?last3years=true&status=closed" className="mt-auto text-xs font-semibold text-blue-600 hover:text-blue-700">
          View All →
        </Link>
      </div>
    </div>
  );
}
