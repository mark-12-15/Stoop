import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OAuthButtons from "@/components/auth/OAuthButtons";
import EmailLoginForm from "@/components/auth/EmailLoginForm";

export const metadata = {
  title: "Sign In — StoopKeep",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) redirect("/dashboard");

  const errorMessage =
    searchParams.error === "cancelled"
      ? "Login cancelled."
      : searchParams.error === "auth_failed"
      ? "Authentication failed. Please try again."
      : searchParams.error
        ? "Connection failed. Please try again."
        : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 inline-block">
        <span className="font-extrabold text-2xl tracking-tight text-slate-900">
          Stoop<span className="text-blue-600">Keep</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-xl font-bold text-slate-900 text-center mb-6">
          Sign in to StoopKeep
        </h1>

        {errorMessage && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
            {errorMessage}
          </div>
        )}

        <OAuthButtons />

        {/* OR divider */}
        <div className="relative mt-4 mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs text-gray-400 bg-white uppercase tracking-wider">
              or
            </span>
          </div>
        </div>

        <EmailLoginForm />

        <p className="mt-5 text-xs text-slate-400 text-center leading-relaxed">
          💡 New here? We&apos;ll create your account automatically on first sign in.
        </p>
      </div>
    </div>
  );
}
