import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Clock, DollarSign, Users, Filter, X, Send, Zap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const GIGS = [
  { id: 1, title: 'إعداد مخططات هيكل خرساني لفيلا سكنية', type: 'تصميم', remote: true,  budget: 450, currency: '$', duration: '5 أيام', level: 'متوسط', applicants: 3, required: ['SAP2000','AutoCAD'], posted: 'منذ يومين', desc: 'مطلوب مهندس إنشائي لتصميم هيكل خرساني مسلح لفيلا مساحتها 350 م². التسليم ملفات DWG + PDF.' },
  { id: 2, title: 'إشراف ميداني على صب أعمدة وبلاطات — دمشق', type: 'إشراف', remote: false, budget: 300, currency: '$', duration: '3 أيام', level: 'خبير', applicants: 1, required: ['FIDIC'], posted: 'منذ يوم', desc: 'مطلوب مهندس للإشراف على صب خرساني لـ 8 أعمدة و3 بلاطات بحي المزة. مع تقرير يومي.' },
  { id: 3, title: 'تقدير كميات لمشروع تجاري — 3 طوابق', type: 'تقدير', remote: true,  budget: 250, currency: '$', duration: '4 أيام', level: 'متوسط', applicants: 7, required: ['AutoCAD'], posted: 'منذ 3 أيام', desc: 'مطلوب جدول كميات كامل BOQ لمبنى تجاري 3 طوابق مساحة الطابق 400 م² وفق المعايير السورية.' },
  { id: 4, title: 'تقرير معاينة فنية لعقار قبل الشراء', type: 'معاينة', remote: false, budget: 180, currency: '$', duration: '2 يوم', level: 'مبتدئ', applicants: 4, required: ['معايير IVS 2025'], posted: 'منذ 4 ساعات', desc: 'معاينة شقة سكنية 180 م² في كفرسوسة وإعداد تقرير فني شامل بالحالة الإنشائية والتشطيبات.' },
  { id: 5, title: 'جدولة زمنية لمشروع سكني — Primavera P6', type: 'جدولة', remote: true,  budget: 380, currency: '$', duration: '6 أيام', level: 'متقدم', applicants: 2, required: ['Primavera P6'], posted: 'منذ 6 ساعات', desc: 'بناء جدول زمني كامل لمشروع سكني 120 وحدة بـ P6 مع Baseline والـ Critical Path.' },
  { id: 6, title: 'مراجعة ومراجعة مخططات معمارية', type: 'مراجعة', remote: true,  budget: 200, currency: '$', duration: '3 أيام', level: 'متوسط', applicants: 5, required: ['AutoCAD'], posted: 'منذ يوم', desc: 'مراجعة مخططات معمارية لمبنى سكني 6 طوابق والتأكد من تطابقها مع كود البناء السوري 2020.' },
];

const TYPE_COLORS = {
  'تصميم':  'bg-violet-50 text-violet-700 border-violet-200',
  'إشراف':  'bg-blue-50 text-blue-700 border-blue-200',
  'تقدير':  'bg-amber-50 text-amber-700 border-amber-200',
  'معاينة': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'جدولة':  'bg-rose-50 text-rose-700 border-rose-200',
  'مراجعة': 'bg-slate-50 text-slate-700 border-slate-200',
};

const LEVEL_COLORS = {
  'مبتدئ':  'text-emerald-600',
  'متوسط':  'text-amber-600',
  'متقدم':  'text-orange-600',
  'خبير':   'text-red-600',
};

