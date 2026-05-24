import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, CheckCircle, XCircle, Trophy, RefreshCw, ChevronRight, Star, BadgeCheck, AlertTriangle } from 'lucide-react';

const QUESTION_BANK = {
  'FIDIC': [
    { q: 'ما الاختصار الكامل لـ FIDIC؟', options: ['الاتحاد الدولي للمهندسين الاستشاريين','معهد التصميم الدولي','اتحاد شركات البناء','الاتحاد الدولي للمقاولين'], correct: 0 },
    { q: 'في عقد "الكتاب الأحمر"، من المسؤول عن التصميم؟', options: ['المقاول','صاحب العمل','المهندس المشرف','الاستشاري'], correct: 1 },
    { q: 'المدة المحددة للرد على المطالبات في FIDIC؟', options: ['14 يوم','28 يوم','42 يوم','60 يوم'], correct: 1 },
    { q: 'الفرق بين Variation وClaim في FIDIC؟', options: ['لا فرق','Variation بأمر المهندس، Claim تعويض','Claim أقل قيمة','Variation للمواد فقط'], correct: 1 },
  ],
  'Primavera P6': [
    { q: 'ما هو الـ Critical Path في P6؟', options: ['أطول مسار بدون فائض','المسار الأقل تكلفة','المسار الأقصر','المسار بأكثر مهام'], correct: 0 },
    { q: 'ما وظيفة Baseline في P6؟', options: ['حذف البيانات','نسخة مرجعية للمقارنة','جدول بديل','تقرير مالي'], correct: 1 },
    { q: 'ما معنى Float في الجدولة؟', options: ['وقت ضائع','هامش تأخر مسموح','عمل إضافي','وقت استراحة'], correct: 1 },
    { q: 'ما هو WBS في P6؟', options: ['جدول مدفوعات','هيكل تقسيم العمل','قائمة موردين','مصفوفة مخاطر'], correct: 1 },
  ],
  'SAP2000': [
    { q: 'نوع التحليل الأساسي في SAP2000؟', options: ['مالي','عناصر محدودة للإنشاءات','جريان سوائل','طاقة شمسية'], correct: 1 },
    { q: 'وظيفة Section Designer في SAP2000؟', options: ['رسم معماري','تعريف مقاطع مركبة','شبكات صرف','تقارير PDF'], correct: 1 },
    { q: 'متى تُستخدم Shell Elements؟', options: ['أعمدة فقط','ألواح رقيقة وجدران وقباب','تربة فقط','أساسات عميقة'], correct: 1 },
    { q: 'الفرق بين Linear وNonlinear؟', options: ['لا فرق','خطي تناسبي، غير خطي يأخذ التشوه','خطي أدق دائماً','غير خطي للمباني الصغيرة'], correct: 1 },
  ],
  'default': [
    { q: 'أهمية التوثيق في مشاريع البناء؟', options: ['ليس ضرورياً','للمطالبات والمساءلة القانونية','للمشاريع الدولية فقط','للأغراض الجمالية'], correct: 1 },
    { q: 'ما مبدأ Due Diligence؟', options: ['أسرع إنجاز','فحص وتحقق شامل قبل القرارات','الاعتماد على المقاول','تقليل التكاليف'], correct: 1 },
    { q: 'ما المقصود بـ Punch List؟', options: ['قائمة مواد','أعمال ناقصة أو معيبة قبل التسليم','فاتورة المقاول','تقرير السلامة'], correct: 1 },
    { q: 'الفرق بين Specification وStandard؟', options: ['لا فرق','Specification لمشروع، Standard معيار عام','Standard أحدث','Specification حكومية فقط'], correct: 1 },
  ],
};

function getQuestions(skillName) {
  const found = Object.keys(QUESTION_BANK).find(k => skillName.includes(k) || k.includes(skillName.split(' ')[0]));
  const pool = QUESTION_BANK[found] || QUESTION_BANK['default'];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 4);
}

function TimerRing({ seconds, total = 60 }) {
  const r = 20, c = 2 * Math.PI * r;
  const color = seconds > 20 ? '#5979bb' : seconds > 10 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="56" height="56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#f1f5f9" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={c} strokeDashoffset={c * (1 - seconds / total)}
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
      </svg>
      <span className="text-sm font-black" style={{ color }}>{seconds}</span>
    </div>
  );
}

