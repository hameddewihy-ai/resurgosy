import { X, BadgeCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const ROW = [
  { label: 'السعر',        key: (p) => p.priceDisplay ?? p.price ?? '—' },
  { label: 'السعر / م²',   key: (p) => p.area ? `$${Math.round((p.price_estimate || 0) / p.area).toLocaleString()}` : '—' },
  { label: 'المساحة',      key: (p) => p.area ? `${p.area} م²` : '—' },
  { label: 'المدينة',      key: (p) => p.city ?? '—' },
  { label: 'الحي',         key: (p) => p.district ?? '—' },
  { label: 'النوع',        key: (p) => p.subtype ?? p.property_type ?? '—' },
  { label: 'غرف النوم',    key: (p) => p.bedrooms  ? `${p.bedrooms} غرف`  : '—' },
  { label: 'الحمامات',     key: (p) => p.bathrooms ? `${p.bathrooms} حمام` : '—' },
  { label: 'الطابق',       key: (p) => p.floor     ? `${p.floor}`          : '—' },
  { label: 'الحالة',       key: (p) => p.status ?? '—' },
  { label: 'موثّق',        key: (p) => p.verified ? '✅ نعم' : '—' },
];

export default function CompareModal({ items, onClose }) {
  if (!items.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 sticky top-0 bg-white z-10">
            <h2 className="text-navy font-black text-lg">مقارنة العقارات</h2>
            <button onClick={onClose} className="text-charcoal/40 hover:text-navy transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Property headers */}
              <thead>
                <tr>
                  <th className="w-32 p-4 text-right text-xs text-charcoal/40 font-bold uppercase tracking-wider border-b border-navy/8">
                    المعيار
                  </th>
                  {items.map((p) => (
                    <th key={p.id} className="p-4 border-b border-navy/8 min-w-[200px]">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-full h-28 rounded-xl overflow-hidden bg-navy/5">
                          {(p.images?.[0] ?? p.image) ? (
                            <img src={p.images?.[0] ?? p.image} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal/20 text-2xl">🏠</div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-navy font-bold text-sm line-clamp-1">{p.title}</p>
                          {p.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-bold mt-0.5">
                              <BadgeCheck size={10} /> موثّق
                            </span>
                          )}
                          <Link
                            to={`/properties/${p.id}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] text-brand hover:underline mt-1"
                          >
                            عرض <ExternalLink size={9} />
                          </Link>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Comparison rows */}
              <tbody>
                {ROW.map(({ label, key }, i) => (
                  <tr key={label} className={i % 2 === 0 ? 'bg-navy/[0.02]' : 'bg-white'}>
                    <td className="px-4 py-3 text-xs font-bold text-charcoal/50 text-right whitespace-nowrap">
                      {label}
                    </td>
                    {items.map((p) => (
                      <td key={p.id} className="px-4 py-3 text-sm text-navy font-medium text-center">
                        {key(p)}
                      </td>
                    ))}
                    {/* Empty cells if less than 3 */}
                    {Array.from({ length: 3 - items.length }).map((_, j) => (
                      <td key={`empty-${j}`} className="px-4 py-3 text-center text-charcoal/20 text-sm">—</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
