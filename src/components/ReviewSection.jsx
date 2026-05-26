import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const LS_KEY = 'resurgo-reviews';

function lsLoad(propId) {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}')[propId] || []; }
  catch { return []; }
}

function lsSave(propId, reviews) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    all[propId] = reviews;
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ── Star input ────────────────────────────────────────────────────────────────
function StarInput({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n} type="button"
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110 active:scale-95">
          <Star
            size={24}
            className={(hover || value) >= n
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-navy/20'}
          />
        </button>
      ))}
    </div>
  );
}

// ── Rating distribution bar ───────────────────────────────────────────────────
function RatingBar({ stars, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-charcoal/50 w-3 text-right">{stars}</span>
      <Star size={10} className="text-yellow-400 fill-yellow-400 shrink-0" />
      <div className="flex-1 h-1.5 bg-navy/8 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-charcoal/40 w-5 text-left shrink-0">{count}</span>
    </div>
  );
}

// ── Single review card ────────────────────────────────────────────────────────
function ReviewCard({ review, onLike }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 space-y-3 shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
      style={{ borderRadius: '8px' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-sm font-black text-brand shrink-0">
            {review.authorName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-navy font-bold text-sm leading-none">{review.authorName}</p>
            <p className="text-charcoal/40 text-[11px] mt-0.5">{review.date}</p>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} size={13}
              className={n <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />
          ))}
        </div>
      </div>
      <p className="text-charcoal/70 text-sm leading-relaxed">{review.comment}</p>
      <button
        onClick={() => onLike(review.id)}
        className="flex items-center gap-1.5 text-xs text-charcoal/40 hover:text-brand transition-colors">
        <ThumbsUp size={12} />
        <span>مفيد ({review.likes})</span>
      </button>
    </motion.div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
const normalizeRow = (r) => ({
  id:         r.id,
  authorName: r.user_name || 'مستخدم',
  rating:     r.rating,
  comment:    r.body || '',
  date:       formatDate(r.created_at),
  likes:      r.likes ?? 0,
});

export default function ReviewSection({ propertyId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(() => isConfigured ? [] : lsLoad(propertyId));
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');

  // Load from Supabase on mount
  useEffect(() => {
    if (!isConfigured) return;
    supabase
      .from('reviews')
      .select('*')
      .eq('property_id', String(propertyId))
      .order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setReviews(data.map(normalizeRow)); });
  }, [propertyId]);

  const avg  = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  const submit = async () => {
    if (!rating)        { toast.error('يرجى اختيار تقييم بالنجوم'); return; }
    if (!comment.trim()){ toast.error('يرجى كتابة تعليق'); return; }
    const name = user?.full_name || guestName.trim() || 'مستخدم';

    if (isConfigured && user) {
      const { data, error } = await supabase.from('reviews').insert({
        property_id: String(propertyId),
        user_id:     user.id,
        user_name:   name,
        rating,
        body:        comment.trim(),
        likes:       0,
      }).select().single();
      if (!error && data) {
        setReviews(prev => [normalizeRow(data), ...prev]);
      }
    } else {
      const rev = {
        id: Date.now(), authorName: name, rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('ar-SY', { year: 'numeric', month: 'long', day: 'numeric' }),
        likes: 0,
      };
      const next = [rev, ...reviews];
      setReviews(next);
      lsSave(propertyId, next);
    }

    setShowForm(false); setRating(0); setComment(''); setGuestName('');
    toast.success('شكراً! تمت إضافة مراجعتك');
  };

  const like = (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    if (isConfigured) {
      const rev = reviews.find(r => r.id === id);
      if (rev) supabase.from('reviews').update({ likes: rev.likes + 1 }).eq('id', id).catch(() => {});
    } else {
      const next = reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r);
      lsSave(propertyId, next);
    }
  };

  return (
    <div dir="rtl">
      {/* Header: avg + distribution + button */}
      <div className="flex items-start justify-between gap-6 mb-6 flex-wrap">
        {reviews.length > 0 ? (
          <div className="flex items-start gap-5">
            <div className="text-center shrink-0">
              <p className="text-navy font-black text-5xl leading-none">{avg}</p>
              <div className="flex gap-0.5 justify-center mt-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={13}
                    className={n <= Math.round(avg) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />
                ))}
              </div>
              <p className="text-charcoal/45 text-[11px] mt-1">{reviews.length} مراجعة</p>
            </div>
            <div className="flex-1 min-w-32 space-y-1.5 pt-1">
              {dist.map(({ stars, count }) => (
                <RatingBar key={stars} stars={stars} count={count} total={reviews.length} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-charcoal/50 text-sm">لا توجد مراجعات بعد — كن أول من يقيّم هذا العقار</p>
        )}
        <button
          onClick={() => setShowForm((s) => !s)}
          className="btn-cta text-xs px-4 py-2 shrink-0">
          {showForm ? 'إلغاء' : '+ إضافة مراجعة'}
        </button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6">
            <div className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <div>
                <p className="text-charcoal/60 text-xs font-semibold mb-2 uppercase tracking-wider">التقييم</p>
                <StarInput value={rating} onChange={setRating} />
              </div>
              {!user && (
                <input
                  value={guestName} onChange={(e) => setGuestName(e.target.value)}
                  placeholder="اسمك (اختياري)"
                  className="w-full input-field text-sm py-2.5" dir="rtl" />
              )}
              <textarea
                value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="شاركنا رأيك بهذا العقار — الموقع، الحالة، القيمة مقابل السعر..."
                rows={4}
                className="w-full input-field text-sm py-2.5 resize-none leading-relaxed" dir="rtl" />
              <button onClick={submit} className="btn-cta w-full text-sm">
                نشر المراجعة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.map((rev) => (
          <ReviewCard key={rev.id} review={rev} onLike={like} />
        ))}
      </div>
    </div>
  );
}
