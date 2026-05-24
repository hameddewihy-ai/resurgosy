import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, CheckCircle, AlertTriangle, User,
  ChevronLeft, X, BadgeCheck, FileText, Lock,
} from 'lucide-react';

// ── Accreditation criteria ────────────────────────────────────────────────────
const ACCRED_CRITERIA = [
  'صافي ثروتي يتجاوز ما يعادل $1,000,000 (باستثناء العقار السكني الرئيسي)',
  'دخلي السنوي تجاوز ما يعادل $200,000 في السنتين الماضيتين أو أكثر',
  'أنا ممثل شركة أو مؤسسة مالية بأصول إجمالية تتجاوز $5,000,000',
  'أمتلك مؤهلاً مهنياً معتمداً في مجال الاستثمار أو الأوراق المالية (CFA, CFP أو ما يعادله)',
];

// ── Risk disclosure text ──────────────────────────────────────────────────────
const RISK_PARAGRAPHS = [
  {
    title: '1. مخاطر السوق العقاري',
    body: 'تخضع قيم العقارات لتقلبات السوق وعوامل العرض والطلب المحلية والدولية. لا يوجد ضمان بأن قيمة الاستثمار ستحافظ على مستوياتها أو سترتفع. الأداء التاريخي لمشاريع مماثلة لا يُعدّ ضماناً للنتائج المستقبلية.',
  },
  {
    title: '2. مخاطر السيولة',
    body: 'الاستثمارات العقارية تُعدّ أصولاً غير سائلة بطبيعتها. قد لا تتمكن من تصفية استثمارك في الوقت الذي تختاره أو بالسعر الذي تتوقعه. يوفر السوق الثانوي سيولة محدودة وفق شروط المنصة، وهو ليس ضماناً لتصفية فورية.',
  },
  {
    title: '3. مخاطر العملة والتضخم',
    body: 'تُعبَّر الاستثمارات بالدولار الأمريكي، إلا أن التدفقات النقدية المحلية تتأثر بسعر الصرف والتضخم في السوق السوري. قد تؤدي التحولات في السياسة النقدية أو القيود على تحويل العملات إلى تأثير سلبي على العوائد الفعلية.',
  },
  {
    title: '4. المخاطر الجيوسياسية والتنظيمية',
    body: 'السوق السوري في مرحلة إعادة بناء وقد يخضع لتغيرات في التشريعات، قوانين الملكية، أو السياسات الضريبية. قد تؤثر الأحداث الجيوسياسية الإقليمية أو الدولية على القدرة التشغيلية للمشاريع وعلى توقيت التسليم.',
  },
  {
    title: '5. مخاطر تأخير البناء والتنفيذ',
    body: 'قد تتأخر مشاريع البناء عن جداولها الزمنية بسبب عوامل خارج سيطرة المطوّر كنقص المواد، العمالة، أو الظروف البيئية. التأخير يؤثر مباشرة على توقيت التدفقات النقدية والعوائد المتوقعة.',
  },
  {
    title: '6. مخاطر المطوّر والطرف المقابل',
    body: 'يعتمد نجاح الاستثمار جزئياً على قدرة المطوّر على إتمام المشروع وفق الخطة. في حال إخفاق المطوّر التجاري أو تعثّره، قد يتأثر الاستثمار تأثراً جوهرياً على الرغم من وجود هيكل SPV للحماية.',
  },
  {
    title: '7. مخاطر فقدان رأس المال',
    body: 'الاستثمار في العقارات غير مضمون من قِبل أي جهة حكومية أو صندوق ضمان. في أسوأ السيناريوهات، قد تفقد جزءاً أو كامل المبلغ المستثمر. يجب ألا تستثمر إلا ما تستطيع تحمّل خسارته كلياً دون أن يؤثر ذلك على مستوى معيشتك.',
  },
  {
    title: '8. طبيعة العوائد التقديرية',
    body: 'كل الأرقام المعروضة على المنصة (IRR، ROI، payback period) هي تقديرات قائمة على نماذج مالية وافتراضات السوق، وليست وعوداً أو ضمانات. الأرقام الفعلية قد تختلف اختلافاً جوهرياً عن التوقعات.',
  },
];

const ID_TYPES = [
  'هوية وطنية سورية',
  'جواز سفر',
  'بطاقة إقامة خليجية',
  'هوية مقيم (دولة أخرى)',
];

const STEPS = [
  { num: 1, label: 'الأهلية',    icon: Shield   },
  { num: 2, label: 'المخاطر',    icon: AlertTriangle },
  { num: 3, label: 'الهوية',     icon: User     },
];

