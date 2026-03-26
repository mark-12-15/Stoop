import Link from "next/link";
import UserDropdown from "./UserDropdown";
import type { UserState } from "@/types/user";

export default function Header({ user }: { user: UserState }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="font-extrabold text-xl tracking-tight text-slate-900">
            Stoop<span className="text-blue-600">Keep</span>
          </span>
        </Link>

        {user.isLoggedIn ? (
          <UserDropdown email={user.email} initials={user.initials} avatarUrl={user.avatarUrl} />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-semibold shadow-sm"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
