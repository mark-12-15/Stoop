"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase/client";

export default function EmailLoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError("Failed to send login link. Please try again.");
      setLoading(false);
      return;
    }

    router.push(`/login/check-email?email=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        required
        autoComplete="email"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-600 transition-colors"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !email.trim()}
        className="w-full bg-blue-700 text-white rounded-xl py-3 px-4 text-sm font-semibold hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-700/25 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:translate-y-0 disabled:shadow-none"
      >
        {loading ? "Sending…" : "Send Login Link"}
      </button>
    </form>
  );
}