// ── Step indicator ────────────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done = current > s.num;
        const active = current === s.num;
        return (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${done ? 'bg-emerald-100 text-emerald-700' : active ? 'bg-brand text-white shadow-sm' : 'bg-navy/5 text-charcoal/40'}`}>
              {done ? <CheckCircle size={12} /> : <s.icon size={12} />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px mx-1 ${done ? 'bg-emerald-300' : 'bg-navy/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KYCGate({ isOpen, onComplete, onClose }) {
  const [step, setStep]         = useState(1);
  const [accred, setAccred]     = useState([]);         // checked indices for step 1
  const [riskScrolled, setRiskScrolled] = useState(false);
  const [riskAgreed, setRiskAgreed]     = useState(false);
  const [form, setForm] = useState({ name: '', idType: ID_TYPES[0], idNum: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]         = useState(false);
  const riskRef = useRef(null);

  const toggleAccred = (i) =>
    setAccred(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const handleRiskScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) setRiskScrolled(true);
  };

  const canStep1 = accred.length > 0;
  const canStep2 = riskScrolled && riskAgreed;
  const canStep3 = form.name.trim().length > 2 && form.idNum.trim().length > 3 && form.phone.trim().length > 6;

  const handleSubmit = () => {
    if (!canStep3) return;
    setSubmitting(true);
    setTimeout(() => {
      const kyc = {
        verified: true,
        name: form.name.trim(),
        idType: form.idType,
        idNum: form.idNum.trim(),
        phone: form.phone.trim(),
        timestamp: Date.now(),
      };
      try { localStorage.setItem('resurgo-kyc', JSON.stringify(kyc)); } catch {}
      setSubmitting(false);
      setDone(true);
      setTimeout(() => onComplete(kyc), 1800);
    }, 1200);
  };

  const handleClose = () => {
    setStep(1); setAccred([]); setRiskScrolled(false); setRiskAgreed(false);
    setForm({ name: '', idType: ID_TYPES[0], idNum: '', phone: '' });
    setDone(false); setSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/70 backdrop-blur-sm z-[60]"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="fixed inset-x-4 top-[4vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[540px] bg-white rounded-3xl shadow-2xl z-[61] overflow-hidden max-h-[90vh] flex flex-col"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-navy/5 to-brand/5 px-6 py-5 border-b border-navy/8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand to-navy flex items-center justify-center shadow">
                  <Shield size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-navy font-black text-sm">التحقق من الهوية والأهلية</p>
                  <p className="text-charcoal/50 text-xs">KYC · AML · إقرار المخاطر</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 hover:text-navy transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6">
              <StepBar current={done ? 4 : step} />

              <AnimatePresence mode="wait">

                {/* ── Step 1: Accreditation ── */}
                {step === 1 && !done && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4">
                    <div className="text-center mb-5">
                      <Shield size={32} className="text-brand mx-auto mb-2" />
                      <h3 className="text-navy font-black text-lg">التحقق من أهلية المستثمر</h3>
                      <p className="text-charcoal/55 text-xs mt-1 leading-relaxed">
                        وفق الأطر التنظيمية للاستثمار الخاص، يجب أن تنطبق عليك واحدة على الأقل من المعايير التالية للمشاركة في الاستثمارات المطروحة.
                      </p>
                    </div>
                    <div className="space-y-2">
                      {ACCRED_CRITERIA.map((c, i) => {
                        const checked = accred.includes(i);
                        return (
                          <label key={i}
                            className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${checked ? 'bg-brand/5 border-brand/30' : 'border-navy/10 hover:border-brand/20 hover:bg-navy/[0.02]'}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggleAccred(i)}
                              className="mt-0.5 w-4 h-4 accent-brand cursor-pointer shrink-0" />
                            <span className={`text-sm leading-relaxed ${checked ? 'text-navy font-semibold' : 'text-charcoal/70'}`}>{c}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
                      تقديم معلومات غير صحيحة يُعرّضك للمسؤولية القانونية. هذا الإقرار ملزم قانونياً.
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!canStep1}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canStep1 ? 'bg-gradient-to-l from-brand to-navy text-white shadow-md hover:-translate-y-0.5' : 'bg-navy/8 text-charcoal/30 cursor-not-allowed'}`}>
                      التالي — إقرار المخاطر <ChevronLeft size={15} />
                    </button>
                  </motion.div>
                )}

                {/* ── Step 2: Risk Disclosure ── */}
                {step === 2 && !done && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4">
                    <div className="text-center mb-4">
                      <FileText size={32} className="text-amber-500 mx-auto mb-2" />
                      <h3 className="text-navy font-black text-lg">وثيقة الإفصاح عن المخاطر</h3>
                      <p className="text-charcoal/55 text-xs mt-1">اقرأ الوثيقة كاملةً للمتابعة</p>
                    </div>

                    {/* Risk text — scroll-gated */}
                    <div
                      ref={riskRef}
                      onScroll={handleRiskScroll}
                      className="h-64 overflow-y-auto border border-navy/12 rounded-2xl bg-cream/50 p-4 space-y-4 text-xs text-charcoal/70 leading-relaxed scrollbar-thin"
                    >
                      <p className="text-navy font-bold text-sm">وثيقة إفصاح المخاطر الاستثمارية — RESURGO PropTech</p>
                      <p className="text-charcoal/50 text-[10px] border-b border-navy/8 pb-3">
                        هذه الوثيقة جزء لا يتجزأ من اتفاقية المستثمر. يُرجى قراءتها بعناية قبل اتخاذ أي قرار استثماري.
                      </p>
                      {RISK_PARAGRAPHS.map((p, i) => (
                        <div key={i}>
                          <p className="text-navy font-bold mb-1">{p.title}</p>
                          <p>{p.body}</p>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-navy/8">
                        <p className="text-navy font-bold mb-1">9. القانون الواجب التطبيق</p>
                        <p>تخضع هذه الاتفاقية لأحكام القانون السوري النافذ وأي تشريعات مالية ذات صلة. تُحسم النزاعات عبر التحكيم التجاري الدولي وفق قواعد غرفة التجارة الدولية (ICC) ما لم يُتفق على خلاف ذلك كتابةً.</p>
                      </div>
                      <p className="text-charcoal/40 text-[10px] text-center pt-2">— نهاية وثيقة الإفصاح —</p>
                    </div>

                    {!riskScrolled && (
                      <p className="text-center text-charcoal/40 text-xs animate-pulse">
                        ↓ مرّر للأسفل لقراءة الوثيقة كاملةً
                      </p>
                    )}

                    <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${riskAgreed ? 'bg-emerald-50 border-emerald-300' : riskScrolled ? 'border-navy/15 hover:border-brand/30' : 'border-navy/8 opacity-50 pointer-events-none'}`}>
                      <input type="checkbox" checked={riskAgreed} onChange={e => setRiskAgreed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-emerald-500 cursor-pointer shrink-0" />
                      <span className="text-xs text-charcoal/70 leading-relaxed">
                        <strong className="text-navy">أقرّ وأوافق</strong> بأنني قرأت وثيقة الإفصاح كاملةً، وأدرك المخاطر المرتبطة بهذا الاستثمار، وأتحمل مسؤولية قرار الاستثمار بشكل كامل.
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)}
                        className="px-5 py-3 rounded-2xl border border-navy/12 text-charcoal/60 text-sm font-bold hover:bg-cream transition-colors">
                        رجوع
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={!canStep2}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canStep2 ? 'bg-gradient-to-l from-brand to-navy text-white shadow-md hover:-translate-y-0.5' : 'bg-navy/8 text-charcoal/30 cursor-not-allowed'}`}>
                        التالي — التحقق من الهوية <ChevronLeft size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 3: KYC Form ── */}
                {step === 3 && !done && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="space-y-4">
                    <div className="text-center mb-4">
                      <User size={32} className="text-brand mx-auto mb-2" />
                      <h3 className="text-navy font-black text-lg">التحقق من الهوية (KYC)</h3>
                      <p className="text-charcoal/55 text-xs mt-1">بياناتك محمية ومشفرة ولن تُشارَك مع أي طرف ثالث.</p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-charcoal/60 block mb-1.5">الاسم الكامل *</label>
                        <input
                          value={form.name}
                          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                          placeholder="مثال: محمد عبدالله الأحمد"
                          className="w-full input-field text-sm"
                          dir="rtl"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-charcoal/60 block mb-1.5">نوع وثيقة الهوية *</label>
                        <select
                          value={form.idType}
                          onChange={e => setForm(p => ({ ...p, idType: e.target.value }))}
                          className="w-full input-field text-sm bg-white"
                        >
                          {ID_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-charcoal/60 block mb-1.5">رقم الوثيقة *</label>
                        <input
                          value={form.idNum}
                          onChange={e => setForm(p => ({ ...p, idNum: e.target.value }))}
                          placeholder="أدخل رقم الهوية أو جواز السفر"
                          className="w-full input-field text-sm font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-charcoal/60 block mb-1.5">رقم الهاتف *</label>
                        <input
                          value={form.phone}
                          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="+963 9XX XXX XXX"
                          className="w-full input-field text-sm font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="bg-navy/[0.03] border border-navy/8 rounded-xl p-3 flex items-start gap-2 text-xs text-charcoal/60">
                      <Lock size={13} className="shrink-0 mt-0.5 text-brand" />
                      بياناتك مشفرة بـ AES-256 ومحمية وفق سياسة الخصوصية. لن تُستخدم إلا للتحقق من الهوية ومنع غسيل الأموال (AML).
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)}
                        className="px-5 py-3 rounded-2xl border border-navy/12 text-charcoal/60 text-sm font-bold hover:bg-cream transition-colors">
                        رجوع
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!canStep3 || submitting}
                        className={`flex-1 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${canStep3 && !submitting ? 'bg-gradient-to-l from-brand to-navy text-white shadow-md hover:-translate-y-0.5' : 'bg-navy/8 text-charcoal/30 cursor-not-allowed'}`}>
                        {submitting ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جارٍ التحقق...</>
                        ) : (
                          <><BadgeCheck size={15} /> إتمام التحقق والاستثمار</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Done ── */}
                {done && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-3">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center mx-auto">
                      <BadgeCheck size={38} className="text-emerald-500" />
                    </motion.div>
                    <h3 className="text-navy font-black text-xl">تم التحقق بنجاح ✅</h3>
                    <p className="text-charcoal/55 text-sm">مرحباً <strong className="text-navy">{form.name}</strong>، تم اعتمادك كمستثمر معتمد في منصة RESURGO.</p>
                    <p className="text-charcoal/40 text-xs">جارٍ تحميل نافذة الاستثمار...</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
