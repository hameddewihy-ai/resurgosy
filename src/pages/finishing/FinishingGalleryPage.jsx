import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Search, MapPin, Calendar, Home, Layers, Hammer,
  Sun, PaintBucket, Wrench, TreePine, Building2,
  ChevronRight, ArrowLeft, ZoomIn,
} from 'lucide-react';
import PageHero from '../../components/PageHero';
import SEO from '../../components/SEO';

// ── Data ──────────────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,  title: 'شقة فاخرة – المزة 86',         type: 'interior', typeLabel: 'إكساء داخلي',
    style: 'عصري', city: 'دمشق',     company: 'دوزان للإكساء', companyId: 1,
    year: 2024, area: 180, budget: 'فاخر',   c1: '#3b82f6', c2: '#6366f1',
    highlights: ['رخام إيطالي', 'إضاءة ذكية', 'مطبخ مفتوح'],
    desc: 'إكساء شامل بمواد مستوردة وإضاءة ذكية. نُفّذ بتقنية تسليم مفتاح مع متابعة لصاحب المشروع المغترب في ألمانيا.',
  },
  {
    id: 2,  title: 'واجهة برج الشهباء',              type: 'facade',   typeLabel: 'واجهات خارجية',
    style: 'معاصر', city: 'حلب',    company: 'سما للواجهات', companyId: 8,
    year: 2024, area: 2000, budget: 'فاخر',  c1: '#475569', c2: '#0f172a',
    highlights: ['كمبوزيت ألماني', 'ضمان 10 سنوات', 'إضاءة ليلية'],
    desc: 'واجهة مبنى تجاري متعدد الطوابق بكمبوزيت ألماني مقاوم للحرارة مع منظومة إضاءة ليلية متكاملة.',
  },
  {
    id: 3,  title: 'ترميم منزل حلب التاريخي',        type: 'restore',  typeLabel: 'ترميم إنشائي',
    style: 'تراثي', city: 'حلب',    company: 'أبو النور للتعهدات', companyId: 2,
    year: 2024, area: 320, budget: 'متوسط',  c1: '#f97316', c2: '#ef4444',
    highlights: ['تدعيم إنشائي', 'إعادة تأهيل كاملة', 'حفاظ على التراث'],
    desc: 'ترميم منزل عائلي تاريخي في حلب القديمة. شمل التدعيم الإنشائي وإعادة الواجهة مع الحفاظ على الطابع التراثي.',
  },
  {
    id: 4,  title: 'منظومة طاقة شمسية 15 كيلوواط',  type: 'solar',    typeLabel: 'طاقة شمسية',
    style: 'تقني', city: 'دمشق',    company: 'Solar Energy Syria', companyId: 3,
    year: 2024, area: 15, budget: 'متوسط',   c1: '#fbbf24', c2: '#f59e0b',
    highlights: ['ألواح Huawei', 'بطاريات ليثيوم', 'تطبيق مراقبة'],
    desc: 'نظام طاقة شمسية منزلي بقدرة 15 كيلوواط مع بطاريات ليثيوم. يوفر الاستقلالية الكاملة عن الشبكة العامة.',
  },
  {
    id: 5,  title: 'ديكور عجمي – قاعة ضيافة',       type: 'decor',    typeLabel: 'ديكور وعمارة',
    style: 'دمشقي أصيل', city: 'دمشق', company: 'مؤسسة الشام للديكور', companyId: 5,
    year: 2024, area: 90, budget: 'فاخر',    c1: '#d97706', c2: '#92400e',
    highlights: ['عجمي يدوي', 'ذهب أصلي', 'حرفية دمشقية'],
    desc: 'قاعة ضيافة بعمل عجمي يدوي خالص مع زخارف مذهّبة. نُفّذ بأيدي حرفيين دمشقيين من الجيل الثالث.',
  },
  {
    id: 6,  title: 'شقة تسليم مفتاح – مغترب كندا',  type: 'interior', typeLabel: 'إكساء داخلي',
    style: 'عصري بسيط', city: 'دمشق', company: 'دوزان للإكساء', companyId: 1,
    year: 2024, area: 145, budget: 'متوسط',  c1: '#34d399', c2: '#0d9488',
    highlights: ['تقارير أسبوعية', 'مواد متوسطة', 'تسليم في الموعد'],
    desc: 'إكساء كامل لشقة مغترب في كندا. أُدير المشروع بالكامل عن بُعد مع تقارير مصورة أسبوعية حتى التسليم.',
  },
  {
    id: 7,  title: 'واجهة مركز طبي حمص',            type: 'facade',   typeLabel: 'واجهات خارجية',
    style: 'معاصر طبي', city: 'حمص', company: 'سما للواجهات', companyId: 8,
    year: 2023, area: 600, budget: 'متوسط',  c1: '#78716c', c2: '#44403c',
    highlights: ['زجاج طبي عاكس', 'ألمنيوم بني', 'مقاوم للعوامل'],
    desc: 'واجهة مركز طبي متخصص بزجاج عاكس للأشعة وهيكل ألمنيوم بني مقاوم للتآكل مع ضمان 10 سنوات.',
  },
  {
    id: 8,  title: 'تمديدات كهربائية برج سكني',      type: 'mep',      typeLabel: 'كهرباء وسباكة',
    style: 'صناعي', city: 'حمص',    company: 'الرائد للكهرباء', companyId: 7,
    year: 2024, area: 3600, budget: 'متوسط', c1: '#f59e0b', c2: '#b45309',
    highlights: ['لوحات ذكية', 'توفير طاقة 30%', 'ضمان سنتين'],
    desc: 'منظومة كهربائية شاملة لبرج سكني 12 طابقاً مع لوحات ذكية موفّرة للطاقة ومراقبة مركزية عن بُعد.',
  },
  {
    id: 9,  title: 'حديقة فيلا المهاجرين',           type: 'land',     typeLabel: 'حدائق وخارجي',
    style: 'أنيق', city: 'دمشق',    company: 'الخضراء للحدائق', companyId: 9,
    year: 2024, area: 600, budget: 'فاخر',   c1: '#4ade80', c2: '#16a34a',
    highlights: ['ري ذكي', 'نباتات محلية', 'إضاءة خارجية'],
    desc: 'حديقة فيلا فاخرة بمساحة 600 م² مع نظام ري ذكي ونباتات مناخية ومنظومة إضاءة LED خارجية.',
  },
  {
    id: 10, title: 'إعادة تأهيل مبنى سكني',          type: 'restore',  typeLabel: 'ترميم إنشائي',
    style: 'عملي', city: 'ريف دمشق', company: 'الفارس للإنشاء', companyId: 4,
    year: 2024, area: 750, budget: 'اقتصادي', c1: '#6b7280', c2: '#374151',
    highlights: ['تدعيم هيكلي', 'أسعار منافسة', 'التزام بالموعد'],
    desc: 'إعادة تأهيل مبنى سكني متضرر في ريف دمشق. شمل الترميم الإنشائي والإكساء الداخلي والخارجي.',
  },
  {
    id: 11, title: 'شقة عصرية – الفرقان حمص',        type: 'interior', typeLabel: 'إكساء داخلي',
    style: 'مودرن', city: 'حمص',    company: 'أبو النور للتعهدات', companyId: 2,
    year: 2024, area: 130, budget: 'متوسط',  c1: '#a78bfa', c2: '#7c3aed',
    highlights: ['بلاط تركي', 'جبسيات حديثة', 'مطبخ مدمج'],
    desc: 'إكساء داخلي عصري بمواد تركية عالية الجودة مع جبسيات مودرن ومطبخ مدمج مع الصالة.',
  },
  {
    id: 12, title: 'ألواح شمسية – مزرعة حمص',       type: 'solar',    typeLabel: 'طاقة شمسية',
    style: 'زراعي', city: 'حمص',    company: 'Solar Energy Syria', companyId: 3,
    year: 2023, area: 30, budget: 'متوسط',   c1: '#a3e635', c2: '#4d7c0f',
    highlights: ['ألواح زراعية', 'مضخة شمسية', 'انقطاع صفري'],
    desc: 'منظومة طاقة شمسية لمزرعة زراعية بقدرة 30 كيلوواط تغطي احتياجات المضخات والإضاءة بالكامل.',
  },
  {
    id: 13, title: 'نقوش خشبية – مطعم تراثي',        type: 'decor',    typeLabel: 'ديكور وعمارة',
    style: 'تراثي', city: 'دمشق',   company: 'مؤسسة الشام للديكور', companyId: 5,
    year: 2024, area: 280, budget: 'فاخر',   c1: '#f472b6', c2: '#be185d',
    highlights: ['خشب عربي أصيل', 'نقوش يدوية', 'فوانيس أنتيك'],
    desc: 'ديكور مطعم تراثي بالكامل بأعمال خشبية يدوية وزجاج معشق ملوّن وفوانيس نحاسية أصيلة.',
  },
  {
    id: 14, title: 'ترميم مجمع تجاري حلب',           type: 'restore',  typeLabel: 'ترميم إنشائي',
    style: 'تجاري', city: 'حلب',    company: 'أبو النور للتعهدات', companyId: 2,
    year: 2024, area: 1100, budget: 'متوسط', c1: '#22d3ee', c2: '#0891b2',
    highlights: ['شبكة كهربائية جديدة', 'واجهة مجددة', 'تشطيبات كاملة'],
    desc: 'ترميم شامل لمجمع تجاري في حلب يشمل الهيكل الإنشائي والشبكات والتشطيبات الداخلية والواجهة.',
  },
  {
    id: 15, title: 'إكساء اقتصادي – حماة',           type: 'interior', typeLabel: 'إكساء داخلي',
    style: 'بسيط', city: 'حماة',    company: 'الرائد للكهرباء', companyId: 7,
    year: 2024, area: 110, budget: 'اقتصادي', c1: '#94a3b8', c2: '#475569',
    highlights: ['مواد محلية', 'تنفيذ سريع', 'ضمن الميزانية'],
    desc: 'إكساء داخلي اقتصادي بمواد محلية للوحدات السكنية البسيطة. أُنجز خلال أسبوعين فقط ضمن الميزانية.',
  },
  {
    id: 16, title: 'واجهة حجرية – فيلا اللاذقية',    type: 'facade',   typeLabel: 'واجهات خارجية',
    style: 'كلاسيكي', city: 'اللاذقية', company: 'سما للواجهات', companyId: 8,
    year: 2024, area: 450, budget: 'فاخر',   c1: '#a16207', c2: '#713f12',
    highlights: ['حجر طبيعي', 'تصميم كلاسيكي', 'مقاوم للرطوبة'],
    desc: 'واجهة فيلا خاصة بحجر رملي طبيعي مستوى اللاذقية مع معالجة خاصة لمقاومة رطوبة البحر.',
  },
];