function ApplyModal({ gig, skills, onClose }) {
  const [bid, setBid] = useState(gig.budget);
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!msg.trim()) { toast.error('يرجى كتابة رسالة تقديم'); return; }
    setSent(true);
    toast.success('تم إرسال طلب التقديم بنجاح!');
  };

  if (sent) return (
    <div className="text-center py-6 space-y-4">
      <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200">
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h3 className="text-navy font-black text-lg">تم إرسال طلبك!</h3>
      <p className="text-charcoal/60 text-sm">سيتواصل معك صاحب المهمة خلال 24 ساعة</p>
      <button onClick={onClose} className="bg-navy text-white font-bold px-6 py-2.5 rounded-xl hover:bg-brand transition-colors text-sm">إغلاق</button>
    </div>
  );

  return (
    <div className="space-y-4" dir="rtl">
      <div className="bg-cream rounded-2xl p-4">
        <h4 className="text-navy font-black text-sm mb-1">{gig.title}</h4>
        <p className="text-charcoal/50 text-xs">{gig.desc}</p>
      </div>
      <div>
        <label className="text-charcoal/60 text-xs font-bold mb-1.5 block">عرض السعر ($)</label>
        <div className="relative">
          <DollarSign size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input type="number" value={bid} onChange={e => setBid(Number(e.target.value))} min={1}
            className="w-full bg-white border border-navy/10 rounded-xl pr-8 pl-4 py-2.5 text-sm focus:outline-none focus:border-brand text-navy font-bold" />
        </div>
        <p className="text-charcoal/40 text-[10px] mt-1">ميزانية صاحب المهمة: {gig.budget}$</p>
      </div>
      <div>
        <label className="text-charcoal/60 text-xs font-bold mb-1.5 block">رسالة التقديم</label>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={4}
          placeholder="اشرح لماذا أنت المناسب لهذه المهمة..."
          className="w-full bg-white border border-navy/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand resize-none text-navy" />
      </div>
      <button onClick={handleSend}
        className="w-full bg-navy hover:bg-brand text-white font-bold py-3 rounded-2xl transition-colors flex items-center justify-center gap-2">
        <Send size={15} /> إرسال الطلب
      </button>
    </div>
  );
}

export default function FreelanceMarketplace({ skills = [] }) {
  const [filter, setFilter] = useState('الكل');
  const [applyGig, setApplyGig] = useState(null);

  const types = ['الكل', ...new Set(GIGS.map(g => g.type))];

  const filtered = useMemo(() => {
    return filter === 'الكل' ? GIGS : GIGS.filter(g => g.type === filter);
  }, [filter]);

  const mySkillNames = skills.map(s => s.name);
  const isMatch = (gig) => gig.required.some(r => mySkillNames.some(s => s.includes(r) || r.includes(s)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy">فرص العمل الحر</h2>
          <p className="text-xs text-charcoal/50 mt-0.5">مهام هندسية مقطوعة — تقدّم واربح</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-charcoal/40" />
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filter === t ? 'bg-navy text-white border-navy' : 'border-navy/10 text-charcoal/60 hover:border-brand/30 hover:text-navy'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filtered.map((gig, i) => {
          const match = isMatch(gig);
          return (
            <motion.div key={gig.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`bg-white border rounded-2xl p-5 hover:shadow-md transition-all ${match ? 'border-brand/30 ring-1 ring-brand/10' : 'border-navy/8'}`}>
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-black text-navy text-sm">{gig.title}</h3>
                    {match && (
                      <span className="flex items-center gap-1 text-[9px] font-black bg-brand/10 text-brand px-2 py-0.5 rounded-full border border-brand/20">
                        <Zap size={9} /> تطابق مهاراتك
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal/60 text-xs leading-relaxed">{gig.desc}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className="text-navy font-black text-lg">{gig.budget}$</p>
                  <p className="text-charcoal/40 text-[10px]">ميزانية</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${TYPE_COLORS[gig.type] || 'bg-cream text-charcoal/60 border-navy/10'}`}>{gig.type}</span>
                <span className="flex items-center gap-1 text-[10px] text-charcoal/50"><Clock size={10} />{gig.duration}</span>
                <span className="flex items-center gap-1 text-[10px] text-charcoal/50"><MapPin size={10} />{gig.remote ? 'عن بُعد' : 'حضوري'}</span>
                <span className={`text-[10px] font-bold ${LEVEL_COLORS[gig.level]}`}>{gig.level}</span>
                <span className="flex items-center gap-1 text-[10px] text-charcoal/40"><Users size={10} />{gig.applicants} متقدمون</span>
                <span className="text-[10px] text-charcoal/30 mr-auto">{gig.posted}</span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {gig.required.map(r => (
                    <span key={r} className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${mySkillNames.some(s => s.includes(r) || r.includes(s)) ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-navy/5 text-charcoal/50 border-navy/10'}`}>
                      {r}
                    </span>
                  ))}
                </div>
                <button onClick={() => setApplyGig(gig)}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 bg-navy hover:bg-brand text-white rounded-xl transition-colors shrink-0">
                  <Send size={12} /> تقدّم
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {applyGig && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50" onClick={() => setApplyGig(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
              className="fixed inset-x-4 top-[12%] max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden" dir="rtl">
              <div className="bg-navy px-5 py-4 flex items-center justify-between">
                <p className="text-white font-black text-sm flex items-center gap-2"><Briefcase size={15} className="text-brand" /> تقدّم للمهمة</p>
                <button onClick={() => setApplyGig(null)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white/70 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className="p-5">
                <ApplyModal gig={applyGig} skills={skills} onClose={() => setApplyGig(null)} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
