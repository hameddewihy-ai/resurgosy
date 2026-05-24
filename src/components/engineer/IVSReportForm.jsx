import { useState } from 'react';
import { Shield, ShieldCheck, Loader2, Send, Copy, CheckCheck, AlertCircle } from 'lucide-react';
import SignaturePad from './SignaturePad';
import { useDigitalSignature } from '../../hooks/useDigitalSignature';
import { useAuth } from '../../context/AuthContext';

// ─── IVS 2025 rating system ────────────────────────────────────────────────
const RATING_LABELS = ['متهالك', 'سيء', 'مقبول', 'جيد', 'ممتاز'];
const RATING_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

function RatingSelector({ value, onChange, disabled }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => !disabled && onChange(n)}
          title={RATING_LABELS[n - 1]}
          className={`w-9 h-9 rounded-lg font-bold text-sm border-2 transition-all ${
            value === n
              ? 'text-white border-transparent shadow-lg scale-110'
              : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-400'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          style={value === n ? { background: RATING_COLORS[n - 1], borderColor: RATING_COLORS[n - 1] } : {}}>
          {n}
        </button>
      ))}
      {value > 0 && (
        <span className="flex items-center text-xs font-medium mr-1" style={{ color: RATING_COLORS[value - 1] }}>
          {RATING_LABELS[value - 1]}
        </span>
      )}
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────
function Section({ title, standard, children }) {
  return (
    <div className="border border-slate-700/60 rounded-2xl overflow-hidden">
      <div className="bg-slate-800/60 px-5 py-3 flex items-center justify-between">
        <h3 className="text-white font-bold text-sm">{title}</h3>
        <span className="text-xs text-slate-500 font-mono bg-slate-700/60 px-2 py-0.5 rounded">{standard}</span>
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium block mb-1.5">
        {label}{required && <span className="text-red-400 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Structural row ────────────────────────────────────────────────────────
function StructuralRow({ label, value, onChange, note, onNoteChange, disabled }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-b border-slate-700/40 last:border-0">
      <div>
        <p className="text-slate-300 text-sm font-medium mb-2">{label}</p>
        <RatingSelector value={value} onChange={onChange} disabled={disabled} />
      </div>
      <input value={note} onChange={(e) => onNoteChange(e.target.value)}
        placeholder="ملاحظة (اختياري)" disabled={disabled}
        className="input-field text-xs py-2 self-end" />
    </div>
  );
}

// ─── Seal display ──────────────────────────────────────────────────────────
function SealDisplay({ sealHash, reportHash, timestamp, engineerId }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(sealHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-5 space-y-3" dir="rtl">
      <div className="flex items-center gap-2 text-green-400 font-bold">
        <ShieldCheck size={20} />
        <span>تم التوقيع الرقمي بنجاح</span>
      </div>
      <div className="space-y-2 text-xs font-mono">
        {[
          ['ختم الإرسال (Seal Hash)', sealHash],
          ['بصمة التقرير', reportHash],
          ['توقيت الإصدار', new Date(timestamp).toLocaleString('ar-SY')],
          ['معرف المهندس', engineerId],
        ].map(([k, v]) => (
          <div key={k} className="bg-slate-800/60 rounded-lg px-3 py-2">
            <p className="text-slate-500 mb-0.5">{k}</p>
            <p className="text-green-300 break-all">{v}</p>
          </div>
        ))}
      </div>
      <button onClick={copy}
        className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
        {copied ? <CheckCheck size={14} className="text-green-400" /> : <Copy size={14} />}
        {copied ? 'تم النسخ' : 'نسخ الختم'}
      </button>
    </div>
  );
}

// ─── INITIAL STATE ─────────────────────────────────────────────────────────
const mkStructural = () => ({ rating: 0, note: '' });

const INITIAL = {
  // IVS 101 – Scope of Work
  valuation_purpose: '',
  basis_of_value: 'market_value',
  inspection_date: new Date().toISOString().slice(0, 10),
  // IVS 400 – Real Property
  gross_area_m2: '',
  net_area_m2: '',
  floors: '',
  build_year: '',
  legal_status: '',
  // IVS 400 Structural (ratings 1-5)
  structural: {
    foundation:    mkStructural(),
    load_bearing:  mkStructural(),
    roof:          mkStructural(),
    exterior:      mkStructural(),
    interior:      mkStructural(),
    electrical:    mkStructural(),
    plumbing:      mkStructural(),
    hvac:          mkStructural(),
    fire_safety:   mkStructural(),
    accessibility: mkStructural(),
  },
  // IVS 400.20 – Market
  market_condition: '',
  comparable_1_price: '',
  comparable_2_price: '',
  comparable_3_price: '',
  // AVM
  avm_valuation: '',
  valuation_approach: 'sales_comparison',
  // Defects & recommendations
  defects: '',
  maintenance_estimate: '',
  recommendations: '',
};

const STRUCTURAL_LABELS = {
  foundation:    'الأساسات والحفر',
  load_bearing:  'الهيكل الإنشائي',
  roof:          'السقف والعوازل',
  exterior:      'الجدران الخارجية',
  interior:      'التشطيبات الداخلية',
  electrical:    'الأنظمة الكهربائية',
  plumbing:      'الصحي والميكانيكي',
  hvac:          'التهوية والتكييف',
  fire_safety:   'السلامة من الحريق',
  accessibility: 'إمكانية الوصول',
};

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────
export default function IVSReportForm({ task, onSubmitted }) {
  const { user } = useAuth();
  const { signReport, signing, error: sigError } = useDigitalSignature();

  const [form, setForm] = useState(INITIAL);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sealResult, setSealResult] = useState(null);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setStructural = (key, field, val) =>
    setForm((f) => ({ ...f, structural: { ...f.structural, [key]: { ...f.structural[key], [field]: val } } }));

  const avgStructural = () => {
    const vals = Object.values(form.structural).map((s) => s.rating).filter((r) => r > 0);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  };

  const handleSign = async () => {
    const result = await signReport({
      engineerId: user?.id || 'ENG-DEMO',
      reportData: { ...form, taskId: task.id, propertyTitle: task.property },
      signatureDataUrl,
    });
    if (result) setSealResult(result);
  };

  const handleFinalSubmit = () => {
    setSubmitting(true);
    // Simulate sending to investment department
    setTimeout(() => {
      setSubmitting(false);
      onSubmitted?.({ ...form, seal: sealResult, task });
    }, 1200);
  };

  const isLocked = !!sealResult;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white font-black text-base flex items-center gap-2">
            <Shield size={18} className="text-brand" />
            تقرير الفحص الفني — IVS 2025
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-mono">{task.property} · {task.city}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-brand/10 border border-brand/20 text-brand px-2 py-1 rounded-lg">IVS 101</span>
          <span className="text-xs bg-brand/10 border border-brand/20 text-brand px-2 py-1 rounded-lg">IVS 400</span>
        </div>
      </div>

      {/* ── Section A: Scope of Work (IVS 101) ── */}
      <Section title="أ. نطاق العمل والتعريف" standard="IVS 101.20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="الغرض من التقييم" required>
            <input value={form.valuation_purpose} onChange={(e) => set('valuation_purpose', e.target.value)}
              placeholder="إعادة بيع، رهن، ميراث..." disabled={isLocked}
              className="input-field" />
          </Field>
          <Field label="أساس القيمة (Basis of Value)">
            <select value={form.basis_of_value} onChange={(e) => set('basis_of_value', e.target.value)}
              disabled={isLocked} className="input-field appearance-none">
              <option value="market_value">القيمة السوقية (Market Value)</option>
              <option value="investment_value">قيمة الاستثمار (Investment Value)</option>
              <option value="fair_value">القيمة العادلة (Fair Value)</option>
              <option value="liquidation_value">قيمة التصفية</option>
            </select>
          </Field>
          <Field label="تاريخ الفحص الميداني">
            <input type="date" value={form.inspection_date} onChange={(e) => set('inspection_date', e.target.value)}
              disabled={isLocked} className="input-field" />
          </Field>
        </div>
      </Section>

      {/* ── Section B: Physical Characteristics (IVS 400.4) ── */}
      <Section title="ب. الخصائص المادية للعقار" standard="IVS 400.4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            ['gross_area_m2', 'المساحة الإجمالية (م²)', '200'],
            ['net_area_m2',   'المساحة الصافية (م²)',   '185'],
            ['floors',        'عدد الطوابق',             '3'],
            ['build_year',    'سنة البناء',              '2005'],
          ].map(([key, label, ph]) => (
            <Field key={key} label={label}>
              <input type="number" value={form[key]} onChange={(e) => set(key, e.target.value)}
                placeholder={ph} disabled={isLocked} className="input-field" />
            </Field>
          ))}
        </div>
        <Field label="الوضع القانوني للعقار">
          <input value={form.legal_status} onChange={(e) => set('legal_status', e.target.value)}
            placeholder="مثال: ملكية حرة — وثيقة تمليك مسجّلة في الكاداستر" disabled={isLocked}
            className="input-field" />
        </Field>
      </Section>

      {/* ── Section C: Structural Assessment (IVS 400 / RICS) ── */}
      <Section title="ج. التقييم الإنشائي والتقني" standard="IVS 400 / RICS">
        <div className="flex items-center justify-between mb-2">
          <p className="text-slate-400 text-xs">قيّم كل عنصر من 1 (متهالك) إلى 5 (ممتاز)</p>
          <div className="text-xs text-slate-300">
            متوسط التقييم: <span className="font-bold text-brand">{avgStructural()}</span> / 5
          </div>
        </div>
        {Object.entries(STRUCTURAL_LABELS).map(([key, label]) => (
          <StructuralRow
            key={key}
            label={label}
            value={form.structural[key].rating}
            onChange={(v) => setStructural(key, 'rating', v)}
            note={form.structural[key].note}
            onNoteChange={(v) => setStructural(key, 'note', v)}
            disabled={isLocked}
          />
        ))}
      </Section>

      {/* ── Section D: Market Analysis (IVS 400.20) ── */}
      <Section title="د. تحليل السوق والمقارنات" standard="IVS 400.20">
        <Field label="ظروف السوق الراهنة">
          <textarea value={form.market_condition} onChange={(e) => set('market_condition', e.target.value)}
            rows={3} placeholder="وصف موجز لحالة سوق العقارات في المنطقة..." disabled={isLocked}
            className="input-field resize-none text-sm" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Field key={n} label={`عقار مقارن ${n} (USD/م²)`}>
              <input type="number" value={form[`comparable_${n}_price`]}
                onChange={(e) => set(`comparable_${n}_price`, e.target.value)}
                placeholder="1200" disabled={isLocked} className="input-field" />
            </Field>
          ))}
        </div>
      </Section>

      {/* ── Section E: Valuation (IVS 103.2) ── */}
      <Section title="هـ. التقييم النهائي (AVM)" standard="IVS 103.2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="نهج التقييم المعتمد">
            <select value={form.valuation_approach} onChange={(e) => set('valuation_approach', e.target.value)}
              disabled={isLocked} className="input-field appearance-none">
              <option value="sales_comparison">نهج المقارنة البيعية</option>
              <option value="income">نهج الدخل</option>
              <option value="cost">نهج التكلفة</option>
            </select>
          </Field>
          <Field label="القيمة السوقية التقديرية (USD)" required>
            <input type="number" value={form.avm_valuation} onChange={(e) => set('avm_valuation', e.target.value)}
              placeholder="85000" disabled={isLocked} className="input-field font-bold text-lg text-brand" />
          </Field>
        </div>
      </Section>

      {/* ── Section F: Defects & Recommendations ── */}
      <Section title="و. العيوب والتوصيات" standard="IVS 102.3">
        <Field label="العيوب والمخاطر المُكتشفة">
          <textarea value={form.defects} onChange={(e) => set('defects', e.target.value)}
            rows={3} placeholder="صف العيوب الملاحظة بالتفصيل..." disabled={isLocked}
            className="input-field resize-none text-sm" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="تكلفة الصيانة التقديرية (USD)">
            <input type="number" value={form.maintenance_estimate} onChange={(e) => set('maintenance_estimate', e.target.value)}
              placeholder="5000" disabled={isLocked} className="input-field" />
          </Field>
          <Field label="التوصية العامة">
            <select value={form.recommendations} onChange={(e) => set('recommendations', e.target.value)}
              disabled={isLocked} className="input-field appearance-none">
              <option value="">اختر التوصية</option>
              <option value="approved">مُعتمد للبيع/الاستثمار</option>
              <option value="conditional">مشروط بصيانة</option>
              <option value="rejected">مرفوض — يحتاج إعادة تقييم</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* ── Section G: Digital Signature ── */}
      <Section title="ز. التوقيع الرقمي والختم الرسمي" standard="IVS 103.7">
        {sealResult ? (
          <SealDisplay {...sealResult} />
        ) : (
          <div className="space-y-4">
            <SignaturePad onSigned={setSignatureDataUrl} disabled={isLocked} />

            {sigError && (
              <div className="flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm">
                <AlertCircle size={16} />
                {sigError}
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 text-xs text-slate-400 space-y-1" dir="rtl">
              <p className="text-slate-300 font-medium mb-2">آلية التوقيع الرقمي</p>
              <p>① يتم دمج بيانات التقرير + صورة التوقيع في حزمة واحدة</p>
              <p>② توليد SHA-256 hash لبيانات التقرير</p>
              <p>③ دمج معرف المهندس + الطابع الزمني + hash التقرير</p>
              <p>④ توليد ختم رقمي نهائي (Seal Hash) غير قابل للتعديل</p>
            </div>

            <button
              type="button"
              onClick={handleSign}
              disabled={!signatureDataUrl || signing || !form.avm_valuation}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {signing
                ? <><Loader2 size={17} className="animate-spin" /> جارٍ توليد الختم الرقمي...</>
                : <><Shield size={17} /> تشفير وتوقيع التقرير</>}
            </button>
            {!form.avm_valuation && (
              <p className="text-amber-400/70 text-xs text-center">* أدخل القيمة التقديرية (AVM) أولاً</p>
            )}
          </div>
        )}
      </Section>

      {/* ── Final Submit ── */}
      {sealResult && (
        <button
          onClick={handleFinalSubmit}
          disabled={submitting}
          className="btn-cta w-full flex items-center justify-center gap-2 text-base disabled:opacity-60"
        >
          {submitting
            ? <><Loader2 size={18} className="animate-spin" /> جارٍ الإرسال...</>
            : <><Send size={18} /> إرسال التقرير إلى قسم الاستثمار</>}
        </button>
      )}
    </div>
  );
}
