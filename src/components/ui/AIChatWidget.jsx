import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Sparkles } from 'lucide-react';

// ── Knowledge base: maps keywords to answers ─────────────────────────────────
const KB = [
  {
    patterns: ['ضريبة', 'بيوع', 'رسوم تسجيل', 'ضريبة الدخل'],
    answer: 'وفق إصلاح 2025 الضريبي: رسوم البيع 1% من قيمة العقد (خُفِّضت من 4%). ضريبة الأرباح العقارية 15% للأفراد و20% للشركات. أما رسوم التسجيل في السجل العقاري فهي 0.5%. هل تريد حساباً تفصيلياً؟'
  },
  {
    patterns: ['مرسوم', 'تسجيل رقمي', 'توثيق إلكتروني'],
    answer: 'صدر مرسوم التسجيل الرقمي في مارس 2025 يُتيح توثيق عقود البيع والإيجار إلكترونياً عبر منصة وزارة العدل. يُختصر الوقت من 45 يوماً إلى 7 أيام. التخليص القانوني عبر RESURGO يشمل هذه الخدمة.'
  },
  {
    patterns: ['وكالة', 'توكيل', 'مغترب', 'خارج سوريا'],
    answer: 'يمكن للمغترب توكيل محامٍ أو قريب للبيع والشراء عبر وكالة رسمية مصدَّقة من السفارة السورية في بلد الإقامة ثم موثَّقة في كاتب العدل السوري. فريق التخليص لدينا يتولى المتابعة الكاملة.'
  },
  {
    patterns: ['إرث', 'ميراث', 'تركة'],
    answer: 'لنقل ملكية العقارات الموروثة يلزم: حصر الإرث الشرعي، حجة الوراثة من المحكمة، إخلاء طرف من الضرائب، ثم تسجيل الحصص في السجل العقاري. يمكن لفريق التخليص القانوني إتمام كل هذه الخطوات.'
  },
  {
    patterns: ['تقييم', 'قيمة العقار', 'سعر العقار', 'كم يساوي'],
    answer: 'نقدم تقييماً آلياً فورياً مجانياً بناءً على المقارنة مع عقارات مشابهة. للحصول على تقرير IVS 2025 معتمد من مقيِّم معتمد يمكنك طلب التقييم الرسمي. انتقل إلى قسم التقييم لمعرفة التفاصيل.'
  },
  {
    patterns: ['استثمار', 'عائد', 'تمويل جماعي', 'crowdfund'],
    answer: 'تتراوح العوائد في مشاريع التمويل الجماعي لدينا بين 12% و18.5% سنوياً. الحد الأدنى 500$. يُوزَّع العائد كل 3-6 أشهر. جميع المشاريع موثَّقة بـSPV قانوني ومدقَّقة مالياً. هل تريد الاطلاع على المشاريع المفتوحة؟'
  },
  {
    patterns: ['معدات', 'آليات', 'حفارة', 'جرافة', 'إيجار معدة'],
    answer: 'قسم المعدات يتيح استئجار أو تأجير المعدات الثقيلة بعقود موثَّقة وضمان مالي. تشمل الفئات: الحفر، الرفع، الخرسانة، والنقل. يمكن الاطلاع على قائمة المعدات المتاحة في قسم المعدات.'
  },
  {
    patterns: ['دمشق', 'حلب', 'اللاذقية', 'طرطوس', 'حمص'],
    answer: 'حسب خريطة الطلب لدينا: دمشق الأعلى طلباً (94/100) تليها ريف دمشق (81) ثم حلب (76). اللاذقية وطرطوس تمتازان بالطلب السياحي. يمكنك الاطلاع على خريطة الطلب الكاملة عبر قسم الاستثمار.'
  },
  {
    patterns: ['تخليص', 'خدمة قانونية', 'توثيق', 'تسجيل'],
    answer: 'خدمة التخليص القانوني تشمل: تسجيل العقارات، عقود البيع والإيجار، التوثيق الرقمي، متابعة الإرث، والوكالات. يمكنك تقديم طلبك عبر قسم التخليص والتتبع برقم المرجع.'
  },
  {
    patterns: ['مرحبا', 'أهلا', 'هلا', 'السلام'],
    answer: 'أهلاً بك في مساعد RESURGO! أنا هنا للإجابة على أسئلتك حول: العقارات، الضرائب والتشريعات، التقييم، الاستثمار، والمعدات. كيف يمكنني مساعدتك؟'
  },
  {
    patterns: ['شكرا', 'شكراً', 'ممتاز', 'رائع'],
    answer: 'بكل سرور! إذا كان لديك أي سؤال آخر أنا هنا دائماً. يمكنك أيضاً التواصل مع فريق الدعم عبر واتساب للاستشارات المتخصصة.'
  },
];

function findAnswer(query) {
  const q = query.toLowerCase();
  for (const item of KB) {
    if (item.patterns.some(p => q.includes(p))) return item.answer;
  }
  return 'سؤالك وصلني! هذا الموضوع يحتاج إلى متخصص. يمكنك التواصل مع فريق RESURGO مباشرة عبر واتساب، أو تصفح أقسام الموقع للمزيد من المعلومات. هل لديك سؤال آخر يمكنني المساعدة فيه؟';
}

const SUGGESTIONS = [
  'ما هي ضريبة البيوع الجديدة؟',
  'كيف أستثمر من الخارج؟',
  'كيف تتم خدمة التخليص؟',
  'ما متوسط العوائد في التمويل الجماعي؟',
];

export default function AIChatWidget() {
  const [open,    setOpen]    = useState(false);
  const [msgs,    setMsgs]    = useState([
    { role: 'bot', text: 'مرحباً! أنا مساعد RESURGO الذكي. اسألني عن العقارات، التشريعات، الاستثمار، أو التخليص.' }
  ]);
  const [input,   setInput]   = useState('');
  const [typing,  setTyping]  = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, msgs]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setMsgs(m => [...m, { role: 'user', text: q }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const answer = findAnswer(q);
      setMsgs(m => [...m, { role: 'bot', text: answer }]);
      setTyping(false);
    }, 700 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-[84px] lg:bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-brand shadow-lg shadow-brand/40 flex items-center justify-center hover:bg-navy transition-colors group"
            aria-label="مساعد ذكي"
          >
            <MessageCircle size={24} className="text-white" />
            <span className="absolute -top-1 -left-1 w-4 h-4 bg-cta rounded-full flex items-center justify-center">
              <Sparkles size={8} className="text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-[84px] lg:bottom-4 right-2 lg:right-4 z-50 w-[calc(100vw-1rem)] max-w-[340px] max-h-[520px] bg-white rounded-3xl shadow-2xl shadow-navy/20 flex flex-col overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-navy shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">مساعد RESURGO</p>
                  <p className="text-white/40 text-[10px] mt-0.5">متاح الآن · يجيب خلال ثوانٍ</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-cream text-navy rounded-tl-sm'
                      : 'bg-navy text-white rounded-tr-sm'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-end">
                  <div className="bg-navy rounded-2xl rounded-tr-sm px-4 py-3 flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {msgs.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-[10px] bg-cream hover:bg-brand/10 text-navy border border-navy/10 hover:border-brand/30 px-2.5 py-1.5 rounded-xl transition-colors font-medium">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-navy/8 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="اكتب سؤالك..."
                className="flex-1 bg-cream rounded-xl px-3 py-2 text-xs text-navy placeholder-charcoal/40 focus:outline-none border border-navy/10 focus:border-brand"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl bg-brand disabled:bg-navy/20 flex items-center justify-center transition-colors"
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
