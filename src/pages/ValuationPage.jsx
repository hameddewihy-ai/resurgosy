import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileSearch, CheckCircle, MapPin, ShieldCheck,
  TrendingUp, Building2, Award, Clock, Star,
  ChevronRight, Download, MessageCircle, AlertCircle,
  Scale, Home, Globe, Zap, BookOpen, BarChart3, Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import { useGlobalData } from '../context/GlobalContext';
import SponsorCard from '../components/ui/SponsorCard';

// ── Data ──────────────────────────────────────────────────────────────────────
const MARKET_INDICES = [
  { city: 'دمشق',     m2: 1_850, change: '+8.2%',  up: true },
  { city: 'حلب',      m2: 1_240, change: '+12.5%', up: true },
  { city: 'اللاذقية', m2: 2_100, change: '+15.3%', up: true },
  { city: 'طرطوس',    m2: 1_680, change: '+9.7%',  up: true },
  { city: 'حماة',     m2: 980,   change: '+3.4%',  up: true },
  { city: 'حمص',      m2: 1_120, change: '+5.1%',  up: true },
  { city: 'إدلب',     m2: 420,   change: '-2.1%',  up: false },
  { city: 'السويداء', m2: 890,   change: '+2.8%',  up: true },
];

const CITY_PRICES = {
  'دمشق': 1850, 'ريف دمشق': 1200, 'حلب': 1240, 'حمص': 1120,
  'حماة': 980,  'اللاذقية': 2100,  'طرطوس': 1680, 'إدلب': 420,
  'دير الزور': 380, 'الرقة': 290, 'الحسكة': 510, 'السويداء': 890,
  'درعا': 620, 'القنيطرة': 550,
};

const PROPERTY_TYPES = [
  { id: 'residential', label: 'شقة سكنية',    icon: Home,      mult: 1.00 },
  { id: 'villa',       label: 'فيلا / منزل',  icon: Building2, mult: 1.35 },
  { id: 'commercial',  label: 'تجاري / محل',  icon: BarChart3, mult: 1.20 },
  { id: 'office',      label: 'مكتب',          icon: Target,    mult: 1.15 },
  { id: 'land',        label: 'أرض',           icon: MapPin,    mult: 0.55 },
  { id: 'hotel',       label: 'فندقي / سياحي', icon: Globe,     mult: 1.50 },
];

const FLOOR_OPTIONS = [
  { id: 'ground', label: 'أرضي',    mult: 0.90 },
  { id: 'low',    label: '2–4',     mult: 0.95 },
  { id: 'mid',    label: 'وسط',     mult: 1.00 },
  { id: 'high',   label: 'مرتفع',  mult: 1.08 },
  { id: 'top',    label: 'بنتهاوس', mult: 1.12 },
];

const TIERS = [
  {
    id: 'avm', title: 'تقدير مبدئي مجاني', subtitle: 'مجاني · فوري · بدون تسجيل',
    price: null, priceFmt: 'مجاني', priceIsArabic: true,
    delivery: 'فوري', icon: Zap, color: 'emerald',
    desc: 'نطاق سعري استرشادي بناءً على بيانات السوق ومقارنة العقارات المماثلة في منطقتك.',
    features: ['نطاق سعري فوري بالدولار', 'مقارنة بمتوسط المنطقة', 'مؤشر الطلب في حيّك'],
    cta: 'جرّب الآن — مجاناً', recommended: false,
  },
  {
    id: 'desktop', title: 'تقييم مكتبي', subtitle: 'Desktop Valuation',
    price: 75, priceFmt: '$75',
    delivery: '24–48 ساعة', icon: FileSearch, color: 'brand',
    desc: 'تحليل بيانات السوق وصفقات المقارنة من مقيّم معتمد. تقرير رقمي مناسب للتفاوض.',
    features: ['تقرير PDF موقّع من مقيّم MRICS', 'صفقات مقارنة 5+', 'نطاق سعري دقيق + قيمة نقطية', 'للتفاوض والعروض الأولية'],
    cta: 'اطلب التقييم', recommended: false,
  },
  {
    id: 'field', title: 'تقييم ميداني معتمد', subtitle: 'Full Field Appraisal · IVS 2025',
    price: 250, priceFmt: '$250',
    delivery: '3–5 أيام عمل', icon: MapPin, color: 'brand',
    desc: 'زيارة ميدانية من مقيّم MRICS، فحص شامل للبنية والإكساء، تقرير هندسي معتمد وفق IVS 2025.',
    features: ['زيارة ميدانية وفحص العقار', 'تقرير هندسي IVS 2025 كامل', 'شارة "عقار موثوق" على إعلانك', 'مقبول لدى البنوك والتمويل', 'PDF + نسخة مختومة'],
    cta: 'اطلب التقييم الميداني', recommended: true,
  },
  {
    id: 'legal', title: 'تقييم قانوني / محكمة', subtitle: 'Litigation & Legal Valuation',
    price: 450, priceFmt: '$450',
    delivery: '5–7 أيام عمل', icon: Scale, color: 'amber',
    desc: 'تقرير معتمد للإرث، النزاعات، الرهن، والمحاكم السورية والدولية.',
    features: ['تقرير مختوم بختم رسمي', 'مقبول في المحاكم السورية', 'مصحوب بحلف يمين المقيّم', 'للإرث والتوثيق الدولي', 'نسخة إنجليزية مصدّقة (اختياري +$100)'],
    cta: 'اطلب التقييم القانوني', recommended: false,
  },
];

