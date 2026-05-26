import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HardHat, MapPin, Clock, CheckCircle, X, Star, FileText,
  BadgeCheck, Upload, Camera, AlertTriangle, Plus,
  QrCode, Shield, Navigation, BarChart3, Briefcase, Brain, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import TaskMap from '../../components/engineer/TaskMap';
import IVSReportForm from '../../components/engineer/IVSReportForm';
import SkillAssessmentModal from '../../components/engineer/SkillAssessmentModal';
import FreelanceMarketplace from '../../components/engineer/FreelanceMarketplace';
import { useAuth } from '../../context/AuthContext';
import { supabase, isConfigured } from '../../lib/supabase';
import { formatDate } from '../../utils/formatDate';

// ── Initial data (empty — populated by real platform requests) ────────────────
const MOCK_TASKS    = [];
const INITIAL_SKILLS = [];

const MOCK_INSPECTION = [
  { id: 1, zone: 'الواجهة الخارجية',    observation: 'تشققات رأسية عند زاوية النافذة الجنوبية، عرض ~2mm',            risk: 'تسرب المياه وتآكل حديد التسليح على المدى المتوسط',       action: 'حقن إيبوكسي + طبقة عزل مائي خارجية',                    severity: 'medium' },
  { id: 2, zone: 'السقف والبلاطات',     observation: 'بقع رطوبة دائرية قطر ~40cm في منطقة دورة المياه',              risk: 'تراجع مقاومة الخرسانة — احتمال تفطر البلاطة عند الحمل',  action: 'كشف مصدر التسرب + إصلاح الإيبوكسي والدهان المقاوم',     severity: 'high' },
  { id: 3, zone: 'الأعمدة الإنشائية',   observation: 'تقشر خرسانة سطحية على عمود الركيزة الشمالية مع ظهور حديد',     risk: 'صدأ الحديد يُقلص المقطع الفعّال للعمود تدريجياً',          action: 'معالجة Rust Inhibitor + خرسانة إصلاحية عالية المقاومة',  severity: 'high' },
  { id: 4, zone: 'الأرضيات',            observation: 'تجويف تحت بلاطة الغرفة الرئيسية (صوت أجوف) مساحة ~0.5م²',     risk: 'انهيار موضعي محتمل تحت التحميل — خطر فوري',               action: 'حقن Grouting + عزل المنطقة فوراً لحين الإصلاح',          severity: 'critical' },
  { id: 5, zone: 'النوافذ والأبواب',    observation: 'تقارب رأسي في إطار الباب الرئيسي بمقدار 8mm',                   risk: 'هبوط موضعي في العتبة أو الجسر فوق الفتحة',                action: 'فحص Lintel بالموجات فوق الصوتية + تحليل الهبوط التفاضلي', severity: 'medium' },
];

