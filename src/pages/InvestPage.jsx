import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, MapPin, Building2, BarChart3, Crown,
  CheckCircle, ChevronRight, Calculator, ArrowLeft,
  DollarSign, Play, SlidersHorizontal, ArrowUpDown,
  AlertTriangle, ChevronDown, Heart, BookmarkCheck, X as XIcon,
  Search, Users, Clock as ClockIcon, ChevronLeft,
} from 'lucide-react';
import SEO from '../components/SEO';
import { useGlobalData } from '../context/GlobalContext';
import InvestmentModal from '../components/invest/InvestmentModal';
import { useNews } from '../hooks/useNews';
import { URGENCY } from '../data/newsData';
import IslamicFinanceCalc from '../components/ui/IslamicFinanceCalc';
import SponsorCard from '../components/ui/SponsorCard';

// ── Why Invest data ─────────────────────────────────────────────────────────
const WHY_INVEST = [
  { icon: TrendingUp, title: 'نمو مستمر', desc: 'السوق العقاري السوري ينمو بمعدل 12% سنوياً في 2025', color: 'text-emerald-400' },
  { icon: CheckCircle, title: 'مشاريع موثّقة', desc: 'كل مشروع خضع لتدقيق قانوني وهندسي من فريق RESURGO', color: 'text-brand' },
  { icon: BarChart3, title: 'شفافية كاملة', desc: 'تقارير مالية دورية وتحديثات مباشرة من موقع المشروع', color: 'text-violet-400' },
  { icon: DollarSign, title: 'عوائد مجزية', desc: 'متوسط عائد 19% في محفظة مشاريعنا الحالية', color: 'text-cta' },
];

// ── Real-estate DCF helpers ──────────────────────────────────────────────────
// 40% of IRR is distributed annually as rental income; 60% is capital appreciation.
const DIST_RATIO = 0.4;

function reCalcRE(amount, irrPct, years, scenMult = 1) {
  const annualDist = amount * (irrPct / 100) * DIST_RATIO * scenMult;
  const capGainRate = (irrPct / 100) * (1 - DIST_RATIO) * scenMult;
  const exitValue = amount * Math.pow(1 + capGainRate, years);
  const totalDist = annualDist * years;
  return {
    fv:  Math.round(totalDist + exitValue),
    npv: Math.round(totalDist + exitValue - amount),
    annualDist: Math.round(annualDist),
  };
}

// NPV at a given discount rate: discounts each annual distribution + exit value
function npvAtRate(amount, irrPct, years, discountRate, scenMult = 1) {
  const annualDist = amount * (irrPct / 100) * DIST_RATIO * scenMult;
  const capGainRate = (irrPct / 100) * (1 - DIST_RATIO) * scenMult;
  const exitValue = amount * Math.pow(1 + capGainRate, years);
  let pv = -amount;
  for (let t = 1; t <= years; t++) pv += annualDist / Math.pow(1 + discountRate, t);
  pv += exitValue / Math.pow(1 + discountRate, years);
  return pv;
}

