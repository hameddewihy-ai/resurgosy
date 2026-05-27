import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Home, ArrowRight, BadgeCheck, Star, Phone,
  ChevronLeft, ChevronRight, Share2, Heart, CheckCircle,
  Cpu, Building2, Layers, Calendar, Bath, MessageCircle,
  TrendingUp, TrendingDown, Calculator, ZoomIn, X,
  CheckCheck, Ruler, Plus, GitCompare, ChevronDown, ChevronUp,
  Wallet, Clock, Percent, Printer, BarChart3, Scale, Briefcase, Flag,
} from 'lucide-react';
import SEO from '../components/SEO';
import ReviewSection from '../components/ReviewSection';
import { addRecentlyViewed } from '../utils/recentlyViewed';
import NeighborhoodScore from '../components/ui/NeighborhoodScore';
import { useGlobalData } from '../context/GlobalContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import ContactOwnerButton from '../components/messaging/ContactOwnerButton';
import { isSavedProp, toggleSavedProp } from '../utils/savedProps';
import toast from 'react-hot-toast';
import { sendAdminAlert, sendInquiryNotification } from '../utils/emailService';
import { addNotification } from '../components/NotificationsPanel';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// ── Inquiry helpers ───────────────────────────────────────────────────────────
const INQ_KEY       = 'resurgo-inquiries';
const OWNER_INQ_KEY = 'resurgo-received-inquiries';
const APPT_KEY      = 'resurgo-appointments';
function saveInquiryLocal(inquiry) {
  try {
    const all = JSON.parse(localStorage.getItem(INQ_KEY) || '[]');
    all.unshift(inquiry);
    localStorage.setItem(INQ_KEY, JSON.stringify(all.slice(0, 50)));
  } catch { /* ignore */ }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, active, onClose, onPrev, onNext, onSelect }) {
  const thumbsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape')       onClose();
      if (e.key === 'ArrowRight')   onNext();
      if (e.key === 'ArrowLeft')    onPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  // Keep active thumbnail scrolled into view
  useEffect(() => {
    const strip = thumbsRef.current;
    if (!strip) return;
    const btn = strip.children[active];
    if (btn) btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-[9999] flex flex-col items-center justify-center"
      onClick={onClose}>

      {/* Close */}
      <button onClick={onClose} aria-label="إغلاق معرض الصور"
        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white z-10 transition-colors">
        <X size={18} />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-white/50 text-xs tabular-nums">
        {active + 1} / {images.length}
      </div>

      {/* Prev */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
        aria-label="الصورة السابقة"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
        <ChevronRight size={22} />
      </button>

      {/* Next */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }}
        aria-label="الصورة التالية"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
        <ChevronLeft size={22} />
      </button>

      {/* Main image */}
      <AnimatePresence initial={false} mode="wait">
        <motion.img
          key={active}
          initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          src={images[active]} alt={`صورة العقار ${active + 1} من ${images.length}`}
          className="max-w-5xl max-h-[75vh] w-full object-contain px-16"
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          ref={thumbsRef}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 overflow-x-auto max-w-[90vw]"
          style={{ scrollbarWidth: 'none' }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button key={i} onClick={() => onSelect(i)}
              aria-label={`عرض الصورة ${i + 1}`}
              className={`shrink-0 rounded overflow-hidden transition-all ${i === active ? 'ring-2 ring-white opacity-100' : 'opacity-40 hover:opacity-75'}`}
              style={{ width: 60, height: 44 }}>
              <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </button>
          ))}
        </div>
      )}
    </motion.div>,
    document.body
  );
}

// ── Hero Gallery ──────────────────────────────────────────────────────────────
function HeroGallery({ images, title, city, district, status, virtualTourUrl, propertyId }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [saved, setSaved] = useState(() => isSavedProp(propertyId));
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    const { added } = toggleSavedProp(propertyId);
    setSaved(added);
    toast(added ? 'تم الحفظ في المفضّلة ❤️' : 'تم الإزالة من المحفوظات');
  };

  const prev = () => setActive((i) => (i - 1 + images.length) % images.length);
  const next = () => setActive((i) => (i + 1) % images.length);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="relative w-full bg-navy" style={{ height: 'clamp(320px, 52vw, 560px)' }}>
        {showTour ? (
          <iframe 
            src={virtualTourUrl} 
            className="absolute inset-0 w-full h-full border-0" 
            allowFullScreen 
            title="360 Virtual Tour"
          />
        ) : (
          <>
            <AnimatePresence initial={false} mode="wait">
              <motion.img key={active} src={images[active]} alt={title}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer" />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/10 to-transparent pointer-events-none" />
          </>
        )}

        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={copyLink}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-navy/70 hover:text-navy text-xs px-3 py-2 rounded-xl border border-white/20 transition-all">
            {copied ? <CheckCheck size={13} className="text-green-600" /> : <Share2 size={13} />}
            {copied ? 'تم النسخ' : 'مشاركة'}
          </button>
          <button onClick={handleSave}
            className={`flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white text-xs px-3 py-2 rounded-xl border border-white/20 transition-all ${saved ? 'text-red-500' : 'text-navy/70 hover:text-red-400'}`}>
            <Heart size={13} className={saved ? 'fill-red-500' : ''} />
            {saved ? 'محفوظ' : 'حفظ'}
          </button>
        </div>

        {!showTour && (
          <button onClick={() => setLightbox(true)}
            aria-label="عرض الصور بالحجم الكامل"
            className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm hover:bg-white text-navy/60 hover:text-navy px-3 py-2 rounded-xl border border-white/20 transition-all z-10 flex items-center gap-1.5 text-xs font-medium">
            <ZoomIn size={13} /> عرض الكل
          </button>
        )}

        {virtualTourUrl && (
          <button onClick={() => setShowTour(!showTour)}
            className="absolute top-4 left-16 bg-brand hover:bg-brand/90 text-white px-3 py-2 rounded-xl border border-white/20 transition-all z-10 font-bold text-xs flex items-center gap-1">
            <ZoomIn size={15} /> {showTour ? 'إغلاق الجولة' : 'جولة 360°'}
          </button>
        )}

        {!showTour && images.length > 1 && (
          <>
            <button onClick={prev}
              aria-label="الصورة السابقة"
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-sm flex items-center justify-center text-navy hover:bg-white transition-colors rounded-xl shadow-sm">
              <ChevronRight size={18} />
            </button>
            <button onClick={next}
              aria-label="الصورة التالية"
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/85 backdrop-blur-sm flex items-center justify-center text-navy hover:bg-white transition-colors rounded-xl shadow-sm">
              <ChevronLeft size={18} />
            </button>
          </>
        )}

        <div className="absolute bottom-0 right-0 left-0 px-5 py-4 z-10">
          <div className="flex items-end justify-between">
            <div>
              <span className={`inline-flex text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>
                {status}
              </span>
              <p className="text-white font-black text-xl sm:text-2xl leading-[1.4]">{title}</p>
              <p className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
                <MapPin size={12} /> {city} — {district}
              </p>
            </div>
            <span className="text-white/50 text-xs bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-lg">
              {active + 1} / {images.length}
            </span>
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 py-3 bg-white border-b border-navy/8 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button key={i}
              onClick={() => { setActive(i); setLightbox(true); }}
              aria-label={`عرض الصورة ${i + 1} بالحجم الكامل`}
              aria-current={i === active ? 'true' : undefined}
              className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all relative group/thumb ${i === active ? 'border-brand' : 'border-transparent opacity-55 hover:opacity-90'}`}
              style={{ width: 72, height: 56 }}>
              <img src={img} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/thumb:bg-black/25 transition-colors">
                <ZoomIn size={14} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <Lightbox images={images} active={active}
            onClose={() => setLightbox(false)} onPrev={prev} onNext={next}
            onSelect={(i) => setActive(i)} />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Mortgage helpers ──────────────────────────────────────────────────────────