export default function SkillAssessmentModal({ isOpen, onClose, skillName, onPassed }) {
  const [stage, setStage] = useState('intro');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [uploading, setUploading] = useState(false);

  const reset = useCallback(() => {
    setQuestions(getQuestions(skillName));
    setCurrent(0); setAnswers([]); setTimeLeft(60);
    setSelected(null); setRevealed(false); setStage('intro');
    setEvidence(null); setUploading(false);
  }, [skillName]);

  useEffect(() => { if (isOpen) reset(); }, [isOpen, reset]);

  useEffect(() => {
    if (stage !== 'quiz' || revealed) return;
    if (timeLeft <= 0) { handleReveal(null); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  });

  const handleReveal = (choice) => { setSelected(choice); setRevealed(true); };

  const handleNext = () => {
    const isCorrect = selected === questions[current].correct;
    const newAnswers = [...answers, { chosen: selected, correct: questions[current].correct, isCorrect }];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) {
      setStage('result');
    } else {
      setCurrent(p => p + 1); setTimeLeft(60); setSelected(null); setRevealed(false);
    }
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setStage('success_final');
      if (onPassed) onPassed();
    }, 1500);
  };

  const score = answers.filter(a => a.isCorrect).length;
  const passed = score >= Math.ceil((questions.length || 4) * 0.7);
  const q = questions[current];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[8%] max-w-lg mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[88vh] overflow-y-auto" dir="rtl">
            {/* Header */}
            <div className="bg-navy px-5 py-4 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand/20 flex items-center justify-center">
                  <Brain size={18} className="text-brand" />
                </div>
                <div>
                  <p className="text-white font-black text-sm">اختبار المهارة</p>
                  <p className="text-white/50 text-[10px]">{skillName}</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {stage === 'intro' && (
                  <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-5">
                    <div className="w-20 h-20 rounded-3xl bg-brand/10 border-2 border-brand/20 flex items-center justify-center mx-auto">
                      <BadgeCheck size={36} className="text-brand" />
                    </div>
                    <div>
                      <h3 className="text-navy font-black text-lg mb-1">جاهز للاختبار؟</h3>
                      <p className="text-charcoal/60 text-sm">{questions.length} أسئلة مهنية في {skillName}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[{ l: 'الأسئلة', v: questions.length },{ l: 'وقت كل سؤال', v: '60 ث' },{ l: 'نسبة النجاح', v: '70%' }].map(({ l, v }) => (
                        <div key={l} className="bg-cream rounded-2xl p-3">
                          <p className="text-navy font-black text-lg">{v}</p>
                          <p className="text-charcoal/50 text-[10px]">{l}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setStage('quiz')}
                      className="w-full bg-navy hover:bg-brand text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
                      <Brain size={16} /> ابدأ الاختبار
                    </button>
                  </motion.div>
                )}

                {stage === 'quiz' && q && (
                  <motion.div key={`q-${current}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between text-xs text-charcoal/50 mb-1.5">
                          <span>السؤال {current + 1} من {questions.length}</span>
                        </div>
                        <div className="h-1.5 bg-navy/8 rounded-full overflow-hidden">
                          <motion.div className="h-full bg-brand rounded-full" animate={{ width: `${(current / questions.length) * 100}%` }} />
                        </div>
                      </div>
                      <TimerRing seconds={timeLeft} />
                    </div>
                    <div className="bg-cream rounded-2xl p-4">
                      <p className="text-navy font-bold text-sm leading-relaxed">{q.q}</p>
                    </div>
                    <div className="space-y-2.5">
                      {q.options.map((opt, i) => {
                        let cls = 'border-navy/10 bg-white text-charcoal hover:border-brand/40';
                        if (revealed) {
                          if (i === q.correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
                          else if (i === selected) cls = 'border-red-400 bg-red-50 text-red-700';
                          else cls = 'border-navy/5 bg-cream/50 text-charcoal/40';
                        } else if (selected === i) cls = 'border-brand bg-brand/10 text-navy';
                        return (
                          <button key={i} disabled={revealed} onClick={() => !revealed && handleReveal(i)}
                            className={`w-full text-right flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${cls}`}>
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${revealed && i === q.correct ? 'bg-emerald-500 border-emerald-500 text-white' : revealed && i === selected ? 'bg-red-500 border-red-500 text-white' : 'border-navy/10 bg-cream text-charcoal/60'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            {opt}
                            {revealed && i === q.correct && <CheckCircle size={14} className="text-emerald-500 mr-auto shrink-0" />}
                            {revealed && i === selected && selected !== q.correct && <XCircle size={14} className="text-red-500 mr-auto shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {revealed && (
                      <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={handleNext}
                        className="w-full bg-navy hover:bg-brand text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
                        {current + 1 >= questions.length ? <><Trophy size={16} /> عرض النتيجة</> : <><ChevronRight size={16} /> التالي</>}
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {stage === 'result' && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
                    <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto border-4 ${passed ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
                      {passed ? <Trophy size={40} className="text-emerald-500" /> : <AlertTriangle size={40} className="text-red-400" />}
                    </div>
                    <div>
                      <h3 className={`font-black text-2xl mb-1 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                        {passed ? '🎉 أنت ناجح!' : '😔 لم تنجح هذه المرة'}
                      </h3>
                      <p className="text-charcoal/60 text-sm">أجبت بشكل صحيح على <span className="font-black text-navy">{score} من {questions.length}</span></p>
                    </div>
                    <div className="flex justify-center gap-2">
                      {answers.map((a, i) => (
                        <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${a.isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-red-50 border-red-200'}`}>
                          {a.isCorrect ? <CheckCircle size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-red-400" />}
                        </div>
                      ))}
                    </div>
                    {passed ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BadgeCheck size={18} className="text-emerald-600" />
                          <p className="text-emerald-700 font-black text-sm">شارة المهارة المُتحقَّق منها</p>
                        </div>
                        <p className="text-emerald-600 text-xs">تمت إضافة "{skillName}" كمهارة محقَّقة ✅ في بطاقة SVP الخاصة بك</p>
                        <div className="flex justify-center gap-1 mt-3">
                          {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.ceil((score / questions.length) * 5) ? 'text-amber-400 fill-amber-400' : 'text-charcoal/20'} />)}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-right">
                        <p className="text-amber-700 font-bold text-sm mb-1">💪 استمر في التعلم</p>
                        <p className="text-amber-600 text-xs">راجع مفاهيم {skillName} وأعد المحاولة في أي وقت</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      {!passed && (
                        <button onClick={reset} className="flex-1 flex items-center justify-center gap-2 border-2 border-navy/15 text-navy font-bold py-3 rounded-2xl hover:border-brand/40 transition-colors text-sm">
                          <RefreshCw size={14} /> أعد المحاولة
                        </button>
                      )}
                      <button 
                        onClick={() => passed ? setStage('evidence') : onClose()} 
                        className="flex-1 bg-navy hover:bg-brand text-white font-bold py-3 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2">
                        {passed ? <><ChevronRight size={14} /> الخطوة التالية</> : <><CheckCircle size={14} /> إغلاق</>}
                      </button>
                    </div>
                  </motion.div>
                )}

                {stage === 'evidence' && (
                  <motion.div key="evidence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-3">
                        <Trophy size={28} className="text-brand" />
                      </div>
                      <h3 className="text-navy font-black text-lg">تحميل الوثائق الداعمة</h3>
                      <p className="text-charcoal/50 text-xs mt-1">اختياري: حمّل شهادة أو عينة عمل لتعزيز مصداقية شارتك</p>
                    </div>

                    <div className="border-2 border-dashed border-navy/10 rounded-2xl p-8 text-center bg-cream/30 hover:bg-cream transition-colors cursor-pointer group">
                      <input type="file" className="hidden" id="evidence-upload" onChange={(e) => setEvidence(e.target.files[0])} />
                      <label htmlFor="evidence-upload" className="cursor-pointer block">
                        <div className="w-12 h-12 rounded-xl bg-white border border-navy/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-sm">
                          <RefreshCw size={20} className="text-charcoal/40" />
                        </div>
                        {evidence ? (
                          <div className="flex items-center justify-center gap-2 text-navy font-bold text-sm">
                            <CheckCircle size={14} className="text-emerald-500" />
                            {evidence.name}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <p className="text-navy font-bold text-sm">اختر ملفاً أو اسحبه هنا</p>
                            <p className="text-charcoal/40 text-[10px]">PDF, JPG (Max 5MB)</p>
                          </div>
                        )}
                      </label>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => { if (onPassed) onPassed(); setStage('success_final'); }}
                        className="flex-1 border-2 border-navy/10 text-charcoal/60 font-bold py-3 rounded-2xl hover:bg-navy/5 transition-colors text-sm">
                        تخطي التحميل
                      </button>
                      <button 
                        onClick={handleUpload}
                        disabled={!evidence || uploading}
                        className={`flex-1 font-bold py-3 rounded-2xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg ${evidence && !uploading ? 'bg-brand text-white shadow-brand/20' : 'bg-navy/10 text-charcoal/30 cursor-not-allowed shadow-none'}`}>
                        {uploading ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        {uploading ? 'جاري الرفع...' : 'تأكيد الرفع'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {stage === 'success_final' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6 space-y-6">
                    <div className="relative">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                        className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                        <BadgeCheck size={48} className="text-white" />
                      </motion.div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                        {/* Simple confetti effect simulation with small particles */}
                        {[...Array(6)].map((_, i) => (
                          <motion.div key={i} className="absolute w-2 h-2 rounded-full bg-brand"
                            initial={{ x: 0, y: 50, opacity: 1 }}
                            animate={{ x: (i - 2.5) * 40, y: -40, opacity: 0 }}
                            transition={{ duration: 1, delay: 0.3 }} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-navy font-black text-2xl mb-2">اكتمل التحقق!</h3>
                      <p className="text-charcoal/60 text-sm max-w-[240px] mx-auto">لقد تم توثيق مهارة <strong className="text-navy">"{skillName}"</strong> رسمياً في ملفك المهني.</p>
                    </div>
                    <div className="p-4 bg-navy/5 rounded-2xl border border-navy/5">
                      <p className="text-navy font-bold text-xs mb-3 uppercase tracking-widest">بطاقة الهوية المهنية</p>
                      <div className="flex items-center gap-4 text-right">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-navy/5">
                          <img src="/logo192.png" alt="SVP" className="w-8 h-8 opacity-40 grayscale" />
                        </div>
                        <div className="flex-1">
                          <p className="text-navy font-black text-sm">Verified SVP Expert</p>
                          <p className="text-charcoal/50 text-[10px]">Credential ID: RES-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle size={14} className="text-emerald-600" />
                        </div>
                      </div>
                    </div>
                    <button onClick={onClose} className="w-full bg-navy hover:bg-brand text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-navy/20">
                      العودة للوحة التحكم
                    </button>
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