// ── Sensitivity Analysis Table ──────────────────────────────────────────────
function SensitivityTable({ amount, years, irrPct }) {
  const rates = [8, 12, 15, 18, 22, 26];
  const scenMults = [0.75, 1.0, 1.25];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs" dir="rtl">
        <thead>
          <tr className="border-b border-navy/10">
            <th className="text-right py-2 pr-3 text-charcoal/50 font-medium">معدل الخصم</th>
            <th className="text-center py-2 px-2 text-red-400 font-bold">متشائم ×0.75</th>
            <th className="text-center py-2 px-2 text-brand font-bold">واقعي ×1.0</th>
            <th className="text-center py-2 px-2 text-emerald-500 font-bold">تفاؤلي ×1.25</th>
          </tr>
        </thead>
        <tbody>
          {rates.map(rate => (
            <tr key={rate} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
              <td className="py-2 pr-3 text-navy font-bold">{rate}%</td>
              {scenMults.map((mult, i) => {
                const npv = npvAtRate(amount, irrPct, years, rate / 100, mult);
                const isNeg = npv < 0;
                const cls = isNeg ? 'text-red-500' : i === 0 ? 'text-red-400' : i === 1 ? 'text-brand' : 'text-emerald-600';
                return (
                  <td key={i} className={`py-2 px-2 text-center font-mono font-bold ${cls}`}>
                    {isNeg ? '-' : '+'}${Math.abs(Math.round(npv / 1000))}K
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-charcoal/35 mt-2 pr-1">
        * التدفقات النقدية: {Math.round(DIST_RATIO * 100)}% دخل إيجاري سنوي + {Math.round((1 - DIST_RATIO) * 100)}% تقدير رأسمالي عند الخروج. السيناريو يضرب كليهما.
      </p>
    </div>
  );
}

// ── ROI Calculator ──────────────────────────────────────────────────────────
function ROICalc() {
  const [open, setOpen]     = useState(false);
  const [amount, setAmount] = useState(50000);
  const [years, setYears]   = useState(5);
  const [rate, setRate]     = useState(18);
  const [showSensitivity, setShowSensitivity] = useState(false);

  const result = useMemo(() => {
    const base  = reCalcRE(amount, rate, years, 1.0);
    const pess  = reCalcRE(amount, rate, years, 0.75);
    const optim = reCalcRE(amount, rate, years, 1.25);
    const roi   = amount > 0 ? ((base.npv / amount) * 100).toFixed(1) : '0';
    return { fv: base.fv, npv: base.npv, roi, pess: pess.npv, optim: optim.npv, annualDist: base.annualDist };
  }, [amount, years, rate]);

  return (
    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg" dir="rtl">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-cream/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cta/10 border border-cta/15 flex items-center justify-center">
            <Calculator size={17} className="text-cta" />
          </div>
          <div className="text-right">
            <p className="text-navy font-bold text-sm">حاسبة العائد والتحليل المالي</p>
            <p className="text-charcoal/45 text-xs">حساب الربحية · IRR · تحليل الحساسية</p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-charcoal/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-charcoal/60 mb-2">
                    <span>مبلغ الاستثمار</span>
                    <span className="text-navy font-bold">${amount.toLocaleString()}</span>
                  </div>
                  <input type="range" min={5000} max={500000} step={5000} value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full accent-cta h-1.5 rounded-full cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-charcoal/40 mt-1">
                    <span>$5,000</span><span>$500,000</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-charcoal/60 mb-2">
                    <span>مدة الاستثمار</span>
                    <span className="text-navy font-bold">{years} سنوات</span>
                  </div>
                  <input type="range" min={1} max={15} step={1} value={years}
                    onChange={e => setYears(Number(e.target.value))}
                    className="w-full accent-brand h-1.5 rounded-full cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-charcoal/40 mt-1">
                    <span>1 سنة</span><span>15 سنة</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-charcoal/60 mb-2">
                    <span>معدل العائد السنوي (IRR)</span>
                    <span className="text-navy font-bold">{rate}%</span>
                  </div>
                  <input type="range" min={5} max={35} step={0.5} value={rate}
                    onChange={e => setRate(Number(e.target.value))}
                    className="w-full accent-violet-500 h-1.5 rounded-full cursor-pointer" />
                  <div className="flex justify-between text-[10px] text-charcoal/40 mt-1">
                    <span>5%</span><span>35%</span>
                  </div>
                </div>
              </div>

              {/* 3-scenario results */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'متشائم', value: `$${result.pess.toLocaleString()}`, cls: 'text-red-500', bg: 'bg-red-50 border-red-100' },
                  { label: 'واقعي', value: `$${result.npv.toLocaleString()}`, cls: 'text-brand', bg: 'bg-brand/5 border-brand/15' },
                  { label: 'تفاؤلي', value: `$${result.optim.toLocaleString()}`, cls: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                ].map(({ label, value, cls, bg }) => (
                  <div key={label} className={`rounded-xl border p-2.5 text-center ${bg}`}>
                    <p className={`font-black text-sm ${cls}`}>{value}</p>
                    <p className="text-charcoal/50 text-[9px] mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Main results */}
              <div className="bg-cream rounded-2xl p-4 space-y-3 border border-navy/10">
                {[
                  ['القيمة النهائية (واقعي)', `$${result.fv.toLocaleString()}`,         'text-navy'],
                  ['صافي الربح',              `$${result.npv.toLocaleString()}`,         'text-emerald-600'],
                  ['العائد الإجمالي',          `${result.roi}%`,                         'text-cta'],
                  ['توزيع إيجاري سنوي (تقديري)', `$${result.annualDist.toLocaleString()}`, 'text-brand'],
                ].map(([label, val, cls]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-charcoal/60 text-xs">{label}</span>
                    <span className={`font-black text-base ${cls}`}>{val}</span>
                  </div>
                ))}
              </div>

              {/* Sensitivity toggle */}
              <button
                onClick={() => setShowSensitivity(!showSensitivity)}
                className="w-full flex items-center justify-between text-xs text-charcoal/60 hover:text-brand transition-colors font-medium border-t border-navy/8 pt-3"
              >
                <span className="flex items-center gap-1.5"><BarChart3 size={13} /> جدول حساسية معدل الخصم</span>
                <ChevronRight size={13} className={`transition-transform ${showSensitivity ? 'rotate-90' : ''}`} />
              </button>

              {showSensitivity && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <SensitivityTable amount={amount} years={years} irrPct={rate} />
                </motion.div>
              )}

              <Link to="/investor/vip"
                className="w-full btn-cta flex items-center justify-center gap-2 text-sm">
                <Crown size={15} /> استثمر الآن عبر بوابة VIP
              </Link>
              <p className="text-charcoal/35 text-[10px] text-center pt-1">
                استثمار مباشر — لا يتطلب تمويلاً مصرفياً
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Risk Disclosure Banner ───────────────────────────────────────────────────
const RISK_ITEMS = [
  'الاستثمار العقاري ينطوي على مخاطر فقدان جزء أو كامل رأس المال المستثمر.',
  'العوائد المذكورة تقديرية وليست مضمونة — تعتمد على أداء السوق وتقدم المشروع.',
  'السيولة محدودة: لا يمكن استرداد الاستثمار قبل انتهاء المدة المحددة إلا عبر السوق الثانوي.',
  'المشاريع في سوريا تخضع لمخاطر جيوسياسية وتشريعية قد تؤثر على العوائد.',
];

function RiskBanner() {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('risk-banner-dismissed') === '1');
  const [expanded, setExpanded]   = useState(false);

  if (dismissed) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 gap-3">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2.5 flex-1 text-right"
          >
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
            <span className="text-amber-800 font-bold text-xs">إفصاح عن المخاطر — يُرجى القراءة قبل الاستثمار</span>
            <ChevronDown size={14} className={`text-amber-500 mr-auto transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => { setDismissed(true); sessionStorage.setItem('risk-banner-dismissed', '1'); }}
            className="text-amber-400 hover:text-amber-600 transition-colors shrink-0"
          >
            <XIcon size={15} />
          </button>
        </div>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-4 border-t border-amber-200/60"
          >
            <ul className="space-y-2 mt-3">
              {RISK_ITEMS.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-amber-700 text-xs leading-relaxed">
                  <span className="text-amber-400 font-black shrink-0 mt-0.5">·</span>
                  {r}
                </li>
              ))}
            </ul>
            <p className="text-amber-500 text-[10px] mt-3 border-t border-amber-200/60 pt-2">
              هذا ليس نصيحة مالية. استشر مستشارك المالي قبل اتخاذ أي قرار استثماري. RESURGO وسيط تقني غير ملزم بنتائج الاستثمار.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onInvest, isWatched, onToggleWatch }) {
  const [isHovered, setIsHovered] = useState(false);
  const progress = Math.round((project.raised / project.target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="bg-white group overflow-hidden relative"
        style={{
          borderRadius: '8px',
          boxShadow: isHovered ? '0 16px 48px rgba(31,42,56,0.14)' : '0 2px 8px rgba(31,42,56,0.06)',
          transition: 'box-shadow 0.35s ease',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top amber accent bar */}
        <div className="absolute top-0 inset-x-0 h-[3px] z-10 bg-amber-400" />

        {/* Image */}
        <div className="relative h-52 overflow-hidden">
          <img src={project.image} alt={project.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f2a38]/85 via-[#1f2a38]/15 to-transparent" />

          {/* IRR + VIP badges */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <span className="text-[11px] bg-amber-400 text-[#1f2a38] px-2.5 py-1 font-black"
              style={{ borderRadius: '3px' }}>
              IRR {project.irr}%
            </span>
            {project.vip && (
              <span className="text-[11px] bg-[#1f2a38]/80 border border-amber-400/40 text-amber-300 px-2.5 py-1 font-bold flex items-center gap-1"
                style={{ borderRadius: '3px' }}>
                <Crown size={9} /> VIP
              </span>
            )}
          </div>

          {/* Watchlist */}
          <button
            onClick={e => { e.stopPropagation(); onToggleWatch(project.id); }}
            className="absolute top-4 left-4 w-8 h-8 bg-white/90 hover:bg-white flex items-center justify-center transition-colors z-10"
            style={{ borderRadius: '4px' }}
            title={isWatched ? 'إزالة من قائمة المتابعة' : 'إضافة إلى قائمة المتابعة'}
          >
            {isWatched
              ? <BookmarkCheck size={13} className="text-amber-500" />
              : <Heart size={13} className="text-navy/60" />
            }
          </button>

          {/* Title + location overlaid */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-4 z-10">
            <p className="text-white font-black text-base leading-snug mb-0.5">{project.title}</p>
            <p className="text-white/55 text-xs flex items-center gap-1">
              <MapPin size={9} /> {project.city} · {project.type}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Status + days left */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-bold ${project.status === 'فرصة مبكرة' ? 'text-cta' : 'text-emerald-600'}`}>
              {project.status}
            </span>
            {project.daysLeft != null && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 border ${
                project.daysLeft <= 14
                  ? 'text-red-600 bg-red-50 border-red-200'
                  : project.daysLeft <= 30
                    ? 'text-amber-600 bg-amber-50 border-amber-200'
                    : 'text-charcoal/50 bg-[#f2f1ee] border-navy/10'
              }`} style={{ borderRadius: '4px' }}>
                <ClockIcon size={9} /> {project.daysLeft} يوم
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-charcoal/50">التمويل المُجمَّع</span>
              <span className="text-navy font-bold tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-amber-400"
              />
            </div>
            <div className="flex justify-between text-[10px] text-charcoal/40 mt-1.5">
              <span className="flex items-center gap-1">
                <Users size={8} /> {project.investorCount ?? '—'} مستثمر
              </span>
              <span>الهدف: ${(project.target / 1000).toFixed(0)}K</span>
            </div>
          </div>

          {/* Min invest + action */}
          <div className="flex items-center justify-between pt-3 border-t border-navy/[0.07]">
            <div>
              <p className="text-[10px] text-charcoal/40">الحد الأدنى للاستثمار</p>
              <p className="text-navy font-black text-lg tabular-nums leading-tight">${project.minInvest.toLocaleString()}</p>
            </div>
            <button
              onClick={() => onInvest(project)}
              className={`flex items-center gap-1.5 text-xs px-4 py-2.5 font-bold transition-colors ${
                project.vip
                  ? 'bg-amber-400/15 border border-amber-400/40 text-amber-700 hover:bg-amber-400/25'
                  : 'bg-[#1f2a38] text-white hover:bg-[#2a3a4f]'
              }`}
              style={{ borderRadius: '6px' }}
            >
              {project.vip ? <><Crown size={12} /> VIP فقط</> : <><Play size={12} /> استثمر</>}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function InvestPage() {
  const { investmentProjects, sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const activeSponsor = sponsorships.find(s => s.type === 'invest' && s.active);
  const { articles } = useNews();
  const navigate = useNavigate();

  const marketAlerts = articles
    .filter(a => a.status === 'published' && (a.cat === 'market' || a.cat === 'tax' || a.cat === 'legal'))
    .sort((a, b) => ({ urgent: 0, high: 1, info: 2 }[a.urgency] ?? 2) - ({ urgent: 0, high: 1, info: 2 }[b.urgency] ?? 2))
    .slice(0, 3);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('irr');
  const [filterType, setFilterType] = useState('الكل');
  const [watchlist, setWatchlist] = useState(
    () => JSON.parse(localStorage.getItem('resurgo-watchlist') || '[]')
  );
  const [search, setSearch] = useState('');

  const toggleWatch = (id) => {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('resurgo-watchlist', JSON.stringify(next));
      return next;
    });
  };

  const projectTypes = useMemo(
    () => ['الكل', 'المحفوظة', ...new Set(investmentProjects.map(p => p.type))],
    [investmentProjects]
  );

  const displayedProjects = useMemo(() => {
    let arr = filterType === 'الكل'
      ? investmentProjects
      : filterType === 'المحفوظة'
        ? investmentProjects.filter(p => watchlist.includes(p.id))
        : investmentProjects.filter(p => p.type === filterType);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      arr = arr.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        (p.desc && p.desc.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'irr')       return [...arr].sort((a, b) => b.irr - a.irr);
    if (sortBy === 'progress')  return [...arr].sort((a, b) => (b.raised / b.target) - (a.raised / a.target));
    if (sortBy === 'minInvest') return [...arr].sort((a, b) => a.minInvest - b.minInvest);
    if (sortBy === 'daysLeft')  return [...arr].sort((a, b) => (a.daysLeft ?? 999) - (b.daysLeft ?? 999));
    return arr;
  }, [investmentProjects, sortBy, filterType, watchlist, search]);

  const openInvest = (project) => {
    if (project.vip) { navigate('/investor/vip'); return; }
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="الاستثمار العقاري"
        description="فرص استثمار عقاري مدروسة في السوق السوري مع عوائد مضمونة"
        path="/invest"
      />

      {/* Hero split: dark hero left + ROICalc right */}
      <div className="page-hero-wrap pt-[62px]">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Decorative watermark */}
          <span
            className="absolute left-0 bottom-0 font-black select-none leading-none"
            style={{ fontSize: 'clamp(160px, 22vw, 300px)', color: 'rgba(255,255,255,0.028)', fontFamily: 'Bebas Neue, sans-serif', lineHeight: 0.82 }}
          >02</span>
          {/* Blur blobs */}
          <div className="absolute top-6 left-1/3 w-[360px] h-[360px] rounded-full bg-amber-400/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[260px] h-[260px] rounded-full bg-cta/[0.06] blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" dir="rtl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <p className="eyebrow mb-3"><span className="font-display tracking-widest ml-2">02 —</span>منصة الاستثمار</p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4] mb-4">
                استثمر في<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-yellow-400 to-cta">إعادة إعمار سوريا.</span>
              </h1>
              <div className="h-[3px] w-16 rounded-full bg-yellow-400 mb-5" />
              <p className="text-slate-400 text-base leading-relaxed mb-6 max-w-md">
                فرص عقارية حقيقية بعوائد مدروسة وموثّقة — نساعدك تختار الاستثمار المناسب لك بثقة وضمانات واضحة.
              </p>
              <div className="flex gap-3 flex-wrap mb-5">
                <Link to="/dashboard" className="btn-cta flex items-center gap-2">
                  <Crown size={15} /> بوابة VIP <ArrowLeft size={15} />
                </Link>
                <a href="#projects" className="btn-ghost flex items-center gap-2">
                  <Building2 size={15} /> استعرض المشاريع
                </a>
              </div>
              {/* Trust badge pills */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { label: 'SPV موثق قانونياً' },
                  { label: 'معيار IVS 2025' },
                  { label: 'صفر حالات تعثر' },
                  { label: 'Deloitte ME مدقق' },
                ].map(({ label }) => (
                  <div key={label} className="flex items-center gap-1.5 bg-white/7 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 whitespace-nowrap">
                    <CheckCircle size={10} className="text-yellow-400 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
              {/* Stats row */}
              <div className="flex items-center gap-8 mt-7 pt-6 border-t border-white/10 flex-wrap">
                {[
                  { value: '19%', label: 'متوسط العائد', color: 'text-yellow-400' },
                  { value: '0', label: 'مشاريع متعثرة', color: 'text-emerald-400' },
                  { value: '42+', label: 'مستثمر نشط', color: 'text-brand' },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex flex-col">
                    <span className={`font-display text-4xl sm:text-5xl leading-none tabular-nums tracking-wide ${color}`}>{value}</span>
                    <span className="text-white/35 text-[10px] font-bold tracking-[0.18em] uppercase mt-1.5">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.65, delay: 0.2 }} className="space-y-4">
              <ROICalc />
              <SponsorCard sponsor={activeSponsor} onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)} />
              <IslamicFinanceCalc />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Transition strip */}
      <div className="bg-[#161f2b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between" dir="rtl">
          <p className="text-white/25 text-[10px] font-black tracking-[0.35em] uppercase">منصة الاستثمار</p>
          <p className="text-white/40 text-[11px] tabular-nums">
            <span className="text-yellow-400 font-bold">{investmentProjects.length}</span> مشروع متاح
          </p>
        </div>
      </div>

      {/* Risk disclosure banner */}
      <RiskBanner />

      {/* Why invest */}
      <section className="bg-white px-4 py-14">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center mb-10">
            <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-2">لماذا RESURGO؟</p>
            <h2 className="text-navy font-black text-3xl">استثمار آمن وشفاف</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_INVEST.map((w, i) => (
              <motion.div key={w.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#f2f1ee] p-6 group transition-all duration-300"
                style={{ borderRadius: '8px' }}
                whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(31,42,56,0.10)' }}
              >
                <div className="w-10 h-10 bg-white flex items-center justify-center mb-4"
                  style={{ borderRadius: '6px', boxShadow: '0 2px 8px rgba(31,42,56,0.07)' }}>
                  <w.icon size={18} className={w.color} />
                </div>
                <p className="text-navy font-bold text-sm mb-1.5">{w.title}</p>
                <p className="text-charcoal/55 text-xs leading-relaxed">{w.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-end justify-between mb-6 flex-wrap gap-4">
            <div>
              <p className="text-amber-600 text-xs font-bold tracking-widest uppercase mb-1">الفرص الاستثمارية</p>
              <h2 className="text-navy font-black text-3xl">مشاريع مفتوحة للاستثمار</h2>
            </div>
            <Link to="/investor/vip" className="flex items-center gap-2 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/10 px-4 py-2 rounded-xl text-sm transition-all">
              <Crown size={14} /> عرض كل المشاريع VIP <ChevronRight size={14} />
            </Link>
          </motion.div>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم، المدينة، أو النوع..."
              className="w-full pr-9 pl-4 py-2.5 rounded-xl border border-navy/12 bg-white text-sm text-navy placeholder:text-charcoal/35 focus:outline-none focus:border-brand transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/35 hover:text-navy transition-colors">
                <XIcon size={13} />
              </button>
            )}
          </div>

          {/* Filter + sort bar */}
          <div className="flex items-center gap-3 flex-wrap mb-6 pb-5 border-b border-navy/[0.07]">
            <div className="flex items-center gap-1.5 text-charcoal/50 text-xs shrink-0">
              <SlidersHorizontal size={13} /> نوع:
            </div>
            {projectTypes.map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${filterType === t ? 'bg-amber-500/20 border-amber-400/50 text-amber-700' : 'border-navy/15 text-charcoal/60 hover:border-amber-300 hover:text-amber-700'}`}>
                {t === 'المحفوظة' && <Heart size={10} className={watchlist.length > 0 ? 'text-rose-400' : 'text-charcoal/30'} />}
                {t}
                {t === 'المحفوظة' && watchlist.length > 0 && (
                  <span className="bg-rose-100 text-rose-500 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{watchlist.length}</span>
                )}
              </button>
            ))}
            <div className="mr-auto flex items-center gap-2">
              <ArrowUpDown size={13} className="text-charcoal/40" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none focus:border-brand cursor-pointer">
                <option value="irr">الأعلى IRR</option>
                <option value="daysLeft">ينتهي قريباً</option>
                <option value="progress">نسبة التمويل</option>
                <option value="minInvest">الحد الأدنى</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedProjects.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-charcoal/50">
                <Building2 size={36} className="mx-auto mb-3 opacity-30" />
                <p>لا توجد مشاريع من هذا النوع حالياً</p>
                <button onClick={() => setFilterType('الكل')} className="text-brand text-sm mt-2 hover:underline">عرض الكل</button>
              </div>
            ) : (
              displayedProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onInvest={openInvest}
                  isWatched={watchlist.includes(p.id)} onToggleWatch={toggleWatch} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── Market & Legal Alerts ── */}
      {marketAlerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16" dir="rtl">
          <div className="border-t border-navy/10 pt-12">
            <div className="flex items-end justify-between mb-5 flex-wrap gap-3">
              <div>
                <p className="text-xs font-bold text-charcoal/50 mb-1">تنبيهات السوق</p>
                <h2 className="text-xl font-black text-navy">مستجدات قانونية وضريبية تؤثر على استثمارك</h2>
              </div>
              <Link to="/news" className="flex items-center gap-1 text-brand text-sm font-bold hover:text-navy transition-colors shrink-0">
                كل التنبيهات <ChevronLeft size={14} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {marketAlerts.map(alert => {
                const urgency = URGENCY[alert.urgency] ?? URGENCY.info;
                return (
                  <Link key={alert.id} to={`/news/${alert.id}`}
                    className="bg-white p-4 hover:-translate-y-0.5 transition-all group"
                    style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                        {urgency.label}
                      </span>
                      <span className="text-[10px] text-charcoal/40">{alert.date}</span>
                    </div>
                    <p className="text-navy text-sm font-bold leading-snug group-hover:text-brand transition-colors line-clamp-2">
                      {alert.title}
                    </p>
                    <p className="text-charcoal/50 text-xs mt-1.5 line-clamp-2">{alert.summary}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Demand Heatmap CTA ── */}
      <div className="bg-[#1f2a38] mt-4" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link to="/heatmap" className="flex items-center gap-5 group">
            <div className="w-14 h-14 bg-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/30 transition-colors"
              style={{ borderRadius: '6px' }}>
              <BarChart3 size={24} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-brand text-[10px] font-bold uppercase tracking-widest mb-1">أداة جديدة</p>
              <p className="text-white font-black text-base mb-0.5">خريطة الطلب العقاري</p>
              <p className="text-white/40 text-sm">اقرأ مؤشرات الطلب في 14 محافظة سورية قبل اتخاذ قرارك الاستثماري</p>
            </div>
            <div className="shrink-0 w-10 h-10 border border-white/15 flex items-center justify-center group-hover:border-brand group-hover:bg-brand/10 transition-all"
              style={{ borderRadius: '6px' }}>
              <ChevronLeft size={18} className="text-white/40 group-hover:text-brand transition-colors" />
            </div>
          </Link>
        </div>
      </div>

      {/* Investment Modal */}
      <InvestmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
        project={selectedProject}
      />
    </div>
  );
}
