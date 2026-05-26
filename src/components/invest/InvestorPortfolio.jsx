import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Wallet, ArrowUpRight,
  Building2, Camera, Clock, DollarSign, Activity, Lock, AlertCircle, ShoppingCart,
  CalendarDays, Banknote, BarChart2, X, FileDown, Tag,
} from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';
import toast from 'react-hot-toast';

const SECONDARY_MARKET = [];

const CONSTRUCTION_UPDATES = [
  {
    id: 1, projectId: 'inv-1',
    project: 'مجمع سكني — دمشق الجديدة',
    date: '2026-05-10',
    title: 'صب سقف الطابق الرابع',
    desc: 'تم الانتهاء من أعمال الحدادة وصب الخرسانة للطابق الرابع ضمن الموعد المحدد.',
    image: 'https://images.unsplash.com/photo-1541888086425-d81bb19240f5?w=500&q=80',
    status: 'on-track',
  },
  {
    id: 2, projectId: 'inv-3',
    project: 'مشروع سياحي — الساحل السوري',
    date: '2026-04-25',
    title: 'أعمال الحفر وتجهيز الأساسات',
    desc: 'استمرار أعمال الحفر وإزالة الصخور للبدء بوضع الأساسات العميقة للمشروع.',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
    status: 'on-track',
  },
];

// Share price appreciates linearly at IRR% per year since investment date
function computeCurrentSharePrice(sharePrice, irrPct, timestamp) {
  const yearsElapsed = (Date.now() - timestamp) / (365.25 * 24 * 3600 * 1000);
  return Math.round(sharePrice * (1 + (irrPct / 100) * yearsElapsed));
}

