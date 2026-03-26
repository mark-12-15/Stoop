"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

type Props = { userName: string; userEmail: string; subscriptionPlan?: "free" | "monthly" | "annual" };

export default function DashboardHeader({ userName, userEmail, subscriptionPlan = "free" }: Props) {
  const [open, setOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createBrowserClient();
  const initial = userName[0]?.toUpperCase() ?? "U";

  const openFeedbackModal = () => setFeedbackOpen(true);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-extrabold text-xl tracking-tight text-slate-900">
          Stoop<span className="text-blue-600">Keep</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Feedback button — primary entry point */}
          <button
            onClick={openFeedbackModal}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors"
          >
            <span>💬</span>
            <span className="hidden sm:inline">Feedback</span>
          </button>

          {/* Avatar dropdown */}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {initial}
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                </div>
                <div className="py-1">
                  {[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Properties", href: "/properties" },
                  ].map(({ label, href }) => (
                    <Link key={href} href={href} onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 transition-colors">
                      {label}
                    </Link>
                  ))}
                </div>
                <div className="border-t border-gray-100 py-1">
                  {subscriptionPlan === "free" ? (
                    <Link href="/pricing" onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
                      <span>⭐</span>
                      <span>Upgrade to Pro</span>
                    </Link>
                  ) : (
                    <Link href="/settings/billing" onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 transition-colors">
                      Billing &amp; Settings
                    </Link>
                  )}
                  {/* Send Feedback — secondary entry point */}
                  <button
                    onClick={() => { setOpen(false); openFeedbackModal(); }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-50 transition-colors"
                  >
                    Send Feedback
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
