import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, CheckCircle, Building2, X,
  Phone, Globe, Sun, HardHat,
  Shield, Layers, Wrench, PaintBucket,
  TreePine, ArrowLeft, BadgeCheck,
  Clock, ChevronLeft, DollarSign, Zap,
  DoorOpen, Mountain, Droplets, Sofa, Cpu, Armchair, Package,
} from 'lucide-react';
import PageHero from '../../components/PageHero';
import SEO from '../../components/SEO';
import { useGlobalData } from '../../context/GlobalContext';

// ── Local filter config ────────────────────────────────────────────────────────
const SPECS = [
  { id: 'all',     label: 'الكل',                           icon: Building2   },
  { id: 'expat',   label: 'إكساء المغتربين',               icon: Globe       },
  { id: 'solar',   label: 'طاقة شمسية',                    icon: Sun         },
  { id: 'floors',  label: 'أرضيات وجدران وأسقف',           icon: Layers      },
  { id: 'doors',   label: 'نوافذ وأبواب وأعمال معدنية',    icon: DoorOpen    },
  { id: 'stone',   label: 'حجر وجي ار سي (GRC)',           icon: Mountain    },
  { id: 'decor',   label: 'ديكور وهندسة',                  icon: PaintBucket },
  { id: 'insul',   label: 'عزل وتسخين وتكييف',             icon: Droplets    },
  { id: 'kitch',   label: 'مطابخ وخزائن',                  icon: Sofa        },
  { id: 'secure',  label: 'مراقبة وأمان',                  icon: Shield      },
  { id: 'land',    label: 'لاند سكيب',                     icon: TreePine    },
  { id: 'smart',   label: 'أنظمة ذكية (Smart Home)',       icon: Cpu         },
  { id: 'mep',     label: 'كهرباء وصحية وصيانة',           icon: Wrench      },
  { id: 'furnit',  label: 'مفروشات',                       icon: Armchair    },
  { id: 'other',   label: 'خدمات مساندة',                  icon: Package     },
];