// ── Lookup configs ────────────────────────────────────────────────────────────
const STATUS_META = {
  pending:     { label: 'معلّق',        color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200',   icon: Clock },
  in_progress: { label: 'جارٍ التنفيذ', color: 'text-brand',    bg: 'bg-brand/8 border-brand/20',     icon: HardHat },
  completed:   { label: 'مكتمل',        color: 'text-green-600', bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
};

const PRIORITY_META = {
  high:   { label: 'عاجل',  color: 'text-red-500',     dot: 'bg-red-400' },
  medium: { label: 'متوسط', color: 'text-amber-600',   dot: 'bg-amber-400' },
  low:    { label: 'عادي',  color: 'text-charcoal/50', dot: 'bg-navy/20' },
};

const TYPE_ICON = { residential: '🏠', commercial: '🏢', industrial: '🏭', land: '🗺️' };

const PROFICIENCY_LABELS = ['مبتدئ', 'أساسي', 'متوسط', 'متقدم', 'خبير'];

const SKILL_STATUS = {
  verified: { label: 'محقَّق',   badge: 'text-green-600 bg-green-50 border-green-200' },
  pending:  { label: 'معلّق',    badge: 'text-amber-600 bg-amber-50 border-amber-200' },
};

const SEVERITY_CFG = {
  critical: { label: 'حرج',    badge: 'bg-red-50 border-red-200 text-red-600',      textMuted: 'text-red-500' },
  high:     { label: 'عالي',   badge: 'bg-cta/8 border-cta/25 text-cta',            textMuted: 'text-cta' },
  medium:   { label: 'متوسط',  badge: 'bg-amber-50 border-amber-200 text-amber-600', textMuted: 'text-amber-600' },
  low:      { label: 'منخفض',  badge: 'bg-green-50 border-green-200 text-green-600', textMuted: 'text-green-600' },
};

const SKILL_CATEGORIES = ['برامج هندسية', 'تحليل إنشائي', 'إدارة مشاريع', 'معايير دولية', 'مواد البناء'];

// ── Haversine distance (meters) ───────────────────────────────────────────────
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── QR Check-in ───────────────────────────────────────────────────────────────
function QRCheckIn({ task }) {
  const [checking, setChecking] = useState(false);
  const [result, setResult]     = useState(null); // null | 'success' | 'outside'

  const doCheckIn = () => {
    setChecking(true);
    if (!navigator.geolocation) {
      toast.error('الموقع الجغرافي غير مدعوم في هذا المتصفح');
      setChecking(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const dist = calcDistance(pos.coords.latitude, pos.coords.longitude, task.lat, task.lng);
        setChecking(false);
        if (dist <= 500) {
          setResult('success');
          toast.success('تم تسجيل الحضور الميداني');
        } else {
          setResult('outside');
          toast.error(`خارج نطاق الموقع — المسافة: ${Math.round(dist)} م`);
        }
      },
      () => { setChecking(false); toast.error('تعذّر الحصول على موقعك'); },
      { timeout: 8000 }
    );
  };

  if (result === 'success') return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 text-green-600 text-xs font-bold">
      <CheckCircle size={14} /> تم تسجيل الحضور · {new Date().toLocaleTimeString('ar-SY')}
    </div>
  );

  return (
    <div>
      <button onClick={doCheckIn} disabled={checking}
        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-navy/15 hover:border-brand/40 text-charcoal/60 hover:text-brand text-xs py-3 rounded-xl transition-all disabled:opacity-50">
        {checking
          ? <div className="w-4 h-4 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
          : <><QrCode size={13} /> تسجيل الحضور الميداني (Geofencing 500م)</>}
      </button>
      {result === 'outside' && (
        <p className="text-red-500 text-[10px] text-center mt-1.5 flex items-center justify-center gap-1">
          <Navigation size={10} /> أنت خارج نطاق الموقع المخصص
        </p>
      )}
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, selected, onClick }) {
  const sm = STATUS_META[task.status];
  const pm = PRIORITY_META[task.priority];
  const Icon = sm.icon;
  return (
    <button onClick={onClick}
      className={`w-full text-right rounded-xl border-2 p-4 transition-all ${selected ? 'border-brand bg-brand/5' : 'border-navy/12 bg-white hover:border-brand/30'}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">{TYPE_ICON[task.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-navy font-bold text-sm leading-snug">{task.property}</p>
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${sm.bg} ${sm.color}`}>
              <Icon size={10} />{sm.label}
            </span>
          </div>
          <p className="text-charcoal/60 text-xs mt-1 flex items-center gap-1"><MapPin size={10} />{task.city}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`flex items-center gap-1 text-xs ${pm.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pm.dot}`} />{pm.label}
            </span>
            <span className="text-charcoal/40 text-xs">{task.requested_at}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ tasks }) {
  const counts = { pending: 0, in_progress: 0, completed: 0 };
  tasks.forEach(t => counts[t.status]++);
  return (
    <div className="grid grid-cols-3 gap-3 mb-5">
      {[
        { label: 'معلّقة',        value: counts.pending,     color: 'text-amber-600', icon: Clock },
        { label: 'جارٍ تنفيذها',  value: counts.in_progress, color: 'text-brand',     icon: HardHat },
        { label: 'مكتملة',       value: counts.completed,   color: 'text-green-600', icon: CheckCircle },
      ].map(({ label, value, color, icon: Icon }) => (
        <div key={label} className="bg-white p-3 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <p className={`text-2xl font-black ${color}`}>{value}</p>
          <div className={`flex items-center justify-center gap-1 text-xs mt-0.5 ${color}`}>
            <Icon size={11} /><span>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Skill Row ─────────────────────────────────────────────────────────────────
function SkillRow({ skill, index, onUpdate, onStartAssessment }) {
  const s = SKILL_STATUS[skill.status] || SKILL_STATUS.pending;

  const requestSyndicate = () => {
    toast.success('تم إرسال طلب التحقق إلى نقابة المهندسين');
    onUpdate(prev => prev.map(sk => sk.id === skill.id ? { ...sk, syndicate: true } : sk));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream/60 transition-colors flex-wrap sm:flex-nowrap"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-navy font-bold text-sm">{skill.name}</p>
          {skill.syndicate && <BadgeCheck size={13} className="text-brand shrink-0" />}
        </div>
        <p className="text-charcoal/50 text-xs">{skill.category}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {[0, 1, 2, 3, 4].map(n => (
          <div key={n} className={`w-2.5 h-5 rounded-sm transition-colors ${n <= skill.proficiency ? 'bg-brand' : 'bg-navy/10'}`} />
        ))}
        <span className="text-charcoal/50 text-[10px] mr-1.5 w-14 text-right">{PROFICIENCY_LABELS[skill.proficiency]}</span>
      </div>
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${s.badge}`}>{s.label}</span>
      <div className="flex gap-1.5 shrink-0">
        {skill.status === 'pending' && (
          <button onClick={() => onStartAssessment(skill)}
            className="text-[10px] border border-brand/30 text-brand px-2.5 py-1 rounded-lg hover:bg-brand/5 transition-colors flex items-center gap-0.5 font-bold">
            <Brain size={9} /> ابدأ الاختبار
          </button>
        )}
        {skill.status === 'verified' && !skill.syndicate && (
          <button onClick={requestSyndicate}
            className="text-[10px] border border-emerald-400/40 text-emerald-600 px-2.5 py-1 rounded-lg hover:bg-emerald-50 transition-colors flex items-center gap-0.5">
            <Shield size={9} /> نقابة
          </button>
        )}
        {skill.syndicate && (
          <span className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
            <CheckCircle size={10} /> معتمد
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ── Skills Matrix Tab ─────────────────────────────────────────────────────────
function SkillsMatrix() {
  const [skills, setSkills]   = useState(INITIAL_SKILLS);
  const [addOpen, setAddOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'برامج هندسية', proficiency: 2 });
  const [assessSkill, setAssessSkill] = useState(null);

  const verified = skills.filter(s => s.status === 'verified').length;
  const completion = skills.length ? Math.round((verified / skills.length) * 100) : 0;

  const addSkill = () => {
    if (!newSkill.name.trim()) { toast.error('أدخل اسم المهارة'); return; }
    setSkills(prev => [...prev, { id: `s${Date.now()}`, ...newSkill, status: 'pending', syndicate: false, certUrl: null }]);
    setNewSkill({ name: '', category: 'برامج هندسية', proficiency: 2 });
    setAddOpen(false);
    toast.success('تم إضافة المهارة — في انتظار التحقق');
  };

  return (
    <div className="space-y-5">
      {/* SVP Profile Card */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center">
              <BadgeCheck size={28} className="text-brand" />
            </div>
            <div>
              <p className="text-navy font-black text-base">بطاقة التحقق المهني SVP</p>
              <p className="text-charcoal/60 text-xs">نقابة المهندسين السوريين · {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border text-green-600 bg-green-50 border-green-200">{verified} محقَّق</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full border text-amber-600 bg-amber-50 border-amber-200">{skills.length - verified} معلّق</span>
            </div>
            <p className="text-charcoal/40 text-[10px]">اكتمال الملف: {completion}%</p>
          </div>
        </div>
        <div className="h-2 bg-navy/8 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }}
            className="h-full bg-gradient-to-l from-brand to-emerald-400 rounded-full" />
        </div>
      </div>

      {/* Skills list */}
      <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        <div className="px-5 py-4 border-b border-navy/10 flex items-center justify-between">
          <p className="text-navy font-bold text-sm">مصفوفة المهارات</p>
          <button onClick={() => setAddOpen(v => !v)}
            className="flex items-center gap-1.5 text-xs text-brand border border-brand/25 px-3 py-1.5 rounded-lg hover:bg-brand/5 transition-colors">
            <Plus size={12} /> إضافة مهارة
          </button>
        </div>

        {/* Add skill inline form */}
        <AnimatePresence>
          {addOpen && (
            <motion.div key="add-form"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-navy/10 bg-cream">
              <div className="p-4 grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">اسم المهارة</label>
                  <input value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))}
                    placeholder="مثال: AutoCAD، FIDIC..." className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">التصنيف</label>
                  <select value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                    className="input-field text-sm">
                    {SKILL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-charcoal/60 text-xs mb-1 block">مستوى الكفاءة (0–4)</label>
                  <div className="flex gap-1 mb-1">
                    {[0, 1, 2, 3, 4].map(n => (
                      <button key={n} type="button" onClick={() => setNewSkill(p => ({ ...p, proficiency: n }))}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${newSkill.proficiency === n ? 'bg-brand border-brand text-white' : 'border-navy/15 text-charcoal/50 hover:border-brand/30'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-charcoal/40 text-[10px]">{PROFICIENCY_LABELS[newSkill.proficiency]}</p>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <button onClick={addSkill} className="btn-cta text-xs py-2 px-4 flex items-center gap-1.5"><Plus size={12} /> إضافة</button>
                <button onClick={() => setAddOpen(false)} className="text-xs border border-navy/15 text-charcoal/60 px-4 py-2 rounded-xl hover:border-navy/30 transition-colors">إلغاء</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rows */}
        <div className="divide-y divide-navy/[0.06]">
          {skills.map((sk, i) => (
            <SkillRow key={sk.id} skill={sk} index={i} onUpdate={setSkills}
              onStartAssessment={s => setAssessSkill(s)} />
          ))}
        </div>
      </div>

      {/* Assessment Modal */}
      <SkillAssessmentModal
        isOpen={!!assessSkill}
        skillName={assessSkill?.name || ''}
        onClose={() => setAssessSkill(null)}
        onPassed={() => {
          setSkills(prev => prev.map(sk =>
            sk.id === assessSkill?.id ? { ...sk, status: 'verified', certUrl: '#' } : sk
          ));
          toast.success(`🎉 تهانينا! تم توثيق مهارة ${assessSkill?.name} في بطاقة SVP`);
        }}
      />
    </div>
  );
}

// ── AI Visual Inspection Tab ──────────────────────────────────────────────────
function AIInspection() {
  const [photos, setPhotos] = useState([]);
  const [inspType, setInspType] = useState('residential');
  const [stage, setStage]   = useState('idle'); // idle | analyzing | results
  const fileRef = useRef(null);

  const handleFiles = e => {
    const previews = Array.from(e.target.files).map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setPhotos(prev => [...prev, ...previews].slice(0, 8));
    setStage('idle');
  };

  const analyze = () => {
    if (photos.length === 0) { toast.error('يرجى رفع صورة واحدة على الأقل'); return; }
    setStage('analyzing');
    setTimeout(() => setStage('results'), 2800);
  };

  const criticalCount = MOCK_INSPECTION.filter(m => m.severity === 'critical' || m.severity === 'high').length;

  return (
    <div className="space-y-5">
      {/* Config card */}
      <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
            <Camera size={18} className="text-violet-500" />
          </div>
          <div>
            <p className="text-navy font-bold text-sm">المعاينة البصرية الرقمية</p>
            <p className="text-charcoal/60 text-xs mt-0.5">ارفع صور العقار لاستخراج ملاحظات فنية تلقائية وفق معايير IVS 2025</p>
          </div>
        </div>

        {/* Inspection type */}
        <div className="flex gap-2 flex-wrap mb-4 items-center">
          <p className="text-charcoal/60 text-xs">نوع المعاينة:</p>
          {[['residential','سكني'],['commercial','تجاري'],['structural','إنشائي'],['equipment','معدة']].map(([v, l]) => (
            <button key={v} onClick={() => setInspType(v)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${inspType === v ? 'bg-violet-500 border-violet-500 text-white' : 'border-navy/15 text-charcoal/60 hover:border-violet-400/40 hover:text-navy'}`}>
              {l}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <div onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-navy/15 hover:border-violet-400/50 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-violet-50/30 mb-4">
          <Upload size={24} className="text-charcoal/30 mx-auto mb-2" />
          <p className="text-charcoal/60 text-sm font-medium">اسحب الصور هنا أو انقر للرفع</p>
          <p className="text-charcoal/40 text-xs mt-1">JPG · PNG · HEIF — حتى 8 صور</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {/* Photo grid preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-4">
            {photos.map((p, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-navy/10">
                <img src={p.url} alt="" className="w-full h-full object-cover" />
                <button onClick={e => { e.stopPropagation(); setPhotos(prev => prev.filter((_, j) => j !== i)); }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={9} className="text-white" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-navy/50 py-0.5 px-1 text-center">
                  <p className="text-white text-[8px] font-mono">{i + 1}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analyze button */}
        <button onClick={analyze} disabled={stage === 'analyzing' || photos.length === 0}
          className="w-full btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
          {stage === 'analyzing'
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جارٍ التحليل الآلي...</>
            : <><Camera size={15} /> بدء التحليل ({photos.length} صور)</>}
        </button>
      </div>

      {/* Results table */}
      <AnimatePresence>
        {stage === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
            style={{ borderRadius: '8px' }}>
            {/* Results header */}
            <div className="px-5 py-4 border-b border-navy/10 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-navy font-bold text-sm">تقرير المعاينة البصرية</p>
                <p className="text-charcoal/50 text-xs mt-0.5">
                  {photos.length} صورة محللة · {MOCK_INSPECTION.length} ملاحظة · {new Date().toLocaleDateString('ar-SY')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <span className="text-[10px] bg-red-50 border border-red-200 text-red-600 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle size={10} /> {criticalCount} تحذير حرج
                  </span>
                )}
                <button onClick={() => toast.success('جارٍ تصدير التقرير PDF...')}
                  className="text-xs border border-navy/15 text-charcoal/60 hover:text-navy px-3 py-1.5 rounded-lg transition-colors">
                  تصدير PDF
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs" dir="rtl">
                <thead>
                  <tr className="bg-cream border-b border-navy/10">
                    {['المنطقة', 'الملاحظة', 'المخاطر المرتبطة', 'الإجراء المقترح', 'الخطورة'].map(h => (
                      <th key={h} className="text-right text-charcoal/60 font-semibold py-3 px-4 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INSPECTION.map((row, i) => {
                    const sc = SEVERITY_CFG[row.severity];
                    return (
                      <motion.tr key={row.id}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.09 }}
                        className="border-b border-navy/[0.06] hover:bg-cream/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-navy whitespace-nowrap">{row.zone}</td>
                        <td className="py-3 px-4 text-charcoal/70 max-w-[180px] leading-relaxed">{row.observation}</td>
                        <td className="py-3 px-4 max-w-[180px] leading-relaxed">
                          <span className={`flex items-start gap-1 ${sc.textMuted}`}>
                            <AlertTriangle size={10} className="mt-0.5 shrink-0" /> {row.risk}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-charcoal/70 max-w-[180px] leading-relaxed">{row.action}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sc.badge}`}>
                            {sc.label}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-navy/10 flex justify-end">
              <button onClick={() => toast.success('تم إرفاق التقرير بنموذج IVS')}
                className="btn-cta text-xs py-2 px-4 flex items-center gap-1.5">
                <FileText size={12} /> إرفاق بتقرير IVS 2025
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = [
  { id: 'tasks',      label: 'المهام الميدانية',    icon: HardHat },
  { id: 'skills',     label: 'مصفوفة المهارات SVP', icon: BadgeCheck },
  { id: 'inspection', label: 'المعاينة البصرية الرقمية', icon: Camera },
  { id: 'freelance',  label: 'فرص العمل الحر',       icon: Briefcase, isNew: true },
];

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks]           = useState(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [filter, setFilter]         = useState('all');
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [activeTab, setActiveTab]   = useState('tasks');
  const [dbReports, setDbReports]   = useState(null); // null = loading

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  // Load past submitted reports from Supabase
  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from('engineering_reports')
      .select('*')
      .eq('engineer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDbReports((data || []).map(r => ({
          id:              r.id,
          title:           r.title || 'تقرير معاينة',
          propertyId:      r.property_id,
          status:          r.status,
          overallScore:    r.overall_score,
          structuralScore: r.structural_score,
          date:            formatDate(r.created_at),
        })));
      });
  }, [user]);

  const openReport  = task => { setSelectedTask(task); setReportOpen(true); };
  const closeReport = () => setReportOpen(false);

  const handleReportSubmitted = data => {
    setTasks(prev => prev.map(t => t.id === data.task?.id ? { ...t, status: 'completed' } : t));
    setSubmittedTasks(prev => [data, ...prev]);
    // Refresh DB reports list after new submission
    if (isConfigured && user) {
      supabase
        .from('engineering_reports')
        .select('id, title, property_id, status, overall_score, structural_score, created_at')
        .eq('engineer_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data: rows }) => {
          if (rows) setDbReports(rows.map(r => ({
            id: r.id, title: r.title || 'تقرير معاينة',
            propertyId: r.property_id, status: r.status,
            overallScore: r.overall_score, structuralScore: r.structural_score,
            date: formatDate(r.created_at),
          })));
        });
    }
    setReportOpen(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-cream pt-16" dir="rtl">

      {/* Header */}
      <div className="bg-white border-b border-navy/10 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-brand font-black text-lg">
              {user?.full_name?.[0] || 'م'}
            </div>
            <div>
              <p className="text-navy font-bold text-sm">{user?.full_name || 'المهندس أحمد'}</p>
              <p className="text-charcoal/60 text-xs flex items-center gap-1">
                <HardHat size={11} /> مهندس ميداني معتمد · نقابة المهندسين السوريين
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-charcoal/60">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-navy font-bold">4.9</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText size={14} className="text-brand" />
              <span>{tasks.filter(t => t.status === 'completed').length + submittedTasks.length} تقرير</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 size={14} className="text-violet-500" />
              <span>{INITIAL_SKILLS.filter(s => s.status === 'verified').length} مهارة محقَّقة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-white border-b border-navy/10 px-4 sticky top-[62px] z-40">
        <div className="max-w-7xl mx-auto flex gap-1 py-2 overflow-x-auto scrollbar-none">
          {TABS.map(({ id, label, icon: Icon, isNew }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all ${activeTab === id ? 'bg-brand text-white' : 'text-charcoal/60 hover:text-navy hover:bg-cream'}`}>
              <Icon size={14} /> {label}
              {isNew && <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${activeTab === id ? 'bg-white/20 text-white' : 'bg-brand/20 text-brand'}`}>جديد</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* ── Tasks tab ── */}
          {activeTab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5">

                {/* Left: task list */}
                <div className="flex flex-col gap-4">
                  <StatsBar tasks={tasks} />
                  <div className="flex gap-2 text-xs flex-wrap">
                    {[['all','الكل'],['pending','معلّق'],['in_progress','جارٍ'],['completed','مكتمل']].map(([val, label]) => (
                      <button key={val} onClick={() => setFilter(val)}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${filter === val ? 'bg-brand text-white' : 'bg-white text-charcoal/60 border border-navy/12 hover:border-brand/30 hover:text-navy'}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
                    {filtered.length === 0
                      ? <p className="text-charcoal/50 text-sm text-center py-8">لا توجد مهام بهذه التصفية</p>
                      : filtered.map(task => (
                          <TaskCard key={task.id} task={task}
                            selected={selectedTask?.id === task.id}
                            onClick={() => setSelectedTask(task)} />
                        ))
                    }
                  </div>
                </div>

                {/* Right: map + task detail */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)]" style={{ height: 340, borderRadius: '8px' }}>
                    <TaskMap tasks={tasks} selectedTask={selectedTask} onSelectTask={setSelectedTask} />
                  </div>

                  {selectedTask ? (
                    <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-start gap-3">
                          <span className="text-3xl">{TYPE_ICON[selectedTask.type]}</span>
                          <div>
                            <h3 className="text-navy font-bold text-base">{selectedTask.property}</h3>
                            <p className="text-charcoal/60 text-sm flex items-center gap-1 mt-0.5">
                              <MapPin size={12} />{selectedTask.city}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedTask(null)} className="text-charcoal/40 hover:text-navy transition-colors"><X size={17} /></button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        {[['المالك', selectedTask.owner], ['الأولوية', PRIORITY_META[selectedTask.priority].label], ['تاريخ الطلب', selectedTask.requested_at], ['الحالة', STATUS_META[selectedTask.status].label]].map(([k, v]) => (
                          <div key={k} className="bg-cream rounded-xl p-3 text-center">
                            <p className="text-charcoal/50 text-xs mb-1">{k}</p>
                            <p className="text-navy font-bold text-sm">{v}</p>
                          </div>
                        ))}
                      </div>

                      {/* WhatsApp — contact owner */}
                      <a href={`https://wa.me/963000000000?text=${encodeURIComponent(`مرحباً ${selectedTask.owner}، أنا المهندس المكلّف بمعاينة عقارك (${selectedTask.property}) — هل يمكننا تنسيق موعد الزيارة الميدانية؟`)}`}
                        target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full mb-3 py-2.5 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
                        <MessageCircle size={14} /> تواصل مع المالك — {selectedTask.owner}
                      </a>

                      {/* QR Check-in */}
                      {selectedTask.status !== 'completed' && (
                        <div className="mb-3">
                          <QRCheckIn task={selectedTask} />
                        </div>
                      )}

                      {selectedTask.status !== 'completed' ? (
                        <button onClick={() => openReport(selectedTask)}
                          className="btn-cta w-full flex items-center justify-center gap-2">
                          <FileText size={16} /> فتح نموذج التقرير الفني (IVS 2025)
                        </button>
                      ) : (
                        <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-200 rounded-xl py-3 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} /> تم رفع التقرير بنجاح
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-8 text-center text-charcoal/40 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                      <HardHat size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">اختر مهمة من القائمة أو الخريطة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Submitted Reports History (from Supabase) ── */}
              {isConfigured && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-brand" />
                    <h3 className="text-navy font-bold text-sm">سجل التقارير المرفوعة</h3>
                    {dbReports !== null && (
                      <span className="text-xs bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                        {dbReports.length}
                      </span>
                    )}
                  </div>

                  {dbReports === null ? (
                    /* Loading skeleton */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-xl p-4 animate-pulse shadow-sm">
                          <div className="h-3 bg-navy/10 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-navy/10 rounded w-1/2 mb-3" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-navy/10 rounded-lg w-16" />
                            <div className="h-6 bg-navy/10 rounded-lg w-16" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dbReports.length === 0 ? (
                    <div className="bg-white rounded-xl p-6 text-center text-charcoal/40 shadow-sm">
                      <FileText size={24} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">لا توجد تقارير مرفوعة بعد</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dbReports.map(r => (
                        <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm border border-navy/6 hover:border-brand/20 transition-colors">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <p className="text-navy font-bold text-sm leading-tight line-clamp-1">{r.title}</p>
                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              r.status === 'approved'  ? 'bg-green-100 text-green-700' :
                              r.status === 'submitted' ? 'bg-brand/10 text-brand' :
                              'bg-navy/10 text-charcoal/60'
                            }`}>
                              {r.status === 'approved' ? 'معتمد' : r.status === 'submitted' ? 'مرفوع' : 'مسودة'}
                            </span>
                          </div>
                          <p className="text-charcoal/50 text-xs mb-3">{r.date}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {r.overallScore != null && (
                              <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium ${
                                r.overallScore >= 8 ? 'bg-green-50 text-green-700' :
                                r.overallScore >= 5 ? 'bg-yellow-50 text-yellow-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                <Star size={10} className="fill-current" />
                                {r.overallScore}/10
                              </span>
                            )}
                            {r.structuralScore != null && (
                              <span className="text-xs px-2 py-1 rounded-lg bg-violet-50 text-violet-700 font-medium">
                                إنشائي {r.structuralScore}/10
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Skills Matrix tab ── */}
          {activeTab === 'skills' && (
            <motion.div key="skills" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SkillsMatrix />
            </motion.div>
          )}

          {/* ── AI Inspection tab ── */}
          {activeTab === 'inspection' && (
            <motion.div key="inspection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AIInspection />
            </motion.div>
          )}

          {/* ── Freelance tab ── */}
          {activeTab === 'freelance' && (
            <motion.div key="freelance" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <FreelanceMarketplace skills={INITIAL_SKILLS} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* IVS Report Drawer */}
      {reportOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeReport} />
          <div className="absolute top-0 left-0 bottom-0 w-full max-w-2xl bg-white border-l border-navy/10 shadow-2xl overflow-y-auto flex flex-col" dir="rtl">
            <div className="sticky top-0 z-10 bg-white border-b border-navy/10 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-navy font-bold text-sm">{selectedTask.property}</p>
                <p className="text-charcoal/50 text-xs">{selectedTask.city} · تقرير IVS 2025</p>
              </div>
              <button onClick={closeReport}
                className="w-8 h-8 rounded-lg border border-navy/12 hover:border-navy/30 flex items-center justify-center text-charcoal/50 hover:text-navy transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 p-5">
              <IVSReportForm task={selectedTask} onSubmitted={handleReportSubmitted} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
