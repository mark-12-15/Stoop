"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function ResendCountdown({ email }: { email: string }) {
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = async () => {
    setLoading(true);
    setResent(false);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (!error) {
      setResent(true);
      setSeconds(60);
    }
  };

  if (seconds > 0) {
    return (
      <p className="text-sm text-slate-400">
        Resend available in{" "}
        <span className="tabular-nums font-medium text-slate-600">{seconds}s</span>
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={handleResend}
        disabled={loading}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-60"
      >
        {loading ? "Sending…" : "Resend Link"}
      </button>
      {resent && (
        <p className="text-xs text-emerald-600">Link resent — check your inbox.</p>
      )}
    </div>
  );
}
