import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Layers, Hammer, Sun, PaintBucket, Wrench, TreePine,
  DollarSign, ArrowLeft, ChevronDown, Info, Calculator,
  CheckCircle, AlertCircle, TrendingUp, Shield,
} from 'lucide-react';
import PageHero from '../../components/PageHero';
import SEO from '../../components/SEO';
import { useGlobalData } from '../../context/GlobalContext';

// ── Constants ─────────────────────────────────────────────────────────────────
// Note: SYP_RATE is retrieved dynamically from useGlobalData inside components

const SERVICES = [
  {
    id: 'interior',
    label: 'الإكساء الداخلي',
    icon: Home,
    unit: 'م²',
    color: '#5979bb',
    desc: 'طلاء، أرضيات، جبسيات، أبواب، نوافذ، تشطيبات داخلية كاملة',
    economy: { min: 8,  max: 15, notes: 'طلاء بلاستيك، بلاط محلي، جبس عادي' },
    mid:     { min: 15, max: 28, notes: 'رخام تركي، جبسيات حديثة، أبواب MDF' },
    luxury:  { min: 28, max: 55, notes: 'رخام إيطالي، إضاءة ذكية، تشطيب فندقي' },
  },
  {
    id: 'facade',
    label: 'الواجهات الخارجية',
    icon: Layers,
    unit: 'م²',
    color: '#444545',
    desc: 'كمبوزيت، ألمنيوم، حجر طبيعي واصطناعي، طلاء خارجي',
    economy: { min: 10, max: 18, notes: 'طلاء خارجي، حجر اصطناعي بسيط' },
    mid:     { min: 18, max: 35, notes: 'كمبوزيت تركي، ألمنيوم قياسي' },
    luxury:  { min: 35, max: 70, notes: 'حجر طبيعي، كمبوزيت ألماني، ضمان 10 سنوات' },
  },
  {
    id: 'restore',
    label: 'الترميم الإنشائي',
    icon: Hammer,
    unit: 'م²',
    color: '#f37124',
    desc: 'تدعيم هيكلي، ترميم جدران، إصلاح أسقف، معالجة رطوبة',
    economy: { min: 6,  max: 12, notes: 'ترميم بسيط وإصلاح شقوق وطلاء' },
    mid:     { min: 12, max: 22, notes: 'تدعيم إنشائي مع إكساء شامل' },
    luxury:  { min: 22, max: 40, notes: 'تدعيم كامل مع عزل ومواد مستوردة' },
  },
  {
    id: 'solar',
    label: 'الطاقة الشمسية',
    icon: Sun,
    unit: 'كيلوواط',
    color: '#f59e0b',
    desc: 'ألواح شمسية، إنفرترات، بطاريات، أنظمة شبكة ومنفصلة',
    economy: { min: 30, max: 50,  notes: 'ألواح جيدة بدون بطاريات، موصول بشبكة' },
    mid:     { min: 50, max: 85,  notes: 'ألواح Huawei أو Jinko مع إنفرتر' },
    luxury:  { min: 85, max: 140, notes: 'ألواح فاخرة + بطاريات ليثيوم + ضمان 5 سنوات' },
  },
  {
    id: 'decor',
    label: 'الديكور والعمارة الداخلية',
    icon: PaintBucket,
    unit: 'م²',
    color: '#be185d',
    desc: 'عجمي، جبسيات مخصصة، ورق حائط، نقوش خشبية، ديكور متكامل',
    economy: { min: 4,  max: 8,  notes: 'جبسيات بسيطة وورق حائط' },
    mid:     { min: 8,  max: 18, notes: 'جبسيات مودرن وديكور مخصص' },
    luxury:  { min: 18, max: 55, notes: 'عجمي يدوي، نقوش خشبية، ذهب' },
  },
  {
    id: 'mep',
    label: 'الكهرباء والسباكة (MEP)',
    icon: Wrench,
    unit: 'م²',
    color: '#0891b2',
    desc: 'تمديدات كهربائية، شبكات مياه وصرف، تكييف، تدفئة',
    economy: { min: 3,  max: 7,  notes: 'تمديدات قياسية بمواد محلية' },
    mid:     { min: 7,  max: 12, notes: 'تمديدات موثقة بمواد متوسطة' },
    luxury:  { min: 12, max: 20, notes: 'لوحات ذكية، أنابيب نحاسية، ضمان' },
  },
  {
    id: 'land',
    label: 'الحدائق والفضاءات الخارجية',
    icon: TreePine,
    unit: 'م²',
    color: '#16a34a',
    desc: 'تنسيق حدائق، نباتات، ري ذكي، إضاءة خارجية، ممرات',
    economy: { min: 4,  max: 8,  notes: 'عشب ونباتات بسيطة بري يدوي' },
    mid:     { min: 8,  max: 18, notes: 'تصميم متوسط مع ري أوتوماتيكي' },
    luxury:  { min: 18, max: 40, notes: 'تصميم فاخر، نافورة، إضاءة LED' },
  },
];

