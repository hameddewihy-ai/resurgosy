import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGlobalData } from '../context/GlobalContext';
import PageHero from '../components/PageHero';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import DeveloperProfileModal from '../components/developer/DeveloperProfileModal';
import ProjectDetailModal from '../components/developer/ProjectDetailModal';
import SponsorCard from '../components/ui/SponsorCard';
import { addNotification } from '../components/NotificationsPanel';
import { CROWD_PROJECTS } from '../data/crowdfundData';
import {
  Building2, MapPin, Star, BadgeCheck, TrendingUp, Users,
  Calendar, Home, Layers, Award, Shield, Clock, X,
  ChevronDown, Phone, CheckCircle, Briefcase, BarChart3,
  ArrowUpRight, Search, Grid3X3, List, Wrench,
  Scale, Flame, Target, HardHat, Eye,
} from 'lucide-react';

// ── Status style helpers ────────────────────────────────────────────────────
const STATUS_BADGE = {
  'قيد الإنشاء': 'bg-blue-50 text-blue-700 border-blue-200',
  'مكتمل':        'bg-green-50 text-green-700 border-green-200',
  'مخطط':         'bg-amber-50 text-amber-700 border-amber-200',
};
const PROGRESS_COLOR = {
  'قيد الإنشاء': 'bg-brand',
  'مكتمل':        'bg-green-500',
  'مخطط':         'bg-amber-400',
};

// ── Upcoming launches (hardcoded) ──────────────────────────────────────────
const UPCOMING = [
  {
    id: 'u1', name: 'برج دمشق الذكي', city: 'دمشق', type: 'تجاري سكني',
    expectedQ: 'Q3 2026', units: 200, priceFrom: 95000,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80',
  },
  {
    id: 'u2', name: 'منتجع اللاذقية البحري', city: 'اللاذقية', type: 'سياحي',
    expectedQ: 'Q1 2027', units: 80, priceFrom: 120000,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80',
  },
];

// ── Cross-platform links ───────────────────────────────────────────────────
const CROSS_LINKS = [
  { icon: Briefcase,  label: 'وظائف مشاريع الإعمار', desc: 'ابحث عن عمل في مشاريع التطوير', to: '/jobs',                color: 'emerald' },
  { icon: TrendingUp, label: 'استثمر في المشاريع',    desc: 'عوائد سنوية 15-27% على مشاريع موثّقة', to: '/invest',      color: 'brand'   },
  { icon: Layers,     label: 'تمويل جماعي',            desc: 'ابدأ بمبالغ صغيرة في مشاريع الإعمار', to: '/crowdfund',   color: 'violet'  },
  { icon: Wrench,     label: 'معدات الإنشاء',          desc: 'استئجار معدات ثقيلة لمشاريعك', to: '/equipment',          color: 'orange'  },
  { icon: Scale,      label: 'التخليص العقاري',        desc: 'تسوية قانونية للوحدات المباعة', to: '/clearing/dashboard', color: 'slate'   },
];

const CROSS_COLOR_CLASSES = {
  emerald: 'border-emerald-400 text-emerald-600 bg-emerald-50/40',
  brand:   'border-brand text-brand bg-brand/5',
  violet:  'border-violet-400 text-violet-600 bg-violet-50/40',
  orange:  'border-orange-400 text-orange-600 bg-orange-50/40',
  slate:   'border-slate-400 text-slate-600 bg-slate-50/40',
};

const BENEFITS = [
  { icon: TrendingUp, title: 'عرض مشاريعك لملايين الباحثين',  desc: 'وصول مباشر إلى قاعدة عملاء ضخمة تبحث عن الاستثمار العقاري في سوريا.', to: '/invest' },
  { icon: BadgeCheck, title: 'توثيق وشهادة موثوقية رقمية',   desc: 'شارة "مطور موثّق" وسمعة رقمية موثّقة تُميّزك عن المنافسين.', to: '/developers' },
  { icon: Shield,     title: 'منظومة قانونية متكاملة',        desc: 'خدمات التخليص العقاري وفرز الوحدات والعقود الإلكترونية في مكان واحد.', to: '/clearing/dashboard' },
  { icon: Users,      title: 'تواصل مباشر مع المستثمرين',     desc: 'وصول إلى شبكة مستثمرين VIP وصناديق عقارية لتمويل مشاريعك.', to: '/invest' },
  { icon: Award,      title: 'تقييم آلي لوحداتك',             desc: 'تقييم تلقائي متقدم لتسعير الوحدات بدقة وتحليل السوق.', to: '/valuation-request' },
  { icon: Clock,      title: 'إدارة مراحل البناء آنياً',       desc: 'لوحة تحكم متكاملة لتتبع نسب الإنجاز وإشعار المشترين.', to: '/developer/dashboard' },
];

