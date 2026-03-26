"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Props = {
  taxYear: number;
  ticketCount: number;
  missingCount: number;
  hasTickets: boolean;
};

type BannerState = "full" | "chip" | "orange" | "hidden";

export default function TaxSeasonBanner({ taxYear, ticketCount, missingCount, hasTickets }: Props) {
  const filedKey = `tax-banner-filed-${taxYear}`;
  const snoozeKey = `tax-banner-snooze-${taxYear}`;

  // Start hidden to avoid SSR flash; computed in useEffect
  const [bannerState, setBannerState] = useState<BannerState>("hidden");
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    const filed = localStorage.getItem(filedKey) === "1";
    if (filed) {
      setBannerState("hidden");
      return;
    }

    // April (month 3): forced orange resurface, snooze is overridden
    const isApril = new Date().getMonth() === 3;
    if (isApril) {
      setBannerState("orange");
      return;
    }

    const snoozeUntilStr = localStorage.getItem(snoozeKey);
    if (snoozeUntilStr) {
      const snoozeUntil = new Date(snoozeUntilStr);
      if (new Date() < snoozeUntil) {
        setBannerState("chip");
        return;
      }
    }

    setBannerState("full");
  }, [filedKey, snoozeKey]);

  const handleSnooze = () => {
    const fourWeeksLater = new Date();
    fourWeeksLater.setDate(fourWeeksLater.getDate() + 28);
    localStorage.setItem(snoozeKey, fourWeeksLater.toISOString());
    setBannerState("chip");
    setShowSheet(false);
  };

  const handleFiled = () => {
    localStorage.setItem(filedKey, "1");
    setBannerState("hidden");
    setShowSheet(false);
  };

  if (bannerState === "hidden") return null;

  // Chip: snoozed state — small inline reminder
  if (bannerState === "chip") {
    return (
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <span>📄</span>
        <span>{taxYear} tax reminder snoozed.</span>
        <button
          onClick={() => setBannerState("full")}
          className="text-blue-500 hover:text-blue-700 underline transition-colors"
        >
          View
        </button>
      </div>
    );
  }

  const isOrange = bannerState === "orange";
  const c = isOrange
    ? {
        wrapper: "bg-orange-50 border-orange-200",
        title: "text-orange-900",
        body: "text-orange-800",
        sub: "text-orange-700",
        hint: "text-orange-600",
        btn: "bg-orange-600 hover:bg-orange-700",
        dotsBtn: "text-orange-400 hover:text-orange-600",
        linkBtn: "text-orange-700 hover:text-orange-900",
      }
    : {
        wrapper: "bg-amber-50 border-amber-200",
        title: "text-amber-900",
        body: "text-amber-800",
        sub: "text-amber-700",
        hint: "text-amber-600",
        btn: "bg-amber-600 hover:bg-amber-700",
        dotsBtn: "text-amber-400 hover:text-amber-600",
        linkBtn: "text-amber-700 hover:text-amber-900",
      };

  return (
    <div className={`relative border rounded-xl p-4 mb-6 ${c.wrapper}`}>

      {/* Dismiss Action Sheet */}
      {showSheet && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSheet(false)}
          />
          <div className="absolute right-4 top-10 z-50 bg-white rounded-xl shadow-lg border border-slate-200 min-w-[260px] overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 px-4 pt-3 pb-1.5 uppercase tracking-wide">
              Remind me later?
            </p>
            <button
              onClick={handleSnooze}
              className="w-full text-left text-sm px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
            >
              <span>🔔</span>
              <span>Remind me in 4 weeks</span>
            </button>
            <button
              onClick={handleFiled}
              className="w-full text-left text-sm px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5"
            >
              <span>✅</span>
              <span>I&apos;ve already filed my {taxYear} taxes</span>
            </button>
            <div className="border-t border-slate-100">
              <button
                onClick={() => setShowSheet(false)}
                className="w-full text-left text-sm px-4 py-2.5 hover:bg-slate-50 text-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">📄</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold mb-1 ${c.title}`}>
            {isOrange
              ? "⚠️ Tax deadline is approaching — April 15"
              : "Tax Season Reminder"}
          </p>

          {hasTickets ? (
            <>
              <p className={`text-sm ${c.body}`}>
                You&apos;re filing {taxYear} taxes. You have{" "}
                <strong>{ticketCount} ticket{ticketCount !== 1 ? "s" : ""}</strong>{" "}
                from {taxYear}.
              </p>
              {missingCount > 0 && (
                <p className={`text-sm mt-1 ${c.sub}`}>
                  ⚠️ {missingCount} ticket{missingCount !== 1 ? "s" : ""} are missing receipts.
                </p>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                <Link
                  href={`/tickets?year=${taxYear}&status=closed`}
                  className={`text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}
                >
                  Export {taxYear} Schedule E
                </Link>
                {missingCount > 0 && (
                  <Link
                    href="/tickets?filter=pending_receipt"
                    className={`text-xs font-semibold self-center transition-colors ${c.linkBtn}`}
                  >
                    Add Receipts →
                  </Link>
                )}
              </div>
            </>
          ) : (
            <>
              <p className={`text-sm ${c.body}`}>
                You&apos;re filing {taxYear} taxes.
              </p>
              <p className={`text-sm mt-1 ${c.sub}`}>
                ⚠️ You don&apos;t have any maintenance records for {taxYear} yet.
              </p>
              <p className={`text-sm mt-1 ${c.hint}`}>
                💡 Did you handle repairs yourself? Add them now to maximize your deductions.
              </p>
              <Link
                href="/tickets/new"
                className={`inline-block mt-3 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors ${c.btn}`}
              >
                + Log Expense
              </Link>
            </>
          )}
        </div>

        {/* ··· opens the dismiss Action Sheet */}
        <button
          onClick={() => setShowSheet((v) => !v)}
          className={`shrink-0 transition-colors text-base leading-none font-bold tracking-widest mt-0.5 ${c.dotsBtn}`}
          aria-label="More options"
        >
          ···
        </button>
      </div>
    </div>
  );
}
