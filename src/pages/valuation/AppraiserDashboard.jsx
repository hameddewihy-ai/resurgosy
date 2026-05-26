// INTERNAL TOOL — role: appraiser | admin only — NOT public-facing
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSearch, CheckCircle, MapPin, Clock, AlertCircle,
  ChevronDown, ChevronUp, Download,
  TrendingUp, TrendingDown, Sliders, Award, Building2,
  Shield, Wrench, FileText, BarChart3, Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';
import { useGlobalData } from '../../context/GlobalContext';
import { supabase, isConfigured } from '../../lib/supabase';
import { addNotification } from '../../components/NotificationsPanel';
import { sendEmail } from '../../utils/sendEmail';
import { valuationAcceptedHtml, valuationRejectedHtml } from '../../utils/emailTemplates';

// ── Local storage keys ────────────────────────────────────────────────────────
const REQ_KEY    = 'resurgo-valuation-requests';
const REPORT_KEY = 'resurgo-valuation-reports';

// ── City baseline prices ($/م²) — internal reference ─────────────────────────
const CITY_BASE = {
  'دمشق': 1850, 'ريف دمشق': 1200, 'حلب': 1240, 'حمص': 1120,
  'حماة': 980, 'اللاذقية': 2100, 'طرطوس': 1680, 'إدلب': 420,
  'دير الزور': 380, 'الرقة': 290, 'الحسكة': 510,
  'السويداء': 890, 'درعا': 620, 'القنيطرة': 550,
};
const TYPE_MULT = {
  residential: 1.0, apartment: 1.05, villa: 1.35, commercial: 1.20,
  office: 1.15, land: 0.55, industrial: 0.80, hotel: 1.50,
};
const FLOOR_MULT = { ground: 0.90, low: 0.95, mid: 1.0, high: 1.08, top: 1.12 };

function computeBaseline(req) {
  const base  = CITY_BASE[req.city] || 1000;
  const tMult = TYPE_MULT[req.propertyType] || 1.0;
  const fMult = FLOOR_MULT[req.floor] || 1.0;
  const m2    = base * tMult * fMult;
  const mid   = Math.round(m2 * req.area);
  return { low: Math.round(mid * 0.88), mid, high: Math.round(mid * 1.12), m2: Math.round(m2) };
}

