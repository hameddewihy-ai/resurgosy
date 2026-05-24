import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Users, Shield, Clock, ChevronDown, X,
  DollarSign, Percent, CheckCircle, AlertTriangle, Globe,
  Search, ArrowUpDown, Heart, Bell, Award, ArrowLeft,
  Building2, Home, Umbrella, RefreshCw, Star,
  MessageCircle, BadgeCheck, Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SecondaryMarketModal from '../components/crowdfund/SecondaryMarketModal';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import LazyImage from '../components/ui/LazyImage';
import { addNotification } from '../components/NotificationsPanel';
import {
  CROWD_PROJECTS, CROWD_STATS, PLATFORM_TRACK_RECORD,
  RISK_COLORS, RISK_LABELS,
  STATUS_CONFIG, daysLeft, fundingPct,
} from '../data/crowdfundData';

// ── Constants ─────────────────────────────────────────────────────────────────

const HOW_STEPS = [
  { n: '01', icon: Globe,       title: 'اختر مشروعك',    desc: 'تصفّح مشاريع التمويل الجماعي المدروسة وقيِّم العائد والمخاطرة والمطوّر.' },
  { n: '02', icon: DollarSign,  title: 'استثمر من 500$', desc: 'ادخل بأي مبلغ من 500 دولار وامتلك حصة موثَّقة قانونياً في مشروع حقيقي.' },
  { n: '03', icon: Percent,     title: 'اجنِ العوائد',   desc: 'تلقَّ أرباحك كل 3–6 أشهر مباشرةً في حسابك المصرفي أينما كنت في العالم.' },
];

const SORT_OPTIONS = [
  { value: 'best_return',  label: 'أعلى عائد' },
  { value: 'closing_soon', label: 'أقرب إغلاق' },
  { value: 'min_invest',   label: 'أقل حد أدنى' },
  { value: 'funding_pct',  label: 'الأكثر تمويلاً' },
  { value: 'newest',       label: 'الأحدث' },
];

const TYPE_ICONS = {
  'سكني':  Home,
  'تجاري': Building2,
  'سياحي': Umbrella,
};

const TRUST_PARTNERS = [
  { name: 'Deloitte ME',  desc: 'مدقق مالي معتمد', color: 'text-green-700  bg-green-50  border-green-200' },
  { name: 'ADGM',         desc: 'هيئة أبوظبي',      color: 'text-blue-700   bg-blue-50   border-blue-200'  },
  { name: 'ADIB',         desc: 'مصرف إسلامي',      color: 'text-violet-700 bg-violet-50 border-violet-200'},
  { name: 'Wise',         desc: 'تحويل دولي',        color: 'text-teal-700  bg-teal-50   border-teal-200'  },
  { name: 'ISO 9001',     desc: 'معيار الجودة',      color: 'text-amber-700  bg-amber-50  border-amber-200' },
];

const TESTIMONIALS = [
  {
    name: 'م. كريم الزيدي',
    country: '🇩🇪 ألمانيا',
    invested: '$8,500',
    project: 'برج الشام السكني',
    text: 'كنت أبحث عن طريقة آمنة للاستثمار في سوريا بدون الحاجة للعودة. RESURGO أعطتني الشفافية والثقة التي كنت أحتاجها — تقارير شهرية وSPV واضحة.',
    return: '13.5%',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
  },
  {
    name: 'سمر الأحمد',
    country: '🇸🇦 السعودية',
    invested: '$3,000',
    project: 'مجمع الفرات — حلب',
    text: 'الحد الأدنى 500$ جعله في متناولي. استثمرت في مشروع حلب وتابعت التقدم شهرياً. الفريق يرد على كل استفساراتي خلال 24 ساعة.',
    return: '14.2%',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
  },
  {
    name: 'فادي خوري',
    country: '🇦🇪 الإمارات',
    invested: '$22,000',
    project: 'تلال دمشق — فلل',
    text: 'المشروع انتهى وحقق 34.2% خلال سنتين. كانت التجربة أفضل مما توقعت. الآن أستثمر في مشروعين جديدين بثقة تامة.',
    return: '34.2% فعلي',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
  },
];

const SECONDARY_LISTINGS = [
  { projectTitle: 'برج الشام السكني',    amount: 2500,  originalAmount: 2000, returnSoFar: 12, seller: 'م. أحمد' },
  { projectTitle: 'مركز بيزنس دمشق',    amount: 5800,  originalAmount: 5000, returnSoFar: 8,  seller: 'ل. يوسف' },
];

