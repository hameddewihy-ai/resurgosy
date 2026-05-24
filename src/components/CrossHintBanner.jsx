import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import { useGlobalData } from '../context/GlobalContext';

export default function CrossHintBanner() {
  const { crossHint, clearCrossHint } = useGlobalData();

  return (
    <AnimatePresence>
      {crossHint && (
        <motion.div
          key="cross-hint"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="fixed bottom-24 inset-x-0 flex justify-center z-40 px-4 pointer-events-none"
          dir="rtl"
        >
          <div className="flex items-center gap-3 bg-navy/95 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl shadow-navy/30 border border-white/10 max-w-sm w-full pointer-events-auto">
            <div className="w-8 h-8 rounded-xl bg-brand/20 flex items-center justify-center shrink-0 text-base">
              {crossHint.emoji}
            </div>
            <p className="flex-1 text-xs font-medium leading-snug min-w-0">
              {crossHint.text}
            </p>
            <Link to={crossHint.to} onClick={clearCrossHint}
              className="shrink-0 flex items-center gap-1 text-[11px] bg-brand hover:bg-brand/90 text-white px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap">
              {crossHint.label} <ArrowLeft size={11} />
            </Link>
            <button onClick={clearCrossHint}
              className="shrink-0 text-white/40 hover:text-white/80 transition-colors">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
