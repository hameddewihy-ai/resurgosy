import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalData } from '../context/GlobalContext';
import SponsorCard from '../components/ui/SponsorCard';
import {
  Scale, DollarSign, Map, Globe, TrendingUp,
  Clock, ChevronLeft, Search, X, Bell, AlertTriangle, Info,
  Building2, FileText,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import { useNews } from '../hooks/useNews';
import { CATEGORIES, URGENCY, SOURCES, getCategoryColor } from '../data/newsData';

const CAT_ICONS = {
  legal:    Scale,
  tax:      DollarSign,
  zoning:   Map,
  diaspora: Globe,
  market:   TrendingUp,
};

const URGENCY_ICONS = {
  urgent: AlertTriangle,
  high:   Bell,
  info:   Info,
};

const ALL_CATS = [{ id: 'all', label: 'الكل' }, ...CATEGORIES];

function ImpactTag({ label }) {
  return (
    <span className="text-[10px] border border-navy/15 text-charcoal/55 px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}

function AlertCard({ article, index, featured = false }) {
  const CatIcon     = CAT_ICONS[article.cat]    ?? FileText;
  const UrgIcon     = URGENCY_ICONS[article.urgency] ?? Info;
  const urgency     = URGENCY[article.urgency]  ?? URGENCY.info;
  const catColor    = getCategoryColor(article.cat);
  const sourceLabel = SOURCES[article.source]   ?? article.source;
  const isUrgent    = article.urgency === 'urgent';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link to={`/news/${article.id}`}
        className={`flex gap-4 p-5 rounded-2xl border-2 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 group block
          ${isUrgent ? 'border-red-200 bg-red-50/40 hover:border-red-300 hover:shadow-red-100/60' : 'border-navy/10 bg-white hover:border-brand/25 hover:shadow-navy/6'}`}>

        {/* Left urgency bar */}
        <div className="flex flex-col items-center gap-2 shrink-0 pt-0.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${urgency.color}`}>
            <UrgIcon size={15} />
          </div>
          <div className={`w-0.5 flex-1 rounded-full opacity-30 ${urgency.dot}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold ${catColor}`}>
                <CatIcon size={9} className="inline ml-1" />
                {CATEGORIES.find(c => c.id === article.cat)?.label}
              </span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${urgency.color}`}>
                {urgency.label}
              </span>
            </div>
            <span className="text-[10px] text-charcoal/40 flex items-center gap-1 shrink-0 mt-0.5">
              <Clock size={9} />
              {article.date}
            </span>
          </div>

          {/* Title */}
          <h3 className={`font-bold leading-snug mb-1.5 group-hover:text-brand transition-colors
            ${featured ? 'text-base' : 'text-sm'} ${isUrgent ? 'text-red-900' : 'text-navy'}`}>
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-charcoal/60 text-xs leading-relaxed mb-3 line-clamp-2">
            {article.summary}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {article.impacts?.map(imp => <ImpactTag key={imp} label={imp} />)}
              <span className="text-[10px] text-charcoal/35">• {sourceLabel}</span>
            </div>
            <span className="text-brand text-xs flex items-center gap-1 font-semibold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              التفاصيل <ChevronLeft size={11} />
            </span>
          </div>
        </div>

        {/* Featured image — only when available and featured */}
        {featured && article.image && (
          <div className="hidden sm:block w-28 h-24 rounded-xl overflow-hidden shrink-0">
            <img src={article.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}
      </Link>
    </motion.article>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5">
      <Icon size={15} className="text-brand/90 shrink-0" />
      <div>
        <p className="text-white font-black text-base leading-none">{value}</p>
        <p className="text-white/50 text-[10px] mt-0.5 leading-none">{label}</p>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const { articles } = useNews();
  const { sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const activeSponsor = sponsorships.find(s => s.type === 'news' && s.active);
  const published = articles.filter(a => a.status === 'published');

  const [cat,      setCat]      = useState('all');
  const [urgency,  setUrgency]  = useState('all');
  const [search,   setSearch]   = useState('');

  const filtered = useMemo(() => {
    let r = cat === 'all' ? published : published.filter(a => a.cat === cat);
    if (urgency !== 'all') r = r.filter(a => a.urgency === urgency);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    const order = { urgent: 0, high: 1, info: 2 };
    return [...r].sort((a, b) => (order[a.urgency] ?? 2) - (order[b.urgency] ?? 2));
  }, [published, cat, urgency, search]);

  const pinned = filtered.filter(a => a.urgency === 'urgent');
  const rest   = filtered.filter(a => a.urgency !== 'urgent');

  const urgentCount = published.filter(a => a.urgency === 'urgent').length;
  const legalCount  = published.filter(a => a.cat === 'legal' || a.cat === 'tax').length;

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="لوحة التنبيهات التشريعية والعقارية — RESURGO"
        description="تنبيهات قانونية وضريبية وعقارية محدّثة للسوق السوري. إصلاحات الضرائب، قرارات المحاكم، تعديلات المخططات، ومستجدات المغتربين."
        path="/news"
      />

      <PageHero
        num="07"
        eyebrow="لوحة التنبيهات"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            تنبيهات قانونية<br />
            <span className="text-brand">وعقارية محدّثة.</span>
          </h1>
        }
        subtitle="قرارات وزارة المالية · أحكام المحاكم · تعديلات المخططات · مستجدات المغتربين"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'التنبيهات' }]}
      >
        <div className="flex flex-col gap-4">
          {/* Stats */}
          <div className="flex flex-wrap gap-2">
            <StatPill icon={AlertTriangle} label="تنبيه عاجل" value={urgentCount} />
            <StatPill icon={Scale}         label="قانوني وضريبي" value={legalCount} />
            <StatPill icon={Building2}     label="تنبيه هذا الشهر" value={published.length} />
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث في التنبيهات..."
              className="w-full bg-white/10 border border-white/15 rounded-xl pr-9 pl-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand/60"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                <X size={11} />
              </button>
            )}
          </div>
        </div>
      </PageHero>

      <div>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:pb-0">
            {ALL_CATS.map(({ id, label }) => {
              const Icon = CAT_ICONS[id] ?? Bell;
              return (
                <button key={id} onClick={() => setCat(id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium active:scale-[0.96] transition-all
                    ${cat === id ? 'bg-navy border-navy text-white shadow-sm' : 'border-navy/15 text-charcoal/60 bg-white hover:border-navy/30 hover:text-navy'}`}>
                  {id !== 'all' && <Icon size={11} />}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Urgency */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-x-visible sm:pb-0 sm:mr-auto">
            {[['all','الكل'], ['urgent','عاجل'], ['high','مهم'], ['info','معلومة']].map(([id, label]) => (
              <button key={id} onClick={() => setUrgency(id)}
                className={`shrink-0 px-3 py-1.5 rounded-xl border text-xs font-medium active:scale-[0.96] transition-all
                  ${urgency === id
                    ? id === 'urgent' ? 'bg-red-500 border-red-500 text-white shadow-sm shadow-red-200'
                    : id === 'high'   ? 'bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'bg-navy border-navy text-white shadow-sm'
                    : 'border-navy/15 text-charcoal/60 bg-white hover:border-navy/30 hover:text-navy'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-24 text-charcoal/40">
              <Bell size={40} className="mx-auto mb-3 opacity-25" />
              <p className="mb-3 text-sm">لا توجد تنبيهات تطابق الفلتر</p>
              <button onClick={() => { setCat('all'); setUrgency('all'); setSearch(''); }}
                className="text-brand text-sm hover:underline">إعادة تعيين</button>
            </motion.div>
          ) : (
            <motion.div key={cat + urgency + search} className="space-y-3">
              {/* Pinned urgent alerts */}
              {pinned.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> تنبيهات عاجلة
                  </p>
                  {pinned.map((a, i) => <AlertCard key={a.id} article={a} index={i} featured />)}
                </div>
              )}

              {/* Rest */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  {pinned.length > 0 && (
                    <p className="text-xs font-bold text-charcoal/50 flex items-center gap-1.5 pt-2">
                      <Bell size={12} /> تنبيهات أخرى
                    </p>
                  )}
                  {rest.map((a, i) => <AlertCard key={a.id} article={a} index={i} />)}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <SponsorCard
          sponsor={activeSponsor}
          onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
        />

        {/* Cross-link to clearing */}
        <div className="border border-brand/20 bg-brand/5 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-navy font-bold text-sm mb-1">تحتاج مساعدة في إجراء قانوني؟</p>
            <p className="text-charcoal/60 text-xs">فريق التخليص يستطيع إتمام وكالتك أو معاملة الإرث في 3 أيام عمل</p>
          </div>
          <Link to="/clearing"
            className="btn-cta text-xs py-2 px-4 whitespace-nowrap shrink-0">
            طلب خدمة
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
