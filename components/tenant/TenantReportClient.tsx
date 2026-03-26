"use client";

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Ticket = {
  id: string;
  status: string;
  is_emergency: boolean;
  tenant_raw_text: string;
  tenant_photo_urls: string[] | null;
  landlord_notes: string | null;
  final_cost: number | null;
  created_at: string;
  closed_at: string | null;
  viewed_at: string | null;
};

type Property = { id: string; address: string; unit_number: string | null };
type View = "loading" | "form" | "success" | "list" | "edit" | "detail";

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortId(id: string): string {
  return `TKT-${id.slice(0, 5).toUpperCase()}`;
}

function statusCfg(s: string): { label: string; icon: string; dot: string } {
  const map: Record<string, { label: string; icon: string; dot: string }> = {
    new:              { label: "New",             icon: "📥", dot: "bg-blue-500" },
    action_required:  { label: "In Progress",     icon: "🔄", dot: "bg-amber-500" },
    pending_receipt:  { label: "Pending Receipt", icon: "⏳", dot: "bg-amber-400" },
    closed:           { label: "Closed",          icon: "✅", dot: "bg-emerald-500" },
  };
  return map[s] ?? { label: s, icon: "📋", dot: "bg-gray-400" };
}

function propTitle(p: Property): string {
  return [p.address, p.unit_number].filter(Boolean).join(", ");
}

// ─── Shared NavBar ────────────────────────────────────────────────────────────

