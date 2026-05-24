import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe, Sun, Hammer, Home, Layers, Wrench, Droplets,
  Sofa, TreePine, Shield, Building2, PaintBucket,
  MapPin, ChevronLeft, ChevronRight, CheckCircle,
  User, Phone, Clock, ArrowLeft, Zap, Star,
  HardHat, Camera, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';
import { useGlobalData } from '../../context/GlobalContext';

// ── Data ──────────────────────────────────────────────────────────────────────
const SERVICE_CATS = [
  { id: 'expat',    icon: Globe,       label: 'الإكساء الشامل للمغتربين', sub: 'تسليم مفتاح · متابعة مرئية', hot: true  },
  { id: 'solar',    icon: Sun,         label: 'الطاقة الشمسية والبطاريات', sub: 'ألواح · إنفرترات · تخزين',   hot: true  },
  { id: 'restore',  icon: Hammer,      label: 'الترميم والتدعيم الإنشائي', sub: 'تقييم هندسي · تقوية أساسات', hot: false },
  { id: 'interior', icon: Home,        label: 'الإكساء الداخلي الشامل',   sub: 'دهانات · أرضيات · أسقف',    hot: false },
  { id: 'floors',   icon: Layers,      label: 'الأرضيات والجدران والأسقف', sub: 'سيراميك · باركيه · جبس',     hot: false },
  { id: 'mep',      icon: Wrench,      label: 'الكهرباء والسباكة (MEP)',   sub: 'تمديدات · أنابيب · طاقة',   hot: false },
  { id: 'facade',   icon: Building2,   label: 'إكساء الواجهات الخارجية',  sub: 'حجر · ألمنيوم · كمبوزيت',   hot: false },
  { id: 'insul',    icon: Droplets,    label: 'العزل والتكييف والتدفئة',  sub: 'مائي · حراري · HVAC',        hot: false },
  { id: 'decor',    icon: PaintBucket, label: 'الديكور والعمارة الداخلية', sub: 'تصميم · ديكور دمشقي',        hot: false },
  { id: 'kitch',    icon: Sofa,        label: 'المطابخ والخزائن والأثاث',  sub: 'تصميم · تفصيل · تركيب',     hot: false },
  { id: 'secure',   icon: Shield,      label: 'الأمن والسلامة والأنظمة',  sub: 'كاميرات · حريق · منزل ذكي', hot: false },
  { id: 'land',     icon: TreePine,    label: 'تنسيق الحدائق والخارجي',   sub: 'تشجير · ممرات · إضاءة',     hot: false },
];

const GOVERNORATES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية',
  'طرطوس', 'إدلب', 'دير الزور', 'الرقة', 'الحسكة',
  'السويداء', 'درعا', 'القنيطرة',
];

const CITIES = {
  'دمشق':      ['المزة', 'المالكي', 'كفرسوسة', 'باب توما', 'الشعلان', 'أبو رمانة', 'ركن الدين', 'القصاع', 'المهاجرين', 'برزة', 'جوبر', 'القدم'],
  'ريف دمشق': ['جرمانا', 'قدسيا', 'الزبداني', 'يلدا', 'جديدة عرطوز', 'داريا', 'عدرا', 'دوما', 'سبينة', 'الكسوة'],
  'حلب':       ['العزيزية', 'السريان', 'الفرقان', 'الشهباء', 'حلب الجديدة', 'الميدان', 'سيف الدولة', 'الزهراء', 'الحمدانية'],
  'حمص':       ['الوعر', 'عكرمة', 'الإنشاءات', 'الغوطة', 'باب السباع', 'بابا عمرو'],
  'حماة':      ['حماة الجديدة', 'المدينة القديمة', 'العليلية', 'الكيلانية'],
  'اللاذقية': ['الزراعة', 'الرمل الشمالي', 'الشراع', 'القصور'],
  'طرطوس':    ['طرطوس المدينة', 'بانياس', 'الشيخ بدر'],
  'السويداء': ['السويداء المدينة', 'شهبا', 'صلخد', 'القريا', 'المزرعة'],
  'درعا':     ['درعا المدينة', 'الشيخ مسكين', 'إزرع', 'نوى', 'المزيريب', 'جاسم'],
  'القنيطرة': ['القنيطرة', 'فيق', 'مسعدة', 'حضر', 'خان أرنبة'],
  'إدلب':    ['إدلب المدينة', 'معرة النعمان', 'جسر الشغور', 'سلقين', 'بنش'],
  'دير الزور': ['دير الزور المدينة', 'الميادين', 'البوكمال', 'الأشارة', 'السخنة'],
  'الرقة':   ['الرقة المدينة', 'الطبقة', 'تل أبيض', 'سلوك'],
  'الحسكة':  ['الحسكة المدينة', 'القامشلي', 'رأس العين', 'المالكية', 'عامودا'],
};