const WATCHLIST_KEY = 'resurgo-crowdfund-watchlist';

function getWatchlist() {
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]'); } catch { return []; }
}
function saveWatchlist(ids) {
  try { localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids)); } catch {}
}

// ── Project card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, index }) {
  const pct      = fundingPct(project.raisedAmount, project.targetAmount);
  const days     = daysLeft(project.deadline);
  const status   = STATUS_CONFIG[project.status];
  const isActive = project.status === 'active';
  const TypeIcon = TYPE_ICONS[project.type] || Home;

  const [saved, setSaved] = useState(() => getWatchlist().includes(project.id));

  const toggleSave = (e) => {
    e.preventDefault();
    const list = getWatchlist();
    const next = saved ? list.filter(id => id !== project.id) : [...list, project.id];
    saveWatchlist(next);
    setSaved(!saved);
    toast.success(saved ? 'أُزيل من المتابعة' : 'أُضيف إلى قائمة المتابعة');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all duration-300 hover:-translate-y-1 group flex flex-col"
      style={{ borderRadius: '8px' }}
    >
      {/* Image */}
      <Link to={`/crowdfund/${project.id}`} className="block relative h-48 overflow-hidden shrink-0">
        <LazyImage src={project.image} alt={project.title}
          className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />

        {/* Status badge */}
        <div className={`absolute top-3 right-3 flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-bold border backdrop-blur-sm ${status.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </div>

        {/* Watchlist button */}
        <button onClick={toggleSave}
          className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${saved ? 'bg-cta text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}
          title={saved ? 'إزالة من المتابعة' : 'إضافة للمتابعة'}>
          <Heart size={13} fill={saved ? 'currentColor' : 'none'} />
        </button>

        {/* Bottom row */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between">
          <div className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-lg px-2 py-1">
            <TypeIcon size={10} className="text-white/80" />
            <span className="text-white/90 text-[9px] font-semibold">{project.type}</span>
            {project.countryCount && (
              <>
                <span className="text-white/40 mx-1">·</span>
                <Globe size={9} className="text-white/70" />
                <span className="text-white/80 text-[9px]">{project.countryCount} دولة</span>
              </>
            )}
          </div>
          <div className="bg-cta text-white px-2.5 py-1 rounded-full text-xs font-black shadow-lg">
            {project.expectedAnnualReturn}% <span className="font-normal opacity-80">/ سنة</span>
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <Link to={`/crowdfund/${project.id}`} className="block mb-2.5">
          <h3 className="text-navy font-bold text-sm leading-snug group-hover:text-brand transition-colors mb-0.5">
            {project.title}
          </h3>
          <p className="text-charcoal/45 text-[10px]">{project.developer}</p>
        </Link>

        {/* Return breakdown badges */}
        {project.returnBreakdown && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {project.returnBreakdown.rental > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                إيجاري {project.returnBreakdown.rental}%
              </span>
            )}
            {project.returnBreakdown.capitalGain > 0 && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200">
                رأسمالي {project.returnBreakdown.capitalGain}%
              </span>
            )}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${RISK_COLORS[project.riskLevel]}`}>
              {RISK_LABELS[project.riskLevel]}
            </span>
          </div>
        )}

        {/* Funding progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-charcoal/50 text-[10px]">التمويل المُجمَّع</span>
            <span className="text-navy font-black text-xs">{pct}%</span>
          </div>
          <div className="h-2 bg-navy/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${pct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: 'easeOut', delay: index * 0.08 }}
              className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-brand' : 'bg-amber-400'}`}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-brand font-semibold text-[10px]">${project.raisedAmount.toLocaleString()}</span>
            <span className="text-charcoal/40 text-[10px]">من ${project.targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Construction progress */}
        {project.constructionProgress !== undefined && project.constructionProgress < 100 && (
          <div className="mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-charcoal/45 text-[9px]">نسبة الإنجاز</span>
              <span className="text-[9px] font-bold text-amber-600">{project.constructionProgress}%</span>
            </div>
            <div className="h-1.5 bg-navy/6 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${project.constructionProgress >= 70 ? 'bg-green-400' : project.constructionProgress >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                style={{ width: `${project.constructionProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 text-center">
          {[
            { label: 'مستثمر', value: project.investorsCount.toLocaleString() },
            { label: 'الاحتجاز', value: `${project.holdPeriod}م` },
            { label: 'الحد الأدنى', value: `$${project.minInvestment >= 1000 ? (project.minInvestment / 1000) + 'K' : project.minInvestment}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-cream/70 rounded-lg py-2">
              <p className="text-navy font-black text-xs">{value}</p>
              <p className="text-charcoal/40 text-[9px] mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Urgency / deadline */}
        {isActive && days > 0 && days <= 7 && (
          <div className="flex items-center justify-between gap-1.5 text-red-700 text-[10px] mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 animate-pulse">
            <span className="flex items-center gap-1"><Flame size={10} className="text-red-500" /> ينتهي قريباً جداً</span>
            <span className="font-black">{days} أيام فقط</span>
          </div>
        )}
        {isActive && days > 7 && days <= 60 && (
          <div className="flex items-center justify-between gap-1.5 text-amber-700 text-[10px] mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <span className="flex items-center gap-1"><Clock size={10} /> ينتهي خلال</span>
            <span className="font-black">{days} يوم</span>
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto">
          {isActive ? (
            <Link to={`/crowdfund/${project.id}`}
              className="w-full flex items-center justify-center gap-2 bg-brand text-white text-xs font-bold py-2.5 rounded-xl hover:bg-navy transition-colors">
              <DollarSign size={13} /> استثمر الآن
            </Link>
          ) : (
            <Link to={`/crowdfund/${project.id}`}
              className="w-full flex items-center justify-center gap-2 border border-navy/15 text-charcoal/60 text-xs font-semibold py-2.5 rounded-xl hover:border-brand/30 hover:text-brand transition-colors">
              عرض التفاصيل
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CrowdfundPage() {
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterCity,       setFilterCity]       = useState('all');
  const [filterRisk,       setFilterRisk]       = useState('all');
  const [filterType,       setFilterType]       = useState('all');
  const [filterReturnType, setFilterReturnType] = useState('all');
  const [sortBy,           setSortBy]           = useState('best_return');
  const [keyword,          setKeyword]          = useState('');
  const [alertEmail,       setAlertEmail]       = useState('');
  const [alertSent,        setAlertSent]        = useState(false);
  const [marketOpen,       setMarketOpen]       = useState(false);
  const [showAutoInvest,   setShowAutoInvest]   = useState(false);
  const [autoInvestActive, setAutoInvestActive] = useState(false);
  const [autoInvestForm,   setAutoInvestForm]   = useState({
    budget: '2000',
    maxPerProject: '500',
    minReturn: '12',
    riskLevel: 'medium',
    types: [],
    city: 'all',
  });

  useEffect(() => {
    const NOTIF_KEY = 'resurgo-crowdfund-new-notif';
    try {
      const notified = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const newProjects = CROWD_PROJECTS.filter(p => {
        if (notified.includes(p.id)) return false;
        const daysSinceStart = (new Date() - new Date(p.startDate)) / 86400000;
        return p.status === 'active' && daysSinceStart <= 30;
      });
      newProjects.forEach(p => {
        addNotification({ type: 'invest', title: 'مشروع تمويل جماعي جديد', body: `${p.title} — عائد ${p.expectedAnnualReturn}% · باب الاستثمار مفتوح`, link: `/crowdfund/${p.id}` });
        notified.push(p.id);
      });
      if (newProjects.length) localStorage.setItem(NOTIF_KEY, JSON.stringify(notified));
    } catch {}
  }, []);

  const allCities = [
    'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
    'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
  ];
  const allTypes  = [...new Set(CROWD_PROJECTS.map(p => p.type))];

  const filtered = useMemo(() => {
    let r = CROWD_PROJECTS;
    if (filterStatus     !== 'all') r = r.filter(p => p.status     === filterStatus);
    if (filterCity       !== 'all') r = r.filter(p => p.city       === filterCity);
    if (filterRisk       !== 'all') r = r.filter(p => p.riskLevel  === filterRisk);
    if (filterType       !== 'all') r = r.filter(p => p.type       === filterType);
    if (filterReturnType !== 'all') r = r.filter(p => p.returnType === filterReturnType);
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      r = r.filter(p =>
        p.title.toLowerCase().includes(kw) ||
        p.developer.toLowerCase().includes(kw) ||
        p.city.includes(kw) ||
        p.district.includes(kw)
      );
    }

    return [...r].sort((a, b) => {
      switch (sortBy) {
        case 'best_return':  return b.expectedAnnualReturn - a.expectedAnnualReturn;
        case 'closing_soon': return daysLeft(a.deadline) - daysLeft(b.deadline);
        case 'min_invest':   return a.minInvestment - b.minInvestment;
        case 'funding_pct':  return fundingPct(b.raisedAmount, b.targetAmount) - fundingPct(a.raisedAmount, a.targetAmount);
        case 'newest':       return b.id - a.id;
        default:             return 0;
      }
    });
  }, [filterStatus, filterCity, filterRisk, filterType, filterReturnType, keyword, sortBy]);

  const hasFilter = filterStatus !== 'all' || filterCity !== 'all' || filterRisk !== 'all'
    || filterType !== 'all' || filterReturnType !== 'all' || keyword.trim();

  const resetFilters = () => {
    setFilterStatus('all'); setFilterCity('all'); setFilterRisk('all');
    setFilterType('all'); setFilterReturnType('all'); setKeyword('');
  };

  const handleAutoInvestSave = () => {
    setAutoInvestActive(true);
    setShowAutoInvest(false);
    toast.success('تم تفعيل الاستثمار التلقائي! سيتم توزيع ميزانيتك على المشاريع المناسبة.');
    addNotification({
      type: 'invest',
      title: 'الاستثمار التلقائي مفعَّل',
      body: `ميزانية ${Number(autoInvestForm.budget).toLocaleString()}$ · حد ${autoInvestForm.minReturn}% عائد · مخاطرة ${autoInvestForm.riskLevel === 'low' ? 'منخفضة' : autoInvestForm.riskLevel === 'medium' ? 'متوسطة' : 'عالية'}`,
      link: '/crowdfund',
    });
  };

  const handleAlertSignup = () => {
    if (!alertEmail.trim() || !alertEmail.includes('@')) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    setAlertSent(true);
    toast.success('سيتم إشعارك عند إطلاق مشاريع جديدة!');
    addNotification({
      type: 'system',
      title: 'تم تفعيل التنبيهات',
      body: `سيصلك إشعار على ${alertEmail} عند إطلاق أي مشروع تمويل جماعي جديد`,
      link: '/crowdfund',
    });
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="التمويل الجماعي العقاري — استثمر من 500$"
        description="استثمر في العقارات السورية بأقل من 500 دولار عبر نموذج التمويل الجماعي. عوائد سنوية تصل إلى 18.5% لمغتربين ومستثمرين من حول العالم."
        path="/crowdfund"
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <PageHero
        num="09"
        eyebrow="التمويل الجماعي العقاري"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            استثمر في سوريا<br />
            <span className="text-brand">من أي مكان.</span>
          </h1>
        }
        subtitle="امتلك حصة في مشاريع عقارية حقيقية بدءاً من 500$ فقط — عوائد تصل إلى 18.5% موزَّعة كل 6 أشهر"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'التمويل الجماعي' }]}
      >
        <div className="flex flex-wrap gap-3 mt-2">
          {CROWD_STATS.map(({ label, value, sub }) => (
            <div key={label} className="flex flex-col bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm min-w-[100px]">
              <span className="text-white font-black text-lg leading-none">{value}</span>
              <span className="text-white/55 text-[10px] mt-0.5">{label}</span>
              {sub && <span className="text-white/35 text-[9px]">{sub}</span>}
            </div>
          ))}
        </div>
      </PageHero>

      {/* ── Platform track record ─────────────────────────────── */}
      <section className="bg-navy py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { icon: Award,      value: PLATFORM_TRACK_RECORD.projectsCompleted,           label: 'مشروع مكتمل بنجاح',         color: 'text-brand' },
              { icon: TrendingUp, value: `${PLATFORM_TRACK_RECORD.avgRealizedReturn}%`,     label: 'متوسط العائد المحقَّق فعلياً', color: 'text-cta'   },
              { icon: Shield,     value: PLATFORM_TRACK_RECORD.defaults,                    label: 'صفر حالات تعثر',              color: 'text-green-400' },
              { icon: Globe,      value: `$${(PLATFORM_TRACK_RECORD.totalDeployed / 1_000_000).toFixed(1)}M`, label: 'إجمالي رأس المال المُنشَّر', color: 'text-violet-400' },
              { icon: Users,      value: PLATFORM_TRACK_RECORD.totalInvestors,              label: `مستثمر من ${PLATFORM_TRACK_RECORD.countriesCount} دولة`, color: 'text-amber-400' },
            ].map(({ icon: Icon, value, label, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="text-center">
                <Icon size={20} className={`${color} mx-auto mb-2`} />
                <p className={`font-black text-2xl ${color}`}>{value}</p>
                <p className="text-white/50 text-[10px] mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">الآلية</p>
            <h2 className="text-navy font-black text-2xl">كيف يعمل التمويل الجماعي؟</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <motion.div key={n}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="text-center px-4">
                <div className="relative inline-block mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto">
                    <Icon size={22} className="text-brand" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cta text-white text-[9px] font-black flex items-center justify-center">
                    {n.slice(1)}
                  </span>
                </div>
                <h3 className="text-navy font-bold text-sm mb-2">{title}</h3>
                <p className="text-charcoal/60 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>

          {/* SPV explanation strip */}
          <div className="mt-10 bg-cream rounded-2xl p-5 flex gap-4 items-start">
            <Shield size={20} className="text-brand shrink-0 mt-0.5" />
            <div>
              <p className="text-navy font-bold text-sm mb-1">كيف تُحمى أموالك؟ — نموذج SPV</p>
              <p className="text-charcoal/65 text-xs leading-relaxed">
                لكل مشروع شركة ذات غرض خاص (Special Purpose Vehicle) مُسجَّلة في دولة آمنة قانونياً (الإمارات / تركيا).
                أنت تمتلك حصة في هذه الشركة، والشركة بدورها تمتلك العقار. في حال أي خلاف، العقار مُرهون لصالح الشركة
                ومن ثم لصالحك. <strong className="text-brand">أموالك محمية بموجب القانون، وليس بالوعود فقط.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust partners ───────────────────────────────────── */}
      <section className="bg-white py-8">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-charcoal/35 text-[10px] font-bold uppercase tracking-widest mb-5">شركاؤنا ومدققونا</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TRUST_PARTNERS.map(({ name, desc, color }) => (
              <div key={name} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${color}`}>
                <BadgeCheck size={13} />
                <span>{name}</span>
                <span className="opacity-50 font-normal">— {desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">الفرص المتاحة</p>
            <h2 className="text-navy font-black text-2xl">مشاريع التمويل الجماعي</h2>
          </div>
          <p className="text-charcoal/50 text-xs">
            <span className="font-bold text-navy">{filtered.length}</span> من {CROWD_PROJECTS.length} مشروع
          </p>
        </div>

        {/* ── Filter + search bar ── */}
        <div className="bg-white border border-navy/[0.08] rounded-xl p-4 mb-7 space-y-3">

          {/* Row 1: search + sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="ابحث بالاسم أو المدينة أو المطوّر..."
                className="w-full bg-white border border-navy/12 rounded-xl pr-9 pl-3 py-2 text-xs text-navy placeholder:text-charcoal/35 focus:border-brand/40 focus:outline-none"
              />
              {keyword && (
                <button onClick={() => setKeyword('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-red-400">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <ArrowUpDown size={11} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-navy/12 rounded-xl pr-8 pl-7 py-2 text-xs text-navy appearance-none focus:outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>
          </div>

          {/* Row 2: filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status pills */}
            <div className="flex gap-1.5 flex-wrap">
              {[
                ['all', 'الكل'],
                ['active', 'مفتوح'],
                ['funded', 'مكتمل'],
                ['returning', 'يوزع'],
              ].map(([val, label]) => (
                <button key={val} onClick={() => setFilterStatus(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${filterStatus === val ? 'bg-brand border-brand text-white shadow-sm shadow-brand/20' : 'border-navy/15 text-charcoal/60 hover:border-brand/30 hover:text-brand bg-white'}`}>
                  {label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-navy/10 hidden sm:block" />

            {/* City */}
            <div className="relative">
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
                className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none cursor-pointer">
                <option value="all">كل المدن</option>
                {allCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>

            {/* Type */}
            <div className="relative">
              <select value={filterType} onChange={e => setFilterType(e.target.value)}
                className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none cursor-pointer">
                <option value="all">كل الأنواع</option>
                {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>

            {/* Return type */}
            <div className="relative">
              <select value={filterReturnType} onChange={e => setFilterReturnType(e.target.value)}
                className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none cursor-pointer">
                <option value="all">كل العوائد</option>
                <option value="rental">إيجاري</option>
                <option value="capital_gain">رأسمالي</option>
                <option value="hybrid">مختلط</option>
              </select>
              <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>

            {/* Risk */}
            <div className="relative">
              <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
                className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none cursor-pointer">
                <option value="all">كل المستويات</option>
                <option value="low">منخفضة المخاطر</option>
                <option value="medium">متوسطة المخاطر</option>
                <option value="high">عالية المخاطر</option>
              </select>
              <ChevronDown size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>

            {hasFilter && (
              <button onClick={resetFilters}
                className="flex items-center gap-1 text-xs text-charcoal/50 hover:text-red-500 transition-colors mr-auto">
                <RefreshCw size={11} /> إعادة تعيين
              </button>
            )}
          </div>
        </div>

        {/* Grid / empty state */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-charcoal/40">
            <TrendingUp size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold mb-2">لا توجد مشاريع تطابق الفلتر</p>
            <button onClick={resetFilters} className="text-xs text-brand hover:underline">إزالة الفلاتر</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </section>

      {/* ── Secondary market teaser ──────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-white rounded-3xl border border-navy/8 overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex items-start justify-between flex-wrap gap-3">
            <div>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">السوق الثانوي</p>
              <h2 className="text-navy font-black text-xl">بع حصتك قبل انتهاء المدة</h2>
              <p className="text-charcoal/55 text-xs mt-1 max-w-lg">
                يمكنك بيع حصتك لمستثمرين آخرين عبر السوق الثانوي RESURGO — سيولة جزئية بدلاً من الانتظار حتى نهاية فترة الاحتجاز.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {SECONDARY_LISTINGS.length} حصة معروضة الآن
            </div>
          </div>

          <div className="px-6 pb-6 grid sm:grid-cols-2 gap-3">
            {SECONDARY_LISTINGS.map((l, i) => (
              <div key={i} className="bg-cream rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-navy font-bold text-xs truncate">{l.projectTitle}</p>
                  <p className="text-charcoal/45 text-[10px] mt-0.5">
                    البائع: {l.seller} · عائد مُحقَّق حتى الآن: {l.returnSoFar}%
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-navy font-black text-sm">${l.amount.toLocaleString()}</p>
                  <p className="text-[9px] text-charcoal/35">السعر الأصلي ${l.originalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-navy/6 px-6 py-3 bg-cream/40 flex items-center justify-between">
            <p className="text-[10px] text-charcoal/40">رسوم البيع عبر السوق الثانوي: 1.5% من قيمة الصفقة</p>
            <button onClick={() => setMarketOpen(true)}
              className="flex items-center gap-1.5 text-xs text-brand font-bold hover:text-navy transition-colors">
              عرض الكل <ArrowLeft size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Investor testimonials ─────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-2">قصص نجاح</p>
            <h2 className="text-navy font-black text-2xl">مستثمرون يثقون في RESURGO</h2>
            <p className="text-charcoal/50 text-xs mt-2">آراء حقيقية من مستثمرين سوريين حول العالم</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 flex flex-col shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-shadow"
                style={{ borderRadius: '8px' }}>
                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <p className="text-charcoal/70 text-xs leading-relaxed flex-1 mb-4">"{t.text}"</p>

                {/* Return badge */}
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-1.5 flex items-center justify-between mb-4">
                  <span className="text-[10px] text-green-700">عائد محقَّق / متوقَّع</span>
                  <span className="font-black text-green-700 text-sm">{t.return}</span>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-navy/10 shrink-0" />
                  <div>
                    <p className="text-navy font-bold text-xs">{t.name}</p>
                    <p className="text-charcoal/45 text-[10px]">{t.country} · {t.project}</p>
                  </div>
                  <div className="mr-auto text-right">
                    <p className="text-[9px] text-charcoal/35">استثمر</p>
                    <p className="text-xs font-black text-brand">{t.invested}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Alert signup ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-navy rounded-3xl p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cta/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex-1 text-center sm:text-right relative">
            <Bell size={22} className="text-brand mb-2 mx-auto sm:mx-0" />
            <h3 className="text-white font-black text-lg mb-1">لا تفوّت مشروعاً جديداً</h3>
            <p className="text-white/50 text-xs">احصل على إشعار فوري عند إطلاق أي فرصة تمويل جديدة</p>
          </div>

          <div className="flex-1 w-full relative">
            {alertSent ? (
              <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl p-4">
                <CheckCircle size={20} className="text-green-400 shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">تم التسجيل!</p>
                  <p className="text-white/50 text-xs">ستصلك التنبيهات على {alertEmail}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={alertEmail}
                  onChange={e => setAlertEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAlertSignup()}
                  placeholder="بريدك الإلكتروني..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand/60"
                />
                <button onClick={handleAlertSignup}
                  className="bg-cta hover:bg-cta/90 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap">
                  <Bell size={14} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Auto-Invest ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-3xl p-7 flex flex-col sm:flex-row items-center gap-6 border transition-all ${
            autoInvestActive
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-brand/20'
          }`}
        >
          <div className="flex-1 text-right">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={18} className={autoInvestActive ? 'text-green-600' : 'text-brand'} />
              <span className={`text-xs font-bold uppercase tracking-wider ${autoInvestActive ? 'text-green-700' : 'text-brand'}`}>
                {autoInvestActive ? 'مفعَّل' : 'جديد'}
              </span>
            </div>
            <h3 className="text-navy font-black text-lg mb-1">الاستثمار التلقائي</h3>
            <p className="text-charcoal/55 text-xs leading-relaxed">
              {autoInvestActive
                ? `ميزانيتك ${Number(autoInvestForm.budget).toLocaleString()}$ موزَّعة تلقائياً على المشاريع التي تطابق معاييرك`
                : 'حدِّد ميزانيتك ومعاييرك مرة واحدة — ستوزع المنصة استثماراتك تلقائياً على المشاريع المناسبة فور إطلاقها'}
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setShowAutoInvest(true)}
              className={`px-6 py-3 rounded-2xl text-sm font-bold transition-colors ${
                autoInvestActive
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-brand hover:bg-navy text-white'
              }`}
            >
              {autoInvestActive ? 'تعديل الإعدادات' : 'إعداد الاستثمار التلقائي'}
            </button>
            {autoInvestActive && (
              <button
                onClick={() => { setAutoInvestActive(false); toast('تم إيقاف الاستثمار التلقائي'); }}
                className="text-xs text-charcoal/40 hover:text-red-500 transition-colors text-center"
              >
                إيقاف التشغيل
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Auto-Invest Modal */}
      <AnimatePresence>
        {showAutoInvest && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAutoInvest(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6"
              dir="rtl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <RefreshCw size={18} className="text-brand" />
                  <h3 className="text-navy font-black text-base">إعداد الاستثمار التلقائي</h3>
                </div>
                <button onClick={() => setShowAutoInvest(false)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-navy/8 text-charcoal/40">
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-charcoal/60 font-medium block mb-1">الميزانية الكلية ($)</label>
                    <input type="number" value={autoInvestForm.budget}
                      onChange={e => setAutoInvestForm(f => ({ ...f, budget: e.target.value }))}
                      className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-charcoal/60 font-medium block mb-1">حد أقصى للمشروع ($)</label>
                    <input type="number" value={autoInvestForm.maxPerProject}
                      onChange={e => setAutoInvestForm(f => ({ ...f, maxPerProject: e.target.value }))}
                      className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-1">الحد الأدنى للعائد السنوي (%)</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="8" max="20" step="0.5"
                      value={autoInvestForm.minReturn}
                      onChange={e => setAutoInvestForm(f => ({ ...f, minReturn: e.target.value }))}
                      className="flex-1 accent-brand"
                    />
                    <span className="text-brand font-black text-sm w-12 text-center">{autoInvestForm.minReturn}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-2">مستوى المخاطرة</label>
                  <div className="flex gap-2">
                    {[{ v: 'low', l: 'منخفض' }, { v: 'medium', l: 'متوسط' }, { v: 'high', l: 'مرتفع' }].map(({ v, l }) => (
                      <button key={v}
                        onClick={() => setAutoInvestForm(f => ({ ...f, riskLevel: v }))}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          autoInvestForm.riskLevel === v
                            ? 'bg-brand text-white border-brand'
                            : 'border-navy/15 text-charcoal/60 hover:border-brand/40'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-2">نوع العقار (اختياري)</label>
                  <div className="flex gap-2 flex-wrap">
                    {allTypes.map(t => (
                      <button key={t}
                        onClick={() => setAutoInvestForm(f => ({
                          ...f,
                          types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t]
                        }))}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                          autoInvestForm.types.includes(t)
                            ? 'bg-navy text-white border-navy'
                            : 'border-navy/15 text-charcoal/60 hover:border-navy/30'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-charcoal/60 font-medium block mb-1">المدينة المفضلة</label>
                  <select value={autoInvestForm.city}
                    onChange={e => setAutoInvestForm(f => ({ ...f, city: e.target.value }))}
                    className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand"
                  >
                    <option value="all">جميع المدن</option>
                    {allCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="bg-brand/5 border border-brand/15 rounded-2xl p-3 text-xs text-charcoal/60 leading-relaxed">
                  ستستثمر المنصة تلقائياً في المشاريع التي تطابق معاييرك فور إطلاقها، بحد أقصى{' '}
                  <strong className="text-navy">${Number(autoInvestForm.maxPerProject).toLocaleString()}</strong> لكل مشروع حتى استنفاد الميزانية.
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowAutoInvest(false)}
                  className="flex-1 py-3 rounded-xl border border-navy/15 text-navy text-sm font-bold hover:bg-cream transition-colors">
                  إلغاء
                </button>
                <button onClick={handleAutoInvestSave}
                  className="flex-1 py-3 rounded-xl bg-brand hover:bg-navy text-white text-sm font-bold transition-colors">
                  تفعيل التلقائي
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Risk disclosure ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-14">
        <div className="border border-amber-200 bg-amber-50/60 rounded-2xl p-5 flex gap-4">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-charcoal/70">
            <p className="font-bold text-amber-800 mb-1">إفصاح عن المخاطر</p>
            الاستثمار العقاري الجماعي ينطوي على مخاطر منها: تأخر التسليم، تذبذب قيمة العقار، ظروف السوق المحلية.
            العوائد المذكورة هي تقديرات غير مضمونة. لا تستثمر أموالاً لا تتحمل خسارتها. يُنصح بتنويع محفظتك الاستثمارية.
            منصة RESURGO وسيط ومنظِّم وليست ضامنة للعوائد.
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────── */}
      <section className="bg-[#1f2a38] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center" dir="rtl">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <MessageCircle size={14} className="text-brand" />
            <p className="text-brand text-xs font-bold uppercase tracking-widest">للمغتربين</p>
          </div>
          <h2 className="text-white font-black text-2xl mb-3">استثمر في وطنك من مكانك</h2>
          <p className="text-white/60 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            انضم إلى أكثر من {PLATFORM_TRACK_RECORD.totalInvestors} مستثمر سوري من {PLATFORM_TRACK_RECORD.countriesCount} دولة يبنون ثروتهم في العقار السوري دون الحاجة للعودة
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth?tab=register"
              className="bg-[#f37124] hover:bg-[#e06318] text-white px-8 py-3.5 rounded-xl text-sm font-bold transition-colors inline-flex items-center justify-center gap-2">
              <Users size={16} /> ابدأ استثمارك اليوم
            </Link>
            <Link to="/crowdfund/1"
              className="px-8 py-3.5 text-sm font-bold rounded-xl border border-white/15 text-white/80 hover:bg-white/[0.08] hover:text-white transition-colors inline-flex items-center justify-center gap-2">
              <CheckCircle size={16} /> تصفّح المشاريع
            </Link>
          </div>
        </div>
      </section>

      <SecondaryMarketModal isOpen={marketOpen} onClose={() => setMarketOpen(false)} />

      {/* Valuation cross-link — required for crowdfund listing */}
      <div className="max-w-5xl mx-auto px-4 pb-10">
        <Link to="/valuation"
          className="flex items-center gap-4 p-5 bg-white border border-brand/20 rounded-2xl hover:border-brand/50 hover:shadow-lg transition-all group">
          <div className="w-12 h-12 rounded-xl bg-brand/8 border border-brand/15 flex items-center justify-center shrink-0 group-hover:bg-brand/15 transition-colors">
            <BadgeCheck size={22} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-navy font-bold text-sm">
              التقييم شرط أساسي لطرح مشروعك للتمويل الجماعي
            </p>
            <p className="text-charcoal/55 text-xs mt-0.5">
              احصل على تقرير IVS 2025 معتمد لرفع ثقة المستثمرين وتسريع التمويل — تقدير آلي مجاني للبداية
            </p>
          </div>
          <div className="flex items-center gap-1 text-brand text-xs font-bold shrink-0 group-hover:gap-2 transition-all">
            اطلب تقييماً <ArrowLeft size={14} className="rotate-180" />
          </div>
        </Link>
      </div>
    </div>
  );
}
