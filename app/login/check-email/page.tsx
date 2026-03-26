import Link from "next/link";
import ResendCountdown from "@/components/auth/ResendCountdown";

export const metadata = {
  title: "Check Your Email — StoopKeep",
};

export default function CheckEmailPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? "";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <Link href="/" className="mb-8 inline-block">
        <span className="font-extrabold text-2xl tracking-tight text-slate-900">
          Stoop<span className="text-blue-600">Keep</span>
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        {/* Icon */}
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg
            className="w-7 h-7 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Check Your Email
        </h1>

        <p className="text-sm text-slate-500 mb-1">We sent a login link to:</p>
        {email && (
          <p className="text-sm font-semibold text-slate-900 mb-4 break-all">
            {email}
          </p>
        )}

        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Click the link in your email to sign in.
          <br />
          <span className="text-slate-400">The link expires in 1 hour.</span>
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">
              Didn&apos;t receive the email?
            </p>
            <ul className="text-xs text-slate-400 space-y-1 mb-4">
              <li>• Check your spam folder</li>
              <li>• Make sure the address above is correct</li>
            </ul>
            {email ? (
              <ResendCountdown email={email} />
            ) : (
              <p className="text-xs text-slate-400">
                Return to login to try again.
              </p>
            )}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
