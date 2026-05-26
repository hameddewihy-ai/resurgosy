import { useState, useRef } from 'react';
import { SYRIA_GOVERNORATES as CITIES } from '../../data/syriaLocations';
import { useGlobalData } from '../../context/GlobalContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, CheckCircle, Clock, ChevronLeft, ChevronRight,
  Upload, X, Search, FileText, Shield, Users, MapPin,
  Phone, Mail, User, Hash, Building2, AlertCircle,
  Sparkles, ArrowLeft, Eye, Bell, AlertTriangle,
} from 'lucide-react';
import PageHero from '../../components/PageHero';
import { useNews } from '../../hooks/useNews';
import { URGENCY } from '../../data/newsData';

// ── Services catalogue ─────────────────────────────────────────────────────
const SERVICES = [
  {
    id: 'sale',
    icon: '🏠',
    label: 'بيع عقار (نقل ملكية)',
    desc: 'إتمام إجراءات البيع القطعي وفراغ الملكية في السجل العقاري',
    fee: 75,
    days: '3–5 أيام عمل',
    docs: ['سند الملكية (طابو)', 'هويات الطرفين', 'براءة ذمة مالية'],
    popular: true,
    steps: ['التحقق من الوثائق', 'موافقة أمنية "لا مانع"', 'حساب الضريبة 2025', 'توليد عقد البيع', 'الفراغ في السجل العقاري'],
  },
  {
    id: 'inheritance',
    icon: '⚖️',
    label: 'حصر إرث وتوزيع تركة',
    desc: 'استخراج حجة حصر الإرث وتسجيل العقارات بأسماء الورثة',
    fee: 50,
    days: '5–7 أيام عمل',
    docs: ['شهادة الوفاة', 'قيد عائلي', 'قيود مدنية للورثة'],
    popular: false,
    steps: ['استخراج حصر الإرث', 'تصريح التركة للمالية', 'براءة ذمة التركة', 'توزيع الحصص السهمية', 'تسجيل في السجل العقاري'],
  },
  {
    id: 'attorney_special',
    icon: '📜',
    label: 'وكالة خاصة ببيع عقار',
    desc: 'تنظيم وكالة خاصة محددة الصلاحيات لدى كاتب العدل',
    fee: 40,
    days: '1–2 يوم عمل',
    docs: ['هوية الموكِّل', 'هوية الوكيل', 'بيان قيد عقاري حديث'],
    popular: false,
    steps: ['التحقق من الهويات', 'تحديد صلاحيات الوكالة', 'صياغة سند الوكالة', 'توثيق لدى كاتب العدل', 'تسجيل إشارة في السجل العقاري'],
  },
  {
    id: 'attorney_irrev',
    icon: '🔒',
    label: 'وكالة غير قابلة للعزل',
    desc: 'بيع منجز لا يحق للموكّل فسخه — يُسجَّل تلقائياً على صحيفة العقار',
    fee: 60,
    days: '2–3 أيام عمل',
    docs: ['هويات الطرفين', 'إثبات سداد الثمن', 'بيان قيد عقاري'],
    popular: false,
    steps: ['التحقق من سداد الثمن', 'صياغة سند الوكالة', 'توثيق لدى كاتب العدل', 'تسجيل إشارة فورية', 'تسليم النسخ القانونية'],
  },
  {
    id: 'court_exec',
    icon: '🏛',
    label: 'تنفيذ حكم قضائي عقاري',
    desc: 'نقل الملكية بموجب حكم قضائي مبرم عبر دائرة التنفيذ',
    fee: 100,
    days: '30–90 يوم',
    docs: ['صورة الحكم المبرم', 'ما يُثبت القطعية', 'براءة ذمة مالية'],
    popular: false,
    steps: ['تحصين الحكم القضائي', 'فتح ملف في دائرة التنفيذ', 'الموافقات الإدارية والأمنية', 'براءة الذمة المالية', 'القيد في المصالح العقارية'],
  },
  {
    id: 'diaspora',
    icon: '✈️',
    label: 'معاملات المغتربين',
    desc: 'وكالات وتوثيق عبر السفارات السورية لإدارة العقارات من الخارج',
    fee: 60,
    days: '7–14 يوم',
    docs: ['جواز السفر', 'وكالة منظمة في السفارة', 'تصديق وزارة خارجية'],
    popular: true,
    steps: ['إرشاد تنظيم الوكالة بالسفارة', 'متابعة سلسلة التصديق', 'توثيق لدى كاتب العدل المحلي', 'مراجعة جميع الدوائر', 'إتمام المعاملة وتسليم الوثائق'],
  },
  {
    id: 'auction',
    icon: '🔨',
    label: 'بيع بالمزاد العلني',
    desc: 'تنفيذ إجراءات المزاد وتحرير عقد الفراغ للراسي عليه المزاد',
    fee: 80,
    days: '5–10 أيام',
    docs: ['محضر جلسة المزاد', 'براءة ذمة مالية', 'هوية المشتري'],
    popular: false,
    steps: ['مراجعة محضر المزاد', 'استخراج بيان القيد', 'براءة ذمة شاملة', 'تحرير عقد من 6 نسخ', 'الفراغ النهائي للملكية'],
  },
  {
    id: 'recovery',
    icon: '🏛️',
    label: 'استرداد ملكية عقارية',
    desc: 'طلبات استرداد الملكية المستملَكة أو المتنازَع عليها',
    fee: 75,
    days: '14–30 يوم',
    docs: ['وثيقة الملكية الأصلية', 'بيان وصف العقار', 'سند تثبيت الحق'],
    popular: false,
    steps: ['تقييم الأساس القانوني', 'صياغة طلب الاسترداد', 'متابعة لجنة التحقق', 'الحصول على القرار', 'التسجيل في السجل العقاري'],
  },
];


