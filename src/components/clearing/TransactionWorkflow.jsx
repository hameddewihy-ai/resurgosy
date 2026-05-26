import { useState } from 'react';
import { ChevronLeft, ChevronRight, Users, FileText, Scale, Archive, CheckCircle } from 'lucide-react';
import DocumentReader from './DocumentReader';
import LegalDraftGenerator from './LegalDraftGenerator';
import SovereignArchive from './SovereignArchive';
import { useAIClearing } from '../../hooks/useAIClearing';
import { useAuth } from '../../context/AuthContext';

// ── Transaction type registry ──────────────────────────────────────────────
const TX_TYPES = [
  {
    id: 'sale',
    label: 'بيع قطعي',
    icon: '🏠',
    desc: 'نقل ملكية عقار بعوض مالي',
    parties: ['البائع', 'المشتري'],
    partyFields: {
      البائع:  ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة', 'رقم الهاتف'],
      المشتري: ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة', 'رقم الهاتف'],
    },
    requiredDocs: ['طابو أخضر / سند ملكية', 'هوية البائع', 'هوية المشتري', 'وثيقة "لا مانع" أمنية', 'براءة ذمة مالية وبلدية'],
    draftType: 'sale_contract',
    steps: ['نوع المعاملة', 'بيانات الأطراف', 'وثائق الملكية', 'صياغة العقد', 'أرشفة سيادية'],
    taxNote: 'تُحسب الضريبة على القيمة العقدية الرضائية — استخدم حاسبة الضريبة في تبويب الأدوات',
  },
  {
    id: 'inheritance',
    label: 'إرث وتركات',
    icon: '⚖️',
    desc: 'حصر إرث وتوزيع التركة',
    parties: ['المتوفى', 'الورثة'],
    partyFields: {
      المتوفى: ['الاسم الكامل', 'الرقم الوطني', 'تاريخ الوفاة', 'مكان القيد', 'الديانة'],
      الورثة:  ['أسماء الورثة وحصصهم السهمية', 'أرقامهم الوطنية'],
    },
    requiredDocs: ['شهادة الوفاة', 'قيد عائلي', 'قيود مدنية للورثة', 'تصريح تركة للدائرة المالية', 'براءة ذمة التركة'],
    draftType: 'inheritance_inventory',
    steps: ['نوع المعاملة', 'بيانات المتوفى والورثة', 'وثائق التركة', 'حصر الإرث', 'أرشفة سيادية'],
    taxNote: 'الإرث معفى من ضريبة البيوع العقارية — تُدفع فقط رسوم التسجيل',
  },
  {
    id: 'attorney_special',
    label: 'وكالة خاصة',
    icon: '📜',
    desc: 'وكالة محددة لتصرف قانوني معين',
    parties: ['الموكِّل', 'الوكيل'],
    partyFields: {
      'الموكِّل': ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة', 'رقم الهاتف'],
      'الوكيل':  ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة', 'رقم الهاتف'],
    },
    requiredDocs: ['هوية الموكِّل', 'هوية الوكيل', 'بيان قيد عقاري (أقل من 3 أشهر)', 'وصف العقار الموكَّل ببيعه'],
    draftType: 'attorney_special',
    steps: ['نوع المعاملة', 'بيانات الأطراف', 'نطاق الوكالة', 'صياغة الوكالة', 'أرشفة سيادية'],
    taxNote: 'تنتهي الوكالة الخاصة بإتمام العمل الموكَّل به تلقائياً',
  },
  {
    id: 'attorney_irrev',
    label: 'وكالة غير قابلة للعزل',
    icon: '🔒',
    desc: 'بيع منجز لا يحق للموكِّل فسخه',
    parties: ['البائع (الموكِّل)', 'المشتري (الوكيل)'],
    partyFields: {
      'البائع (الموكِّل)': ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
      'المشتري (الوكيل)':  ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
    },
    requiredDocs: ['هوية الطرفين', 'إثبات سداد الثمن', 'بيان قيد عقاري', 'وصف دقيق للعقار'],
    draftType: 'attorney_irrevocable',
    steps: ['نوع المعاملة', 'بيانات الأطراف', 'وثيقة الملكية', 'صياغة الوكالة', 'أرشفة سيادية'],
    taxNote: 'تسقط بالتقادم العشري — تحقق من التاريخ في متتبع الوثائق',
  },
  {
    id: 'court_exec',
    label: 'تنفيذ أحكام قضائية',
    icon: '⚖️',
    desc: 'نقل ملكية بموجب حكم قضائي مبرم',
    parties: ['المحكوم له', 'المحكوم عليه'],
    partyFields: {
      'المحكوم له':   ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
      'المحكوم عليه': ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
    },
    requiredDocs: ['صورة الحكم المبرم', 'ما يثبت اكتساب القطعية', 'براءة الذمة المالية', 'موافقة "لا مانع" الأمنية', 'ترخيص حدودي (إن لزم)'],
    draftType: 'title_recovery',
    steps: ['نوع المعاملة', 'بيانات الحكم والأطراف', 'دائرة التنفيذ', 'براءة الذمة', 'القيد في السجل العقاري'],
    taxNote: 'وقت التنفيذ المتوقع: 1–3 أشهر من تاريخ تقديم الطلب',
  },
  {
    id: 'diaspora',
    label: 'معاملات مغتربين',
    icon: '✈️',
    desc: 'وكالات وتوثيق عبر السفارات',
    parties: ['المغترب (الموكِّل)', 'الوكيل المحلي'],
    partyFields: {
      'المغترب (الموكِّل)': ['الاسم الكامل', 'الرقم الوطني', 'دولة الإقامة', 'رقم جواز السفر'],
      'الوكيل المحلي':      ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة في سوريا'],
    },
    requiredDocs: ['جواز السفر', 'الوكالة المنظمة في السفارة', 'تصديق وزارة خارجية', 'قيد عقاري حديث (3 أشهر)'],
    draftType: 'attorney_special',
    steps: ['نوع المعاملة', 'بيانات المغترب والوكيل', 'سلسلة التصديق', 'صياغة الوكالة', 'أرشفة سيادية'],
    taxNote: 'صلاحية الوكالة الخارجية 12 شهراً من التنظيم — راجع متتبع الوثائق',
  },
  {
    id: 'auction',
    label: 'مزاد علني',
    icon: '🔨',
    desc: 'بيع بالمزاد لتنفيذ ديون أو أحكام',
    parties: ['المالك الأصلي', 'الراسي عليه المزاد'],
    partyFields: {
      'المالك الأصلي':         ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
      'الراسي عليه المزاد':    ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة'],
    },
    requiredDocs: ['براءة ذمة مالية', 'بيان قيد مالي وعقاري', 'قيد مدني للمالك', 'هوية المشتري', 'محضر جلسة المزاد'],
    draftType: 'sale_contract',
    steps: ['نوع المعاملة', 'بيانات الأطراف', 'وثائق المزاد (6 نسخ)', 'عقد الفراغ النهائي', 'أرشفة سيادية'],
    taxNote: 'يُحرر عقد عقاري من 6 نسخ تمهيداً للفراغ النهائي',
  },
  {
    id: 'recovery',
    label: 'استرداد ملكية',
    icon: '🏛️',
    desc: 'استرداد ملكية مستملَكة أو متنازَع عليها',
    parties: ['مقدم الطلب'],
    partyFields: {
      'مقدم الطلب': ['الاسم الكامل', 'الرقم الوطني', 'محل الإقامة', 'صفته القانونية'],
    },
    requiredDocs: ['وثيقة الملكية الأصلية أو الإرثية', 'بيان وصف العقار', 'سند تثبيت الحق', 'المستندات المرفقة'],
    draftType: 'title_recovery',
    steps: ['نوع المعاملة', 'بيانات الطلب', 'الأساس القانوني', 'صياغة الطلب', 'أرشفة سيادية'],
    taxNote: 'القانون رقم 10 / 2018 وتعديلاته — حق الملكية الدستوري المادة 15',
  },
];

