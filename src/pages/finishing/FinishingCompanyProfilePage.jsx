import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Star, BadgeCheck, CheckCircle, Clock,
  MapPin, Phone, Globe, Hammer, HardHat, Building2,
  Shield, Calendar, Award, Zap, DollarSign, ChevronRight,
  Home, Layers, Wrench, PaintBucket, TreePine, Sun,
  MessageSquare, Send, X,
} from 'lucide-react';
import SEO from '../../components/SEO';
import { COMPANIES } from './finishingCompaniesData';

// ── Helpers ───────────────────────────────────────────────────────────────────
const SPEC_LABELS = {
  expat:    { label: 'إكساء المغتربين',  icon: Globe       },
  solar:    { label: 'طاقة شمسية',      icon: Sun         },
  restore:  { label: 'ترميم إنشائي',    icon: Hammer      },
  interior: { label: 'إكساء داخلي',     icon: Home        },
  facade:   { label: 'واجهات خارجية',   icon: Layers      },
  mep:      { label: 'كهرباء وسباكة',   icon: Wrench      },
  decor:    { label: 'ديكور وعمارة',    icon: PaintBucket },
  secure:   { label: 'أمن وأنظمة ذكية',icon: Shield      },
  land:     { label: 'حدائق وخارجي',   icon: TreePine    },
};

const BADGE_CFG = {
  'موثق ومعتمد': { cls: 'bg-green-50 border-green-200 text-green-700', icon: BadgeCheck },
  'موثق':        { cls: 'bg-blue-50  border-blue-200  text-brand',     icon: CheckCircle },
  'قيد التحقق': { cls: 'bg-amber-50 border-amber-200 text-amber-600', icon: Clock },
};

const TIER_CFG = {
  economy: { label: 'فئة اقتصادية', cls: 'text-sky-600' },
  mid:     { label: 'فئة متوسطة',  cls: 'text-brand' },
  luxury:  { label: 'فئة فاخرة',   cls: 'text-purple-600' },
  custom:  { label: 'تسعير مخصص', cls: 'text-amber-600' },
};

const TABS = [
  { id: 'overview',  label: 'نبذة'      },
  { id: 'portfolio', label: 'المشاريع'  },
  { id: 'reviews',   label: 'التقييمات' },
  { id: 'contact',   label: 'التواصل'   },
];

// ── Stars helper ──────────────────────────────────────────────────────────────
function Stars({ value, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-navy/15'}
        />
      ))}
    </div>
  );
}