function calcMonthly(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function buildAmortization(principal, annualRate, years) {
  const r = annualRate / 100 / 12;
  const monthly = calcMonthly(principal, annualRate, years);
  let balance = principal;
  const rows = [];
  for (let yr = 1; yr <= years && balance > 0.01; yr++) {
    let yInt = 0, yPrin = 0;
    for (let m = 0; m < 12 && balance > 0.01; m++) {
      const intPmt = balance * r;
      const prinPmt = Math.min(monthly - intPmt, balance);
      yInt  += intPmt;
      yPrin += prinPmt;
      balance = Math.max(0, balance - prinPmt);
    }
    rows.push({ year: yr, interest: yInt, principal: yPrin, balance });
  }
  return rows;
}

// ── Enhanced Mortgage Calculator ──────────────────────────────────────────────
function MortgageCalc({ price }) {
  const [downPct,  setDownPct]  = useState(20);
  const [years,    setYears]    = useState(15);
  const [rate,     setRate]     = useState(7);
  const [tab,      setTab]      = useState('calc');
  const [showAll,  setShowAll]  = useState(false);

  const downAmount     = Math.round(price * downPct / 100);
  const principal      = price - downAmount;
  const monthly        = calcMonthly(principal, rate, years);
  const totalPaid      = monthly * years * 12;
  const totalInterest  = totalPaid - principal;
  const ltv            = Math.round((principal / price) * 100);
  const requiredIncome = Math.round(monthly / 0.33);
  const interestPct    = Math.round((totalInterest / totalPaid) * 100);

  const schedule = useMemo(() => buildAmortization(principal, rate, years), [principal, rate, years]);
  const displayedRows = showAll ? schedule : schedule.slice(0, 5);

  const scenarios = useMemo(() => [rate - 1.5, rate, rate + 1.5].map(r => ({
    rate: Math.max(0.5, r),
    monthly: calcMonthly(principal, Math.max(0.5, r), years),
    total: calcMonthly(principal, Math.max(0.5, r), years) * years * 12,
  })), [principal, rate, years]);

  const TABS = [
    { id: 'calc',      label: 'الحاسبة',     icon: Calculator },
    { id: 'schedule',  label: 'جدول السداد',  icon: Clock },
    { id: 'scenarios', label: 'السيناريوهات', icon: Percent },
  ];

  return (
    <div className="space-y-5">

      {/* Tab bar */}
      <div className="flex gap-1 bg-cream rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg transition-all ${tab === id ? 'bg-white text-navy shadow-sm' : 'text-charcoal/55 hover:text-navy'}`}>
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB: الحاسبة ── */}
      {tab === 'calc' && (
        <div className="space-y-5">
          {/* Sliders */}
          <div className="space-y-4">
            {/* Down payment */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-charcoal/60 text-xs font-medium">الدفعة الأولى</label>
                <div className="flex items-center gap-2">
                  <span className="text-navy font-black text-sm">{downPct}%</span>
                  <span className="text-charcoal/40 text-xs font-mono">{downAmount.toLocaleString()} $</span>
                </div>
              </div>
              <input type="range" min="5" max="50" step="5" value={downPct}
                onChange={(e) => setDownPct(+e.target.value)}
                className="w-full accent-brand" />
              {/* LTV bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-charcoal/40 mb-0.5">
                  <span>القرض {ltv}%</span><span>ملكية {downPct}%</span>
                </div>
                <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand/40 transition-all duration-300" style={{ width: `${ltv}%` }} />
                  <div className="h-full bg-green-400/60 flex-1" />
                </div>
              </div>
            </div>

            {/* Duration + Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-charcoal/60 text-xs font-medium block mb-2">مدة القرض (سنوات)</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[5, 10, 15, 20, 25].map((y) => (
                    <button key={y} onClick={() => setYears(y)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${years === y ? 'bg-brand text-white border-brand font-bold' : 'border-navy/12 text-charcoal/60 hover:border-brand/30 hover:text-navy'}`}>
                      {y}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs font-medium block mb-2">معدل الفائدة السنوي</label>
                <div className="flex items-center gap-2">
                  <input type="number" min="0.5" max="20" step="0.5" value={rate}
                    onChange={(e) => setRate(Math.max(0.5, +e.target.value))}
                    className="w-20 border border-navy/15 rounded-xl px-3 py-2 text-navy font-mono text-sm font-bold focus:outline-none focus:border-brand/40 text-center" />
                  <span className="text-charcoal/50 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="border border-navy/10 rounded-2xl overflow-hidden">
            {/* Monthly payment — hero */}
            <div className="bg-navy px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs">القسط الشهري</p>
                <p className="text-white font-black text-2xl sm:text-3xl mt-0.5">
                  {Math.round(monthly).toLocaleString()} <span className="text-white/50 text-base font-medium">$/شهر</span>
                </p>
              </div>
              <Wallet size={32} className="text-brand/60" />
            </div>

            {/* Breakdown */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ['القرض', `${principal.toLocaleString()} $`, 'text-navy'],
                  ['إجمالي الدفعات', `${Math.round(totalPaid).toLocaleString()} $`, 'text-charcoal/70'],
                  ['إجمالي الفوائد', `${Math.round(totalInterest).toLocaleString()} $`, 'text-amber-600'],
                ].map(([label, val, color]) => (
                  <div key={label} className="bg-cream rounded-xl p-3 text-center">
                    <p className={`font-black text-sm ${color}`}>{val}</p>
                    <p className="text-charcoal/45 text-[10px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Principal vs Interest visual bar */}
              <div>
                <div className="flex justify-between text-[10px] text-charcoal/50 mb-1">
                  <span>أصل القرض {100 - interestPct}%</span>
                  <span>فوائد {interestPct}%</span>
                </div>
                <div className="h-2 bg-navy/8 rounded-full overflow-hidden flex">
                  <div className="h-full bg-brand transition-all duration-500" style={{ width: `${100 - interestPct}%` }} />
                  <div className="h-full bg-amber-400 flex-1" />
                </div>
              </div>

              {/* Required income indicator */}
              <div className="flex items-center justify-between bg-brand/5 border border-brand/15 rounded-xl px-4 py-3 text-xs">
                <span className="text-charcoal/65">الدخل الشهري المقترح (قاعدة 33%)</span>
                <span className="text-navy font-black font-mono">{requiredIncome.toLocaleString()} $</span>
              </div>
            </div>
          </div>

          <p className="text-charcoal/35 text-[10px] text-center">الأرقام تقريبية · لا تُعدّ استشارة مالية</p>
        </div>
      )}

      {/* ── TAB: جدول السداد ── */}
      {tab === 'schedule' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-charcoal/50">
            <span>السنة</span>
            <div className="flex gap-6">
              <span>فوائد</span>
              <span>أصل</span>
              <span>الرصيد المتبقي</span>
            </div>
          </div>
          <div className="space-y-1">
            {displayedRows.map(({ year, interest, principal: prin, balance }) => {
              const balancePct = Math.round((balance / principal) * 100);
              return (
                <div key={year} className="border border-navy/8 rounded-xl px-3 py-2.5 hover:bg-cream/60 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-charcoal/50 font-mono w-10">س {year}</span>
                    <div className="flex gap-5 text-right">
                      <span className="text-amber-600 font-mono w-20 text-left">{Math.round(interest).toLocaleString()}</span>
                      <span className="text-brand font-mono w-20 text-left">{Math.round(prin).toLocaleString()}</span>
                      <span className="text-navy font-bold font-mono w-24 text-left">{Math.round(balance).toLocaleString()} $</span>
                    </div>
                  </div>
                  <div className="h-1 bg-navy/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-brand to-brand/30 transition-all duration-500 rounded-full"
                      style={{ width: `${100 - balancePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          {schedule.length > 5 && (
            <button onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-charcoal/60 hover:text-navy border border-navy/10 hover:border-brand/20 rounded-xl py-2.5 transition-all">
              {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showAll ? 'عرض أقل' : `عرض باقي ${schedule.length - 5} سنوات`}
            </button>
          )}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy/8 text-center text-[10px]">
            <div><p className="text-amber-600 font-black text-sm">{Math.round(totalInterest).toLocaleString()}</p><p className="text-charcoal/45">إجمالي الفوائد $</p></div>
            <div><p className="text-brand font-black text-sm">{Math.round(principal).toLocaleString()}</p><p className="text-charcoal/45">أصل القرض $</p></div>
            <div><p className="text-navy font-black text-sm">{Math.round(totalPaid).toLocaleString()}</p><p className="text-charcoal/45">إجمالي الدفعات $</p></div>
          </div>
        </div>
      )}

      {/* ── TAB: السيناريوهات ── */}
      {tab === 'scenarios' && (
        <div className="space-y-3">
          <p className="text-charcoal/55 text-xs">مقارنة ثلاثة معدلات فائدة بنفس الشروط</p>
          <div className="grid grid-cols-3 gap-2">
            {scenarios.map((sc, i) => {
              const isCurrent = i === 1;
              const cheapest  = i === 0;
              return (
                <div key={sc.rate}
                  className={`rounded-2xl border-2 overflow-hidden transition-all ${isCurrent ? 'border-brand' : cheapest ? 'border-green-200' : 'border-red-100'}`}>
                  <div className={`px-3 py-2 text-center text-xs font-bold ${isCurrent ? 'bg-brand text-white' : cheapest ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {sc.rate.toFixed(1)}%
                    {isCurrent && <span className="mr-1 opacity-70">(حالي)</span>}
                  </div>
                  <div className="p-3 space-y-2.5 text-center">
                    <div>
                      <p className="text-[10px] text-charcoal/45">القسط الشهري</p>
                      <p className="text-navy font-black text-base">{Math.round(sc.monthly).toLocaleString()}</p>
                      <p className="text-charcoal/35 text-[10px]">$/شهر</p>
                    </div>
                    <div className="pt-2 border-t border-navy/8">
                      <p className="text-[10px] text-charcoal/45">إجمالي الدفعات</p>
                      <p className={`font-bold text-sm ${cheapest ? 'text-green-600' : i === 2 ? 'text-red-500' : 'text-navy'}`}>
                        {Math.round(sc.total).toLocaleString()} $
                      </p>
                    </div>
                    {!isCurrent && (
                      <div className={`text-[10px] font-bold px-2 py-1 rounded-lg ${cheapest ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {cheapest ? '−' : '+'}{Math.round(Math.abs(sc.total - scenarios[1].total)).toLocaleString()} $
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-charcoal/35 text-[10px] text-center">
            فرق ±1.5% قد يُغيّر الإجمالي بمقدار {Math.round(Math.abs(scenarios[2].total - scenarios[0].total)).toLocaleString()} $
          </p>
        </div>
      )}
    </div>
  );
}

// ── Neighborhood Panel ────────────────────────────────────────────────────────
const NEIGHBORHOOD_LABELS = {
  schools:   { label: 'المدارس والتعليم', icon: '🏫' },
  hospitals: { label: 'المستشفيات والصحة', icon: '🏥' },
  transport: { label: 'المواصلات العامة',  icon: '🚌' },
  shopping:  { label: 'التسوق والخدمات',   icon: '🛒' },
  security:  { label: 'الأمن والسلامة',    icon: '🛡️' },
};
function NeighborhoodPanel({ neighborhood }) {
  if (!neighborhood) return null;
  const avg = Math.round(Object.values(neighborhood).reduce((a, b) => a + b, 0) / Object.keys(neighborhood).length);
  const scoreColor = avg >= 4 ? 'text-green-600' : avg >= 3 ? 'text-amber-600' : 'text-red-500';
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-charcoal/55 text-xs">تقييم شامل للحي بناءً على 5 معايير</p>
        <span className={`font-black text-2xl ${scoreColor}`}>{avg}<span className="text-sm font-normal text-charcoal/40">/5</span></span>
      </div>
      {Object.entries(NEIGHBORHOOD_LABELS).map(([key, { label, icon }]) => {
        const val = neighborhood[key] ?? 0;
        const barColor = val >= 4 ? 'bg-green-500' : val >= 3 ? 'bg-amber-400' : 'bg-red-400';
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-base w-6 shrink-0">{icon}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-charcoal/70 font-medium">{label}</span>
                <span className="text-xs font-bold text-navy">{val}/5</span>
              </div>
              <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${val * 20}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Rental Yield Calculator ────────────────────────────────────────────────────
function RentalYieldCalc({ price }) {
  const [monthlyRent, setMonthlyRent] = useState('');
  const rent   = Number(monthlyRent);
  const annual = rent * 12;
  const yieldPct = price > 0 && rent > 0 ? ((annual / price) * 100).toFixed(2) : null;
  const yieldColor = yieldPct >= 7 ? 'text-green-600' : yieldPct >= 4 ? 'text-amber-600' : 'text-red-500';
  return (
    <div className="space-y-4">
      <p className="text-charcoal/55 text-xs">أدخل الإيجار الشهري المتوقع لحساب العائد الاستثماري السنوي</p>
      <div>
        <label className="text-xs text-charcoal/50 font-semibold block mb-1.5">الإيجار الشهري المتوقع ($)</label>
        <input
          type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)}
          placeholder="مثال: 800" min="0"
          className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-sm text-navy focus:outline-none focus:border-brand/40 bg-cream/50"
        />
      </div>
      {yieldPct !== null && (
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 bg-cream rounded-xl">
            <p className="text-[10px] text-charcoal/45 mb-1">الإيجار السنوي</p>
            <p className="text-navy font-black text-sm">{annual.toLocaleString()} $</p>
          </div>
          <div className="text-center p-3 bg-cream rounded-xl">
            <p className="text-[10px] text-charcoal/45 mb-1">العائد السنوي</p>
            <p className={`font-black text-lg ${yieldColor}`}>{yieldPct}%</p>
          </div>
          <div className="text-center p-3 bg-cream rounded-xl">
            <p className="text-[10px] text-charcoal/45 mb-1">سنوات الاسترداد</p>
            <p className="text-navy font-black text-sm">{(100 / Number(yieldPct)).toFixed(1)} سنة</p>
          </div>
        </div>
      )}
      {yieldPct !== null && (
        <p className={`text-xs font-semibold text-center py-2 px-3 rounded-xl ${yieldPct >= 7 ? 'bg-green-50 text-green-700' : yieldPct >= 4 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
          {yieldPct >= 7 ? '✓ عائد ممتاز — يتجاوز متوسط السوق' : yieldPct >= 4 ? '~ عائد مقبول — ضمن المتوسط' : '↓ عائد منخفض — راجع توقعاتك'}
        </p>
      )}
    </div>
  );
}

// ── Valuation Panel ───────────────────────────────────────────────────────────
function ValuationPanel({ price, avm }) {
  const diff  = avm - price;
  const pct   = Math.abs(Math.round((diff / price) * 100));
  const above = diff > 0;
  const barWidth = Math.min(100, 50 + pct * 3);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-charcoal/55 text-xs mb-0.5">تقييم المختصين المعتمدين من فريق العمل</p>
          <p className="text-navy font-black text-2xl">{avm.toLocaleString()} $</p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border shrink-0 ${above ? 'bg-green-50 border-green-200 text-green-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
          {above ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {above ? `أعلى بـ ${pct}%` : `أدنى بـ ${pct}%`}
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-charcoal/50 font-medium uppercase tracking-wider">
          <span>سعر الطلب</span><span>تقييم المختصين</span>
        </div>
        <div className="relative h-2 bg-navy/8 rounded-full overflow-hidden">
          <div className="absolute right-0 top-0 h-full bg-brand/25 rounded-full" style={{ width: '50%' }} />
          <div className={`absolute right-0 top-0 h-full rounded-full transition-all duration-700 ${above ? 'bg-green-400' : 'bg-amber-400'}`}
            style={{ width: `${barWidth}%` }} />
        </div>
        <div className="flex justify-between text-xs font-mono text-charcoal/60">
          <span>{price.toLocaleString()} $</span>
          <span>{avm.toLocaleString()} $</span>
        </div>
      </div>
      <p className="text-charcoal/40 text-[10px] flex items-center gap-1">
        <BadgeCheck size={10} /> تقييم معتمد مدعوم بتحليل بيانات متقدم لـ 147 صفقة مشابهة
      </p>
    </div>
  );
}

// ── Price History Chart ───────────────────────────────────────────────────────
function PriceHistoryChart({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-48 mt-6" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
          <YAxis domain={['auto', 'auto']} hide />
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <Tooltip 
            formatter={(value) => [`$${value.toLocaleString()}`, 'السعر']} 
            labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Area type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Property Comparison ───────────────────────────────────────────────────────
const COMPARE_ROWS = [
  { key: 'price',     label: 'السعر',       fmt: (p) => `${p.priceDisplay}`,      better: 'lower',  unit: '' },
  { key: 'priceM2',  label: 'السعر / م²',   fmt: (p) => `${Math.round(p.price / p.area).toLocaleString()} $`, better: 'lower', unit: '' },
  { key: 'area',     label: 'المساحة',      fmt: (p) => `${p.area} م²`,           better: 'higher', unit: '' },
  { key: 'rooms',    label: 'الغرف',        fmt: (p) => p.rooms > 0 ? `${p.rooms}` : '—',          better: 'higher', unit: '' },
  { key: 'baths',    label: 'الحمامات',     fmt: (p) => p.baths > 0 ? `${p.baths}` : '—',          better: 'higher', unit: '' },
  { key: 'floor',    label: 'الطابق',       fmt: (p) => p.floor > 0 ? `${p.floor}` : 'أرضي',       better: 'neutral',unit: '' },
  { key: 'rating',   label: 'التقييم',      fmt: (p) => '★'.repeat(p.rating),     better: 'higher', unit: '' },
  { key: 'city',     label: 'المدينة',      fmt: (p) => p.city,                   better: 'neutral',unit: '' },
  { key: 'district', label: 'الحي',         fmt: (p) => p.district,               better: 'neutral',unit: '' },
  { key: 'verified', label: 'موثّق',        fmt: (p) => p.verified ? 'نعم ✓' : 'لا', better: 'higher',unit: '' },
  { key: 'avm',      label: 'التقييم التقديري',  fmt: (p) => p.avm ? `${p.avm.toLocaleString()} $` : '—', better: 'higher',unit: '' },
];

function getCompareVal(p, key) {
  if (key === 'priceM2') return p.price / p.area;
  if (key === 'verified') return p.verified ? 1 : 0;
  return p[key] ?? 0;
}

function CompareCell({ p, row, others, isBase }) {
  const val = getCompareVal(p, row.key);
  const otherVals = others.map((o) => getCompareVal(o, row.key));
  let highlight = '';
  if (row.better !== 'neutral' && otherVals.length > 0) {
    const best = row.better === 'lower' ? Math.min(...otherVals, val) : Math.max(...otherVals, val);
    const worst = row.better === 'lower' ? Math.max(...otherVals, val) : Math.min(...otherVals, val);
    if (val === best) highlight = 'bg-green-50 text-green-700';
    else if (val === worst) highlight = 'bg-red-50/60 text-red-600';
  }

  return (
    <td className={`px-3 py-2.5 text-xs font-medium text-center ${highlight} ${isBase ? 'font-bold' : ''}`}>
      {row.fmt(p)}
    </td>
  );
}

function CompareSection({ current, allProperties }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [open, setOpen] = useState(false);

  const candidates = allProperties.filter(
    (p) => p.id !== current.id && !selectedIds.includes(p.id)
  );

  const selected = allProperties.filter((p) => selectedIds.includes(p.id));
  const all = [current, ...selected];

  const toggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  return (
    <div className="space-y-4">
      {/* Picker */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-charcoal/55 text-xs">أضف حتى عقارَين للمقارنة جنباً إلى جنب</p>
          {selectedIds.length === 2 && (
            <p className="text-[10px] text-charcoal/40 mt-0.5">الحد الأقصى — أزل أحدهما لإضافة آخر</p>
          )}
        </div>
        <button onClick={() => { setSelectedIds([]); setOpen(false); }}
          className="text-[11px] text-charcoal/45 hover:text-navy border border-navy/10 px-3 py-1 rounded-lg transition-colors">
          مسح الكل
        </button>
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selected.map((p) => (
            <div key={p.id}
              className="flex items-center gap-2 bg-brand/8 border border-brand/20 rounded-xl px-3 py-1.5 text-xs text-navy">
              <span className="truncate max-w-[140px]">{p.title}</span>
              <button onClick={() => toggle(p.id)} className="text-charcoal/50 hover:text-red-500 transition-colors shrink-0">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Candidate list */}
      <div>
        <button onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-2 border border-navy/12 hover:border-brand/30 rounded-xl px-4 py-3 text-xs text-charcoal/65 hover:text-navy transition-all">
          <span className="flex items-center gap-2">
            <Plus size={13} /> اختر عقاراً للمقارنة
          </span>
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden">
              <div className="mt-2 border border-navy/10 rounded-xl overflow-hidden divide-y divide-navy/[0.06] max-h-56 overflow-y-auto">
                {candidates.length === 0 && (
                  <p className="text-charcoal/40 text-xs text-center py-4">لا توجد عقارات متاحة للمقارنة</p>
                )}
                {candidates.map((p) => (
                  <button key={p.id} onClick={() => { toggle(p.id); if (selectedIds.length === 1) setOpen(false); }}
                    disabled={selectedIds.length >= 2}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-cream/60 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-right">
                    <img src={p.images[0]} alt="" className="w-10 h-8 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-navy text-xs font-medium truncate">{p.title}</p>
                      <p className="text-charcoal/45 text-[10px]">{p.city} · {p.priceDisplay}</p>
                    </div>
                    <Plus size={13} className="text-charcoal/40 shrink-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Comparison table */}
      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="border border-navy/10 rounded-2xl overflow-hidden">
          {/* Property header row */}
          <div className="grid overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-navy/10">
                  <th className="text-right px-3 py-2 text-charcoal/40 font-medium w-24">المعيار</th>
                  {all.map((p, i) => (
                    <th key={p.id} className={`text-center px-3 py-3 ${i === 0 ? 'bg-brand/5' : ''}`}>
                      <div className="space-y-1.5">
                        <img src={p.images[0]} alt="" className="w-16 h-11 object-cover rounded-lg mx-auto" />
                        <p className={`font-bold leading-snug ${i === 0 ? 'text-brand' : 'text-navy'} text-[10px]`}>
                          {i === 0 && <span className="block text-brand/60 text-[9px] uppercase tracking-wider mb-0.5">الحالي</span>}
                          <span className="line-clamp-2">{p.title}</span>
                        </p>
                        <p className="text-charcoal/50 text-[10px] font-mono">{p.priceDisplay}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/[0.06]">
                {COMPARE_ROWS.map((row) => (
                  <tr key={row.key} className="hover:bg-cream/30 transition-colors">
                    <td className="px-3 py-2.5 text-[11px] text-charcoal/50 font-medium whitespace-nowrap">
                      {row.label}
                    </td>
                    {all.map((p, i) => (
                      <CompareCell key={p.id} p={p} row={row} others={all.filter((_, j) => j !== i)} isBase={i === 0} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 bg-cream/50 border-t border-navy/8 flex items-center gap-2 text-[10px] text-charcoal/40">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300 shrink-0" /> أفضل قيمة
            <span className="w-2.5 h-2.5 rounded-sm bg-red-50 border border-red-200 shrink-0 mr-2" /> أدنى قيمة
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ── Contact Sidebar Card ───────────────────────────────────────────────────────
const TIME_SLOTS = ['9:00 ص', '11:00 ص', '2:00 م', '4:00 م', '6:00 م'];

function ContactCard({ property }) {
  const [cardTab, setCardTab]         = useState('inquiry'); // 'inquiry' | 'viewing'
  const [sent, setSent]               = useState(false);
  const [sending, setSending]         = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [msg, setMsg]   = useState(
    `أودّ الاستفسار عن: ${property.title} — رقم المرجع SY-${String(property.id).padStart(4, '0')}`
  );
  const [selDay,      setSelDay]      = useState(null);
  const [selTime,     setSelTime]     = useState(null);
  const [apptBooked,  setApptBooked]  = useState(false);

  const nextDays = useMemo(() => Array.from({ length: 5 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d;
  }), []);

  const waMsg = encodeURIComponent(msg);
  const { pushCrossHint } = useGlobalData();

  const handleBookViewing = () => {
    if (!selDay || !selTime) return;
    const dateStr = selDay.toLocaleDateString('ar-SY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    try {
      const all = JSON.parse(localStorage.getItem(APPT_KEY) || '[]');
      all.unshift({
        id: Date.now(), propertyId: property.id, propertyTitle: property.title,
        ownerName: property.ownerName, date: dateStr, time: selTime, status: 'مُجدول',
      });
      localStorage.setItem(APPT_KEY, JSON.stringify(all.slice(0, 50)));
    } catch { /* silent */ }

    if (isConfigured && user) {
      supabase.from('viewing_appointments').insert({
        user_id:        user.id,
        property_id:    String(property.id),
        property_title: property.title,
        owner_id:       property.owner_id  || null,
        owner_name:     property.ownerName || null,
        appt_date:      dateStr,
        appt_time:      selTime,
        status:         'مُجدول',
      }).catch(() => {});
    }

    toast.success('تم حجز موعد المعاينة!');
    setApptBooked(true);
    
    // إرسال إيميل للإدارة
    sendAdminAlert('hameddewihy@gmail.com', 'طلب حجز معاينة جديد', {
      PropertyTitle: property.title,
      Date: selDay.toLocaleDateString('ar-SY'),
      Time: selTime
    }).catch(() => {});

    pushCrossHint({ emoji: '🔨', text: 'جاهز لإكساء هذا العقار؟ احصل على عروض أسعار من شركات موثقة', label: 'منصة الإكساء', to: '/finishing' });
  };

  const { user } = useAuth();

  const handleSend = async () => {
    if (!msg.trim() || sending) return;
    setSending(true);
    pushCrossHint({ emoji: '📊', text: 'هل تريد تقييماً هندسياً لهذا العقار؟', label: 'طلب تقييم', to: '/valuation-request' });

    try {
      if (isConfigured && user) {
        const { error } = await supabase.from('inquiries').insert({
          sender_id:      user.id,
          owner_id:       property.owner_id || null,
          property_id:    String(property.id),
          property_title: property.title,
          property_img:   property.images?.[0] || null,
          owner_name:     property.ownerName   || null,
          sender_name:    user.full_name        || null,
          sender_phone:   user.phone            || null,
          message:        msg.trim(),
          status:         'جديد',
        });
        if (error) throw error;
        // إشعار داخلي للمالك
        if (property.owner_id) {
          addNotification({
            user_id: property.owner_id,
            type:    'property',
            title:   'استفسار جديد على عقارك',
            body:    `${user.full_name || 'زائر'}: ${msg.trim().slice(0, 80)}`,
            link:    '/dashboard',
          });
        }
      } else {
        const date = new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' });
        saveInquiryLocal({
          id: Date.now(), propertyId: property.id, propertyTitle: property.title,
          propertyImg: property.images?.[0], ownerName: property.ownerName,
          message: msg.trim(), date, status: 'مُرسَل',
        });
        try {
          const received = JSON.parse(localStorage.getItem(OWNER_INQ_KEY) || '[]');
          received.unshift({
            id: `ri-${Date.now()}`, senderName: 'زائر', senderPhone: '',
            propertyTitle: property.title, propertyId: property.id,
            message: msg.trim(), date, status: 'جديد',
          });
          localStorage.setItem(OWNER_INQ_KEY, JSON.stringify(received.slice(0, 100)));
        } catch { /* silent */ }
      }
      setSent(true);

      // إشعار إيميل للمالك
      if (property.owner_id) {
        sendInquiryNotification(
          property.owner_id,
          property.title,
          user?.full_name || 'زائر',
          user?.phone    || '',
          msg.trim()
        );
      }
      // إشعار إيميل للإدارة
      sendAdminAlert('hameddewihy@gmail.com', 'استفسار جديد عن عقار', {
        PropertyTitle: property.title,
        SenderName: user?.full_name || 'زائر',
        SenderPhone: user?.phone || '',
        Message: msg.trim()
      }).catch(() => {});
      
    } catch {
      toast.error('تعذّر إرسال الاستفسار، يرجى المحاولة مجدداً');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Owner row */}
      <div className="flex items-center gap-3 pb-3 border-b border-navy/10">
        <div className="w-10 h-10 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-base font-black text-brand shrink-0">
          {(property.ownerName ?? 'م')[0]}
        </div>
        <div>
          <p className="text-navy font-bold text-sm">{property.ownerName ?? 'مالك خاص'}</p>
          <p className="text-charcoal/55 text-xs flex items-center gap-1 mt-0.5">
            <CheckCircle size={11} className="text-green-500" /> مالك موثّق
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy/[0.04] rounded-xl p-1">
        {[['inquiry', 'استفسار'], ['viewing', 'حجز معاينة']].map(([id, label]) => (
          <button key={id} onClick={() => setCardTab(id)}
            aria-pressed={cardTab === id}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${cardTab === id ? 'bg-white text-navy shadow-sm' : 'text-charcoal/70 hover:text-navy'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Inquiry tab ── */}
      {cardTab === 'inquiry' && (!sent ? (
        <div className="space-y-2.5">
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3}
            className="w-full border border-navy/12 rounded-xl px-3 py-2.5 text-navy text-xs leading-relaxed focus:outline-none focus:border-brand/40 resize-none bg-cream/50"
            dir="rtl" />
          <a href={`https://wa.me/${property.ownerPhone?.replace(/\D/g, '') ?? ''}?text=${waMsg}`}
            target="_blank" rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl text-sm transition-colors">
            <MessageCircle size={16} /> واتساب — تواصل الآن
          </a>
          <button onClick={handleSend} disabled={sending || !msg.trim()}
            className="w-full btn-cta text-sm flex items-center justify-center gap-2">
            {sending ? <span className="spinner border-white/60 border-t-white" /> : <Phone size={14} />}
            {sending ? 'جارٍ الإرسال...' : 'إرسال استفسار داخلي'}
          </button>
          {property.ownerPhone && (
            phoneVisible ? (
              <a href={`tel:${property.ownerPhone}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-navy/12 hover:border-brand/30 text-charcoal/60 hover:text-brand rounded-xl text-xs transition-colors font-mono">
                <Phone size={13} /> {property.ownerPhone}
              </a>
            ) : (
              <button onClick={() => setPhoneVisible(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-navy/12 hover:border-brand/30 text-charcoal/60 hover:text-brand rounded-xl text-xs transition-colors font-medium">
                <Phone size={13} /> عرض رقم الهاتف
              </button>
            )
          )}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="w-11 h-11 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={22} className="text-green-500" />
          </div>
          <p className="text-green-600 font-bold text-sm">تم إرسال الاستفسار</p>
          <p className="text-charcoal/50 text-xs mt-1">
            يمكنك متابعة الردود من{' '}
            <a href="/dashboard" className="text-brand hover:underline">لوحة التحكم</a>
          </p>
          <button onClick={() => setSent(false)} className="text-brand text-xs hover:underline mt-3">
            إرسال استفسار آخر
          </button>
        </div>
      ))}

      {/* ── Viewing tab ── */}
      {cardTab === 'viewing' && (apptBooked ? (
        <div className="text-center py-5">
          <div className="w-11 h-11 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={22} className="text-brand" />
          </div>
          <p className="text-navy font-bold text-sm">تم حجز الموعد!</p>
          <p className="text-charcoal/50 text-xs mt-1">
            {selDay?.toLocaleDateString('ar-SY', { weekday: 'long', month: 'long', day: 'numeric' })} — {selTime}
          </p>
          <button onClick={() => { setApptBooked(false); setSelDay(null); setSelTime(null); }}
            className="text-brand text-xs hover:underline mt-3 block mx-auto">
            حجز موعد آخر
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Day selector */}
          <div>
            <p className="text-xs text-charcoal/50 font-semibold mb-2">اختر اليوم</p>
            <div className="flex gap-1.5">
              {nextDays.map((d, i) => {
                const active = selDay?.toDateString() === d.toDateString();
                return (
                  <button key={i} onClick={() => setSelDay(d)}
                    className={`flex-1 flex flex-col items-center py-2 px-0.5 rounded-xl border text-[10px] transition-all ${active ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                    <span>{d.toLocaleDateString('ar', { weekday: 'short' })}</span>
                    <span className="font-black text-sm mt-0.5">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Time slots */}
          <div>
            <p className="text-xs text-charcoal/50 font-semibold mb-2">اختر الوقت</p>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.map(t => (
                <button key={t} onClick={() => setSelTime(t)}
                  className={`py-1.5 rounded-xl border text-xs font-medium transition-all ${selTime === t ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleBookViewing} disabled={!selDay || !selTime}
            className="w-full btn-cta text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <CheckCircle size={14} /> تأكيد الموعد
          </button>
        </div>
      ))}

      <p className="text-charcoal/35 text-[10px] text-center pt-2 border-t border-navy/8">
        رقم المرجع: <span className="font-mono">SY-{String(property.id).padStart(4, '0')}</span>
      </p>
    </div>
  );
}

// ── Map ───────────────────────────────────────────────────────────────────────
function MapBox({ lat, lng, city, district }) {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.015},${lat - 0.01},${lng + 0.015},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div className="rounded-2xl overflow-hidden border border-navy/10">
      <iframe title="موقع العقار" src={osmUrl} width="100%" height="220"
        style={{ border: 0, display: 'block' }} loading="lazy" referrerPolicy="no-referrer" />
      <div className="bg-cream px-4 py-2.5 flex items-center gap-2 text-xs text-charcoal/60 border-t border-navy/8">
        <MapPin size={12} className="text-brand shrink-0" />
        {city} — {district}
        <span className="mr-auto font-mono text-charcoal/35">{lat.toFixed(4)}, {lng.toFixed(4)}</span>
      </div>
    </div>
  );
}

// ── Similar Card ──────────────────────────────────────────────────────────────
function SimilarCard({ property: p }) {
  return (
    <Link to={`/properties/${p.id}`} className="group flex-shrink-0 w-56 sm:w-auto">
      <div className="border border-navy/10 rounded-2xl overflow-hidden hover:border-brand/30 hover:shadow-sm transition-all bg-white">
        <div className="relative h-32 overflow-hidden">
          <img src={p.images[0]} alt={p.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'للبيع' ? 'bg-cta text-white' : 'bg-brand text-white'}`}>
            {p.status}
          </span>
        </div>
        <div className="p-3">
          <p className="text-navy font-bold text-xs leading-snug line-clamp-2 mb-1.5">{p.title}</p>
          <div className="flex items-center justify-between">
            <p className="text-brand font-black text-sm">{p.priceDisplay}</p>
            <p className="text-charcoal/45 text-[10px] flex items-center gap-0.5">
              <Ruler size={10} /> {p.area} م²
            </p>
          </div>
          <p className="text-charcoal/45 text-[10px] flex items-center gap-1 mt-1">
            <MapPin size={9} /> {p.district}
          </p>
        </div>
      </div>
    </Link>
  );
}

// ── Section Heading ───────────────────────────────────────────────────────────
function SectionH({ children }) {
  return (
    <h2 className="text-navy font-black text-base mb-4 flex items-center gap-2.5">
      <span className="w-1 h-5 bg-brand rounded-full shrink-0" />
      {children}
    </h2>
  );
}

// ── Report Modal ─────────────────────────────────────────────────────────────
const REPORT_KEY = 'resurgo-reports';
const REPORT_REASONS = ['إعلان مزيف أو احتيالي', 'السعر غير صحيح أو مضلل', 'صور مضللة أو غير حقيقية', 'معلومات ناقصة أو خاطئة', 'محتوى مسيء أو غير لائق'];

function ReportModal({ property, onClose }) {
  const [reason, setReason] = useState('');
  const [note,   setNote]   = useState('');
  const [done,   setDone]   = useState(false);
  const modalRef             = useRef(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll('button, textarea, input, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    first?.focus();
    const trapTab = (e) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first?.focus(); } }
    };
    const closeOnEsc = (e) => { if (e.key === 'Escape') onClose(); };
    modal.addEventListener('keydown', trapTab);
    document.addEventListener('keydown', closeOnEsc);
    return () => { modal.removeEventListener('keydown', trapTab); document.removeEventListener('keydown', closeOnEsc); };
  }, [onClose]);

  const handleSubmit = () => {
    if (!reason) return;
    try {
      const all = JSON.parse(localStorage.getItem(REPORT_KEY) || '[]');
      all.unshift({ id: Date.now(), propertyId: property.id, propertyTitle: property.title, reason, note: note.trim(), date: new Date().toISOString() });
      localStorage.setItem(REPORT_KEY, JSON.stringify(all.slice(0, 200)));
    } catch { /* silent */ }
    toast.success('تم إرسال البلاغ — شكراً على مساعدتك');
    setDone(true);
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="الإبلاغ عن إعلان"
        initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-green-500" />
            </div>
            <p className="text-navy font-bold text-sm">تم إرسال البلاغ</p>
            <p className="text-charcoal/50 text-xs mt-1">سنراجعه في أقرب وقت</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag size={15} className="text-red-500" />
                <p className="text-navy font-bold text-sm">الإبلاغ عن إعلان</p>
              </div>
              <button onClick={onClose} className="text-charcoal/40 hover:text-navy transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-charcoal/50 text-xs mb-3">اختر سبب البلاغ:</p>
            <div className="space-y-1.5 mb-4">
              {REPORT_REASONS.map(r => (
                <button key={r} onClick={() => setReason(r)}
                  className={`w-full text-right text-xs px-3 py-2.5 rounded-xl border transition-all ${reason === r ? 'bg-red-50 border-red-300 text-red-700 font-semibold' : 'border-navy/12 text-charcoal/70 hover:border-red-200 hover:bg-red-50/50'}`}>
                  {r}
                </button>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="ملاحظات إضافية (اختياري)..."
              className="w-full border border-navy/12 rounded-xl px-3 py-2 text-xs text-navy resize-none focus:outline-none focus:border-red-300 bg-cream/50 mb-3" />
            <div className="flex gap-2">
              <button onClick={handleSubmit} disabled={!reason}
                className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                إرسال البلاغ
              </button>
              <button onClick={onClose}
                className="px-4 border border-navy/12 text-charcoal/60 text-xs rounded-xl hover:text-navy transition-colors">
                إلغاء
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Sticky Top Bar ────────────────────────────────────────────────────────────
function StickyBar({ property }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60 }} animate={{ y: 0 }} exit={{ y: -60 }}
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-navy/10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${property.status === 'للبيع' ? 'bg-cta/10 text-cta' : 'bg-brand/10 text-brand'}`}>
                {property.status}
              </span>
              <p className="text-navy font-bold text-sm truncate">{property.title}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className="text-navy font-black text-lg hidden sm:block">{property.priceDisplay}</p>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 border border-navy/15 text-charcoal/60 hover:text-brand hover:border-brand/30 text-xs font-medium px-3 py-2 rounded-xl transition-colors print:hidden">
                <Printer size={13} /> PDF
              </button>
              <a href={`https://wa.me/${property.ownerPhone?.replace(/\D/g, '') ?? ''}`}
                target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                <MessageCircle size={14} /> واتساب
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const DETAIL_TYPE_MAP = { residential: 'سكني', commercial: 'تجاري', industrial: 'صناعي', land: 'أرض' };

function normalizeDbProperty(p) {
  return {
    id:           p.id,
    title:        p.title        || '',
    city:         p.city         || p.province || '',
    district:     p.province     || '',
    type:         DETAIL_TYPE_MAP[p.property_type] || 'سكني',
    status:       p.listing_type === 'rent' ? 'للإيجار' : 'للبيع',
    currency:     'USD',
    price:        p.price_estimate || p.rent_price || 0,
    priceDisplay: p.listing_type === 'rent'
      ? (p.rent_price     ? `$${Number(p.rent_price).toLocaleString()}/شهر` : '—')
      : (p.price_estimate ? `$${Number(p.price_estimate).toLocaleString()}`  : '—'),
    area:         p.area         || 0,
    rooms:        p.bedrooms     || 0,
    baths:        p.bathrooms    || 0,
    floor:        p.floor        || 0,
    lat:          p.lat,
    lng:          p.lng,
    images:       Array.isArray(p.images) ? p.images : [],
    tags:         p.amenities    || [],
    verified:     p.verified     || false,
    description:  p.description  || '',
    ownerName:    'مالك خاص',
    owner_id:     p.owner_id,
    rating:       0,
    fromSupabase: true,
  };
}

export default function PropertyDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { properties, updatePropertyStatus } = useGlobalData();
  const { user } = useAuth();

  // Direct Supabase fetch when the property isn't in GlobalContext yet
  const [dbProperty, setDbProperty] = useState(null);
  const [dbLoading,  setDbLoading]  = useState(false);

  const property = useMemo(() => {
    const found = properties.find((p) => String(p.id) === id);
    if (found) return found;
    return dbProperty ? normalizeDbProperty(dbProperty) : null;
  }, [properties, dbProperty, id]);

  useEffect(() => {
    const inContext = properties.some((p) => String(p.id) === id);
    if (inContext || !isConfigured) return;
    setDbLoading(true);
    supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => { if (data) setDbProperty(data); })
      .finally(() => setDbLoading(false));
  }, [id, properties]);

  const isOwner  = !!(user?.id && property && user.id === property.owner_id);
  const [ownerStatusDraft, setOwnerStatusDraft] = useState(property?.status ?? '');
  const [showReport, setShowReport] = useState(false);

  // Record in recently viewed
  useEffect(() => {
    if (property) addRecentlyViewed(property);
  }, [property]);

  // Record property view (once per session per property)
  useEffect(() => {
    if (!property || !isConfigured) return;
    const sessionKey = `viewed-${property.id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    supabase.from('property_views').insert({
      property_id: String(property.id),
      viewer_id: user?.id ?? null,
    }).catch(() => {});
  }, [property, user?.id]);

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-cream pt-16 flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-3">
          <p className="text-navy text-2xl font-black">٤٠٤</p>
          <p className="text-charcoal/60 text-sm">العقار غير موجود أو تم حذفه</p>
          <Link to="/properties" className="text-brand hover:underline text-sm flex items-center gap-1 justify-center">
            <ArrowRight size={14} /> العودة للقائمة
          </Link>
        </div>
      </div>
    );
  }

  const similar = properties.filter((p) =>
    p.id !== property.id &&
    p.type === property.type &&
    p.city === property.city &&
    Math.abs(p.price - property.price) / property.price < 0.3
  ).slice(0, 4).concat(
    // fallback: same type/city without price constraint when not enough results
    properties.filter((p) =>
      p.id !== property.id &&
      (p.type === property.type || p.city === property.city) &&
      !properties.slice(0,4).some(s => s.id === p.id)
    )
  ).slice(0, 4);
  const pricePerM2 = Math.round(property.price / property.area);

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0" dir="rtl">

      {/* ── Print-only report layout ── */}
      <style>{`
        @media print {
          body > #root > * { display: none !important; }
          #prop-print-report { display: block !important; }
        }
      `}</style>
      <div id="prop-print-report" style={{ display: 'none' }} dir="rtl">
        <div style={{ fontFamily: 'Cairo, sans-serif', padding: '32px', maxWidth: '800px', margin: '0 auto', color: '#1f2a38' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1f2a38', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontWeight: 900, fontSize: '22px', margin: 0 }}>RESURGO — تقرير عقاري</p>
              <p style={{ fontSize: '11px', color: '#666', margin: '4px 0 0' }}>{new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span style={{ background: property.status === 'للبيع' ? '#f37124' : '#5979bb', color: '#fff', padding: '4px 14px', borderRadius: '99px', fontWeight: 700, fontSize: '13px' }}>
              {property.status}
            </span>
          </div>
          {/* Title + location */}
          <p style={{ fontWeight: 900, fontSize: '20px', margin: '0 0 6px' }}>{property.title}</p>
          <p style={{ fontSize: '13px', color: '#555', margin: '0 0 20px' }}>{property.city} — {property.district} · {property.subtype}</p>
          {/* Key stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
            {[['السعر', property.priceDisplay], ['المساحة', `${property.area} م²`], ['الغرف', property.rooms || '—'], ['الطابق', property.floor || '—']].map(([k, v]) => (
              <div key={k} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{k}</p>
                <p style={{ fontWeight: 900, fontSize: '15px', margin: 0 }}>{v}</p>
              </div>
            ))}
          </div>
          {/* AVM */}
          {property.avm && (
            <div style={{ background: '#f7f1eb', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', margin: '0 0 6px' }}>التقييم الآلي (AVM)</p>
              <p style={{ fontSize: '12px', color: '#555', margin: 0 }}>
                القيمة التقديرية: <strong>{property.avm.toLocaleString()} $</strong>
                &nbsp;·&nbsp;
                {property.avm > property.price ? `مرتفع عن سعر الطرح بـ ${Math.round((property.avm - property.price) / property.price * 100)}%` : `أدنى من سعر الطرح بـ ${Math.round((property.price - property.avm) / property.price * 100)}%`}
              </p>
            </div>
          )}
          {/* Description */}
          <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>وصف العقار</p>
          <p style={{ fontSize: '12px', lineHeight: '1.9', color: '#444', marginBottom: '20px' }}>{property.desc}</p>
          {/* Tags */}
          {property.tags?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>المزايا والخصائص</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {property.tags.map(t => (
                  <span key={t} style={{ border: '1px solid #5979bb', color: '#5979bb', borderRadius: '99px', padding: '2px 10px', fontSize: '11px' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          {/* Footer */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
            <span>رقم المرجع: SY-{String(property.id).padStart(4, '0')}</span>
            <span>resurgo.sy — جميع الحقوق محفوظة</span>
          </div>
        </div>
      </div>

      <SEO
        title={`${property.title} — ${property.city}`}
        description={`${property.subtype} ${property.status} في ${property.district}، ${property.city}. ${property.area} م² · ${property.priceDisplay}. ${property.desc.slice(0, 100)}`}
        image={property.images[0]}
        path={`/properties/${property.id}`}
        type="product"
        price={property.price}
        currency="USD"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'RealEstateListing',
          name: property.title,
          description: property.desc,
          url: `https://resurgo.sy/properties/${property.id}`,
          image: property.images,
          address: { '@type': 'PostalAddress', streetAddress: property.district, addressLocality: property.city, addressCountry: 'SY' },
          offers: { '@type': 'Offer', price: property.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
          floorSize: { '@type': 'QuantitativeValue', value: property.area, unitCode: 'MTK' },
          numberOfRooms: property.rooms || undefined,
        }}
      />
      <StickyBar property={property} />

      <div className="pt-16">
        <HeroGallery
          images={property.images}
          title={property.title}
          city={property.city}
          district={property.district}
          status={property.status}
          virtualTourUrl={property.virtualTourUrl}
          propertyId={property.id}
        />
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-navy/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-1.5 text-xs text-charcoal/50">
          <div className="flex items-center gap-1.5 min-w-0">
            <Link to="/" className="hover:text-navy transition-colors shrink-0">الرئيسية</Link>
            <ChevronLeft size={11} className="shrink-0" />
            <Link to="/properties" className="hover:text-navy transition-colors shrink-0">العقارات</Link>
            <ChevronLeft size={11} className="shrink-0" />
            <span className="text-charcoal/70 truncate max-w-xs">{property.title}</span>
          </div>
          <button
            onClick={() => setShowReport(true)}
            className="shrink-0 flex items-center gap-1 text-charcoal/35 hover:text-red-500 transition-colors ml-2"
            title="الإبلاغ عن هذا الإعلان"
          >
            <Flag size={12} /> إبلاغ
          </button>
        </div>
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && <ReportModal property={property} onClose={() => setShowReport(false)} />}
      </AnimatePresence>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-10">

          {/* ── Left column ── */}
          <div className="space-y-8 min-w-0">

            {/* Price + stats */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${property.status === 'للبيع' ? 'bg-cta/10 text-cta border-cta/20' : 'bg-brand/10 text-brand border-brand/20'}`}>{property.status}</span>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-cream text-charcoal/65 border border-navy/10">{property.subtype}</span>
                    {property.verified && <span className="flex items-center gap-1 text-[11px] text-green-600 font-bold bg-green-500/10 px-2.5 py-1 rounded-full"><BadgeCheck size={12} /> طابو 2400 سهم</span>}
                  </div>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => <Star key={i} size={13} className={i < property.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />)}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-navy font-black text-3xl sm:text-4xl leading-none">{property.priceDisplay}</p>
                  <p className="text-charcoal/45 text-xs mt-1 font-mono">{pricePerM2.toLocaleString()} $ / م²</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-navy/8">
                {[
                  [Home,     `${property.area} م²`,                                    'المساحة'],
                  [Building2, property.rooms > 0 ? `${property.rooms} غرف` : 'مفتوح', 'غرف النوم'],
                  [Bath,     property.baths > 0 ? `${property.baths} حمامات` : '—',   'الحمامات'],
                  [Layers,   property.floor > 0 ? `الطابق ${property.floor}` : 'أرضي','الطابق'],
                ].map(([Icon, val, label]) => (
                  <div key={label} className="bg-cream rounded-xl p-3 text-center">
                    <Icon size={15} className="text-brand mx-auto mb-1.5" />
                    <p className="text-navy font-bold text-sm">{val}</p>
                    <p className="text-charcoal/45 text-[10px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Description */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.07 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <SectionH>وصف العقار</SectionH>
              <p className="text-charcoal/70 text-[15px] leading-8">{property.desc}</p>
              <p className="text-charcoal/40 text-xs mt-4 flex items-center gap-1"><Calendar size={11} /> أُدرج في {property.date}</p>
            </motion.div>

            {/* Features */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <SectionH>المزايا والخصائص</SectionH>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {property.tags.map((tag) => (
                  <div key={tag} className="flex items-center gap-2 bg-cream border border-navy/8 text-charcoal/70 text-sm px-3 py-2.5 rounded-xl">
                    <CheckCircle size={13} className="text-brand shrink-0" /> {tag}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AVM */}
            {property.avm && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.13 }}
                className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
                <SectionH><span className="flex items-center gap-2"><Cpu size={15} className="text-brand" /> تقييم المختصين وتاريخ الأسعار</span></SectionH>
                <ValuationPanel price={property.price} avm={property.avm} />
                <PriceHistoryChart data={property.priceHistory} />
              </motion.div>
            )}

            {/* Mortgage Calculator */}
            {property.status === 'للبيع' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.16 }}
                className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
                <SectionH><span className="flex items-center gap-2"><Calculator size={15} className="text-brand" /> حاسبة التمويل العقاري</span></SectionH>
                <MortgageCalc price={property.price} />
              </motion.div>
            )}

            {/* Rental Yield Calculator — for-sale only */}
            {property.status === 'للبيع' && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.175 }}
                className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
                <SectionH><span className="flex items-center gap-2"><TrendingUp size={15} className="text-brand" /> عائد الإيجار المتوقع</span></SectionH>
                <RentalYieldCalc price={property.price} />
              </motion.div>
            )}

            {/* Property Comparison */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.19 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <SectionH><span className="flex items-center gap-2"><GitCompare size={15} className="text-brand" /> مقارنة العقارات</span></SectionH>
              <CompareSection current={property} allProperties={properties} />
            </motion.div>

            {/* Reviews */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.205 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <SectionH>آراء ومراجعات</SectionH>
              <ReviewSection propertyId={property.id} />
            </motion.div>

            {/* Location */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.22 }}
              className="bg-white border border-navy/10 rounded-2xl overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-navy/8">
                <SectionH>الموقع</SectionH>
                <div className="flex flex-wrap gap-4 text-sm">
                  {[['المدينة', property.city], ['الحي', property.district], ['النوع', property.type]].map(([k, v]) => (
                    <div key={k}>
                      <span className="text-charcoal/40 text-[10px] block uppercase tracking-wider">{k}</span>
                      <span className="text-navy font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {property.lat != null && property.lng != null && (
                <MapBox lat={property.lat} lng={property.lng} city={property.city} district={property.district} />
              )}
              {property.lat != null && property.lng != null && (
                <NeighborhoodScore lat={property.lat} lng={property.lng} />
              )}
            </motion.div>

            {/* Neighborhood Ratings */}
            {property.neighborhood && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.235 }}
                className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
                <SectionH><span className="flex items-center gap-2"><MapPin size={15} className="text-brand" /> تقييم الحي والموقع</span></SectionH>
                <NeighborhoodPanel neighborhood={property.neighborhood} />
              </motion.div>
            )}

            {/* ── Cross-service CTAs ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.23 }}
              className="bg-white border border-navy/10 rounded-2xl p-5 sm:p-6">
              <SectionH>خدمات ذات صلة بهذا العقار</SectionH>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <Link to="/valuation"
                  className="flex items-start gap-3 p-4 bg-cream border border-navy/8 rounded-xl hover:border-brand/30 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
                    <BarChart3 size={18} className="text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm flex items-center gap-2">
                      تقييم عقاري معتمد IVS 2025
                      <span className="text-[9px] bg-green-50 border border-green-200 text-green-700 font-bold px-1.5 py-0.5 rounded-full">مجاني أو $75+</span>
                    </p>
                    <p className="text-charcoal/50 text-xs mt-0.5 leading-relaxed">تقدير آلي مجاني فوري، أو تقرير MRICS معتمد — شارة "عقار موثوق" تسرّع البيع 3×</p>
                  </div>
                  <ChevronLeft size={14} className="text-charcoal/30 group-hover:text-brand shrink-0 mt-1 transition-colors" />
                </Link>

                <Link to="/clearing/dashboard"
                  className="flex items-start gap-3 p-4 bg-cream border border-navy/8 rounded-xl hover:border-purple-300 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                    <Scale size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm">تخليص قانوني</p>
                    <p className="text-charcoal/50 text-xs mt-0.5 leading-relaxed">وكالات، حصر إرث، استرداد ملكية — أنجز معاملاتك بسهولة</p>
                  </div>
                  <ChevronLeft size={14} className="text-charcoal/30 group-hover:text-purple-500 shrink-0 mt-1 transition-colors" />
                </Link>

                <Link to="/jobs"
                  className="flex items-start gap-3 p-4 bg-cream border border-navy/8 rounded-xl hover:border-sky-300 hover:bg-white hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                    <Briefcase size={18} className="text-sky-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-sm">استئجار مهندس معاينة</p>
                    <p className="text-charcoal/50 text-xs mt-0.5 leading-relaxed">وثّق حالة العقار بتقرير هندسي ميداني قبل إتمام الصفقة</p>
                  </div>
                  <ChevronLeft size={14} className="text-charcoal/30 group-hover:text-sky-500 shrink-0 mt-1 transition-colors" />
                </Link>

                {property.status === 'للبيع' && (
                  <Link to="/crowdfund"
                    className="flex items-start gap-3 p-4 bg-cream border border-navy/8 rounded-xl hover:border-cta/30 hover:bg-white hover:shadow-sm transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center shrink-0 group-hover:bg-cta/20 transition-colors">
                      <TrendingUp size={18} className="text-cta" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-navy font-bold text-sm">حوّله إلى فرصة استثمار</p>
                      <p className="text-charcoal/50 text-xs mt-0.5 leading-relaxed">اطرح عقارك للتمويل الجماعي واستقطب المستثمرين عبر المنصة</p>
                    </div>
                    <ChevronLeft size={14} className="text-charcoal/30 group-hover:text-cta shrink-0 mt-1 transition-colors" />
                  </Link>
                )}
              </div>
            </motion.div>

            {/* Similar */}
            {similar.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.25 }}>
                <SectionH>عقارات قد تُعجبك</SectionH>
                <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
                  {similar.map((p) => <SimilarCard key={p.id} property={p} />)}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4 mt-6 lg:mt-0">

            {/* Owner control panel */}
            {isOwner && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-amber-800 font-bold text-xs mb-3 flex items-center gap-1.5">
                  <BadgeCheck size={13} className="text-amber-600" /> لوحة تحكم المالك
                </p>
                <p className="text-charcoal/50 text-[11px] mb-2">تحديث حالة العقار</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      value={ownerStatusDraft}
                      onChange={e => setOwnerStatusDraft(e.target.value)}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm text-navy appearance-none focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {['للبيع', 'للإيجار', 'بُيع', 'مُؤجَّر'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                  </div>
                  <button
                    onClick={() => {
                      updatePropertyStatus(property.id, ownerStatusDraft);
                      toast.success('تم تحديث حالة العقار');
                    }}
                    disabled={ownerStatusDraft === property.status}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    حفظ
                  </button>
                </div>
              </div>
            )}

            {!isOwner && property.owner_id && (
              <div className="flex justify-center">
                <ContactOwnerButton
                  propertyId={property.id}
                  ownerId={property.owner_id}
                  ownerName={property.ownerName}
                />
              </div>
            )}

            <div className="bg-white border border-navy/10 rounded-2xl p-5 sticky top-20">
              <ContactCard property={property} />
            </div>

            <div className="bg-white border border-navy/10 rounded-2xl p-4 divide-y divide-navy/[0.06]">
              {[
                ['السعر الكامل',  property.priceDisplay],
                ['السعر / م²',    `${pricePerM2.toLocaleString()} $`],
                ['المساحة',        `${property.area} م²`],
                ['المدينة',       property.city],
                ['الحي',          property.district],
                ['نوع العقار',    property.subtype],
                property.totalFloors > 0 && ['الطوابق الكلية', `${property.totalFloors} طوابق`],
              ].filter(Boolean).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-2.5 text-xs">
                  <span className="text-charcoal/50">{k}</span>
                  <span className="text-navy font-bold font-mono">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate('/properties')}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-navy/12 hover:border-brand/30 text-charcoal/60 hover:text-brand rounded-xl text-sm transition-colors">
                <ArrowRight size={14} /> العودة
              </button>
              <button onClick={() => window.print()}
                title="طباعة / حفظ PDF"
                className="w-12 flex items-center justify-center border border-navy/12 hover:border-brand/30 text-charcoal/50 hover:text-brand rounded-xl transition-colors">
                <Printer size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile floating WhatsApp bar — hidden on desktop where sidebar is visible */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-white/95 backdrop-blur-md border-t border-navy/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-navy font-black text-base leading-none truncate">{property.priceDisplay}</p>
          <p className="text-charcoal/50 text-xs mt-0.5 truncate">{property.title}</p>
        </div>
        <button onClick={() => window.print()} title="طباعة"
          className="w-11 h-11 flex items-center justify-center border border-navy/12 rounded-xl text-charcoal/50 hover:text-brand transition-colors shrink-0">
          <Printer size={16} />
        </button>
        <a href={`https://wa.me/${property.ownerPhone?.replace(/\D/g, '') ?? ''}?text=${encodeURIComponent(`أودّ الاستفسار عن: ${property.title} — SY-${String(property.id).padStart(4, '0')}`)}`}
          target="_blank" rel="noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shrink-0">
          <MessageCircle size={16} /> واتساب
        </a>
      </div>
    </div>
  );
}
