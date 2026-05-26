import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Users, FileText, Activity, Search,
  Plus, MessageCircle, Mail, TrendingUp, Clock,
  GanttChartSquare, Sparkles, Wrench,
  ChevronRight, X, CheckCircle, AlertCircle, Star,
} from 'lucide-react';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';
import { sendAdminAlert } from '../../utils/emailService';
import { useGlobalData } from '../../context/GlobalContext';
import GanttChart from '../../components/developer/GanttChart';
import LeadScorePanel, { computeLeadScore, getScoreTier } from '../../components/developer/LeadScorePanel';

// ── Score Badge ───────────────────────────────────────────────────────────────
const TIER_BADGE = {
  hot:  { label: '🔥 Hot',  cls: 'bg-red-50 text-red-600 border-red-200' },
  warm: { label: '✅ Warm', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  cold: { label: '🌡️ Cold', cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DeveloperDashboard() {
  const [activeTab, setActiveTab] = useState('crm');

  const TABS = [
    { id: 'crm',      label: 'إدارة العملاء (CRM)',         icon: Users },
    { id: 'tenders',  label: 'المناقصات والتوريدات',         icon: FileText },
    { id: 'projects', label: 'إدارة المشاريع',              icon: Activity },
    { id: 'gantt',    label: 'الجدولة الزمنية (Gantt)',      icon: GanttChartSquare },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24" dir="rtl">
      <SEO title="لوحة تحكم المطور العقاري | Resurgo" path="/developer/dashboard" />

      {/* Header */}
      <div className="bg-navy text-white pt-8 pb-16 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
              <Building2 size={30} className="text-brand" />
            </div>
            <div>
              <h1 className="text-2xl font-black mb-1">مجموعة الشام للتطوير العقاري</h1>
              <p className="text-white/60 text-sm">لوحة تحكم المطور العقاري</p>
            </div>
          </div>
          <button onClick={() => toast.success('ميزة إضافة مشروع ستتوفر قريباً — تواصل مع فريق RESURGO لتسجيل مشروعك')} className="bg-brand hover:bg-white hover:text-navy text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2">
            <Plus size={16} /> إضافة مشروع جديد
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-navy/5 overflow-hidden flex flex-col lg:flex-row min-h-[70vh]">

          {/* Sidebar */}
          <div className="w-full lg:w-64 bg-cream/30 border-l border-navy/5 p-4 flex flex-col gap-2">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-navy text-white shadow-md' : 'text-charcoal/60 hover:bg-navy/5 hover:text-navy'}`}>
                <Icon size={18} className={activeTab === id ? 'text-brand' : ''} />
                {label}
                {id === 'gantt' && (
                  <span className="mr-auto text-[9px] bg-brand/20 text-brand px-1.5 py-0.5 rounded-full font-bold">جديد</span>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white p-6 overflow-x-hidden">
            <AnimatePresence mode="wait">
              {activeTab === 'crm'      && <CrmTab      key="crm"      />}
              {activeTab === 'tenders'  && <TendersTab  key="tenders"  />}
              {activeTab === 'projects' && <ProjectsTab key="projects" />}
              {activeTab === 'gantt'    && <GanttTab    key="gantt"    />}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Field Report Modal ────────────────────────────────────────────────────────
const REPORT_STATUS = ['ممتاز', 'جيد', 'متأخر قليلاً', 'مشكلة تحتاج تدخل'];

function FieldReportModal({ project, onClose }) {
  const [notes, setNotes]   = useState('');
  const [status, setStatus] = useState('جيد');
  const [progress, setProgress] = useState(project?.progress ?? 0);

  const handleSubmit = () => {
    if (!notes.trim()) { toast.error('الرجاء كتابة ملاحظات الميدان'); return; }
    toast.success(`✅ تم رفع تقرير ميداني لمشروع: ${project?.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-navy/10">
        <div className="flex items-center justify-between p-5 border-b border-navy/8">
          <div>
            <p className="text-navy font-black text-base">تقرير ميداني</p>
            <p className="text-charcoal/50 text-xs mt-0.5">{project?.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream flex items-center justify-center text-charcoal/40 hover:text-navy transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">حالة الموقع</label>
            <div className="flex flex-wrap gap-2">
              {REPORT_STATUS.map(s => (
                <button key={s} onClick={() => setStatus(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${status === s ? 'bg-brand text-white border-brand' : 'border-navy/15 text-charcoal/60 hover:border-brand/40'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">نسبة الإنجاز المُبلَّغة</label>
            <div className="flex items-center gap-3">
              <input type="range" min={0} max={100} step={5} value={progress}
                onChange={e => setProgress(+e.target.value)}
                className="flex-1 accent-brand" />
              <span className="text-navy font-black w-10 text-center">{progress}%</span>
            </div>
          </div>
          <div>
            <label className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider mb-1.5 block">ملاحظات الميدان</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}
              placeholder="صف الوضع الحالي، أي عقبات، والخطوة التالية..."
              className="w-full input-field text-sm resize-none" dir="rtl" />
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${status === 'مشكلة تحتاج تدخل' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {status === 'مشكلة تحتاج تدخل' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
            {status === 'مشكلة تحتاج تدخل' ? 'سيتم إرسال تنبيه للمستثمرين تلقائياً' : 'سيتم مشاركة التقرير مع المستثمرين'}
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-navy/8">
          <button onClick={handleSubmit} className="btn-primary flex-1 text-sm py-2.5">رفع التقرير</button>
          <button onClick={onClose} className="px-4 border border-navy/15 text-charcoal/60 rounded-xl text-sm hover:text-navy transition-colors">إلغاء</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Bids Review Modal ─────────────────────────────────────────────────────────
const MOCK_BIDS = [
  { id: 1, company: 'مقاولات الأمانة للإنشاء',    price: 85000, days: 45, rating: 4.8, notes: 'يشمل المواد والعمالة الكاملة',    status: 'pending' },
  { id: 2, company: 'شركة البناء المتحدة',         price: 92000, days: 38, rating: 4.5, notes: 'ضمان جودة سنتان + صيانة دورية', status: 'pending' },
  { id: 3, company: 'مجموعة الإنشاء الحديثة',     price: 78000, days: 52, rating: 4.2, notes: 'أقل سعر — مدة تنفيذ أطول',        status: 'pending' },
];

function BidsReviewModal({ tender, onClose }) {
  const [bids, setBids] = useState(MOCK_BIDS);

  const handleAction = (id, action) => {
    setBids(prev => prev.map(b => b.id === id ? { ...b, status: action } : b));
    toast.success(action === 'accepted' ? '✅ تم قبول العرض — سيتم إنشاء عقد ضمان' : 'تم رفض العرض');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm" dir="rtl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-navy/10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-navy/8 shrink-0">
          <div>
            <p className="text-navy font-black text-base">مراجعة العروض</p>
            <p className="text-charcoal/50 text-xs mt-0.5">{tender?.title} — {bids.length} عروض مقدمة</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-cream flex items-center justify-center text-charcoal/40 hover:text-navy transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {bids.map((bid) => (
            <div key={bid.id}
              className={`p-4 rounded-2xl border transition-all ${bid.status === 'accepted' ? 'bg-green-50 border-green-200' : bid.status === 'rejected' ? 'bg-red-50/50 border-red-100 opacity-60' : 'bg-cream/40 border-navy/10 hover:border-brand/30'}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-navy font-black text-sm">{bid.company}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={10} className={idx < Math.floor(bid.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />
                    ))}
                    <span className="text-charcoal/50 text-[10px] mr-1">{bid.rating}</span>
                  </div>
                </div>
                {bid.status === 'accepted' && <span className="text-[10px] font-bold bg-green-100 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">مقبول ✓</span>}
                {bid.status === 'rejected' && <span className="text-[10px] font-bold bg-red-100 text-red-500 border border-red-200 px-2 py-0.5 rounded-full">مرفوض</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white rounded-lg p-2 text-center border border-navy/8">
                  <p className="text-charcoal/45 text-[10px] mb-0.5">قيمة العرض</p>
                  <p className="text-navy font-black">${bid.price.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-navy/8">
                  <p className="text-charcoal/45 text-[10px] mb-0.5">مدة التنفيذ</p>
                  <p className="text-navy font-black">{bid.days} يوم</p>
                </div>
                <div className="bg-white rounded-lg p-2 text-center border border-navy/8">
                  <p className="text-charcoal/45 text-[10px] mb-0.5">التقييم</p>
                  <p className="text-amber-500 font-black">{bid.rating} ⭐</p>
                </div>
              </div>
              <p className="text-charcoal/60 text-xs mb-3 leading-relaxed">{bid.notes}</p>
              {bid.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(bid.id, 'accepted')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors">
                    <CheckCircle size={13} /> قبول العرض
                  </button>
                  <button onClick={() => handleAction(bid.id, 'rejected')}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-xl border border-red-200 transition-colors">
                    رفض
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-navy/8 shrink-0">
          <button onClick={onClose} className="w-full py-2.5 border border-navy/15 text-charcoal/60 rounded-xl text-sm hover:text-navy transition-colors">إغلاق</button>
        </div>
      </motion.div>
    </div>
  );
}

// ── CRM Tab (with AI Lead Scoring) ───────────────────────────────────────────
function CrmTab() {
  const { crmLeads, updateLeadStatus } = useGlobalData();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const columns = ['جديد', 'تواصل', 'تفاوض', 'مغلق'];

  // Enrich leads with scores
  const enrichedLeads = useMemo(() => {
    return crmLeads.map(l => {
      const score = computeLeadScore(l);
      return { ...l, score, tier: getScoreTier(score) };
    });
  }, [crmLeads]);

  // Filtered by search
  const filteredLeads = useMemo(() => {
    if (!searchQuery.trim()) return enrichedLeads;
    return enrichedLeads.filter(l =>
      l.name.includes(searchQuery) || l.project.includes(searchQuery)
    );
  }, [enrichedLeads, searchQuery]);

  const hotCount  = enrichedLeads.filter(l => l.tier === 'hot').length;
  const warmCount = enrichedLeads.filter(l => l.tier === 'warm').length;

  // ── Drag & Drop state ──
  const [draggingId,  setDraggingId]  = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, leadId) => {
    setDraggingId(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd   = () => { setDraggingId(null); setDragOverCol(null); };
  const handleDragOver  = (e, col) => { e.preventDefault(); setDragOverCol(col); };
  const handleDragLeave = () => setDragOverCol(null);
  const handleDrop      = (e, col) => {
    e.preventDefault();
    if (draggingId != null) {
      updateLeadStatus(draggingId, col);
      toast.success(`تم النقل إلى: ${col}`);
    }
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-black text-navy">إدارة العملاء (Leads CRM)</h2>
          <p className="text-xs text-charcoal/50 mt-1">
            تتبع المستثمرين والمهتمين · اسحب البطاقات لتغيير المرحلة
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-navy to-brand text-white rounded-xl text-xs font-bold hover:-translate-y-0.5 transition-all shadow-md shadow-brand/20"
          >
            <Sparkles size={13} /> تحليل ذكي
            {hotCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                {hotCount} 🔥
              </span>
            )}
            {warmCount > 0 && (
              <span className="bg-amber-400 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                {warmCount} ✅
              </span>
            )}
          </button>
          <div className="relative">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              placeholder="ابحث عن عميل..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-cream border border-navy/10 rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:border-brand w-52"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(col => {
          const colLeads = filteredLeads
            .filter(l => l.status === col)
            .sort((a, b) => b.score - a.score);
          const isOver = dragOverCol === col;

          return (
            <div key={col}
              onDragOver={e => handleDragOver(e, col)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, col)}
              className={`w-72 shrink-0 flex flex-col rounded-2xl border p-3 transition-all duration-150 ${
                isOver
                  ? 'bg-brand/8 border-brand/40 shadow-inner'
                  : 'bg-cream/40 border-navy/5'
              }`}>
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-navy text-sm">{col}</h3>
                <span className="bg-navy/10 text-navy text-xs px-2 py-0.5 rounded-full font-bold">
                  {colLeads.length}
                </span>
              </div>

              {isOver && (
                <div className="h-1.5 rounded-full bg-brand/40 mb-2 animate-pulse" />
              )}

              <div className="flex flex-col gap-3 flex-1 min-h-[380px]">
                {colLeads.map(lead => {
                  const badge    = TIER_BADGE[lead.tier];
                  const isDragging = draggingId === lead.id;
                  return (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
                      draggable
                      onDragStart={e => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={`bg-white p-3.5 rounded-xl border shadow-sm transition-all group select-none ${
                        isDragging
                          ? 'border-brand/60 cursor-grabbing scale-95'
                          : 'border-navy/10 cursor-grab hover:border-brand/40 hover:shadow-md'
                      }`}
                    >
                      {/* Name + AI Badge */}
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-navy text-sm leading-tight">{lead.name}</h4>
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full border shrink-0 mr-1 ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>

                      <p className="text-xs text-brand font-bold mb-0.5">{lead.project}</p>
                      <p className="text-xs text-charcoal/60 mb-2">{lead.unit} — ${lead.val.toLocaleString()}</p>

                      {/* Score mini-bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[9px] text-charcoal/50 mb-1">
                          <span>نقاط الجاهزية</span>
                          <span className="font-black text-navy">{lead.score}/100</span>
                        </div>
                        <div className="h-1 bg-navy/5 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${lead.tier === 'hot' ? 'bg-gradient-to-l from-red-500 to-orange-400' : lead.tier === 'warm' ? 'bg-gradient-to-l from-amber-500 to-yellow-400' : 'bg-slate-300'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${lead.score}%` }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-navy/5 pt-3">
                        <a
                          href={`https://wa.me/${(lead.phone || '').replace(/[\s+\-()]/g, '')}?text=${encodeURIComponent(`مرحباً ${lead.name}، نتواصل معك بخصوص مشروع ${lead.project}`)}`}
                          target="_blank" rel="noreferrer"
                          className="flex-1 flex justify-center items-center py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors">
                          <MessageCircle size={13} />
                        </a>
                        <button onClick={() => toast.success('تم إرسال بريد')}
                          className="flex-1 flex justify-center items-center py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                          <Mail size={13} />
                        </button>
                        <button
                          onClick={() => {
                            const nextCol = columns[columns.indexOf(col) + 1] || columns[0];
                            updateLeadStatus(lead.id, nextCol);
                            toast.success(`تم النقل إلى: ${nextCol}`);
                          }}
                          className="flex-none px-2 flex justify-center items-center py-1.5 rounded-lg bg-cream text-charcoal/40 hover:bg-navy/10 hover:text-navy transition-colors"
                        >
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Lead Score Panel */}
      <LeadScorePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        leads={enrichedLeads}
      />
    </motion.div>
  );
}

// ── Tenders Tab ───────────────────────────────────────────────────────────────
function TendersTab() {
  const { tenders, addTender } = useGlobalData();
  const [reviewTender, setReviewTender] = useState(null);

  const handleAddTender = () => {
    addTender({ title: 'أعمال الديكورات الجبسية', type: 'إكساء وتشطيب', deadline: '2026-06-15', bidsCount: 0, status: 'مفتوح', developerId: 1 });
    toast.success('تم إضافة المناقصة بنجاح وانعكس ذلك في النظام المركزي');
    
    sendAdminAlert('admin@resurgo.com', 'طرح مناقصة جديدة', {
      Title: 'أعمال الديكورات الجبسية',
      Type: 'إكساء وتشطيب',
      Deadline: '2026-06-15',
      DeveloperId: 1
    }).catch(() => {});
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-navy">لوحة المناقصات (Tendering)</h2>
          <p className="text-xs text-charcoal/50 mt-1">اطرح مناقصات المقاولات واستقبل العروض من الشركات المعتمدة</p>
        </div>
        <button onClick={handleAddTender} className="bg-navy hover:bg-brand text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors">
          <Plus size={16} /> طرح مناقصة تجريبية
        </button>
      </div>

      <div className="grid gap-4">
        {tenders.map(tender => (
          <div key={tender.id} className="flex flex-col md:flex-row items-center justify-between p-5 bg-white border border-navy/10 rounded-2xl hover:shadow-md transition-shadow gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-bold text-navy">{tender.title}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tender.status === 'مفتوح' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {tender.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-charcoal/60 mt-2">
                <span className="flex items-center gap-1"><Building2 size={12} className="text-brand" /> {tender.type}</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-brand" /> آخر موعد: {tender.deadline}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-r border-navy/10 pt-4 md:pt-0 md:pr-6 w-full md:w-auto">
              <div className="text-center">
                <p className="text-2xl font-black text-navy">{tender.bidsCount}</p>
                <p className="text-[10px] text-charcoal/50">عروض مقدمة</p>
              </div>
              <button onClick={() => setReviewTender(tender)}
                className="mr-4 flex-1 md:flex-none px-6 py-2 bg-cream text-navy hover:bg-brand hover:text-white rounded-xl text-sm font-bold transition-colors">
                مراجعة العروض
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {reviewTender && (
          <BidsReviewModal tender={reviewTender} onClose={() => setReviewTender(null)} />
        )}
      </AnimatePresence>

      {/* ── Cross-service: Equipment & Jobs ── */}
      <div className="mt-6 p-4 bg-cream/60 border border-navy/8 rounded-2xl">
        <p className="text-xs text-charcoal/40 font-bold uppercase tracking-wider mb-3">تحتاج لإتمام مشروعك؟</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/equipment"
            className="flex items-center gap-3 p-3.5 bg-white border border-navy/8 rounded-xl hover:border-brand/30 hover:shadow-sm transition-all group">
            <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
              <Wrench size={16} className="text-brand" />
            </div>
            <div>
              <p className="text-navy font-bold text-xs">تصفح المعدات المتاحة</p>
              <p className="text-charcoal/45 text-[10px]">حفاريات، رافعات، معدات تشطيب</p>
            </div>
          </Link>
          <Link to="/jobs"
            className="flex items-center gap-3 p-3.5 bg-white border border-navy/8 rounded-xl hover:border-brand/30 hover:shadow-sm transition-all group">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
              <Users size={16} className="text-sky-600" />
            </div>
            <div>
              <p className="text-navy font-bold text-xs">وظّف مهندسين وعمالة</p>
              <p className="text-charcoal/45 text-[10px]">مهندسون معتمدون جاهزون للمشاريع</p>
            </div>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab() {
  const { projects, updateProjectProgress } = useGlobalData();
  const developerProjects = projects.filter(p => p.developerId === 1);
  const [reportProject, setReportProject] = useState(null);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-black text-navy">إدارة المشاريع والتحديثات</h2>
          <p className="text-xs text-charcoal/50 mt-1">حدّث نسب الإنجاز وارفع الصور لطمأنة المستثمرين</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {developerProjects.map(proj => (
          <div key={proj.id} className="bg-white border border-navy/10 rounded-2xl p-5 hover:border-brand/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-navy text-lg">{proj.name}</h3>
                <p className="text-xs text-charcoal/50 mt-0.5">المحطة القادمة: {proj.nextMilestone}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-charcoal/60">نسبة الإنجاز الفعلية</span>
                <span className="font-bold text-navy">{proj.progress}%</span>
              </div>
              <div className="h-2 bg-navy/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${proj.progress === 100 ? 'bg-green-500' : 'bg-brand'}`}
                  style={{ width: `${proj.progress}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-cream/50 rounded-xl p-3 border border-navy/5">
                <p className="text-[10px] text-charcoal/50 mb-1">الوحدات المباعة</p>
                <p className="text-lg font-black text-navy">{proj.sold} <span className="text-xs text-charcoal/40 font-normal">من {proj.totalUnits}</span></p>
              </div>
              <div className="bg-cream/50 rounded-xl p-3 border border-navy/5">
                <p className="text-[10px] text-charcoal/50 mb-1">السيولة المجمعة</p>
                <p className="text-lg font-black text-green-600 flex items-center gap-1"><TrendingUp size={14}/> +12%</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateProjectProgress(proj.id, Math.min(100, proj.progress + 5));
                  toast.success('تم تحديث نسبة الإنجاز +5%');
                }}
                className="flex-1 py-2 bg-navy text-white text-xs font-bold rounded-xl hover:bg-brand transition-colors">
                تحديث النسبة
              </button>
              <button onClick={() => setReportProject(proj)}
                className="flex-1 py-2 border border-navy/10 text-navy text-xs font-bold rounded-xl hover:bg-navy/5 transition-colors">
                إضافة تقرير ميداني
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {reportProject && (
          <FieldReportModal project={reportProject} onClose={() => setReportProject(null)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Gantt Tab ─────────────────────────────────────────────────────────────────
function GanttTab() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <GanttChart />
    </motion.div>
  );
}
