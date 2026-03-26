const signals = [
  { icon: "🔒", text: "Your data is private. We never sell it." },
  { icon: "💳", text: "No credit card required to start." },
  { icon: "↩️", text: "Cancel anytime, no questions asked." },
  { icon: "🇺🇸", text: "Built specifically for US tax reporting." },
];

export default function TrustBand() {
  return (
    <section className="py-10 px-6 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 max-w-3xl mx-auto">
          {signals.map(({ icon, text }) => (
            <div key={text} className="flex items-center justify-center gap-2 text-slate-500">
              <span className="text-base shrink-0">{icon}</span>
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