const FACTORS = [
  {
    q: 'ما الذي يؤثر على تكلفة الإكساء؟',
    a: 'تتحكم في التكلفة عدة عوامل رئيسية: جودة المواد المستخدمة (محلية / تركية / أوروبية)، درجة تعقيد التصميم، حجم المشروع (الأكبر أرخص بالمتر)، موقع المشروع (دمشق أعلى من المحافظات)، وخبرة الشركة ومستوى ضماناتها.',
  },
  {
    q: 'هل الأسعار بالدولار أم الليرة السورية؟',
    a: 'معظم شركات الإكساء تسعّر أعمالها بالدولار الأمريكي نظراً لاستيراد المواد، ثم تُحوّل للليرة بسعر الصرف الجاري عند التعاقد. الأسعار المعروضة هنا هي تقديرات بالدولار مع تحويل تقريبي بسعر 13,000 ل.س/دولار.',
  },
  {
    q: 'هل تشمل الأسعار مواد البناء؟',
    a: 'الأسعار المعروضة هي أسعار "تشغيل وتوريد" أي تشمل الأيدي العاملة والمواد معاً. بعض الشركات تقدم سعر التشغيل فقط إذا رغب العميل في توريد المواد بنفسه، وعادةً ما يكون أرخص بنسبة 30-40%.',
  },
  {
    q: 'كيف أحصل على عرض سعر دقيق؟',
    a: 'أرسل طلب عرض سعر عبر منصة RESURGO مع تفاصيل مشروعك: المساحة، نوع الإكساء المطلوب، المدينة، والميزانية التقديرية. ستتواصل معك 2-3 شركات موثقة خلال ساعتين بعروض مفصلة.',
  },
  {
    q: 'ما الفرق بين "اقتصادي" و"متوسط" و"فاخر"؟',
    a: 'الاقتصادي: مواد محلية، تنفيذ قياسي، مناسب للوحدات الإيجارية. المتوسط: مواد تركية أو عربية، تصميم معتدل، الخيار الأكثر شيوعاً. الفاخر: مواد أوروبية أو إيطالية، تصميم مخصص، ضمانات طويلة، مناسب للعقارات الراقية.',
  },
  {
    q: 'هل تتفاوت الأسعار بين المحافظات السورية؟',
    a: 'نعم، دمشق تشهد أعلى الأسعار عادةً (+10-15%) نظراً لارتفاع تكلفة اليد العاملة والنقل. حلب وحمص وحماة تتراوح عادةً بمعدلات أقل بنسبة 5-10%. أسعار المناطق الريفية أقل لكن قد تُضاف تكلفة نقل المواد.',
  },
];

const CITIES_FACTOR = {
  'دمشق': 1.12,
  'ريف دمشق': 1.0,
  'حلب': 1.05,
  'حمص': 0.97,
  'حماة': 0.93,
  'اللاذقية': 0.98,
  'طرطوس': 0.95,
};

