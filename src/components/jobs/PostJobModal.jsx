import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, DollarSign, Tag, AlignLeft, CheckCircle, Zap } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';
import toast from 'react-hot-toast';

const SPECS = ['إنشائي', 'معماري', 'مدني', 'كهربائي', 'تقدير', 'إشراف', 'ميكانيك', 'مساحة', 'مدير مشاريع', 'مصمم داخلي', 'سلامة', 'BIM', 'محاسب مشاريع'];
const CITIES = [
  'دمشق', 'ريف دمشق', 'حلب', 'حمص', 'حماة', 'اللاذقية', 'طرطوس',
  'إدلب', 'دير الزور', 'الرقة', 'الحسكة', 'السويداء', 'درعا', 'القنيطرة',
];
const TYPES  = ['دوام كامل', 'نصف دوام', 'عن بعد', 'فريلانس'];

const EMPTY = { title: '', company: '', city: 'دمشق', type: 'دوام كامل', spec: 'إنشائي', salaryMin: '', salaryMax: '', desc: '', urgent: false, skillInput: '' };

export default function PostJobModal({ isOpen, onClose }) {
  const { addJob } = useGlobalData();
  const [form, setForm] = useState(EMPTY);
  const [skills, setSkills] = useState([]);
  const [errors, setErrors] = useState({});

  const set = (k, v) => { setForm(prev => ({ ...prev, [k]: v })); setErrors(prev => ({ ...prev, [k]: '' })); };

  const addSkill = () => {
    const sk = form.skillInput.trim();
    if (sk && !skills.includes(sk)) { setSkills(prev => [...prev, sk]); set('skillInput', ''); }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())   e.title   = 'المسمى الوظيفي مطلوب';
    if (!form.company.trim()) e.company = 'اسم الشركة مطلوب';
    if (!form.desc.trim())    e.desc    = 'الوصف الوظيفي مطلوب';
    if (!form.salaryMin)      e.salary  = 'نطاق الراتب مطلوب';
    if (skills.length < 1)    e.skills  = 'أضف مهارة واحدة على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    addJob({
      title:      form.title.trim(),
      company:    form.company.trim(),
      city:       form.city,
      type:       form.type,
      spec:       form.spec,
      salary:     form.salaryMax ? `${form.salaryMin} - ${form.salaryMax} $` : `${form.salaryMin} $`,
      desc:       form.desc.trim(),
      urgent:     form.urgent,
      skills,
      posted:     new Date().toISOString().slice(0, 10),
      applicants: 0,
    });
    toast.success(`تم نشر الوظيفة "${form.title.trim()}" بنجاح ✅`);
    setForm(EMPTY);
    setSkills([]);
    setErrors({});
    onClose();
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="text-xs font-bold text-charcoal/60 block mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-navy/75 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="relative z-10 bg-white w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-600 to-navy px-6 py-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                  <Briefcase size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-base">نشر وظيفة جديدة</p>
                  <p className="text-white/60 text-xs">تصل إلى 500+ مهندس معتمد على RESURGO</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* Row 1: Title + Company */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="المسمى الوظيفي *" error={errors.title}>
                  <div className="relative">
                    <Briefcase size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/35" />
                    <input
                      type="text" value={form.title} onChange={e => set('title', e.target.value)}
                      placeholder="مهندس إنشائي أول..."
                      className={`w-full pr-8 pl-4 py-2.5 rounded-xl border text-sm text-navy outline-none transition-all ${errors.title ? 'border-red-300 bg-red-50/30' : 'border-navy/12 focus:border-emerald-400'}`}
                    />
                  </div>
                </Field>
                <Field label="اسم الشركة / المكتب *" error={errors.company}>
                  <input
                    type="text" value={form.company} onChange={e => set('company', e.target.value)}
                    placeholder="شركة الإعمار السورية..."
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-navy outline-none transition-all ${errors.company ? 'border-red-300 bg-red-50/30' : 'border-navy/12 focus:border-emerald-400'}`}
                  />
                </Field>
              </div>

              {/* Row 2: City + Type + Spec */}
              <div className="grid grid-cols-3 gap-3">
                <Field label="المدينة">
                  <div className="relative">
                    <MapPin size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/35 pointer-events-none" />
                    <select value={form.city} onChange={e => set('city', e.target.value)}
                      className="w-full pr-7 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-emerald-400 text-sm text-navy outline-none appearance-none bg-white">
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </Field>
                <Field label="نوع الدوام">
                  <select value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-navy/12 focus:border-emerald-400 text-sm text-navy outline-none appearance-none bg-white">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="التخصص">
                  <select value={form.spec} onChange={e => set('spec', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-navy/12 focus:border-emerald-400 text-sm text-navy outline-none appearance-none bg-white">
                    {SPECS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* Row 3: Salary */}
              <Field label="نطاق الراتب الشهري ($) *" error={errors.salary}>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/35" />
                    <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)}
                      placeholder="من: 800"
                      className={`w-full pr-7 pl-3 py-2.5 rounded-xl border text-sm text-navy outline-none transition-all ${errors.salary ? 'border-red-300' : 'border-navy/12 focus:border-emerald-400'}`}
                    />
                  </div>
                  <span className="text-charcoal/40 text-xs shrink-0">إلى</span>
                  <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)}
                    placeholder="إلى: 1,400 (اختياري)"
                    className="flex-1 px-3 py-2.5 rounded-xl border border-navy/12 focus:border-emerald-400 text-sm text-navy outline-none transition-all"
                  />
                </div>
              </Field>

              {/* Row 4: Skills */}
              <Field label="المهارات المطلوبة *" error={errors.skills}>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Tag size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/35" />
                    <input
                      type="text" value={form.skillInput} onChange={e => set('skillInput', e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="مثال: ETABS أو AutoCAD..."
                      className="w-full pr-7 pl-3 py-2.5 rounded-xl border border-navy/12 focus:border-emerald-400 text-sm text-navy outline-none"
                    />
                  </div>
                  <button onClick={addSkill}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shrink-0">
                    إضافة
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(sk => (
                      <span key={sk} className="flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full">
                        {sk}
                        <button onClick={() => setSkills(prev => prev.filter(s => s !== sk))} className="text-emerald-400 hover:text-red-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Field>

              {/* Row 5: Description */}
              <Field label="الوصف الوظيفي والمتطلبات *" error={errors.desc}>
                <div className="relative">
                  <AlignLeft size={13} className="absolute right-3 top-3 text-charcoal/35" />
                  <textarea
                    value={form.desc} onChange={e => set('desc', e.target.value)}
                    rows={4} placeholder="اكتب وصفاً تفصيلياً للمهام والمتطلبات ومميزات العمل..."
                    className={`w-full pr-8 pl-4 py-3 rounded-xl border text-sm text-navy outline-none transition-all resize-none ${errors.desc ? 'border-red-300 bg-red-50/30' : 'border-navy/12 focus:border-emerald-400'}`}
                  />
                </div>
              </Field>

              {/* Urgent toggle */}
              <div className="flex items-center gap-3 bg-cta/5 border border-cta/20 rounded-xl px-4 py-3">
                <button
                  onClick={() => set('urgent', !form.urgent)}
                  className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${form.urgent ? 'bg-cta' : 'bg-navy/15'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.urgent ? 'left-6' : 'left-1'}`} />
                </button>
                <div>
                  <p className="text-navy font-bold text-sm flex items-center gap-1.5">
                    <Zap size={13} className={form.urgent ? 'text-cta' : 'text-charcoal/30'} />
                    وظيفة عاجلة
                  </p>
                  <p className="text-charcoal/45 text-[10px]">ستظهر الوظيفة بشارة "عاجل" للمتقدمين</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-navy/8 flex gap-3 bg-white shrink-0">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-2xl border border-navy/12 text-charcoal/60 text-sm font-bold hover:bg-cream transition-colors">
                إلغاء
              </button>
              <button onClick={handleSubmit}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-navy text-white text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-600/20">
                <CheckCircle size={15} /> نشر الوظيفة
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
