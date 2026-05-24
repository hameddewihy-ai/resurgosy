import { useState } from 'react';
import { Star, Send, CheckCircle } from 'lucide-react';

const ASPECTS = {
  equipment: ['الجودة والحالة', 'الالتزام بالمواعيد', 'التوافق مع الوصف', 'خدمة ما بعد التسليم'],
  engineer:  ['الدقة التقنية', 'الالتزام بالمواعيد', 'جودة التقرير', 'التواصل والمتابعة'],
  contractor:['جودة التنفيذ', 'الالتزام بالجدول', 'النظافة والسلامة', 'الشفافية في التكاليف'],
  clearing:  ['سرعة الإنجاز', 'دقة الوثائق', 'التواصل', 'النتيجة النهائية'],
};

const LS_KEY = 'resurgo-ratings-v1';

function saveRating(entry) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    localStorage.setItem(LS_KEY, JSON.stringify([entry, ...prev].slice(0, 100)));
  } catch {}
}

function StarRow({ label, value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-charcoal/70 flex-1">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              size={18}
              className={`transition-colors ${(hover || value) >= s ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RatingWidget({ type = 'equipment', targetId, targetName, onSubmit }) {
  const aspects = ASPECTS[type] ?? ASPECTS.equipment;
  const [scores, setScores] = useState(() => Object.fromEntries(aspects.map(a => [a, 0])));
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);

  const overall = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / aspects.length) || 0;
  const complete = Object.values(scores).every(v => v > 0);

  const submit = () => {
    if (!complete) return;
    const entry = { id: Date.now(), type, targetId, targetName, scores, overall, comment, date: new Date().toISOString() };
    saveRating(entry);
    onSubmit?.(entry);
    setDone(true);
  };

  if (done) {
    return (
      <div className="text-center py-8 space-y-3" dir="rtl">
        <CheckCircle size={40} className="text-green-500 mx-auto" />
        <p className="text-navy font-black text-lg">شكراً على تقييمك!</p>
        <div className="flex justify-center gap-0.5">
          {[1,2,3,4,5].map(s => (
            <Star key={s} size={20} className={s <= overall ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />
          ))}
        </div>
        <p className="text-charcoal/50 text-sm">تقييمك يساعد المستخدمين الآخرين على اتخاذ قراراتهم</p>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      {targetName && (
        <div className="flex items-center gap-3 pb-3 border-b border-navy/8">
          <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
            <Star size={14} className="text-brand" />
          </div>
          <div>
            <p className="text-navy font-bold text-sm">{targetName}</p>
            <p className="text-charcoal/50 text-xs">قيّم تجربتك</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {aspects.map(a => (
          <StarRow key={a} label={a} value={scores[a]} onChange={v => setScores(p => ({ ...p, [a]: v }))} />
        ))}
      </div>

      {overall > 0 && (
        <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2.5">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={14} className={s <= overall ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-200'} />
            ))}
          </div>
          <span className="text-yellow-700 text-xs font-bold">التقييم الإجمالي: {overall}/5</span>
        </div>
      )}

      <div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="أضف تعليقاً (اختياري)..."
          rows={3}
          className="w-full border border-navy/12 rounded-xl px-4 py-3 text-sm text-navy placeholder-charcoal/35 focus:outline-none focus:border-brand/40 resize-none"
        />
      </div>

      <button
        onClick={submit}
        disabled={!complete}
        className="w-full btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send size={15} /> إرسال التقييم
      </button>

      {!complete && (
        <p className="text-charcoal/40 text-xs text-center">قيّم جميع المحاور أولاً</p>
      )}
    </div>
  );
}
