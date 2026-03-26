import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-14 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
          {/* Brand — inline text logo, no image dependency */}
          <div className="max-w-xs">
            <div className="mb-4">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Stoop<span className="text-blue-400">Keep</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Keep every repair. Keep every receipt.
            </p>
            <p className="text-sm mt-2">Built for US landlords.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Product
              </p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Legal
              </p>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Contact
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="mailto:support@stoopkeep.com" className="hover:text-white transition-colors">
                    support@stoopkeep.com
                  </a>
                </li>
                <li className="text-xs text-slate-600 leading-relaxed">
                  We respond within 1 business day.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 text-xs text-slate-600">
          © {new Date().getFullYear()} StoopKeep. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