function getRequests() {
  try { return JSON.parse(localStorage.getItem(REQ_KEY) || '[]'); }
  catch { return []; }
}
function getReports() {
  try { return JSON.parse(localStorage.getItem(REPORT_KEY) || '[]'); } catch { return []; }
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  pending:    { label: 'معلّق',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_review:  { label: 'قيد الدراسة', color: 'bg-blue-50 text-brand border-brand/20' },
  certified:  { label: 'معتمد',      color: 'bg-green-50 text-green-700 border-green-200' },
  rejected:   { label: 'مرفوض',      color: 'bg-red-50 text-red-600 border-red-200' },
};
const TIER_LABEL = { field: 'ميداني', desktop: 'مكتبي', legal: 'قانوني', avm: 'مبدئي' };

// ── Adjustment sliders config ─────────────────────────────────────────────────
const ADJUSTMENTS = [
  {
    key: 'structural',
    label: 'الحالة الإنشائية',
    desc: 'جودة البناء، الأضرار الهيكلية، سلامة الأسس',
    min: -25, max: 25, step: 5, default: 0,
    icon: Building2,
    marks: [
      { val: -25, label: 'خطر' }, { val: -15, label: 'سيء' },
      { val: 0,   label: 'عادي' }, { val: 15, label: 'جيد' },
      { val: 25,  label: 'ممتاز' },
    ],
  },
  {
    key: 'legal',
    label: 'الوضع القانوني',
    desc: 'سلامة السجل العقاري، غياب النزاعات، وضوح الملكية',
    min: -35, max: 0, step: 5, default: 0,
    icon: Scale,
    marks: [
      { val: -35, label: 'نزاع' }, { val: -20, label: 'مشكوك' },
      { val: -10, label: 'ملاحظات' }, { val: 0, label: 'سليم' },
    ],
  },
  {
    key: 'finishing',
    label: 'جودة الإكساء',
    desc: 'مواد البناء، التشطيبات الداخلية، النجارة والسباكة',
    min: -15, max: 35, step: 5, default: 0,
    icon: Wrench,
    marks: [
      { val: -15, label: 'رديء' }, { val: 0, label: 'عادي' },
      { val: 15, label: 'جيد' }, { val: 35, label: 'فاخر' },
    ],
  },
  {
    key: 'infrastructure',
    label: 'البنية التحتية',
    desc: 'الكهرباء، المياه، الصرف الصحي، الطرق المحيطة',
    min: -20, max: 10, step: 5, default: 0,
    icon: Shield,
    marks: [
      { val: -20, label: 'ضعيفة' }, { val: -10, label: 'متوسطة' },
      { val: 0,   label: 'جيدة' }, { val: 10, label: 'ممتازة' },
    ],
  },
];

// ── Request Queue row ─────────────────────────────────────────────────────────
function RequestRow({ req, onSelect, selected, onStatusChange }) {
  const s = STATUS[req.status] || STATUS.pending;
  return (
    <div className={`border-b border-navy/6 hover:bg-cream/40 transition-colors ${selected ? 'bg-brand/5 border-r-2 border-r-brand' : ''}`}>
      <button onClick={() => onSelect(req)}
        className="w-full text-right flex items-center gap-4 px-5 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-navy font-bold text-sm">{req.clientName}</span>
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
            <span className="text-[9px] font-medium text-charcoal/40 bg-navy/5 px-1.5 py-0.5 rounded">{TIER_LABEL[req.tier]}</span>
          </div>
          <p className="text-charcoal/55 text-xs flex items-center gap-1.5">
            <MapPin size={10} /> {req.city} — {req.district}
            <span className="mx-1 text-charcoal/20">·</span>
            {req.area} م² · {req.propertyType === 'apartment' ? 'شقة' : req.propertyType === 'villa' ? 'فيلا' : req.propertyType === 'commercial' ? 'تجاري' : 'عقار'}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-navy font-mono font-bold text-xs">{req.id?.toString().slice(0, 8)}</p>
          <p className="text-charcoal/40 text-[10px] flex items-center gap-1 justify-end mt-0.5">
            <Clock size={9} /> {req.submittedAt}
          </p>
        </div>
      </button>

      {/* Quick action buttons for pending requests */}
      {req.status === 'pending' && onStatusChange && (
        <div className="flex gap-2 px-5 pb-3">
          <button
            onClick={() => onStatusChange(req, 'in_review')}
            className="flex-1 text-xs bg-brand/10 hover:bg-brand/20 text-brand border border-brand/20 rounded-lg py-1.5 font-semibold transition-colors"
          >
            قبول وبدء الدراسة
          </button>
          <button
            onClick={() => onStatusChange(req, 'rejected')}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-lg px-3 py-1.5 font-semibold transition-colors"
          >
            رفض
          </button>
        </div>
      )}
    </div>
  );
}

// ── Adjustment Session ────────────────────────────────────────────────────────
function AssessmentSession({ req, onIssue }) {
  const { sypExchangeRate = 13000 } = useGlobalData() || {};
  const baseline = useMemo(() => computeBaseline(req), [req]);
  const [vals, setVals]       = useState(() => Object.fromEntries(ADJUSTMENTS.map(a => [a.key, a.default])));
  const [notes, setNotes]     = useState('');
  const [currency, setCurrency] = useState('USD');
  const [expanded, setExpanded] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const totalPct = Object.values(vals).reduce((s, v) => s + v, 0);
  const finalMid = Math.round(baseline.mid * (1 + totalPct / 100));
  const finalLow = Math.round(finalMid * 0.95);
  const finalHigh = Math.round(finalMid * 1.05);

  const fmt = (v) => currency === 'USD'
    ? `$${v.toLocaleString()}`
    : `${(v * sypExchangeRate).toLocaleString()} ل.س`;

  const handleIssue = () => {
    if (!notes.trim()) { toast.error('أضف ملاحظات التقييم الميداني قبل الإصدار'); return; }
    setSubmitting(true);
    setTimeout(() => {
      const report = {
        id: `RPT-${Date.now()}`,
        requestId: req.id,
        clientName: req.clientName,
        city: req.city,
        district: req.district,
        area: req.area,
        propertyType: req.propertyType,
        baselineValue: baseline.mid,
        adjustments: { ...vals, totalPct },
        finalValue: finalMid,
        finalLow,
        finalHigh,
        currency,
        notes: notes.trim(),
        tier: req.tier,
        issuedAt: new Date().toISOString().split('T')[0],
        status: 'certified',
      };
      try {
        const all = JSON.parse(localStorage.getItem(REPORT_KEY) || '[]');
        all.unshift(report);
        localStorage.setItem(REPORT_KEY, JSON.stringify(all.slice(0, 200)));
      } catch { /* silent */ }
      toast.success('تم إصدار تقرير التقييم بنجاح ✅');
      setSubmitting(false);
      onIssue(report);
    }, 900);
  };

  return (
    <div className="space-y-4" dir="rtl">

      {/* Request summary strip */}
      <div className="bg-navy rounded-2xl p-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">جلسة التقييم الداخلية</p>
            <p className="font-bold text-base">{req.clientName}</p>
            <p className="text-white/60 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {req.city} — {req.district} · {req.area} م²
            </p>
          </div>
          <div className="text-left shrink-0">
            <p className="text-white/40 text-[10px] font-mono">{req.id}</p>
            <span className="text-[9px] font-bold px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/15 block mt-1 text-center">
              {TIER_LABEL[req.tier]}
            </span>
          </div>
        </div>
      </div>

      {/* Baseline (internal reference) */}
      <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <p className="text-navy font-bold text-sm flex items-center gap-2">
            <BarChart3 size={14} className="text-brand" /> قيمة الاستناد المرجعية
          </p>
          <div className="flex gap-1">
            {['USD', 'SYP'].map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${currency === c ? 'bg-brand text-white border-brand' : 'border-navy/15 text-charcoal/55 hover:border-brand/30'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-cream rounded-xl p-3">
            <p className="text-charcoal/40 text-[9px] mb-1">الحد الأدنى</p>
            <p className="text-navy font-black text-sm">{fmt(baseline.low)}</p>
          </div>
          <div className="bg-brand/8 border border-brand/20 rounded-xl p-3">
            <p className="text-brand text-[9px] font-bold mb-1">القيمة المرجعية</p>
            <p className="text-navy font-black text-base">{fmt(baseline.mid)}</p>
            <p className="text-charcoal/40 text-[9px] mt-0.5">{fmt(baseline.m2)}/م²</p>
          </div>
          <div className="bg-cream rounded-xl p-3">
            <p className="text-charcoal/40 text-[9px] mb-1">الحد الأعلى</p>
            <p className="text-navy font-black text-sm">{fmt(baseline.high)}</p>
          </div>
        </div>
        <p className="text-charcoal/35 text-[10px] text-center mt-2">
          مرجعي داخلي — يُعدَّل بناءً على نتائج الفحص الميداني
        </p>
      </div>

      {/* Adjustment sliders */}
      <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="bg-cream px-5 py-3 border-b border-navy/8 flex items-center gap-2">
          <Sliders size={14} className="text-brand" />
          <p className="text-navy font-bold text-sm">معاملات التعديل الميداني</p>
          <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-full ${totalPct >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {totalPct >= 0 ? '+' : ''}{totalPct}%
          </span>
        </div>
        <div className="divide-y divide-navy/5">
          {ADJUSTMENTS.map((adj) => {
            const Icon = adj.icon;
            const val  = vals[adj.key];
            const isOpen = expanded === adj.key;
            return (
              <div key={adj.key} className="px-5 py-4">
                <button onClick={() => setExpanded(isOpen ? null : adj.key)}
                  className="w-full flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${val === 0 ? 'bg-navy/6' : val > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                    <Icon size={14} className={val === 0 ? 'text-charcoal/40' : val > 0 ? 'text-green-600' : 'text-red-500'} />
                  </div>
                  <div className="flex-1 min-w-0 text-right">
                    <p className="text-navy font-semibold text-xs">{adj.label}</p>
                    <p className="text-charcoal/40 text-[10px]">{adj.desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-sm font-black min-w-[3.5rem] text-left ${val > 0 ? 'text-green-600' : val < 0 ? 'text-red-500' : 'text-charcoal/40'}`}>
                      {val > 0 ? '+' : ''}{val}%
                    </span>
                    {isOpen ? <ChevronUp size={13} className="text-charcoal/30" /> : <ChevronDown size={13} className="text-charcoal/30" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="pt-4 pb-1 px-1">
                        <input type="range" min={adj.min} max={adj.max} step={adj.step}
                          value={val}
                          onChange={e => setVals(prev => ({ ...prev, [adj.key]: +e.target.value }))}
                          className="w-full accent-brand" />
                        <div className="flex justify-between mt-1">
                          {adj.marks.map(m => (
                            <span key={m.val} className={`text-[9px] ${val === m.val ? 'text-brand font-bold' : 'text-charcoal/35'}`}>{m.label}</span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final certified value */}
      <div className="bg-brand/4 p-5 border-2 border-brand/30 shadow-[0_2px_8px_rgba(31,42,56,0.04)] rounded-lg">
        <p className="text-brand font-bold text-xs tracking-widest uppercase mb-4 flex items-center gap-2">
          <Award size={13} /> القيمة المعتمدة النهائية
        </p>
        <div className="grid grid-cols-3 gap-3 text-center mb-4">
          <div className="bg-white rounded-xl p-3 border border-navy/8">
            <p className="text-charcoal/40 text-[9px] mb-1">أدنى</p>
            <p className="text-navy font-black">{fmt(finalLow)}</p>
          </div>
          <div className="bg-navy rounded-xl p-3">
            <p className="text-white/50 text-[9px] mb-1">القيمة المعتمدة</p>
            <p className="text-white font-black text-lg">{fmt(finalMid)}</p>
            {totalPct !== 0 && (
              <p className={`text-[9px] mt-0.5 font-bold ${totalPct > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalPct > 0 ? <TrendingUp size={9} className="inline ml-0.5" /> : <TrendingDown size={9} className="inline ml-0.5" />}
                {totalPct > 0 ? '+' : ''}{totalPct}% من المرجعية
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-3 border border-navy/8">
            <p className="text-charcoal/40 text-[9px] mb-1">أعلى</p>
            <p className="text-navy font-black">{fmt(finalHigh)}</p>
          </div>
        </div>

        {/* Field notes */}
        <div className="mb-4">
          <label className="text-charcoal/60 text-xs font-semibold block mb-1.5">ملاحظات الفحص الميداني *</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="سجّل نتائج الفحص الميداني: الحالة الفعلية، الملاحظات الجوهرية، أسباب التعديل..."
            className="w-full border border-navy/15 rounded-xl px-3 py-2.5 text-navy text-xs leading-relaxed focus:outline-none focus:border-brand/40 resize-none bg-white" />
        </div>

        {/* Issue button */}
        <button onClick={handleIssue} disabled={submitting}
          className="w-full btn-brand py-3 flex items-center justify-center gap-2 text-sm font-bold">
          {submitting ? <span className="spinner border-white/60 border-t-white" /> : <FileText size={15} />}
          {submitting ? 'جارٍ إصدار التقرير...' : 'إصدار تقرير التقييم المعتمد'}
        </button>
      </div>
    </div>
  );
}

// ── Report row ────────────────────────────────────────────────────────────────
function ReportRow({ report }) {
  const { sypExchangeRate = 13000 } = useGlobalData() || {};
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-navy/6 hover:bg-cream/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
        <FileSearch size={18} className="text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-navy font-bold text-sm">{report.clientName}</p>
        <p className="text-charcoal/50 text-xs">{report.city} — {report.district} · {report.area} م²</p>
      </div>
      <div className="text-left shrink-0">
        <p className="text-navy font-black text-sm">
          {report.currency === 'USD' ? `$${report.finalValue.toLocaleString()}` : `${(report.finalValue * sypExchangeRate).toLocaleString()} ل.س`}
        </p>
        <p className="text-charcoal/40 text-[10px]">{report.issuedAt}</p>
      </div>
      <button onClick={() => toast.success('جارٍ تحميل التقرير...')}
        aria-label="تحميل التقرير"
        className="w-8 h-8 rounded-xl border border-navy/15 flex items-center justify-center text-charcoal/40 hover:text-brand hover:border-brand/30 transition-colors shrink-0">
        <Download size={14} />
      </button>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AppraiserDashboard() {
  const { user }                = useAuth();
  const [tab, setTab]           = useState('queue');
  const [requests, setRequests] = useState(getRequests);
  const [reports, setReports]   = useState(getReports);
  const [selected, setSelected] = useState(null);

  // Load from Supabase on mount
  useEffect(() => {
    if (!isConfigured) return;
    supabase
      .from('valuation_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setRequests(data.map(r => ({
            id:           r.id,
            clientName:   r.client_name,
            city:         r.city,
            district:     r.district,
            area:         r.area,
            propertyType: r.property_type,
            floor:        r.floor || 'mid',
            tier:         r.tier  || 'desktop',
            status:       r.status,
            submittedAt:  r.submitted_at || r.created_at?.slice(0, 10),
          })));
        }
      });
    supabase
      .from('valuation_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setReports(data.map(r => ({
            id:            r.id,
            requestId:     r.request_id,
            clientName:    r.client_name,
            city:          r.city,
            district:      r.district,
            area:          r.area,
            propertyType:  r.property_type,
            baselineValue: r.baseline_value,
            adjustments:   r.adjustments || {},
            finalValue:    r.final_value,
            finalLow:      r.final_low,
            finalHigh:     r.final_high,
            currency:      r.currency || 'USD',
            notes:         r.notes,
            tier:          r.tier,
            issuedAt:      r.issued_at,
            status:        r.status,
          })));
        }
      });
  }, []);

  const pending   = requests.filter(r => r.status === 'pending');
  const inReview  = requests.filter(r => r.status === 'in_review');

  const handleStatusChange = async (req, newStatus) => {
    setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
    if (isConfigured) {
      supabase.from('valuation_requests').update({ status: newStatus }).eq('id', req.id).catch(() => {});
      // Email client directly via their submitted email
      if (req.client_email) {
        if (newStatus === 'in_review') {
          sendEmail({
            to:      req.client_email,
            subject: `📋 بدأ خبيرنا دراسة طلب التقييم الخاص بك`,
            html:    valuationAcceptedHtml(req.client_name, req.tier),
          });
        } else if (newStatus === 'rejected') {
          sendEmail({
            to:      req.client_email,
            subject: `📩 بخصوص طلب التقييم العقاري`,
            html:    valuationRejectedHtml(req.client_name),
          });
        }
      }
      // In-app notification if they have a user_id
      if (req.user_id) {
        const msgs = {
          in_review: 'بدأ خبير التقييم دراسة طلبك — سيصلك التقرير قريباً',
          rejected:  'نأسف، تعذّر قبول طلب التقييم. يرجى التواصل معنا لمزيد من التفاصيل',
        };
        addNotification({
          user_id: req.user_id,
          type:    'system',
          title:   newStatus === 'in_review' ? 'بدء دراسة طلب التقييم' : 'تحديث على طلب التقييم',
          body:    msgs[newStatus] || 'تم تحديث حالة طلبك',
          link:    '/dashboard',
        });
      }
    }
    toast.success(newStatus === 'in_review' ? 'تم قبول الطلب وبدء الدراسة' : 'تم رفض الطلب');
    if (newStatus === 'in_review') { setSelected(req); setTab('session'); }
  };

  const handleIssue = (report) => {
    setReports(prev => [report, ...prev]);
    setSelected(null);
    setTab('reports');
    // Persist to Supabase
    if (isConfigured) {
      supabase.from('valuation_reports').insert({
        id:             report.id,
        request_id:     report.requestId,
        client_name:    report.clientName,
        city:           report.city,
        district:       report.district,
        area:           report.area,
        property_type:  report.propertyType,
        baseline_value: report.baselineValue,
        adjustments:    report.adjustments,
        final_value:    report.finalValue,
        final_low:      report.finalLow,
        final_high:     report.finalHigh,
        currency:       report.currency,
        notes:          report.notes,
        tier:           report.tier,
        issued_at:      report.issuedAt,
        status:         'certified',
      }).catch(() => {});
      supabase.from('valuation_requests')
        .update({ status: 'certified' })
        .eq('id', report.requestId)
        .catch(() => {});
    }
  };

  const TABS = [
    { id: 'queue',   label: 'الطلبات المعلّقة', count: pending.length,  icon: Clock },
    { id: 'session', label: 'جلسة التقييم',     count: inReview.length, icon: Sliders },
    { id: 'reports', label: 'التقارير الصادرة', count: reports.length,  icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <SEO title="لوحة خبير التقييم — داخلي | RESURGO" path="/valuation/appraiser-dashboard" />

      {/* Header */}
      <div className="bg-navy border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/30 flex items-center justify-center">
                <Award size={22} className="text-brand" />
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">داخلي — غير عام</p>
                <p className="text-white font-black text-xl">لوحة خبير التقييم</p>
                <p className="text-white/50 text-xs mt-0.5">{user?.full_name} · {user?.professional_license_no || 'رقم الترخيص غير محدد'}</p>
              </div>
            </div>
            {/* Summary stats */}
            <div className="hidden sm:flex items-center gap-4">
              {[
                { val: pending.length,  label: 'معلّق',  color: 'text-amber-400' },
                { val: inReview.length, label: 'قيد الدراسة', color: 'text-brand' },
                { val: reports.length,  label: 'صدر',   color: 'text-green-400' },
              ].map(({ val, label, color }) => (
                <div key={label} className="text-center">
                  <p className={`font-black text-2xl ${color}`}>{val}</p>
                  <p className="text-white/40 text-[10px]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Tab bar */}
        <div className="flex gap-1 bg-white border border-navy/8 rounded-2xl p-1 mb-6 w-full sm:w-auto sm:inline-flex">
          {TABS.map(({ id, label, count, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === id ? 'bg-navy text-white shadow-sm' : 'text-charcoal/55 hover:text-navy'}`}>
              <Icon size={13} />
              {label}
              {count > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === id ? 'bg-white/20 text-white' : 'bg-navy/8 text-charcoal/50'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: Queue ── */}
        {tab === 'queue' && (
          <div className="grid lg:grid-cols-[1fr_420px] gap-6">
            <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="px-5 py-3 border-b border-navy/8 flex items-center justify-between">
                <p className="text-navy font-bold text-sm">طلبات تنتظر مراجعتك</p>
                <span className="text-charcoal/40 text-xs">{[...pending, ...inReview].length} طلب</span>
              </div>
              {[...pending, ...inReview].length === 0 ? (
                <div className="py-12 text-center text-charcoal/40">
                  <CheckCircle size={32} className="mx-auto mb-3 text-green-400" />
                  <p className="font-bold text-sm">لا توجد طلبات معلّقة</p>
                </div>
              ) : (
                [...pending, ...inReview].map(req => (
                  <RequestRow key={req.id} req={req} onSelect={(r) => { setSelected(r); setTab('session'); }} selected={selected?.id === req.id} onStatusChange={handleStatusChange} />
                ))
              )}
            </div>

            {/* Info panel */}
            <div className="space-y-4">
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" /> دليل التقييم السريع
                </p>
                <div className="space-y-3">
                  {[
                    ['01', 'اختر طلباً من القائمة للبدء بجلسة التقييم'],
                    ['02', 'راجع القيمة المرجعية الداخلية كنقطة انطلاق'],
                    ['03', 'أدخل معاملات التعديل بناءً على الفحص الميداني'],
                    ['04', 'أضف ملاحظاتك وأصدر التقرير المعتمد'],
                  ].map(([n, t]) => (
                    <div key={n} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                      <p className="text-charcoal/65 text-xs leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50/60 p-4 border border-amber-200 shadow-[0_2px_8px_rgba(31,42,56,0.04)] rounded-lg">
                <p className="text-amber-800 font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Shield size={12} /> معلومة داخلية سرية
                </p>
                <p className="text-amber-700/70 text-[11px] leading-relaxed">
                  هذه اللوحة للاستخدام الداخلي حصراً. القيم المرجعية والمنهجية المستخدمة لا تُكشف للعملاء — يُسلَّم للعميل التقرير النهائي المعتمد فقط.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Session ── */}
        {tab === 'session' && (
          selected ? (
            <div className="max-w-2xl">
              <button onClick={() => setTab('queue')} className="text-brand text-xs font-bold flex items-center gap-1 mb-4 hover:underline">
                ← العودة لقائمة الطلبات
              </button>
              <AssessmentSession req={selected} onIssue={handleIssue} />
            </div>
          ) : (
            <div className="bg-white py-16 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <Sliders size={36} className="mx-auto mb-3 text-brand/30" />
              <p className="text-navy font-bold text-sm mb-1">لم تختر طلباً بعد</p>
              <p className="text-charcoal/50 text-xs mb-4">اذهب لقائمة الطلبات واختر طلباً لبدء جلسة التقييم</p>
              <button onClick={() => setTab('queue')} className="btn-brand text-xs px-5 py-2">
                عرض الطلبات
              </button>
            </div>
          )
        )}

        {/* ── Tab: Reports ── */}
        {tab === 'reports' && (
          <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div className="px-5 py-3 border-b border-navy/8 flex items-center justify-between">
              <p className="text-navy font-bold text-sm">التقارير الصادرة</p>
              <span className="text-charcoal/40 text-xs">{reports.length} تقرير</span>
            </div>
            {reports.length === 0 ? (
              <div className="py-12 text-center text-charcoal/40">
                <FileText size={32} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold text-sm">لا توجد تقارير صادرة بعد</p>
              </div>
            ) : (
              reports.map(r => <ReportRow key={r.id} report={r} />)
            )}
          </div>
        )}

      </div>
    </div>
  );
}
