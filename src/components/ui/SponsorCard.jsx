// Reusable native sponsor card — used across all pages
// Receives a sponsor object from GlobalContext sponsorships array
// and an onCLick callback for click tracking.

export default function SponsorCard({ sponsor, onClick, className = '' }) {
  if (!sponsor) return null;

  return (
    <div
      className={`bg-gradient-to-br from-brand/5 to-navy/[0.03] border border-brand/20 rounded-xl p-4 relative overflow-hidden text-right ${className}`}
      dir="rtl"
    >
      {/* Badge */}
      <div className="absolute top-2 left-2 text-[8px] bg-brand/10 text-brand px-2 py-0.5 rounded font-black border border-brand/20 leading-tight">
        رعاية
      </div>

      <p className="text-[9px] text-charcoal/40 font-bold mb-1 leading-tight">
        {sponsor.sponsor}
      </p>
      <h4 className="text-navy font-bold text-xs mb-1.5 leading-snug">
        {sponsor.title}
      </h4>
      <p className="text-charcoal/60 text-[10px] leading-relaxed mb-3">
        {sponsor.desc}
      </p>
      <a
        href={sponsor.link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 bg-brand hover:bg-navy text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5 shadow-sm"
      >
        {sponsor.cta} ⚡
      </a>
    </div>
  );
}
