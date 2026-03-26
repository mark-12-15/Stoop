"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

interface Props {
  email: string;
  initials: string;
  avatarUrl?: string;
}

export default function UserDropdown({ email, initials, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center hover:ring-2 hover:ring-blue-600 transition-all"
        aria-label="User menu"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={initials} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="w-full h-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm text-muted truncate">{email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-[#1A1A18] hover:bg-fill transition-colors"
              onClick={() => setOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/properties"
              className="block px-4 py-2 text-sm text-[#1A1A18] hover:bg-fill transition-colors"
              onClick={() => setOpen(false)}
            >
              Properties
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-fill transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
