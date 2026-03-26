"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { UserState } from "@/types/user";

// ─── Feature data ────────────────────────────────────────────────────────────

type Feature = { label: string; included: boolean; note?: string };
type Section = { heading: string; features: Feature[] };

const freeSections: Section[] = [
  {
    heading: "Tenant Submissions",
    features: [
      { label: "3 tenant tickets with AI analysis", included: true },
      { label: "AI receipt OCR", included: true },
    ],
  },
  {
    heading: "Manual Import",
    features: [
      { label: "Unlimited manual data entry", included: true },
      { label: "CSV bulk import", included: true },
    ],
  },
  {
    heading: "Properties",
    features: [
      { label: "3 properties max", included: true },
      { label: "Tenant report links", included: true },
    ],
  },
  {
    heading: "Tax Reports",
    features: [
      { label: "3-ticket export limit", included: false, note: "Schedule E & Last 3 Years" },
    ],
  },
  {
    heading: "Storage",
    features: [
      { label: "20 MB per ticket", included: true },
      { label: "100 MB total", included: true },
    ],
  },
];

const proSections: Section[] = [
  {
    heading: "Tenant Submissions",
    features: [
      { label: "Unlimited tickets with AI analysis", included: true },
      { label: "AI receipt OCR", included: true },
    ],
  },
  {
    heading: "Manual Import",
    features: [
      { label: "Unlimited manual data entry", included: true },
      { label: "CSV bulk import", included: true },
    ],
  },
  {
    heading: "Properties",
    features: [
      { label: "Unlimited properties", included: true },
      { label: "Tenant report links", included: true },
    ],
  },
  {
    heading: "Tax Reports",
    features: [
      { label: "Unlimited export", included: true, note: "Schedule E & Last 3 Years" },
    ],
  },
  {
    heading: "Storage",
    features: [
      { label: "50 MB per ticket", included: true },
      { label: "5 GB total", included: true },
    ],
  },
  {
    heading: "Priority Support",
    features: [
      { label: "Email support", included: true },
      { label: "24h response time", included: true },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureRow({ feature }: { feature: Feature }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {feature.included ? (
        <span className="text-emerald-500 font-bold mt-0.5 shrink-0">✓</span>
      ) : (
        <span className="text-amber-500 font-bold mt-0.5 shrink-0">⚠</span>
      )}
      <span className={feature.included ? "text-slate-700" : "text-slate-500"}>
        {feature.label}
        {feature.note && (
          <span className="block text-xs text-slate-400 mt-0.5">{feature.note}</span>
        )}
      </span>
    </li>
  );
}

function FeatureSections({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-5">
      {sections.map((sec) => (
        <div key={sec.heading}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            {sec.heading}
          </p>
          <ul className="space-y-2">
            {sec.features.map((f) => (
              <FeatureRow key={f.label} feature={f} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

function UpgradeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [interval, setInterval] = useState<"year" | "month">("year");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/mock/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upgrade failed");
      router.push("/dashboard?upgraded=true");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Choose Your Plan</h2>
        <p className="text-sm text-slate-500 mb-6">Upgrade to Pro and unlock everything.</p>

        <div className="space-y-3 mb-6">
          {/* Yearly */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              interval === "year" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="interval"
              value="year"
              checked={interval === "year"}
              onChange={() => setInterval("year")}
              className="mt-1 accent-blue-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">Yearly — $99 / year</span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Save $45
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Best value · $8.25 / month</p>
            </div>
          </label>

          {/* Monthly */}
          <label
            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              interval === "month" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="interval"
              value="month"
              checked={interval === "month"}
              onChange={() => setInterval("month")}
              className="mt-1 accent-blue-600"
            />
            <div>
              <span className="font-semibold text-slate-900">Monthly — $12 / month</span>
              <p className="text-xs text-slate-500 mt-0.5">Billed monthly · Cancel anytime</p>
            </div>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4">{error}</p>
        )}

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? "Processing…" : "Upgrade Now →"}
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Demo mode — no real payment is processed
        </p>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PricingPageClient({ user }: { user: UserState }) {
  const [billingInterval, setBillingInterval] = useState<"year" | "month">("year");
  const [showModal, setShowModal] = useState(false);

  const isPro =
    user.isLoggedIn &&
    (user.subscriptionPlan === "monthly" || user.subscriptionPlan === "annual");
  const isFreeLoggedIn = user.isLoggedIn && user.subscriptionPlan === "free";

  const proMonthlyPrice = billingInterval === "year" ? "$8.25" : "$12";
  const proBillingNote =
    billingInterval === "year" ? "Billed annually at $99" : "Billed monthly";

  return (
    <>
      {showModal && <UpgradeModal onClose={() => setShowModal(false)} />}

      <main className="bg-slate-50 min-h-screen py-16 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Simple Pricing for Landlords
            </h1>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Track maintenance, maximize tax deductions. Start free, upgrade when you&apos;re ready.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 mt-8 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setBillingInterval("year")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  billingInterval === "year"
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Yearly
              </button>
              <button
                onClick={() => setBillingInterval("month")}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  billingInterval === "month"
                    ? "bg-blue-700 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Monthly
              </button>
              {billingInterval === "year" && (
                <span className="ml-1 mr-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  Save $45
                </span>
              )}
            </div>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            {/* FREE */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Free</p>
              <div className="flex items-start gap-0.5 mb-1">
                <span className="text-xl font-bold text-slate-900 mt-2">$</span>
                <span className="text-6xl font-extrabold text-slate-900 leading-none">0</span>
              </div>
              <p className="text-sm text-slate-400 mb-8">Perfect to try</p>

              <FeatureSections sections={freeSections} />

              <div className="mt-auto pt-8">
                {!user.isLoggedIn && (
                  <Link
                    href="/login"
                    className="block text-center border-2 border-slate-300 text-slate-600 px-4 py-3 rounded-xl text-sm font-semibold hover:border-slate-400 transition-colors"
                  >
                    Get Started Free
                  </Link>
                )}
                {isFreeLoggedIn && (
                  <button disabled className="w-full bg-gray-100 text-gray-400 px-4 py-3 rounded-xl text-sm font-semibold cursor-not-allowed">
                    Current Plan
                  </button>
                )}
                {isPro && (
                  <button disabled className="w-full bg-gray-100 text-gray-400 px-4 py-3 rounded-xl text-sm font-semibold cursor-not-allowed">
                    Included in Pro
                  </button>
                )}
              </div>
            </div>

            {/* PRO */}
            <div
              className={`bg-white rounded-2xl border-2 relative shadow-xl shadow-blue-900/10 p-8 flex flex-col ${
                isPro ? "border-emerald-400" : "border-blue-600"
              }`}
            >
              {!isPro && (
                <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                Pro ⭐
              </p>
              <div className="flex items-start gap-0.5 mb-1">
                <span className="text-xl font-bold text-slate-900 mt-2">$</span>
                <span className="text-6xl font-extrabold text-slate-900 leading-none">
                  {proMonthlyPrice.replace("$", "")}
                </span>
                <span className="text-base text-gray-400 self-end mb-1.5">/mo</span>
              </div>
              <div className="flex items-center gap-2 mb-8">
                <p className="text-sm text-slate-400">{proBillingNote}</p>
                {billingInterval === "year" && (
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                    Save $45
                  </span>
                )}
              </div>

              <FeatureSections sections={proSections} />

              <div className="mt-auto pt-8">
                {!user.isLoggedIn && (
                  <Link
                    href="/login"
                    className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-600/20"
                  >
                    Get Started
                  </Link>
                )}
                {isFreeLoggedIn && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-colors shadow-md shadow-blue-600/20"
                  >
                    Upgrade to Pro →
                  </button>
                )}
                {isPro && (
                  <button disabled className="w-full bg-gray-100 text-gray-400 px-4 py-3 rounded-xl text-sm font-semibold cursor-not-allowed">
                    Current Plan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ROI + trust signals */}
          <div className="mt-12 text-center space-y-3">
            <p className="text-slate-600 text-sm">
              💡 <strong>ROI Example:</strong> 50 repairs × $200 avg = $10,000 in deductions. Pro costs $99/year.
            </p>
            <p className="text-slate-400 text-xs">
              🔒 Secure payment by Lemon Squeezy &nbsp;·&nbsp; ♻️ Cancel anytime, no questions asked
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
