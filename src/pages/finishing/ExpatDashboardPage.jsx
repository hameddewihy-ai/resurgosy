import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Calendar, CheckCircle, Clock, AlertCircle,
  Camera, MessageSquare, DollarSign, Home, Phone,
  Send, Globe, ChevronRight, Play,
  TrendingUp, Shield, Star, ArrowLeft, Package,
  Building2, FileText
} from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MILESTONE_CFG = {
  done:        { color: 'text-emerald-400', bg: 'bg-emerald-500', ring: 'ring-emerald-500/40', label: 'مكتمل',    Icon: CheckCircle },
  in_progress: { color: 'text-brand',       bg: 'bg-brand',       ring: 'ring-brand/40',       label: 'جارٍ',      Icon: Clock       },
  pending:     { color: 'text-slate-400',   bg: 'bg-slate-600',   ring: 'ring-slate-600/40',   label: 'لم يبدأ',   Icon: AlertCircle },
};

const fmt = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-SY', { year: 'numeric', month: 'short', day: 'numeric' });
};

const daysLeft = (endDate) => {
  const diff = new Date(endDate) - new Date();
  return Math.max(0, Math.ceil(diff / 86400000));
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, accent = 'text-brand' }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
      <Icon size={16} className={accent} />
      <div>
        <p className="text-[10px] text-slate-400 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

