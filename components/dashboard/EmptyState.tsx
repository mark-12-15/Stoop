import Link from "next/link";

function HouseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className="w-16 h-16 mx-auto"
      aria-hidden="true"
    >
      <path
        d="M8 28L32 8l24 20"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 23v26a1 1 0 001 1h34a1 1 0 001-1V23"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="24"
        y="34"
        width="16"
        height="16"
        rx="1"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 42h16"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M32 34v16"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function EmptyState() {
  return (
    <div className="w-full rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 py-24 text-center">
      <div className="mb-6">
        <HouseIcon />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Welcome to StoopKeep!
      </h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
        Let&apos;s get started by adding your first property. Once added, you
        can track repairs and generate tax-ready reports.
      </p>
      <Link
        href="/properties?add=true"
        className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
      >
        + Add Your First Property
      </Link>
    </div>
  );
}