const STATS = [
  { val: '1,245+', label: 'معاملة مكتملة'     },
  { val: '4.9',    label: 'تقييم العملاء / 5'  },
  { val: '3 أيام', label: 'متوسط وقت الإنجاز' },
  { val: '14',     label: 'محافظة مخدومة'      },
];

const HOW_IT_WORKS = [
  { n: '01', title: 'اختر الخدمة وأرسل طلبك', desc: 'حدد نوع المعاملة واملأ نموذج الطلب في دقائق مع رفع الوثائق الأساسية.' },
  { n: '02', title: 'يراجع فريقنا ويتواصل معك', desc: 'يتحقق كاتبنا القانوني من الوثائق خلال 24 ساعة ويرسل لك قائمة أي ملاحظات.' },
  { n: '03', title: 'استلم وثيقتك وتتبع المراحل', desc: 'تابع تقدم معاملتك بالوقت الحقيقي عبر رقم المرجع حتى التسليم النهائي.' },
];

// ── Tracking mock data ─────────────────────────────────────────────────────
const MOCK_STATUSES = {
  'REQ-SY-2025-84721': { service: 'بيع عقار', owner: 'محمد الصالح', stage: 'جارٍ المعالجة', pct: 60, city: 'دمشق', date: '2025-05-10' },
  'REQ-SY-2025-31045': { service: 'حصر إرث', owner: 'رنا الحسيني',  stage: 'بانتظار وثيقة', pct: 30, city: 'حلب',  date: '2025-05-12' },
  'REQ-SY-2025-99012': { service: 'وكالة خاصة', owner: 'خالد العمر', stage: 'مكتملة',        pct: 100,city: 'حمص', date: '2025-05-08' },
};

// ── Helper ─────────────────────────────────────────────────────────────────
function genRef() {
  return `REQ-SY-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000 + 10000))}`;
}

// ── Service card ───────────────────────────────────────────────────────────
function ServiceCard({ svc, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white p-5 flex flex-col gap-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_16px_48px_rgba(31,42,56,0.13)] transition-all duration-300 group relative overflow-hidden rounded-lg">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-brand scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right rounded-t-xl" />
      {/* Badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl">{svc.icon}</span>
        {svc.popular && (
          <span className="text-[10px] font-bold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full">الأكثر طلباً</span>
        )}
      </div>

      <div>
        <h3 className="text-navy font-black text-sm leading-tight">{svc.label}</h3>
        <p className="text-charcoal/60 text-xs mt-1 leading-relaxed">{svc.desc}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-1 text-charcoal/55">
          <Clock size={11} />{svc.days}
        </span>
        <span className="text-brand font-black">${svc.fee}</span>
        <span className="text-charcoal/35 text-[10px]">رسم الخدمة</span>
      </div>

      {/* Required docs toggle */}
      <button onClick={() => setExpanded(e => !e)}
        className="flex items-center gap-1.5 text-[10px] text-charcoal/50 hover:text-brand transition-colors">
        <FileText size={11} />
        الوثائق الأساسية
        <ChevronLeft size={10} className={`transition-transform ${expanded ? '-rotate-90' : ''}`} />
      </button>
      {expanded && (
        <ul className="space-y-1 -mt-1">
          {svc.docs.map((d, i) => (
            <li key={i} className="flex items-center gap-1.5 text-[10px] text-charcoal/60">
              <CheckCircle size={10} className="text-brand shrink-0" />{d}
            </li>
          ))}
        </ul>
      )}

      <button onClick={() => onSelect(svc.id)}
        className="mt-auto w-full py-2.5 rounded-xl bg-navy hover:bg-brand active:scale-[0.97] text-white text-xs font-bold transition-all group-hover:bg-brand">
        تقديم طلب
      </button>
    </div>
  );
}