const PROPERTY_STATES = [
  { id: 'shell',   label: 'عظم (هيكل فقط)',         sub: 'ليس فيه أي تمديدات',           color: 'text-red-500',   bg: 'bg-red-50   border-red-200' },
  { id: 'rough',   label: 'نيئ (تمديدات جاهزة)',    sub: 'كهرباء وسباكة منتهية',         color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  { id: 'restore', label: 'يحتاج ترميم',             sub: 'قائم ومسكون سابقاً',          color: 'text-brand',     bg: 'bg-blue-50  border-blue-200' },
  { id: 'ready',   label: 'جاهز للإكساء التجميلي', sub: 'اللياسة والبنية التحتية جاهزة', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
];

const MATERIAL_TIERS = [
  {
    id: 'economy',
    label: 'اقتصادي',
    sub: 'مواد تجارية بأسعار معقولة',
    range: '80–120 ألف ل.س / م²',
    usd: '≈ 8–12 $',
    includes: ['سيراميك تجاري', 'دهان عادي', 'جبس بورد أساسي', 'أعمال سباكة قياسية'],
    color: 'border-navy/20 hover:border-navy/40',
    badge: 'bg-cream text-charcoal/60 border-navy/15',
    icon: '🏠',
  },
  {
    id: 'mid',
    label: 'متوسط',
    sub: 'جودة جيدة جداً وأسعار معتدلة',
    range: '150–200 ألف ل.س / م²',
    usd: '≈ 15–20 $',
    includes: ['سيراميك جيد', 'دهان مائي عالي الجودة', 'سقف جبس بورد مؤطر', 'ألمنيوم بالمواصفات'],
    color: 'border-brand/30 hover:border-brand/60',
    badge: 'bg-blue-50 text-brand border-blue-200',
    icon: '⭐',
    recommended: true,
  },
  {
    id: 'deluxe',
    label: 'فاخر / ديلوكس',
    sub: 'أعلى جودة ومواد ممتازة',
    range: '250–400 ألف ل.س / م²',
    usd: '≈ 25–40 $',
    includes: ['حجر طبيعي / رخام', 'باركيه خشب أصيل', 'ديكور عجمي دمشقي', 'أنظمة ذكية متكاملة'],
    color: 'border-amber-400 hover:border-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-200',
    icon: '👑',
  },
];

const URGENCY_OPTIONS = [
  { id: 'asap',   label: 'أسرع ما يمكن',    sub: 'ابدأ خلال أسبوعين',    icon: Zap   },
  { id: 'month',  label: 'خلال شهر',         sub: 'بداية المشروع مرنة',   icon: Clock },
  { id: 'flex',   label: 'مرن / للتخطيط',   sub: 'لا يوجد ضغط زمني',    icon: Star  },
];

const MOCK_COMPANIES = [
  { id: 1, name: 'شركة دوزان للإكساء',      city: 'دمشق',  rating: 4.9, jobs: 143, badge: 'موثق ومعتمد', spec: 'إكساء شامل للمغتربين' },
  { id: 2, name: 'أبو النور للتعهدات',       city: 'حلب',   rating: 4.7, jobs: 97,  badge: 'موثق',         spec: 'ترميم وإكساء متكامل' },
  { id: 3, name: 'Solar Energy Syria',        city: 'دمشق',  rating: 4.8, jobs: 62,  badge: 'موثق ومعتمد', spec: 'طاقة شمسية وبطاريات' },
  { id: 4, name: 'شركة الفارس للإنشاء',     city: 'ريف دمشق', rating: 4.6, jobs: 78, badge: 'موثق',       spec: 'ترميم إنشائي وتشطيب' },
  { id: 5, name: 'مؤسسة الشام للديكور',     city: 'دمشق',  rating: 4.5, jobs: 55,  badge: 'قيد التحقق',   spec: 'ديكور وإكساء داخلي'  },
];

// ── Progress bar ──────────────────────────────────────────────────────────────
function StepProgress({ current, total }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-charcoal/50">الخطوة {current} من {total}</span>
        <span className="text-xs font-bold text-brand">{Math.round((current / total) * 100)}%</span>
      </div>
      <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-full bg-gradient-to-l from-cta to-brand rounded-full"
        />
      </div>
    </div>
  );
}

// ── Step 1: Service category ──────────────────────────────────────────────────
function Step1({ form, setForm }) {
  return (
    <div>
      <h2 className="text-navy font-black text-xl mb-1">ما نوع الخدمة المطلوبة؟</h2>
      <p className="text-charcoal/55 text-sm mb-6">اختر الفئة الأقرب لمشروعك — يمكنك التدقيق لاحقاً</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SERVICE_CATS.map(cat => {
          const Icon = cat.icon;
          const sel  = form.category === cat.id;
          return (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => setForm(f => ({ ...f, category: cat.id }))}
              className={`relative text-right p-4 rounded-2xl border-2 transition-all duration-200 ${
                sel
                  ? 'border-cta bg-orange-50 shadow-md shadow-cta/10'
                  : 'border-navy/12 bg-cream hover:border-brand/30 hover:bg-white'
              }`}
            >
              {cat.hot && (
                <span className="absolute top-2 left-2 text-[9px] font-bold bg-cta text-white px-1.5 py-0.5 rounded-full">
                  الأكثر طلباً
                </span>
              )}
              <Icon size={22} className={sel ? 'text-cta mb-2' : 'text-charcoal/40 mb-2'} />
              <p className={`font-bold text-xs leading-snug mb-0.5 ${sel ? 'text-navy' : 'text-charcoal/70'}`}>
                {cat.label}
              </p>
              <p className="text-[10px] text-charcoal/40 leading-tight">{cat.sub}</p>
              {sel && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 bg-cta rounded-full flex items-center justify-center"
                >
                  <CheckCircle size={12} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Location ──────────────────────────────────────────────────────────
function Step2({ form, setForm }) {
  const cities = CITIES[form.gov] || [];
  return (
    <div>
      <h2 className="text-navy font-black text-xl mb-1">أين يقع العقار؟</h2>
      <p className="text-charcoal/55 text-sm mb-6">الموقع الجغرافي يحدد الشركات المتاحة في منطقتك</p>
      <div className="space-y-4">
        {/* Governorate */}
        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
            <MapPin size={12} className="inline ml-1 text-cta" />
            المحافظة *
          </label>
          <select
            value={form.gov}
            onChange={e => setForm(f => ({ ...f, gov: e.target.value, city: '', district: '' }))}
            className="input-field text-sm"
          >
            <option value="">— اختر المحافظة —</option>
            {GOVERNORATES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* City */}
        {form.gov && cities.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">المنطقة / المدينة *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, city: c }))}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    form.city === c
                      ? 'border-brand bg-brand/8 text-brand font-bold'
                      : 'border-navy/12 text-charcoal/60 hover:border-brand/30 hover:text-navy bg-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* District */}
        {form.city && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
              الحي أو الشارع (اختياري)
            </label>
            <input
              type="text"
              placeholder="مثال: شارع الثلاثين، خلف مستشفى..."
              value={form.district}
              onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
              className="input-field text-sm"
            />
          </motion.div>
        )}

        {/* Expat note */}
        <label className="flex items-start gap-3 cursor-pointer bg-blue-50 border border-blue-200 rounded-xl p-3.5">
          <input
            type="checkbox"
            checked={form.isExpat}
            onChange={e => setForm(f => ({ ...f, isExpat: e.target.checked }))}
            className="mt-0.5 rounded text-brand focus:ring-brand accent-brand"
          />
          <div>
            <p className="text-navy font-bold text-sm flex items-center gap-1.5">
              <Globe size={13} className="text-brand" /> أنا مغترب خارج سوريا
            </p>
            <p className="text-charcoal/55 text-xs mt-0.5 leading-relaxed">
              سيتم تفعيل لوحة المتابعة المرئية والدفعات المرحلية الخاصة بالمغتربين تلقائياً
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}

// ── Step 3: Project details ───────────────────────────────────────────────────
function Step3({ form, setForm }) {
  return (
    <div>
      <h2 className="text-navy font-black text-xl mb-1">تفاصيل المشروع</h2>
      <p className="text-charcoal/55 text-sm mb-6">كلما كانت المعلومات أدق، كانت عروض الأسعار أكثر دقة</p>
      <div className="space-y-5">
        {/* Area */}
        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
            مساحة العقار (متر مربع) *
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={20} max={2000}
              placeholder="مثال: 120"
              value={form.area}
              onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
              className="input-field text-lg font-bold flex-1"
            />
            <span className="text-charcoal/50 text-sm font-semibold shrink-0">م²</span>
          </div>
          {form.area && +form.area > 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-2 bg-cream rounded-xl p-3 flex items-center justify-between"
            >
              <span className="text-charcoal/60 text-xs">التكلفة التقديرية للإكساء المتوسط</span>
              <span className="text-navy font-black text-sm">
                {(+form.area * 15).toLocaleString()} – {(+form.area * 22).toLocaleString()} $
              </span>
            </motion.div>
          )}
        </div>

        {/* Property state */}
        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-2">
            الحالة الراهنة للعقار *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PROPERTY_STATES.map(s => (
              <button
                key={s.id}
                onClick={() => setForm(f => ({ ...f, state: s.id }))}
                className={`text-right p-3.5 rounded-xl border-2 transition-all ${
                  form.state === s.id
                    ? s.bg + ' font-bold'
                    : 'border-navy/12 bg-white hover:border-navy/25'
                }`}
              >
                <p className={`text-sm font-bold ${form.state === s.id ? s.color : 'text-navy'}`}>
                  {s.label}
                </p>
                <p className="text-charcoal/50 text-[10px] mt-0.5">{s.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
            وصف إضافي (اختياري)
          </label>
          <textarea
            rows={3}
            placeholder="مثال: شقة 3 غرف، تحتاج تجديد كامل بعد ترك المستأجرين. الجدران بحاجة لإصلاح..."
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input-field text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Material quality ──────────────────────────────────────────────────
function Step4({ form, setForm }) {
  return (
    <div>
      <h2 className="text-navy font-black text-xl mb-1">جودة المواد المطلوبة</h2>
      <p className="text-charcoal/55 text-sm mb-6">
        هذا يحدد نوعية العروض الواردة ومستوى الشركات المطابقة
      </p>
      <div className="space-y-4">
        {MATERIAL_TIERS.map(tier => {
          const sel = form.tier === tier.id;
          return (
            <motion.button
              key={tier.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => setForm(f => ({ ...f, tier: tier.id }))}
              className={`w-full text-right p-5 rounded-2xl border-2 transition-all duration-200 ${
                sel ? tier.color + ' shadow-md' : 'border-navy/12 bg-white hover:border-navy/25'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{tier.icon}</span>
                    <span className="text-navy font-black text-base">{tier.label}</span>
                    {tier.recommended && (
                      <span className="text-[10px] font-bold bg-brand/8 text-brand border border-brand/20 px-1.5 py-0.5 rounded-full">
                        الأكثر اختياراً
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal/55 text-xs mb-2">{tier.sub}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tier.includes.map(item => (
                      <span key={item} className="text-[10px] bg-cream border border-navy/8 text-charcoal/60 px-2 py-0.5 rounded-full">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-navy font-black text-sm">{tier.usd}</p>
                  <p className="text-charcoal/40 text-[10px]">{tier.range}</p>
                  {sel && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-6 h-6 bg-cta rounded-full flex items-center justify-center mt-2 mr-auto"
                    >
                      <CheckCircle size={14} className="text-white" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5">
        <FileText size={14} className="text-brand shrink-0 mt-0.5" />
        <p className="text-charcoal/65 text-xs leading-relaxed">
          ستُرسل العروض مبوبة بالدولار الأمريكي مع معادل آني بالليرة السورية وفق سعر الصرف اليومي.
          العروض صالحة لمدة <strong className="text-navy">48 ساعة</strong> من وقت الإرسال.
        </p>
      </div>
    </div>
  );
}

// ── Step 5: Contact ───────────────────────────────────────────────────────────
function Step5({ form, setForm }) {
  return (
    <div>
      <h2 className="text-navy font-black text-xl mb-1">بيانات التواصل</h2>
      <p className="text-charcoal/55 text-sm mb-6">ستُرسل إليك عروض الأسعار مباشرة خلال ساعات</p>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
              <User size={11} className="inline ml-1" />
              الاسم الكامل *
            </label>
            <input
              type="text"
              placeholder="محمد أحمد"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
              <Phone size={11} className="inline ml-1" />
              رقم الهاتف *
            </label>
            <input
              type="tel"
              placeholder="+963 9..."
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="input-field text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
            رقم واتساب (للتواصل المباشر مع الشركات)
          </label>
          <input
            type="tel"
            placeholder="+971 50... أو +963 9..."
            value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
            className="input-field text-sm"
            dir="ltr"
          />
        </div>

        {/* Urgency */}
        <div>
          <label className="text-charcoal/65 text-xs font-semibold block mb-2">
            <Clock size={11} className="inline ml-1" />
            متى تريد البدء؟
          </label>
          <div className="grid grid-cols-3 gap-2">
            {URGENCY_OPTIONS.map(u => {
              const Icon = u.icon;
              return (
                <button
                  key={u.id}
                  onClick={() => setForm(f => ({ ...f, urgency: u.id }))}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.urgency === u.id
                      ? 'border-cta bg-orange-50'
                      : 'border-navy/12 bg-white hover:border-brand/30'
                  }`}
                >
                  <Icon size={16} className={`mx-auto mb-1 ${form.urgency === u.id ? 'text-cta' : 'text-charcoal/40'}`} />
                  <p className={`text-xs font-bold ${form.urgency === u.id ? 'text-navy' : 'text-charcoal/60'}`}>
                    {u.label}
                  </p>
                  <p className="text-[10px] text-charcoal/40 mt-0.5">{u.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Expat extras */}
        {form.isExpat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3 overflow-hidden"
          >
            <p className="text-brand font-bold text-sm flex items-center gap-1.5">
              <Globe size={13} /> خيارات إضافية للمغترب
            </p>
            <div>
              <label className="text-charcoal/65 text-xs font-semibold block mb-1.5">
                دولة الإقامة الحالية
              </label>
              <select
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                className="input-field text-sm"
              >
                <option value="">— اختر الدولة —</option>
                {['الإمارات', 'السعودية', 'قطر', 'الكويت', 'ألمانيا', 'السويد', 'فرنسا', 'كندا', 'أمريكا', 'أخرى'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-start gap-2">
              <Camera size={13} className="text-brand shrink-0 mt-0.5" />
              <p className="text-charcoal/60 text-xs leading-relaxed">
                سيتم تفعيل <strong className="text-navy">لوحة المتابعة المرئية</strong> تلقائياً:
                تقارير أسبوعية بالصور ومراحل الدفع المربوطة بالإنجاز.
              </p>
            </div>
          </motion.div>
        )}

        <p className="text-charcoal/40 text-[10px] text-center">
          بإرسال الطلب أنت توافق على شروط الاستخدام. لن تُشارَك بياناتك مع أطراف غير ذات صلة.
        </p>
      </div>
    </div>
  );
}

// ── Results screen ────────────────────────────────────────────────────────────
function ResultsScreen({ form }) {
  const catLabel = SERVICE_CATS.find(c => c.id === form.category)?.label || '';
  const tierLabel = MATERIAL_TIERS.find(t => t.id === form.tier)?.label || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Success header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle size={32} className="text-green-600" />
        </motion.div>
        <h2 className="text-navy font-black text-2xl mb-2">تم إرسال طلبك بنجاح!</h2>
        <p className="text-charcoal/60 text-sm max-w-sm mx-auto leading-relaxed">
          تم مطابقة طلبك مع أفضل {MOCK_COMPANIES.length} شركات موثقة بناءً على موقعك وتخصصك.
          ستصلك عروض الأسعار خلال ساعات.
        </p>
      </div>

      {/* Request summary */}
      <div className="bg-cream rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
        {[
          ['الخدمة',     catLabel],
          ['الجودة',     tierLabel],
          ['الموقع',     [form.gov, form.city].filter(Boolean).join(' — ')],
          ['المساحة',    form.area ? `${form.area} م²` : '—'],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-charcoal/45 text-[10px] mb-0.5">{k}</p>
            <p className="text-navy font-bold text-xs">{v || '—'}</p>
          </div>
        ))}
      </div>

      {/* Matching companies */}
      <h3 className="text-navy font-black text-base mb-4 flex items-center gap-2">
        <HardHat size={16} className="text-cta" />
        الشركات المطابقة لطلبك
      </h3>
      <div className="space-y-3 mb-6">
        {MOCK_COMPANIES.map((co, i) => (
          <motion.div
            key={co.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="cream-card p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-navy font-bold text-sm">{co.name}</p>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-bold ${
                  co.badge === 'موثق ومعتمد'
                    ? 'bg-green-50 border-green-200 text-green-600'
                    : co.badge === 'موثق'
                    ? 'bg-blue-50 border-blue-200 text-brand'
                    : 'bg-amber-50 border-amber-200 text-amber-600'
                }`}>{co.badge}</span>
              </div>
              <p className="text-charcoal/50 text-xs mt-0.5">{co.spec} · {co.city}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="flex items-center gap-1 justify-end mb-0.5">
                <Star size={10} className="text-amber-400 fill-amber-400" />
                <span className="text-navy font-black text-sm">{co.rating}</span>
              </div>
              <p className="text-charcoal/40 text-[10px]">{co.jobs} مشروع</p>
            </div>
          </motion.div>
        ))}
      </div>

      {form.isExpat && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Camera size={16} className="text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-navy font-bold text-sm mb-1">لوحة المتابعة المرئية مُفعّلة</p>
            <p className="text-charcoal/60 text-xs leading-relaxed">
              بمجرد قبول أحد العروض، ستتمكن من تتبع المشروع بالصور والدفعات المرحلية من لوحة المغترب.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/finishing/companies"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-navy/15 text-navy font-bold py-3 rounded-xl text-sm hover:border-brand/40 hover:text-brand transition-all"
        >
          تصفح دليل الشركات
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 bg-cta text-white font-bold py-3 rounded-xl text-sm hover:bg-cta/90 transition-all"
        >
          العودة للرئيسية <ArrowLeft size={14} />
        </Link>
      </div>
    </motion.div>
  );
}

// ── Sidebar summary ───────────────────────────────────────────────────────────
function SidebarSummary({ form, step }) {
  const cat  = SERVICE_CATS.find(c => c.id === form.category);
  const tier = MATERIAL_TIERS.find(t => t.id === form.tier);
  if (step < 2) return null;

  const rows = [
    cat  && { label: 'الخدمة',  val: cat.label },
    form.gov   && { label: 'المحافظة', val: form.gov + (form.city ? ` — ${form.city}` : '') },
    form.isExpat && { label: 'النوع', val: '🌍 مغترب' },
    form.area  && { label: 'المساحة', val: `${form.area} م²` },
    form.state && { label: 'الحالة', val: PROPERTY_STATES.find(s => s.id === form.state)?.label },
    tier && { label: 'الجودة', val: tier.label },
  ].filter(Boolean);

  return (
    <div className="cream-card p-5 sticky top-24">
      <p className="text-navy font-black text-sm mb-4 flex items-center gap-2">
        <FileText size={14} className="text-cta" /> ملخص طلبك
      </p>
      <div className="space-y-2.5">
        {rows.map(r => (
          <div key={r.label} className="flex items-start justify-between gap-2">
            <span className="text-charcoal/45 text-[10px] shrink-0">{r.label}</span>
            <span className="text-navy text-xs font-semibold text-left">{r.val}</span>
          </div>
        ))}
      </div>
      {form.area && form.tier && (
        <div className="mt-4 border-t border-navy/8 pt-3">
          <p className="text-charcoal/45 text-[10px] mb-0.5">التكلفة التقديرية</p>
          <p className="text-navy font-black text-base">
            {(+form.area * (tier?.id === 'economy' ? 10 : tier?.id === 'mid' ? 18 : 32)).toLocaleString()}
            {' – '}
            {(+form.area * (tier?.id === 'economy' ? 14 : tier?.id === 'mid' ? 24 : 42)).toLocaleString()} $
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;
const EMPTY_FORM = {
  category: '', gov: '', city: '', district: '', isExpat: false,
  area: '', state: '', description: '',
  tier: '', name: '', phone: '', whatsapp: '', urgency: '', country: '',
};

function canProceed(step, form) {
  if (step === 1) return !!form.category;
  if (step === 2) return !!form.gov && !!form.city;
  if (step === 3) return !!form.area && !!form.state;
  if (step === 4) return !!form.tier;
  if (step === 5) return !!form.name && !!form.phone;
  return true;
}

export default function FinishingRFQPage() {
  const [step,    setStep]    = useState(1);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const { pushCrossHint, addFinishingRFQ } = useGlobalData();

  const goNext = () => {
    if (!canProceed(step, form)) {
      toast.error('يرجى إكمال الحقول المطلوبة أولاً');
      return;
    }
    if (step === TOTAL_STEPS) {
      setLoading(true);
      setTimeout(() => {
        const newRFQ = {
          client: form.name,
          city: `${form.gov} — ${form.city}`,
          district: form.district || '',
          area: Number(form.area) || 120,
          services: [
            SERVICE_CATS.find(c => c.id === form.category)?.label || 'إكساء شامل'
          ],
          budget: MATERIAL_TIERS.find(t => t.id === form.tier)?.label || 'متوسط',
          date: 'الآن',
          status: 'جديد',
          urgent: form.urgency === 'asap',
          phone: form.phone,
          whatsapp: form.whatsapp || '',
          isExpat: form.isExpat,
          country: form.country || '',
          description: form.description || '',
          state: form.state || 'ready',
        };
        addFinishingRFQ(newRFQ);
        setLoading(false);
        setDone(true);
        pushCrossHint({ emoji: '🏗️', text: 'تصفح الشركات الموثقة في منطقتك مباشرة', label: 'دليل الشركات', to: '/finishing/companies' });
      }, 1600);
    } else {
      setStep(s => s + 1);
    }
  };

  const stepComponents = {
    1: <Step1 form={form} setForm={setForm} />,
    2: <Step2 form={form} setForm={setForm} />,
    3: <Step3 form={form} setForm={setForm} />,
    4: <Step4 form={form} setForm={setForm} />,
    5: <Step5 form={form} setForm={setForm} />,
  };

  return (
    <div className="min-h-screen bg-white pt-[62px]" dir="rtl">
      <SEO
        title="طلب عرض سعر إكساء"
        description="اطلب عروض أسعار من شركات إكساء موثقة في سوريا خلال دقيقتين."
        path="/finishing/rfq"
      />

      {/* ── Header strip ── */}
      <div className="bg-dark border-b border-white/8 py-4">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <Link to="/finishing" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors">
            <ChevronRight size={16} /> منصة الإكساء
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40">طلب عرض سعر</span>
            {!done && (
              <span className="text-[10px] font-bold bg-cta/15 text-cta border border-cta/25 px-2 py-0.5 rounded-full">
                {step}/{TOTAL_STEPS}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {done ? (
          <div className="max-w-2xl mx-auto">
            <ResultsScreen form={form} />
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
            {/* ── Form area ── */}
            <div className="cream-card p-6 sm:p-8">
              <StepProgress current={step} total={TOTAL_STEPS} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.25 }}
                >
                  {stepComponents[step]}
                </motion.div>
              </AnimatePresence>

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-8 pt-5 border-t border-navy/8">
                <button
                  onClick={() => step > 1 && setStep(s => s - 1)}
                  disabled={step === 1}
                  className="flex items-center gap-1.5 text-charcoal/50 hover:text-navy text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} /> السابق
                </button>

                <button
                  onClick={goNext}
                  disabled={loading}
                  className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md ${
                    canProceed(step, form)
                      ? 'bg-cta hover:bg-cta/90 text-white shadow-cta/20 hover:-translate-y-0.5'
                      : 'bg-cream text-charcoal/35 border border-navy/10 cursor-not-allowed shadow-none'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      جاري المطابقة...
                    </>
                  ) : step === TOTAL_STEPS ? (
                    <>إرسال الطلب <CheckCircle size={15} /></>
                  ) : (
                    <>التالي <ChevronLeft size={15} /></>
                  )}
                </button>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="hidden lg:block">
              <SidebarSummary form={form} step={step} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
