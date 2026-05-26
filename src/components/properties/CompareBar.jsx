import { useState } from 'react';
import { X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompareModal from './CompareModal';

export default function CompareBar({ items, onRemove, onClear }) {
  const [showModal, setShowModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4"
        >
          <div className="bg-navy/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3">
            {/* Items */}
            <div className="flex gap-2 flex-1 overflow-hidden">
              {items.map((p) => (
                <div key={p.id} className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10">
                    {(p.images?.[0] ?? p.image) ? (
                      <img src={p.images?.[0] ?? p.image} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-lg">🏠</div>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(p.id)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X size={9} className="text-white" />
                  </button>
                </div>
              ))}
              {/* Empty slots */}
              {Array.from({ length: 3 - items.length }).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-lg border border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/20 text-lg">+</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-white/50 text-xs">{items.length}/3</span>
              <button
                onClick={onClear}
                className="text-white/40 hover:text-white transition-colors text-xs px-2 py-1"
              >
                مسح
              </button>
              <button
                onClick={() => setShowModal(true)}
                disabled={items.length < 2}
                className="flex items-center gap-1.5 bg-[#f37124] hover:bg-[#e06515] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors"
              >
                <BarChart2 size={14} />
                قارن
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showModal && (
        <CompareModal items={items} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
