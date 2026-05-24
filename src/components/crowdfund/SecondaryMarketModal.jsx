import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, TrendingUp, TrendingDown, Tag, Clock, Filter,
  Plus, DollarSign, AlertTriangle, ArrowLeftRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CROWD_PROJECTS } from '../../data/crowdfundData';

const MOCK_LISTINGS = [
  { id: 1, projectId: 1, sellerInitials: 'م.ح', sellerCountry: '🇦🇪', sharePercent: 0.80, askPrice: 4200,  originalPrice: 4000,  listedDays: 12, remainingMonths: 30 },
  { id: 2, projectId: 2, sellerInitials: 'م.ف', sellerCountry: '🇸🇦', sharePercent: 1.50, askPrice: 11800, originalPrice: 12000, listedDays: 7,  remainingMonths: 44 },
  { id: 3, projectId: 1, sellerInitials: 'م.ك', sellerCountry: '🇩🇪', sharePercent: 0.50, askPrice: 2450,  originalPrice: 2500,  listedDays: 3,  remainingMonths: 30 },
  { id: 4, projectId: 6, sellerInitials: 'م.ر', sellerCountry: '🇶🇦', sharePercent: 2.00, askPrice: 5100,  originalPrice: 5000,  listedDays: 21, remainingMonths: 32 },
  { id: 5, projectId: 7, sellerInitials: 'م.س', sellerCountry: '🇹🇷', sharePercent: 1.20, askPrice: 3200,  originalPrice: 3000,  listedDays: 5,  remainingMonths: 45 },
];

