import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, ThumbsUp, Send, Clock,
  CheckCircle, BadgeCheck, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const QNA_KEY   = id => `resurgo-qna-${id}`;
const VOTES_KEY = id => `resurgo-qna-votes-${id}`;

function loadQnAs(pid)  { try { return JSON.parse(localStorage.getItem(QNA_KEY(pid))   || '[]'); } catch { return []; } }
function saveQnAs(pid, items)  { try { localStorage.setItem(QNA_KEY(pid), JSON.stringify(items)); } catch {} }
function loadVotes(pid) { try { return JSON.parse(localStorage.getItem(VOTES_KEY(pid)) || '{}'); } catch { return {}; } }
function saveVotes(pid, v)     { try { localStorage.setItem(VOTES_KEY(pid), JSON.stringify(v)); } catch {} }

export default function InvestorQnA({ project }) {
  const [userQnAs,  setUserQnAs]  = useState(() => loadQnAs(project.id));
  const [votes,     setVotes]     = useState(() => loadVotes(project.id));
  const [question,  setQuestion]  = useState('');
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState(null);

  const officialQnAs = (project.faqs || []).map((faq, i) => ({
    id: `official-${i}`,
    q: faq.q,
    a: faq.a,
    answered: true,
    fromDeveloper: true,
    votes: 4 + i * 3,
    date: '2026-05',
  }));

  const allQnAs = [...officialQnAs, ...userQnAs];

  const filtered = allQnAs.filter(item => {
    if (filter === 'answered') return item.answered;
    if (filter === 'pending')  return !item.answered;
    return true;
  });

  const handleSubmit = () => {
    const q = question.trim();
    if (q.length < 10) { toast.error('يرجى كتابة سؤال أوضح (10 أحرف على الأقل)'); return; }
    const newItem = {
      id: Date.now(),
      q, a: null, answered: false, fromDeveloper: false, votes: 0,
      date: new Date().toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
    };
    const updated = [newItem, ...userQnAs];
    setUserQnAs(updated);
    saveQnAs(project.id, updated);
    setQuestion('');
    toast.success('تم إرسال سؤالك — سيرد المطوّر خلال 48 ساعة');
  };

  const handleVote = (id) => {
    if (votes[id]) return;
    const newVotes = { ...votes, [id]: true };
    setVotes(newVotes);
    saveVotes(project.id, newVotes);
    if (!String(id).startsWith('official-')) {
      setUserQnAs(prev => {
        const updated = prev.map(item => item.id === id ? { ...item, votes: item.votes + 1 } : item);
        saveQnAs(project.id, updated);
        return updated;
      });
    }
    toast('شكراً على تفاعلك!', { icon: '👍', duration: 1400 });
  };

  const TABS = [
    { value: 'all',      label: `الكل (${allQnAs.length})` },
    { value: 'answered', label: `مُجاب (${allQnAs.filter(q => q.answered).length})` },
    { value: 'pending',  label: `قيد الإجابة (${allQnAs.filter(q => !q.answered).length})` },
  ];

  return (
    <div className="bg-white p-6 mb-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <MessageCircle size={14} className="text-brand" />
          <p className="text-charcoal/50 text-xs font-semibold uppercase tracking-wider">أسئلة المستثمرين</p>
        </div>
        <span className="text-[10px] text-charcoal/35">{allQnAs.length} سؤال</span>
      </div>

      {/* Submit question */}
      <div className="bg-cream/60 rounded-2xl p-4 mb-5 border border-navy/6">
        <p className="text-navy font-bold text-xs mb-2.5">هل لديك سؤال للمطوّر؟</p>
        <div className="flex gap-2">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="مثلاً: ما آلية توزيع الأرباح وهل يمكن صرفها شهرياً؟"
            className="flex-1 text-xs border border-navy/15 rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand/30 resize-none bg-white leading-relaxed"
            rows={2}
            dir="rtl"
          />
          <button
            onClick={handleSubmit}
            className="shrink-0 bg-brand text-white px-4 rounded-xl flex flex-col items-center justify-center gap-1 text-[10px] font-bold hover:bg-navy transition-colors"
          >
            <Send size={14} />
            إرسال
          </button>
        </div>
        <p className="text-[10px] text-charcoal/35 mt-2">يرد المطوّر خلال 48 ساعة · سؤالك مرئي للمستثمرين الآخرين</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border transition-all ${
              filter === tab.value
                ? 'bg-brand text-white border-brand'
                : 'border-navy/12 text-charcoal/55 hover:border-brand/30 hover:text-brand'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Q&A list */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <p className="text-center text-charcoal/40 text-xs py-8">لا توجد أسئلة في هذا التصنيف بعد</p>
        ) : filtered.map(item => {
          const displayVotes = item.votes + (votes[item.id] && String(item.id).startsWith('official-') ? 1 : 0);
          return (
            <div key={item.id} className="border border-navy/8 rounded-2xl overflow-hidden">
              {/* Question row */}
              <button
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                className="w-full flex items-start gap-3 p-4 text-right hover:bg-cream/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {item.fromDeveloper && (
                      <span className="text-[9px] font-bold bg-brand/8 text-brand px-2 py-0.5 rounded-full border border-brand/15 flex items-center gap-1">
                        <BadgeCheck size={8} /> سؤال مُختار
                      </span>
                    )}
                    {item.answered ? (
                      <span className="text-[9px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                        <CheckCircle size={8} /> مُجاب
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                        <Clock size={8} /> قيد الإجابة
                      </span>
                    )}
                    <span className="text-[9px] text-charcoal/30">{item.date}</span>
                  </div>
                  <p className="text-navy font-semibold text-xs leading-snug">{item.q}</p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2 mr-1">
                  <button
                    onClick={e => { e.stopPropagation(); handleVote(item.id); }}
                    className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                      votes[item.id]
                        ? 'bg-brand/10 text-brand border-brand/20'
                        : 'border-navy/10 text-charcoal/40 hover:border-brand/25 hover:text-brand'
                    }`}
                  >
                    <ThumbsUp size={9} fill={votes[item.id] ? 'currentColor' : 'none'} />
                    {displayVotes}
                  </button>
                  <ChevronDown size={12} className={`text-charcoal/30 transition-transform ${expanded === item.id ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {expanded === item.id && (
                  <motion.div
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      {item.answered && item.a ? (
                        <div className="border-r-2 border-brand/40 pr-3">
                          <p className="text-[10px] font-bold text-brand mb-1.5 flex items-center gap-1">
                            <BadgeCheck size={10} /> إجابة المطوّر
                          </p>
                          <p className="text-charcoal/65 text-xs leading-relaxed">{item.a}</p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[11px] text-amber-700 leading-relaxed">
                          سؤالك قيد المراجعة — سيرد المطوّر خلال 48 ساعة عمل. ستصلك إشعاراً عند نشر الإجابة.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
