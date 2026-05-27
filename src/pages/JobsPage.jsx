import { useGlobalData } from '../context/GlobalContext';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, Star, BadgeCheck,
  Clock, ChevronRight, Users, SlidersHorizontal,
  X, CheckCircle, MessageCircle, Building2, Award, Eye,
  Bookmark, BookmarkCheck, ClipboardList,
  Copy, Share2, Bell, Activity,
  LayoutGrid, List, Flame, TrendingUp, Truck,
} from 'lucide-react';
import EmptyState from '../components/ui/EmptyState';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import { sendAdminAlert } from '../utils/emailService';
import { addNotification } from '../components/NotificationsPanel';
import { CROWD_PROJECTS } from '../data/crowdfundData';
import EngineerProfileModal from '../components/jobs/EngineerProfileModal';
import AtsDashboardModal from '../components/jobs/AtsDashboardModal';
import PostJobModal from '../components/jobs/PostJobModal';
import SponsorCard from '../components/ui/SponsorCard';

const APPS_KEY   = 'resurgo-job-apps';
const SAVED_KEY  = 'resurgo-saved-jobs';
const ALERTS_KEY = 'resurgo-job-alerts';
const RECENT_KEY = 'resurgo-recent-jobs';

const SPECS  = ['الكل','إنشائي','معماري','مدني','كهربائي','تقدير','إشراف','ميكانيك','مساحة','مدير مشاريع','مصمم داخلي','سلامة','BIM','محاسب مشاريع'];
const CITIES = [
  'الكل', 'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];
const TYPES  = ['الكل','دوام كامل','نصف دوام','عن بعد','فريلانس'];

const SALARY_BRACKETS = [
  { label: 'أي راتب', value: 0 },
  { label: '+500 $',   value: 500 },
  { label: '+800 $',   value: 800 },
  { label: '+1,000 $', value: 1000 },
  { label: '+1,500 $', value: 1500 },
];

const SORT_OPTIONS = [
  { value: 'newest',     label: 'الأحدث' },
  { value: 'salary',     label: 'الراتب الأعلى' },
  { value: 'applicants', label: 'الأكثر تقدماً' },
];

const EXP_OPTIONS = [0, 2, 5, 8, 10, 15];

// M3: spec→color map for the card accent bar
const SPEC_COLORS = {
  'إنشائي':       '#5979bb',
  'معماري':       '#f37124',
  'مدني':         '#6366f1',
  'كهربائي':      '#eab308',
  'تقدير':        '#14b8a6',
  'إشراف':        '#8b5cf6',
  'ميكانيك':      '#f97316',
  'مساحة':        '#10b981',
  'مدير مشاريع': '#3b82f6',
  'مصمم داخلي':  '#ec4899',
  'سلامة':        '#ef4444',
  'BIM':          '#06b6d4',
  'محاسب مشاريع':'#84cc16',
};

const parseSalary = s => parseInt((s || '').replace(/,/g, '').match(/\d+/)?.[0] ?? '0');

const loadSaved = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SAVED_KEY) || '[]')); }
  catch { return new Set(); }
};
const loadApplications = () => {
  try { return JSON.parse(localStorage.getItem(APPS_KEY) || '[]'); }
  catch { return []; }
};
const loadAlerts = () => {
  try { return JSON.parse(localStorage.getItem(ALERTS_KEY) || '[]'); }
  catch { return []; }
};
const loadRecent = () => {
  try { return new Set(JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]')); }
  catch { return new Set(); }
};
const addToRecent = (id) => {
  try {
    const prev = JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]');
    sessionStorage.setItem(RECENT_KEY, JSON.stringify([id, ...prev.filter(i => i !== id)].slice(0, 8)));
  } catch {}
};

// ── Animated Counter — IntersectionObserver, scroll-triggered ─────────────────
function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const elRef = useRef(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el || !target) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const inc = Math.ceil(target / 55);
      const timer = setInterval(() => {
        cur = Math.min(cur + inc, target);
        setCount(cur);
        if (cur >= target) clearInterval(timer);
      }, 18);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={elRef}>{count}{suffix}</span>;
}

