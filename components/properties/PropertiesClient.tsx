"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStats = { total: number; active: number; closed: number };

export type Property = {
  id: string;
  address: string;
  unit_number: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  slug: string;
  notes: string | null;
  created_at: string;
  status: "active" | "frozen" | "inactive";
  ticket_stats: TicketStats;
};

type FormValues = {
  address: string;
  unit_number: string;
  city: string;
  state: string;
  zip_code: string;
  notes: string;
};

type ActiveModal =
  | null
  | "create"
  | { type: "edit"; property: Property }
  | { type: "delete-confirm"; property: Property }
  | { type: "delete-blocked"; property: Property; activeCount: number }
  | { type: "upgrade-required" };

const EMPTY_FORM: FormValues = {
  address: "", unit_number: "", city: "", state: "", zip_code: "", notes: "",
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, kind, onDone }: { message: string; kind: "success" | "error"; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium transition-all
      ${kind === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
      <span>{kind === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

// ─── Property Form Modal ──────────────────────────────────────────────────────

function Field({
  label, name, placeholder, required, textarea, value, error, onChange,
}: {
  label: string;
  name: keyof FormValues;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? "border-red-400" : "border-gray-200"}`}
        />
      )}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function PropertyFormModal({
  mode,
  initial,
  onSubmit,
  onClose,
}: {
  mode: "create" | "edit";
  initial?: Partial<FormValues>;
  onSubmit: (values: FormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormValues>({ ...EMPTY_FORM, ...initial });
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<FormValues> = {};
    if (!form.address.trim())   e.address  = "Required";
    if (!form.city.trim())      e.city     = "Required";
    if (!form.state.trim())     e.state    = "Required";
    if (!form.zip_code.trim())  e.zip_code = "Required";
    else if (!/^\d{5}$/.test(form.zip_code)) e.zip_code = "Must be 5 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try { await onSubmit(form); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-slate-900">
            {mode === "create" ? "Add New Property" : "Edit Property"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <Field label="Property Address" name="address" placeholder="123 Main St" required value={form.address} error={errors.address} onChange={set("address")} />
          <Field label="Unit Number (Optional)" name="unit_number" placeholder="Apt 2B" value={form.unit_number} onChange={set("unit_number")} />
          <Field label="City" name="city" placeholder="San Francisco" required value={form.city} error={errors.city} onChange={set("city")} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="State" name="state" placeholder="CA" required value={form.state} error={errors.state} onChange={set("state")} />
            <Field label="ZIP Code" name="zip_code" placeholder="94102" required value={form.zip_code} error={errors.zip_code} onChange={set("zip_code")} />
          </div>
          <Field label="Notes (Optional)" name="notes" placeholder="2BR/1BA, built 2010..." textarea value={form.notes} onChange={set("notes")} />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {loading ? "Saving…" : mode === "create" ? "Create Property" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  property,
  onConfirm,
  onClose,
  loading,
}: {
  property: Property;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  const label = [property.address, property.unit_number].filter(Boolean).join(", ");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Delete Property</h2>
        <p className="text-sm text-slate-600 mb-2">⚠️ Are you sure you want to delete</p>
        <p className="text-sm font-semibold text-slate-800 mb-4">"{label}"?</p>
        <ul className="text-sm text-slate-500 space-y-1 mb-4 list-disc list-inside">
          <li>Property information</li>
          <li>Tenant report link</li>
          {property.ticket_stats.total > 0 && <li>{property.ticket_stats.total} ticket{property.ticket_stats.total !== 1 ? "s" : ""}</li>}
        </ul>
        <p className="text-xs text-slate-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            {loading ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Blocked Modal ─────────────────────────────────────────────────────

function DeleteBlockedModal({
  property,
  activeCount,
  onViewTickets,
  onClose,
}: {
  property: Property;
  activeCount: number;
  onViewTickets: () => void;
  onClose: () => void;
}) {
  const label = [property.address, property.unit_number].filter(Boolean).join(", ");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Cannot Delete Property</h2>
        <p className="text-sm text-slate-600 mb-2">
          ⚠️ This property has <strong>{activeCount}</strong> active ticket{activeCount !== 1 ? "s" : ""}.
        </p>
        <p className="text-sm font-semibold text-slate-800 mb-4">"{label}"</p>
        <p className="text-sm text-slate-500 mb-6">
          Please close or archive all active tickets before deleting this property.
        </p>
        <div className="flex gap-3">
          <button onClick={onViewTickets}
            className="flex-1 border border-blue-600 text-blue-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">
            View Active Tickets
          </button>
          <button onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upgrade Required Modal ───────────────────────────────────────────────────

function UpgradeRequiredModal({ onClose, maxProperties }: { onClose: () => void; maxProperties: number }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7">
        <h2 className="text-lg font-bold text-slate-900 mb-3">Upgrade Required</h2>
        <p className="text-sm text-slate-600 mb-6">
          Free plan allows up to <strong>{maxProperties}</strong> properties. Upgrade to Pro for unlimited properties.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 text-slate-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Link href="/pricing"
            className="flex-1 text-center bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
            View Plans
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Copy Link Button ─────────────────────────────────────────────────────────

function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const link = `${window.location.origin}/r/${slug}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
      {copied ? (
        <><span className="text-emerald-600">✓</span><span className="text-emerald-600">Copied!</span></>
      ) : (
        <><span>📋</span>Copy Link</>
      )}
    </button>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────

function PropertyCard({
  property,
  onEdit,
  onDelete,
  onActivate,
  onPause,
  isActivateDisabled,
}: {
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
  onPause: () => void;
  isActivateDisabled: boolean;
}) {
  const title = [property.address, property.unit_number].filter(Boolean).join(", ");
  const location = [property.city, property.state, property.zip_code].filter(Boolean).join(", ");
  const frozen = property.status === "frozen";

  return (
    <div className={`bg-white rounded-xl border p-6 transition-opacity ${
      frozen ? "border-gray-200 opacity-75" : "border-gray-200"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{frozen ? "🔒" : "🏠"}</span>
            <h3 className="font-semibold text-slate-900">{title}</h3>
            {frozen && (
              <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                Paused
              </span>
            )}
          </div>
          {location && <p className="text-sm text-slate-400 mt-0.5 ml-7">{location}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {frozen ? (
            <button onClick={onActivate} disabled={isActivateDisabled}
              title={isActivateDisabled ? "Pause an active property first to activate this one." : undefined}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                isActivateDisabled
                  ? "bg-gray-50 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 shadow-sm"
              }`}>
              Activate
            </button>
          ) : (
            <>
              <button onClick={onEdit}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-colors">
                Edit
              </button>
              <button onClick={onPause}
                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 rounded-lg transition-colors">
                Pause
              </button>
            </>
          )}
          <button onClick={onDelete}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-600 rounded-lg transition-colors">
            Delete
          </button>
        </div>
      </div>

      {/* Tenant link */}
      <div className={`rounded-lg px-4 py-3 mb-4 ${frozen ? "bg-gray-50" : "bg-slate-50"}`}>
        <p className="text-xs font-medium text-slate-500 mb-1">Tenant Link</p>
        {frozen ? (
          <p className="text-xs text-gray-500">Unavailable — property is paused</p>
        ) : (
          <>
            <p className="text-xs text-slate-600 font-mono truncate mb-1.5">
              {typeof window !== "undefined" ? window.location.host : "stoopkeep.com"}/r/{property.slug}
            </p>
            <CopyLinkButton slug={property.slug} />
          </>
        )}
      </div>

      {/* Stats + View Tickets */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          📊 {property.ticket_stats.total} total ticket{property.ticket_stats.total !== 1 ? "s" : ""}
          {property.ticket_stats.active > 0 && (
            <span className="text-amber-600 font-medium"> · {property.ticket_stats.active} active</span>
          )}
        </p>
        <Link href={`/tickets?property=${property.id}`}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
          View Tickets →
        </Link>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-24 text-center">
      <div className="text-4xl mb-4">🏠</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Properties Yet</h2>
      <p className="text-sm text-gray-500 mb-8">Add your first property to start tracking maintenance tickets.</p>
      <button onClick={onAdd}
        className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors">
        + Add Property
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertiesClient({
  properties,
  isPro,
  maxProperties,
  autoOpen,
}: {
  properties: Property[];
  isPro: boolean;
  maxProperties: number;
  autoOpen?: boolean;
}) {
  const router = useRouter();
  const [modal, setModal] = useState<ActiveModal>(autoOpen ? "create" : null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const toastKey = useRef(0);

  const activeProperties = properties.filter((p) => p.status === "active");
  const frozenProperties = properties.filter((p) => p.status === "frozen");

  const showToast = (message: string, kind: "success" | "error" = "success") => {
    toastKey.current++;
    setToast({ message, kind });
  };

  const closeModal = () => setModal(null);

  const handleAddClick = () => {
    if (!isPro && activeProperties.length >= maxProperties) {
      setModal({ type: "upgrade-required" });
    } else {
      setModal("create");
    }
  };

  const handleCreate = async (values: FormValues) => {
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const { error } = await res.json();
      showToast(error ?? "Failed to create property", "error");
      return;
    }
    closeModal();
    showToast("Property created successfully!");
    router.refresh();
  };

  const handleEdit = async (values: FormValues) => {
    const property = (modal as { type: "edit"; property: Property }).property;
    const res = await fetch(`/api/properties/${property.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const { error } = await res.json();
      showToast(error ?? "Failed to update property", "error");
      return;
    }
    closeModal();
    showToast("Property updated successfully!");
    router.refresh();
  };

  const handleDeleteClick = (property: Property) => {
    setModal({ type: "delete-confirm", property });
  };

  const handleDeleteConfirm = async () => {
    const property = (modal as { type: "delete-confirm"; property: Property }).property;
    setActionLoading(true);
    const res = await fetch(`/api/properties/${property.id}`, { method: "DELETE" });
    setActionLoading(false);

    if (res.status === 409) {
      const { active_ticket_count } = await res.json();
      setModal({ type: "delete-blocked", property, activeCount: active_ticket_count });
      return;
    }
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
      showToast(error ?? "Failed to delete property", "error");
      closeModal();
      return;
    }
    closeModal();
    showToast("Property deleted successfully");
    router.refresh();
  };

  const handleActivate = async (property: Property) => {
    setActionLoading(true);
    const res = await fetch(`/api/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "active" }),
    });
    setActionLoading(false);
    if (!res.ok) { showToast("Failed to activate property", "error"); return; }
    showToast("Property activated.");
    router.refresh();
  };

  const handlePause = async (property: Property) => {
    setActionLoading(true);
    const res = await fetch(`/api/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "frozen" }),
    });
    setActionLoading(false);
    if (!res.ok) { showToast("Failed to pause property", "error"); return; }
    showToast("Property paused.");
    router.refresh();
  };

  return (
    <>
      {/* Toast */}
      {toast && (
        <Toast
          key={toastKey.current}
          message={toast.message}
          kind={toast.kind}
          onDone={() => setToast(null)}
        />
      )}

      {/* Modals */}
      {modal === "create" && (
        <PropertyFormModal mode="create" onSubmit={handleCreate} onClose={closeModal} />
      )}
      {modal !== null && typeof modal === "object" && modal.type === "edit" && (
        <PropertyFormModal
          mode="edit"
          initial={{
            address:     modal.property.address,
            unit_number: modal.property.unit_number ?? "",
            city:        modal.property.city ?? "",
            state:       modal.property.state ?? "",
            zip_code:    modal.property.zip_code ?? "",
            notes:       modal.property.notes ?? "",
          }}
          onSubmit={handleEdit}
          onClose={closeModal}
        />
      )}
      {modal !== null && typeof modal === "object" && modal.type === "delete-confirm" && (
        <DeleteConfirmModal
          property={modal.property}
          onConfirm={handleDeleteConfirm}
          onClose={closeModal}
          loading={actionLoading}
        />
      )}
      {modal !== null && typeof modal === "object" && modal.type === "delete-blocked" && (
        <DeleteBlockedModal
          property={modal.property}
          activeCount={modal.activeCount}
          onViewTickets={() => {
            router.push(`/tickets?property=${modal.property.id}&filter=todo`);
            closeModal();
          }}
          onClose={closeModal}
        />
      )}
      {modal !== null && typeof modal === "object" && modal.type === "upgrade-required" && (
        <UpgradeRequiredModal onClose={closeModal} maxProperties={maxProperties} />
      )}

      {/* Page content */}
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your rental properties</p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
            >
              + Add Property
            </button>
          </div>

          {/* Free plan warning banner */}
          {!isPro && frozenProperties.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 justify-between">
              <p className="text-sm text-amber-800">
                ⚠️ You have reached the Free plan limit of {maxProperties} active properties. Excess properties have been paused.
              </p>
              <Link href="/pricing"
                className="shrink-0 sm:ml-4 text-sm font-semibold text-amber-700 hover:text-amber-900 hover:underline transition-colors whitespace-nowrap">
                Upgrade to Pro to unlock all →
              </Link>
            </div>
          )}

          {/* List or empty state */}
          {properties.length === 0 ? (
            <EmptyState onAdd={handleAddClick} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  onEdit={() => setModal({ type: "edit", property: p })}
                  onDelete={() => handleDeleteClick(p)}
                  onActivate={() => handleActivate(p)}
                  onPause={() => handlePause(p)}
                  isActivateDisabled={activeProperties.length >= maxProperties}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
