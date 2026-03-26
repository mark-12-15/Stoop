"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { TicketRow } from "@/app/tickets/page";
import TicketModal from "./TicketModal";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusBadge(status: string, isEmergency: boolean) {
  if (status === "new") return { icon: "🔴", label: "New", cls: "bg-red-50 text-red-700" };
  if (status === "action_required" && isEmergency)
    return { icon: "🔴", label: "Urgent", cls: "bg-red-50 text-red-700" };
  if (status === "action_required")
    return { icon: "🟡", label: "Action Required", cls: "bg-yellow-50 text-yellow-700" };
  if (status === "pending_receipt")
    return { icon: "⚠️", label: "Missing Receipt", cls: "bg-orange-50 text-orange-700" };
  if (status === "closed") return { icon: "✅", label: "Closed", cls: "bg-green-50 text-green-700" };
  return { icon: "📦", label: "Archived", cls: "bg-slate-100 text-slate-500" };
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return fmt(iso);
}

function propLabel(t: TicketRow) {
  if (!t.properties) return "—";
  return t.properties.unit_number
    ? `${t.properties.address}, Unit ${t.properties.unit_number}`
    : t.properties.address;
}

// ─── Filter/Sort/View controls ───────────────────────────────────────────────

const FILTER_OPTS = [
  { value: "all", label: "All Tickets" },
  { value: "todo", label: "To Do" },
  { value: "pending_receipt", label: "Missing Receipt" },
  { value: "closed", label: "Closed" },
  { value: "archived", label: "Archived" },
];

const SORT_OPTS = [
  { value: "date_desc", label: "Newest First" },
  { value: "date_asc", label: "Oldest First" },
  { value: "cost_desc", label: "Cost: High → Low" },
  { value: "cost_asc", label: "Cost: Low → High" },
];

// ─── Table view ──────────────────────────────────────────────────────────────