// ── Inline TenderApplyModal ─────────────────────────────────────────────────
function TenderApplyModal({ tender, onClose }) {
  const [company, setCompany]   = useState('');
  const [spec,    setSpec]      = useState('');
  const [phone,   setPhone]     = useState('');
  const [budget,  setBudget]    = useState('');
  const [msg,     setMsg]       = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company || !phone) { toast.error('يرجى تعبئة اسم الشركة والهاتف'); return; }
    toast.success('تم إرسال عرضك — سيتواصل معك المطور');
    addNotification({
      id: 'tender-' + Date.now(), type: 'property', read: false,
      title: 'عرض مناقصة مُرسَل',
      body: `تم إرسال عرضك على مناقصة "${tender.title}"`,
      date: new Date().toISOString(), link: '/developers',
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-navy font-black text-base">تقديم عرض</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-navy/8 flex items-center justify-center hover:bg-navy/15 transition-colors">
            <X size={15} />
          </button>
        </div>
        <p className="text-charcoal/60 text-sm mb-4 bg-cream rounded-xl px-3 py-2.5">{tender.title}</p>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="اسم الشركة *"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={spec} onChange={e => setSpec(e.target.value)} placeholder="التخصص"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الهاتف *"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={budget} onChange={e => setBudget(e.target.value)} placeholder="الميزانية المقترحة ($)"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="رسالة للمطور (اختياري)" rows={3}
            className="bg-cream border border-navy/12 rounded-xl px-4 py-2.5 text-sm text-navy focus:outline-none focus:border-brand transition-colors resize-none" />
          <button type="submit" className="bg-brand hover:bg-navy text-white font-bold py-3 rounded-xl text-sm transition-colors">
            إرسال العرض
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ── Developer Card ──────────────────────────────────────────────────────────
function DeveloperCard({ dev, index, onViewProfile }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
      style={{ borderRadius: '8px' }}
      onClick={() => onViewProfile(dev)}
    >
      {/* Cover image */}
      <div className="relative h-32 overflow-hidden">
        {dev.coverImage ? (
          <img src={dev.coverImage} alt={dev.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: dev.color }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />

        {/* Badges */}
        {dev.verified && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/20 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            <BadgeCheck size={10} className="text-brand" /> موثّق
          </div>
        )}
        {dev.rating >= 4.8 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-yellow-400/90 text-navy text-[10px] font-black px-2 py-1 rounded-full">
            <Award size={10} /> Top Dev
          </div>
        )}

        {/* Initials circle */}
        <div
          className="absolute bottom-0 translate-y-1/2 right-4 w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg border-3 border-white"
          style={{ backgroundColor: dev.color, borderWidth: 3 }}
        >
          {dev.initials}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-navy font-bold text-sm leading-snug truncate">{dev.name}</h3>
            <div className="flex items-center gap-1 text-charcoal/50 text-xs mt-0.5">
              <MapPin size={9} /> {dev.city}
              <span className="text-navy/20">·</span>
              منذ {dev.founded}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={9} className={i < Math.floor(dev.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />
              ))}
            </div>
            <span className="text-charcoal/40 text-[10px] mt-0.5">{dev.rating}</span>
          </div>
        </div>

        {/* Specialty */}
        <div className="flex gap-1.5 flex-wrap mt-2.5">
          {dev.specialty.map(s => (
            <span key={s} className="text-[10px] bg-brand/8 text-brand border border-brand/15 px-2 py-0.5 rounded-full font-medium">{s}</span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-navy/[0.07]">
          {[
            { label: 'مشروع', value: dev.projectsCount },
            { label: 'مكتمل', value: dev.completedCount },
            { label: 'وحدة',  value: dev.totalUnits?.toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-navy font-black text-base leading-none"
                style={{ fontFamily: "'Bebas Neue', Impact, sans-serif" }}>
                {value}
              </p>
              <p className="text-charcoal/35 text-[9px] font-bold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-3" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => onViewProfile(dev)}
            className="py-2 rounded-xl bg-brand text-white text-[11px] font-bold hover:bg-navy transition-colors">
            عرض الملف الكامل
          </button>
          <Link
            to="/jobs"
            className="py-2 rounded-xl border border-navy/15 text-navy text-[11px] font-bold hover:border-brand/40 hover:text-brand transition-colors text-center">
            الوظائف المتاحة
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Project Grid Card ───────────────────────────────────────────────────────
function ProjectGridCard({ project, index, onViewDetail }) {
  const availPct = Math.round((project.availableUnits / project.totalUnits) * 100);
  const isUrgent = project.availableUnits > 0 && project.availableUnits < 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all duration-300 hover:-translate-y-1 group"
      style={{ borderRadius: '8px' }}
    >
      <div className="relative h-44 overflow-hidden">
        <img src={project.image} alt={project.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/10 to-transparent" />

        <span className={`absolute top-3 right-3 text-[10px] px-2.5 py-1 rounded-full font-bold border ${STATUS_BADGE[project.status]}`}>
          {project.status}
        </span>

        {isUrgent && (
          <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-bold bg-red-500/90 text-white">
            <Flame size={9} /> آخر {project.availableUnits}
          </span>
        )}

        {/* Progress */}
        <div className="absolute bottom-0 inset-x-0 px-3 pb-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white/70 text-[10px]">نسبة الإنجاز</span>
            <span className="text-white font-bold text-xs">{project.progress}%</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${project.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className={`h-full rounded-full ${PROGRESS_COLOR[project.status]}`}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-navy font-bold text-sm leading-snug mb-0.5">{project.name}</h3>
        <p className="text-charcoal/50 text-[10px] mb-3">{project.developerName}</p>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-charcoal/60 text-xs">
            <MapPin size={9} className="text-brand shrink-0" />
            <span className="truncate">{project.city} · {project.district}</span>
          </div>
          <div className="flex items-center gap-1.5 text-charcoal/60 text-xs">
            <Calendar size={9} className="text-brand shrink-0" />
            <span>{project.delivery}</span>
          </div>
        </div>

        {/* Availability bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-charcoal/50 text-[10px]">الوحدات المتاحة</span>
            <span className={`text-[10px] font-semibold ${project.availableUnits === 0 ? 'text-red-500' : 'text-green-600'}`}>
              {project.availableUnits} / {project.totalUnits}
            </span>
          </div>
          <div className="h-1 bg-navy/8 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${availPct}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`h-full rounded-full ${availPct > 50 ? 'bg-green-400' : availPct > 20 ? 'bg-amber-400' : 'bg-red-400'}`}
            />
          </div>
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {project.features?.slice(0, 3).map(f => (
            <span key={f} className="flex items-center gap-1 text-[10px] bg-cream text-charcoal/60 px-2 py-0.5 rounded-full border border-navy/8">
              <CheckCircle size={8} className="text-brand" /> {f}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-navy/[0.07]">
          <div>
            <p className="text-charcoal/40 text-[10px]">يبدأ من</p>
            <p className="text-navy font-black text-sm">{project.priceFrom?.toLocaleString()} $</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetail(project)}
              className="flex items-center gap-1.5 text-xs bg-brand text-white px-3 py-2 rounded-xl font-semibold hover:bg-navy transition-colors">
              <Eye size={11} /> التفاصيل
            </button>
            {(() => {
              const cp = CROWD_PROJECTS.find(c => c.developerId === project.developerId && c.status === 'active');
              if (cp) return (
                <Link to={`/crowdfund/${cp.id}`}
                  className="flex items-center gap-1 text-xs border border-violet-400/40 text-violet-600 px-3 py-2 rounded-xl font-semibold hover:bg-violet-500/5 transition-colors">
                  <TrendingUp size={11} /> تمويل جماعي
                </Link>
              );
              if (project.investProjectId) return (
                <Link to="/invest"
                  className="flex items-center gap-1 text-xs border border-brand/25 text-brand px-3 py-2 rounded-xl font-semibold hover:bg-brand/5 transition-colors">
                  <TrendingUp size={11} /> استثمر
                </Link>
              );
              return (
                <button
                  onClick={() => toast('تواصل مع المطوّر للاستفسار', { icon: '📞' })}
                  className="flex items-center gap-1 text-xs border border-navy/15 text-navy/60 px-3 py-2 rounded-xl font-semibold hover:border-brand/30 hover:text-brand transition-colors">
                  <Phone size={11} /> استثمر
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Project List Row ────────────────────────────────────────────────────────
function ProjectListRow({ project, onViewDetail }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-4 p-4 bg-white shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] transition-all duration-200"
      style={{ borderRadius: '8px' }}
    >
      <div className="w-16 h-14 rounded-xl overflow-hidden shrink-0">
        <img src={project.image} alt={project.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-navy font-bold text-sm truncate">{project.name}</h4>
        <p className="text-charcoal/50 text-xs truncate">{project.developerName}</p>
        <div className="flex items-center gap-3 mt-1 text-charcoal/50 text-xs">
          <span className="flex items-center gap-1"><MapPin size={9} />{project.city}</span>
          <span className="flex items-center gap-1"><Calendar size={9} />{project.delivery}</span>
        </div>
      </div>
      <div className="shrink-0 text-left flex flex-col items-end gap-1.5">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STATUS_BADGE[project.status]}`}>
          {project.status}
        </span>
        <p className="text-navy font-black text-sm">{project.priceFrom?.toLocaleString()} $</p>
      </div>
      <button
        onClick={() => onViewDetail(project)}
        className="shrink-0 bg-brand hover:bg-navy text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
      >
        <Eye size={12} /> عرض
      </button>
    </motion.div>
  );
}

// ── Tender Card ─────────────────────────────────────────────────────────────
function TenderCard({ tender, index, onApply }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] hover:-translate-y-1 transition-all duration-200 flex flex-col gap-3"
      style={{ borderRadius: '8px' }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[10px] bg-brand/8 text-brand border border-brand/20 px-2.5 py-1 rounded-full font-bold">
          {tender.type}
        </span>
        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
          tender.status === 'مفتوح' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {tender.status}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="text-navy font-bold text-sm leading-snug">{tender.title}</h3>
        <p className="text-charcoal/50 text-xs mt-0.5">{tender.developerName}</p>
      </div>

      {/* Budget */}
      <p className="text-brand font-black text-xl leading-none"
        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.03em' }}>
        {tender.budget}
      </p>

      {/* Info */}
      <div className="flex items-center gap-3 text-charcoal/50 text-xs">
        <span className="flex items-center gap-1"><MapPin size={10} />{tender.city} — {tender.district}</span>
        <span className="flex items-center gap-1"><Calendar size={10} />{tender.closingDate}</span>
      </div>

      {/* Desc */}
      <p className="text-charcoal/60 text-xs leading-relaxed line-clamp-2">{tender.desc}</p>

      {/* Requirements chips */}
      <div className="flex flex-wrap gap-1.5">
        {tender.requirements?.slice(0, 2).map(r => (
          <span key={r} className="text-[10px] bg-cream text-charcoal/60 border border-navy/10 px-2 py-0.5 rounded-full">{r}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-navy/8 mt-auto">
        <span className="text-charcoal/40 text-xs flex items-center gap-1">
          <Users size={11} /> {tender.bidsCount} عرض مقدَّم
        </span>
        <button
          onClick={() => tender.status === 'مغلق'
            ? toast.error('انتهى موعد تقديم هذه المناقصة')
            : onApply(tender)
          }
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${
            tender.status === 'مغلق'
              ? 'bg-navy/8 text-charcoal/40 cursor-not-allowed'
              : 'bg-brand text-white hover:bg-navy'
          }`}
        >
          <HardHat size={12} /> تقديم عرض
        </button>
      </div>
    </motion.div>
  );
}

// ── Registration Modal (CTA) ────────────────────────────────────────────────
function RegisterDeveloperModal({ onClose }) {
  const [company, setCompany]   = useState('');
  const [city,    setCity]      = useState('');
  const [count,   setCount]     = useState('');
  const [phone,   setPhone]     = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!company || !phone) { toast.error('يرجى تعبئة الحقول المطلوبة'); return; }
    toast.success('طلبك قيد المعالجة — سيتواصل معك فريقنا قريباً');
    addNotification({
      id: 'dev-reg-' + Date.now(), type: 'property', read: false,
      title: 'طلب تسجيل مطور مُرسَل',
      body: `تم استلام طلب تسجيل شركة "${company}"`,
      date: new Date().toISOString(), link: '/developers',
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6"
        dir="rtl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-navy font-black text-lg">طلب تسجيل مطور</h3>
            <p className="text-charcoal/50 text-xs mt-0.5">سيتواصل معك فريق RESURGO خلال 48 ساعة</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-navy/8 flex items-center justify-center hover:bg-navy/15 transition-colors">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <input value={company} onChange={e => setCompany(e.target.value)} placeholder="اسم الشركة *"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={city} onChange={e => setCity(e.target.value)} placeholder="المدينة"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={count} onChange={e => setCount(e.target.value)} placeholder="عدد المشاريع المنجزة"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="رقم الهاتف *"
            className="bg-cream border border-navy/12 rounded-xl px-4 py-3 text-sm text-navy focus:outline-none focus:border-brand transition-colors" />
          <button type="submit" className="bg-brand hover:bg-navy text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
            <Building2 size={15} /> إرسال الطلب
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function DevelopersPage() {
  const { developers, projects, jobs, tenders, marketData, sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const activeSponsor = sponsorships.find(s => s.type === 'developers' && s.active);
  const projectsSectionRef = useRef(null);

  // Developer modal
  const [selectedDev,    setSelectedDev]    = useState(null);
  const [showDevModal,   setShowDevModal]   = useState(false);

  // Project modal
  const [selectedProject,    setSelectedProject]    = useState(null);
  const [showProjectModal,   setShowProjectModal]   = useState(false);

  // Tender apply modal
  const [selectedTender, setSelectedTender] = useState(null);

  // Registration modal
  const [showRegModal,   setShowRegModal]   = useState(false);

  // Project filters
  const [viewMode,       setViewMode]       = useState('grid');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [filterStatus,   setFilterStatus]   = useState('all');
  const [filterCity,     setFilterCity]     = useState('all');
  const [filterType,     setFilterType]     = useState('all');

  // Tender filters
  const [tenderStatus,   setTenderStatus]   = useState('all');

  const ALL_CITIES   = [
    'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
    'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
  ];
  const ALL_TYPES    = useMemo(() => [...new Set(projects.map(p => p.type))], [projects]);
  const ALL_STATUSES = ['قيد الإنشاء', 'مكتمل', 'مخطط'];

  const filteredProjects = useMemo(() => {
    let r = projects;
    if (searchQuery)          r = r.filter(p => p.name.includes(searchQuery) || p.developerName.includes(searchQuery) || p.city.includes(searchQuery));
    if (filterStatus !== 'all') r = r.filter(p => p.status === filterStatus);
    if (filterCity   !== 'all') r = r.filter(p => p.city === filterCity);
    if (filterType   !== 'all') r = r.filter(p => p.type === filterType);
    return r;
  }, [searchQuery, filterStatus, filterCity, filterType, projects]);

  const filteredTenders = useMemo(() => {
    if (tenderStatus === 'all') return tenders;
    return tenders.filter(t => t.status === tenderStatus);
  }, [tenderStatus, tenders]);

  const hasFilters = searchQuery || filterStatus !== 'all' || filterCity !== 'all' || filterType !== 'all';
  const resetFilters = () => { setSearchQuery(''); setFilterStatus('all'); setFilterCity('all'); setFilterType('all'); };

  // Computed hero stats
  const totalUnits = projects.reduce((s, p) => s + (p.totalUnits || 0), 0);
  const deliveredUnits = projects.filter(p => p.status === 'مكتمل').reduce((s, p) => s + (p.totalUnits || 0), 0);

  const HERO_STATS = [
    { label: 'مطور عقاري',    value: `${developers.length}+`,                  icon: Building2 },
    { label: 'مشروع نشط',    value: `${projects.length}+`,                     icon: Layers    },
    { label: 'وحدة متاحة',   value: `${totalUnits.toLocaleString()}+`,          icon: Home      },
    { label: 'وحدة مُسلَّمة', value: `${deliveredUnits.toLocaleString()}+`,     icon: Award     },
  ];

  const openDevProfile  = (dev)  => { setSelectedDev(dev);     setShowDevModal(true);    };
  const openProjectDetail = (proj) => { setSelectedProject(proj); setShowProjectModal(true); };

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="بوابة المطورين العقاريين"
        description="اكتشف أبرز المطورين العقاريين في سوريا ومشاريعهم السكنية والتجارية والسياحية."
        path="/developers"
      />

      {/* ── PageHero ─────────────────────────────────────────────────────── */}
      <PageHero
        num="08"
        eyebrow="المطورون العقاريون"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            بوابة المطورين<br />
            <span className="text-brand">العقاريين.</span>
          </h1>
        }
        subtitle="اعرض مشروعك وتواصل مباشرة مع المستثمرين والمشترين — من الخطة الأولى حتى لحظة التسليم"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'المطورون' }]}
      >
        <div className="flex flex-wrap gap-3 mt-2">
          {HERO_STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 backdrop-blur-sm">
              <Icon size={14} className="text-brand" />
              <span className="text-white font-black text-base leading-none">{value}</span>
              <span className="text-white/60 text-xs">{label}</span>
            </div>
          ))}
        </div>
      </PageHero>

      {/* ── Market Intelligence Strip ─────────────────────────────────────── */}
      {marketData?.pricePerSqm && (
        <div className="bg-navy overflow-x-auto">
          <div className="flex items-stretch gap-0 min-w-max">
            <div className="flex items-center gap-2 px-5 py-3 border-l border-white/10 shrink-0">
              <BarChart3 size={15} className="text-brand" />
              <span className="text-white/70 text-xs font-bold whitespace-nowrap">أسعار السوق $/م²</span>
            </div>
            {marketData.pricePerSqm.map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3 border-l border-white/10 shrink-0">
                <div>
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider">{row.city}</p>
                  <p className="text-white font-black text-sm leading-none mt-0.5">{row.residential} $</p>
                  <p className="text-white/40 text-[10px]">سكني</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black flex items-center gap-0.5 ${row.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendingUp size={11} />
                    {row.trend >= 0 ? '+' : ''}{row.trend}%
                  </p>
                  <div className="mt-1 h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand/70 rounded-full" style={{ width: `${Math.min(100, row.residential / 10)}%` }} />
                  </div>
                </div>
              </div>
            ))}
            <Link
              to="/valuation-request"
              className="flex items-center gap-2 px-5 py-3 bg-brand/20 hover:bg-brand/30 transition-colors shrink-0 text-brand text-xs font-bold whitespace-nowrap"
            >
              <Target size={13} />
              احصل على تقييم
              <ArrowUpRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* ── Featured Developers ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pt-14 pb-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">شركاؤنا</p>
            <h2 className="text-navy font-black text-2xl">المطورون المميزون</h2>
          </div>
          <button
            onClick={() => projectsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs text-brand hover:text-navy border border-brand/20 hover:border-navy/20 px-4 py-2 rounded-xl transition-colors font-medium">
            عرض الكل
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {developers.map((dev, i) => (
            <DeveloperCard
              key={dev.id}
              dev={dev}
              index={i}
              onViewProfile={openDevProfile}
              onViewJobs={() => {}}
            />
          ))}
        </div>
      </section>

      {/* ── Sponsor ──────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4">
        <SponsorCard
          sponsor={activeSponsor}
          onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
        />
      </div>

      {/* ── Projects Section ─────────────────────────────────────────────── */}
      <section ref={projectsSectionRef} className="max-w-7xl mx-auto px-4 py-10">
        {/* Heading + view toggle */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">استكشف</p>
            <h2 className="text-navy font-black text-2xl">المشاريع العقارية</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-charcoal/50 text-xs">
              <span className="font-bold text-navy">{filteredProjects.length}</span> مشروع
            </span>
            <div className="flex gap-1 p-1 bg-white rounded-xl border border-navy/8">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand text-white' : 'text-charcoal/40 hover:text-navy'}`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand text-white' : 'text-charcoal/40 hover:text-navy'}`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-white border border-navy/[0.08] rounded-xl">
          {/* Search */}
          <div className="relative flex-1 min-w-44">
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المشروع أو المطور..."
              className="w-full bg-white border border-navy/12 rounded-xl pr-9 pl-4 py-2 text-xs text-navy placeholder-charcoal/35 focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="w-px h-6 bg-navy/10 hidden sm:block" />

          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', ...ALL_STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterStatus === s ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/30 hover:text-brand'}`}>
                {s === 'all' ? 'الكل' : s}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-navy/10 hidden sm:block" />

          {/* City select */}
          <div className="relative">
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)}
              className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none focus:border-brand cursor-pointer">
              <option value="all">كل المدن</option>
              {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          </div>

          {/* Type select */}
          <div className="relative">
            <select value={filterType} onChange={e => setFilterType(e.target.value)}
              className="bg-white border border-navy/15 rounded-xl pr-3 pl-7 py-1.5 text-xs text-navy appearance-none focus:outline-none focus:border-brand cursor-pointer">
              <option value="all">كل الأنواع</option>
              {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          </div>

          {hasFilters && (
            <button onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-charcoal/50 hover:text-red-500 transition-colors mr-auto">
              <X size={12} /> إعادة تعيين
            </button>
          )}
        </div>

        {/* Project grid / list */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-20 text-charcoal/50">
              <Building2 size={40} className="mx-auto mb-3 opacity-30" />
              <p>لا توجد مشاريع تطابق معايير الفلتر</p>
              <button onClick={resetFilters} className="text-brand text-sm mt-3 hover:underline">إعادة تعيين</button>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div key="grid" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProjects.map((p, i) => (
                <ProjectGridCard key={p.id} project={p} index={i} onViewDetail={openProjectDetail} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" className="flex flex-col gap-3">
              {filteredProjects.map(p => (
                <ProjectListRow key={p.id} project={p} onViewDetail={openProjectDetail} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Tenders Board ────────────────────────────────────────────────── */}
      <section className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">المناقصات</p>
              <h2 className="text-navy font-black text-2xl">لوحة مناقصات الإنشاء</h2>
            </div>
            <div className="flex gap-2">
              {['all', 'مفتوح', 'مغلق'].map(s => (
                <button key={s} onClick={() => setTenderStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${tenderStatus === s ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/60 hover:border-brand/30 hover:text-brand'}`}>
                  {s === 'all' ? 'الكل' : s}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTenders.map((t, i) => (
              <TenderCard key={t.id} tender={t} index={i} onApply={setSelectedTender} />
            ))}
          </div>

          {/* Contractor CTA */}
          <div className="mt-8 flex items-center justify-center">
            <Link
              to="/contractor/dashboard"
              className="flex items-center gap-2 border-2 border-brand/30 text-brand hover:bg-brand/5 font-bold text-sm px-6 py-3 rounded-xl transition-colors"
            >
              <HardHat size={16} />
              أنت مقاول؟ سجّل ملفك الاحترافي
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Cross-Platform Integration Strip ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-7">
          <p className="text-brand text-xs font-bold uppercase tracking-widest mb-1">التكامل</p>
          <h2 className="text-navy font-black text-2xl">RESURGO — منظومة متكاملة</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {CROSS_LINKS.map(({ icon: Icon, label, desc, to, color }) => (
            <Link
              key={to}
              to={to}
              className={`p-4 rounded-2xl border-t-4 bg-white hover:-translate-y-1 transition-all duration-200 hover:shadow-md group ${CROSS_COLOR_CLASSES[color]}`}
            >
              <Icon size={22} className="mb-3" />
              <p className="text-navy font-bold text-sm leading-snug mb-1">{label}</p>
              <p className="text-charcoal/50 text-xs leading-relaxed">{desc}</p>
              <ArrowUpRight size={13} className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Upcoming Launches ────────────────────────────────────────────── */}
      <section className="bg-navy py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 text-center">
            <span className="inline-block text-brand text-[10px] font-black tracking-[0.2em] uppercase border border-brand/30 px-3 py-1 rounded-full mb-3">
              ✦ قريباً
            </span>
            <h2 className="text-white font-black text-2xl">إطلاقات مقبلة</h2>
            <p className="text-white/50 text-sm mt-2">كن من أوائل المهتمين بالمشاريع الجديدة</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {UPCOMING.map((up, i) => (
              <motion.div
                key={up.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="rounded-2xl overflow-hidden border border-white/10 hover:border-brand/40 transition-all duration-200 group"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={up.image} alt={up.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
                  <span className="absolute top-3 right-3 text-[10px] bg-brand/90 text-white px-2.5 py-1 rounded-full font-bold">
                    {up.type}
                  </span>
                  <div className="absolute bottom-3 right-3 text-white">
                    <p className="font-black text-base leading-snug">{up.name}</p>
                    <p className="text-white/60 text-xs">{up.city}</p>
                  </div>
                </div>
                <div className="p-4 bg-navy/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-brand text-xs font-bold flex items-center gap-1">
                      <Calendar size={11} /> {up.expectedQ}
                    </span>
                    <span className="text-white/60 text-xs">{up.units} وحدة · من {up.priceFrom?.toLocaleString()} $</span>
                  </div>
                  <button
                    onClick={() => {
                      toast.success(`تم تسجيل اهتمامك بـ "${up.name}"`);
                      addNotification({
                        id: 'upcoming-' + Date.now(), type: 'property', read: false,
                        title: 'تسجيل اهتمام بمشروع قادم',
                        body: `تم تسجيل اهتمامك بـ "${up.name}" — ${up.city} — ${up.expectedQ}`,
                        date: new Date().toISOString(), link: '/developers',
                      });
                    }}
                    className="w-full bg-brand hover:bg-brand/90 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                  >
                    أبدِ اهتمامك
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits (2-col) ─────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Left: large visual */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-navy rounded-3xl p-10 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                  backgroundSize: '28px 28px',
                }}
              />
              <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-brand/15 blur-3xl" />
              <div className="relative">
                <p className="text-brand text-xs font-bold uppercase tracking-widest mb-6">بالأرقام</p>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  {[
                    { value: '47+',     label: 'مطور مسجّل' },
                    { value: '130+',    label: 'مشروع نشط' },
                    { value: '12,000+', label: 'وحدة مُسلَّمة' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-white font-black text-3xl leading-none"
                        style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.03em' }}>
                        {value}
                      </p>
                      <p className="text-white/40 text-xs mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowRegModal(true)}
                  className="bg-brand hover:bg-brand/90 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Building2 size={15} /> انضم الآن مجاناً
                </button>
              </div>
            </motion.div>

            {/* Right: benefit rows */}
            <div className="flex flex-col gap-4">
              {BENEFITS.map(({ icon: Icon, title, desc, to }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex gap-4 p-4 rounded-2xl border border-navy/8 hover:border-brand/25 hover:bg-cream/60 transition-all duration-200 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                    <Icon size={17} className="text-brand" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-navy font-bold text-sm mb-0.5">{title}</h3>
                    <p className="text-charcoal/60 text-xs leading-relaxed">{desc}</p>
                  </div>
                  <Link to={to} className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight size={15} className="text-brand" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-[#1f2a38] py-16">
        <div className="max-w-3xl mx-auto px-4 text-center" dir="rtl">
          <span className="inline-block text-brand text-[10px] font-black tracking-[0.2em] uppercase border border-brand/30 px-3 py-1 rounded-full mb-5">
            ✦ سجّل الآن مجاناً
          </span>
          <h2 className="text-white font-black text-2xl sm:text-3xl mb-4 leading-[1.4]">
            سجّل شركتك<br /><span className="text-brand">كمطور عقاري</span>
          </h2>
          <p className="text-white/50 text-sm max-w-lg mx-auto mb-10 leading-relaxed">
            انضم إلى أكثر من <strong className="text-white">47</strong> شركة تطوير عقاري تعرض مشاريعها على RESURGO وتصل إلى ملايين المشترين والمستثمرين في سوريا والمهجر
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowRegModal(true)}
              className="bg-brand hover:bg-brand/90 text-white px-8 py-3.5 rounded-xl text-sm font-black transition-all inline-flex items-center justify-center gap-2">
              <Building2 size={16} /> سجّل شركتك مجاناً
            </button>
            <a
              href="https://wa.me/963000000000?text=أودّ الاستفسار عن تسجيل شركتي كمطور عقاري على RESURGO"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-3.5 text-sm font-bold rounded-xl border border-white/15 text-white/80 hover:bg-white/[0.08] hover:text-white transition-all inline-flex items-center justify-center gap-2">
              <Phone size={16} /> تواصل مع الفريق
            </a>
          </div>
        </div>
      </section>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      <DeveloperProfileModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
        developer={selectedDev}
        projects={projects}
        jobs={jobs}
        onViewProject={(proj) => {
          setShowDevModal(false);
          setTimeout(() => openProjectDetail(proj), 200);
        }}
      />

      <ProjectDetailModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        project={selectedProject}
        allProjects={projects}
        onInvest={openProjectDetail}
      />

      <AnimatePresence>
        {selectedTender && (
          <TenderApplyModal
            key="tender-apply"
            tender={selectedTender}
            onClose={() => setSelectedTender(null)}
          />
        )}
        {showRegModal && (
          <RegisterDeveloperModal
            key="reg-modal"
            onClose={() => setShowRegModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
