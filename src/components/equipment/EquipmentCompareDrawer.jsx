import { motion } from 'framer-motion';
import { X, MapPin } from 'lucide-react';
import { UNIT_AR, CATEGORIES } from '../../data/equipmentData';

const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function DateCell({ dateStr }) {
  if (!dateStr) return <span className="text-charcoal/30 text-[10px]">—</span>;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  const d    = new Date(dateStr);
  const txt  = `${d.getDate()} ${MONTHS_AR[d.getMonth()]} ${d.getFullYear()}`;
  const cls  = diff < 0 ? 'text-red-500 font-bold' : diff < 60 ? 'text-amber-600' : 'text-green-600 font-medium';
  return <span className={`text-[10px] ${cls}`}>{diff < 0 ? `منتهي ⚠` : txt}</span>;
}

const ROWS = [
  {
    label: 'الفئة',
    val: eq => CATEGORIES.find(c => c.id === eq.category)?.label || eq.category,
    better: null,
  },
  {
    label: 'سنة الصنع',
    val: eq => eq.yearOfManufacture || '—',
    better: (a, b) => {
      const ya = +(a?.yearOfManufacture) || 0, yb = +(b?.yearOfManufacture) || 0;
      return ya > yb ? 'a' : ya < yb ? 'b' : null;
    },
  },
  {
    label: 'السعر الجاف',
    val: eq => eq.rate ? `${eq.rate} $ / ${UNIT_AR[eq.pricingUnit] || 'يوم'}` : '—',
    better: (a, b) => {
      if (!a?.rate || !b?.rate) return null;
      return a.rate < b.rate ? 'a' : a.rate > b.rate ? 'b' : null;
    },
  },
  {
    label: 'السعر الرطب (مع مشغّل)',
    val: eq => eq.wetRate ? `${eq.wetRate} $ / ${UNIT_AR[eq.pricingUnit] || 'يوم'}` : 'غير متاح',
    better: (a, b) => {
      if (!a?.wetRate || !b?.wetRate) return null;
      return a.wetRate < b.wetRate ? 'a' : a.wetRate > b.wetRate ? 'b' : null;
    },
  },
  {
    label: 'التقييم',
    val: eq => eq.rating > 0 ? `${eq.rating} / 5 (${eq.reviewCount} تقييم)` : 'جديد',
    better: (a, b) => {
      const ra = a?.rating || 0, rb = b?.rating || 0;
      return ra > rb ? 'a' : ra < rb ? 'b' : null;
    },
  },
  {
    label: 'مرات التأجير',
    val: eq => eq.totalRentals ? `${eq.totalRentals} مرة` : '0',
    better: (a, b) => {
      const ta = +(a?.totalRentals) || 0, tb = +(b?.totalRentals) || 0;
      return ta > tb ? 'a' : ta < tb ? 'b' : null;
    },
  },
  {
    label: 'نوع الوقود',
    val: eq => eq.fuelType || '—',
    better: null,
  },
  {
    label: 'الوزن التشغيلي',
    val: eq => eq.operatingWeight || '—',
    better: null,
  },
  {
    label: 'نقل المعدة',
    val: eq => eq.transport === 'included' ? 'مجاني ✅' : `+${eq.transportCost || 0} $`,
    better: (a, b) => {
      const ta = a?.transport === 'included' ? 0 : a?.transportCost || 0;
      const tb = b?.transport === 'included' ? 0 : b?.transportCost || 0;
      return ta < tb ? 'a' : ta > tb ? 'b' : null;
    },
  },
  {
    label: 'الوقود مشمول',
    val: eq => eq.fuelIncluded ? '✅ مشمول' : '❌ منفصل',
    better: (a, b) => a?.fuelIncluded && !b?.fuelIncluded ? 'a' : !a?.fuelIncluded && b?.fuelIncluded ? 'b' : null,
  },
  {
    label: 'الملحقات المتاحة',
    val: eq => (eq.attachments?.length || 0) > 0 ? `${eq.attachments.length} ملحق` : 'لا يوجد',
    better: (a, b) => {
      const al = a?.attachments?.length || 0, bl = b?.attachments?.length || 0;
      return al > bl ? 'a' : al < bl ? 'b' : null;
    },
  },
  {
    label: 'تأمين حتى',
    val: eq => eq.insuranceExpiry || null,
    isDate: true,
    better: null,
  },
  {
    label: 'رخصة حتى',
    val: eq => eq.licenseExpiry || null,
    isDate: true,
    better: null,
  },
];

export default function EquipmentCompareDrawer({ items, onClose }) {
  const [a, b] = items || [];
  if (!a || !b) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[88vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/96 backdrop-blur-sm border-b border-navy/8 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-navy font-black text-base">مقارنة معدتين</p>
            <p className="text-charcoal/45 text-[10px] mt-0.5">🟢 = الخيار الأفضل في هذا المعيار</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-charcoal/40 hover:text-navy transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Equipment image headers */}
        <div className="grid grid-cols-3 border-b border-navy/8">
          <div className="p-3 bg-cream/60" />
          {[a, b].map((eq, idx) => (
            <div key={eq.id} className={`p-4 ${idx === 0 ? 'border-r border-navy/8' : ''}`}>
              <div className="w-full h-24 rounded-xl overflow-hidden mb-2 bg-navy/5">
                <img src={eq.image || eq.images?.[0]} alt={eq.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-navy font-bold text-xs leading-tight line-clamp-2">{eq.name}</p>
              {eq.brand && eq.brand !== '—' && (
                <p className="text-charcoal/40 text-[9px] font-mono mt-0.5">{eq.brand} {eq.model}</p>
              )}
              <p className="text-charcoal/50 text-[9px] flex items-center gap-0.5 mt-0.5">
                <MapPin size={8} /> {eq.city}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison rows */}
        {ROWS.map(row => {
          const va     = row.val(a);
          const vb     = row.val(b);
          const winner = row.better ? row.better(a, b) : null;

          return (
            <div key={row.label} className="grid grid-cols-3 border-b border-navy/[0.06] last:border-0">
              <div className="p-3 bg-cream/40 flex items-center">
                <p className="text-charcoal/50 text-[10px] font-medium leading-tight">{row.label}</p>
              </div>
              {[{ val: va, side: 'a' }, { val: vb, side: 'b' }].map(({ val, side }, idx) => {
                const isBetter = winner === side;
                return (
                  <div key={side}
                    className={`p-3 flex items-center transition-colors ${isBetter ? 'bg-green-50' : ''} ${idx === 0 ? 'border-r border-navy/[0.06]' : ''}`}>
                    {row.isDate
                      ? <DateCell dateStr={val} />
                      : <span className={`text-[10px] font-bold leading-snug ${isBetter ? 'text-green-700' : 'text-navy/80'}`}>
                          {isBetter && <span className="ml-0.5">🟢 </span>}{String(val)}
                        </span>
                    }
                  </div>
                );
              })}
            </div>
          );
        })}

        <div className="p-5">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-navy text-white text-sm font-bold hover:bg-navy/90 transition-colors">
            إغلاق المقارنة
          </button>
        </div>
      </motion.div>
    </>
  );
}