const CITIES_F = ['الكل', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس'];

const BADGE_CFG = {
  'موثق ومعتمد': { cls: 'bg-green-50 border-green-200 text-green-700', icon: BadgeCheck },
  'موثق':        { cls: 'bg-blue-50  border-blue-200  text-brand',     icon: CheckCircle },
  'قيد التحقق': { cls: 'bg-amber-50 border-amber-200 text-amber-600', icon: Clock },
};

const TIER_CFG = {
  economy: { label: 'اقتصادي', cls: 'bg-sky-50 border-sky-200 text-sky-600' },
  mid:     { label: 'متوسط',   cls: 'bg-brand/8 border-brand/20 text-brand' },
  luxury:  { label: 'فاخر',    cls: 'bg-purple-50 border-purple-200 text-purple-700' },
  custom:  { label: 'مخصص',   cls: 'bg-amber-50 border-amber-200 text-amber-700' },
};

// ── Company Card ──────────────────────────────────────────────────────────────
function CompanyCard({ co, index }) {
  const bdg     = BADGE_CFG[co.badge] || BADGE_CFG['موثق'];
  const BdgIcon = bdg.icon;
  const tier    = TIER_CFG[co.priceRange?.tier] || TIER_CFG.mid;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06 }}
      className="cream-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
    >
      {/* ── Photo strip ── */}
      {co.portfolio?.length > 0 && (
        <div className="flex gap-px h-[70px] shrink-0">
          {co.portfolio.slice(0, 3).map((p) => (
            <div
              key={p.id}
              className="flex-1 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-1.5">
                <p className="text-white/90 text-[8px] font-semibold leading-tight truncate">{p.type}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Card body ── */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center shrink-0">
            <Building2 size={18} className="text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-navy font-black text-sm leading-snug mb-1">{co.name}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${bdg.cls}`}>
                <BdgIcon size={9} /> {co.badge}
              </span>
              {co.turnkey && (
                <span className="text-[10px] bg-cta/8 border border-cta/20 text-cta px-2 py-0.5 rounded-full font-semibold">
                  تسليم مفتاح
                </span>
              )}
              {co.expat && (
                <span className="text-[10px] bg-purple-50 border border-purple-200 text-purple-600 px-2 py-0.5 rounded-full font-semibold flex items-center gap-0.5">
                  <Globe size={8} /> مغتربون
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-charcoal/60 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">{co.desc}</p>

        {/* Price range + tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {co.priceRange && (
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.cls}`}>
              <DollarSign size={8} /> {co.priceRange.label}
            </span>
          )}
          {co.tags.map(t => (
            <span key={t} className="text-[10px] bg-cream border border-navy/8 text-charcoal/55 px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-2.5 py-2.5 border-t border-b border-navy/6 mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-navy font-black text-sm">{co.rating}</span>
            <span className="text-charcoal/40 text-[10px]">({co.reviews})</span>
          </div>
          <span className="text-navy/15">·</span>
          <div className="flex items-center gap-1 text-[10px] text-charcoal/50">
            <HardHat size={10} /> {co.jobs} مشروع
          </div>
          <span className="text-navy/15">·</span>
          <div className="flex items-center gap-1 text-[10px] text-charcoal/50">
            <Zap size={10} className="text-cta" /> {co.responseTime}
          </div>
          <span className="text-navy/15">·</span>
          <div className="flex items-center gap-1 text-[10px] text-charcoal/50">
            <MapPin size={10} /> {co.city}
          </div>
        </div>

        {/* Coverage zones */}
        <div className="flex flex-wrap gap-1 mb-4">
          {co.zones.map(z => (
            <span key={z} className="text-[9px] text-charcoal/50 bg-navy/4 border border-navy/8 px-1.5 py-0.5 rounded-full">
              {z}
            </span>
          ))}
          <span className="text-[9px] text-charcoal/35 mr-0.5">· منذ {co.since}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/finishing/companies/${co.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-navy text-white text-xs font-bold py-2.5 rounded-xl hover:bg-brand transition-colors"
          >
            الملف الكامل <ChevronLeft size={12} />
          </Link>
          <Link
            to="/finishing/rfq"
            className="flex-1 flex items-center justify-center gap-1.5 bg-cta text-white text-xs font-bold py-2.5 rounded-xl hover:bg-cta/90 transition-colors"
          >
            اطلب عرض سعر
          </Link>
          <a
            href={`https://wa.me/${co.phone.replace(/\s|[+]/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 flex items-center justify-center border border-green-300 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors"
            title="واتساب"
          >
            <Phone size={13} />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FinishingCompaniesPage() {
  const { finishingCompanies = [] } = useGlobalData();
  const [spec,      setSpec]      = useState('all');
  const [city,      setCity]      = useState('الكل');
  const [badge,     setBadge]     = useState('all');
  const [expat,     setExpat]     = useState(false);
  const [turnkey,   setTurnkey]   = useState(false);
  const [keyword,   setKeyword]   = useState('');
  const [minRating, setMinRating] = useState(0);

  const filtered = useMemo(() => finishingCompanies.filter(co => {
    if (spec      !== 'all'  && !co.specs.includes(spec)) return false;
    if (city      !== 'الكل' && co.city !== city)         return false;
    if (badge     !== 'all'  && co.badge !== badge)        return false;
    if (expat              && !co.expat)                  return false;
    if (turnkey            && !co.turnkey)                return false;
    if (minRating > 0      && co.rating < minRating)      return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (!co.name.toLowerCase().includes(kw) && !co.city.toLowerCase().includes(kw) &&
          !co.desc.toLowerCase().includes(kw)  && !co.tags.some(t => t.toLowerCase().includes(kw)))
        return false;
    }
    return true;
  }), [finishingCompanies, spec, city, badge, expat, turnkey, keyword, minRating]);

  const hasFilters = spec !== 'all' || city !== 'الكل' || badge !== 'all' || expat || turnkey || keyword || minRating > 0;

  const clearAll = () => {
    setSpec('all'); setCity('الكل'); setBadge('all');
    setExpat(false); setTurnkey(false); setKeyword(''); setMinRating(0);
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title="دليل شركات الإكساء في سوريا"
        description="تصفح شركات الإكساء والمقاولات الموثقة في سوريا. فلتر متعدد بالمنطقة والتخصص والتقييم."
        path="/finishing/companies"
      />

      <PageHero
        num="08"
        eyebrow="منصة الإكساء والمقاولات"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            دليل الشركات<br />
            <span className="text-cta">الموثقة والمعتمدة.</span>
          </h1>
        }
        subtitle={`${finishingCompanies.length} شركة موثقة · فلتر متعدد المستويات · تقييمات حقيقية من عملاء سابقين`}
        accent="bg-cta"
        breadcrumb={[
          { label: 'الرئيسية', to: '/' },
          { label: 'منصة الإكساء', to: '/finishing' },
          { label: 'دليل الشركات' },
        ]}
      />

      {/* ── Filters ── */}
      <div className="bg-white border-b border-navy/8 sticky top-[62px] z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-2.5">

          {/* Row 1: search + badge + toggles */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
              <input
                type="text"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="ابحث باسم الشركة أو التخصص..."
                className="w-full pr-8 pl-3 py-2 text-xs rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30"
              />
              {keyword && (
                <button onClick={() => setKeyword('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-navy">
                  <X size={11} />
                </button>
              )}
            </div>

            <select
              value={badge}
              onChange={e => setBadge(e.target.value)}
              className="text-xs border border-navy/15 rounded-xl px-3 py-2 bg-white text-charcoal/70 focus:outline-none focus:border-brand/40"
            >
              <option value="all">كل الشركات</option>
              <option value="موثق ومعتمد">موثق ومعتمد</option>
              <option value="موثق">موثق</option>
              <option value="قيد التحقق">قيد التحقق</option>
            </select>

            <select
              value={minRating}
              onChange={e => setMinRating(+e.target.value)}
              className="text-xs border border-navy/15 rounded-xl px-3 py-2 bg-white text-charcoal/70 focus:outline-none focus:border-brand/40"
            >
              <option value={0}>كل التقييمات</option>
              <option value={4.5}>4.5+ نجوم</option>
              <option value={4.7}>4.7+ نجوم</option>
              <option value={4.8}>4.8+ نجوم</option>
            </select>

            <button
              onClick={() => setExpat(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${expat ? 'bg-purple-50 border-purple-300 text-purple-600' : 'border-navy/15 text-charcoal/60 hover:border-purple-300'}`}
            >
              <Globe size={11} /> مغتربون
            </button>
            <button
              onClick={() => setTurnkey(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${turnkey ? 'bg-cta/8 border-cta/30 text-cta' : 'border-navy/15 text-charcoal/60 hover:border-cta/30'}`}
            >
              <HardHat size={11} /> تسليم مفتاح
            </button>

            {hasFilters && (
              <button onClick={clearAll} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                <X size={12} /> مسح الكل
              </button>
            )}
          </div>

          {/* Row 2: specialization + city */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {SPECS.map(s => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setSpec(s.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
                    spec === s.id
                      ? 'bg-brand border-brand text-white'
                      : 'border-navy/15 text-charcoal/60 hover:border-brand/40 hover:text-navy bg-white'
                  }`}
                >
                  <Icon size={11} /> {s.label}
                </button>
              );
            })}
            <span className="text-navy/20 text-xs">|</span>
            {CITIES_F.map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
                  city === c
                    ? 'bg-navy border-navy text-white'
                    : 'border-navy/15 text-charcoal/60 hover:border-navy/35 bg-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Count + RFQ CTA */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-charcoal/60 text-sm">
            <span className="text-navy font-black text-base">{filtered.length}</span> شركة
            {keyword && <span> لـ «{keyword}»</span>}
            {city !== 'الكل' && <span> في {city}</span>}
          </p>
          <Link
            to="/finishing/rfq"
            className="flex items-center gap-2 bg-cta text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-cta/90 transition-all shadow-sm shadow-cta/20"
          >
            اطلب عروض أسعار من الكل <ArrowLeft size={13} />
          </Link>
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Building2 size={44} className="mx-auto mb-4 text-charcoal/20" />
              <p className="text-navy font-bold text-base mb-1">لا توجد شركات</p>
              <p className="text-charcoal/50 text-sm mb-5 max-w-xs mx-auto leading-relaxed">
                {keyword ? `لا نتائج لـ «${keyword}»` : 'جرّب تغيير الفلاتر'}
              </p>
              <button onClick={clearAll} className="inline-flex items-center gap-1.5 text-brand text-sm font-semibold hover:underline">
                <X size={14} /> مسح جميع الفلاتر
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map((co, i) => (
                <CompanyCard key={co.id} co={co} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Register CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-12 cream-card p-8 text-center border-2 border-dashed border-navy/15 hover:border-brand/30 transition-colors"
        >
          <HardHat size={32} className="text-brand/40 mx-auto mb-3" />
          <h3 className="text-navy font-black text-lg mb-2">شركتك غير مدرجة؟</h3>
          <p className="text-charcoal/55 text-sm mb-5 max-w-sm mx-auto leading-relaxed">
            سجّل شركتك في المنصة واستقبل طلبات عروض أسعار مباشرة من عملاء في منطقتك وتخصصك.
          </p>
          <Link
            to="/auth?tab=register"
            className="inline-flex items-center gap-2 bg-brand hover:bg-navy text-white font-bold px-6 py-3 rounded-xl text-sm transition-all hover:-translate-y-0.5"
          >
            سجّل شركتك مجاناً <ArrowLeft size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