function NavBar({ onBack, backLabel }: { onBack?: () => void; backLabel?: string }) {
  return (
    <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between sticky top-0 z-10">
      <span className="font-bold text-slate-900">StoopKeep</span>
      {onBack && (
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900 font-medium transition-colors">
          ← {backLabel ?? "Back"}
        </button>
      )}
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ onCancel, onConfirm, loading }: { onCancel: () => void; onConfirm: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Request?</h2>
        <p className="text-sm text-slate-600 mb-1">Are you sure you want to delete this maintenance request?</p>
        <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Photo Upload Section ─────────────────────────────────────────────────────

type PhotoItem = { id: string; preview: string; url: string; uploading: boolean };

function PhotoUploadSection({
  initialUrls = [],
  onReady,
  onUploading,
}: {
  initialUrls?: string[];
  onReady: (urls: string[]) => void;
  onUploading: (v: boolean) => void;
}) {
  const [items, setItems] = useState<PhotoItem[]>(
    initialUrls.map(url => ({ id: crypto.randomUUID(), preview: url, url, uploading: false }))
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onReady(items.filter(i => !i.uploading && i.url).map(i => i.url));
    onUploading(items.some(i => i.uploading));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const addFiles = async (files: File[]) => {
    const toAdd = files.slice(0, 5 - items.length);
    if (!toAdd.length) return;
    const newItems: PhotoItem[] = toAdd.map(file => ({
      id: crypto.randomUUID(),
      preview: URL.createObjectURL(file),
      url: "",
      uploading: true,
    }));
    setItems(prev => [...prev, ...newItems]);
    await Promise.all(toAdd.map(async (file, i) => {
      const id = newItems[i].id;
      try {
        const res = await fetch("/api/public/upload/presign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
        });
        if (!res.ok) throw new Error("presign failed");
        const { uploadUrl, publicUrl } = await res.json();
        const put = await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
        if (!put.ok) throw new Error("upload failed");
        setItems(prev => prev.map(p => p.id === id ? { ...p, url: publicUrl, uploading: false } : p));
      } catch {
        setItems(prev => prev.filter(p => p.id !== id));
      }
    }));
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Add Photos <span className="text-xs font-normal text-slate-400">(Up to 5)</span>
      </label>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <div key={item.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt="" className="w-full h-full object-cover" />
            {item.uploading ? (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setItems(prev => prev.filter(p => p.id !== item.id))}
                className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {items.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors shrink-0"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-[10px] mt-0.5">Photo</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) addFiles(files);
        }}
      />
    </div>
  );
}

// ─── Form View (2A) ───────────────────────────────────────────────────────────

function FormView({ property, slug, onSuccess }: {
  property: Property;
  slug: string;
  onSuccess: (ticketId: string, tenantId: string) => void;
}) {
  const [desc, setDesc] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photosUploading, setPhotosUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) { setError("Please describe the issue."); return; }
    setLoading(true);
    setError("");

    let tenantId = localStorage.getItem(`tenant_id_${slug}`);
    if (!tenantId) tenantId = crypto.randomUUID();

    const res = await fetch(`/api/public/properties/${slug}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenant_identifier: tenantId,
        tenant_raw_text: desc.trim(),
        is_emergency: isEmergency,
        photo_urls: photoUrls,
        tenant_name: name || undefined,
        tenant_email: email || undefined,
        tenant_phone: phone || undefined,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const { error: e } = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(e ?? "Something went wrong");
      return;
    }

    const { id } = await res.json();
    localStorage.setItem(`tenant_id_${slug}`, tenantId);
    onSuccess(id, tenantId);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Report a Maintenance Issue</h1>
          <p className="text-sm text-slate-500 mt-1">Property: {propTitle(property)}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What&apos;s the problem? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={desc}
              onChange={e => { setDesc(e.target.value); if (error) setError(""); }}
              placeholder="Describe the issue…"
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <PhotoUploadSection onReady={setPhotoUrls} onUploading={setPhotosUploading} />

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={e => setIsEmergency(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-500"
            />
            <div>
              <span className="text-sm font-medium text-slate-800">This is an emergency</span>
              <p className="text-xs text-slate-500 mt-0.5">(safety risk or major damage)</p>
            </div>
          </label>

          <hr className="border-gray-100" />

          <div>
            <button
              type="button"
              onClick={() => setContactOpen(o => !o)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <span className="text-xs">{contactOpen ? "▲" : "▼"}</span>
              Your Contact Info <span className="font-normal text-slate-400">(Optional)</span>
            </button>
            {contactOpen && (
              <div className="mt-3 space-y-3">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" type="tel" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || photosUploading}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? "Submitting…" : photosUploading ? "Uploading photos…" : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Success View ─────────────────────────────────────────────────────────────

function SuccessView({ ticketId, onViewRequests }: { ticketId: string; onViewRequests: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-lg mx-auto px-5 pt-16 pb-12 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
        <p className="text-sm text-slate-500 mb-1">Your landlord has been notified.</p>
        <p className="text-sm text-slate-400 mb-7">
          Reference ID: <span className="font-mono font-semibold text-slate-600">{shortId(ticketId)}</span>
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-blue-700">
            💡 <strong>Tip:</strong> Visit this page anytime to view your requests and check their status.
          </p>
        </div>
        <button onClick={onViewRequests} className="w-full max-w-xs bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
          View My Requests
        </button>
      </div>
    </div>
  );
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────

function TicketCard({ ticket, onEdit, onDelete, onView }: {
  ticket: Ticket;
  onEdit?: () => void;
  onDelete?: () => void;
  onView: () => void;
}) {
  const cfg = statusCfg(ticket.status);
  const isClosed = ticket.status === "closed";
  const canEdit = ticket.status === "new";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-base">{ticket.is_emergency ? "🔴" : isClosed ? "✅" : "🟡"}</span>
        <p className="text-sm font-semibold text-slate-900 line-clamp-2">
          {ticket.tenant_raw_text.length > 60 ? ticket.tenant_raw_text.slice(0, 60) + "…" : ticket.tenant_raw_text}
        </p>
      </div>

      <p className="text-xs text-slate-400 mb-2 pl-6">
        {isClosed
          ? `Closed: ${formatDate(ticket.closed_at!)}`
          : `Submitted: ${timeAgo(ticket.created_at)}`}
        {isClosed && ticket.final_cost != null ? ` · Cost: $${ticket.final_cost.toFixed(2)}` : ""}
      </p>

      <div className="flex items-center gap-1.5 mb-3 pl-6">
        <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-xs font-medium text-slate-600">
          {cfg.icon} Status: {cfg.label}
        </span>
      </div>

      <div className="flex items-center gap-3 pl-6">
        {canEdit && onEdit && (
          <button onClick={onEdit} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Edit
          </button>
        )}
        {canEdit && onDelete && (
          <button onClick={onDelete} className="text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors">
            Delete
          </button>
        )}
        <button onClick={onView} className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors ml-auto">
          View Details →
        </button>
      </div>
    </div>
  );
}

// ─── List View (2B) ───────────────────────────────────────────────────────────

function ListView({ property, tickets, onNewReport, onEdit, onDeleteClick, onView }: {
  property: Property;
  tickets: Ticket[];
  onNewReport: () => void;
  onEdit: (t: Ticket) => void;
  onDeleteClick: (t: Ticket) => void;
  onView: (t: Ticket) => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-900">Maintenance Requests</h1>
          <p className="text-sm text-slate-500 mt-1">Property: {propTitle(property)}</p>
        </div>

        <button
          onClick={onNewReport}
          className="w-full mb-5 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          + Report New Issue
        </button>

        <hr className="border-gray-100 mb-5" />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Your Previous Requests ({tickets.length})
        </p>

        <div className="space-y-3">
          {tickets.map(t => (
            <TicketCard
              key={t.id}
              ticket={t}
              onEdit={t.status === "new" ? () => onEdit(t) : undefined}
              onDelete={t.status === "new" ? () => onDeleteClick(t) : undefined}
              onView={() => onView(t)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Edit View (2C) ───────────────────────────────────────────────────────────

function EditView({ ticket, slug, onSaved, onCancel }: {
  ticket: Ticket;
  slug: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [desc, setDesc] = useState(ticket.tenant_raw_text);
  const [isEmergency, setIsEmergency] = useState(ticket.is_emergency);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>(ticket.tenant_photo_urls ?? []);
  const [photosUploading, setPhotosUploading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) { setError("Description is required."); return; }
    setLoading(true);
    const tenantId = localStorage.getItem(`tenant_id_${slug}`) ?? "";
    const res = await fetch(`/api/public/tickets/${ticket.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Tenant-Identifier": tenantId },
      body: JSON.stringify({ tenant_raw_text: desc.trim(), is_emergency: isEmergency, photo_urls: photoUrls }),
    });
    setLoading(false);
    if (!res.ok) { setError("Failed to save. Please try again."); return; }
    onSaved();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onBack={onCancel} backLabel="Cancel" />
      <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">
            Edit Request <span className="font-mono text-slate-400 text-base">{shortId(ticket.id)}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Submitted {timeAgo(ticket.created_at)}</p>
        </div>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              What&apos;s the problem? <span className="text-red-500">*</span>
            </label>
            <textarea
              value={desc}
              onChange={e => { setDesc(e.target.value); if (error) setError(""); }}
              rows={4}
              className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <PhotoUploadSection
            initialUrls={ticket.tenant_photo_urls ?? []}
            onReady={setPhotoUrls}
            onUploading={setPhotosUploading}
          />

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={e => setIsEmergency(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-red-500"
            />
            <span className="text-sm font-medium text-slate-800">This is an emergency</span>
          </label>

          <div className="space-y-3 pt-1">
            <button type="submit" disabled={loading || photosUploading} className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl text-sm font-semibold transition-colors">
              {loading ? "Saving…" : photosUploading ? "Uploading photos…" : "Save Changes"}
            </button>
            <p className="text-xs text-slate-400 text-center">
              ℹ️ You can edit this request until your landlord views it.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail View (2E / 2F) ────────────────────────────────────────────────────

function DetailView({ ticket, property, onBack }: { ticket: Ticket; property: Property; onBack: () => void }) {
  const cfg = statusCfg(ticket.status);
  const isClosed = ticket.status === "closed";
  const isReadOnly = ticket.status !== "new";

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar onBack={onBack} backLabel="Back" />
      <div className="max-w-lg mx-auto px-5 pt-6 pb-12">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-slate-900">
            Request <span className="font-mono text-slate-400 text-base">{shortId(ticket.id)}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Property: {propTitle(property)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Submitted: {timeAgo(ticket.created_at)}</p>
        </div>

        <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
          <span className="text-sm font-semibold text-slate-800">{cfg.icon} {cfg.label}</span>
          {isClosed && ticket.final_cost != null && (
            <span className="ml-auto text-sm text-emerald-600 font-semibold">
              Cost: ${ticket.final_cost.toFixed(2)}
            </span>
          )}
        </div>

        <hr className="border-gray-100 mb-5" />

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Description</p>
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.tenant_raw_text}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Emergency: <span className="font-medium text-slate-600">{ticket.is_emergency ? "Yes 🚨" : "No"}</span>
          </p>

          {isClosed && ticket.closed_at && (
            <p className="text-xs text-slate-400">
              Completed: <span className="font-medium text-slate-600">{formatDate(ticket.closed_at)}</span>
            </p>
          )}

          {ticket.landlord_notes && (
            <>
              <hr className="border-gray-100" />
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-700 mb-2">💬 Landlord Update</p>
                <p className="text-sm text-blue-800 leading-relaxed">{ticket.landlord_notes}</p>
              </div>
            </>
          )}

          <hr className="border-gray-100" />

          {isClosed ? (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-center">
              ✅ This request has been completed.
            </p>
          ) : isReadOnly ? (
            <p className="text-xs text-slate-400 text-center">
              ℹ️ Your landlord is working on this. You cannot edit once they&apos;ve viewed it.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// ─── Main TenantReportClient ──────────────────────────────────────────────────

export default function TenantReportClient({ property, slug }: { property: Property; slug: string }) {
  const [view, setView] = useState<View>("loading");
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [submittedId, setSubmittedId] = useState("");
  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [detailTicket, setDetailTicket] = useState<Ticket | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTickets = async (tid: string) => {
    const res = await fetch(`/api/public/properties/${slug}/tickets`, {
      headers: { "X-Tenant-Identifier": tid },
    });
    if (res.ok) {
      const data: Ticket[] = await res.json();
      setTickets(data);
      setView(data.length > 0 ? "list" : "form");
    } else {
      setView("form");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(`tenant_id_${slug}`);
    if (stored) {
      setTenantId(stored);
      fetchTickets(stored);
    } else {
      setView("form");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSubmitSuccess = (ticketId: string, newTenantId: string) => {
    setSubmittedId(ticketId);
    setTenantId(newTenantId);
    setView("success");
  };

  const handleViewRequests = () => {
    if (tenantId) fetchTickets(tenantId);
  };

  const handleSaved = () => {
    setEditTicket(null);
    if (tenantId) fetchTickets(tenantId);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !tenantId) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/public/tickets/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { "X-Tenant-Identifier": tenantId },
    });
    setDeleteLoading(false);
    if (res.ok) {
      setDeleteTarget(null);
      fetchTickets(tenantId);
    }
  };

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          loading={deleteLoading}
        />
      )}
      {view === "form" && (
        <FormView property={property} slug={slug} onSuccess={handleSubmitSuccess} />
      )}
      {view === "success" && (
        <SuccessView ticketId={submittedId} onViewRequests={handleViewRequests} />
      )}
      {view === "list" && (
        <ListView
          property={property}
          tickets={tickets}
          onNewReport={() => setView("form")}
          onEdit={t => { setEditTicket(t); setView("edit"); }}
          onDeleteClick={t => setDeleteTarget(t)}
          onView={t => { setDetailTicket(t); setView("detail"); }}
        />
      )}
      {view === "edit" && editTicket && (
        <EditView ticket={editTicket} slug={slug} onSaved={handleSaved} onCancel={() => setView("list")} />
      )}
      {view === "detail" && detailTicket && (
        <DetailView ticket={detailTicket} property={property} onBack={() => setView("list")} />
      )}
    </>
  );
}

// ─── PropertyNotFoundClient (5A / 5B) ─────────────────────────────────────────

export function PropertyNotFoundClient({ slug }: { slug: string }) {
  const [historicalTickets, setHistoricalTickets] = useState<Ticket[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const tenantId = localStorage.getItem(`tenant_id_${slug}`);
    if (!tenantId) { setLoaded(true); return; }
    fetch(`/api/public/archived-property-tickets/${slug}`, {
      headers: { "X-Tenant-Identifier": tenantId },
    })
      .then(r => r.json())
      .then(data => { setHistoricalTickets(data.tickets ?? []); setLoaded(true); });
  }, [slug]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center">
        <span className="font-bold text-slate-900">StoopKeep</span>
      </div>
      <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
        {historicalTickets.length > 0 ? (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">⚠️</div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Property Unavailable</h1>
              <p className="text-sm text-slate-500">This property is no longer available in our system.</p>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Your previous maintenance requests ({historicalTickets.length})
            </p>
            <div className="space-y-3 mb-6">
              {historicalTickets.map(t => (
                <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span>✅</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {t.tenant_raw_text.length > 50 ? t.tenant_raw_text.slice(0, 50) + "…" : t.tenant_raw_text} — Closed
                    </span>
                  </div>
                  {t.closed_at && (
                    <p className="text-xs text-slate-400 pl-6">
                      Completed: {formatDate(t.closed_at)}{t.final_cost != null ? ` · $${t.final_cost.toFixed(2)}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mb-1">ℹ️ These are read-only records. New requests cannot be submitted.</p>
            <p className="text-xs text-slate-400 text-center">Please contact your landlord for a new reporting link if needed.</p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-5xl mb-4">🏠❌</div>
            <h1 className="text-xl font-bold text-slate-900 mb-3">Property Not Found</h1>
            <p className="text-sm text-slate-500 mb-5">This property link is no longer active.</p>
            <div className="text-left bg-white border border-gray-100 rounded-xl p-5 mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">Possible reasons:</p>
              <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                <li>The landlord has removed this property</li>
                <li>The link may have been changed</li>
                <li>The link was entered incorrectly</li>
              </ul>
            </div>
            <p className="text-sm text-slate-500">Please contact your landlord directly for assistance.</p>
          </div>
        )}
      </div>
    </div>
  );
}