// ── Party data form ────────────────────────────────────────────────────────
function PartyForm({ txType, partyData, onChange }) {
  if (!txType) return null;
  const { parties, partyFields } = txType;

  return (
    <div className="space-y-5">
      {/* Required docs reminder */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-700 font-bold text-xs mb-2 flex items-center gap-1.5">
          <FileText size={13} />
          الوثائق المطلوبة لهذه المعاملة
        </p>
        <ul className="space-y-1">
          {txType.requiredDocs.map((d, i) => (
            <li key={i} className="text-blue-600/80 text-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Tax note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
        💡 {txType.taxNote}
      </div>

      {/* Party fields */}
      {parties.map(party => (
        <div key={party} className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <p className="text-navy font-bold text-sm flex items-center gap-2">
            <Users size={14} className="text-brand" />
            {party}
          </p>
          {(partyFields[party] || []).map(field => (
            <div key={field}>
              <label className="text-[10px] font-bold text-charcoal/60 block mb-1">{field}</label>
              <textarea
                rows={field.includes('أسماء') ? 3 : 1}
                value={partyData?.[party]?.[field] || ''}
                onChange={e => onChange(party, field, e.target.value)}
                placeholder={`أدخل ${field}`}
                className="w-full px-3 py-2 rounded-xl border border-navy/12 focus:border-brand/40 text-xs text-navy outline-none resize-none"
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Step bar ───────────────────────────────────────────────────────────────
function StepBar({ steps, current }) {
  return (
    <div className="flex items-center gap-0 mb-6 overflow-x-auto scrollbar-none">
      {steps.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all ${done ? 'bg-brand border-brand text-white' : active ? 'bg-brand/5 border-brand text-brand' : 'bg-cream border-navy/15 text-charcoal/40'}`}>
                {done ? <CheckCircle size={13} strokeWidth={2.5} /> : <span className="text-[10px] font-bold">{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap max-w-[64px] text-center leading-tight ${active ? 'text-brand' : done ? 'text-charcoal/70' : 'text-charcoal/40'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-10 mx-1 mb-4 transition-all shrink-0 ${done ? 'bg-brand' : 'bg-navy/15'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function TransactionWorkflow({ onComplete }) {
  const { user } = useAuth();
  const { extractState, archiveState, extractDocument, archiveSovereign } = useAIClearing();

  const [step,       setStep]       = useState(0);
  const [txTypeId,   setTxTypeId]   = useState(null);
  const [partyData,  setPartyData]  = useState({});
  const [draft,      setDraft]      = useState(null);

  const txType = TX_TYPES.find(t => t.id === txTypeId);
  const steps  = txType?.steps || ['نوع المعاملة'];

  const updateParty = (party, field, val) =>
    setPartyData(prev => ({ ...prev, [party]: { ...(prev[party] || {}), [field]: val } }));

  const handleExtract = (file) => extractDocument(file);
  const handleExtracted = (result) => { if (result && step === 2) setTimeout(() => setStep(3), 300); };
  const handleDraftReady = (d) => { setDraft(d); };

  const handleArchive = async () => {
    if (!draft?.text) return;
    await archiveSovereign({
      refNo: draft.refNo,
      docType: txType?.label || draft.claimType,
      draftText: draft.text,
      clerkId: user?.id || 'CLERK-DEMO',
    });
  };

  const reset = () => { setStep(0); setTxTypeId(null); setPartyData({}); setDraft(null); };

  // ── Step 0: type selection ─────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="space-y-4" dir="rtl">
        <p className="text-xs font-bold text-charcoal/60">اختر نوع المعاملة</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TX_TYPES.map(t => (
            <button key={t.id} onClick={() => { setTxTypeId(t.id); setStep(1); }}
              className="bg-white p-4 text-right shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] hover:bg-brand/5 rounded-lg transition-all group">
              <span className="text-2xl block mb-2">{t.icon}</span>
              <p className="text-navy font-bold text-sm group-hover:text-brand transition-colors">{t.label}</p>
              <p className="text-charcoal/50 text-[10px] mt-1 leading-tight">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Steps 1–4 ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4" dir="rtl">
      {/* Step bar */}
      <StepBar steps={steps} current={step - 1} />

      {/* Step 1: party data */}
      {step === 1 && (
        <div className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm flex items-center gap-2">
            <Users size={16} className="text-brand" />
            {steps[0]}: بيانات الأطراف
          </h3>
          <PartyForm txType={txType} partyData={partyData} onChange={updateParty} />
        </div>
      )}

      {/* Step 2: document upload */}
      {step === 2 && (
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
            <FileText size={16} className="text-brand" />
            القراءة الآلية للوثائق
          </h3>
          <DocumentReader
            onExtracted={(file) => handleExtract(file).then(r => { if (r) handleExtracted(r); })}
            extracting={extractState.loading}
            extractResult={extractState.result}
          />
          {extractState.error && (
            <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-medium">
              {extractState.error}
            </div>
          )}
          {extractState.result && (
            <button onClick={() => setStep(3)}
              className="btn-cta w-full mt-5 flex items-center justify-center gap-2">
              التالي: صياغة المسودة
              <ChevronLeft size={17} />
            </button>
          )}
        </div>
      )}

      {/* Step 3: draft */}
      {step === 3 && (
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
            <Scale size={16} className="text-brand" />
            صياغة المسودة القانونية
          </h3>
          <LegalDraftGenerator
            extractResult={extractState.result}
            forcedType={txType?.draftType}
            partyData={partyData}
            onDraftReady={handleDraftReady}
          />
          {draft && (
            <button onClick={() => setStep(4)}
              className="btn-cta w-full mt-5 flex items-center justify-center gap-2">
              التالي: الأرشفة السيادية
              <ChevronLeft size={17} />
            </button>
          )}
        </div>
      )}

      {/* Step 4: archive */}
      {step === 4 && (
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
            <Archive size={16} className="text-brand" />
            الأرشفة السيادية المشفّرة
          </h3>
          <SovereignArchive
            draft={draft}
            onArchive={handleArchive}
            archiving={archiveState.loading}
            archiveResult={archiveState.result}
          />
          {archiveState.result && (
            <div className="mt-5 flex gap-3">
              <button onClick={() => onComplete?.(archiveState.result)}
                className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Archive size={15} />
                عرض في الأرشيف
              </button>
              <button onClick={reset}
                className="flex-1 text-sm border border-navy/15 text-charcoal/60 hover:text-navy py-3 rounded-xl transition-colors">
                معاملة جديدة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      {step > 0 && step < 4 && (
        <div className="flex gap-3">
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-navy/15 text-charcoal/60 hover:text-navy text-sm transition-colors">
            <ChevronRight size={15} />
            السابق
          </button>
          {step < 4 && step !== 2 && (
            <button onClick={() => setStep(s => s + 1)}
              className="flex-1 btn-cta flex items-center justify-center gap-2">
              التالي
              <ChevronLeft size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
