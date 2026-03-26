"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export type Property = {
  id: string;
  address: string;
  unit_number: string | null;
};

const EXPENSE_CATEGORIES: { value: string; label: string }[] = [
  { value: "repair_maintenance", label: "Repair & Maintenance" },
  { value: "cleaning", label: "Cleaning" },
  { value: "utilities", label: "Utilities" },
  { value: "insurance", label: "Insurance" },
  { value: "property_tax", label: "Property Tax" },
  { value: "mortgage_interest", label: "Mortgage Interest" },
  { value: "management_fees", label: "Management Fees" },
  { value: "hoa_fees", label: "HOA Fees" },
  { value: "legal_professional", label: "Legal & Professional" },
  { value: "advertising", label: "Advertising" },
  { value: "supplies", label: "Supplies" },
  { value: "travel_auto", label: "Travel & Auto" },
  { value: "other", label: "Other" },
];

type Props = {
  properties: Property[];
};

export default function LogExpenseForm({ properties }: Props) {
  const router = useRouter();
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    property_id: properties[0]?.id ?? "",
    description: "",
    expense_category: "repair_maintenance",
    closed_at: today,
    final_cost: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/landlord/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          final_cost: form.final_cost ? parseFloat(form.final_cost) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Property */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Property <span className="text-red-500">*</span>
        </label>
        <select
          name="property_id"
          value={form.property_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}{p.unit_number ? ` · ${p.unit_number}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={3}
          placeholder="e.g. Replaced kitchen faucet, fixed leaking pipe under sink"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Expense Category */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Expense Category
        </label>
        <select
          name="expense_category"
          value={form.expense_category}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date + Amount */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="closed_at"
            value={form.closed_at}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Amount ($)
          </label>
          <input
            type="number"
            name="final_cost"
            value={form.final_cost}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="0.00"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Saving…" : "Save Expense"}
        </button>
        <Link
          href="/dashboard"
          className="flex-1 text-center bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
