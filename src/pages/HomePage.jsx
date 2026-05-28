import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  ArrowLeft, Building2, TrendingUp, ShieldCheck,
  ChevronRight, Shield, Globe, Cpu,
  Briefcase, FileSearch, Scale,
  ArrowUpRight, CheckCircle, Wrench, Search,
  Users, Layers, BarChart3, Hammer,
  AlertTriangle, Bell, ChevronLeft,
} from 'lucide-react';

import PropertyCard3D from '../components/PropertyCard3D';
import { useAuth } from '../context/AuthContext';
import { useGlobalData } from '../context/GlobalContext';
import SEO from '../components/SEO';
import { useNews } from '../hooks/useNews';
import { URGENCY } from '../data/newsData';

const MapSection = lazy(() => import('../components/MapSection'));
const FluidHero  = lazy(() => import('../components/FluidHero'));

// ── Animated counter ──────────────────────────────────────────────────────────
function useCounter(target, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      setValue(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return [value, ref];
}

// ── Scroll-fade wrapper ───────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '', direction = 'up' }) {
  const from = direction === 'up' ? { y: 40 } : direction === 'left' ? { x: -40 } : { x: 40 };
  return (
    <motion.div
      initial={{ opacity: 0, ...from }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { rawValue: 12400, suffix: '+', label: 'عقار مسجّل' },
  { rawValue: 3200,  suffix: '+', label: 'مستثمر نشط' },
  { rawValue: 98,    suffix: '%', label: 'دقة التقييم' },
  { rawValue: 14,    suffix: '',  label: 'محافظة سورية' },
];

const SEARCH_CITIES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة',
  'القنيطرة', 'السويداء', 'درعا',
];
const SESSION_FILTERS_KEY = 'resurgo-filters-session';

const PLATFORMS = [
  { num: '01', icon: Building2,  label: 'العقارات',  desc: 'شقق ودور وأراضٍ في كل المدن السورية — أسعار شفافة وعقارات موثّقة ومفحوصة.', to: '/properties', color: 'brand' },
  { num: '02', icon: TrendingUp, label: 'الاستثمار', desc: 'فرص استثمارية موثوقة بعوائد مدروسة — استثمر في سوريا بثقة وضمانات قانونية واضحة.', to: '/invest', color: 'amber' },
  { num: '03', icon: Briefcase,  label: 'التوظيف',   desc: 'مهندسون ومقاولون معتمدون — ابحث عن فريقك الهندسي أو أوجد فرصة عملك الآن.', to: '/jobs', color: 'emerald' },
  { num: '04', icon: FileSearch, label: 'الدراسات',  desc: 'تقارير هندسية ودراسات جدوى معتمدة — خذ قرارك الاستثماري على أساس معلومة صحيحة.', to: '/studies', color: 'violet' },
  { num: '05', icon: Scale,      label: 'التخليص',   desc: 'أنجز وكالتك أو حصر إرثك أو صك ملكيتك — بلا تعقيد وبلا انتظار طويل.', to: '/clearing/dashboard', color: 'slate' },
  { num: '06', icon: Wrench,     label: 'المعدات',      desc: 'آليات ومعدات ثقيلة للإيجار والبيع — مجهّزة لمشاريعك الإنشائية في كل المحافظات.', to: '/equipment',         color: 'orange' },
  { num: '07', icon: Users,      label: 'المطورون',     desc: 'اعرض مشروعك أمام المستثمرين وابنِ شراكات حقيقية تُنجزه على أرض الواقع.', to: '/developers',        color: 'rose'   },
  { num: '08', icon: Layers,     label: 'تمويل جماعي', desc: 'شارك في إعادة بناء سوريا — استثمر بمبلغ صغير وخذ نصيبك من العائد.',   to: '/crowdfund',         color: 'sky'    },
  { num: '09', icon: BarChart3,  label: 'التقييم',      desc: 'احصل على تقرير تقييم رسمي لعقارك — معتمد ومقبول للبيع والتمويل والتقاضي.', to: '/valuation-request', color: 'indigo' },
  { num: '10', icon: Hammer,    label: 'الإكساء',      desc: 'عروض أسعار فورية من شركات موثقة لإكساء عقارك — متابعة مرئية ودفعات مرحلية آمنة.', to: '/finishing', color: 'teal' },
];

const COLOR_MAP = {
  brand:   { accent: 'bg-brand',       iconBg: 'bg-brand/10 border-brand/20',         text: 'text-brand' },
  amber:   { accent: 'bg-amber-500',   iconBg: 'bg-amber-500/10 border-amber-400/20', text: 'text-amber-600' },
  emerald: { accent: 'bg-emerald-500', iconBg: 'bg-emerald-500/10 border-emerald-400/20', text: 'text-emerald-600' },
  violet:  { accent: 'bg-violet-500',  iconBg: 'bg-violet-500/10 border-violet-400/20',   text: 'text-violet-600' },
  slate:   { accent: 'bg-slate-400',   iconBg: 'bg-slate-100 border-slate-300/60',           text: 'text-slate-500'  },
  orange:  { accent: 'bg-orange-500',  iconBg: 'bg-orange-500/10 border-orange-400/20',     text: 'text-orange-600' },
  rose:    { accent: 'bg-rose-500',    iconBg: 'bg-rose-500/10 border-rose-400/20',          text: 'text-rose-500'   },
  sky:     { accent: 'bg-sky-500',     iconBg: 'bg-sky-500/10 border-sky-400/20',            text: 'text-sky-600'    },
  indigo:  { accent: 'bg-indigo-500',  iconBg: 'bg-indigo-500/10 border-indigo-400/20',      text: 'text-indigo-600' },
  teal:    { accent: 'bg-teal-500',   iconBg: 'bg-teal-500/10 border-teal-400/20',           text: 'text-teal-600'   },
};

const FEATURES = [
  { icon: Cpu,        title: 'تقارير هندسية آلية', desc: 'مهندس حقيقي يفحص عقارك ميدانياً ويصدر لك تقريراً رسمياً معتمداً.' },
  { icon: Shield,     title: 'توثيق بالبلوكتشين', desc: 'كل وثيقة ملكية مسجّلة رقمياً ومحمية — لا تزوير ممكن وحقّك محفوظ دائماً.' },
  { icon: ShieldCheck,title: 'تسوية قانونية سهلة', desc: 'نجهّز ملفك القانوني ونربطه ببوابة إنجز الحكومية — بأقل وقت وأقل جهد.' },
  { icon: Globe,      title: 'خريطة تفاعلية دقيقة', desc: 'كل عقار على الخريطة بالضبط — تعرّف على موقعه والأحياء المحيطة به.' },
];

const TRUST_POINTS = [
  'تحقق ميداني من مهندسين معتمدين',
  'توثيق الملكية بلوكتشين لا يُلغى',
  'دعم وثائق ناقصة وسجلات مفقودة',
  'مرتبط ببوابة إنجز الحكومية السورية',
  'تقييم فني وفق معايير IVS 2025',
  'أكثر من 12,000 عقار في 14 محافظة',
  'يعمل على اتصال ضعيف وأجهزة بسيطة',
  'منصة متعددة الخدمات في عنوان واحد',
];

// ── Stat item — light mode ────────────────────────────────────────────────────
function StatItem({ rawValue, suffix, label }) {
  const [val, ref] = useCounter(rawValue);
  return (
    <div ref={ref} className="flex flex-col items-center text-center py-8 px-4 relative group">
      <p className="font-display text-5xl sm:text-6xl text-navy tracking-wide tabular-nums leading-none">
        {val.toLocaleString()}<span className="text-brand text-4xl sm:text-5xl">{suffix}</span>
      </p>
      <div className="w-10 h-[2px] bg-brand/25 rounded-full my-3 group-hover:bg-brand/60 transition-colors duration-300" />
      <p className="text-charcoal/70 text-[11px] font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const { properties, propertiesLoading } = useGlobalData();
  const { articles } = useNews();
  const navigate = useNavigate();
  const heroRef  = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });

  const topAlerts = articles
    .filter(a => a.status === 'published')
    .sort((a, b) => ({ urgent: 0, high: 1, info: 2 }[a.urgency] ?? 2) - ({ urgent: 0, high: 1, info: 2 }[b.urgency] ?? 2))
    .slice(0, 3);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [searchCity,    setSearchCity]    = useState('');
  const [searchType,    setSearchType]    = useState('');
  const [searchPurpose, setSearchPurpose] = useState('الكل');

  const handleSearch = (cityOverride) => {
    const city    = cityOverride ?? searchCity;
    const filters = {
      city:     city    || 'all',
      type:     searchType || 'all',
      status:   searchPurpose === 'الكل' ? 'all' : searchPurpose,
      minPrice: '', maxPrice: '', search: '',
    };
    try { sessionStorage.setItem(SESSION_FILTERS_KEY, JSON.stringify(filters)); } catch {}
    navigate('/properties');
  };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="RESURGO — منصة العقارات والاستثمار في سوريا"
        description="اكتشف آلاف العقارات السورية، استثمر بذكاء، وأدر صفقاتك عبر منصة ريسورقو المتكاملة"
        path="/"
      />

      {/* ═══════════════════════════════════════════════════════════════
          HERO — fluid glass · Damascus futuristic backdrop
      ═══════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-end overflow-hidden" style={{ background: '#03090e' }}>

        {/* ── Damascus city background image ── */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=75')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 45%',
          }} />
          {/* Brand colour-grade */}
          <div className="absolute inset-0" style={{ background: 'rgba(3,9,20,0.52)' }} />
          {/* Bottom depth */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, rgba(3,9,20,0.15) 0%, transparent 28%, rgba(3,9,20,0.65) 68%, rgba(3,9,20,1) 100%)'
          }} />
          {/* RTL-side vignette (text side = right in Arabic) */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to left, transparent 30%, rgba(3,9,20,0.88) 100%)'
          }} />
        </div>

        {/* ── Fluid glass WebGL overlay ── */}
        <div className="absolute inset-0 z-[1] pointer-events-none">
          <Suspense fallback={null}>
            <FluidHero />
          </Suspense>
        </div>

        {/* ── Aurora blobs ── */}
        <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
          <motion.div
            style={{ position: 'absolute', top: '6%', right: '4%', width: 860, height: 860, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(89,121,187,0.22) 0%, rgba(89,121,187,0.05) 45%, transparent 70%)',
              filter: 'blur(100px)' }}
            animate={{ scale: [1, 1.09, 0.97, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{ position: 'absolute', bottom: '12%', left: '8%', width: 680, height: 680, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(243,113,36,0.14) 0%, rgba(251,146,60,0.04) 45%, transparent 70%)',
              filter: 'blur(85px)' }}
            animate={{ scale: [1, 1.16, 0.94, 1], x: [0, -22, 16, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />
          <motion.div
            style={{ position: 'absolute', top: '42%', right: '38%', width: 480, height: 480, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(20,184,166,0.09) 0%, transparent 70%)',
              filter: 'blur(70px)' }}
            animate={{ scale: [1, 1.28, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 7 }}
          />
        </div>

        {/* ── Fine grid ── */}
        <div className="absolute inset-0 z-[3] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(89,121,187,1) 1px, transparent 1px), linear-gradient(90deg, rgba(89,121,187,1) 1px, transparent 1px)',
          backgroundSize: '110px 110px', opacity: 0.022,
        }} />

        {/* ── Content ── */}
        <motion.div style={{ opacity: heroOpacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-28">

          <div className="flex items-end gap-8 flex-wrap xl:flex-nowrap">

            {/* ── Glass content card ── */}
            <motion.div
              initial={{ opacity: 0, y: 64, filter: 'blur(14px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden flex-1"
              style={{
                background: 'rgba(3,9,20,0.50)',
                backdropFilter: 'blur(38px) saturate(180%)',
                WebkitBackdropFilter: 'blur(38px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.085)',
                borderRadius: 36,
                padding: 'clamp(32px, 4vw, 56px)',
                boxShadow: '0 48px 120px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 -1px 0 rgba(0,0,0,0.25)',
                maxWidth: 680,
              }}
            >
              {/* Iridescent top-edge accent */}
              <div style={{
                position: 'absolute', top: 0, left: '12%', right: '12%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(127,164,232,0.75) 30%, rgba(89,121,187,0.95) 52%, rgba(243,113,36,0.55) 76%, transparent)',
              }} />

              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-y-0 pointer-events-none"
                style={{ left: 0, width: '38%',
                  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.042), transparent)',
                }}
                animate={{ left: ['-38%', '140%'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear', repeatDelay: 6 }}
              />

              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.28 }}
                className="inline-flex items-center gap-2.5 mb-8"
                style={{ background: 'rgba(89,121,187,0.11)', border: '1px solid rgba(89,121,187,0.28)', borderRadius: 100, padding: '7px 17px' }}
              >
                <motion.span
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#5979bb', boxShadow: '0 0 10px rgba(89,121,187,0.9)' }}
                  animate={{ opacity: [1, 0.12, 1], scale: [1, 1.75, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                />
                <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em' }}>
                  المنصة العقارية الأولى في سوريا
                </span>
              </motion.div>

              {/* Headline */}
              <div style={{ marginBottom: '1.4rem' }}>
                <motion.span
                  initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'block',
                    fontSize: 'clamp(3.2rem, 5.8vw, 5.6rem)',
                    fontWeight: 900, lineHeight: 1.0,
                    letterSpacing: '-0.026em', color: '#fff',
                    marginBottom: '0.3rem',
                  }}
                >
                  أعِد بناء سوريا
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    display: 'block',
                    fontSize: 'clamp(2.4rem, 4.6vw, 4.6rem)',
                    fontWeight: 900, lineHeight: 1.08,
                    letterSpacing: '-0.022em',
                    background: 'linear-gradient(128deg, #8ab4f8 0%, #c4dcff 40%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}
                >
                  حجراً فوق حجر.
                </motion.span>
              </div>

              {/* Sub-line */}
              <motion.p
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.58 }}
                style={{ color: 'rgba(255,255,255,0.46)', fontSize: 'clamp(0.95rem, 1.4vw, 1.06rem)', lineHeight: 1.85, marginBottom: '2.6rem' }}
              >
                كل ما تحتاجه لشراء عقار أو الاستثمار أو إيجاد فرصة عمل — في منصة واحدة موثوقة وسهلة الاستخدام.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.70 }}
                className="flex flex-wrap gap-3"
              >
                {user ? (
                  <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #5979bb, #7fa4e8)', color: '#fff', borderRadius: 18, padding: '15px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(89,121,187,0.52)' }}>
                    لوحة التحكم <ArrowLeft size={17} />
                  </Link>
                ) : (
                  <>
                    <Link to="/auth?tab=register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #5979bb, #7fa4e8)', color: '#fff', borderRadius: 18, padding: '15px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 8px 32px rgba(89,121,187,0.50)' }}>
                      ابدأ مجاناً <ArrowLeft size={17} />
                    </Link>
                    <Link to="/properties" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.82)', borderRadius: 18, padding: '15px 28px', fontSize: 15, fontWeight: 600, textDecoration: 'none', backdropFilter: 'blur(12px)' }}>
                      تصفّح العقارات <ChevronRight size={15} />
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>

            {/* ── Floating glass stats panel ── */}
            <motion.div
              initial={{ opacity: 0, x: -48, y: 20 }} animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 1.05, delay: 0.88, ease: [0.22, 1, 0.36, 1] }}
              className="hidden xl:block flex-shrink-0 self-center"
            >
              <motion.div
                animate={{ y: [0, -13, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  position: 'relative',
                  background: 'rgba(3,9,20,0.74)',
                  border: '1px solid rgba(89,121,187,0.22)',
                  borderRadius: 28, padding: '28px 32px',
                  backdropFilter: 'blur(28px)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.07)',
                  minWidth: 228,
                  overflow: 'hidden',
                }}
              >
                {/* Top iridescent line */}
                <div style={{ position: 'absolute', top: 0, left: '18%', right: '18%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(127,164,232,0.65), transparent)' }} />

                <p style={{ color: 'rgba(255,255,255,0.30)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>RESURGO · LIVE</p>

                {[
                  { label: 'عقار مسجّل',  value: '12,400+', color: '#7fa4e8' },
                  { label: 'مستثمر نشط', value: '3,200+',  color: '#a3c4ff' },
                  { label: 'محافظة',       value: '14',       color: '#f59e0b' },
                  { label: 'دقة التقييم', value: '98%',      color: '#22c55e' },
                ].map(({ label, value, color }, i) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.05 + i * 0.09 }}
                    className="flex items-center justify-between gap-8 mb-4"
                  >
                    <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: 11 }}>{label}</span>
                    <span style={{ color, fontWeight: 800, fontSize: 15 }}>{value}</span>
                  </motion.div>
                ))}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14, marginTop: 2 }}>
                  <div className="flex items-center gap-2">
                    <motion.div
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}
                      animate={{ opacity: [1, 0.25, 1] }}
                      transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <span style={{ color: '#22c55e', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em' }}>بيانات حية</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </motion.div>

        {/* ── Scroll cue ── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 22, height: 38, border: '1.5px solid rgba(255,255,255,0.16)', borderRadius: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 7, backdropFilter: 'blur(4px)', background: 'rgba(255,255,255,0.04)' }}
          >
            <motion.div
              animate={{ opacity: [0, 1, 0], y: [0, 10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              style={{ width: 3, height: 7, background: 'rgba(255,255,255,0.5)', borderRadius: 3 }}
            />
          </motion.div>
          <span style={{ color: 'rgba(255,255,255,0.22)', fontSize: 9, letterSpacing: '0.14em' }}>SCROLL</span>
        </motion.div>

        {/* ── Bottom fade to next section ── */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, #03090e)' }} />
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          QUICK SEARCH — overlaps hero bottom, bridges to content
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative z-20 -mt-10 px-4 pb-0">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-2xl shadow-navy/25 p-5 sm:p-6 rounded-2xl">
            <p className="text-charcoal/80 text-[11px] font-bold uppercase tracking-widest mb-4">ابحث عن عقارك في سوريا</p>

            <div className="flex flex-wrap gap-3 items-end">
              {/* City */}
              <div className="flex-1 min-w-[140px]">
                <label htmlFor="search-city" className="text-charcoal/75 text-[11px] font-semibold block mb-1.5">المدينة</label>
                <select id="search-city" value={searchCity} onChange={e => setSearchCity(e.target.value)}
                  className="w-full border border-navy/12 rounded-xl px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-brand transition-colors">
                  <option value="">كل المدن</option>
                  {SEARCH_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Type */}
              <div className="flex-1 min-w-[140px]">
                <label htmlFor="search-type" className="text-charcoal/75 text-[11px] font-semibold block mb-1.5">نوع العقار</label>
                <select id="search-type" value={searchType} onChange={e => setSearchType(e.target.value)}
                  className="w-full border border-navy/12 rounded-xl px-3 py-2.5 text-sm text-navy bg-white focus:outline-none focus:border-brand transition-colors">
                  <option value="">كل الأنواع</option>
                  {['سكني', 'تجاري', 'صناعي', 'أرض'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Purpose pills */}
              <div className="flex-1 min-w-[170px]">
                <label className="text-charcoal/75 text-[11px] font-semibold block mb-1.5">الغرض</label>
                <div className="flex gap-1.5">
                  {['الكل', 'للبيع', 'للإيجار'].map(p => (
                    <button key={p} onClick={() => setSearchPurpose(p)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        searchPurpose === p
                          ? 'bg-navy text-white border-navy'
                          : 'border-navy/15 text-charcoal/60 bg-white hover:border-brand/40 hover:text-brand'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search button */}
              <button onClick={() => handleSearch()}
                className="flex items-center gap-2 bg-gradient-to-l from-brand to-navy text-white font-bold text-sm px-7 py-[11px] rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/25 shrink-0">
                <Search size={16} /> ابحث
              </button>
            </div>

            {/* Quick city links */}
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-charcoal/80 text-[11px]">الأكثر بحثاً:</span>
              {['دمشق', 'حلب', 'اللاذقية', 'حمص', 'طرطوس'].map(city => (
                <button key={city} onClick={() => handleSearch(city)}
                  className="text-[11px] text-navy/80 hover:text-navy font-semibold border border-navy/20 hover:border-navy/40 px-3 py-0.5 rounded-full transition-all hover:bg-cream">
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          STATS STRIP
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-navy/[0.07] mt-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((s, i) => (
              <div key={s.label} className={`${i < 3 ? 'border-l border-navy/[0.07]' : ''}`}>
                <StatItem {...s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PLATFORMS — cream, white cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-24">
        <div className="max-w-7xl mx-auto">

          <FadeIn className="mb-14">
            <span aria-hidden="true" className="num-badge block mb-3">01 — المنصات</span>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy leading-[1.4]">
                  عشر منصات.<br />
                  <span className="text-brand">عنوان واحد.</span>
                </h2>
              </div>
              <p className="text-charcoal/60 text-sm max-w-xs leading-relaxed">
                من شراء العقار وحتى إتمام تخليصك القانوني — كل خطوة تحتاجها موجودة هنا.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {PLATFORMS.map((p, i) => {
              const c = COLOR_MAP[p.color];
              return (
                <motion.div
                  key={p.num}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: i * 0.07 }}
                >
                  <Link to={p.to} className="block group h-full">
                    <div className={`bg-white relative overflow-hidden p-6 h-full transition-all duration-300 hover:-translate-y-1.5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] rounded-lg`}
                    >
                      {/* Top accent bar */}
                      <div className={`absolute top-0 inset-x-0 h-[3px] ${c.accent} opacity-80`} />

                      <div className="flex items-start gap-4 pt-1">
                        <div className={`w-11 h-11 rounded-2xl border ${c.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <p.icon size={20} className={c.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span aria-hidden="true" className={`text-[9px] font-bold tracking-[0.14em] ${c.text}`}>{p.num}</span>
                            <h3 className="text-navy font-black text-base leading-snug">{p.label}</h3>
                          </div>
                          <p className="text-charcoal/75 text-xs leading-relaxed mb-3">{p.desc}</p>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${c.text} opacity-50 group-hover:opacity-100 group-hover:gap-2 transition-all duration-200`}>
                            استكشف <ArrowUpRight size={12} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURED PROPERTIES — white, glass cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <span aria-hidden="true" className="num-badge block mb-3">02 — أحدث العقارات</span>
              <h2 className="text-3xl sm:text-4xl font-black text-navy">عقارات موثّقة ومحقّقة</h2>
              <p className="text-charcoal/60 mt-1.5 text-sm">كل عقار مفحوص ميدانياً ومعتمد من مهندسين متخصصين</p>
            </div>
            <Link to="/properties"
              className="flex items-center gap-2 text-brand hover:text-navy border border-brand/25 hover:border-navy/25 hover:bg-cream px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
              عرض الكل <ChevronRight size={15} />
            </Link>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {propertiesLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-navy/8 overflow-hidden">
                    <div className="h-52 bg-navy/8 animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-3/4 bg-navy/8 rounded-xl animate-pulse" />
                      <div className="h-3 w-full bg-navy/8 rounded-xl animate-pulse" />
                      <div className="h-3 w-2/3 bg-navy/8 rounded-xl animate-pulse" />
                    </div>
                  </div>
                ))
              : properties.slice(0, 3).map((p, i) => <PropertyCard3D key={p.id} property={p} index={i} />)
            }
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FEATURES — cream, navy text cards
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-24">
        <div className="max-w-7xl mx-auto">

          <FadeIn className="mb-14">
            <span aria-hidden="true" className="eyebrow block mb-3">03 — لماذا RESURGO</span>
            <div className="flex items-end justify-between flex-wrap gap-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-navy leading-[1.4]">
                تقنيات خُصِّصت<br />
                <span className="text-brand">لسوريا.</span>
              </h2>
              <p className="text-charcoal/70 text-sm max-w-sm leading-relaxed">
                من التحقق الميداني إلى التوثيق الرقمي — أدوات صُمّمت خصيصاً لواقع السوق العقاري السوري.
              </p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
                className="bg-white p-6 hover:-translate-y-1 transition-all duration-300 cursor-default group shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)]"
                style={{ borderRadius: '8px' }}
              >
                <div className="w-11 h-11 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                  <f.icon size={20} className="text-brand" />
                </div>
                <h3 className="text-navy font-bold text-sm mb-2 leading-snug">{f.title}</h3>
                <p className="text-charcoal/60 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <FadeIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {TRUST_POINTS.map((pt) => (
                <div key={pt} className="flex items-center gap-3 bg-white border border-navy/8 rounded-2xl px-4 py-3.5 hover:border-brand/25 hover:bg-cream/60 transition-all duration-200 group">
                  <div className="w-7 h-7 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
                    <CheckCircle size={13} className="text-brand" />
                  </div>
                  <span className="text-navy/80 text-xs font-semibold leading-snug">{pt}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          MAP — white section
      ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-white px-4 py-24">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="mb-10">
            <span aria-hidden="true" className="num-badge block mb-3">04 — الخريطة التفاعلية</span>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-navy">اكتشف العقارات على الخريطة</h2>
                <p className="text-charcoal/60 text-sm mt-1.5">أكثر من 12,000 عقار موثّق في كبرى المدن السورية</p>
              </div>
              <div className="flex items-center gap-5 text-sm">
                {[['bg-cta', 'للبيع'], ['bg-brand', 'للإيجار']].map(([cls, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${cls}`} />
                    <span className="text-charcoal/60">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)]" style={{ height: '480px', borderRadius: '8px' }}>
              <Suspense fallback={<div className="w-full h-full bg-navy/5 animate-pulse rounded-2xl" />}>
                <MapSection properties={properties.slice(0, 6)} />
              </Suspense>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          USER JOURNEY WIZARD
      ═══════════════════════════════════════════════════════════════ */}
      <section className="section-white px-4 py-20" dir="rtl">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span aria-hidden="true" className="eyebrow block mb-3">ابدأ من هنا</span>
            <h2 className="text-2xl sm:text-3xl font-black text-navy leading-[1.4]">
              من أيّهم أنت؟
            </h2>
            <p className="text-charcoal/55 text-sm mt-3 max-w-md mx-auto">
              اختر وضعك وسنُريك كيف تُنجز ما تريد خطوة بخطوة
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                delay: 0.05, icon: Building2, iconBg: 'bg-brand/10', iconColor: 'text-brand',
                borderColor: 'border-brand/40', topBar: 'bg-brand',
                ctaColor: 'text-brand border-brand/25 hover:bg-brand/8',
                title: 'مالك عقار', ctaTo: '/properties',
                desc: 'عندك عقار وتريد تقييمه أو تأجيره أو استرداد حقوقك فيه؟',
                steps: [
                  { icon: BarChart3,  label: 'قيّم عقارك هندسياً',      to: '/valuation-request', iBg: 'bg-brand/10', iC: 'text-brand' },
                  { icon: Scale,      label: 'أنجز تخليصك القانوني',     to: '/clearing',           iBg: 'bg-brand/10', iC: 'text-brand' },
                  { icon: TrendingUp, label: 'اطرحه للاستثمار الجماعي', to: '/crowdfund',          iBg: 'bg-brand/10', iC: 'text-brand' },
                ],
              },
              {
                delay: 0.12, icon: Wrench, iconBg: 'bg-amber-50', iconColor: 'text-amber-500',
                borderColor: 'border-amber-300/50', topBar: 'bg-amber-400',
                ctaColor: 'text-amber-600 border-amber-200 hover:bg-amber-50',
                title: 'مطور أو مقاول', ctaTo: '/developers',
                desc: 'تدير مشاريع إنشائية وتحتاج فريقاً هندسياً أو معدات أو تمويلاً؟',
                steps: [
                  { icon: Users,      label: 'وظّف مهندسين ومقاولين', to: '/jobs',       iBg: 'bg-amber-50',  iC: 'text-amber-500' },
                  { icon: Wrench,     label: 'استأجر معدات وآليات',    to: '/equipment',  iBg: 'bg-amber-50',  iC: 'text-amber-500' },
                  { icon: FileSearch, label: 'قدّم على المناقصات',     to: '/developers', iBg: 'bg-amber-50',  iC: 'text-amber-500' },
                ],
              },
              {
                delay: 0.19, icon: TrendingUp, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
                borderColor: 'border-emerald-300/50', topBar: 'bg-emerald-500',
                ctaColor: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
                title: 'مستثمر', ctaTo: '/invest',
                desc: 'تبحث عن فرصة استثمارية في العقارات السورية بعوائد مدروسة وضمانات واضحة؟',
                steps: [
                  { icon: TrendingUp,  label: 'استعرض فرص الاستثمار',    to: '/invest',       iBg: 'bg-emerald-50', iC: 'text-emerald-600' },
                  { icon: Layers,      label: 'شارك في التمويل الجماعي', to: '/crowdfund',    iBg: 'bg-emerald-50', iC: 'text-emerald-600' },
                  { icon: ShieldCheck, label: 'ادرس المشاريع والتطوير',  to: '/developers',   iBg: 'bg-emerald-50', iC: 'text-emerald-600' },
                ],
              },
            ].map(({ delay, icon: Icon, iconBg, iconColor, topBar, borderColor, ctaColor, title, ctaTo, desc, steps }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay }}
                className={`bg-white border-2 ${borderColor} relative overflow-hidden p-6 flex flex-col hover:-translate-y-1 transition-all duration-300 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)]`}
                style={{ borderRadius: '8px' }}
              >
                <div className={`absolute top-0 inset-x-0 h-[3px] ${topBar}`} />
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4 mt-1`}>
                  <Icon size={20} className={iconColor} />
                </div>
                <h3 className="text-navy font-black text-base mb-1">{title}</h3>
                <p className="text-charcoal/50 text-xs mb-5 leading-relaxed">{desc}</p>
                <ol className="space-y-2.5 flex-1">
                  {steps.map(({ icon: SIcon, label, to, iBg, iC }, si) => (
                    <li key={si}>
                      <Link to={to} className="flex items-center gap-2.5 text-xs text-charcoal/65 hover:text-navy group/step transition-colors">
                        <span className={`w-5 h-5 rounded-full ${iBg} flex items-center justify-center shrink-0 group-hover/step:scale-110 transition-transform`}>
                          <SIcon size={11} className={iC} />
                        </span>
                        {label}
                      </Link>
                    </li>
                  ))}
                </ol>
                <Link to={ctaTo}
                  className={`mt-6 flex items-center justify-center gap-2 text-xs font-bold border rounded-xl py-2.5 transition-all ${ctaColor}`}>
                  ابدأ الآن <ArrowLeft size={13} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          ALERTS STRIP — latest legal/tax alerts
      ═══════════════════════════════════════════════════════════════ */}
      {topAlerts.length > 0 && (
        <section className="px-4 py-14" dir="rtl">
          <div className="max-w-5xl mx-auto">
            <FadeIn className="flex items-end justify-between mb-6 flex-wrap gap-3">
              <div>
                <span className="num-badge block mb-2">تنبيهات قانونية</span>
                <h2 className="text-2xl sm:text-3xl font-black text-navy">آخر القوانين التي تؤثر عليك</h2>
              </div>
              <Link to="/news"
                className="flex items-center gap-1.5 text-brand text-sm font-bold hover:text-navy transition-colors shrink-0">
                عرض كل التنبيهات <ChevronLeft size={15} />
              </Link>
            </FadeIn>

            <div className="space-y-3">
              {topAlerts.map((alert, i) => {
                const urgency = URGENCY[alert.urgency] ?? URGENCY.info;
                const isUrgent = alert.urgency === 'urgent';
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.07 }}
                  >
                    <Link to={`/news/${alert.id}`}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 hover:-translate-y-0.5 transition-all group
                        ${isUrgent ? 'border-red-200 bg-red-50/50' : 'border-navy/10 bg-white'}`}>
                      <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${urgency.color}`}>
                        {isUrgent ? <AlertTriangle size={13} /> : <Bell size={13} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                            {urgency.label}
                          </span>
                          <span className="text-[10px] text-charcoal/40">{alert.date}</span>
                        </div>
                        <p className={`text-sm font-bold leading-snug group-hover:text-brand transition-colors
                          ${isUrgent ? 'text-red-900' : 'text-navy'}`}>
                          {alert.title}
                        </p>
                        <p className="text-charcoal/55 text-xs mt-1 line-clamp-1">{alert.summary}</p>
                      </div>
                      <ChevronLeft size={14} className="text-charcoal/30 group-hover:text-brand transition-colors shrink-0 mt-1" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          CTA BANNER — dark navy, clean
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative section-navy px-4 py-28 overflow-hidden">
        {/* Mesh grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(89,121,187,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(89,121,187,0.07) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Glow blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-cta/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand/15 border border-brand/25 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-brand text-[11px] font-bold tracking-widest uppercase">ابدأ اليوم</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-5 leading-[1.4]">
              جاهز لبناء<br />
              <span className="text-brand">مستقبلك العقاري؟</span>
            </h2>
            <p className="text-white/55 text-base mb-10 max-w-lg mx-auto leading-relaxed">
              سواء كنت مستثمراً أو مهندساً أو مالكاً — RESURGO توفّر لك كل الأدوات في منصة واحدة.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth?tab=register" className="btn-cta flex items-center gap-2 text-base shadow-xl shadow-cta/25">
                سجّل حسابك مجاناً <ArrowLeft size={18} />
              </Link>
              <Link to="/properties" className="btn-ghost-white flex items-center gap-2 text-base">
                تصفّح العقارات <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