// ── Multi-step request form ────────────────────────────────────────────────
const STEPS = ['نوع الخدمة', 'بياناتك', 'تفاصيل المعاملة', 'رفع الوثائق', 'مراجعة وإرسال'];

const EMPTY_FORM = {
  serviceId: '',
  name: '', nationalId: '', phone: '', email: '', city: 'دمشق', nationality: 'سورية',
  propertyType: 'شقة', propertyCity: 'دمشق', propertyDesc: '', propertyNo: '', notes: '',
  files: [],
};

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-0 mb-8 overflow-x-auto scrollbar-none">
      {STEPS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all
                ${done   ? 'bg-brand border-brand text-white'
                : active ? 'bg-white border-brand text-brand shadow-sm shadow-brand/20'
                :          'bg-white border-navy/15 text-charcoal/35'}`}>
                {done ? <CheckCircle size={14} strokeWidth={2.5} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-medium whitespace-nowrap max-w-[64px] text-center leading-tight
                ${active ? 'text-brand' : done ? 'text-charcoal/60' : 'text-charcoal/35'}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mx-1 mb-5 shrink-0 transition-all ${done ? 'bg-brand' : 'bg-navy/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function RequestForm({ initialServiceId = '', onClose }) {
  const { pushCrossHint } = useGlobalData();
  const [step, setStep]   = useState(initialServiceId ? 1 : 0);
  const [form, setForm]   = useState({ ...EMPTY_FORM, serviceId: initialServiceId });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [trackRef]  = useState(genRef);
  const fileRef = useRef();

  const svc = SERVICES.find(s => s.id === form.serviceId);
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const validate = () => {
    const e = {};
    if (step === 0 && !form.serviceId)     e.serviceId   = 'اختر نوع الخدمة';
    if (step === 1) {
      if (!form.name.trim())       e.name       = 'الاسم مطلوب';
      if (!form.nationalId.trim()) e.nationalId = 'الرقم الوطني مطلوب';
      if (!form.phone.trim())      e.phone      = 'رقم الهاتف مطلوب';
    }
    if (step === 2 && !form.propertyDesc.trim()) e.propertyDesc = 'وصف مختصر مطلوب';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).filter(f =>
      ['application/pdf','image/jpeg','image/png','image/tiff'].includes(f.type)
    ).slice(0, 5 - form.files.length);
    set('files', [...form.files, ...arr]);
  };

  const submit = () => {
    setSubmitted(true);
    pushCrossHint({
      emoji: '📊',
      text: 'هل تم تسوية العقار قانونياً؟ اطلب تقييماً هندسياً معتمداً لتقدير قيمته بدقة',
      label: 'طلب تقييم',
      to: '/valuation-request'
    });
  };


  // ── Success screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="text-center space-y-6 py-4" dir="rtl">
        <div className="w-20 h-20 rounded-3xl bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <div>
          <h3 className="text-navy font-black text-xl">تم استلام طلبك بنجاح!</h3>
          <p className="text-charcoal/60 text-sm mt-2">سيتواصل معك فريقنا خلال 24 ساعة لمراجعة الوثائق</p>
        </div>
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-5">
          <p className="text-charcoal/60 text-xs mb-1">رقم متابعة طلبك</p>
          <p className="text-brand font-black text-2xl font-mono tracking-widest">{trackRef}</p>
          <p className="text-charcoal/45 text-[10px] mt-2">احتفظ بهذا الرقم لمتابعة حالة طلبك</p>
        </div>
        <div className="bg-white p-4 text-right space-y-2 text-xs shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <p className="flex justify-between"><span className="text-charcoal/55">الخدمة</span><span className="font-bold text-navy">{svc?.label}</span></p>
          <p className="flex justify-between"><span className="text-charcoal/55">مقدم الطلب</span><span className="font-bold text-navy">{form.name}</span></p>
          <p className="flex justify-between"><span className="text-charcoal/55">رسم الخدمة</span><span className="font-bold text-brand">${svc?.fee}</span></p>
          <p className="flex justify-between"><span className="text-charcoal/55">وقت الإنجاز</span><span className="font-bold text-navy">{svc?.days}</span></p>
        </div>
        <button onClick={onClose}
          className="w-full py-3 rounded-2xl bg-navy text-white font-bold text-sm hover:bg-brand transition-colors">
          إغلاق
        </button>
      </div>
    );
  }

  return (
    <div dir="rtl">
      <StepIndicator current={step} />

      <AnimatePresence mode="wait">
        <motion.div key={step}
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22 }}>

          {/* Step 0: service selection */}
          {step === 0 && (
            <div className="space-y-3">
              <p className="text-sm font-bold text-navy mb-4">اختر نوع الخدمة المطلوبة</p>
              {errors.serviceId && <p className="text-red-500 text-xs">{errors.serviceId}</p>}
              <div className="grid sm:grid-cols-2 gap-2">
                {SERVICES.map(s => (
                  <button key={s.id} onClick={() => set('serviceId', s.id)}
                    className={`text-right flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${form.serviceId === s.id ? 'border-brand bg-brand/5' : 'border-navy/12 hover:border-brand/30 bg-white'}`}>
                    <span className="text-2xl shrink-0">{s.icon}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${form.serviceId === s.id ? 'text-navy' : 'text-charcoal/70'}`}>{s.label}</p>
                      <p className="text-[10px] text-charcoal/45 mt-0.5">{s.days} · ${s.fee}</p>
                    </div>
                    {form.serviceId === s.id && <CheckCircle size={16} className="text-brand shrink-0 mr-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 1: personal info */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-navy">بيانات مقدم الطلب</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { k: 'name',       label: 'الاسم الكامل *',     ph: 'محمد أحمد الصالح', Icon: User,     type: 'text'  },
                  { k: 'nationalId', label: 'الرقم الوطني *',      ph: '06123456789',       Icon: Hash,     type: 'text'  },
                  { k: 'phone',      label: 'رقم الهاتف *',        ph: '+963 9XX XXX XXX',  Icon: Phone,    type: 'tel'   },
                  { k: 'email',      label: 'البريد الإلكتروني',   ph: 'name@email.com',    Icon: Mail,     type: 'email' },
                ].map(({ k, label, ph, Icon, type }) => (
                  <div key={k}>
                    <label className="text-[10px] font-bold text-charcoal/60 block mb-1">{label}</label>
                    <div className="relative">
                      <Icon size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                      <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
                        placeholder={ph}
                        className={`w-full pr-8 pl-3 py-2.5 rounded-xl border text-sm text-navy outline-none transition-all
                          ${errors[k] ? 'border-red-300 bg-red-50/30' : 'border-navy/12 focus:border-brand/40'}`} />
                    </div>
                    {errors[k] && <p className="text-red-500 text-[10px] mt-1">{errors[k]}</p>}
                  </div>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-charcoal/60 block mb-1">المحافظة</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <select value={form.city} onChange={e => set('city', e.target.value)}
                      className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none appearance-none bg-white">
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-charcoal/60 block mb-1">الجنسية</label>
                  <div className="relative">
                    <Users size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <select value={form.nationality} onChange={e => set('nationality', e.target.value)}
                      className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none appearance-none bg-white">
                      {['سورية', 'مغترب سوري', 'أجنبي'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: property details */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-navy">تفاصيل العقار / المعاملة</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-charcoal/60 block mb-1">نوع العقار</label>
                  <div className="relative">
                    <Building2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <select value={form.propertyType} onChange={e => set('propertyType', e.target.value)}
                      className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none appearance-none bg-white">
                      {['شقة', 'فيلا', 'منزل', 'محل تجاري', 'مكتب', 'أرض', 'مستودع', 'مختلط'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-charcoal/60 block mb-1">محافظة العقار</label>
                  <div className="relative">
                    <MapPin size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <select value={form.propertyCity} onChange={e => set('propertyCity', e.target.value)}
                      className="w-full pr-8 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none appearance-none bg-white">
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-charcoal/60 block mb-1">رقم العقار / المنطقة العقارية (إن وُجد)</label>
                <input type="text" value={form.propertyNo} onChange={e => set('propertyNo', e.target.value)}
                  placeholder="مثال: 4421/دمشق — المزة"
                  className="w-full px-4 py-2.5 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-charcoal/60 block mb-1">وصف مختصر للمعاملة *</label>
                <textarea value={form.propertyDesc} onChange={e => set('propertyDesc', e.target.value)}
                  rows={3} placeholder="مثال: بيع شقة سكنية في الطابق الثالث، 120م²، حي المزة، دمشق..."
                  className={`w-full px-4 py-3 rounded-xl border text-sm text-navy outline-none resize-none transition-all
                    ${errors.propertyDesc ? 'border-red-300 bg-red-50/30' : 'border-navy/12 focus:border-brand/40'}`} />
                {errors.propertyDesc && <p className="text-red-500 text-[10px] mt-1">{errors.propertyDesc}</p>}
              </div>
              <div>
                <label className="text-[10px] font-bold text-charcoal/60 block mb-1">ملاحظات إضافية</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  rows={2} placeholder="أي تفاصيل إضافية تساعدنا على معالجة طلبك..."
                  className="w-full px-4 py-3 rounded-xl border border-navy/12 focus:border-brand/40 text-sm text-navy outline-none resize-none" />
              </div>
            </div>
          )}

          {/* Step 3: file upload */}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-navy">رفع الوثائق الأساسية</p>
              {svc && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 font-bold text-xs mb-2">وثائق مطلوبة لـ «{svc.label}»</p>
                  <ul className="space-y-1">
                    {svc.docs.map((d, i) => (
                      <li key={i} className="text-blue-600/80 text-xs flex items-center gap-1.5">
                        <CheckCircle size={10} className="text-blue-500 shrink-0" />{d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                className="border-2 border-dashed border-navy/20 hover:border-brand/40 rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-brand/[0.02] group">
                <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.tiff"
                  className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-brand/15 transition-colors">
                  <Upload size={24} className="text-brand" />
                </div>
                <p className="text-navy font-semibold text-sm">اسحب الوثائق هنا أو انقر للرفع</p>
                <p className="text-charcoal/50 text-xs mt-1">PDF · JPG · PNG · TIFF — حتى 5 ملفات</p>
              </div>

              {/* Uploaded files */}
              {form.files.length > 0 && (
                <div className="space-y-2">
                  {form.files.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 bg-cream border border-navy/10 rounded-xl px-4 py-2.5">
                      <FileText size={15} className="text-brand shrink-0" />
                      <p className="flex-1 text-xs text-navy truncate">{f.name}</p>
                      <span className="text-charcoal/40 text-[10px]">{(f.size / 1024).toFixed(0)} KB</span>
                      <button onClick={() => set('files', form.files.filter((_, j) => j !== i))}
                        className="text-charcoal/35 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-charcoal/45 text-[10px] flex items-center gap-1">
                <Shield size={10} className="text-brand" />
                وثائقك مشفّرة ومحمية — لا تُشارَك مع أطراف ثالثة
              </p>
            </div>
          )}

          {/* Step 4: review */}
          {step === 4 && svc && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-navy">مراجعة الطلب قبل الإرسال</p>

              {/* Service summary */}
              <div className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{svc.icon}</span>
                  <div>
                    <p className="text-navy font-bold text-sm">{svc.label}</p>
                    <p className="text-charcoal/55 text-xs mt-0.5">{svc.days}</p>
                  </div>
                  <p className="text-brand font-black text-xl mr-auto">${svc.fee}</p>
                </div>
                <div className="border-t border-navy/8 pt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {[
                    ['مقدم الطلب', form.name],
                    ['الرقم الوطني', form.nationalId],
                    ['الهاتف', form.phone],
                    ['المحافظة', form.city],
                    ['نوع العقار', form.propertyType],
                    ['محافظة العقار', form.propertyCity],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-2">
                      <span className="text-charcoal/50">{k}</span>
                      <span className="text-navy font-medium text-left">{v || '—'}</span>
                    </div>
                  ))}
                </div>
                {form.files.length > 0 && (
                  <p className="text-xs text-charcoal/55 border-t border-navy/8 pt-2">
                    {form.files.length} ملف مرفق
                  </p>
                )}
              </div>

              {/* Steps preview */}
              <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-xs font-bold text-charcoal/60 mb-3">مراحل تنفيذ طلبك</p>
                <ol className="space-y-2">
                  {svc.steps.map((s, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-xs text-charcoal/70">
                      <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 font-bold">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                رسم الخدمة ${svc.fee} لا يشمل الرسوم الحكومية والضرائب المترتبة — يُحدَّد وفق القانون السوري 2025
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={back}
            className="flex items-center gap-1.5 px-5 py-3 rounded-2xl border border-navy/15 text-charcoal/60 hover:text-navy text-sm transition-colors">
            <ChevronRight size={15} />
            السابق
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={next}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-brand to-navy text-white text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/20">
            التالي
            <ChevronLeft size={15} />
          </button>
        ) : (
          <button onClick={submit}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-green-600 to-brand text-white text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-green-600/20">
            <Sparkles size={15} />
            إرسال الطلب الآن
          </button>
        )}
      </div>
    </div>
  );
}

// ── Tracking section ───────────────────────────────────────────────────────
function TrackingSection() {
  const [ref,    setRef]    = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const track = () => {
    const found = MOCK_STATUSES[ref.trim().toUpperCase()];
    if (found) { setResult(found); setNotFound(false); }
    else { setResult(null); setNotFound(true); }
  };

  const STAGE_COLOR = {
    'جارٍ المعالجة':  'text-brand bg-brand/10 border-brand/20',
    'بانتظار وثيقة':  'text-amber-600 bg-amber-50 border-amber-200',
    'مكتملة':          'text-green-600 bg-green-50 border-green-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input type="text" value={ref} onChange={e => setRef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && track()}
            placeholder="REQ-SY-2025-XXXXX"
            className="w-full pr-9 pl-4 py-3 rounded-xl border border-navy/15 focus:border-brand/40 text-sm text-navy outline-none font-mono" />
        </div>
        <button onClick={track}
          className="px-6 py-3 rounded-xl bg-navy hover:bg-brand text-white text-sm font-bold transition-colors whitespace-nowrap">
          تتبع
        </button>
      </div>

      {notFound && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0" />
          رقم المرجع غير موجود — تأكد من الرقم أو تواصل معنا عبر واتساب
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
          style={{ borderRadius: '8px' }}>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-navy font-black text-sm">{result.owner}</p>
              <p className="text-charcoal/55 text-xs mt-0.5">{result.service} · {result.city} · {result.date}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${STAGE_COLOR[result.stage] || 'text-charcoal/60 bg-cream border-navy/15'}`}>
              {result.stage}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-charcoal/55 mb-1">
              <span>تقدم المعاملة</span><span>{result.pct}٪</span>
            </div>
            <div className="h-2 bg-navy/10 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${result.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${result.pct === 100 ? 'bg-green-500' : 'bg-brand'}`} />
            </div>
          </div>
          {result.pct === 100 && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
              <CheckCircle size={14} />
              معاملتك مكتملة — يمكنك استلام الوثائق
            </div>
          )}
        </motion.div>
      )}

      {/* Sample ref hint */}
      <p className="text-charcoal/40 text-[10px] text-center">
        جرّب: REQ-SY-2025-84721 · REQ-SY-2025-31045 · REQ-SY-2025-99012
      </p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ClearingServicePage() {
  const [showForm, setShowForm]         = useState(false);
  const [formServiceId, setFormServiceId] = useState('');
  const formRef = useRef(null);
  const { articles } = useNews();

  const legalAlerts = articles
    .filter(a => a.status === 'published' && (a.cat === 'legal' || a.cat === 'tax' || a.cat === 'diaspora'))
    .sort((a, b) => ({ urgent: 0, high: 1, info: 2 }[a.urgency] ?? 2) - ({ urgent: 0, high: 1, info: 2 }[b.urgency] ?? 2))
    .slice(0, 2);

  const openForm = (serviceId = '') => {
    setFormServiceId(serviceId);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  return (
    <div className="bg-[#f2f1ee] min-h-screen">
      {/* ── Hero ── */}
      <PageHero
        num="07"
        eyebrow="التخليص العقاري"
        title={
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">
            معاملاتك العقارية<br />
            <span className="text-brand">بيد متخصصين</span>
          </h1>
        }
        subtitle="نتولى عنك كل الإجراءات القانونية — نقل ملكية، حصر إرث، وكالات — بلا تعقيد وبلا تأخير"
        breadcrumb={[{ label: 'الرئيسية', to: '/' }, { label: 'خدمات التخليص' }]}
      >
        <div className="flex flex-wrap gap-3">
          <button onClick={() => openForm()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cta text-white font-black text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-cta/30">
            <Sparkles size={16} />
            قدّم طلبك الآن
          </button>
          <a href="#track"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm transition-all border border-white/20">
            <Eye size={16} />
            تتبع طلب موجود
          </a>
        </div>
      </PageHero>

      {/* ── Stats bar ── */}
      <div className="bg-white border-b border-navy/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0" dir="rtl">
            {STATS.map(({ val, label }, i) => (
              <div key={label} className={`text-center py-2 ${i < 3 ? 'sm:border-l border-navy/8' : ''}`}>
                <p className="text-3xl font-black text-brand leading-none">{val}</p>
                <p className="text-charcoal/50 text-xs mt-1.5 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16" dir="rtl">

        {/* ── Services grid ── */}
        <section>
          <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
            <div>
              <p className="eyebrow mb-2">خدماتنا</p>
              <h2 className="text-navy font-black text-2xl sm:text-3xl">8 خدمات تخليص متكاملة</h2>
            </div>
            <p className="text-charcoal/55 text-sm max-w-sm">
              نغطي جميع المعاملات العقارية المعتمدة بالقانون السوري من البيع إلى الاسترداد
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SERVICES.map(svc => (
              <ServiceCard key={svc.id} svc={svc} onSelect={openForm} />
            ))}
          </div>
        </section>

        {/* ── How it works ── */}
        <section>
          <p className="eyebrow mb-2">الطريقة</p>
          <h2 className="text-navy font-black text-2xl sm:text-3xl mb-8">كيف تعمل الخدمة؟</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="bg-white p-6 relative overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <span className="absolute left-4 top-2 font-display text-7xl text-navy/[0.06] select-none leading-none">{h.n}</span>
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mb-4">
                    {i === 0 && <FileText size={18} className="text-brand" />}
                    {i === 1 && <Users size={18} className="text-brand" />}
                    {i === 2 && <CheckCircle size={18} className="text-brand" />}
                  </div>
                  <h3 className="text-navy font-black text-sm mb-2">{h.title}</h3>
                  <p className="text-charcoal/60 text-xs leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Request form ── */}
        <section ref={formRef} id="request">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
            {/* Form card */}
            <div className="bg-white p-6 sm:p-8 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-navy font-black text-xl">تقديم طلب جديد</h2>
                  <p className="text-charcoal/55 text-sm mt-1">يصلك رد الفريق خلال 24 ساعة</p>
                </div>
                {showForm && (
                  <button onClick={() => setShowForm(false)}
                    className="w-8 h-8 rounded-xl bg-cream hover:bg-red-50 border border-navy/10 flex items-center justify-center text-charcoal/50 hover:text-red-500 transition-colors">
                    <X size={15} />
                  </button>
                )}
              </div>

              {showForm ? (
                <RequestForm initialServiceId={formServiceId} onClose={() => setShowForm(false)} />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto">
                    <Scale size={28} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-navy font-bold text-base">ابدأ بتقديم طلبك</p>
                    <p className="text-charcoal/55 text-sm mt-1">اختر الخدمة المناسبة وأكمل النموذج</p>
                  </div>
                  <button onClick={() => openForm()}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-l from-brand to-navy text-white font-black text-sm hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/20">
                    <span className="flex items-center gap-2"><Sparkles size={15} />ابدأ الطلب</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              {/* Why us */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <h3 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
                  <Shield size={15} className="text-brand" />
                  لماذا RESURGO؟
                </h3>
                <ul className="space-y-3">
                  {[
                    ['كتّاب عدل وقانونيون سوريون متخصصون', '👨‍⚖️'],
                    ['توافق كامل مع القانون السوري 2025/2026', '📋'],
                    ['تتبع مباشر لمراحل معاملتك', '📱'],
                    ['أرشفة مشفّرة AES-256 لجميع الوثائق', '🔒'],
                    ['دعم معاملات المغتربين عبر السفارات', '✈️'],
                    ['حاسبة ضريبة 2025 مدمجة', '🧮'],
                  ].map(([text, icon]) => (
                    <li key={text} className="flex items-start gap-2.5 text-xs text-charcoal/70">
                      <span className="shrink-0 mt-0.5">{icon}</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price note */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <h3 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                  <Hash size={14} className="text-brand" />
                  ملاحظة على الأسعار
                </h3>
                <p className="text-charcoal/60 text-xs leading-relaxed">
                  رسوم الخدمة المعروضة هي رسومنا فقط. تُضاف إليها:
                </p>
                <ul className="mt-2 space-y-1 text-[10px] text-charcoal/55">
                  <li>• ضريبة البيوع 2025 (1.5٪–4٪ حسب نوع العقار)</li>
                  <li>• رسوم كاتب العدل ومديرية المصالح العقارية</li>
                  <li>• طوابع مالية وبلدية</li>
                  <li>• رسوم قنصلية (لمعاملات المغتربين)</li>
                </ul>
                <Link to="/valuation" className="text-brand text-[10px] font-bold mt-2 block hover:underline flex items-center gap-1">
                  <ArrowLeft size={10} />
                  استخدم حاسبة الضريبة المجانية
                </Link>
              </div>


              {/* Contact */}
              <div className="bg-navy/[0.02] p-5 shadow-[0_2px_8px_rgba(31,42,56,0.04)] rounded-lg">
                <p className="text-xs font-bold text-charcoal/60 mb-3">تحتاج استشارة مباشرة؟</p>
                <a href="https://wa.me/963XXXXXXXXX"
                  className="flex items-center gap-2.5 w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold justify-center transition-colors">
                  <Phone size={15} />
                  واتساب — رد فوري
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tracking section ── */}
        <section id="track" className="scroll-mt-20">
          <p className="eyebrow mb-2">المتابعة</p>
          <h2 className="text-navy font-black text-2xl sm:text-3xl mb-2">تتبع حالة طلبك</h2>
          <p className="text-charcoal/55 text-sm mb-6">أدخل رقم المرجع الذي استلمته عند تقديم الطلب</p>
          <div className="max-w-2xl">
            <TrackingSection />
          </div>
        </section>

        {/* ── Legal alerts strip ── */}
        {legalAlerts.length > 0 && (
          <section dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-navy font-black text-lg flex items-center gap-2">
                <Bell size={17} className="text-brand" />
                تنبيهات قانونية وضريبية
              </h2>
              <Link to="/news" className="text-brand text-xs font-bold hover:text-navy transition-colors flex items-center gap-1">
                كل التنبيهات <ChevronLeft size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {legalAlerts.map(alert => {
                const urgency = URGENCY[alert.urgency] ?? URGENCY.info;
                const isUrgent = alert.urgency === 'urgent';
                return (
                  <Link key={alert.id} to={`/news/${alert.id}`}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 hover:-translate-y-0.5 transition-all group
                      ${isUrgent ? 'border-red-200 bg-red-50/50' : 'border-navy/10 bg-white'}`}>
                    <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${urgency.color}`}>
                      {isUrgent ? <AlertTriangle size={11} /> : <Bell size={11} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>{urgency.label}</span>
                        <span className="text-[10px] text-charcoal/40">{alert.date}</span>
                      </div>
                      <p className={`text-sm font-bold leading-snug group-hover:text-brand transition-colors
                        ${isUrgent ? 'text-red-900' : 'text-navy'}`}>{alert.title}</p>
                      <p className="text-charcoal/50 text-xs mt-0.5 line-clamp-1">{alert.summary}</p>
                    </div>
                    <ChevronLeft size={13} className="text-charcoal/25 group-hover:text-brand transition-colors shrink-0 mt-1" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Cross-links ── */}
        <section>
          <p className="eyebrow mb-2">اكتشف المزيد</p>
          <h2 className="text-navy font-black text-2xl sm:text-3xl mb-6">خدمات RESURGO الأخرى</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { to: '/valuation', icon: '📊', title: 'تقييم عقاري احترافي', desc: 'تقييم مستقل وفق معايير IVS 2025 مع حاسبة AVM مجانية', color: 'border-blue-200 bg-blue-50/50' },
              { to: '/properties', icon: '🏡', title: 'عقارات للبيع والإيجار', desc: 'تصفح آلاف العقارات الموثوقة في جميع المحافظات السورية', color: 'border-green-200 bg-green-50/50' },
              { to: '/studies',   icon: '📈', title: 'الدراسات العقارية',   desc: 'تقارير السوق ودراسات الجدوى والبيانات الاستثمارية', color: 'border-purple-200 bg-purple-50/50' },
            ].map(({ to, icon, title, desc, color }) => (
              <a key={to} href={to}
                className={`bg-white p-5 border-2 ${color} shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-md transition-all group rounded-lg`}>
                <span className="text-3xl block mb-3">{icon}</span>
                <h3 className="text-navy font-black text-sm group-hover:text-brand transition-colors">{title}</h3>
                <p className="text-charcoal/55 text-xs mt-1 leading-relaxed">{desc}</p>
                <p className="text-brand text-xs font-bold mt-3 flex items-center gap-1">
                  اكتشف <ChevronLeft size={12} />
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
