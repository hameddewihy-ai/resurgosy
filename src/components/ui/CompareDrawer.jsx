import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Star, BadgeCheck, ArrowLeft, GitCompare } from 'lucide-react';
import { Link } from 'react-router-dom';

const ROWS = [
  { key: 'priceDisplay', label: 'السعر' },
  { key: 'area',         label: 'المساحة',    unit: 'م²' },
  { key: 'rooms',        label: 'الغرف' },
  { key: 'baths',        label: 'الحمامات' },
  { key: 'floor',        label: 'الطابق' },
  { key: 'type',         label: 'النوع' },
  { key: 'status',       label: 'الحالة' },
  { key: 'city',         label: 'المدينة' },
  { key: 'district',     label: 'الحي' },
  { key: 'rating',       label: 'التقييم' },
];

function Cell({ a, b, rowKey, unit }) {
  const va = a?.[rowKey];
  const vb = b?.[rowKey];
  const highlight = (v, other) => {
    if (rowKey === 'rating') return v > other ? 'text-green-600 font-black' : '';
    if (rowKey === 'area' || rowKey === 'rooms') return v > other ? 'text-green-600 font-black' : '';
    if (rowKey === 'priceDisplay') return '';
    return '';
  };
  const fmt = v => v != null ? `${v}${unit ? ' ' + unit : ''}` : '—';
  return (
    <div className={`text-sm text-center py-2 ${highlight(va, vb)}`}>
      {rowKey === 'rating'
        ? <span className="flex items-center justify-center gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={11} className={i < va ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />)}
          </span>
        : fmt(va)}
    </div>
  );
}

export default function CompareDrawer({ properties, onRemove, onClear, open, onClose }) {
  const [a, b] = properties;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 bg-navy/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} />

          <motion.div
            className="fixed inset-y-0 left-0 w-full sm:w-[680px] bg-white z-50 shadow-2xl flex flex-col"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10 bg-cream shrink-0">
              <div className="flex items-center gap-2">
                <GitCompare size={18} className="text-brand" />
                <h2 className="text-navy font-black text-base">مقارنة العقارات</h2>
                <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-bold">{properties.length}/2</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClear} className="text-xs text-charcoal/50 hover:text-red-500 transition-colors">مسح الكل</button>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/8 transition-colors">
                  <X size={16} className="text-charcoal/60" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Property columns header */}
              <div className="grid grid-cols-[140px_1fr_1fr] border-b border-navy/8">
                <div className="p-4 bg-cream/60" />
                {[a, b].map((p, idx) => (
                  <div key={idx} className="p-4 border-r last:border-r-0 border-navy/8 relative">
                    {p ? (
                      <>
                        <button onClick={() => onRemove(p.id)}
                          className="absolute top-2 left-2 w-5 h-5 rounded-full bg-navy/10 hover:bg-red-100 hover:text-red-500 flex items-center justify-center text-charcoal/40 transition-colors">
                          <X size={10} />
                        </button>
                        <div className="h-24 rounded-xl overflow-hidden mb-2">
                          <img src={p.images?.[0]} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-navy text-xs font-bold leading-snug line-clamp-2">{p.title}</p>
                        <p className="text-charcoal/50 text-[10px] flex items-center gap-1 mt-0.5">
                          <MapPin size={9} />{p.city}
                        </p>
                        {p.verified && (
                          <span className="inline-flex items-center gap-1 text-[9px] text-green-600 mt-1">
                            <BadgeCheck size={10} /> موثّق
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="h-36 flex items-center justify-center border-2 border-dashed border-navy/15 rounded-xl text-charcoal/30 text-xs text-center">
                        اختر عقاراً للمقارنة
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Comparison rows */}
              {ROWS.map(({ key, label, unit }) => (
                <div key={key} className="grid grid-cols-[140px_1fr_1fr] border-b border-navy/6 hover:bg-cream/40 transition-colors">
                  <div className="px-4 py-2 text-xs text-charcoal/60 font-medium flex items-center bg-cream/30">{label}</div>
                  {[a, b].map((p, idx) => (
                    <div key={idx} className="px-4 border-r last:border-r-0 border-navy/6 flex items-center justify-center">
                      {p ? <Cell a={p} b={idx === 0 ? b : a} rowKey={key} unit={unit} /> : <span className="text-charcoal/20 text-xs">—</span>}
                    </div>
                  ))}
                </div>
              ))}

              {/* CTA buttons */}
              <div className="grid grid-cols-[140px_1fr_1fr] p-4 gap-3">
                <div />
                {[a, b].map((p, idx) => (
                  <div key={idx}>
                    {p && (
                      <Link to={`/properties/${p.id}`}
                        className="flex items-center justify-center gap-1 text-xs btn-cta py-2 rounded-xl w-full">
                        عرض التفاصيل <ArrowLeft size={12} />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