const EXPERTS = [
  { name: 'م. سامر الأسد', title: 'رئيس قسم التقييم',        credential: 'MRICS · IVS 2025',        specialty: 'سكني · تجاري · تقييم محكمة',    projects: 148, rating: 4.9, city: 'دمشق',     avail: true  },
  { name: 'م. لينا خوري',  title: 'مقيّمة عقارية معتمدة',   credential: 'MRICS · RICS Registered',   specialty: 'أراضي · صناعي · محفظة عقارية',  projects: 92,  rating: 4.8, city: 'حلب',      avail: true  },
  { name: 'م. عمر سالم',   title: 'خبير تقييم فنادق وضيافة', credential: 'MRICS · USALI Certified',   specialty: 'فنادق · منتجعات · عقارات ساحلية', projects: 61,  rating: 5.0, city: 'اللاذقية', avail: false },
];

const PROCESS_STEPS = [
  { num: '01', title: 'أرسل الطلب',       desc: 'اختر الباقة وأدخل بيانات عقارك — أقل من 3 دقائق' },
  { num: '02', title: 'احجز مع Escrow',    desc: 'المبلغ يُحجز ولا يُسلَّم للمقيّم إلا بعد تسلّم التقرير' },
  { num: '03', title: 'جلسة المقيّم',     desc: 'مكتبياً أو ميدانياً — المقيّم يتواصل معك ويكمل الفحص' },
  { num: '04', title: 'التقرير النهائي',  desc: 'PDF موقّع ومختوم + شارة "عقار موثوق" تُفعَّل تلقائياً' },
];

// ── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = '', decimal = false, duration = 1600 }) {
  const ref      = useRef(null);
  const [count,     setCount]     = useState(0);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * to));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [triggered, to, duration]);

  const display = decimal ? (count / 10).toFixed(1) : count.toLocaleString();
  return <span ref={ref}>{display}{suffix}</span>;
}

