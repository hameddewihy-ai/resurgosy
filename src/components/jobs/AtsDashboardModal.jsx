import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Briefcase, CheckCircle, XCircle, Users, Clock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { addNotification } from '../NotificationsPanel';
import { supabase, isConfigured } from '../../lib/supabase';

const APPS_KEY = 'resurgo-job-apps';

const SEED_APPLICANTS = [
  { id: 'a1', name: 'م. سامر الأسد',    spec: 'إنشائي', exp: 12, match: 95, status: 'جديد',            skills: ['SAP2000', 'ETABS', 'AutoCAD'],   avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', source: 'مرشح' },
  { id: 'a2', name: 'م. خالد العمر',    spec: 'إنشائي', exp: 5,  match: 80, status: 'مقبول للمقابلة', skills: ['AutoCAD', 'Revit'],               avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', source: 'مرشح' },
  { id: 'a3', name: 'م. ليلى إبراهيم',  spec: 'معماري', exp: 3,  match: 45, status: 'مرفوض',           skills: ['Photoshop', '3ds Max'],            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', source: 'مرشح' },
  { id: 'a4', name: 'م. أيمن القاسم',   spec: 'إنشائي', exp: 8,  match: 88, status: 'جديد',            skills: ['ETABS', 'SAFE', 'AutoCAD'],       avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', source: 'مرشح' },
];

function normalizeDbApp(a, i) {
  return {
    id:     a.id || 'db-' + i,
    name:   a.applicant_name || 'متقدم',
    spec:   a.specialization  || 'غير محدد',
    exp:    0,
    match:  Math.floor(60 + Math.random() * 30),
    status: 'جديد',
    skills: [],
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
    source: 'طلب داخلي',
    date:   a.created_at?.slice(0, 10),
  };
}

function loadLsApplicants() {
  try {
    const raw = JSON.parse(localStorage.getItem(APPS_KEY) || '[]');
    return raw.map((a, i) => ({
      id: 'ls-' + i, name: 'متقدم — ' + (a.title || ''), spec: a.company || 'غير محدد',
      exp: 0, match: Math.floor(60 + Math.random() * 30), status: 'جديد',
      skills: [], avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      source: 'طلب داخلي', date: a.date,
    }));
  } catch { return []; }
}

export default function AtsDashboardModal({ isOpen, onClose, jobTitle }) {
  const [keyword, setKeyword]   = useState('');
  const [minExp, setMinExp]     = useState(0);
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    if (isConfigured) {
      supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data }) => {
          const db = data?.length ? data.map(normalizeDbApp) : loadLsApplicants();
          setApplicants([...db, ...SEED_APPLICANTS]);
        });
    } else {
      setApplicants([...loadLsApplicants(), ...SEED_APPLICANTS]);
    }
  }, [isOpen]);

  const filtered = useMemo(() => {
    return applicants.filter(a => {
      const matchKey = keyword === '' ||
        a.skills.some(s => s.toLowerCase().includes(keyword.toLowerCase())) ||
        a.name.includes(keyword) ||
        a.spec.includes(keyword);
      return matchKey && a.exp >= minExp;
    });
  }, [keyword, minExp, applicants]);

  const kanban = {
    'جديد':            filtered.filter(a => a.status === 'جديد'),
    'مقبول للمقابلة': filtered.filter(a => a.status === 'مقبول للمقابلة'),
    'مرفوض':           filtered.filter(a => a.status === 'مرفوض'),
  };

  const updateStatus = (id, newStatus) => {
    const applicant = applicants.find(a => a.id === id);
    setApplicants(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    toast.success(`تم نقل المتقدم إلى: ${newStatus}`);
    if (newStatus === 'مقبول للمقابلة') {
      addNotification({ type: 'job_status', title: 'مرشح جديد للمقابلة', body: `${applicant?.name || 'متقدم'} انتقل إلى مرحلة المقابلة — ${jobTitle || ''}`, link: '/jobs' });
    }
  };

  const totalNew = kanban['جديد'].length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-cream w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-navy/10 shrink-0">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center shrink-0">
                  <Briefcase size={18} className="text-brand" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold shrink-0">ATS · لوحة تحكم الشركات</span>
                    {totalNew > 0 && (
                      <span className="text-[10px] bg-cta/15 text-cta border border-cta/25 px-2 py-0.5 rounded-full font-bold shrink-0">
                        {totalNew} جديد
                      </span>
                    )}
                  </div>
                  <h2 className="text-navy font-black text-base truncate">
                    {jobTitle || 'إدارة المتقدمين'}
                  </h2>
                </div>
              </div>
              <button onClick={onClose}
                className="w-10 h-10 bg-navy/5 hover:bg-navy/10 text-navy rounded-full flex items-center justify-center transition-all shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">

              {/* Filters Sidebar */}
              <div className="w-full lg:w-64 bg-white border-l border-navy/10 p-5 flex flex-col gap-5 shrink-0 overflow-y-auto">
                <h3 className="font-bold text-navy text-sm flex items-center gap-2">
                  <Filter size={15} /> فلترة المتقدمين
                </h3>

                <div>
                  <label className="text-xs font-bold text-charcoal/50 block mb-2">بحث بالمهارة أو الاسم</label>
                  <div className="relative">
                    <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                    <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
                      placeholder="Revit، ETABS، م. سامر..."
                      className="w-full bg-cream border border-navy/10 rounded-xl pr-8 pl-3 py-2 text-sm focus:border-brand/40 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-charcoal/50 block mb-2">
                    الحد الأدنى للخبرة: <strong className="text-navy">{minExp}+ سنة</strong>
                  </label>
                  <input type="range" min="0" max="20" step="1"
                    value={minExp} onChange={e => setMinExp(Number(e.target.value))}
                    className="w-full accent-brand cursor-pointer" />
                </div>

                {/* Kanban totals */}
                <div className="mt-auto space-y-2">
                  {[
                    { label: 'جديد',            count: kanban['جديد'].length,            color: 'text-blue-600 bg-blue-50 border-blue-100' },
                    { label: 'مقبول للمقابلة', count: kanban['مقبول للمقابلة'].length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                    { label: 'مرفوض',           count: kanban['مرفوض'].length,           color: 'text-red-500 bg-red-50 border-red-100' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${color}`}>
                      <span>{label}</span>
                      <span>{count} متقدم</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kanban Board */}
              <div className="flex-1 p-5 bg-cream overflow-x-auto">
                <div className="flex gap-4 h-full" style={{ minWidth: 720 }}>
                  <KanbanCol title="جديد" color="border-t-blue-500 bg-blue-50/40" count={kanban['جديد'].length}>
                    {kanban['جديد'].map(a => <ApplicantCard key={a.id} applicant={a} onUpdate={updateStatus} />)}
                  </KanbanCol>
                  <KanbanCol title="مقبول للمقابلة" color="border-t-emerald-500 bg-emerald-50/40" count={kanban['مقبول للمقابلة'].length}>
                    {kanban['مقبول للمقابلة'].map(a => <ApplicantCard key={a.id} applicant={a} onUpdate={updateStatus} />)}
                  </KanbanCol>
                  <KanbanCol title="مرفوض" color="border-t-red-500 bg-red-50/40" count={kanban['مرفوض'].length}>
                    {kanban['مرفوض'].map(a => <ApplicantCard key={a.id} applicant={a} onUpdate={updateStatus} />)}
                  </KanbanCol>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function KanbanCol({ title, count, color, children }) {
  return (
    <div className={`flex-1 min-w-[220px] rounded-2xl border border-navy/5 flex flex-col overflow-hidden border-t-4 ${color}`}>
      <div className="bg-white px-4 py-3 border-b border-navy/5 flex justify-between items-center shrink-0">
        <h4 className="font-bold text-navy text-sm">{title}</h4>
        <span className="bg-navy/8 text-navy text-xs px-2 py-0.5 rounded-full font-bold">{count}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {children}
        {count === 0 && (
          <div className="text-center py-8 text-charcoal/30">
            <Users size={24} className="mx-auto mb-2 opacity-40" />
            <p className="text-xs">لا يوجد متقدمون هنا</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicantCard({ applicant, onUpdate }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-navy/5 hover:border-brand/25 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <img src={applicant.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-navy/10 shrink-0" />
          <div className="min-w-0">
            <h5 className="font-bold text-xs text-navy leading-tight truncate max-w-[110px]">{applicant.name}</h5>
            <p className="text-[10px] text-charcoal/50">{applicant.spec} · {applicant.exp > 0 ? `${applicant.exp}س` : 'جديد'}</p>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className={`text-xs font-black ${applicant.match >= 85 ? 'text-emerald-500' : applicant.match >= 65 ? 'text-amber-500' : 'text-red-400'}`}>
            {applicant.match}%
          </p>
          <p className="text-[9px] text-charcoal/35">تطابق</p>
        </div>
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-1 mb-2">
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${applicant.source === 'طلب داخلي' ? 'bg-brand/10 text-brand' : 'bg-navy/8 text-navy/60'}`}>
          {applicant.source}
        </span>
        {applicant.date && (
          <span className="text-[9px] text-charcoal/35 flex items-center gap-0.5">
            <Clock size={8} /> {applicant.date}
          </span>
        )}
      </div>

      {applicant.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {applicant.skills.slice(0, 3).map(sk => (
            <span key={sk} className="bg-cream text-navy/60 border border-navy/8 text-[9px] px-1.5 py-0.5 rounded font-medium">{sk}</span>
          ))}
        </div>
      )}

      <div className="flex gap-1">
        <button
          onClick={() => toast.success(`عرض ملف: ${applicant.name}`)}
          className="flex-1 flex items-center justify-center gap-1 bg-navy/5 hover:bg-navy/10 text-navy py-1.5 rounded-lg text-[10px] font-bold transition-colors">
          <ArrowRight size={10} /> الملف
        </button>
        {applicant.status !== 'مقبول للمقابلة' && (
          <button onClick={() => onUpdate(applicant.id, 'مقبول للمقابلة')}
            className="w-8 flex items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors" title="قبول للمقابلة">
            <CheckCircle size={13} />
          </button>
        )}
        {applicant.status !== 'مرفوض' && (
          <button onClick={() => onUpdate(applicant.id, 'مرفوض')}
            className="w-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors" title="رفض">
            <XCircle size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
