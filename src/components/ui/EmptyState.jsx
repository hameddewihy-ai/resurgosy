import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon,
  title = 'لا توجد نتائج',
  desc,
  actionLabel = 'إعادة تعيين',
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      {/* Watermark number behind icon */}
      <div className="relative mb-6">
        <span className="font-display text-[7rem] leading-none text-navy/[0.04] select-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap pointer-events-none">
          ٠٠٠
        </span>
        <div className="relative w-20 h-20 rounded-3xl bg-navy/[0.05] border border-navy/[0.08] flex items-center justify-center">
          {Icon && <Icon size={32} className="text-navy/20" />}
        </div>
      </div>

      <h3 className="text-navy font-black text-lg mb-2">{title}</h3>

      {desc && (
        <p className="text-charcoal/45 text-sm max-w-xs leading-relaxed mb-7">{desc}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap justify-center">
        {onAction && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 bg-brand text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-600 active:scale-[0.97] transition-all shadow-md shadow-brand/20"
          >
            {actionLabel}
          </button>
        )}
        {onSecondary && (
          <button
            onClick={onSecondary}
            className="text-charcoal/50 hover:text-navy text-sm font-medium border border-navy/12 px-5 py-2.5 rounded-xl transition-all hover:border-navy/25"
          >
            {secondaryLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