export default function InvestorPortfolio() {
  const { investments, investmentProjects, wallet } = useGlobalData();
  const [tab, setTab] = useState('assets');
  const [sellTarget, setSellTarget] = useState(null);
  const [offerPrice, setOfferPrice] = useState(0);

  // Derive enriched asset list from real investment records
  const assets = investments.map(inv => {
    const project = investmentProjects.find(p => p.id === inv.projectId);
    const currentSharePrice = computeCurrentSharePrice(inv.sharePrice, project?.irr ?? 0, inv.timestamp);
    const currentValue = Math.round(inv.shares * currentSharePrice);
    const roi = inv.amount > 0 ? +((currentValue - inv.amount) / inv.amount * 100).toFixed(1) : 0;
    return { ...inv, project, currentSharePrice, currentValue, roi };
  });

  // Portfolio KPIs
  const totalInvested = assets.reduce((s, a) => s + a.amount, 0);
  const currentPortfolioValue = assets.reduce((s, a) => s + a.currentValue, 0);
  const portfolioRoi = totalInvested > 0
    ? +((currentPortfolioValue - totalInvested) / totalInvested * 100).toFixed(1)
    : 0;
  const dividendsReceived = wallet.transactions
    .filter(t => t.type === 'earning' && t.category === 'real_estate')
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const handleSellShares = (asset) => {
    if (asset.locked || asset.status === 'escrow') {
      toast.error('هذه الحصص محجوزة — لا يمكن بيعها خلال فترة التجميد الأولى.');
      return;
    }
    setSellTarget(asset);
    setOfferPrice(asset.currentSharePrice);
  };

  const confirmSell = () => {
    toast.success(`تم إدراج ${sellTarget.shares} حصة من "${sellTarget.project?.title}" للبيع بسعر $${offerPrice.toLocaleString()}/حصة.`);
    setSellTarget(null);
  };

  const handleExport = () => {
    toast.success('جارٍ تجهيز كشف المحفظة — سيتوفر التحميل خلال لحظات.');
  };

  const handleBuyShares = (listing) => {
    const total = (listing.sharesOffered * listing.fixedPricePerShare).toLocaleString();
    toast.success(`تم تقديم طلب شراء ${listing.sharesOffered} حصة بإجمالي $${total}.`);
  };

  return (
    <div className="space-y-6" dir="rtl">

      {/* Portfolio KPI row */}
      <div className="flex items-center justify-between gap-3 mb-1">
        <p className="text-xs text-charcoal/40 font-bold uppercase tracking-wider">ملخص المحفظة</p>
        <button onClick={handleExport}
          className="flex items-center gap-1.5 text-xs text-charcoal/50 hover:text-brand border border-navy/12 hover:border-brand/30 px-3 py-1.5 rounded-xl transition-all bg-white">
          <FileDown size={13} /> تصدير كشف
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Wallet,    label: 'إجمالي الاستثمار الأولي', val: `$${totalInvested.toLocaleString()}`,         color: 'text-navy' },
          { icon: Building2, label: 'القيمة الحالية للأصول',   val: `$${currentPortfolioValue.toLocaleString()}`, color: 'text-cta' },
          { icon: TrendingUp,label: 'العائد الإجمالي (ROI)',    val: portfolioRoi > 0 ? `+${portfolioRoi}%` : `${portfolioRoi}%`, color: portfolioRoi >= 0 ? 'text-emerald-500' : 'text-red-500' },
          { icon: DollarSign,label: 'أرباح موزّعة (كاش)',       val: `$${dividendsReceived.toLocaleString()}`,     color: 'text-brand' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center">
                <stat.icon size={16} className={stat.color} />
              </div>
              <p className="text-charcoal/50 text-xs font-bold">{stat.label}</p>
            </div>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex bg-white/50 border border-navy/10 rounded-xl p-1 overflow-x-auto hide-scrollbar">
        {[
          { id: 'assets',        label: 'أصول المحفظة',   icon: Activity     },
          { id: 'distributions', label: 'جدول التوزيعات', icon: CalendarDays },
          { id: 'performance',   label: 'أداء المحفظة',   icon: BarChart2    },
          { id: 'market',        label: 'السوق الثانوي',  icon: ShoppingCart },
          { id: 'updates',       label: 'تحديثات البناء', icon: Camera       },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold rounded-lg transition-all min-w-[140px] ${tab === t.id ? 'bg-white text-brand shadow-sm border border-navy/5' : 'text-charcoal/50 hover:bg-white/40'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* Assets */}
        {tab === 'assets' && (
          <motion.div key="assets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            {assets.length === 0 ? (
              <div className="bg-white p-10 text-center text-charcoal/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Building2 size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold mb-1">لا توجد استثمارات بعد</p>
                <p className="text-xs">استثمر في أحد المشاريع لتظهر هنا.</p>
              </div>
            ) : assets.map(asset => (
              <div key={asset.id}
                className={`bg-white p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between border-r-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg ${asset.status === 'escrow' ? 'border-r-amber-400' : 'border-r-cta'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-navy/5 text-navy px-2 py-0.5 rounded-full font-bold">{asset.project?.type || '—'}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${asset.status === 'escrow' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
                      {asset.status === 'escrow' ? '🔒 Escrow' : '✓ نشط'}
                    </span>
                  </div>
                  <h3 className="text-navy font-bold text-lg mb-1">{asset.project?.title || asset.projectId}</h3>
                  <div className="flex flex-wrap gap-4 text-xs text-charcoal/60">
                    <p>الحصص: <strong className="text-navy">{asset.shares % 1 === 0 ? asset.shares : asset.shares.toFixed(2)}</strong></p>
                    <p>سعر الشراء: <strong>${asset.sharePrice.toLocaleString()}</strong></p>
                    <p>السعر الحالي: <strong className="text-emerald-600">${asset.currentSharePrice.toLocaleString()}</strong></p>
                    <p>تاريخ الاستثمار: <strong>{asset.date}</strong></p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full lg:w-auto">
                  <div>
                    <p className="text-[10px] text-charcoal/50 uppercase tracking-wider mb-1">القيمة الحالية</p>
                    <p className="text-xl font-black text-navy mb-0.5">${asset.currentValue.toLocaleString()}</p>
                    <p className={`text-xs font-bold flex items-center gap-1 ${asset.roi >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      <TrendingUp size={12} /> {asset.roi >= 0 ? '+' : ''}{asset.roi}%
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => handleSellShares(asset)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all ${(asset.locked || asset.status === 'escrow') ? 'bg-cream text-charcoal/40 border-navy/10 cursor-not-allowed' : 'bg-white text-navy border-navy/20 hover:bg-navy/5 hover:border-navy/40'}`}>
                      {(asset.locked || asset.status === 'escrow') ? <Lock size={14} /> : <ArrowUpRight size={14} />}
                      عرض للبيع
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Distribution calendar */}
        {tab === 'distributions' && (
          <motion.div key="distributions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-5">
            {assets.length === 0 ? (
              <div className="bg-white p-10 text-center text-charcoal/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد استثمارات — لا يوجد جدول توزيعات.</p>
              </div>
            ) : (
              <>
                <div className="bg-brand/8 border border-brand/20 rounded-xl px-4 py-3 flex items-start gap-3">
                  <CalendarDays size={18} className="text-brand mt-0.5 shrink-0" />
                  <div>
                    <p className="text-navy font-bold text-sm mb-0.5">جدول التوزيعات الدورية</p>
                    <p className="text-charcoal/55 text-xs">التوزيعات ربع سنوية — 40% من التدفق النقدي السنوي للمشروع موزّعة على 4 دفعات.</p>
                  </div>
                </div>

                {assets.filter(a => a.status !== 'escrow').map(asset => {
                  const annualDist = Math.round(asset.amount * (asset.project?.irr ?? 0) / 100 * 0.4);
                  const quarterlyDist = Math.round(annualDist / 4);
                  const now = new Date();
                  const quarters = [0, 1, 2, 3].map(q => {
                    const d = new Date(now.getFullYear(), Math.ceil((now.getMonth() + 1) / 3) * 3 + q * 3, 1);
                    return {
                      label: `Q${Math.ceil(d.getMonth() / 3) || 4} ${d.getFullYear()}`,
                      date: d.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' }),
                      amount: quarterlyDist,
                      isPast: d < now,
                    };
                  });
                  return (
                    <div key={asset.id} className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 size={14} className="text-brand" />
                        <p className="text-navy font-bold text-sm">{asset.project?.title || asset.projectId}</p>
                        <span className="mr-auto text-[10px] text-charcoal/45 bg-cream px-2 py-0.5 rounded-full">
                          IRR {asset.project?.irr}% · توزيع سنوي: ${annualDist.toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {quarters.map((q, i) => (
                          <div key={i} className={`rounded-xl border p-3 text-center transition-all ${i === 0 ? 'bg-brand/8 border-brand/30' : 'bg-cream border-navy/8'}`}>
                            <p className={`text-[10px] font-bold mb-1 ${i === 0 ? 'text-brand' : 'text-charcoal/45'}`}>{q.label}</p>
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Banknote size={12} className={i === 0 ? 'text-brand' : 'text-charcoal/30'} />
                              <p className={`font-black text-sm ${i === 0 ? 'text-navy' : 'text-charcoal/60'}`}>${q.amount.toLocaleString()}</p>
                            </div>
                            <p className="text-[9px] text-charcoal/40">{q.date}</p>
                            {i === 0 && <span className="inline-block mt-1.5 text-[8px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold">القادم</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                {assets.filter(a => a.status === 'escrow').map(asset => (
                  <div key={asset.id} className="bg-white p-4 flex items-center gap-3 opacity-60 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                    <Lock size={14} className="text-amber-500 shrink-0" />
                    <div>
                      <p className="text-navy font-bold text-xs">{asset.project?.title}</p>
                      <p className="text-charcoal/50 text-[10px]">في Escrow — سيبدأ جدول التوزيعات بعد اعتماد المشروع</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}

        {/* Portfolio performance chart */}
        {tab === 'performance' && (
          <motion.div key="performance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-5">
            {assets.length === 0 ? (
              <div className="bg-white p-10 text-center text-charcoal/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد استثمارات — لا يوجد أداء لعرضه.</p>
              </div>
            ) : (() => {
              const now = Date.now();
              const months = Array.from({ length: 6 }, (_, i) => {
                const t = now - (5 - i) * 30 * 24 * 3600 * 1000;
                const d = new Date(t);
                const val = assets.reduce((s, a) => {
                  const proj = a.project;
                  const elapsed = Math.max(0, (t - a.timestamp) / (365.25 * 24 * 3600 * 1000));
                  const sp = Math.round(a.sharePrice * (1 + ((proj?.irr ?? 0) / 100) * elapsed));
                  return s + a.shares * sp;
                }, 0);
                return {
                  label: d.toLocaleDateString('ar-SA', { month: 'short' }),
                  val,
                };
              });
              const maxVal = Math.max(...months.map(m => m.val));
              const minVal = Math.min(...months.map(m => m.val));
              const range = maxVal - minVal || 1;
              const gain = months[months.length - 1].val - months[0].val;
              const gainPct = ((gain / months[0].val) * 100).toFixed(1);

              return (
                <>
                  <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-charcoal/50 text-xs mb-1 flex items-center gap-1.5"><BarChart2 size={13} className="text-brand" /> القيمة السوقية — آخر 6 أشهر</p>
                        <p className="text-navy font-black text-2xl">${months[months.length - 1].val.toLocaleString()}</p>
                      </div>
                      <div className={`text-sm font-black flex items-center gap-1 ${gain >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        <TrendingUp size={16} />
                        {gain >= 0 ? '+' : ''}{gainPct}%
                      </div>
                    </div>

                    {/* Bar chart */}
                    <div className="flex items-end gap-2 h-32">
                      {months.map((m, i) => {
                        const heightPct = 15 + Math.round(((m.val - minVal) / range) * 80);
                        const isLast = i === months.length - 1;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <p className="text-[9px] text-charcoal/50 font-bold">${Math.round(m.val / 1000)}K</p>
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPct}%` }}
                              transition={{ duration: 0.6, delay: i * 0.08 }}
                              className={`w-full rounded-t-lg ${isLast ? 'bg-gradient-to-t from-brand to-brand/60' : 'bg-navy/15'}`}
                              style={{ minHeight: 6 }}
                            />
                            <p className="text-[9px] text-charcoal/40">{m.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Per-asset breakdown */}
                  <div className="space-y-3">
                    {assets.map((asset, i) => {
                      const colors = ['bg-brand', 'bg-cta', 'bg-emerald-500', 'bg-amber-500'];
                      const pct = currentPortfolioValue > 0 ? Math.round((asset.currentValue / currentPortfolioValue) * 100) : 0;
                      return (
                        <div key={asset.id} className="bg-white p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${colors[i % colors.length]}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-navy font-bold text-xs truncate mb-1">{asset.project?.title}</p>
                            <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, delay: i * 0.1 }}
                                className={`h-full rounded-full ${colors[i % colors.length]}`}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-navy font-black text-sm">${asset.currentValue.toLocaleString()}</p>
                            <p className="text-[10px] text-charcoal/45">{pct}% من المحفظة</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}

        {/* Secondary market */}
        {tab === 'market' && (
          <motion.div key="market" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-4">
            <div className="bg-brand/10 border border-brand/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-navy mt-0.5 shrink-0" />
              <div>
                <h4 className="text-navy font-bold text-sm mb-1">السوق الثانوي للحصص (سيولة مضمونة)</h4>
                <p className="text-charcoal/60 text-xs leading-relaxed">
                  يسمح هذا السوق بشراء حصص من مستثمرين آخرين. <strong className="text-navy">الأسعار محددة من نظام التقييم الآلي</strong> بناءً على تقدم المشروع، لحماية المستثمرين ومنع المضاربات.
                </p>
              </div>
            </div>
            {SECONDARY_MARKET.length === 0 ? (
              <div className="bg-white p-10 text-center text-charcoal/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <ShoppingCart size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-semibold mb-1">لا توجد عروض متاحة حالياً</p>
                <p className="text-xs">ستظهر هنا حصص المستثمرين المعروضة للبيع عند توفّرها.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {SECONDARY_MARKET.map(listing => (
                  <div key={listing.id} className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-navy font-bold text-sm mb-1">{listing.project}</h4>
                        <p className="text-xs text-charcoal/50">البائع: {listing.seller}</p>
                      </div>
                      <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
                        <TrendingUp size={12} /> +{listing.roiToDate}% نمو
                      </span>
                    </div>
                    <div className="bg-cream rounded-xl p-3 mb-4 flex justify-between items-center border border-navy/5">
                      <div>
                        <p className="text-[10px] text-charcoal/50">الكمية المعروضة</p>
                        <p className="text-navy font-black">{listing.sharesOffered} حصص</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-charcoal/50">السعر (للحصة)</p>
                        <p className="text-cta font-black">${listing.fixedPricePerShare.toLocaleString()}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-charcoal/50">الإجمالي</p>
                        <p className="text-navy font-black">${(listing.sharesOffered * listing.fixedPricePerShare).toLocaleString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleBuyShares(listing)}
                      className="w-full btn-primary py-2.5 text-xs flex items-center justify-center gap-2">
                      <ShoppingCart size={14} /> شراء الحصص المعروضة
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Construction updates */}
        {tab === 'updates' && (
          <motion.div key="updates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="space-y-6">
            {assets.length === 0 ? (
              <div className="bg-white p-10 text-center text-charcoal/50 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <Camera size={36} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد مشاريع نشطة لعرض تحديثاتها.</p>
              </div>
            ) : (
              <div className="relative border-r-2 border-navy/10 pr-6 mr-3 space-y-8">
                {CONSTRUCTION_UPDATES.filter(u =>
                  assets.some(a => a.projectId === u.projectId)
                ).map(update => (
                  <div key={update.id} className="relative">
                    <div className="absolute -right-[33px] top-0 w-4 h-4 rounded-full bg-brand border-4 border-cream" />
                    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      {update.image && (
                        <div className="h-48 overflow-hidden">
                          <img src={update.image} alt={update.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[10px] text-charcoal/50 font-bold tracking-widest mb-2">
                          <Clock size={12} /> {update.date}
                          <span className="text-navy/20">·</span>
                          <span className="text-brand">{update.project}</span>
                        </div>
                        <h4 className="text-navy font-black text-lg mb-2">{update.title}</h4>
                        <p className="text-charcoal/60 text-sm leading-relaxed">{update.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* Sell shares dialog */}
      <AnimatePresence>
        {sellTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-50"
              onClick={() => setSellTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="fixed inset-x-4 bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] bg-white rounded-3xl shadow-2xl z-50 p-6"
              dir="rtl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-navy font-black text-base">عرض حصص للبيع</p>
                  <p className="text-charcoal/50 text-xs mt-0.5 truncate max-w-[260px]">{sellTarget.project?.title}</p>
                </div>
                <button onClick={() => setSellTarget(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 hover:text-navy transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="bg-cream rounded-2xl p-4 mb-4 grid grid-cols-3 gap-3 text-center text-xs border border-navy/8">
                <div>
                  <p className="text-charcoal/45 mb-1">الحصص</p>
                  <p className="text-navy font-black">{sellTarget.shares % 1 === 0 ? sellTarget.shares : sellTarget.shares.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-charcoal/45 mb-1">سعر الشراء</p>
                  <p className="text-navy font-bold">${sellTarget.sharePrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-charcoal/45 mb-1">السعر الحالي</p>
                  <p className="text-emerald-600 font-black">${sellTarget.currentSharePrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1 text-charcoal/60 font-bold">
                    <Tag size={12} className="text-brand" /> سعر العرض للحصة الواحدة
                  </span>
                  <span className="text-navy font-black">${Number(offerPrice).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={Math.round(sellTarget.currentSharePrice * 0.9)}
                  max={Math.round(sellTarget.currentSharePrice * 1.1)}
                  step={100}
                  value={offerPrice}
                  onChange={e => setOfferPrice(Number(e.target.value))}
                  className="w-full accent-brand h-1.5 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-charcoal/35 mt-1">
                  <span>−10% ${Math.round(sellTarget.currentSharePrice * 0.9).toLocaleString()}</span>
                  <span className="text-brand/60 font-semibold">سعر السوق</span>
                  <span>+10% ${Math.round(sellTarget.currentSharePrice * 1.1).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-charcoal/40 mt-2 text-center">
                  الإجمالي: <strong className="text-navy">${(offerPrice * sellTarget.shares).toLocaleString()}</strong> · ±10% من السعر السوقي الحالي
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSellTarget(null)}
                  className="flex-1 py-3 rounded-2xl border border-navy/12 text-charcoal/60 text-sm font-bold hover:bg-cream transition-colors">
                  إلغاء
                </button>
                <button onClick={confirmSell}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand to-navy text-white text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/20">
                  <ArrowUpRight size={15} /> تأكيد العرض
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
