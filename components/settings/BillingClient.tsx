"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Plan = "free" | "monthly" | "annual";

type Props = {
  plan: Plan;
  status: string;
  endDate: string | null;
  propertiesCount: number;
  tenantTicketsCount: number;
  maxProperties: number;
};

function CancelModal({
  endDate,
  loading,
  onConfirm,
  onClose,
}: {
  endDate: string | null;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const until = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "your billing period end";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        <h2 className="text-xl font-bold text-slate-900 mb-5">Cancel Subscription</h2>
        <p className="text-sm text-slate-600 mb-4">Are you sure you want to cancel?</p>
        <ul className="text-sm text-slate-600 space-y-2 mb-5">
          <li>• Your Pro features remain active until <strong>{until}</strong></li>
          <li>• After that, you&apos;ll revert to the Free plan</li>
          <li>• You&apos;ll lose access to full exports</li>
          <li>• Unlimited properties will be locked</li>
        </ul>
        <p className="text-sm text-slate-500 mb-6">💡 You can reactivate anytime.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Keep Pro
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-60 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            {loading ? "Canceling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BillingClient({
  plan,
  status,
  endDate,
  propertiesCount,
  tenantTicketsCount,
  maxProperties,
}: Props) {
  const router = useRouter();
  const [localPlan, setLocalPlan] = useState<Plan>(plan);
  const [showCancel, setShowCancel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  const isPro = localPlan === "monthly" || localPlan === "annual";
  const billingCycle = localPlan === "annual" ? "Yearly ($99/year)" : localPlan === "monthly" ? "Monthly ($12/month)" : null;
  const nextBilling = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mock/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Cancel failed");
      setShowCancel(false);
      setLocalPlan("free");
      router.refresh();
      showToast("Subscription canceled successfully.");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg text-sm font-medium bg-emerald-600 text-white">
          <span>✓</span>
          {toast}
        </div>
      )}

      {showCancel && (
        <CancelModal
          endDate={endDate}
          loading={loading}
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Breadcrumb */}
        <div className="text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-700 transition-colors">Settings</Link>
          <span className="mx-2">›</span>
          <span className="text-slate-800 font-medium">Billing &amp; Subscription</span>
        </div>

        {/* Plan card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">
              Current Plan: {isPro ? "Pro ⭐" : "Free"}
            </h2>
            {isPro && status === "active" && (
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                Active
              </span>
            )}
          </div>

          {isPro ? (
            <>
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <p><span className="text-slate-400 w-36 inline-block">Billing Cycle</span>{billingCycle}</p>
                {nextBilling && (
                  <p><span className="text-slate-400 w-36 inline-block">Next billing date</span>{nextBilling}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert("Demo mode — Lemon Squeezy portal not connected."); }}
                  className="flex-1 text-center border border-gray-200 text-slate-600 hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Manage on Lemon Squeezy →
                </a>
                <button
                  onClick={() => setShowCancel(true)}
                  className="flex-1 text-center text-gray-500 hover:text-red-600 bg-transparent border-none py-2.5 text-sm transition-colors"
                >
                  Cancel Subscription
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-5">
                You&apos;re on the Free plan. Upgrade to Pro for unlimited properties, tickets, and exports.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Upgrade to Pro →
              </Link>
            </>
          )}
        </div>

        {/* Usage summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-slate-900 mb-5">Usage Summary</h2>
          <div className="space-y-3 text-sm">
            <UsageRow
              label="Tenant submissions"
              value={tenantTicketsCount}
              limit={isPro ? null : 3}
              unlimited={isPro}
            />
            <UsageRow
              label="Properties"
              value={propertiesCount}
              limit={isPro ? null : maxProperties}
              unlimited={isPro}
              warningText={
                !isPro && propertiesCount > maxProperties
                  ? `⚠️ ${propertiesCount - maxProperties} ${propertiesCount - maxProperties === 1 ? "property is" : "properties are"} currently read-only. Upgrade to Pro to unlock them.`
                  : undefined
              }
            />
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-slate-500">Storage used</span>
              <span className="text-slate-400 text-xs italic">Not tracked yet</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function UsageRow({
  label,
  value,
  limit,
  unlimited,
  warningText,
}: {
  label: string;
  value: number;
  limit: number | null;
  unlimited: boolean;
  warningText?: string;
}) {
  const isOverQuota = limit !== null && value > limit;

  return (
    <div className="py-2 border-t border-gray-100 first:border-0">
      <div className="flex items-center justify-between">
        <span className="text-slate-500">{label}</span>
        <span className={`font-medium ${isOverQuota ? "text-red-600 font-semibold" : "text-slate-800"}`}>
          {value}
          {unlimited ? (
            <span className="ml-1 text-gray-400 font-normal">/ ∞</span>
          ) : limit !== null ? (
            <span className="ml-1 text-slate-400 font-normal">/ {limit}</span>
          ) : null}
        </span>
      </div>
      {isOverQuota && warningText && (
        <p className="text-xs text-orange-600 mt-1">{warningText}</p>
      )}
    </div>
  );
}