function TicketsTable({
  tickets,
  onOpen,
  currentSort,
  onSort,
}: {
  tickets: TicketRow[];
  onOpen: (id: string) => void;
  currentSort: string;
  onSort: (sort: string) => void;
}) {
  const SortBtn = ({ col, asc, desc }: { col: string; asc: string; desc: string }) => {
    const active = currentSort === asc || currentSort === desc;
    return (
      <button
        onClick={() => onSort(currentSort === desc ? asc : desc)}
        className={`flex items-center gap-1 font-semibold uppercase tracking-wider text-xs hover:text-blue-600 transition-colors ${active ? "text-blue-600" : "text-slate-400"}`}
      >
        {col}
        <span className="text-[10px]">
          {currentSort === desc ? "↓" : currentSort === asc ? "↑" : "↕"}
        </span>
      </button>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="border-b border-gray-100">
          <tr>
            <th className="w-10 px-4 py-3" />
            <th className="px-4 py-3 text-left">
              <SortBtn col="Description" asc="desc_asc" desc="desc_desc" />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="font-semibold uppercase tracking-wider text-xs text-slate-400">Property</span>
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn col="Date" asc="date_asc" desc="date_desc" />
            </th>
            <th className="px-4 py-3 text-left">
              <SortBtn col="Cost" asc="cost_asc" desc="cost_desc" />
            </th>
            <th className="w-16 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tickets.map((t) => {
            const { icon, label, cls } = statusBadge(t.status, t.is_emergency);
            const title = t.ai_summary ?? t.description ?? "Untitled";
            return (
              <tr
                key={t.id}
                onClick={() => onOpen(t.id)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3 text-base">{icon}</td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="font-medium text-slate-900 truncate">{title}</p>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>
                    {label}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{propLabel(t)}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmt(t.created_at)}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                  {t.final_cost != null ? `$${t.final_cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Card view ───────────────────────────────────────────────────────────────

function TicketsCards({ tickets, onOpen }: { tickets: TicketRow[]; onOpen: (id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tickets.map((t) => {
        const { icon, label, cls } = statusBadge(t.status, t.is_emergency);
        const title = t.ai_summary ?? t.description ?? "Untitled";
        return (
          <button
            key={t.id}
            onClick={() => onOpen(t.id)}
            className="text-left bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{propLabel(t)}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cls}`}>{label}</span>
                  <span className="text-xs text-slate-400">{timeAgo(t.created_at)}</span>
                  {t.final_cost != null && (
                    <span className="text-xs font-semibold text-slate-600">
                      ${t.final_cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  perPage,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  perPage: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  // Build page list: always show 1, last, current ±1, fill with ellipsis
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
      <span className="text-sm text-slate-500">
        Showing {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-2 text-slate-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 text-sm rounded-lg font-medium ${
                p === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-200 hover:bg-slate-50 text-slate-600"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

// ─── Main client ─────────────────────────────────────────────────────────────

export default function TicketsClient({
  tickets,
  total,
  page,
  totalPages,
  perPage,
  currentFilter,
  currentSort,
  currentView,
  propertyId,
  propertyName,
}: {
  tickets: TicketRow[];
  total: number;
  page: number;
  totalPages: number;
  perPage: number;
  currentFilter: string;
  currentSort: string;
  currentView: string;
  propertyId: string | null;
  propertyName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const push = (updates: Record<string, string | null>) => {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) p.delete(k);
      else p.set(k, v);
    }
    router.push(`${pathname}?${p.toString()}`);
  };

  const openTicket = (id: string) => push({ ticket: id });

  const filterLabel = FILTER_OPTS.find((o) => o.value === currentFilter)?.label ?? "All Tickets";

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Title */}
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {propertyName ? `Tickets — ${propertyName}` : filterLabel}
        </h1>
        <span className="text-sm text-slate-400">{total} total</span>
      </div>

      {/* Property filter banner */}
      {propertyId && (
        <div className="mb-4 flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm">
          <span className="text-blue-700">
            💡 Showing tickets for <strong>{propertyName}</strong>
          </span>
          <button
            onClick={() => push({ property: null, page: null })}
            className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Filter */}
        <select
          value={currentFilter}
          onChange={(e) => push({ filter: e.target.value, page: null })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {FILTER_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => push({ sort: e.target.value, page: null })}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="ml-auto flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => push({ view: "table", page: null })}
            className={`px-3 py-1.5 text-sm transition-colors ${
              currentView === "table" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
            title="Table view"
          >
            ☰ Table
          </button>
          <button
            onClick={() => push({ view: "cards", page: null })}
            className={`px-3 py-1.5 text-sm border-l border-gray-200 transition-colors ${
              currentView === "cards" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
            title="Card view"
          >
            ⊞ Cards
          </button>
        </div>
      </div>

      {/* Empty state */}
      {tickets.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-semibold text-slate-700">No tickets found</p>
          <p className="text-sm text-slate-400 mt-1">
            {currentFilter === "all"
              ? "No tickets yet. Add a property to get started."
              : "No tickets match this filter."}
          </p>
          {currentFilter !== "all" && (
            <button
              onClick={() => push({ filter: "all", page: null })}
              className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Show all tickets
            </button>
          )}
        </div>
      )}

      {/* Ticket list */}
      {tickets.length > 0 && (
        <>
          {currentView === "table" ? (
            <TicketsTable
              tickets={tickets}
              onOpen={openTicket}
              currentSort={currentSort}
              onSort={(s) => push({ sort: s, page: null })}
            />
          ) : (
            <TicketsCards tickets={tickets} onOpen={openTicket} />
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            perPage={perPage}
            total={total}
            onChange={(p) => push({ page: String(p) })}
          />
        </>
      )}

      {/* Ticket Detail Modal */}
      <Suspense fallback={null}>
        <TicketModal />
      </Suspense>
    </div>
  );
}