const TYPE_OPTS = [
  { id: 'all',      label: 'الكل',           icon: Building2 },
  { id: 'interior', label: 'إكساء داخلي',    icon: Home      },
  { id: 'facade',   label: 'واجهات',         icon: Layers    },
  { id: 'restore',  label: 'ترميم',          icon: Hammer    },
  { id: 'solar',    label: 'طاقة شمسية',     icon: Sun       },
  { id: 'decor',    label: 'ديكور',          icon: PaintBucket },
  { id: 'mep',      label: 'كهرباء',         icon: Wrench    },
  { id: 'land',     label: 'حدائق',          icon: TreePine  },
];

const CITIES_G = ['الكل', 'دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'ريف دمشق'];
const BUDGETS  = ['الكل', 'اقتصادي', 'متوسط', 'فاخر'];

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ proj, index, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
      onClick={() => onClick(proj)}
      className="cursor-pointer rounded-2xl overflow-hidden relative group h-52 sm:h-56"
      style={{ background: `linear-gradient(135deg, ${proj.c1}, ${proj.c2})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

      {/* Top badges */}
      <div className="absolute top-3 right-3 flex gap-1.5 flex-wrap">
        <span className="text-[10px] bg-black/40 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
          {proj.typeLabel}
        </span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold ${
          proj.budget === 'فاخر'     ? 'bg-purple-600/50 text-purple-100' :
          proj.budget === 'متوسط'    ? 'bg-brand/50 text-blue-100'        :
                                       'bg-sky-600/50 text-sky-100'
        }`}>
          {proj.budget}
        </span>
      </div>

      {/* Hover zoom icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
          <ZoomIn size={18} className="text-white" />
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 inset-x-0 p-4">
        <h3 className="text-white font-black text-sm leading-tight mb-1 drop-shadow">{proj.title}</h3>
        <div className="flex items-center gap-2 text-white/65 text-[10px]">
          <span className="flex items-center gap-0.5"><MapPin size={9} /> {proj.city}</span>
          <span>·</span>
          <span>{proj.year}</span>
          {proj.area && (
            <>
              <span>·</span>
              <span>{proj.area} {proj.type === 'solar' ? 'كيلوواط' : 'م²'}</span>
            </>
          )}
        </div>
        <p className="text-white/40 text-[10px] mt-0.5 truncate">{proj.company}</p>
      </div>
    </motion.div>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ProjectModal({ proj, onClose }) {
  if (!proj) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ duration: 0.22 }}
          className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Visual header */}
          <div
            className="h-52 relative"
            style={{ background: `linear-gradient(135deg, ${proj.c1}, ${proj.c2})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X size={14} />
            </button>
            <div className="absolute top-3 right-3 flex gap-1.5">
              <span className="text-[10px] bg-black/40 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm font-medium">
                {proj.typeLabel}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm font-semibold ${
                proj.budget === 'فاخر'  ? 'bg-purple-600/50 text-purple-100' :
                proj.budget === 'متوسط' ? 'bg-brand/50 text-blue-100'        :
                                          'bg-sky-600/50 text-sky-100'
              }`}>
                {proj.budget}
              </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-5">
              <h2 className="text-white font-black text-xl">{proj.title}</h2>
              <div className="flex items-center gap-2 text-white/65 text-xs mt-1">
                <span className="flex items-center gap-1"><MapPin size={11} /> {proj.city}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> {proj.year}</span>
                {proj.area && (
                  <>
                    <span>·</span>
                    <span>{proj.area} {proj.type === 'solar' ? 'كيلوواط' : 'م²'}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <p className="text-charcoal/65 text-sm leading-relaxed mb-4">{proj.desc}</p>

            {/* Highlights */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {proj.highlights?.map(h => (
                <span key={h} className="text-xs bg-brand/8 border border-brand/15 text-brand px-2.5 py-1 rounded-full font-medium">
                  {h}
                </span>
              ))}
            </div>

            {/* Style */}
            <p className="text-charcoal/45 text-xs mb-4">الأسلوب: <span className="text-navy font-semibold">{proj.style}</span></p>

            <div className="flex gap-2">
              <Link
                to={`/finishing/companies/${proj.companyId}`}
                className="flex-1 flex items-center justify-center gap-1.5 bg-navy text-white font-bold py-2.5 rounded-xl text-sm hover:bg-brand transition-colors"
                onClick={onClose}
              >
                ملف الشركة <ChevronRight size={13} />
              </Link>
              <Link
                to="/finishing/rfq"
                className="flex-1 flex items-center justify-center gap-1.5 bg-cta text-white font-bold py-2.5 rounded-xl text-sm hover:bg-cta/90 transition-colors"
                onClick={onClose}
              >
                اطلب مشابهاً
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FinishingGalleryPage() {
  const [typeF,    setTypeF]    = useState('all');
  const [cityF,    setCityF]    = useState('الكل');
  const [budgetF,  setBudgetF]  = useState('الكل');
  const [keyword,  setKeyword]  = useState('');
  const [active,   setActive]   = useState(null);

  const filtered = useMemo(() => PROJECTS.filter(p => {
    if (typeF   !== 'all'  && p.type   !== typeF)    return false;
    if (cityF   !== 'الكل' && p.city   !== cityF)    return false;
    if (budgetF !== 'الكل' && p.budget !== budgetF)  return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (!p.title.includes(keyword) && !p.city.toLowerCase().includes(kw) &&
          !p.typeLabel.includes(keyword) && !p.company.toLowerCase().includes(kw))
        return false;
    }
    return true;
  }), [typeF, cityF, budgetF, keyword]);

  const hasFilters = typeF !== 'all' || cityF !== 'الكل' || budgetF !== 'الكل' || keyword;
  const clearAll   = () => { setTypeF('all'); setCityF('الكل'); setBudgetF('الكل'); setKeyword(''); };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title="معرض مشاريع الإكساء – سوريا"
        description="استعرض أحدث مشاريع الإكساء والتشطيب المنجزة في سوريا. فلتر بالنوع والمدينة والفئة."
        path="/finishing/gallery"
      />

      <PageHero
        num="09"
        eyebrow="منصة الإكساء والمقاولات"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            معرض المشاريع<br />
            <span className="text-cta">المنجزة في سوريا.</span>
          </h1>
        }
        subtitle={`${PROJECTS.length} مشروع منجز · إكساء داخلي وخارجي وطاقة وترميم · فلتر متعدد`}
        accent="bg-cta"
        breadcrumb={[
          { label: 'الرئيسية', to: '/' },
          { label: 'منصة الإكساء', to: '/finishing' },
          { label: 'معرض المشاريع' },
        ]}
      />

      {/* ── Filters ── */}
      <div className="bg-white border-b border-navy/8 sticky top-[62px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2">

          {/* Search + city + budget */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="ابحث في المشاريع..."
                className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30"
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-navy">
                  <X size={11} />
                </button>
              )}
            </div>

            <select
              value={cityF}
              onChange={e => setCityF(e.target.value)}
              className="text-xs border border-navy/15 rounded-xl px-3 py-2 bg-white text-charcoal/70 focus:outline-none focus:border-brand/40"
            >
              {CITIES_G.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={budgetF}
              onChange={e => setBudgetF(e.target.value)}
              className="text-xs border border-navy/15 rounded-xl px-3 py-2 bg-white text-charcoal/70 focus:outline-none focus:border-brand/40"
            >
              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>

            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600">
                <X size={12} /> مسح
              </button>
            )}
          </div>

          {/* Type row */}
          <div className="flex gap-1.5 flex-wrap">
            {TYPE_OPTS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTypeF(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
                    typeF === t.id
                      ? 'bg-brand border-brand text-white'
                      : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-navy bg-white'
                  }`}
                >
                  <Icon size={11} /> {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-charcoal/55 text-sm">
            <span className="text-navy font-black text-base">{filtered.length}</span> مشروع
          </p>
          <Link
            to="/finishing/rfq"
            className="flex items-center gap-2 bg-cta text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-cta/90 transition-all shadow-sm shadow-cta/20"
          >
            اطلب مشروعاً مشابهاً <ArrowLeft size={13} />
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
              <Building2 size={44} className="mx-auto mb-4 text-charcoal/20" />
              <p className="text-navy font-bold text-base mb-1">لا توجد مشاريع</p>
              <p className="text-charcoal/50 text-sm mb-5">جرّب تغيير الفلاتر</p>
              <button onClick={clearAll} className="text-brand text-sm font-semibold hover:underline flex items-center gap-1 mx-auto">
                <X size={14} /> مسح جميع الفلاتر
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} proj={p} index={i} onClick={setActive} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-navy rounded-2xl p-8 text-center"
        >
          <p className="text-white/60 text-xs uppercase tracking-widest mb-2">هل أعجبك ما رأيت؟</p>
          <h3 className="text-white font-black text-xl mb-2">ابدأ مشروعك الآن</h3>
          <p className="text-white/55 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            أرسل طلب عرض أسعار وستتواصل معك شركات موثقة من تخصصك ومنطقتك خلال ساعتين.
          </p>
          <Link
            to="/finishing/rfq"
            className="inline-flex items-center gap-2 bg-cta text-white font-bold px-7 py-3 rounded-xl hover:bg-cta/90 transition-all hover:-translate-y-0.5"
          >
            اطلب عرض سعر مجاناً <ArrowLeft size={14} />
          </Link>
        </motion.div>
      </div>

      {/* Modal */}
      {active && <ProjectModal proj={active} onClose={() => setActive(null)} />}
    </div>
  );
}