// ── Job Card (grid view) — M3 ─────────────────────────────────────────────────
function JobCard({ job, index, onSelect, selected, isSaved, onToggleSave, isRecent }) {
  const specColor = SPEC_COLORS[job.spec] || '#5979bb';
  const isSelected = selected?.id === job.id;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: Math.min(index * 0.045, 0.35) }}
      onClick={() => onSelect(job)}
      className="bg-white p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] relative overflow-hidden"
      style={{
        borderRadius: '8px',
        ...(isSelected ? { boxShadow: `0 8px 32px ${specColor}22, 0 0 0 1.5px ${specColor}60` } : {}),
      }}
    >
      {/* Spec color bar — horizontal top */}
      <div
        className="absolute top-0 inset-x-0 h-[3px] z-10"
        style={{ background: specColor }}
      />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-navy font-bold text-sm">{job.title}</h3>
            {job.urgent && (
              <span className="flex items-center gap-0.5 text-[10px] bg-cta text-white px-2 py-0.5 rounded-full font-bold shrink-0 shadow-sm shadow-cta/30">
                <Flame size={8} /> عاجل
              </span>
            )}
            {isRecent && (
              <span className="text-[9px] bg-navy/8 text-charcoal/45 px-1.5 py-0.5 rounded-full shrink-0">شاهدته</span>
            )}
          </div>
          <p className="text-charcoal/60 text-xs flex items-center gap-1">
            <Building2 size={11} />{job.company}
          </p>
        </div>
        <div className="shrink-0 text-left">
          <p className="text-brand font-black text-sm">{job.salary}</p>
          <p className="text-charcoal/50 text-[10px]">/شهرياً</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-charcoal/50 text-xs mb-3 flex-wrap">
        <span className="flex items-center gap-1"><MapPin size={11} />{job.city}</span>
        <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium
          ${job.type === 'عن بعد' ? 'bg-brand/10 text-brand' :
            job.type === 'فريلانس' ? 'bg-cta/10 text-cta' :
            job.type === 'نصف دوام' ? 'bg-emerald-50 text-emerald-600' :
            'bg-navy/5 text-navy/60'}`}>
          {job.type}
        </span>
        <span className="flex items-center gap-1"><Clock size={11} />{job.posted}</span>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-3">
        {job.skills.slice(0, 3).map(sk => (
          <span key={sk} className="text-[10px] bg-cream border border-navy/10 text-charcoal/60 px-2 py-0.5 rounded-full">{sk}</span>
        ))}
        {job.skills.length > 3 && <span className="text-[10px] text-charcoal/50">+{job.skills.length - 3}</span>}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-charcoal/50 flex items-center gap-1"><Users size={11} />{job.applicants} متقدم</span>
        <div className="flex items-center gap-3">
          <button
            onClick={e => { e.stopPropagation(); onToggleSave(job.id); }}
            className={`transition-all ${isSaved ? 'text-brand' : 'text-charcoal/30 hover:text-brand'}`}
            title={isSaved ? 'إلغاء الحفظ' : 'حفظ الوظيفة'}>
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
          <span className="text-brand flex items-center gap-1 font-medium">
            تقدّم الآن <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Job Row (compact list view) ───────────────────────────────────────────────
function JobRow({ job, index, onSelect, selected, isSaved, onToggleSave, isRecent }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.25) }}
      onClick={() => onSelect(job)}
      className={`bg-white px-5 py-3.5 cursor-pointer transition-all shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.11)] ${selected?.id === job.id ? 'ring-1 ring-brand/40' : ''}`}
      style={{ borderRadius: '8px' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h3 className="text-navy font-bold text-sm">{job.title}</h3>
            {job.urgent && <span className="text-[9px] bg-cta/15 text-cta px-1.5 py-0.5 rounded-full font-bold shrink-0">عاجل</span>}
            {isRecent && <span className="text-[9px] bg-navy/8 text-charcoal/40 px-1.5 py-0.5 rounded-full shrink-0">شاهدته</span>}
          </div>
          <p className="text-charcoal/55 text-xs flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-0.5"><Building2 size={10} />{job.company}</span>
            <span className="flex items-center gap-0.5"><MapPin size={10} />{job.city}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium
              ${job.type === 'عن بعد' ? 'bg-brand/10 text-brand' : job.type === 'فريلانس' ? 'bg-cta/10 text-cta' : 'bg-navy/5 text-navy/60'}`}>
              {job.type}
            </span>
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-3">
          <div className="hidden sm:flex gap-1 flex-wrap max-w-[120px]">
            {job.skills.slice(0, 2).map(sk => (
              <span key={sk} className="text-[9px] bg-cream border border-navy/8 text-charcoal/55 px-1.5 py-0.5 rounded">{sk}</span>
            ))}
          </div>
          <div className="text-left">
            <p className="text-brand font-black text-sm">{job.salary}</p>
            <p className="text-charcoal/40 text-[9px]">/شهرياً</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggleSave(job.id); }}
            className={`transition-all shrink-0 ${isSaved ? 'text-brand' : 'text-charcoal/25 hover:text-brand'}`}>
            {isSaved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Job Detail Panel ──────────────────────────────────────────────────────────
function JobDetail({ job, onClose, onApplied, jobs, onSelectSimilar }) {
  const { pushCrossHint } = useGlobalData();
  const { user } = useAuth();
  const [applied, setApplied] = useState(false);
  const [copied, setCopied]   = useState(false);

  if (!job) return (
    <div className="bg-white p-10 flex flex-col items-center justify-center text-center h-full min-h-64"
      style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
      <Briefcase size={36} className="text-charcoal/30 mb-3" />
      <p className="text-charcoal/60 text-sm">اختر وظيفة لعرض التفاصيل</p>
    </div>
  );

  const daysAgo       = Math.max(0, Math.floor((Date.now() - new Date(job.posted).getTime()) / 86400000));
  const activityLabel = daysAgo === 0 ? 'اليوم' : daysAgo < 7 ? `منذ ${daysAgo} أيام` : `منذ ${Math.floor(daysAgo / 7)} أسبوع`;
  const responseRate  = job.applicants > 20 ? 'استجابة سريعة' : job.applicants > 10 ? 'استجابة متوسطة' : 'وظيفة حديثة';
  const responseColor = job.applicants > 20 ? 'text-emerald-600' : job.applicants > 10 ? 'text-amber-600' : 'text-brand';
  const similarJobs   = (jobs || []).filter(j => j.id !== job.id && j.spec === job.spec).slice(0, 3);

  const copyJob = () => {
    const text = `وظيفة: ${job.title}\nالشركة: ${job.company} — ${job.city}\nالراتب: ${job.salary}/شهرياً\nالمهارات: ${job.skills.join('، ')}\n\nعبر منصة RESURGO`;
    navigator.clipboard.writeText(text)
      .then(() => { setCopied(true); toast.success('تم نسخ بيانات الوظيفة'); setTimeout(() => setCopied(false), 2000); })
      .catch(() => toast.error('تعذّر النسخ'));
  };

  return (
    <div className="bg-white p-6 sticky top-20 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]"
      style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-navy font-black text-lg leading-snug mb-1">{job.title}</h2>
          <p className="text-charcoal/60 text-sm flex items-center gap-1"><Building2 size={13} />{job.company}</p>
        </div>
        <button onClick={onClose} className="text-charcoal/40 hover:text-navy transition-colors shrink-0 mt-1"><X size={18} /></button>
      </div>

      <div className="flex items-center gap-2 flex-wrap bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5 text-xs">
        <span className="flex items-center gap-1 text-emerald-700 font-medium"><Activity size={11} /> نُشر {activityLabel}</span>
        <span className="text-emerald-300">|</span>
        <span className="flex items-center gap-1 text-charcoal/60"><Users size={11} /> {job.applicants} متقدم</span>
        <span className="text-emerald-300">|</span>
        <span className={`font-bold ${responseColor}`}>{responseRate}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[[MapPin, job.city, 'المدينة'], [Briefcase, job.type, 'نوع الدوام'],
          [Clock, job.posted, 'تاريخ النشر'], [Users, `${job.applicants} متقدم`, 'المتقدمون']].map(([Icon, val, label]) => (
          <div key={label} className="bg-cream rounded-xl p-3">
            <Icon size={13} className="text-brand mb-1" />
            <p className="text-navy font-bold text-sm">{val}</p>
            <p className="text-charcoal/50 text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div>
        <p className="text-navy font-bold text-sm mb-1">الراتب</p>
        <p className="text-brand font-black text-xl">{job.salary} <span className="text-charcoal/60 text-sm font-normal">/شهرياً</span></p>
      </div>

      <div>
        <p className="text-navy font-bold text-sm mb-2">الوصف الوظيفي</p>
        <p className="text-charcoal/60 text-sm leading-relaxed">{job.desc}</p>
      </div>

      <div>
        <p className="text-navy font-bold text-sm mb-2">المهارات المطلوبة</p>
        <div className="flex flex-wrap gap-1.5">
          {job.skills.map(sk => (
            <span key={sk} className="flex items-center gap-1 text-xs bg-brand/10 border border-brand/25 text-brand px-2.5 py-1 rounded-full">
              <CheckCircle size={10} />{sk}
            </span>
          ))}
        </div>
      </div>

      {(() => {
        const cp = CROWD_PROJECTS.find(p =>
          p.status === 'active' && (
            p.developer.includes(job.company.split(' ')[0]) ||
            job.company.includes(p.developer.split(' ')[0])
          )
        );
        return cp ? (
          <Link to={`/crowdfund/${cp.id}`}
            className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/20 rounded-xl hover:bg-brand/10 transition-colors">
            <TrendingUp size={14} className="text-brand shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-brand">هذه الشركة لديها مشروع مفتوح للتمويل الجماعي</p>
              <p className="text-[10px] text-charcoal/55 truncate">{cp.title} — {cp.expectedAnnualReturn}% عائد سنوي</p>
            </div>
            <ChevronRight size={13} className="text-brand/60 shrink-0" />
          </Link>
        ) : null;
      })()}

      {job.spec === 'ميكانيك' && (
        <Link to="/equipment"
          className="flex items-center gap-3 p-3 bg-cta/5 border border-cta/20 rounded-xl hover:bg-cta/10 transition-colors">
          <Truck size={14} className="text-cta shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-cta">هل تبحث عن معدة للعمل بها؟</p>
            <p className="text-[10px] text-charcoal/55">استعرض المعدات المتاحة للإيجار في سوق المعدات</p>
          </div>
          <ChevronRight size={13} className="text-cta/60 shrink-0" />
        </Link>
      )}

      <div className="flex gap-2">
        <button onClick={copyJob}
          className="flex-1 flex items-center justify-center gap-1.5 bg-navy/5 hover:bg-navy/10 border border-navy/10 text-navy py-2 rounded-xl text-xs font-bold transition-colors">
          {copied ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
          {copied ? 'تم النسخ ✓' : 'نسخ الوظيفة'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(`🔔 وظيفة متاحة: ${job.title}\n🏢 ${job.company} — ${job.city}\n💰 ${job.salary}/شهرياً\n\nعبر منصة RESURGO`)}`}
          target="_blank" rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-2 rounded-xl text-xs font-bold transition-colors">
          <Share2 size={12} /> مشاركة واتساب
        </a>
      </div>

      {!applied ? (
        <div className="space-y-2.5">
          <a href={`https://wa.me/?text=${encodeURIComponent(`أودّ التقدم لوظيفة: ${job.title} في ${job.company} — رأيتها على منصة RESURGO`)}`}
            target="_blank" rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-3 rounded-xl text-sm transition-colors">
            <MessageCircle size={16} /> تواصل واتساب مع الشركة
          </a>
          <button onClick={async () => {
            setApplied(true);
            const dateStr = new Date().toISOString().slice(0, 10);
            // Save to Supabase if logged in
            if (isConfigured && user) {
              supabase.from('job_applications').insert({
                user_id: user.id,
                job_id:  String(job.id),
                title:   job.title,
                company: job.company,
                status:  'قيد المراجعة',
              }).catch(() => {});
            }
            // Always keep localStorage as local cache
            try {
              const existing = JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
              if (!existing.some(a => a.id === job.id)) {
                localStorage.setItem(APPS_KEY, JSON.stringify([
                  { id: job.id, title: job.title, company: job.company, status: 'قيد المراجعة', date: dateStr },
                  ...existing,
                ]));
              }
            } catch {}
            toast.success('تم إرسال طلبك بنجاح!');
            
            // إرسال إيميل للإدارة
            sendAdminAlert('hameddewihy@gmail.com', 'تقديم على وظيفة جديدة', {
              JobTitle: job.title,
              Company: job.company,
              City: job.city
            }).catch(() => {});

            pushCrossHint({
              emoji: '🏗️',
              text: 'هل تبحث عن آليات أو معدات ثقيلة للعمل في مواقع المشاريع؟',
              label: 'تصفح المعدات',
              to: '/equipment'
            });
            addNotification({ type: 'job_status', title: 'تم استلام طلبك', body: `طلبك على "${job.title}" في ${job.company} قيد المراجعة`, link: '/dashboard' });
            onApplied?.();
          }} className="w-full flex items-center justify-center gap-2 border border-brand/30 text-brand hover:bg-brand hover:text-white py-2.5 rounded-xl text-sm transition-all font-bold">
            <CheckCircle size={15} /> إرسال طلب داخلي
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle size={20} className="text-green-500 shrink-0" />
          <div>
            <p className="text-green-600 font-bold text-sm">تم إرسال طلبك بنجاح</p>
            <p className="text-green-500/70 text-xs">ستتلقى رداً خلال 3 أيام عمل</p>
          </div>
        </motion.div>
      )}

      {similarJobs.length > 0 && (
        <div className="border-t border-navy/8 pt-4">
          <h3 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
            <Briefcase size={13} className="text-brand" /> وظائف مشابهة — {job.spec}
          </h3>
          <div className="space-y-2">
            {similarJobs.map(j => (
              <button key={j.id} onClick={() => { setApplied(false); onSelectSimilar?.(j); }}
                className="w-full text-right bg-cream hover:bg-navy/5 border border-transparent hover:border-navy/8 rounded-xl p-3 transition-all">
                <p className="text-navy font-bold text-xs">{j.title}</p>
                <p className="text-charcoal/50 text-[10px] mt-0.5 flex items-center gap-1">
                  <Building2 size={9} />{j.company} · {j.city}
                  <span className="text-brand font-medium mr-1">{j.salary}</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Engineer Card — M4 ────────────────────────────────────────────────────────
function EngineerCard({ eng, index, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      onClick={() => onSelect(eng)}
      className="bg-white p-5 hover:-translate-y-1 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all duration-300 cursor-pointer group"
      style={{ borderRadius: '8px' }}
    >
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar with ring + corner badges */}
        <div className="relative shrink-0">
          <img
            src={eng.avatar}
            alt={eng.name}
            className={`w-20 h-20 rounded-2xl object-cover transition-all duration-300 ring-2 ring-offset-2
              ${eng.available
                ? 'ring-green-400/40 group-hover:ring-green-400/70'
                : 'ring-navy/15 group-hover:ring-brand/40'}`}
          />
          {/* Availability dot */}
          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm
            ${eng.available ? 'bg-green-400' : 'bg-charcoal/30'}`} />
          {/* Verified badge */}
          {eng.verified && (
            <span className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-brand rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <BadgeCheck size={12} className="text-white" />
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-navy font-bold text-sm leading-snug mb-0.5 truncate">{eng.name}</p>
          <p className="text-charcoal/60 text-xs mb-2">{eng.spec} · {eng.city}</p>
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={11} className={i < eng.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />
            ))}
          </div>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border
            ${eng.available
              ? 'text-green-600 bg-green-50 border-green-200'
              : 'text-charcoal/50 bg-cream border-navy/8'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${eng.available ? 'bg-green-400' : 'bg-charcoal/30'}`} />
            {eng.available ? 'متاح للعمل' : 'مشغول حالياً'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-charcoal/60 mb-3">
        <span className="flex items-center gap-1"><Award size={11} className="text-brand" />{eng.exp} سنة خبرة</span>
        <span className="flex items-center gap-1"><CheckCircle size={11} className="text-brand" />{eng.projects} مشروع</span>
      </div>

      <div className="flex gap-1.5 flex-wrap mb-4">
        {eng.skills.slice(0, 3).map(sk => (
          <span key={sk} className="text-[10px] bg-cream border border-navy/10 text-charcoal/60 px-2 py-0.5 rounded-full">{sk}</span>
        ))}
      </div>

      {/* Hover-animated CTA */}
      <div className="h-[38px] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs text-charcoal/45 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
          <Eye size={12} /> عرض الملف الشخصي
        </div>
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-xs bg-brand text-white rounded-xl transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
          <Eye size={12} /> عرض الملف الشخصي
        </div>
      </div>
    </motion.div>
  );
}

// ── Applications Tab ──────────────────────────────────────────────────────────
const STATUS_STYLE = {
  'تحت المراجعة':   'bg-amber-50 text-amber-700 border-amber-200',
  'مقبول للمقابلة': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'مرفوض':          'bg-red-50 text-red-500 border-red-200',
};

function ApplicationsTab({ onCountChange }) {
  const [apps, setApps] = useState(loadApplications);
  const withdraw = (id) => {
    const updated = apps.filter(a => a.id !== id);
    setApps(updated);
    localStorage.setItem(APPS_KEY, JSON.stringify(updated));
    onCountChange?.(updated.length);
    toast('تم سحب الطلب', { icon: '↩️' });
  };
  if (apps.length === 0) return (
    <div className="text-center py-20 text-charcoal/50">
      <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
      <p className="text-sm">لم تتقدم لأي وظيفة بعد</p>
      <p className="text-xs mt-1 text-charcoal/40">ابحث في الوظائف وأرسل طلبك عبر "إرسال طلب داخلي"</p>
    </div>
  );
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <p className="text-charcoal/60 text-xs mb-4"><span className="text-navy font-bold">{apps.length}</span> طلب مقدّم</p>
      <AnimatePresence>
        {apps.map(app => (
          <motion.div key={app.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10, height: 0 }}
            className="bg-white p-4 flex items-center gap-3"
            style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(31,42,56,0.06)' }}>
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
              <Briefcase size={16} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-navy font-bold text-sm truncate">{app.title}</p>
              <p className="text-charcoal/50 text-xs flex items-center gap-1.5 mt-0.5">
                <Building2 size={10} />{app.company}
                <span className="text-charcoal/25">·</span>
                <Clock size={10} />{app.date}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${STATUS_STYLE[app.status] || 'bg-navy/5 text-navy border-navy/10'}`}>
                {app.status}
              </span>
              <button onClick={() => withdraw(app.id)}
                className="w-7 h-7 flex items-center justify-center text-charcoal/25 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                title="سحب الطلب">
                <X size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function JobsPage() {
  const { jobs, engineers, sponsorships = [], incrementSponsorshipClicks } = useGlobalData();
  const { user } = useAuth();
  const activeSponsor = sponsorships.find(s => s.type === 'jobs' && s.active);

  const [tab, setTab] = useState('jobs');

  const [search, setSearch]     = useState('');
  const [spec, setSpec]         = useState('الكل');
  const [city, setCity]         = useState('الكل');

  const [jobType, setJobType]     = useState('الكل');
  const [salaryMin, setSalaryMin] = useState(0);
  const [sort, setSort]           = useState('newest');
  const [viewMode, setViewMode]   = useState('grid');

  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly]   = useState(false);
  const [minExp, setMinExp]               = useState(0);

  const [selectedJob, setSelectedJob]           = useState(null);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [isAtsOpen, setIsAtsOpen]               = useState(false);
  const [isPostJobOpen, setIsPostJobOpen]        = useState(false);

  const [savedJobs, setSavedJobs]   = useState(loadSaved);
  const [recentJobs, setRecentJobs] = useState(loadRecent);

  // Hydrate saved jobs from Supabase on login
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data?.length) {
          const ids = data.map(r => r.job_id);
          setSavedJobs(new Set(ids));
          localStorage.setItem(SAVED_KEY, JSON.stringify(ids));
        }
      });
  }, [user]);
  const [appsCount, setAppsCount]   = useState(() => loadApplications().length);

  const [alertRevision, setAlertRevision]   = useState(0);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const alertKey = `${spec}|${city}|${jobType}|${salaryMin}`;

  const alertSaved = useMemo(
    () => loadAlerts().some(a => a.key === alertKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [alertKey, alertRevision],
  );
  const alertMatches = useMemo(
    () => loadAlerts().map(alert => ({
      ...alert,
      count: jobs.filter(j =>
        (alert.spec === 'الكل' || j.spec === alert.spec) &&
        (alert.city === 'الكل' || j.city === alert.city) &&
        (alert.jobType === 'الكل' || j.type === alert.jobType) &&
        parseSalary(j.salary) >= (alert.salaryMin || 0)
      ).length,
    })).filter(a => a.count > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [jobs, alertRevision],
  );

  const searchRef = useRef(null);
  const [showSugg, setShowSugg] = useState(false);

  const searchSuggestions = useMemo(() => {
    if (!search || search.length < 1) return [];
    const seen  = new Set();
    const items = [];
    for (const j of jobs) {
      if (j.title.includes(search) && !seen.has('t:' + j.title)) {
        seen.add('t:' + j.title);
        items.push({ value: j.title, sub: j.spec, kind: 'وظيفة' });
      }
      for (const sk of j.skills) {
        if (sk.toLowerCase().includes(search.toLowerCase()) && !seen.has('s:' + sk)) {
          seen.add('s:' + sk);
          items.push({ value: sk, sub: 'مهارة', kind: 'مهارة' });
        }
      }
      if (items.length >= 7) break;
    }
    return items.slice(0, 6);
  }, [jobs, search]);

  useEffect(() => {
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSugg(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedJob(null);
  }, [tab]);

  const handleSelectJob = useCallback((job) => {
    setSelectedJob(job);
    if (job) {
      addToRecent(job.id);
      setRecentJobs(loadRecent());
    }
  }, []);

  const toggleAlert = useCallback(() => {
    const alerts   = loadAlerts();
    const existing = alerts.find(a => a.key === alertKey);
    if (existing) {
      localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts.filter(a => a.key !== alertKey)));
      toast('تم إلغاء التنبيه', { icon: '🔕' });
      if (isConfigured && user) {
        supabase.from('user_preferences')
          .delete().eq('user_id', user.id).eq('type', 'job_alert').eq('name', alertKey)
          .catch(() => {});
      }
    } else {
      const label = [
        spec !== 'الكل'    ? spec    : '',
        city !== 'الكل'    ? city    : '',
        jobType !== 'الكل' ? jobType : '',
        salaryMin > 0      ? `+${salaryMin}$` : '',
      ].filter(Boolean).join(' · ') || 'جميع الوظائف الهندسية';
      localStorage.setItem(ALERTS_KEY, JSON.stringify([...alerts, { key: alertKey, label, spec, city, jobType, salaryMin }]));
      toast.success(`✓ تنبيه مفعّل: ${label}`);
      setAlertDismissed(false);
      if (isConfigured && user) {
        supabase.from('user_preferences').insert({
          user_id: user.id,
          type:    'job_alert',
          name:    alertKey,
          payload: { spec, city, jobType, salaryMin, label },
          active:  true,
        }).catch(() => {});
      }
    }
    setAlertRevision(r => r + 1);
  }, [alertKey, spec, city, jobType, salaryMin, user]);

  const toggleSave = useCallback((id) => {
    setSavedJobs(prev => {
      const next = new Set(prev);
      const was  = next.has(id);
      if (was) { next.delete(id); toast('تم إلغاء الحفظ', { icon: '🔖' }); }
      else     { next.add(id);   toast.success('تم حفظ الوظيفة'); }
      localStorage.setItem(SAVED_KEY, JSON.stringify([...next]));
      if (isConfigured && user) {
        if (was) supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', String(id)).catch(() => {});
        else     supabase.from('saved_jobs').insert({ user_id: user.id, job_id: String(id) }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  const clearFilters = () => {
    setSpec('الكل'); setCity('الكل'); setSearch('');
    setJobType('الكل'); setSalaryMin(0); setSort('newest');
  };

  const hasActiveFilters = spec !== 'الكل' || city !== 'الكل' || search || jobType !== 'الكل' || salaryMin > 0;

  const filteredJobs = useMemo(() => {
    let result = jobs.filter(j => {
      const matchSearch = !search || j.title.includes(search) || j.company.includes(search) || j.desc?.includes(search);
      const matchSpec   = spec === 'الكل'    || j.spec === spec;
      const matchCity   = city === 'الكل'    || j.city === city;
      const matchType   = jobType === 'الكل' || j.type === jobType;
      const matchSalary = salaryMin === 0    || parseSalary(j.salary) >= salaryMin;
      return matchSearch && matchSpec && matchCity && matchType && matchSalary;
    });
    if (sort === 'salary')          result = [...result].sort((a, b) => parseSalary(b.salary) - parseSalary(a.salary));
    else if (sort === 'applicants') result = [...result].sort((a, b) => b.applicants - a.applicants);
    else                            result = [...result].sort((a, b) => b.posted.localeCompare(a.posted));
    return result;
  }, [jobs, search, spec, city, jobType, salaryMin, sort]);

  const savedJobsList = useMemo(() => jobs.filter(j => savedJobs.has(j.id)), [jobs, savedJobs]);
  const displayedJobs = tab === 'saved' ? savedJobsList : filteredJobs;
  const urgentJobs    = useMemo(() => jobs.filter(j => j.urgent), [jobs]);

  const filteredEngineers = useMemo(() => engineers.filter(e => {
    const matchSearch   = !search || e.name.includes(search) || e.skills.some(s => s.includes(search));
    const matchSpec     = spec === 'الكل' || e.spec === spec;
    const matchCity     = city === 'الكل' || e.city === city;
    const matchAvail    = !availableOnly  || e.available;
    const matchVerified = !verifiedOnly   || e.verified;
    const matchExp      = e.exp >= minExp;
    return matchSearch && matchSpec && matchCity && matchAvail && matchVerified && matchExp;
  }), [engineers, search, spec, city, availableOnly, verifiedOnly, minExp]);

  const jobItemProps = (job, i) => ({
    job, index: i,
    onSelect: handleSelectJob,
    selected: selectedJob,
    isSaved:  savedJobs.has(job.id),
    onToggleSave: toggleSave,
    isRecent: recentJobs.has(job.id),
  });

  return (
    <div className="min-h-screen bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="فرص العمل"
        description="أحدث فرص العمل في قطاع البناء والعقارات والهندسة في سوريا"
        path="/jobs"
      />

      {/* ── M1: Custom Dramatic Hero ──────────────────────────────────────── */}
      <section className="relative bg-[#1f2a38] overflow-hidden">
        {/* Decorative "03" */}
        <div
          className="absolute left-0 bottom-0 font-black select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(180px, 25vw, 340px)', color: 'rgba(255,255,255,0.032)', fontFamily: 'Bebas Neue, sans-serif', lineHeight: 0.82 }}
        >03</div>

        {/* Mesh gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-24 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[350px] h-[350px] rounded-full bg-brand/6 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 pt-10 pb-7">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-white/40 mb-5">
            <Link to="/" className="hover:text-white/70 transition-colors">الرئيسية</Link>
            <ChevronRight size={12} className="opacity-40" />
            <span className="text-white/70">التوظيف</span>
          </nav>

          {/* Heading row */}
          <div className="flex flex-col lg:flex-row lg:items-end gap-5 mb-7">
            <div className="flex-1">
              <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                <span className="w-6 h-px bg-emerald-400/60" />
                منصة التوظيف الهندسي
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-black text-white leading-[1.3] mb-3">
                كوادر هندسية<br />
                <span className="text-emerald-400">معتمدة.</span>
              </h1>
              <p className="text-white/55 text-sm">
                <AnimatedCounter target={jobs.length} /> وظيفة نشطة
                <span className="text-white/25 mx-2">·</span>
                <AnimatedCounter target={engineers.length} /> مهندس مسجّل في سوريا
              </p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-row lg:flex-col gap-2 flex-wrap">
              {[
                { icon: MapPin,     label: '14 محافظة سورية' },
                { icon: Award,      label: `${SPECS.length - 1} تخصص هندسي` },
                { icon: BadgeCheck, label: 'مهندسون موثّقون' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-white/7 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 whitespace-nowrap">
                  <Icon size={11} className="text-emerald-400 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Row 1: Search + Tabs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">

            {/* Search with autocomplete */}
            <div className="relative flex-1 max-w-sm" ref={searchRef}>
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 z-10 pointer-events-none" />
              <input
                placeholder="ابحث عن وظيفة أو مهارة..."
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                onKeyDown={e => { if (e.key === 'Escape') { setShowSugg(false); setSearch(''); } }}
                className="w-full bg-white/10 border border-white/15 rounded-xl pr-9 pl-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
              <AnimatePresence>
                {showSugg && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 left-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-navy/8 overflow-hidden z-50"
                  >
                    {searchSuggestions.map((s, i) => (
                      <button key={i}
                        onMouseDown={() => { setSearch(s.value); setShowSugg(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream text-right transition-colors border-b border-navy/5 last:border-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${s.kind === 'مهارة' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand/10 text-brand'}`}>
                          {s.kind}
                        </span>
                        <span className="text-navy text-sm truncate">{s.value}</span>
                        {s.sub && s.kind !== 'مهارة' && <span className="text-charcoal/40 text-xs shrink-0 mr-auto">{s.sub}</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
              {[
                ['jobs',         'الوظائف',    filteredJobs.length],
                ['engineers',    'المهندسون',  filteredEngineers.length],
                ['saved',        'المحفوظة',   savedJobs.size],
                ['applications', 'طلباتي',     appsCount],
              ].map(([id, label, count]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${tab === id ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/15 text-white/70 hover:border-white/40 hover:text-white'}`}>
                  {id === 'saved'        && <Bookmark size={13} />}
                  {id === 'applications' && <ClipboardList size={13} />}
                  {label}
                  {count > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20' : 'bg-white/10 text-white/60'}`}>{count}</span>
                  )}
                </button>
              ))}
              <button onClick={() => setIsAtsOpen(true)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-white/30 text-sm font-bold bg-white/10 hover:bg-white text-white hover:text-navy transition-all">
                مساحة الشركات (ATS)
              </button>
            </div>
          </div>

          {/* Row 2: Spec + City + Alert */}
          <div className="flex gap-2 flex-wrap items-center">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <SlidersHorizontal size={12} /> تخصص:
            </div>
            <select
              value={spec}
              onChange={e => setSpec(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs rounded-full px-3 py-1 focus:outline-none focus:border-emerald-400/60 cursor-pointer"
              style={{ direction: 'rtl' }}
            >
              {SPECS.map(s => (
                <option key={s} value={s} className="bg-navy text-white">{s}</option>
              ))}
            </select>
            <span className="text-white/20 text-xs">|</span>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <MapPin size={12} /> المحافظة:
            </div>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="bg-white/10 border border-white/20 text-white text-xs rounded-full px-3 py-1 focus:outline-none focus:border-brand/60 cursor-pointer"
              style={{ direction: 'rtl' }}
            >
              {CITIES.map(c => (
                <option key={c} value={c} className="bg-navy text-white">{c}</option>
              ))}
            </select>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 transition-colors">
                <X size={11} /> مسح الكل
              </button>
            )}
            {tab === 'jobs' && (
              <button onClick={toggleAlert}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${alertSaved ? 'bg-brand/20 border-brand/40 text-brand' : 'border-white/15 text-white/55 hover:border-white/40 hover:text-white'}`}>
                <Bell size={10} />
                {alertSaved ? 'تنبيه مفعّل ✓' : 'تنبيه بوظائف مشابهة'}
              </button>
            )}
          </div>

        </div>
      </section>

      {/* ── M2: Scroll-triggered Stats Bar ───────────────────────────────── */}
      <div className="bg-[#1f2a38] border-t border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { target: jobs.length,      suffix: '+', label: 'وظيفة نشطة',   color: 'text-emerald-400' },
              { target: engineers.length, suffix: '+', label: 'مهندس مسجّل',  color: 'text-white' },
              { target: 14,               suffix: '',  label: 'محافظة سورية', color: 'text-brand' },
              { target: SPECS.length - 1, suffix: '',  label: 'تخصص هندسي',  color: 'text-amber-400' },
            ].map(({ target, suffix, label, color }) => (
              <div key={label}>
                <p className={`font-black text-4xl sm:text-5xl mb-1.5 ${color}`} style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  <AnimatedCounter target={target} suffix={suffix} />
                </p>
                <p className="text-white/45 text-xs tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Alert banner */}
        <AnimatePresence>
          {!alertDismissed && alertMatches.length > 0 && tab === 'jobs' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mb-5 bg-brand/5 border border-brand/20 rounded-2xl px-5 py-4 flex items-center gap-3">
              <Bell size={15} className="text-brand shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-navy font-bold text-sm">تنبيهاتك المحفوظة</p>
                <p className="text-charcoal/60 text-xs truncate">
                  {alertMatches.map(a => `${a.count} وظيفة — ${a.label}`).join(' · ')}
                </p>
              </div>
              <button onClick={() => setAlertDismissed(true)} className="text-charcoal/30 hover:text-navy shrink-0 transition-colors">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">

          {/* ── Jobs / Saved ─────────────────────────────────────────────── */}
          {(tab === 'jobs' || tab === 'saved') && (
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Urgent strip */}
              {tab === 'jobs' && !hasActiveFilters && urgentJobs.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame size={14} className="text-cta" />
                    <span className="text-navy font-bold text-sm">وظائف عاجلة الآن</span>
                    <span className="text-[10px] bg-cta/10 text-cta px-2 py-0.5 rounded-full font-bold">{urgentJobs.length}</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                    {urgentJobs.map(j => (
                      <button key={j.id} onClick={() => handleSelectJob(j)}
                        className={`bg-white p-3.5 cursor-pointer shrink-0 w-44 text-right transition-all hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(31,42,56,0.07)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.12)] ${selectedJob?.id === j.id ? 'ring-1 ring-cta/50' : ''}`}
                        style={{ borderRadius: '8px' }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="text-[9px] bg-cta/15 text-cta px-1.5 py-0.5 rounded-full font-bold">عاجل</span>
                          <span className="text-[9px] text-charcoal/40 truncate">{j.spec}</span>
                        </div>
                        <p className="text-navy font-bold text-xs leading-snug mb-1.5 line-clamp-3">{j.title}</p>
                        <p className="text-charcoal/50 text-[10px] flex items-center gap-1 mb-1"><Building2 size={9} />{j.company}</p>
                        <p className="text-brand font-bold text-xs">{j.salary}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter strip */}
              {tab === 'jobs' && (
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {TYPES.map(t => (
                      <button key={t} onClick={() => setJobType(t)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${jobType === t ? 'bg-navy text-white border-navy' : 'border-navy/12 text-charcoal/60 bg-white hover:border-brand/40 hover:text-brand'}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mr-auto flex-wrap">
                    <select value={salaryMin} onChange={e => setSalaryMin(Number(e.target.value))}
                      className="border border-navy/12 rounded-xl px-3 py-1.5 text-xs text-navy bg-white focus:border-brand/40 outline-none cursor-pointer">
                      {SALARY_BRACKETS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                    <select value={sort} onChange={e => setSort(e.target.value)}
                      className="border border-navy/12 rounded-xl px-3 py-1.5 text-xs text-navy bg-white focus:border-brand/40 outline-none cursor-pointer">
                      {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>

                    <div className="flex items-center border border-navy/12 rounded-xl overflow-hidden bg-white">
                      <button onClick={() => setViewMode('grid')}
                        className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-navy text-white' : 'text-charcoal/40 hover:text-navy'}`}
                        title="عرض بطاقات">
                        <LayoutGrid size={14} />
                      </button>
                      <button onClick={() => setViewMode('list')}
                        className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-navy text-white' : 'text-charcoal/40 hover:text-navy'}`}
                        title="عرض قائمة">
                        <List size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-charcoal/60 text-xs whitespace-nowrap">
                    <span className="text-navy font-bold">{filteredJobs.length}</span> وظيفة
                  </p>
                </div>
              )}

              {/* Saved header */}
              {tab === 'saved' && (
                <div className="flex items-center gap-3 mb-5">
                  <p className="text-charcoal/60 text-xs"><span className="text-navy font-bold">{savedJobsList.length}</span> وظيفة محفوظة</p>
                </div>
              )}

              {/* Empty states / job list */}
              {displayedJobs.length === 0 ? (
                tab === 'saved' ? (
                  <EmptyState
                    icon={Bookmark}
                    title="لا توجد وظائف محفوظة"
                    desc="احفظ الوظائف التي تهمك بالضغط على أيقونة الحفظ في أي بطاقة وظيفة."
                  />
                ) : (
                  <EmptyState
                    icon={Briefcase}
                    title="لا توجد وظائف مطابقة"
                    desc="لم نعثر على وظائف تطابق معايير البحث الحالية. جرّب تغيير التخصص أو المحافظة."
                    actionLabel="مسح الفلاتر"
                    onAction={hasActiveFilters ? clearFilters : undefined}
                  />
                )
              ) : (
                <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                  <div className={viewMode === 'grid' ? 'space-y-4' : 'space-y-2'}>
                    {displayedJobs.map((job, i) =>
                      viewMode === 'list'
                        ? <JobRow key={job.id} {...jobItemProps(job, i)} />
                        : <JobCard key={job.id} {...jobItemProps(job, i)} />
                    )}
                  </div>
                  <div className="hidden lg:block space-y-4">
                    <JobDetail
                      job={selectedJob}
                      onClose={() => setSelectedJob(null)}
                      onApplied={() => setAppsCount(loadApplications().length)}
                      jobs={jobs}
                      onSelectSimilar={handleSelectJob}
                    />
                    <SponsorCard
                      sponsor={activeSponsor}
                      onClick={() => incrementSponsorshipClicks?.(activeSponsor.id)}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Engineers ────────────────────────────────────────────────── */}
          {tab === 'engineers' && (
            <motion.div key="engineers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <p className="text-charcoal/60 text-xs"><span className="text-navy font-bold">{filteredEngineers.length}</span> مهندس</p>
                <button onClick={() => setAvailableOnly(v => !v)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${availableOnly ? 'bg-green-50 border-green-400 text-green-700' : 'border-navy/15 text-charcoal/60 hover:border-green-300 hover:text-green-700'}`}>
                  <span className={`w-2 h-2 rounded-full ${availableOnly ? 'bg-green-400' : 'bg-charcoal/25'}`} />
                  متاح فقط
                </button>
                <button onClick={() => setVerifiedOnly(v => !v)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${verifiedOnly ? 'bg-brand/10 border-brand/40 text-brand' : 'border-navy/15 text-charcoal/60 hover:border-brand/30 hover:text-brand'}`}>
                  <BadgeCheck size={12} className={verifiedOnly ? 'text-brand' : 'text-charcoal/40'} />
                  موثق فقط
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-charcoal/50">خبرة:</span>
                  <select value={minExp} onChange={e => setMinExp(Number(e.target.value))}
                    className="border border-navy/12 rounded-xl px-3 py-1.5 text-xs text-navy bg-white focus:border-brand/40 outline-none cursor-pointer">
                    {EXP_OPTIONS.map(y => <option key={y} value={y}>{y === 0 ? 'أي خبرة' : `${y}+ سنة`}</option>)}
                  </select>
                </div>
                {(availableOnly || verifiedOnly || minExp > 0) && (
                  <button onClick={() => { setAvailableOnly(false); setVerifiedOnly(false); setMinExp(0); }}
                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
                    <X size={11} /> مسح
                  </button>
                )}
              </div>

              {filteredEngineers.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="لا يوجد مهندسون مطابقون"
                  desc="جرّب إلغاء فلتر التوفر أو خفض سنوات الخبرة المطلوبة."
                  actionLabel="إظهار الكل"
                  onAction={() => { setAvailableOnly(false); setVerifiedOnly(false); setMinExp(0); }}
                />
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredEngineers.map((eng, i) => (
                    <EngineerCard key={eng.id} eng={eng} index={i} onSelect={setSelectedEngineer} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Applications ─────────────────────────────────────────────── */}
          {tab === 'applications' && (
            <motion.div key="applications" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ApplicationsTab onCountChange={setAppsCount} />
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* ── Premium CTA — full-width dark section ── */}
      <div className="bg-[#1f2a38]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <p className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-3">للشركات والمكاتب الهندسية</p>
          <p className="text-white/35 text-sm mb-1">وصول مباشر إلى أكثر من</p>
          <p className="text-white font-black leading-none mb-2"
            style={{ fontSize: 'clamp(56px, 10vw, 96px)', fontFamily: 'Bebas Neue, sans-serif' }}>
            500+
          </p>
          <p className="text-white/40 text-sm mb-6">مهندس معتمد من نقابة المهندسين السوريين</p>
          <h3 className="text-white font-black text-xl sm:text-2xl mb-8">انشر وظيفتك وصِل لأفضل الكوادر</h3>
          <button
            onClick={() => setIsPostJobOpen(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3.5 px-10 text-sm transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Briefcase size={16} /> نشر وظيفة جديدة
          </button>
        </div>
      </div>

      {/* Mobile job detail bottom sheet */}
      <AnimatePresence>
        {selectedJob && (tab === 'jobs' || tab === 'saved') && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSelectedJob(null)}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden max-h-[88vh] overflow-y-auto bg-cream rounded-t-3xl shadow-2xl"
              dir="rtl"
            >
              <div className="sticky top-0 bg-cream/95 backdrop-blur-sm px-5 pt-4 pb-2 border-b border-navy/8 flex items-center justify-between">
                <div className="w-10 h-1 bg-navy/20 rounded-full absolute left-1/2 -translate-x-1/2 top-2" />
                <p className="text-navy font-bold text-sm mt-1 truncate ml-6">{selectedJob.title}</p>
                <button onClick={() => setSelectedJob(null)} className="text-charcoal/40 hover:text-navy shrink-0">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <JobDetail
                  job={selectedJob}
                  onClose={() => setSelectedJob(null)}
                  onApplied={() => setAppsCount(loadApplications().length)}
                  jobs={jobs}
                  onSelectSimilar={handleSelectJob}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EngineerProfileModal
        isOpen={!!selectedEngineer}
        engineer={selectedEngineer}
        onClose={() => setSelectedEngineer(null)}
      />
      <AtsDashboardModal
        isOpen={isAtsOpen}
        onClose={() => setIsAtsOpen(false)}
        jobTitle={selectedJob?.title}
      />
      <PostJobModal
        isOpen={isPostJobOpen}
        onClose={() => setIsPostJobOpen(false)}
      />
    </div>
  );
}
