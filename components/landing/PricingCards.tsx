import Link from "next/link";
import type { UserState } from "@/types/user";

const freeFeatures = [
  "3 repair tickets to try",
  "AI photo analysis & categorization",
  "Tenant portal link (no account needed)",
  "Up to 5 photos per ticket",
  "Up to 3 properties",
  "Email notifications",
];

const proFeatures = [
  "Unlimited repair tickets",
  "Everything in Free",
  "Schedule E CSV / Excel export",
  "Up to 20 properties",
  "AI receipt OCR (auto-extract costs)",
  "Priority email support",
];

function Check() {
  return <span className="text-emerald-500 font-bold mr-2 shrink-0">✓</span>;
}

export default function PricingCards({ user }: { user: UserState }) {
  const isPro =
    user.isLoggedIn &&
    (user.subscriptionPlan === "monthly" || user.subscriptionPlan === "annual");
  const isFree = user.isLoggedIn && user.subscriptionPlan === "free";

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Simple, Honest Pricing
          </h2>
          <p className="text-slate-500">
            Start free. Upgrade when you&apos;re ready. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          {/* Free */}
          <div className={`rounded-2xl p-7 border-2 flex flex-col ${isFree ? "border-emerald-400 bg-emerald-50" : "border-gray-200"}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Free
            </p>
            <div className="flex items-start gap-0.5 mb-1">
              <span className="text-xl font-bold text-slate-900 mt-2">$</span>
              <span className="text-6xl font-extrabold text-slate-900 leading-none">0</span>
            </div>
            <p className="text-sm text-slate-400 mb-6">Try before you commit</p>
            <ul className="space-y-2.5 mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex text-sm text-slate-700">
                  <Check />{f}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {!user.isLoggedIn && (
                <Link
                  href="/login"
                  className="block text-center border-2 border-slate-300 text-slate-600 px-4 py-3 rounded-xl text-sm font-semibold hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Get Started Free
                </Link>
              )}
              {isFree && (
                <p className="text-sm text-emerald-600 font-semibold">
                  ✓ Your current plan
                </p>
              )}
            </div>
          </div>

          {/* Pro */}
          <div
            className={`rounded-2xl p-7 border-2 relative shadow-xl shadow-blue-900/10 flex flex-col ${
              isPro ? "border-emerald-400 bg-emerald-50" : "border-blue-600"
            }`}
          >
            <div className="absolute -top-[14px] left-1/2 -translate-x-1/2">
              <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
              Pro
            </p>
            {/* Price: show annual effective rate */}
            <div className="flex items-start gap-0.5 mb-1">
              <span className="text-xl font-bold text-slate-900 mt-2">$</span>
              <span className="text-6xl font-extrabold text-slate-900 leading-none">8.25</span>
              <span className="text-base text-gray-400 self-end mb-1.5">/mo</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <p className="text-sm text-slate-400">
                Billed annually at{" "}
                <strong className="text-slate-700">$99</strong>
              </p>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                Save $45
              </span>
            </div>
            <ul className="space-y-2.5 mb-8">
              {proFeatures.map((f) => (
                <li key={f} className="flex text-sm text-slate-700">
                  <Check />{f}
                </li>
              ))}
            </ul>
            <div className="mt-auto">
              {!user.isLoggedIn && (
                <Link
                  href="/pricing"
                  className="block text-center bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                >
                  Start Pro Trial
                </Link>
              )}
              {isFree && (
                <Link
                  href="/pricing"
                  className="block text-center bg-emerald-600 text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                >
                  Upgrade to Pro
                </Link>
              )}
              {isPro && (
                <p className="text-sm text-emerald-600 font-semibold">
                  ✓ Your current plan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
