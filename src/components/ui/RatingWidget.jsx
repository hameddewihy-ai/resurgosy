import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Lock } from 'lucide-react';
import { supabase, isConfigured } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const ASPECTS = {
  equipment: ['الجودة والحالة', 'الالتزام بالمواعيد', 'التوافق مع الوصف', 'خدمة ما بعد التسليم'],
  engineer:  ['الدقة التقنية', 'الالتزام بالمواعيد', 'جودة التقرير', 'التواصل والمتابعة'],
  contractor:['جودة التنفيذ', 'الالتزام بالجدول', 'النظافة والسلامة', 'الشفافية في التكاليف'],
  clearing:  ['سرعة الإنجاز', 'دقة الوثائق', 'التواصل', 'النتيجة النهائية'],
};

const LS_KEY = 'resurgo-ratings-v1';

function lsSave(entry) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    localStorage.setItem(LS_KEY, JSON.stringify([entry, ...prev].slice(0, 100)));
  } catch {}
}

function lsHasRated(type, targetId) {
  try {
    const prev = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return prev.some(r => r.type === type && String(r.targetId) === String(targetId));
  } catch { return false; }
}

function StarRow({ label, value, onChange, disabled }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-charcoal/70 flex-1">{label}</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button
            key={s}
            type="button"
            onClick={() => !disabled && onChange(s)}
            onMouseEnter={() => !disabled && setHover(s)}
            onMouseLeave={() => setHover(0)}
            disabled={disabled}
            className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
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

// ── Average stars display (read-only) ─────────────────────────────────────────
export function RatingDisplay({ type, targetId }) {
  const [avg, setAvg]     = useState(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isConfigured || !targetId) return;
    supabase
      .from('ratings')
      .select('overall')
      .eq('type', type)
      .eq('target_id', String(targetId))
      .then(({ data }) => {
        if (!data?.length) return;
        setCount(data.length);
        setAvg(Math.round((data.reduce((s, r) => s + r.overall, 0) / data.length) * 10) / 10);
      });
  }, [type, targetId]);

  if (avg === null) return null;
  return (
    <div className="flex items-center gap-1.5" dir="rtl">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(s => (
          <Star key={s} size={13}
            className={s <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />
        ))}
      </div>
      <span className="text-xs text-charcoal/60 font-medium">{avg} <span className="text-charcoal/35">({count})</span></span>
    </div>
  );
}

// ── Rating form ───────────────────────────────────────────────────────────────
export default function RatingWidget({ type = 'equipment', targetId, targetName, onSubmit }) {
  const { user }   = useAuth();
  const aspects    = ASPECTS[type] ?? ASPECTS.equipment;
  const [scores, setScores]   = useState(() => Object.fromEntries(aspects.map(a => [a, 0])));
  const [comment, setComment] = useState('');
  const [done, setDone]       = useState(false);
  const [saving, setSaving]   = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  // Check if user already rated this target
  useEffect(() => {
    if (!targetId) return;
    if (isConfigured && user) {
      supabase
        .from('ratings')
        .select('id')
        .eq('type', type)
        .eq('target_id', String(targetId))
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => { if (data) setAlreadyRated(true); });
    } else {
      if (lsHasRated(type, targetId)) setAlreadyRated(true);
    }
  }, [type, targetId, user]);

  const overall  = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / aspects.length) || 0;
  const complete = Object.values(scores).every(v => v > 0);

  const submit = async () => {
    if (!complete || saving) return;
    setSaving(true);

    const entry = {
      id: Date.now(), type, targetId, targetName,
      scores, overall, comment, date: new Date().toISOString(),
    };

    if (isConfigured && user) {
      const { error } = await supabase.from('ratings').upsert({
        user_id:     user.id,
        type,
        target_id:   String(targetId),
        target_name: targetName || null,
        scores,
        overall,
        comment:     comment.trim() || null,
      }, { onConflict: 'user_id,type,target_id' });

      if (error) {
        lsSave(entry);
      }
    } else {
      lsSave(entry);
    }

    onSubmit?.(entry);
    setSaving(false);
    setDone(true);
  };

  if (alreadyRated) {
    return (
      <div className="text-center py-8 space-y-3" dir="rtl">
        <CheckCircle size={36} className="text-brand/60 mx-auto" />
        <p className="text-navy font-bold text-base">قيّمت هذا العنصر سابقاً</p>
        <p className="text-charcoal/40 text-sm">يمكن تقييم كل عنصر مرة واحدة فقط</p>
      </div>
    );
  }

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

      {!user && isConfigured && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-xs text-amber-700">
          <Lock size={12} className="shrink-0" />
          سجّل دخولك لحفظ تقييمك في قاعدة البيانات
        </div>
      )}

      <div className="space-y-3">
        {aspects.map(a => (
          <StarRow key={a} label={a} value={scores[a]}
            onChange={v => setScores(p => ({ ...p, [a]: v }))} />
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
        disabled={!complete || saving}
        className="w-full btn-cta flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Send size={15} /> {saving ? 'جاري الحفظ...' : 'إرسال التقييم'}
      </button>

      {!complete && (
        <p className="text-charcoal/40 text-xs text-center">قيّم جميع المحاور أولاً</p>
      )}
    </div>
  );
}