function ListingCard({ listing, project, onBuy }) {
  const premium = ((listing.askPrice - listing.originalPrice) / listing.originalPrice) * 100;
  const isDiscount = premium < 0;
  return (
    <div className="p-4 border border-navy/8 rounded-2xl hover:border-brand/25 transition-all">
      <div className="flex items-start gap-3">
        <img src={project.image} alt="" className="w-14 h-12 rounded-xl object-cover shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-navy font-bold text-xs truncate">{project.title}</p>
          <p className="text-charcoal/45 text-[10px]">{project.city} · {project.type}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] bg-brand/8 text-brand px-2 py-0.5 rounded-full font-bold border border-brand/15">
              {listing.sharePercent}% حصة
            </span>
            <span className="text-[10px] text-charcoal/40">{listing.remainingMonths} شهر متبقي</span>
          </div>
        </div>
        <div className="shrink-0 text-left">
          <p className="text-navy font-black text-sm">${listing.askPrice.toLocaleString()}</p>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 justify-end mt-0.5 ${isDiscount ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
            {isDiscount ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
            {Math.abs(premium).toFixed(1)}% {isDiscount ? 'خصم' : 'علاوة'}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy/6">
        <div className="flex items-center gap-2 text-[10px] text-charcoal/40">
          <span>{listing.sellerCountry} {listing.sellerInitials}</span>
          <span>·</span>
          <Clock size={9} />
          <span>منذ {listing.listedDays} أيام</span>
        </div>
        <button
          onClick={() => onBuy(listing, project)}
          className="flex items-center gap-1.5 bg-brand text-white text-[11px] font-bold px-4 py-1.5 rounded-xl hover:bg-navy transition-colors"
        >
          <DollarSign size={11} /> شراء الحصة
        </button>
      </div>
    </div>
  );
}

export default function SecondaryMarketModal({ isOpen, onClose }) {
  const [filterProject, setFilterProject]   = useState('all');
  const [sortBy,         setSortBy]         = useState('newest');
  const [showListForm,   setShowListForm]   = useState(false);
  const [listForm,       setListForm]       = useState({ projectId: '', sharePercent: '', askPrice: '' });

  const enriched = useMemo(() =>
    MOCK_LISTINGS.map(l => ({ ...l, project: CROWD_PROJECTS.find(p => p.id === l.projectId) }))
      .filter(l => l.project),
    []
  );

  const filtered = useMemo(() => {
    let list = enriched.filter(l => filterProject === 'all' || String(l.projectId) === filterProject);
    if (sortBy === 'discount') list = [...list].sort((a, b) => (a.askPrice - a.originalPrice) / a.originalPrice - (b.askPrice - b.originalPrice) / b.originalPrice);
    else if (sortBy === 'price')  list = [...list].sort((a, b) => a.askPrice - b.askPrice);
    else list = [...list].sort((a, b) => a.listedDays - b.listedDays);
    return list;
  }, [enriched, filterProject, sortBy]);

  const totalValue = filtered.reduce((s, l) => s + l.askPrice, 0);

  const handleBuy = (listing, project) => {
    toast.success(`طلب شراء ${listing.sharePercent}% من ${project.title.split('—')[0].trim()} — سيتواصل معك فريقنا خلال 24 ساعة`);
  };

  const handleListShare = () => {
    if (!listForm.projectId || !listForm.sharePercent || !listForm.askPrice) {
      toast.error('يرجى تعبئة جميع الحقول');
      return;
    }
    toast.success('تم تسجيل طلب الإدراج — سيراجعه فريقنا خلال 48 ساعة');
    setShowListForm(false);
    setListForm({ projectId: '', sharePercent: '', askPrice: '' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/70 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed inset-x-4 top-[3vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[580px] bg-white rounded-3xl shadow-2xl z-[71] overflow-hidden max-h-[90vh] flex flex-col"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-navy/8 flex items-center justify-between shrink-0 bg-gradient-to-l from-navy/3 to-brand/5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <ArrowLeftRight size={15} className="text-brand" />
                  <p className="text-navy font-black text-sm">السوق الثانوي</p>
                </div>
                <p className="text-charcoal/45 text-[10px]">
                  {filtered.length} حصة معروضة · إجمالي ${totalValue.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowListForm(!showListForm)}
                  className="flex items-center gap-1.5 text-xs font-bold bg-brand/8 text-brand border border-brand/20 px-3 py-1.5 rounded-xl hover:bg-brand hover:text-white transition-all"
                >
                  <Plus size={13} /> أدرج حصتك
                </button>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 hover:text-navy transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* List share form */}
              <AnimatePresence>
                {showListForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 bg-cream/60 border-b border-navy/8">
                      <p className="text-navy font-bold text-xs mb-3">إدراج حصتك للبيع</p>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div>
                          <label className="text-[10px] font-bold text-charcoal/50 block mb-1">المشروع</label>
                          <select
                            value={listForm.projectId}
                            onChange={e => setListForm(p => ({ ...p, projectId: e.target.value }))}
                            className="w-full text-xs border border-navy/15 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:border-brand/40"
                          >
                            <option value="">اختر</option>
                            {CROWD_PROJECTS.filter(p => p.status === 'active' || p.status === 'funded').map(p => (
                              <option key={p.id} value={p.id}>{p.title.split('—')[0].trim()}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-charcoal/50 block mb-1">الحصة (%)</label>
                          <input type="number" step="0.01" min="0.01" value={listForm.sharePercent}
                            onChange={e => setListForm(p => ({ ...p, sharePercent: e.target.value }))}
                            placeholder="0.50"
                            className="w-full text-xs border border-navy/15 rounded-xl px-2 py-1.5 focus:outline-none focus:border-brand/40" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-charcoal/50 block mb-1">السعر ($)</label>
                          <input type="number" step="50" value={listForm.askPrice}
                            onChange={e => setListForm(p => ({ ...p, askPrice: e.target.value }))}
                            placeholder="2500"
                            className="w-full text-xs border border-navy/15 rounded-xl px-2 py-1.5 focus:outline-none focus:border-brand/40" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleListShare} className="flex-1 bg-brand text-white text-xs font-bold py-2 rounded-xl hover:bg-navy transition-colors">
                          تأكيد الإدراج
                        </button>
                        <button onClick={() => setShowListForm(false)} className="px-4 text-xs text-charcoal/50 border border-navy/15 rounded-xl hover:bg-cream transition-colors">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <div className="px-6 py-3 border-b border-navy/6 flex items-center gap-3">
                <Filter size={12} className="text-charcoal/35 shrink-0" />
                <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
                  className="text-xs border border-navy/12 rounded-xl px-3 py-1.5 bg-white focus:outline-none flex-1">
                  <option value="all">كل المشاريع</option>
                  {CROWD_PROJECTS.filter(p => p.status !== 'closed').map(p => (
                    <option key={p.id} value={String(p.id)}>{p.title.split('—')[0].trim()}</option>
                  ))}
                </select>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-navy/12 rounded-xl px-3 py-1.5 bg-white focus:outline-none">
                  <option value="newest">الأحدث</option>
                  <option value="discount">أعلى خصم</option>
                  <option value="price">الأرخص</option>
                </select>
              </div>

              {/* Listings */}
              <div className="p-4 space-y-3">
                {filtered.length === 0 ? (
                  <div className="text-center py-10">
                    <Tag size={32} className="text-charcoal/20 mx-auto mb-3" />
                    <p className="text-navy font-bold text-sm">لا توجد حصص لهذا المشروع حالياً</p>
                    <p className="text-charcoal/40 text-xs mt-1">يمكنك إدراج حصتك للبيع من الزر أعلاه</p>
                  </div>
                ) : filtered.map(l => (
                  <ListingCard key={l.id} listing={l} project={l.project} onBuy={handleBuy} />
                ))}
              </div>

              {/* Disclaimer */}
              <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  السوق الثانوي يوفر سيولة محدودة. رسوم الخروج المبكر تُطبَّق وفق شروط كل مشروع. الأسعار قابلة للتفاوض مع مراجعة المنصة.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
