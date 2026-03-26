"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Client-side PKCE code exchange page.
// auth-helpers-nextjs stores the code verifier in document.cookie (browser only).
// The server-side Route Handler can't reliably read it, so we do the exchange
// here on the client where the verifier is available.
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Create a NON-singleton client so _initialize() runs fresh for this URL,
    // detects the ?code= param, reads the verifier from cookie, and exchanges it.
    const supabase = createClientComponentClient({ isSingleton: false });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/dashboard");
      } else if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        // no-op
      }
    });

    // Fallback: if session already exists (exchange already completed), redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace("/dashboard");
    });

    // If after 5s nothing happened, something went wrong
    const timeout = setTimeout(() => {
      router.replace("/login?error=auth_failed");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
