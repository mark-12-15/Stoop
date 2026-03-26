import Link from "next/link";
import type { UserState } from "@/types/user";
import HeroDashboardMockup from "./HeroDashboardMockup";

export default function Hero({ user }: { user: UserState }) {
  const isPro =
    user.isLoggedIn &&
    (user.subscriptionPlan === "monthly" || user.subscriptionPlan === "annual");

  return (
    <section className="bg-gradient-to-b from-blue-50 to-white border-b border-gray-100 py-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 items-center">
        {/* Left: Text + CTA */}
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 uppercase tracking-wide">
            <span>🏠</span>
            <span>Built for US Landlords</span>
          </div>

          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.15] mb-7 bg-gradient-to-br from-blue-800 to-blue-500 bg-clip-text text-transparent">
            <span className="block">Manage Repairs &amp; Receipts</span>
            <span className="block">Without the Headache.</span>
          </h1>

          <p className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
            Tenants submit repair requests. You track costs, attach receipts,
            and export a{" "}
            <strong className="text-slate-800 font-semibold">
              Schedule E–ready spreadsheet
            </strong>{" "}
            at tax time — no spreadsheet wrangling required.
          </p>

          {user.isLoggedIn ? (
            <div className="flex flex-col gap-3 items-start">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Go to Dashboard →
              </Link>
              <p className="text-sm text-slate-400">
                ✓ Currently on {isPro ? "Pro" : "Free"} plan
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-start">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-xl text-lg font-semibold shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Start for Free
              </Link>
              <p className="text-sm text-slate-400">
                ✓ 3 free tickets &nbsp;·&nbsp; ✓ No credit card &nbsp;·&nbsp; ✓ Cancel anytime
              </p>
            </div>
          )}
        </div>

        {/* Right: Dashboard mockup with glow blob */}
        <div className="hidden md:flex justify-center items-center py-8 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <HeroDashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