function MilestoneTracker({ milestones }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="dark-card rounded-2xl p-6 gpu-transition">
      <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
        <TrendingUp size={18} className="text-brand" />
        مراحل المشروع
      </h3>
      <div className="relative">
        {/* vertical line */}
        <div className="absolute right-[22px] top-0 bottom-0 w-0.5 bg-white/10 z-0" />

        <div className="space-y-3">
          {milestones.map((m, i) => {
            const cfg = MILESTONE_CFG[m.status];
            const isOpen = expanded === m.id;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <button
                  onClick={() => setExpanded(isOpen ? null : m.id)}
                  className="w-full text-right"
                >
                  <div className="flex items-start gap-4 relative z-10">
                    {/* step dot */}
                    <div className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center ring-2 ${cfg.ring} ${
                      m.status === 'done' ? 'bg-emerald-500/20' : m.status === 'in_progress' ? 'bg-brand/20' : 'bg-slate-700/60'
                    }`}>
                      <cfg.Icon size={18} className={cfg.color} />
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white leading-snug">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          m.status === 'done' ? 'bg-emerald-500/20 text-emerald-400' :
                          m.status === 'in_progress' ? 'bg-brand/20 text-brand' :
                          'bg-slate-700 text-slate-400'
                        }`}>{cfg.label}</span>
                      </div>

                      {m.status === 'in_progress' && (
                        <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-l from-cta to-brand"
                            initial={{ width: 0 }}
                            animate={{ width: `${m.progress}%` }}
                            transition={{ duration: 0.8, delay: i * 0.06 + 0.3 }}
                          />
                        </div>
                      )}

                      {m.completedDate && (
                        <p className="text-xs text-slate-400 mt-1">اكتمل {fmt(m.completedDate)}</p>
                      )}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && m.notes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mr-[60px] mt-2 mb-1 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                        {m.notes}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MediaGallery({ media }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="dark-card rounded-2xl p-6 gpu-transition">
      <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
        <Camera size={18} className="text-cta" />
        معرض التحديثات الميدانية
        <span className="text-xs text-slate-400 font-normal mr-1">{media.length} مستند</span>
      </h3>

      {media.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-white/5 text-slate-400 text-xs">
          لا يوجد تحديثات مصورة حالياً للمشروع.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {media.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => setSelected(item)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-square rounded-xl bg-white/5 border border-white/10 hover:border-brand/40 hover:bg-white/10 transition-all group overflow-hidden"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="text-3xl">{item.emoji}</span>
                {item.type === 'video' && (
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-cta/90 flex items-center justify-center">
                    <Play size={10} className="text-white mr-[-1px]" />
                  </div>
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                <p className="text-[9px] text-slate-200 leading-tight text-right line-clamp-2">{item.caption}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="bg-[#1E293B] rounded-2xl p-6 max-w-sm w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-6xl text-center mb-4">{selected.emoji}</div>
              <p className="text-white font-semibold text-center mb-1">{selected.caption}</p>
              <p className="text-slate-400 text-xs text-center">{fmt(selected.date)}</p>
              <button onClick={() => setSelected(null)} className="mt-4 w-full text-sm text-slate-400 hover:text-white transition-colors">
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectFinancialOverview({ payments, totalBudget, currency, exchangeRate }) {
  const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const remaining = totalBudget - paid;
  const paidPct = Math.round((paid / totalBudget) * 100);

  return (
    <div className="cream-card rounded-2xl p-6 gpu-transition">
      <h3 className="text-navy font-bold text-lg mb-5 flex items-center gap-2">
        <DollarSign size={18} className="text-cta" />
        الملخص المالي
      </h3>

      {/* summary row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'إجمالي العقد', val: totalBudget, clr: 'text-navy' },
          { label: 'مدفوع', val: paid, clr: 'text-emerald-700' },
          { label: 'متبقٍّ', val: remaining, clr: 'text-cta' },
        ].map(({ label, val, clr }) => (
          <div key={label} className="bg-navy/5 rounded-xl p-3 text-center">
            <p className="text-[10px] text-navy/60 mb-0.5">{label}</p>
            <p className={`text-sm font-bold ${clr}`}>${val.toLocaleString()}</p>
            <p className="text-[9px] text-navy/40 mt-1 leading-none">≈ {Math.round(val * exchangeRate).toLocaleString()} ل.س</p>
          </div>
        ))}
      </div>

      {/* progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-navy/60 mb-1.5">
          <span>نسبة السداد</span>
          <span className="font-bold text-navy">{paidPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-navy/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-cta to-brand"
            initial={{ width: 0 }}
            animate={{ width: `${paidPct}%` }}
            transition={{ duration: 0.9 }}
          />
        </div>
      </div>

      {/* payment schedule */}
      <div className="space-y-2">
        {payments.map(p => (
          <div key={p.id} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border ${
            p.status === 'paid' ? 'border-emerald-200 bg-emerald-50' : 'border-navy/15 bg-white/60'
          }`}>
            <div className="flex items-center gap-2">
              {p.status === 'paid'
                ? <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                : <Clock size={14} className="text-navy/40 shrink-0" />
              }
              <span className="text-xs text-navy font-medium">{p.label}</span>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-navy">${p.amount.toLocaleString()}</p>
              <p className="text-[9px] text-navy/50">{fmt(p.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommunicationLog({ messages, contractor, contractorPhone, onSendMessage }) {
  const [newMsg, setNewMsg] = useState('');

  const send = () => {
    if (!newMsg.trim()) return;
    onSendMessage(newMsg.trim());
    setNewMsg('');
  };

  return (
    <div className="dark-card rounded-2xl p-6 flex flex-col gpu-transition">
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <MessageSquare size={18} className="text-brand" />
          سجل التواصل
        </h3>
        <a
          href={`tel:${contractorPhone}`}
          className="flex items-center gap-1.5 text-xs bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded-lg px-3 py-1.5 hover:bg-emerald-600/30 transition-colors"
        >
          <Phone size={12} />
          اتصال
        </a>
      </div>

      {/* contractor chip */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl p-3 mb-4 border border-white/10">
        <div className="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center">
          <Building2 size={14} className="text-brand" />
        </div>
        <div>
          <p className="text-xs font-semibold text-white">{contractor}</p>
          <p className="text-[10px] text-slate-400">{contractorPhone}</p>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 space-y-3 max-h-72 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 mb-4 pl-1 flex flex-col justify-end">
        {[...messages].reverse().map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.from === 'user' ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
              msg.from === 'user'
                ? 'bg-brand/25 border border-brand/30 rounded-tr-sm'
                : 'bg-white/10 border border-white/10 rounded-tl-sm'
            }`}>
              <p className="text-xs text-white leading-relaxed">{msg.text}</p>
              <p className="text-[9px] text-slate-400 mt-1">{msg.time} · {fmt(msg.date)}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* input */}
      <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <input
          type="text"
          dir="rtl"
          value={newMsg}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="اكتب رسالة للمقاول..."
          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 outline-none"
        />
        <button
          onClick={send}
          disabled={!newMsg.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-brand text-white shrink-0 mr-1 disabled:opacity-40 hover:bg-brand/90 transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ExpatDashboardPage() {
  const {
    finishingRFQs = [],
    finishingBids = [],
    finishingProjects = [],
    addFinishingProject,
    updateFinishingRFQStatus,
    addFinishingProjectMessage,
    sypExchangeRate = 13000,
    setSypExchangeRate
  } = useGlobalData();

  // Combine projects and RFQs for selection
  const activeProjectsList = useMemo(() => {
    return finishingProjects.map(p => ({
      ...p,
      selectorType: 'project',
      selectorId: `project-${p.id}`,
      selectorName: p.name,
      selectorSubtext: p.type || 'إكساء نشط',
      icon: Home
    }));
  }, [finishingProjects]);

  const pendingRFQsList = useMemo(() => {
    return finishingRFQs.map(r => ({
      ...r,
      selectorType: 'rfq',
      selectorId: `rfq-${r.id}`,
      selectorName: `طلب إكساء - ${r.city.split(' — ')[0]}`,
      selectorSubtext: `المساحة: ${r.area} م² · ميزانية: ${r.budget}`,
      icon: FileText
    }));
  }, [finishingRFQs]);

  const allItems = useMemo(() => {
    return [...activeProjectsList, ...pendingRFQsList];
  }, [activeProjectsList, pendingRFQsList]);

  const [activeSelectorId, setActiveSelectorId] = useState('');
  const [customRate, setCustomRate] = useState(sypExchangeRate);

  // Sync customRate when sypExchangeRate changes globally
  useEffect(() => {
    setCustomRate(sypExchangeRate);
  }, [sypExchangeRate]);

  // Set default selection when data is loaded
  useEffect(() => {
    if (!activeSelectorId && allItems.length > 0) {
      setActiveSelectorId(allItems[0].selectorId);
    } else if (activeSelectorId && !allItems.some(item => item.selectorId === activeSelectorId)) {
      if (allItems.length > 0) {
        setActiveSelectorId(allItems[0].selectorId);
      } else {
        setActiveSelectorId('');
      }
    }
  }, [allItems, activeSelectorId]);

  const selectedItem = useMemo(() => {
    return allItems.find(item => item.selectorId === activeSelectorId) || allItems[0];
  }, [allItems, activeSelectorId]);

  const bidsForSelectedItem = useMemo(() => {
    if (!selectedItem || selectedItem.selectorType !== 'rfq') return [];
    return finishingBids.filter(b => b.rfqId === selectedItem.id);
  }, [selectedItem, finishingBids]);

  const project = selectedItem && selectedItem.selectorType === 'project' ? selectedItem : null;

  const done    = project ? project.milestones.filter(m => m.status === 'done').length : 0;
  const inProg  = project ? project.milestones.filter(m => m.status === 'in_progress').length : 0;

  const handleUpdateExchangeRate = () => {
    setSypExchangeRate(Number(customRate));
    toast.success(`تم تحديث سعر الصرف الافتراضي إلى 1$ ≈ ${Number(customRate).toLocaleString()} ل.س`);
  };

  const handleAcceptBid = (bid) => {
    const newProjectId = Date.now();
    
    // Create new project
    const newProject = {
      id: newProjectId,
      name: `مشروع: ${selectedItem.selectorName}`,
      address: `${selectedItem.city} - ${selectedItem.district || ''}`,
      type: selectedItem.services.join(' و '),
      contractor: bid.companyName,
      contractorRating: 4.8,
      contractorPhone: '+963 11 000 0001',
      startDate: new Date().toISOString().slice(0, 10),
      estimatedEnd: new Date(Date.now() + bid.durationWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      totalBudget: bid.price,
      currency: 'USD',
      status: 'in_progress',
      progress: 0,
      area: selectedItem.area,
      milestones: [
        { id: 1, name: 'أعمال الهيكل والسباكة', status: 'pending', completedDate: null, progress: 0, notes: '' },
        { id: 2, name: 'الجدران والبياض', status: 'pending', completedDate: null, progress: 0, notes: '' },
        { id: 3, name: 'تركيب البلاط والأرضيات', status: 'pending', completedDate: null, progress: 0, notes: '' },
        { id: 4, name: 'الطلاء والدهانات', status: 'pending', completedDate: null, progress: 0, notes: '' },
        { id: 5, name: 'تركيب الأبواب والنوافذ', status: 'pending', completedDate: null, progress: 0, notes: '' },
        { id: 6, name: 'التشطيبات النهائية والتسليم', status: 'pending', completedDate: null, progress: 0, notes: '' },
      ],
      payments: [
        { id: 1, label: 'دفعة البداية (20%)', amount: Math.round(bid.price * 0.20), status: 'paid', date: new Date().toISOString().slice(0, 10) },
        { id: 2, label: 'دفعة منتصف الطريق (30%)', amount: Math.round(bid.price * 0.30), status: 'pending', date: '' },
        { id: 3, label: 'دفعة المرحلة الثالثة (30%)', amount: Math.round(bid.price * 0.30), status: 'pending', date: '' },
        { id: 4, label: 'دفعة التسليم (20%)', amount: Math.round(bid.price * 0.20), status: 'pending', date: '' },
      ],
      media: [],
      messages: [
        {
          id: Date.now(),
          from: 'contractor',
          name: bid.companyName,
          date: new Date().toISOString().slice(0, 10),
          time: new Date().toTimeString().slice(0, 5),
          text: 'تم قبول العرض وبدء المشروع! نحن سعداء بالعمل معكم وسنوافيكم بتقدم العمل هنا بانتظام.'
        }
      ]
    };

    addFinishingProject(newProject);
    updateFinishingRFQStatus(selectedItem.id, 'مقبول');
    
    // Switch to project
    setActiveSelectorId(`project-${newProjectId}`);
    toast.success('تم قبول العرض بنجاح وبدء المشروع! يمكنك متابعة سير العمل من هنا.');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-dark, #0a1422)' }} dir="rtl">

      {/* ── Top Nav Strip ─────────────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-navy/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link to="/finishing" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft size={14} className="rotate-180" />
              منصة الإكساء
            </Link>
            <ChevronRight size={12} />
            <span className="text-white">لوحة المغترب</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-cta" />
            <span className="text-xs text-slate-300 font-medium">لوحة تتبع المشروع — المغتربون</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Project Selector ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-1">
          {allItems.map(p => {
            const Icon = p.icon || Home;
            const active = p.selectorId === activeSelectorId;
            return (
              <button
                key={p.selectorId}
                onClick={() => setActiveSelectorId(p.selectorId)}
                className={`shrink-0 flex items-center gap-3 rounded-2xl px-5 py-3.5 border transition-all text-right ${
                  active
                    ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-slate-400'} />
                <div>
                  <p className="text-sm font-bold leading-tight">{p.selectorName}</p>
                  <p className={`text-[10px] leading-tight mt-0.5 ${active ? 'text-white/70' : 'text-slate-500'}`}>{p.selectorSubtext}</p>
                </div>
              </button>
            );
          })}
          <Link
            to="/finishing/rfq"
            className="shrink-0 flex items-center gap-2 rounded-2xl px-5 py-3.5 border border-dashed border-cta/40 text-cta hover:bg-cta/10 transition-all text-sm font-medium"
          >
            + مشروع جديد
          </Link>
        </div>

        {allItems.length === 0 ? (
          <div className="text-center py-16 dark-card rounded-2xl text-slate-400">
            <AlertCircle size={40} className="mx-auto mb-4 text-slate-500" />
            <p className="font-bold text-lg text-white mb-2">لا توجد مشاريع أو طلبات حالياً</p>
            <p className="text-sm text-slate-400 mb-6">يمكنك إرسال طلب عرض سعر جديد للبدء بمشروع الإكساء الخاص بك.</p>
            <Link to="/finishing/rfq" className="btn-brand px-6 py-2.5 inline-flex items-center gap-2">
              تقديم طلب إكساء
            </Link>
          </div>
        ) : !selectedItem ? (
          <div className="text-center py-16 text-slate-400">جاري التحميل...</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.selectorId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {/* Render Active Project View */}
              {project && (
                <>
                  {/* Overview Card */}
                  <div className="dark-card rounded-2xl p-6 mb-6 gpu-transition">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{project.name}</h1>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <MapPin size={13} />
                          <span>{project.address}</span>
                        </div>
                      </div>

                      {/* big progress circle */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-20 h-20">
                          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
                            <motion.circle
                              cx="40" cy="40" r="32" fill="none"
                              stroke="url(#prog-grad)" strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 32}`}
                              strokeDashoffset={`${2 * Math.PI * 32 * (1 - project.progress / 100)}`}
                              initial={{ strokeDashoffset: `${2 * Math.PI * 32}` }}
                              animate={{ strokeDashoffset: `${2 * Math.PI * 32 * (1 - project.progress / 100)}` }}
                              transition={{ duration: 1 }}
                            />
                            <defs>
                              <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#5979bb" />
                                <stop offset="100%" stopColor="#f37124" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-white leading-none">{project.progress}%</span>
                            <span className="text-[8px] text-slate-400">اكتمال</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400 mb-1">الحالة الإجمالية</p>
                          <span className="inline-flex items-center gap-1.5 bg-brand/20 text-brand border border-brand/30 rounded-full px-3 py-1 text-xs font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                            قيد التنفيذ
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* stat pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <StatPill icon={Building2} label="المقاول" value={project.contractor.replace('شركة ', '')} accent="text-brand" />
                      <StatPill icon={Calendar} label="تاريخ البدء" value={fmt(project.startDate)} accent="text-slate-400" />
                      <StatPill icon={Clock} label="الأيام المتبقية" value={`${daysLeft(project.estimatedEnd)} يوم`} accent="text-cta" />
                      <StatPill icon={Package} label="المساحة" value={`${project.area} م²`} accent="text-amber-400" />
                    </div>
                  </div>

                  {/* ── Main Grid ──────────────────────────────────────────────────── */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left col — wider */}
                    <div className="lg:col-span-2 space-y-6">
                      <MilestoneTracker milestones={project.milestones} />
                      <MediaGallery media={project.media || []} />
                    </div>

                    {/* Right col */}
                    <div className="space-y-6">
                      <ProjectFinancialOverview
                        payments={project.payments}
                        totalBudget={project.totalBudget}
                        currency={project.currency}
                        exchangeRate={sypExchangeRate}
                      />
                      <CommunicationLog
                        projectId={project.id}
                        messages={project.messages || []}
                        contractor={project.contractor}
                        contractorPhone={project.contractorPhone}
                        onSendMessage={(text) => {
                          addFinishingProjectMessage(project.id, {
                            from: 'user',
                            name: 'أنت',
                            text
                          });
                        }}
                      />

                      {/* Exchange Rate Simulator sidebar card */}
                      <div className="dark-card rounded-2xl p-5 border border-white/10 gpu-transition">
                        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-1.5">
                          <TrendingUp size={15} className="text-brand" /> محاكي سعر الصرف
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          يمكنك تعديل سعر الصرف الافتراضي لليرة السورية لتحديث حسابات براءات الذمة وحسابات تقدير الإكساء والتقييم العقاري فورياً.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white shrink-0">1$ =</span>
                            <input 
                              type="number" 
                              value={customRate}
                              onChange={e => setCustomRate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-sm font-bold text-white outline-none focus:border-brand"
                            />
                            <span className="text-xs font-bold text-slate-400 shrink-0">ل.س</span>
                          </div>
                          <button 
                            onClick={handleUpdateExchangeRate}
                            className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-brand/10 transition-all"
                          >
                            تحديث سعر الصرف
                          </button>
                          <p className="text-[10px] text-slate-500 text-center mt-1">
                            سعر الصرف الحالي النشط: {sypExchangeRate.toLocaleString()} ل.س
                          </p>
                        </div>
                      </div>

                      {/* Quick stats card */}
                      <div className="cream-card rounded-2xl p-5 gpu-transition">
                        <h4 className="text-navy font-bold text-base mb-4 flex items-center gap-2">
                          <Star size={15} className="text-cta" />
                          ملخص المراحل
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {[
                            { label: 'مكتملة',  val: done,                                  clr: 'text-emerald-600' },
                            { label: 'جارية',   val: inProg,                                clr: 'text-brand'       },
                            { label: 'قادمة',   val: project.milestones.length - done - inProg, clr: 'text-navy/50'  },
                          ].map(({ label, val, clr }) => (
                            <div key={label} className="bg-navy/5 rounded-xl py-3">
                              <p className={`text-2xl font-bold ${clr}`}>{val}</p>
                              <p className="text-[10px] text-navy/60 mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contractor trust badge */}
                      <div className="dark-card rounded-2xl p-4 flex items-center gap-3 gpu-transition">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Shield size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">مقاول موثق ومعتمد</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < Math.floor(project.contractorRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                            ))}
                            <span className="text-[10px] text-slate-400 mr-1">{project.contractorRating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Render Pending RFQ View */}
              {selectedItem.selectorType === 'rfq' && (
                <>
                  <div className="dark-card rounded-2xl p-6 mb-6 gpu-transition">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-1">{selectedItem.selectorName}</h1>
                        <div className="flex items-center gap-1.5 text-slate-400 text-sm">
                          <MapPin size={13} />
                          <span>{selectedItem.city} {selectedItem.district && `— ${selectedItem.district}`}</span>
                        </div>
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          طلب معلق ({selectedItem.status})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6">
                      <StatPill icon={Package} label="المساحة" value={`${selectedItem.area} م²`} accent="text-amber-400" />
                      <StatPill icon={DollarSign} label="الميزانية المفضلة" value={selectedItem.budget} accent="text-cta" />
                      <StatPill icon={Clock} label="تاريخ التقديم" value={selectedItem.date} accent="text-slate-400" />
                      <StatPill icon={Globe} label="بلد الاغتراب" value={selectedItem.country || 'ألمانيا'} accent="text-brand" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      {/* RFQ Description & Services */}
                      <div className="dark-card rounded-2xl p-6 gpu-transition">
                        <h3 className="text-white font-bold text-lg mb-4">تفاصيل طلب الإكساء</h3>
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-slate-400 mb-1.5">الخدمات المطلوبة:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedItem.services.map(s => (
                                <span key={s} className="text-xs bg-brand/20 text-brand font-semibold px-3 py-1 rounded-full border border-brand/30">{s}</span>
                              ))}
                            </div>
                          </div>
                          {selectedItem.description && (
                            <div>
                              <p className="text-xs text-slate-400 mb-1.5">وصف العميل والتفاصيل:</p>
                              <p className="text-sm text-slate-300 leading-relaxed bg-white/5 border border-white/10 rounded-xl p-4">{selectedItem.description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bids List */}
                      <div className="dark-card rounded-2xl p-6 gpu-transition">
                        <h3 className="text-white font-bold text-lg mb-5 flex items-center gap-2">
                          <Building2 size={18} className="text-brand" />
                          عروض الأسعار الواردة من شركات الإكساء
                          <span className="text-xs text-slate-400 font-normal mr-1">{bidsForSelectedItem.length} عرض</span>
                        </h3>

                        {bidsForSelectedItem.length === 0 ? (
                          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-white/5">
                            <Clock size={32} className="mx-auto mb-3 text-slate-500 animate-pulse" />
                            <p className="text-slate-300 font-bold text-sm">نحن بانتظار عروض الأسعار...</p>
                            <p className="text-slate-500 text-xs mt-1.5 max-w-md mx-auto leading-relaxed">
                              تقوم شركات الإكساء المحلية الموثقة حالياً بدراسة المخططات وتقدير الكميات. ستظهر عروض الأسعار هنا فور تقديمها.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {bidsForSelectedItem.map(bid => (
                              <div key={bid.id} className="border border-white/10 bg-white/5 hover:bg-white/8 rounded-2xl p-5 transition-all">
                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-white font-bold text-base">{bid.companyName}</h4>
                                      <span className="flex items-center gap-0.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                                        <Star size={10} className="fill-amber-400" /> 4.8
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">تاريخ العرض: {bid.date}</p>
                                  </div>
                                  <div className="text-left">
                                    <p className="text-xl font-bold text-cta">${bid.price.toLocaleString()}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">≈ {Math.round(bid.price * sypExchangeRate).toLocaleString()} ل.س</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 mb-4">
                                  <div>
                                    <span className="text-slate-500">مدة التنفيذ المقترحة:</span>
                                    <p className="font-semibold text-white mt-0.5">{bid.durationWeeks} أسابيع</p>
                                  </div>
                                  <div>
                                    <span className="text-slate-500">سعر الصرف المعتمد:</span>
                                    <p className="font-semibold text-white mt-0.5">1$ = {sypExchangeRate.toLocaleString()} ل.س</p>
                                  </div>
                                </div>

                                {bid.notes && (
                                  <div className="mb-5 text-xs text-slate-300 bg-white/3 p-3 rounded-lg border border-white/5 leading-relaxed">
                                    <span className="text-slate-500 block mb-1 font-semibold">تفاصيل العرض والمواد:</span>
                                    {bid.notes}
                                  </div>
                                )}

                                <button
                                  onClick={() => handleAcceptBid(bid)}
                                  className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-brand/10"
                                >
                                  قبول العرض وبدء المشروع
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                       {/* Exchange Rate Simulator sidebar card */}
                      <div className="dark-card rounded-2xl p-5 border border-white/10 gpu-transition">
                        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-1.5">
                          <TrendingUp size={15} className="text-brand" /> محاكي سعر الصرف
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4">
                          يمكنك تعديل سعر الصرف الافتراضي لليرة السورية لتحديث حسابات براءات الذمة وحسابات تقدير الإكساء والتقييم العقاري فورياً.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white shrink-0">1$ =</span>
                            <input 
                              type="number" 
                              value={customRate}
                              onChange={e => setCustomRate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-sm font-bold text-white outline-none focus:border-brand"
                            />
                            <span className="text-xs font-bold text-slate-400 shrink-0">ل.س</span>
                          </div>
                          <button 
                            onClick={handleUpdateExchangeRate}
                            className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-brand/10 transition-all"
                          >
                            تحديث سعر الصرف
                          </button>
                          <p className="text-[10px] text-slate-500 text-center mt-1">
                            سعر الصرف الحالي النشط: {sypExchangeRate.toLocaleString()} ل.س
                          </p>
                        </div>
                      </div>

                       <div className="dark-card rounded-2xl p-4 flex items-center gap-3 gpu-transition">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Shield size={18} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">ضمان وأمن RESURGO</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">أموالك محفوظة في حساب ضمان (Escrow) مستقل ولا يُدفع للمقاول إلا بعد إتمام كل مرحلة.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
