const LinkIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const WireframeIcon = () => (
  <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const steps = [
  {
    number: "1",
    Icon: LinkIcon,
    title: "Share a Unique Link with Your Tenant",
    description:
      "Each property gets its own link. Tenants click it to report issues — no account needed.",
  },
  {
    number: "2",
    Icon: SparklesIcon,
    title: "AI Analyzes & Categorizes the Issue",
    description:
      "Tenants describe the problem and upload photos. AI classifies the category, severity, and suggests next steps.",
  },
  {
    number: "3",
    Icon: ChartIcon,
    title: "Track Costs & Export for Schedule E",
    description:
      "Close tickets with final costs. At tax time, export a clean spreadsheet ready for your Schedule E deductions.",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            How It Works
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            From repair request to tax deduction — all in one place
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map(({ number, Icon, title, description }) => (
            <div
              key={number}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              {/* Dot-grid placeholder — intentional, not broken */}
              <div
                className="aspect-video border-b border-gray-100 flex flex-col items-center justify-center gap-2 shadow-inner"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <WireframeIcon />
                <span className="text-xs text-slate-300 font-medium tracking-wide">
                  App screenshot coming soon
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Icon block with overlapping step number badge */}
                <div className="relative inline-block mb-5">
                  <div className="bg-blue-50 rounded-xl p-4 text-blue-600">
                    <Icon />
                  </div>
                  <span className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                    {number}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
