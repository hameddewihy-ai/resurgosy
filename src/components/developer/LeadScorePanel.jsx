import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Flame, Thermometer, Phone, Mail,
  TrendingUp, Star, Crown, ArrowUpRight, Users,
} from 'lucide-react';

// ── Lead Scoring Engine ───────────────────────────────────────────────────────
export function computeLeadScore(lead) {
  let score = 0;

  // 1. Property value (30 pts)
  if (lead.val >= 200000)      score += 30;
  else if (lead.val >= 100000) score += 20;
  else if (lead.val >= 50000)  score += 13;
  else                          score += 6;

  // 2. CRM stage (25 pts)
  const stageScore = { 'تفاوض': 25, 'تواصل': 15, 'جديد': 7, 'مغلق': 0 };
  score += stageScore[lead.status] ?? 5;

  // 3. Recency (20 pts) — parse date from lead.date "YYYY-MM-DD"
  const daysDiff = (() => {
    try {
      const d = new Date(lead.date);
      const now = new Date();
      return Math.floor((now - d) / 86400000);
    } catch { return 60; }
  })();
  if (daysDiff <= 7)       score += 20;
  else if (daysDiff <= 30) score += 12;
  else if (daysDiff <= 90) score += 6;
  else                      score += 2;

  // 4. Unit type (15 pts)
  const unit = (lead.unit || '').toLowerCase();
  if (unit.includes('فيلا') || unit.includes('بنتهاوس') || unit.includes('penthouse')) score += 15;
  else if (unit.includes('شقة') || unit.includes('مكتب'))   score += 10;
  else score += 6;

  // 5. Engagement bias (10 pts) — simulated deterministically from lead id
  const bias = (lead.id % 3 === 0) ? 10 : (lead.id % 2 === 0) ? 6 : 3;
  score += bias;

  return Math.min(100, score);
}

export function getScoreTier(score) {
  if (score >= 80) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

const TIER_CFG = {
  hot: {
    label: 'Hot 🔥',
    badge: 'bg-red-50 text-red-600 border-red-200',
    bar: 'bg-gradient-to-l from-red-500 to-orange-400',
    icon: Flame,
    iconColor: 'text-red-500',
    recommendation: 'تواصل اليوم — الفرصة مرتفعة',
    recColor: 'text-red-600 bg-red-50 border-red-100',
    ringColor: 'ring-red-200',
  },
  warm: {
    label: 'Warm ✅',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-gradient-to-l from-amber-500 to-yellow-400',
    icon: Star,
    iconColor: 'text-amber-500',
    recommendation: 'أرسل عرضاً مخصصاً هذا الأسبوع',
    recColor: 'text-amber-700 bg-amber-50 border-amber-100',
    ringColor: 'ring-amber-200',
  },
  cold: {
    label: 'Cold 🌡️',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    bar: 'bg-gradient-to-l from-slate-400 to-slate-300',
    icon: Thermometer,
    iconColor: 'text-slate-400',
    recommendation: 'مراقبة — لا أولوية عاجلة',
    recColor: 'text-slate-500 bg-slate-50 border-slate-100',
    ringColor: 'ring-slate-200',
  },
};

// ── Lead Card in Panel ────────────────────────────────────────────────────────
function LeadPanelCard({ lead, score, tier, rank }) {
  const cfg = TIER_CFG[tier];
  const Icon = cfg.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      className={`bg-white border rounded-2xl p-4 hover:shadow-sm transition-all ring-1 ${cfg.ringColor}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center text-navy font-black text-sm`}>
            {lead.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-navy font-bold text-sm">{lead.name}</p>
              {rank <= 2 && (
                <Crown size={11} className="text-amber-500" />
              )}
            </div>
            <p className="text-charcoal/50 text-[10px]">{lead.project} — {lead.unit}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${cfg.badge}`}>
            {cfg.label}
          </span>
          <span className="text-navy font-black text-sm">{score}/100</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-navy/5 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`h-full rounded-full ${cfg.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, delay: rank * 0.05 }}
        />
      </div>

      {/* Recommendation */}
      <div className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border mb-3 flex items-center gap-1.5 ${cfg.recColor}`}>
        <Icon size={10} className={cfg.iconColor} />
        {cfg.recommendation}
      </div>

      {/* Value + actions */}
      <div className="flex items-center justify-between">
        <span className="text-charcoal/60 text-xs font-medium">${lead.val.toLocaleString()}</span>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
            <Phone size={12} />
          </button>
          <button className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
            <Mail size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────
export default function LeadScorePanel({ isOpen, onClose, leads }) {
  const scored = useMemo(() => {
    return leads
      .map(l => {
        const score = computeLeadScore(l);
        return { ...l, score, tier: getScoreTier(score) };
      })
      .sort((a, b) => b.score - a.score);
  }, [leads]);

  const hotCount  = scored.filter(l => l.tier === 'hot').length;
  const warmCount = scored.filter(l => l.tier === 'warm').length;
  const coldCount = scored.filter(l => l.tier === 'cold').length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-full sm:w-[440px] bg-cream z-50 flex flex-col shadow-2xl"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-navy px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-black text-sm flex items-center gap-2">
                  <TrendingUp size={16} className="text-brand" />
                  تحليل العملاء الذكي
                </p>
                <p className="text-white/50 text-[10px] mt-0.5">تحليل الأولويات — مرتّب تنازلياً حسب الأهمية</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Summary strip */}
            <div className="grid grid-cols-3 divide-x divide-navy/10 bg-white border-b border-navy/8">
              {[
                { label: 'Hot 🔥', count: hotCount, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Warm ✅', count: warmCount, color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Cold 🌡️', count: coldCount, color: 'text-slate-500', bg: 'bg-slate-50' },
              ].map(({ label, count, color, bg }) => (
                <div key={label} className={`flex flex-col items-center py-4 ${bg}`}>
                  <p className={`text-2xl font-black ${color}`}>{count}</p>
                  <p className="text-[10px] text-charcoal/50 font-medium">{label}</p>
                </div>
              ))}
            </div>

            {/* Insight banner for top lead */}
            {scored.length > 0 && scored[0].tier === 'hot' && (
              <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <Flame size={20} className="text-red-500 shrink-0" />
                <div>
                  <p className="text-red-700 font-black text-xs">{scored[0].name} — أعلى أولوية!</p>
                  <p className="text-red-500 text-[10px]">درجة {scored[0].score}/100 — اتصل الآن لإتمام صفقة محتملة</p>
                </div>
                <ArrowUpRight size={16} className="text-red-400 mr-auto shrink-0" />
              </div>
            )}

            {/* Total count */}
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Users size={14} className="text-charcoal/40" />
              <p className="text-xs text-charcoal/50 font-medium">{scored.length} عميل مُحلَّل</p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
              {scored.map((lead, i) => (
                <LeadPanelCard
                  key={lead.id}
                  lead={lead}
                  score={lead.score}
                  tier={lead.tier}
                  rank={i}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
