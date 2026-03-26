"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "new" | "action_required" | "pending_receipt" | "closed" | "archived";

type TicketData = {
  id: string;
  status: Status;
  source: "tenant_submitted" | "landlord_manual";
  description: string | null;
  ai_summary: string | null;
  ai_category: string | null;
  ai_severity: string | null;
  ai_suggested_action: string | null;
  tenant_name: string | null;
  tenant_email: string | null;
  tenant_phone: string | null;
  tenant_raw_text: string | null;
  tenant_photo_urls: string[] | null;
  is_emergency: boolean;
  landlord_notes: string | null;
  final_cost: number | null;
  closed_at: string | null;
  closed_reason: string | null;
  receipt_photo_urls: string[] | null;
  receipt_vendor_name: string | null;
  expense_category: string | null;
  viewed_at: string | null;
  created_at: string;
  updated_at: string;
  properties: { id: string; address: string; unit_number: string | null; slug: string } | null;
};

type SubModal = null | "cost-prompt" | "receipt" | "close-invalid" | "close-confirm" | "delete-confirm" | "editing";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Status, { icon: string; label: string; cls: string }> = {
  new: { icon: "🔴", label: "New · Unread", cls: "bg-red-50 text-red-700 border-red-100" },
  action_required: { icon: "🟡", label: "Action Required", cls: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  pending_receipt: { icon: "⚠️", label: "Missing Receipt", cls: "bg-orange-50 text-orange-700 border-orange-100" },
  closed: { icon: "✅", label: "Closed", cls: "bg-green-50 text-green-700 border-green-100" },
  archived: { icon: "📦", label: "Archived", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const CATEGORY_LABELS: Record<string, string> = {
  repair_maintenance: "Repair & Maintenance",
  insurance: "Insurance",
  property_tax: "Property Tax",
  mortgage_interest: "Mortgage Interest",
  utilities: "Utilities",
  management_fees: "Management Fees",
  hoa_fees: "HOA Fees",
  cleaning: "Cleaning",
  legal_professional: "Legal & Professional",
  advertising: "Advertising",
  supplies: "Supplies",
  travel_auto: "Travel & Auto",
  other: "Other",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(iso: string | null) {
  if (!iso) return new Date().toISOString().slice(0, 10);
  return new Date(iso).toISOString().slice(0, 10);
}

async function uploadReceiptFile(file: File): Promise<string> {
  const res = await fetch("/api/landlord/receipts/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { uploadUrl, publicUrl } = (await res.json()) as { uploadUrl: string; publicUrl: string };
  await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
  return publicUrl;
}

// ─── Sub-modal overlays ───────────────────────────────────────────────────────

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-white/[0.97] rounded-2xl flex flex-col justify-center p-8 z-10 overflow-y-auto">
      {children}
    </div>
  );
}

function OverlayScrollable({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 bg-white/[0.97] rounded-2xl flex flex-col p-6 z-10 overflow-y-auto">
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TicketModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ticketId = searchParams.get("ticket");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);
  const [notesSaving, setNotesSaving] = useState(false);

  const [subModal, setSubModal] = useState<SubModal>(null);
  const [saving, setSaving] = useState(false);

  // Cost prompt state
  const [costInput, setCostInput] = useState("");

  // Receipt upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptVendor, setReceiptVendor] = useState("");
  const [receiptCost, setReceiptCost] = useState("");
  const [receiptDate, setReceiptDate] = useState(toInputDate(null));
  const [receiptUploading, setReceiptUploading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    description: "",
    final_cost: "",
    closed_at: "",
    receipt_vendor_name: "",
    notes: "",
  });

  const closeModal = useCallback(() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("ticket");
    const q = p.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }, [searchParams, router, pathname]);

  // Fetch ticket
  useEffect(() => {
    if (!ticketId) {
      setTicket(null);
      setSubModal(null);
      return;
    }
    setLoading(true);
    setFetchError(null);
    setSubModal(null);
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: TicketData) => {
        setTicket(data);
        setNotes(data.landlord_notes ?? "");
        setNotesDirty(false);
      })
      .catch(() => setFetchError("Failed to load ticket."))
      .finally(() => setLoading(false));
  }, [ticketId]);

  // Auto mark-read for NEW tickets
  useEffect(() => {
    if (ticket?.status !== "new") return;
    fetch(`/api/tickets/${ticket.id}/mark-read`, { method: "PUT" })
      .then(() => setTicket((t) => (t ? { ...t, status: "action_required" } : t)))
      .catch(() => {});
  }, [ticket?.id, ticket?.status]);

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = ticketId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [ticketId]);

  // ── API helper ────────────────────────────────────────────────────────────

  const api = useCallback(async (method: string, path: string, body?: unknown) => {
    const res = await fetch(path, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
    return res;
  }, []);

  // ── Action handlers ───────────────────────────────────────────────────────

  const saveNotes = async () => {
    if (!ticket) return;
    setNotesSaving(true);
    try {
      await api("PUT", `/api/tickets/${ticket.id}`, { landlord_notes: notes });
      setTicket((t) => (t ? { ...t, landlord_notes: notes } : t));
      setNotesDirty(false);
    } finally {
      setNotesSaving(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const cost = parseFloat(costInput);
      await api("PUT", `/api/tickets/${ticket.id}`, {
        status: "pending_receipt",
        final_cost: isNaN(cost) ? null : cost,
      });
      setTicket((t) =>
        t ? { ...t, status: "pending_receipt", final_cost: isNaN(cost) ? null : cost } : t
      );
      setSubModal(null);
      setCostInput("");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseInvalid = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await api("PUT", `/api/tickets/${ticket.id}`, {
        status: "closed",
        closed_reason: "invalid",
        closed_at: new Date().toISOString(),
      });
      closeModal();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkClosed = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await api("PUT", `/api/tickets/${ticket.id}`, {
        status: "closed",
        closed_at: new Date().toISOString(),
      });
      closeModal();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleReceiptSubmit = async () => {
    if (!ticket || !receiptFile || !receiptCost) return;
    setReceiptUploading(true);
    try {
      const publicUrl = await uploadReceiptFile(receiptFile);
      const cost = parseFloat(receiptCost);
      await api("PUT", `/api/tickets/${ticket.id}`, {
        status: "closed",
        closed_reason: "completed",
        receipt_photo_urls: [publicUrl],
        receipt_vendor_name: receiptVendor || null,
        final_cost: isNaN(cost) ? null : cost,
        closed_at: receiptDate ? new Date(receiptDate).toISOString() : new Date().toISOString(),
      });
      closeModal();
      router.refresh();
    } catch {
      alert("Upload failed. Please try again.");
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      await api("DELETE", `/api/tickets/${ticket.id}`);
      closeModal();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleEditSave = async () => {
    if (!ticket) return;
    setSaving(true);
    try {
      const cost = parseFloat(editForm.final_cost);
      await api("PUT", `/api/tickets/${ticket.id}`, {
        description: editForm.description || null,
        final_cost: isNaN(cost) ? null : cost,
        closed_at: editForm.closed_at ? new Date(editForm.closed_at).toISOString() : null,
        receipt_vendor_name: editForm.receipt_vendor_name || null,
        landlord_notes: editForm.notes || null,
      });
      setTicket((t) =>
        t
          ? {
              ...t,
              description: editForm.description || null,
              final_cost: isNaN(cost) ? null : cost,
              closed_at: editForm.closed_at ? new Date(editForm.closed_at).toISOString() : null,
              receipt_vendor_name: editForm.receipt_vendor_name || null,
              landlord_notes: editForm.notes || null,
            }
          : t
      );
      setNotes(editForm.notes);
      setSubModal(null);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (!ticketId) return null;

  const propLabel = ticket?.properties
    ? ticket.properties.unit_number
      ? `${ticket.properties.address}, Unit ${ticket.properties.unit_number}`
      : ticket.properties.address
    : "—";

  const editable =
    ticket &&
    (ticket.status === "new" ||
      ticket.status === "action_required" ||
      ticket.status === "pending_receipt");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* ── Loading ─────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        )}

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {!loading && fetchError && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <p className="text-slate-500">{fetchError}</p>
            <button onClick={closeModal} className="text-sm text-blue-600 hover:underline">
              Close
            </button>
          </div>
        )}

        {/* ── Ticket content ───────────────────────────────────────────────── */}
        {!loading && ticket && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-100 shrink-0">
              <div className="pr-4">
                <p className="text-[11px] font-mono text-slate-400 mb-1">
                  TKT-{ticket.id.slice(0, 8).toUpperCase()}
                </p>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {ticket.ai_summary ?? ticket.description ?? "Untitled Ticket"}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {(() => {
                    const cfg = STATUS_CFG[ticket.status];
                    const label =
                      ticket.is_emergency &&
                      ticket.status !== "closed" &&
                      ticket.status !== "archived"
                        ? "Urgent"
                        : cfg.label;
                    return (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}
                      >
                        {cfg.icon} {label}
                      </span>
                    );
                  })()}
                  {ticket.source === "landlord_manual" && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[11px] font-medium">
                      Manual Entry
                    </span>
                  )}
                  {ticket.expense_category && (
                    <span className="text-xs text-slate-400">
                      {CATEGORY_LABELS[ticket.expense_category] ?? ticket.expense_category}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Property</p>
                  <p className="text-slate-700">{propLabel}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Submitted</p>
                  <p className="text-slate-700">{fmt(ticket.created_at)}</p>
                </div>
                {ticket.closed_at && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Closed</p>
                    <p className="text-slate-700">{fmt(ticket.closed_at)}</p>
                  </div>
                )}
                {ticket.final_cost != null && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Cost</p>
                    <p className="text-slate-900 font-semibold">
                      ${ticket.final_cost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {ticket.closed_reason === "invalid" && (
                  <div className="col-span-2">
                    <span className="text-xs text-red-500 font-medium">Closed as invalid</span>
                  </div>
                )}
              </div>

              {/* AI analysis */}
              {ticket.source === "tenant_submitted" &&
                (ticket.ai_summary || ticket.ai_category || ticket.ai_suggested_action) && (
                  <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-2">
                      AI Analysis
                    </p>
                    {ticket.ai_category && (
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Category:</span> {ticket.ai_category}
                        {ticket.ai_severity && (
                          <span className="ml-2 text-blue-500 text-xs">· {ticket.ai_severity}</span>
                        )}
                      </p>
                    )}
                    {ticket.ai_summary && (
                      <p className="text-sm text-blue-700 mt-1">{ticket.ai_summary}</p>
                    )}
                    {ticket.ai_suggested_action && (
                      <p className="text-sm text-blue-600 mt-1.5">
                        <span className="font-medium">Suggested:</span> {ticket.ai_suggested_action}
                      </p>
                    )}
                  </div>
                )}

              {/* Tenant description + contact */}
              {ticket.source === "tenant_submitted" && (
                <div className="space-y-3">
                  {ticket.tenant_raw_text && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Tenant's Message
                      </p>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100 whitespace-pre-wrap">
                        {ticket.tenant_raw_text}
                      </p>
                    </div>
                  )}
                  {(ticket.tenant_name || ticket.tenant_email || ticket.tenant_phone) && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Contact
                      </p>
                      <div className="text-sm text-slate-700 space-y-0.5">
                        {ticket.tenant_name && (
                          <p className="font-medium">{ticket.tenant_name}</p>
                        )}
                        {ticket.tenant_email && (
                          <a
                            href={`mailto:${ticket.tenant_email}`}
                            className="block text-blue-600 hover:underline"
                          >
                            {ticket.tenant_email}
                          </a>
                        )}
                        {ticket.tenant_phone && <p>{ticket.tenant_phone}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tenant photos */}
              {ticket.tenant_photo_urls && ticket.tenant_photo_urls.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Photos</p>
                  <div className="flex flex-wrap gap-2">
                    {ticket.tenant_photo_urls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Photo ${i + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Receipt */}
              {(ticket.receipt_photo_urls?.length || ticket.receipt_vendor_name) && (
                <div className="rounded-xl bg-green-50 border border-green-100 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-green-500 mb-2">
                    Receipt
                  </p>
                  {ticket.receipt_vendor_name && (
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Vendor:</span> {ticket.receipt_vendor_name}
                    </p>
                  )}
                  {ticket.receipt_photo_urls && ticket.receipt_photo_urls.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {ticket.receipt_photo_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-green-700 hover:underline"
                        >
                          View Receipt {i + 1} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Landlord Notes */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Landlord Notes
                </p>
                {editable ? (
                  <div className="space-y-2">
                    <textarea
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setNotesDirty(true);
                      }}
                      placeholder="Add private notes..."
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    {notesDirty && (
                      <div className="flex gap-2">
                        <button
                          onClick={saveNotes}
                          disabled={notesSaving}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                        >
                          {notesSaving ? "Saving…" : "Save Notes"}
                        </button>
                        <button
                          onClick={() => {
                            setNotes(ticket.landlord_notes ?? "");
                            setNotesDirty(false);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-500 rounded-lg hover:bg-slate-100"
                        >
                          Discard
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-[60px] whitespace-pre-wrap">
                    {ticket.landlord_notes || (
                      <span className="text-slate-300 italic">No notes</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* ── Action footer ────────────────────────────────────────────── */}
            {ticket.status !== "archived" && (
              <div className="shrink-0 border-t border-gray-100 p-4 bg-slate-50 rounded-b-2xl flex flex-wrap gap-2">
                {/* NEW / ACTION_REQUIRED + tenant */}
                {(ticket.status === "new" || ticket.status === "action_required") &&
                  ticket.source === "tenant_submitted" && (
                    <>
                      <button
                        onClick={() => {
                          setCostInput("");
                          setSubModal("cost-prompt");
                        }}
                        className="px-4 py-2 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                      >
                        Mark Complete (No Receipt)
                      </button>
                      <button
                        onClick={() => {
                          setReceiptFile(null);
                          setReceiptVendor("");
                          setReceiptCost("");
                          setReceiptDate(toInputDate(null));
                          setSubModal("receipt");
                        }}
                        className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                      >
                        Close with Receipt
                      </button>
                      <button
                        onClick={() => setSubModal("close-invalid")}
                        className="px-4 py-2 text-sm font-semibold bg-white text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        Close as Invalid
                      </button>
                    </>
                  )}

                {/* PENDING_RECEIPT */}
                {ticket.status === "pending_receipt" && (
                  <>
                    <button
                      onClick={() => {
                        setReceiptFile(null);
                        setReceiptVendor("");
                        setReceiptCost(ticket.final_cost != null ? String(ticket.final_cost) : "");
                        setReceiptDate(toInputDate(null));
                        setSubModal("receipt");
                      }}
                      className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Upload Receipt
                    </button>
                    <button
                      onClick={() => setSubModal("close-confirm")}
                      className="px-4 py-2 text-sm font-semibold bg-white text-slate-700 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Mark as Closed
                    </button>
                  </>
                )}

                {/* CLOSED */}
                {ticket.status === "closed" && (
                  <>
                    <button
                      onClick={() => {
                        setEditForm({
                          description: ticket.description ?? "",
                          final_cost: ticket.final_cost != null ? String(ticket.final_cost) : "",
                          closed_at: toInputDate(ticket.closed_at),
                          receipt_vendor_name: ticket.receipt_vendor_name ?? "",
                          notes: ticket.landlord_notes ?? "",
                        });
                        setSubModal("editing");
                      }}
                      className="px-4 py-2 text-sm font-semibold bg-white text-slate-700 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      Edit
                    </button>
                    {ticket.source === "landlord_manual" && (
                      <button
                        onClick={() => setSubModal("delete-confirm")}
                        className="px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Sub-modals ───────────────────────────────────────────────── */}

            {subModal === "cost-prompt" && (
              <Overlay>
                <h3 className="text-base font-bold text-slate-900 mb-1">Mark as Complete</h3>
                <p className="text-sm text-slate-500 mb-5">
                  Enter the repair cost if known. You can upload a receipt later.
                </p>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Final Cost (optional)
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costInput}
                    onChange={(e) => setCostInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleMarkComplete(); }}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkComplete}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Confirm — Add to Missing Receipts"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </Overlay>
            )}

            {subModal === "close-invalid" && (
              <Overlay>
                <h3 className="text-base font-bold text-slate-900 mb-1">Close as Invalid?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  This marks the ticket as closed with reason "invalid". No cost will be recorded.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCloseInvalid}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? "Closing…" : "Yes, Close as Invalid"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </Overlay>
            )}

            {subModal === "close-confirm" && (
              <Overlay>
                <h3 className="text-base font-bold text-slate-900 mb-1">Close Without Receipt?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  The ticket will be marked as closed. You can still edit it later to add a receipt.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleMarkClosed}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                  >
                    {saving ? "Closing…" : "Close Ticket"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </Overlay>
            )}

            {subModal === "delete-confirm" && (
              <Overlay>
                <h3 className="text-base font-bold text-slate-900 mb-1">Delete Ticket?</h3>
                <p className="text-sm text-slate-500 mb-6">
                  This will permanently delete this expense entry. This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                  >
                    {saving ? "Deleting…" : "Delete Permanently"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </Overlay>
            )}

            {subModal === "receipt" && (
              <OverlayScrollable>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900">Close with Receipt</h3>
                  <button
                    onClick={() => setSubModal(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {/* File picker */}
                <div className="mb-4">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Receipt File *
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                      receiptFile
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    {receiptFile ? (
                      <p className="text-sm font-medium text-blue-700">
                        📎 {receiptFile.name}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptFile(null);
                          }}
                          className="ml-2 text-xs text-slate-400 hover:text-red-500"
                        >
                          ✕ remove
                        </button>
                      </p>
                    ) : (
                      <>
                        <p className="text-2xl mb-1">📁</p>
                        <p className="text-sm text-slate-500">Click to select a receipt</p>
                        <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, PDF · Max 10 MB</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setReceiptFile(f);
                    }}
                  />
                </div>

                {/* Form */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={receiptVendor}
                      onChange={(e) => setReceiptVendor(e.target.value)}
                      placeholder="e.g., ABC Plumbing Inc."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Total Cost *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={receiptCost}
                          onChange={(e) => setReceiptCost(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Repair Date
                      </label>
                      <input
                        type="date"
                        value={receiptDate}
                        onChange={(e) => setReceiptDate(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-5">
                  <button
                    onClick={handleReceiptSubmit}
                    disabled={!receiptFile || !receiptCost || receiptUploading}
                    className="flex-1 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {receiptUploading ? "Uploading…" : "Close Ticket with Receipt"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </OverlayScrollable>
            )}

            {subModal === "editing" && (
              <OverlayScrollable>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-slate-900">Edit Ticket</h3>
                  <button
                    onClick={() => setSubModal(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      rows={2}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Final Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editForm.final_cost}
                          onChange={(e) => setEditForm((f) => ({ ...f, final_cost: e.target.value }))}
                          className="w-full pl-7 text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                        Closed Date
                      </label>
                      <input
                        type="date"
                        value={editForm.closed_at}
                        onChange={(e) => setEditForm((f) => ({ ...f, closed_at: e.target.value }))}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Vendor Name
                    </label>
                    <input
                      type="text"
                      value={editForm.receipt_vendor_name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, receipt_vendor_name: e.target.value }))
                      }
                      placeholder="e.g., ABC Plumbing Inc."
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={handleEditSave}
                    disabled={saving}
                    className="flex-1 py-2.5 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-700 disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setSubModal(null)}
                    className="px-4 py-2.5 text-sm font-semibold text-slate-500 border border-gray-200 rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </OverlayScrollable>
            )}
          </>
        )}
      </div>
    </div>
  );
}