// ── Portfolio grid ────────────────────────────────────────────────────────────
function PortfolioGrid({ items }) {
  const [active, setActive] = useState(null);
  if (!items?.length) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map(p => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.18 }}
            onClick={() => setActive(p)}
            className="cursor-pointer rounded-2xl overflow-hidden aspect-[4/3] relative group"
            style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
            <div className="absolute bottom-0 inset-x-0 p-3">
              <p className="text-white font-bold text-sm leading-tight">{p.title}</p>
              <p className="text-white/70 text-xs mt-0.5">{p.type} · {p.city}</p>
            </div>
            <div className="absolute top-2 left-2">
              <span className="text-[10px] bg-black/30 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {p.year}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setActive(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-lg w-full rounded-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="h-64 relative"
                style={{ background: `linear-gradient(135deg, ${active.c1}, ${active.c2})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setActive(null)}
                  className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="bg-white p-5">
                <h3 className="text-navy font-black text-lg mb-1">{active.title}</h3>
                <div className="flex items-center gap-3 text-charcoal/55 text-sm">
                  <span className="flex items-center gap-1"><MapPin size={13} /> {active.city}</span>
                  <span className="flex items-center gap-1"><Calendar size={13} /> {active.year}</span>
                  {active.area && (
                    <span className="flex items-center gap-1">
                      <Home size={13} />
                      {active.area} {active.type?.includes('كيلو') ? 'كيلوواط' : 'م²'}
                    </span>
                  )}
                </div>
                <span className="inline-block mt-3 text-[11px] bg-brand/8 text-brand px-3 py-1 rounded-full font-medium">
                  {active.type}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Reviews section ───────────────────────────────────────────────────────────
function ReviewsSection({ co }) {
  const list = co.reviewsList || [];
  const avg  = list.length ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1) : co.rating;

  const dist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: list.filter(r => r.rating === n).length,
    pct:   list.length ? Math.round(list.filter(r => r.rating === n).length / list.length * 100) : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="cream-card p-6 flex flex-col sm:flex-row items-center gap-6">
        <div className="text-center shrink-0">
          <p className="text-5xl font-black text-navy">{avg}</p>
          <Stars value={Math.round(avg)} size={16} />
          <p className="text-charcoal/50 text-xs mt-1">{co.reviews} تقييم</p>
        </div>
        <div className="flex-1 w-full space-y-1.5">
          {dist.map(d => (
            <div key={d.n} className="flex items-center gap-2">
              <span className="text-xs text-charcoal/50 w-3 shrink-0">{d.n}</span>
              <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 bg-navy/8 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${d.pct}%` }}
                />
              </div>
              <span className="text-[10px] text-charcoal/40 w-6 text-left">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {list.map(r => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="cream-card p-5"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-navy font-bold text-sm">{r.name}</p>
                <p className="text-charcoal/45 text-[10px]">{r.location} · {r.date}</p>
              </div>
              <Stars value={r.rating} size={12} />
            </div>
            <p className="text-charcoal/65 text-sm leading-relaxed">{r.comment}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Contact tab ───────────────────────────────────────────────────────────────
function ContactTab({ co }) {
  const [sent, setSent] = useState(false);
  const [msg, setMsg]   = useState('');

  const handleSend = () => {
    if (msg.trim().length < 10) return;
    setSent(true);
  };

  return (
    <div className="space-y-4 max-w-xl">
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cream-card p-8 text-center"
        >
          <CheckCircle size={36} className="text-green-500 mx-auto mb-3" />
          <h3 className="text-navy font-black text-lg mb-2">تم إرسال رسالتك</h3>
          <p className="text-charcoal/55 text-sm leading-relaxed">
            سيتواصل معك فريق {co.name} {co.responseTime}. يمكنك أيضاً التواصل عبر واتساب للرد الفوري.
          </p>
        </motion.div>
      ) : (
        <div className="cream-card p-6 space-y-4">
          <h3 className="text-navy font-bold text-base">أرسل رسالة مباشرة</h3>
          <textarea
            value={msg}
            onChange={e => setMsg(e.target.value)}
            rows={4}
            placeholder="اكتب استفسارك أو طلبك هنا..."
            className="w-full px-4 py-3 text-sm rounded-xl border border-navy/15 bg-white focus:outline-none focus:border-brand/50 placeholder:text-charcoal/30 resize-none leading-relaxed"
          />
          <button
            onClick={handleSend}
            disabled={msg.trim().length < 10}
            className="w-full flex items-center justify-center gap-2 bg-brand text-white font-bold py-3 rounded-xl text-sm hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} /> إرسال الرسالة
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="cream-card p-5 space-y-3">
        <h3 className="text-navy font-bold text-sm mb-3">تواصل مباشر</h3>
        <a
          href={`https://wa.me/${co.phone.replace(/\s|[+]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 w-full border border-green-200 bg-green-50 text-green-700 font-semibold py-3 px-4 rounded-xl hover:bg-green-100 transition-colors text-sm"
        >
          <Phone size={16} />
          <span>واتساب: {co.phone}</span>
          <ChevronRight size={14} className="mr-auto" />
        </a>
        <Link
          to="/finishing/rfq"
          className="flex items-center gap-3 w-full bg-cta text-white font-bold py-3 px-4 rounded-xl hover:bg-cta/90 transition-colors text-sm"
        >
          <MessageSquare size={16} />
          <span>اطلب عرض سعر رسمي</span>
          <ChevronRight size={14} className="mr-auto" />
        </Link>
      </div>

      <div className="text-center">
        <p className="text-charcoal/40 text-xs">
          وقت الرد المعتاد: <span className="text-navy font-bold">{co.responseTime}</span>
        </p>
      </div>
    </div>
  );
}

// ── Main profile page ─────────────────────────────────────────────────────────
export default function FinishingCompanyProfilePage() {
  const { id }     = useParams();
  const co         = COMPANIES.find(c => String(c.id) === String(id));
  const [tab, setTab] = useState('overview');

  if (!co) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Building2 size={48} className="text-charcoal/20 mx-auto mb-4" />
          <h2 className="text-navy font-black text-xl mb-2">الشركة غير موجودة</h2>
          <p className="text-charcoal/50 text-sm mb-5">لم يتم العثور على الشركة المطلوبة</p>
          <Link to="/finishing/companies" className="text-brand font-semibold hover:underline flex items-center gap-1 justify-center">
            <ArrowRight size={14} /> العودة للدليل
          </Link>
        </div>
      </div>
    );
  }

  const bdg     = BADGE_CFG[co.badge] || BADGE_CFG['موثق'];
  const BdgIcon = bdg.icon;
  const tier    = TIER_CFG[co.priceRange?.tier] || TIER_CFG.mid;
  const yrsExp  = new Date().getFullYear() - co.since;

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <SEO
        title={`${co.name} – ملف الشركة`}
        description={co.desc}
        path={`/finishing/companies/${co.id}`}
      />

      {/* ── Hero ── */}
      <div className="bg-navy relative overflow-hidden">
        {/* Background gradient strip from portfolio colors */}
        {co.portfolio?.slice(0, 3).map((p, i) => (
          <div
            key={p.id}
            className="absolute inset-y-0 opacity-10"
            style={{
              left: `${i * 33.33}%`,
              width: '33.33%',
              background: `linear-gradient(180deg, ${p.c1}, ${p.c2})`,
            }}
          />
        ))}

        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-6 flex-wrap">
            <Link to="/" className="hover:text-white/70 transition-colors">الرئيسية</Link>
            <ChevronRight size={11} className="rotate-180" />
            <Link to="/finishing" className="hover:text-white/70 transition-colors">منصة الإكساء</Link>
            <ChevronRight size={11} className="rotate-180" />
            <Link to="/finishing/companies" className="hover:text-white/70 transition-colors">دليل الشركات</Link>
            <ChevronRight size={11} className="rotate-180" />
            <span className="text-white/70">{co.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Logo placeholder */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
              <Building2 size={28} className="text-white/60" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${bdg.cls}`}>
                  <BdgIcon size={10} /> {co.badge}
                </span>
                {co.turnkey && (
                  <span className="text-[11px] bg-cta/15 border border-cta/30 text-cta px-2.5 py-1 rounded-full font-semibold">
                    تسليم مفتاح
                  </span>
                )}
                {co.expat && (
                  <span className="text-[11px] bg-purple-500/15 border border-purple-400/30 text-purple-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <Globe size={9} /> متخصص للمغتربين
                  </span>
                )}
              </div>

              <h1 className="text-white font-black text-2xl sm:text-3xl mb-1">{co.name}</h1>
              <div className="flex items-center gap-2 text-white/60 text-sm flex-wrap">
                <span className="flex items-center gap-1"><MapPin size={12} /> {co.city}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> منذ {co.since}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Zap size={12} className="text-cta" /> {co.responseTime}</span>
              </div>
            </div>

            {/* Quick CTA on desktop */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              <Link
                to="/finishing/rfq"
                className="flex items-center gap-2 bg-cta text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-cta/90 transition-colors"
              >
                اطلب عرض سعر
              </Link>
              <a
                href={`https://wa.me/${co.phone.replace(/\s|[+]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 border border-white/20 text-white/80 px-5 py-2.5 rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                <Phone size={14} /> واتساب
              </a>
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Star,      val: `${co.rating}`,       sub: `${co.reviews} تقييم`,  color: 'text-amber-400' },
              { icon: HardHat,   val: `${co.jobs}`,         sub: 'مشروع منجز',            color: 'text-brand' },
              { icon: Award,     val: `${yrsExp} سنوات`,    sub: 'خبرة',                  color: 'text-cta' },
              { icon: DollarSign,val: co.priceRange?.label, sub: tier.label,              color: `${tier.cls}` },
            ].map(({ icon: Icon, val, sub, color }) => (
              <div key={sub} className="bg-white/6 border border-white/10 rounded-xl p-3 text-center">
                <Icon size={16} className={`mx-auto mb-1 ${color}`} />
                <p className="text-white font-black text-base">{val}</p>
                <p className="text-white/45 text-[10px]">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-navy/8 sticky top-[62px] z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-5 py-3.5 text-sm font-bold transition-colors ${
                  tab === t.id ? 'text-brand' : 'text-charcoal/55 hover:text-navy'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-brand rounded-t-full"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {/* ── Overview ── */}
            {tab === 'overview' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main column */}
                <div className="lg:col-span-2 space-y-5">
                  {/* About */}
                  <div className="cream-card p-6">
                    <h2 className="text-navy font-black text-base mb-3">نبذة عن الشركة</h2>
                    <p className="text-charcoal/65 text-sm leading-relaxed">{co.about || co.desc}</p>
                  </div>

                  {/* Specializations */}
                  <div className="cream-card p-6">
                    <h2 className="text-navy font-black text-base mb-4">التخصصات</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {co.specs.map(s => {
                        const spec = SPEC_LABELS[s];
                        if (!spec) return null;
                        const Icon = spec.icon;
                        return (
                          <div key={s} className="flex items-center gap-2 bg-white border border-navy/8 rounded-xl px-3 py-2.5">
                            <div className="w-7 h-7 rounded-lg bg-brand/8 flex items-center justify-center shrink-0">
                              <Icon size={14} className="text-brand" />
                            </div>
                            <span className="text-navy font-semibold text-xs">{spec.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent portfolio preview */}
                  {co.portfolio?.length > 0 && (
                    <div className="cream-card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-navy font-black text-base">أحدث المشاريع</h2>
                        <button
                          onClick={() => setTab('portfolio')}
                          className="text-brand text-xs font-semibold hover:underline flex items-center gap-1"
                        >
                          عرض الكل <ChevronRight size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {co.portfolio.slice(0, 3).map(p => (
                          <div
                            key={p.id}
                            onClick={() => setTab('portfolio')}
                            className="cursor-pointer aspect-[4/3] rounded-xl overflow-hidden relative group"
                            style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <div className="absolute bottom-0 inset-x-0 p-2">
                              <p className="text-white text-[10px] font-semibold truncate">{p.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                  {/* Quick info */}
                  <div className="cream-card p-5 space-y-3">
                    <h3 className="text-navy font-black text-sm">معلومات سريعة</h3>
                    {[
                      { icon: MapPin,   label: 'المدينة',          val: co.city },
                      { icon: Calendar, label: 'تأسست',            val: String(co.since) },
                      { icon: HardHat,  label: 'مشاريع منجزة',     val: `${co.jobs} مشروع` },
                      { icon: Zap,      label: 'وقت الرد',          val: co.responseTime },
                      { icon: DollarSign, label: 'نطاق الأسعار',   val: co.priceRange?.label },
                    ].map(({ icon: Icon, label, val }) => val && (
                      <div key={label} className="flex items-center gap-2.5 text-sm">
                        <Icon size={14} className="text-brand shrink-0" />
                        <span className="text-charcoal/45 text-xs">{label}:</span>
                        <span className="text-navy font-semibold text-xs mr-auto">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coverage zones */}
                  <div className="cream-card p-5">
                    <h3 className="text-navy font-black text-sm mb-3">مناطق التغطية</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {co.zones.map(z => (
                        <span key={z} className="text-xs bg-navy/5 border border-navy/10 text-charcoal/60 px-2.5 py-1 rounded-full">
                          {z}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {co.certifications?.length > 0 && (
                    <div className="cream-card p-5">
                      <h3 className="text-navy font-black text-sm mb-3">الشهادات والاعتمادات</h3>
                      <div className="space-y-2">
                        {co.certifications.map(c => (
                          <div key={c} className="flex items-center gap-2">
                            <BadgeCheck size={13} className="text-green-500 shrink-0" />
                            <span className="text-charcoal/65 text-xs">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="space-y-2">
                    <Link
                      to="/finishing/rfq"
                      className="flex items-center justify-center gap-2 w-full bg-cta text-white font-bold py-3 rounded-xl text-sm hover:bg-cta/90 transition-colors"
                    >
                      اطلب عرض سعر الآن
                    </Link>
                    <a
                      href={`https://wa.me/${co.phone.replace(/\s|[+]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full border border-green-300 bg-green-50 text-green-700 font-semibold py-3 rounded-xl text-sm hover:bg-green-100 transition-colors"
                    >
                      <Phone size={14} /> تواصل واتساب
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* ── Portfolio ── */}
            {tab === 'portfolio' && (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-navy font-black text-lg">{co.portfolio?.length || 0} مشروع منجز</h2>
                  <p className="text-charcoal/45 text-xs">انقر على المشروع لعرض التفاصيل</p>
                </div>
                <PortfolioGrid items={co.portfolio} />
              </div>
            )}

            {/* ── Reviews ── */}
            {tab === 'reviews' && <ReviewsSection co={co} />}

            {/* ── Contact ── */}
            {tab === 'contact' && <ContactTab co={co} />}
          </motion.div>
        </AnimatePresence>

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-navy/8">
          <Link
            to="/finishing/companies"
            className="flex items-center gap-2 text-brand text-sm font-semibold hover:underline w-fit"
          >
            <ArrowRight size={14} /> العودة إلى دليل الشركات
          </Link>
        </div>
      </div>
    </div>
  );
}