// ── Valuation Wizard ──────────────────────────────────────────────────────────
function ValuationWizard() {
  const { sponsorships = [], incrementSponsorshipClicks, sypExchangeRate = 13000 } = useGlobalData() || {};
  const [step,         setStep]         = useState(1);
  const [propertyType, setPropertyType] = useState(null);
  const [city,         setCity]         = useState('دمشق');
  const [area,         setArea]         = useState('');
  const [floor,        setFloor]        = useState('mid');
  const [result,       setResult]       = useState(null);

  const activeSponsor = sponsorships.find(s => s.type === 'valuation' && s.active);

  const handleCalculate = () => {
    const a = parseFloat(area);
    if (!propertyType) { toast.error('اختر نوع العقار أولاً'); return; }
    if (!a || a <= 0)  { toast.error('أدخل مساحة صحيحة');       return; }
    const baseM2     = CITY_PRICES[city] || 1000;
    const typeMult   = PROPERTY_TYPES.find(p => p.id === propertyType)?.mult || 1.0;
    const floorMult  = FLOOR_OPTIONS.find(f => f.id === floor)?.mult || 1.0;
    const m2Price    = Math.round(baseM2 * typeMult * floorMult);
    const mid        = Math.round(m2Price * a);
    setResult({ low: Math.round(mid * 0.88), mid, high: Math.round(mid * 1.12), m2Price, city, area: a });
    setStep(3);
  };

  const STEP_LABELS = ['نوع العقار', 'الموقع والحجم', 'النتيجة'];

  return (
    <div className="blueprint-card overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white font-bold text-sm">تقدير قيمة عقارك الآن</p>
          <span className="text-white/30 text-[10px] font-display tracking-widest">مجاني · فوري</span>
        </div>
        {/* Step bar */}
        <div className="flex items-center gap-0">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-colors ${step >= s ? 'bg-brand text-white' : 'bg-white/10 text-white/40'}`}>
                {step > s ? '✓' : s}
              </div>
              {i < 2 && <div className={`h-0.5 flex-1 mx-1 transition-colors ${step > s ? 'bg-brand' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={`text-[9px] font-display tracking-widest transition-colors ${step >= i + 1 ? 'text-brand' : 'text-white/30'}`}>{label}</span>
          ))}
        </div>
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">

          {/* Step 1 — property type */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <p className="text-navy font-bold text-sm mb-3">ما نوع عقارك؟</p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {PROPERTY_TYPES.map(type => (
                  <button key={type.id} onClick={() => setPropertyType(type.id)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${propertyType === type.id ? 'border-brand bg-brand/10' : 'border-navy/10 hover:border-navy/25 bg-white'}`}>
                    <type.icon size={20} className={`mx-auto mb-1.5 transition-colors ${propertyType === type.id ? 'text-brand' : 'text-navy/50'}`} />
                    <p className={`text-[11px] font-bold leading-tight transition-colors ${propertyType === type.id ? 'text-brand' : 'text-navy'}`}>{type.label}</p>
                  </button>
                ))}
              </div>
              <button onClick={() => { if (!propertyType) { toast.error('اختر نوع العقار أولاً'); return; } setStep(2); }}
                className="w-full bg-brand text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-brand/90 transition-colors">
                التالي <ChevronRight size={15} />
              </button>
            </motion.div>
          )}

          {/* Step 2 — location + size */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
              <p className="text-navy font-bold text-sm">أين يقع العقار؟</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">المدينة</label>
                  <select value={city} onChange={e => setCity(e.target.value)} className="input-field text-sm w-full">
                    {Object.keys(CITY_PRICES).map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">المساحة (م²)</label>
                  <input value={area} onChange={e => setArea(e.target.value)} type="number" min="10"
                    placeholder="مثال: 150" className="input-field text-sm w-full" />
                </div>
              </div>
              <div>
                <label className="text-charcoal/60 text-xs mb-2 block">موقع الطابق</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {FLOOR_OPTIONS.map(f => (
                    <button key={f.id} onClick={() => setFloor(f.id)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-colors ${floor === f.id ? 'border-brand bg-brand/10 text-brand' : 'border-navy/12 text-navy/55 hover:border-navy/30'}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(1)}
                  className="px-4 py-3 border border-navy/15 text-navy/55 text-sm rounded-xl hover:bg-navy/5 transition-colors">
                  رجوع
                </button>
                <button onClick={handleCalculate}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Zap size={15} /> احسب التقدير
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — result */}
          {step === 3 && result && (
            <motion.div key="s3" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="space-y-3">
              <div className="bg-navy rounded-2xl p-5 text-center">
                <p className="text-white/40 text-[11px] mb-1">التقدير المبدئي الاسترشادي</p>
                <p className="font-display text-[54px] leading-none text-brand mb-1">${result.mid.toLocaleString()}</p>
                <p className="text-brand text-xs font-bold mt-1">
                  ~ {(result.mid * sypExchangeRate).toLocaleString()} ل.س
                </p>
                <p className="text-white/35 text-[11px] mt-1.5">نطاق: ${result.low.toLocaleString()} — ${result.high.toLocaleString()}</p>
                <p className="text-white/30 text-[9px] mt-0.5">
                  نطاق بالليرة السورية: {(result.low * sypExchangeRate).toLocaleString()} — {(result.high * sypExchangeRate).toLocaleString()} ل.س (سعر الصرف: {sypExchangeRate.toLocaleString()} ل.س)
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[['متوسط م²', `$${result.m2Price}`], ['المدينة', result.city], ['المساحة', `${result.area} م²`]].map(([label, val]) => (
                  <div key={label} className="bg-cream rounded-xl p-2.5 text-center">
                    <p className="text-navy/45 text-[9px] mb-0.5">{label}</p>
                    <p className="text-navy font-black text-xs">{val}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <p className="text-amber-700 text-[11px] leading-relaxed">تقدير استرشادي للتوجيه فقط. للبيع أو الاستثمار احصل على تقرير معتمد من خبير MRICS.</p>
              </div>
              <Link to="/valuation-request"
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand/90 transition-colors">
                احصل على تقرير رسمي معتمد <ChevronRight size={14} />
              </Link>

              <SponsorCard
                sponsor={activeSponsor}
                onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
                className="mt-4"
              />

              <div className="mt-4 pt-4 border-t border-navy/10 flex flex-col gap-2">
                <p className="text-[10px] text-charcoal/40 font-bold uppercase tracking-wider text-right">خطوات استثمارية تالية:</p>
                <Link to="/properties" className="text-xs text-brand hover:underline flex items-center gap-1 text-right">
                  🏠 اعرض عقارك للبيع أو الإيجار في منصة العقارات
                </Link>
                <Link to="/crowdfund" className="text-xs text-brand hover:underline flex items-center gap-1 text-right">
                  📈 هل تبحث عن تمويل جماعي لإعادة بناء أو تطوير عقارك؟ ابدأ الآن
                </Link>
              </div>

              <button onClick={() => { setStep(1); setPropertyType(null); setResult(null); setArea(''); }}
                className="w-full py-1.5 text-charcoal/40 text-xs hover:text-charcoal/60 transition-colors">
                ← تقدير جديد
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Tier Card ─────────────────────────────────────────────────────────────────
function TierCard({ tier, index }) {
  if (tier.recommended) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ delay: index * 0.08 }}
        className="relative bg-navy rounded-2xl p-7 flex flex-col lg:-translate-y-3 lg:shadow-2xl"
        style={{ boxShadow: '0 0 0 2px #5979bb, 0 20px 60px rgba(89,121,187,0.22)' }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand/10 via-transparent to-violet-500/5 pointer-events-none" />
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand text-white text-[11px] font-black px-5 py-1.5 rounded-full shadow-lg shadow-brand/40 whitespace-nowrap">
          ✓ الأكثر طلباً
        </div>
        <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center mb-4 mt-2">
          <tier.icon size={22} className="text-brand" />
        </div>
        <p className="text-white font-black text-base mb-0.5">{tier.title}</p>
        <p className="text-white/30 text-[10px] font-display tracking-wider mb-4">{tier.subtitle}</p>
        <p className="font-display text-6xl text-brand leading-none mb-1">{tier.priceFmt}</p>
        <p className="text-white/35 text-[10px] flex items-center gap-1 mb-4"><Clock size={10} /> {tier.delivery}</p>
        <p className="text-white/55 text-xs leading-relaxed mb-4 flex-1">{tier.desc}</p>
        <ul className="space-y-2 mb-6">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-white/75">
              <CheckCircle size={11} className="text-brand shrink-0 mt-0.5" /> {f}
            </li>
          ))}
        </ul>
        <Link to="/valuation-request"
          className="w-full text-center text-sm font-bold py-3 rounded-xl bg-brand hover:bg-brand/90 text-white transition-colors shadow-lg shadow-brand/30">
          {tier.cta}
        </Link>
      </motion.div>
    );
  }

  const colorMap = {
    emerald: { icon: 'text-emerald-500 bg-emerald-50 border-emerald-100', price: 'text-emerald-600', cta: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
    brand:   { icon: 'text-brand bg-brand/8 border-brand/15',            price: 'text-brand',       cta: 'border-brand/20 text-brand hover:bg-brand/5' },
    amber:   { icon: 'text-amber-600 bg-amber-50 border-amber-100',       price: 'text-amber-600',   cta: 'border-amber-200 text-amber-700 hover:bg-amber-50' },
  };
  const c = colorMap[tier.color] || colorMap.brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.08 }}
      className="bg-white p-6 flex flex-col relative shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-shadow rounded-lg"
    >
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 ${c.icon}`}>
        <tier.icon size={22} />
      </div>
      <p className="text-navy font-black text-base mb-0.5">{tier.title}</p>
      <p className="text-charcoal/35 text-[10px] font-display tracking-wider mb-3">{tier.subtitle}</p>
      {tier.priceIsArabic
        ? <p className={`font-black text-4xl leading-none mb-1 ${c.price}`}>{tier.priceFmt}</p>
        : <p className={`font-display text-6xl leading-none mb-1 ${c.price}`}>{tier.priceFmt}</p>
      }
      <p className="text-charcoal/45 text-[10px] flex items-center gap-1 mb-4"><Clock size={10} /> {tier.delivery}</p>
      <p className="text-charcoal/60 text-xs leading-relaxed mb-4 flex-1">{tier.desc}</p>
      <ul className="space-y-1.5 mb-5">
        {tier.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-[11px] text-navy">
            <CheckCircle size={11} className="text-green-500 shrink-0 mt-0.5" /> {f}
          </li>
        ))}
      </ul>
      <Link
        to={tier.id === 'avm' ? '#' : '/valuation-request'}
        onClick={tier.id === 'avm' ? (e) => { e.preventDefault(); document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' }); } : undefined}
        className={`w-full text-center text-xs font-bold py-2.5 rounded-xl border transition-colors ${c.cta}`}>
        {tier.cta}
      </Link>
    </motion.div>
  );
}

// ── Expert Card ───────────────────────────────────────────────────────────────
function ExpertCard({ expert, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ delay: index * 0.1 }}
      className="bg-white p-6 relative overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-shadow rounded-lg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`absolute inset-0 bg-gradient-to-br from-brand/3 to-navy/3 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
      <div className="relative">
        {/* Avatar + info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-navy flex items-center justify-center text-white font-black text-2xl select-none">
              {expert.name.split(' ')[1]?.[0] || expert.name[0]}
            </div>
            <div className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white ${expert.avail ? 'bg-green-400' : 'bg-charcoal/25'}`} />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-navy font-black text-base leading-tight">{expert.name}</p>
            <p className="text-charcoal/55 text-xs mt-0.5">{expert.title}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <MapPin size={9} className="text-charcoal/35" />
              <span className="text-charcoal/35 text-[10px]">{expert.city}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${expert.avail ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-charcoal/5 text-charcoal/40 border border-charcoal/10'}`}>
                {expert.avail ? 'متاح' : 'مشغول'}
              </span>
            </div>
          </div>
        </div>

        {/* Credentials — animate in */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {expert.credential.split(' · ').map((c, i) => (
            <motion.span key={c}
              initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: index * 0.1 + i * 0.07 + 0.15 }}
              className="text-[9px] font-black bg-brand/8 border border-brand/25 text-brand px-2.5 py-1 rounded-full">
              {c}
            </motion.span>
          ))}
        </div>

        <p className="text-charcoal/55 text-[11px] leading-relaxed mb-4">{expert.specialty}</p>

        {/* Stats row */}
        <div className="flex items-center justify-between text-xs border-t border-navy/8 pt-3 mb-4">
          <span className="flex items-center gap-1.5 text-charcoal/60">
            <Award size={12} className="text-brand" /> {expert.projects} تقييم
          </span>
          <span className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={10} className={i < Math.floor(expert.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-charcoal/20 fill-charcoal/10'} />
            ))}
            <span className="text-charcoal/45 mr-1 text-[11px]">{expert.rating}</span>
          </span>
        </div>

        {/* Fixed-height CTA slot */}
        <div className="h-[42px] relative">
          <Link to="/valuation-request"
            className={`absolute inset-0 flex items-center justify-center gap-2 bg-brand text-white text-xs font-bold rounded-xl transition-all duration-200 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            احجز مع هذا الخبير <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ValuationPage() {
  const scrollToWizard = () => document.getElementById('wizard-section')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen" dir="rtl">
      <SEO
        title="تقييم عقاري معتمد — IVS 2025 · RICS | RESURGO"
        description="احصل على تقييم عقاري احترافي معتمد من خبراء MRICS وفق معايير IVS 2025. تقدير مبدئي مجاني، تقرير مكتبي، تقييم ميداني، وتقييم قانوني للمحاكم."
        path="/valuation"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — dramatic full-width navy
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative bg-navy overflow-hidden min-h-[68vh] flex items-center">
        {/* Gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-violet-500/6 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-cta/4 rounded-full blur-3xl" />
        </div>
        {/* Large decorative number */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 font-display text-[220px] lg:text-[300px] text-white/[0.03] leading-none select-none pointer-events-none">
          07
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-28 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl">
            {/* Eyebrow */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-brand/15 border border-brand/30 text-brand px-3 py-1.5 rounded-full tracking-widest uppercase">
                <ShieldCheck size={10} /> تقييم عقاري معتمد
              </span>
              <span className="text-white/20 font-display tracking-widest text-[10px]">MRICS · IVS 2025 · RICS RED BOOK</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.25] mb-5">
              اعرف القيمة الحقيقية<br />
              <span className="text-brand">لعقارك.</span>
            </h1>
            <p className="text-white/55 text-sm sm:text-base leading-relaxed mb-8 max-w-lg">
              تقدير مبدئي فوري ومجاني · تقارير ميدانية معتمدة MRICS · دفع آمن بنظام Escrow · 14 محافظة سورية
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={scrollToWizard}
                className="btn-cta px-8 py-4 flex items-center justify-center gap-2 text-sm font-bold rounded-xl">
                <Zap size={16} /> ابدأ التقدير المجاني
              </button>
              <Link to="/valuation-request"
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors">
                اطلب تقرير رسمي <ChevronRight size={14} />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/8">
              {[
                { icon: ShieldCheck, label: 'مقيّمون MRICS' },
                { icon: Award,       label: 'IVS 2025' },
                { icon: CheckCircle, label: 'Escrow محمي' },
                { icon: MapPin,      label: '14 محافظة' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Icon size={12} className="text-brand" /> {label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Market Ticker */}
      <div className="bg-navy border-b border-white/10 px-4 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-8 text-[11px] whitespace-nowrap font-display tracking-widest">
          <span className="text-brand flex items-center gap-1.5 shrink-0 font-bold"><TrendingUp size={12} /> سعر م² · Q2 2025:</span>
          {MARKET_INDICES.map((m, i) => (
            <span key={m.city} className={`flex items-center gap-2 ${i < MARKET_INDICES.length - 1 ? 'border-l border-white/10 pl-8' : ''}`}>
              <span className="text-white/50">{m.city}</span>
              <span className="text-white font-bold">${m.m2.toLocaleString()}/م²</span>
              <span className={m.up ? 'text-green-400' : 'text-red-400'}>{m.change}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS — full-width navy with animated counters
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-navy py-14 border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-16 text-center">
            {[
              { to: 1200, suffix: '+', label: 'تقييم منجز',    color: 'text-brand' },
              { to: 49, decimal: true, suffix: '/5', label: 'رضا العملاء', color: 'text-yellow-400' },
              { to: 14, suffix: '',   label: 'محافظة مغطاة',   color: 'text-violet-400' },
              { to: 48, suffix: 'h',  label: 'متوسط التسليم',  color: 'text-emerald-400' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className={`font-display text-6xl lg:text-7xl leading-none ${stat.color} mb-2`}>
                  <AnimatedCounter to={stat.to} suffix={stat.suffix} decimal={stat.decimal} />
                </p>
                <p className="text-white/45 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-engineering-grid">
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">

          {/* ── Wizard Section ── */}
          <section id="wizard-section">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-brand text-xs font-bold tracking-widest uppercase mb-1">خطوتك الأولى</p>
                <h2 className="text-navy font-black text-2xl">ما قيمة عقارك الآن؟</h2>
                <p className="text-charcoal/55 text-sm mt-1">تقدير مبدئي مجاني — لا يتطلب تسجيل دخول</p>
              </div>
              <span className="text-[10px] font-display text-charcoal/25 tracking-widest hidden sm:block">بيانات السوق · تحديث مستمر</span>
            </div>
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">
              <ValuationWizard />
              <div className="space-y-4">
                <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                  <p className="text-navy font-bold text-sm mb-3">كيف يُحسب التقدير المبدئي؟</p>
                  <div className="space-y-3">
                    {[
                      ['بيانات السوق الحي', 'نعتمد على آخر صفقات تسجيل عقاري مسجّلة في المنطقة'],
                      ['دراسة المقارنة السوقية', 'نقارن عقارك بعقارات مماثلة في نفس الحي والنطاق السعري'],
                      ['معاملات التعديل', 'الطابق، الإكساء، العمر، الاتجاه — كلها محسوبة'],
                      ['نطاق ± 12%', 'الناتج استرشادي للتوجيه — ليس تقريراً رسمياً'],
                    ].map(([title, desc]) => (
                      <div key={title} className="flex items-start gap-2">
                        <CheckCircle size={12} className="text-brand shrink-0 mt-0.5" />
                        <div>
                          <p className="text-navy font-bold text-xs">{title}</p>
                          <p className="text-charcoal/50 text-[11px]">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 font-bold text-xs mb-1">التقدير المبدئي ليس تقريراً رسمياً</p>
                      <p className="text-amber-700/70 text-[11px] leading-relaxed">للبيع أو الاستثمار أو المحاكم، احصل على تقرير معتمد من خبير MRICS.</p>
                      <Link to="/valuation-request" className="text-amber-700 font-bold text-[11px] underline mt-1 inline-block">اطلب تقريراً رسمياً ←</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Tiers ── */}
          <section>
            <div className="text-center mb-10">
              <p className="text-brand text-xs font-bold tracking-widest uppercase mb-2">باقات التقييم</p>
              <h2 className="text-navy font-black text-2xl mb-2">اختر ما يناسب احتياجك</h2>
              <p className="text-charcoal/55 text-sm">من التقدير الفوري المجاني إلى التقييم القانوني المعتمد للمحاكم</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
              {TIERS.map((t, i) => <TierCard key={t.id} tier={t} index={i} />)}
            </div>
          </section>

          {/* ── Process ── */}
          <section className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-brand text-xs font-bold tracking-widest uppercase mb-2">كيف تعمل الخدمة؟</p>
              <h2 className="text-navy font-black text-2xl mb-6">4 خطوات للحصول على تقييمك</h2>
              <div className="space-y-0">
                {PROCESS_STEPS.map((s, i) => (
                  <div key={s.num} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 border-2 border-brand/30 flex items-center justify-center text-brand font-black text-xs shrink-0">{s.num}</div>
                      {i < PROCESS_STEPS.length - 1 && <div className="w-0.5 flex-1 bg-navy/8 my-1" />}
                    </div>
                    <div className="pb-5 flex-1">
                      <p className="text-navy font-bold text-sm">{s.title}</p>
                      <p className="text-charcoal/60 text-xs mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-6 border-2 border-green-200 bg-green-50/40 rounded-xl shadow-[0_2px_8px_rgba(31,42,56,0.04)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <ShieldCheck size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-green-800 font-black text-base">الدفع محمي بنظام Escrow</p>
                    <p className="text-green-700/60 text-xs">ميزة حصرية لا تجدها في أي منصة عقارية أخرى</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {['المبلغ يُحجز في المحفظة الذكية عند الطلب', 'المقيّم لا يستلم أي مبلغ حتى تؤكد استلام التقرير', 'ضمان استرداد كامل إذا لم يُسلَّم التقرير في الموعد', 'تقييم مستقل بدون تحيز'].map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-green-800">
                      <CheckCircle size={12} className="text-green-500 shrink-0 mt-0.5" /> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                  <Award size={15} className="text-brand" /> شارة "عقار موثوق"
                </p>
                <div className="bg-cream rounded-xl p-4 flex items-center gap-4 border border-brand/20">
                  <div className="w-14 h-14 rounded-xl bg-brand/10 border-2 border-brand/30 flex items-center justify-center shrink-0">
                    <div className="text-center">
                      <FileSearch size={18} className="text-brand mx-auto" />
                      <p className="text-[7px] text-brand font-black mt-0.5">VERIFIED</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-navy font-bold text-xs">تُفعَّل تلقائياً على إعلانك</p>
                    <p className="text-charcoal/55 text-[11px] mt-0.5">العقارات المُقيَّمة تبيع أسرع بـ 3× وتحظى بثقة أكبر من المستثمرين</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Experts ── */}
          <section>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-brand text-xs font-bold tracking-widest uppercase mb-1">فريق الخبراء</p>
                <h2 className="text-navy font-black text-2xl">من سيُقيِّم عقارك؟</h2>
                <p className="text-charcoal/50 text-sm mt-1">خبراء معتمدون بسجل إنجاز موثّق</p>
              </div>
              <span className="text-[10px] text-charcoal/25 font-display hidden sm:block">MRICS · IVS 2025 · RICS RED BOOK</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {EXPERTS.map((e, i) => <ExpertCard key={e.name} expert={e} index={i} />)}
            </div>
          </section>

          {/* ── Methodology ── */}
          <section className="bg-white p-8 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <p className="text-brand text-xs font-bold tracking-widest uppercase mb-2">المعايير الدولية</p>
            <h2 className="text-navy font-black text-xl mb-6">منهجية التقييم المعتمدة</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { std: 'IVS 2025', full: 'International Valuation Standards', desc: 'المعيار الدولي الذهبي للتقييم العقاري — جميع تقاريرنا الميدانية تلتزم به', color: 'violet' },
                { std: 'RICS Red Book', full: 'RICS Valuation Global Standards', desc: 'أعلى معيار مهني للمقيّمين — المقيّمون لدينا عضوية MRICS كاملة', color: 'brand' },
                { std: 'Comparable Sales', full: 'IVS 105 · Market Approach', desc: 'مقارنة بأكثر من 5 صفقات مسجّلة في نفس المنطقة خلال 12 شهراً', color: 'emerald' },
                { std: 'Income Approach', full: 'IVS 300 · Yield Method', desc: 'لتقييم العقارات الاستثمارية والفنادق بناءً على التدفقات الإيجارية', color: 'amber' },
                { std: 'Cost Approach', full: 'IVS 400 · Replacement Cost', desc: 'لتقييم المباني الصناعية والمستودعات والعقارات الخاصة', color: 'sky' },
                { std: 'DaLA / UNOPS', full: 'Damage and Loss Assessment', desc: 'لتقييم أضرار الحرب والمباني المتضررة وفق منهجية World Bank', color: 'red' },
              ].map(({ std, full, desc, color }) => {
                const cls = { violet: 'bg-violet-50 border-violet-200 text-violet-700', brand: 'bg-brand/8 border-brand/20 text-navy', emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700', amber: 'bg-amber-50 border-amber-200 text-amber-700', sky: 'bg-sky-50 border-sky-200 text-sky-700', red: 'bg-red-50 border-red-200 text-red-700' }[color];
                return (
                  <div key={std} className="space-y-2">
                    <div className={`inline-block text-[10px] font-black px-3 py-1 rounded-sm border ${cls}`}>{std}</div>
                    <p className="text-charcoal/40 text-[10px]">{full}</p>
                    <p className="text-charcoal/65 text-xs leading-relaxed">{desc}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Sample Report ── */}
          <section className="bg-white p-6 flex flex-col sm:flex-row items-center gap-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div className="w-16 h-20 bg-navy rounded-xl flex items-center justify-center shrink-0">
              <div className="text-center">
                <FileSearch size={24} className="text-brand mx-auto mb-1" />
                <p className="text-white/50 text-[8px] font-display">PDF</p>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-right">
              <p className="text-navy font-black text-base mb-1">عيّنة تقرير ميداني</p>
              <p className="text-charcoal/60 text-sm mb-3">حمّل نموذجاً حقيقياً لتقرير تقييم ميداني IVS 2025 لترى ما ستحصل عليه قبل الدفع</p>
              <button onClick={() => toast.success('جارٍ تحميل نموذج التقرير...')}
                className="flex items-center gap-2 text-sm font-bold border border-brand/40 text-brand hover:bg-brand/5 px-5 py-2.5 rounded-xl transition-colors mx-auto sm:mx-0">
                <Download size={15} /> تحميل نموذج مجاني (PDF)
              </button>
            </div>
          </section>

          {/* ── Cross-links ── */}
          <section>
            <p className="text-navy font-black text-lg mb-4">استفد من تقييمك في باقي خدمات المنصة</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { to: '/properties', icon: Home,       label: 'أضف عقارك المُقيَّم', desc: 'شارة موثوق ترفع مبيعاتك',         color: 'brand' },
                { to: '/invest',     icon: TrendingUp,  label: 'افتح للمستثمرين',     desc: 'التقييم يرفع ثقة المستثمرين',    color: 'violet' },
                { to: '/crowdfund',  icon: Globe,       label: 'تمويل جماعي',          desc: 'التقييم شرط أساسي للطرح',        color: 'cta' },
                { to: '/studies',    icon: BookOpen,    label: 'دراسة جدوى مكاملة',   desc: 'الجدوى + التقييم = صورة متكاملة', color: 'emerald' },
              ].map(({ to, icon: Icon, label, desc, color }) => (
                <Link key={to} to={to} className="bg-white p-4 flex items-center gap-3 hover:-translate-y-1 transition-all group shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg">
                  <div className={`w-10 h-10 rounded-xl bg-${color}/10 border border-${color}/20 flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={`text-${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-navy font-bold text-xs">{label}</p>
                    <p className="text-charcoal/50 text-[10px] mt-0.5">{desc}</p>
                  </div>
                  <ChevronRight size={13} className="text-charcoal/30 shrink-0 group-hover:text-navy transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* ── Main CTA ── */}
          <section className="bg-[#1f2a38] p-10 text-center text-white rounded-2xl relative overflow-hidden shadow-[0_4px_24px_rgba(31,42,56,0.2)]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-violet-500/5 pointer-events-none" />
            <div className="relative">
              <p className="text-brand font-bold text-xs tracking-widest uppercase mb-3">ابدأ الآن</p>
              <h2 className="text-white font-black text-2xl sm:text-3xl mb-3">جاهز لمعرفة قيمة عقارك؟</h2>
              <p className="text-white/55 text-sm mb-8 max-w-md mx-auto">اختر الباقة المناسبة وسيتواصل معك مقيّم معتمد خلال ساعات</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/valuation-request" className="btn-cta px-8 py-3.5 flex items-center gap-2 text-sm font-bold">
                  اطلب تقييماً الآن <ChevronRight size={15} />
                </Link>
                <a href="https://wa.me/963000000000?text=مرحباً%2C%20أريد%20تقييم%20عقاري" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-green-400/40 bg-green-500/15 text-white text-sm font-medium hover:bg-green-500/25 transition-colors">
                  <MessageCircle size={15} className="text-green-400" /> تواصل عبر واتساب
                </a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