// ── Price Row ─────────────────────────────────────────────────────────────────
function PriceRow({ svc, showSyp, cityFactor }) {
  const { sypExchangeRate = 13000 } = useGlobalData() || {};
  const fmt = (n) => showSyp
    ? `${Math.round(n * cityFactor * sypExchangeRate / 1000)}k ل.س`
    : `$${Math.round(n * cityFactor)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25 }}
      className="cream-card p-5 mb-3"
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${svc.color}18` }}
        >
          <svc.icon size={16} style={{ color: svc.color }} />
        </div>
        <div>
          <h3 className="text-navy font-black text-sm">{svc.label}</h3>
          <p className="text-charcoal/45 text-[10px]">{svc.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'economy', label: 'اقتصادي', color: 'sky',    bg: 'bg-sky-50    border-sky-200',    text: 'text-sky-700'    },
          { key: 'mid',     label: 'متوسط',   color: 'brand',  bg: 'bg-blue-50   border-blue-200',   text: 'text-brand'      },
          { key: 'luxury',  label: 'فاخر',    color: 'purple', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
        ].map(({ key, label, bg, text }) => {
          const tier = svc[key];
          return (
            <div key={key} className={`border rounded-xl p-3 ${bg}`}>
              <p className={`text-[10px] font-bold mb-1.5 ${text}`}>{label}</p>
              <p className={`font-black text-sm ${text}`}>
                {fmt(tier.min)}–{fmt(tier.max)}
              </p>
              <p className="text-[10px] text-charcoal/40 mt-1 leading-snug">/{svc.unit}</p>
              <p className="text-[10px] text-charcoal/50 mt-1 leading-snug hidden sm:block">{tier.notes}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Mini Calculator ───────────────────────────────────────────────────────────
function MiniCalculator() {
  const { sypExchangeRate = 13000 } = useGlobalData() || {};
  const [svcId, setSvcId]   = useState('interior');
  const [area,  setArea]    = useState(100);
  const [tier,  setTier]    = useState('mid');
  const [city,  setCity]    = useState('دمشق');

  const result = useMemo(() => {
    const svc    = SERVICES.find(s => s.id === svcId);
    const t      = svc[tier];
    const factor = CITIES_FACTOR[city] || 1;
    const low    = Math.round(t.min * area * factor);
    const high   = Math.round(t.max * area * factor);
    const lowSyp = Math.round(low  * sypExchangeRate / 1000000);
    const highSyp= Math.round(high * sypExchangeRate / 1000000);
    const unit   = svc.unit;
    return { low, high, lowSyp, highSyp, unit };
  }, [svcId, area, tier, city, sypExchangeRate]);

  const svc = SERVICES.find(s => s.id === svcId);

  return (
    <div className="cream-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Calculator size={18} className="text-brand" />
        <h3 className="text-navy font-black text-base">حاسبة التقدير السريع</h3>
      </div>

      <div className="space-y-4">
        {/* Service */}
        <div>
          <label className="text-xs text-charcoal/55 mb-1.5 block">نوع العمل</label>
          <select
            value={svcId}
            onChange={e => setSvcId(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50"
          >
            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        {/* Area */}
        <div>
          <label className="text-xs text-charcoal/55 mb-1.5 block">
            المساحة ({svc?.unit === 'كيلوواط' ? 'بالكيلوواط' : 'بالمتر المربع'})
          </label>
          <input
            type="number"
            min={1}
            value={area}
            onChange={e => setArea(+e.target.value || 1)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50"
            dir="ltr"
          />
        </div>

        {/* Tier */}
        <div>
          <label className="text-xs text-charcoal/55 mb-1.5 block">الفئة</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'economy', label: 'اقتصادي' },
              { id: 'mid',     label: 'متوسط'   },
              { id: 'luxury',  label: 'فاخر'    },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTier(t.id)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  tier === t.id
                    ? 'bg-brand border-brand text-white'
                    : 'border-navy/15 text-charcoal/60 hover:border-brand/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* City */}
        <div>
          <label className="text-xs text-charcoal/55 mb-1.5 block">المدينة</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50"
          >
            {Object.keys(CITIES_FACTOR).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${svcId}-${area}-${tier}-${city}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5 bg-navy rounded-2xl p-5 text-center"
        >
          <p className="text-white/50 text-xs mb-1">التكلفة التقديرية</p>
          <p className="text-white font-black text-2xl">
            ${result.low.toLocaleString()} – ${result.high.toLocaleString()}
          </p>
          <p className="text-white/50 text-xs mt-1">
            ≈ {result.lowSyp}–{result.highSyp} مليون ل.س
          </p>
          <p className="text-white/30 text-[10px] mt-2">
            تقدير أولي · العرض الفعلي قد يختلف بحسب التفاصيل
          </p>
        </motion.div>
      </AnimatePresence>

      <Link
        to="/finishing/rfq"
        className="mt-4 w-full flex items-center justify-center gap-2 bg-cta text-white font-bold py-3 rounded-xl text-sm hover:bg-cta/90 transition-colors"
      >
        اطلب عرض سعر دقيق <ArrowLeft size={14} />
      </Link>
    </div>
  );
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="cream-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-5 text-right"
      >
        <span className="text-navy font-bold text-sm leading-snug">{item.q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} className="text-brand" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <p className="px-5 pb-5 text-charcoal/65 text-sm leading-relaxed">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FinishingPricesPage() {
  const [showSyp,  setShowSyp]  = useState(false);
  const [city,     setCity]     = useState('دمشق');
  const [openFaq,  setOpenFaq]  = useState(null);

  const cityFactor = CITIES_FACTOR[city] || 1;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title="دليل أسعار الإكساء في سوريا 2024"
        description="أسعار تقديرية شاملة لأعمال الإكساء والتشطيب في سوريا. إكساء داخلي، واجهات، ترميم، طاقة شمسية، ديكور."
        path="/finishing/prices"
      />

      <PageHero
        num="10"
        eyebrow="منصة الإكساء والمقاولات"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            دليل الأسعار<br />
            <span className="text-cta">الشفاف والمحدّث.</span>
          </h1>
        }
        subtitle="أسعار تقديرية لأعمال الإكساء والتشطيب في سوريا · اقتصادي / متوسط / فاخر"
        accent="bg-cta"
        breadcrumb={[
          { label: 'الرئيسية', to: '/' },
          { label: 'منصة الإكساء', to: '/finishing' },
          { label: 'دليل الأسعار' },
        ]}
      />

      {/* ── Disclaimer strip ── */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-start gap-2 text-xs text-amber-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>
            الأسعار تقديرية مبنية على متوسط السوق السوري لعام 2024 وقد تتفاوت ±20% حسب تفاصيل المشروع.
            لعرض سعر دقيق <Link to="/finishing/rfq" className="font-bold underline">أرسل طلبك هنا</Link>.
          </span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="bg-white border-b border-navy/8 sticky top-[62px] z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* Currency toggle */}
          <div className="flex rounded-xl border border-navy/15 overflow-hidden text-xs">
            <button
              onClick={() => setShowSyp(false)}
              className={`px-4 py-2 font-bold transition-colors ${!showSyp ? 'bg-navy text-white' : 'text-charcoal/60 hover:text-navy'}`}
            >
              USD $
            </button>
            <button
              onClick={() => setShowSyp(true)}
              className={`px-4 py-2 font-bold transition-colors ${showSyp  ? 'bg-navy text-white' : 'text-charcoal/60 hover:text-navy'}`}
            >
              ل.س
            </button>
          </div>

          {/* City factor */}
          <div className="flex items-center gap-2 text-xs text-charcoal/55">
            <span>معامل المدينة:</span>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="border border-navy/15 rounded-xl px-3 py-2 bg-white text-navy font-semibold focus:outline-none focus:border-brand/40"
            >
              {Object.entries(CITIES_FACTOR).map(([c, f]) => (
                <option key={c} value={c}>{c} ({f >= 1 ? '+' : ''}{Math.round((f - 1) * 100)}%)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-charcoal/40 mr-auto">
            <TrendingUp size={11} />
            <span>آخر تحديث: يناير 2025</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Price tables ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <DollarSign size={18} className="text-brand" />
              <h2 className="text-navy font-black text-lg">جداول الأسعار</h2>
            </div>

            {SERVICES.map(svc => (
              <PriceRow key={svc.id} svc={svc} showSyp={showSyp} cityFactor={cityFactor} />
            ))}

            {/* Trust notes */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[
                { icon: Shield,      color: 'text-green-600',  title: 'أسعار موثقة',   sub: 'مبنية على 200+ مشروع منجز' },
                { icon: TrendingUp,  color: 'text-brand',      title: 'محدّثة شهرياً', sub: 'تعكس سوق العمل الحالي'     },
                { icon: CheckCircle, color: 'text-cta',        title: 'شاملة للمواد',  sub: 'مواد + أيدي عاملة معاً'     },
              ].map(({ icon: Icon, color, title, sub }) => (
                <div key={title} className="cream-card p-4 text-center">
                  <Icon size={20} className={`mx-auto mb-2 ${color}`} />
                  <p className="text-navy font-bold text-xs">{title}</p>
                  <p className="text-charcoal/45 text-[10px] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Info size={16} className="text-brand" />
                <h2 className="text-navy font-black text-base">أسئلة شائعة حول الأسعار</h2>
              </div>
              <div className="space-y-2">
                {FACTORS.map((item, i) => (
                  <FaqItem
                    key={i}
                    item={item}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar: calculator + CTA ── */}
          <div className="space-y-4">
            <MiniCalculator />

            <div className="cream-card p-5 text-center border-2 border-dashed border-navy/15">
              <p className="text-charcoal/45 text-xs mb-2">هل تريد سعراً دقيقاً؟</p>
              <h3 className="text-navy font-black text-sm mb-2">اطلب عرض سعر مجاناً</h3>
              <p className="text-charcoal/50 text-[11px] mb-4 leading-relaxed">
                أرسل تفاصيل مشروعك وستتواصل معك شركات موثقة خلال ساعتين.
              </p>
              <Link
                to="/finishing/rfq"
                className="flex items-center justify-center gap-1.5 bg-cta text-white font-bold py-2.5 rounded-xl text-sm hover:bg-cta/90 transition-colors"
              >
                ابدأ الآن <ArrowLeft size={13} />
              </Link>
            </div>

            {/* Regional note */}
            <div className="cream-card p-4">
              <h4 className="text-navy font-bold text-xs mb-2.5 flex items-center gap-1.5">
                <TrendingUp size={13} className="text-brand" /> معاملات المدن
              </h4>
              <div className="space-y-1.5">
                {Object.entries(CITIES_FACTOR).map(([c, f]) => (
                  <div key={c} className="flex items-center justify-between text-xs">
                    <span className="text-charcoal/60">{c}</span>
                    <span className={`font-bold ${f > 1 ? 'text-cta' : f < 1 ? 'text-green-600' : 'text-brand'}`}>
                      {f >= 1 ? '+' : ''}{Math.round((f - 1) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
