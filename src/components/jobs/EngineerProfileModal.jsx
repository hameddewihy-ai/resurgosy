import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, MapPin, Award, CheckCircle, Briefcase, GraduationCap,
  Phone, Star, Mail, FileText, BadgeCheck, Globe, Image,
  ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PORTFOLIO = [
  { img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', label: 'برج سكني — دمشق 2024' },
  { img: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=80', label: 'مجمع تجاري — حلب 2023' },
  { img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80', label: 'فيلا فاخرة — اللاذقية 2022' },
];

const LANGUAGES = [
  { lang: 'العربية',     level: 'اللغة الأم',   pct: 100 },
  { lang: 'الإنجليزية', level: 'متوسطة — B1',   pct: 62  },
];

function computeCompleteness(engineer) {
  return Math.min(96,
    50 +
    (engineer.verified                          ? 20 : 0) +
    Math.min(engineer.exp || 0,                   12)     +
    ((engineer.skills?.length || 0) >= 4       ? 14 : 7)
  );
}

export default function EngineerProfileModal({ isOpen, onClose, engineer }) {
  const [lightboxImg, setLightboxImg] = useState(null);

  if (!isOpen || !engineer) return null;

  const completeness    = computeCompleteness(engineer);
  const completenessColor = completeness >= 80 ? 'bg-emerald-500' : completeness >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const completenessText  = completeness >= 80 ? 'text-emerald-600' : completeness >= 60 ? 'text-amber-500' : 'text-red-500';

  const CHECKLIST = [
    { label: 'الصورة الشخصية',    done: !!engineer.avatar },
    { label: 'توثيق نقابي',        done: !!engineer.verified },
    { label: 'المهارات (4+)',      done: (engineer.skills?.length || 0) >= 4 },
    { label: 'خبرة 5+ سنوات',     done: (engineer.exp || 0) >= 5 },
    { label: 'معرض الأعمال',      done: true },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-navy/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-cream w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col"
        >
          {/* Cover */}
          <div className="relative h-40 bg-gradient-to-l from-navy to-brand shrink-0">
            <button onClick={onClose}
              className="absolute top-4 left-4 w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all">
              <X size={18} />
            </button>

            <div className="absolute -bottom-12 right-8 flex items-end gap-4">
              <img src={engineer.avatar} alt={engineer.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-cream shadow-xl" />
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-navy">{engineer.name}</h2>
                  {engineer.verified && <BadgeCheck className="text-brand" size={20} />}
                </div>
                <p className="text-charcoal/60 text-sm font-bold flex items-center gap-1">
                  <MapPin size={13} /> سوريا، {engineer.city}
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 left-8 flex gap-2">
              <button
                onClick={() => toast.success('تم إرسال عرض العمل بنجاح')}
                className="btn-cta px-6 py-2.5 text-sm flex items-center gap-2 shadow-lg shadow-cta/20">
                <FileText size={15} /> تقديم عرض عمل
              </button>
              <button
                onClick={() => toast.success('تم فتح المحادثة')}
                className="bg-white text-navy hover:bg-navy/5 px-4 py-2.5 rounded-xl border border-navy/10 flex items-center gap-2 transition-colors text-sm font-medium">
                <Mail size={15} /> رسالة
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 pt-16 flex flex-col lg:flex-row gap-8">

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <div className="lg:w-1/3 space-y-5">

              {/* Stats */}
              <div className="bg-white p-5 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                {[
                  { label: 'التخصص',        value: <span className="bg-navy/5 px-3 py-1 rounded-full text-sm font-bold text-navy">{engineer.spec}</span> },
                  { label: 'سنوات الخبرة',  value: <span className="flex items-center gap-1 font-bold text-sm text-navy"><Award size={14} className="text-brand" /> {engineer.exp} سنوات</span> },
                  { label: 'المشاريع',       value: <span className="flex items-center gap-1 font-bold text-sm text-navy"><Briefcase size={14} className="text-brand" /> {engineer.projects} مشروع</span> },
                  { label: 'التقييم',        value: (
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} className={i < engineer.rating ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />
                      ))}
                    </div>
                  )},
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-2">
                    <span className="text-charcoal/50 text-xs shrink-0">{label}</span>
                    {value}
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-charcoal/50 text-xs">الحالة</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${engineer.available ? 'text-green-600 bg-green-50' : 'text-charcoal/50 bg-navy/5'}`}>
                    {engineer.available ? 'متاح للتوظيف' : 'مشغول حالياً'}
                  </span>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-navy font-bold text-sm">اكتمال الملف</h4>
                  <span className={`text-sm font-black ${completenessText}`}>{completeness}%</span>
                </div>
                <div className="w-full bg-navy/8 rounded-full h-2 mb-4 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completeness}%` }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                    className={`h-2 rounded-full ${completenessColor}`}
                  />
                </div>
                <div className="space-y-2">
                  {CHECKLIST.map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={11} className={done ? 'text-emerald-500 shrink-0' : 'text-charcoal/20 shrink-0'} />
                      <span className={done ? 'text-charcoal/70' : 'text-charcoal/35'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <h4 className="text-navy font-bold text-sm mb-4 flex items-center gap-2">
                  <Globe size={13} className="text-brand" /> اللغات
                </h4>
                <div className="space-y-3">
                  {LANGUAGES.map(({ lang, level, pct }) => (
                    <div key={lang}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-navy font-bold">{lang}</span>
                        <span className="text-charcoal/45">{level}</span>
                      </div>
                      <div className="w-full bg-navy/8 rounded-full h-1.5">
                        <div className="bg-brand h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <h4 className="text-navy font-bold text-sm mb-4 border-b border-navy/5 pb-2">التواصل المباشر</h4>
                <div className="space-y-3 text-sm">
                  <p className="flex items-center gap-3 text-charcoal/70">
                    <Phone size={13} className="text-brand shrink-0" /> +963 9X XXX XXXX
                  </p>
                  <p className="flex items-center gap-3 text-charcoal/70">
                    <Mail size={13} className="text-brand shrink-0" /> engineer@resurgo.sy
                  </p>
                </div>
              </div>
            </div>

            {/* ── Main Content ───────────────────────────────────────────────── */}
            <div className="lg:w-2/3 space-y-8">

              {/* About */}
              <section>
                <h3 className="text-navy font-black text-lg mb-3 flex items-center gap-2">
                  <UserIcon /> نبذة مهنية
                </h3>
                <p className="text-charcoal/70 text-sm leading-relaxed">
                  مهندس {engineer.spec} بخبرة تتجاوز {engineer.exp} سنوات في السوق السوري. متخصص في الإشراف على تنفيذ المشاريع العقارية الكبرى وضمان مطابقتها للمواصفات القياسية. أمتلك خبرة عميقة في إدارة فرق العمل الميدانية ومتابعة جداول التكلفة والزمن بدقة عالية لتسليم المشاريع ضمن الميزانية المحددة.
                </p>
              </section>

              {/* Skills */}
              <section>
                <h3 className="text-navy font-black text-lg mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-500" /> الكفاءات والمهارات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {engineer.skills.map(sk => (
                    <span key={sk} className="bg-white border border-navy/10 shadow-sm text-navy px-3.5 py-1.5 rounded-xl text-sm font-medium">
                      {sk}
                    </span>
                  ))}
                  <span className="bg-white border border-navy/10 shadow-sm text-navy px-3.5 py-1.5 rounded-xl text-sm font-medium">AutoCAD</span>
                  <span className="bg-white border border-navy/10 shadow-sm text-navy px-3.5 py-1.5 rounded-xl text-sm font-medium">إدارة المشاريع</span>
                </div>
              </section>

              {/* Education & Certs */}
              <section>
                <h3 className="text-navy font-black text-lg mb-3 flex items-center gap-2">
                  <GraduationCap size={18} className="text-brand" /> التعليم والاعتمادات
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-navy/5 flex gap-4">
                    <div className="w-10 h-10 bg-navy/5 rounded-lg flex items-center justify-center shrink-0">
                      <GraduationCap size={20} className="text-navy" />
                    </div>
                    <div>
                      <h4 className="text-navy font-bold text-sm">بكالوريوس في الهندسة المدنية</h4>
                      <p className="text-charcoal/50 text-xs mt-1">جامعة دمشق · 2010 — 2015</p>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-navy/5 flex gap-4">
                    <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center shrink-0">
                      <BadgeCheck size={20} className="text-brand" />
                    </div>
                    <div>
                      <h4 className="text-navy font-bold text-sm">مهندس ممارس معتمد</h4>
                      <p className="text-charcoal/50 text-xs mt-1">نقابة المهندسين السوريين · عضوية رقم 4921</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Portfolio */}
              <section>
                <h3 className="text-navy font-black text-lg mb-4 flex items-center gap-2">
                  <Image size={18} className="text-brand" /> معرض الأعمال
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {PORTFOLIO.map(({ img, label }) => (
                    <button
                      key={label}
                      onClick={() => setLightboxImg({ img, label })}
                      className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer focus:outline-none"
                    >
                      <img src={img} alt={label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-navy/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                        <p className="text-white text-[10px] font-bold leading-tight">{label}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toast.success(`عرض جميع مشاريع ${engineer.name} (${engineer.projects} مشروع)`)}
                  className="mt-3 text-brand text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all">
                  عرض جميع المشاريع ({engineer.projects})
                  <ChevronLeft size={13} />
                </button>
              </section>

            </div>
          </div>
        </motion.div>

        {/* Portfolio lightbox */}
        <AnimatePresence>
          {lightboxImg && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
                onClick={() => setLightboxImg(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                  className="relative max-w-3xl w-full"
                  onClick={e => e.stopPropagation()}
                >
                  <img src={lightboxImg.img} alt={lightboxImg.label}
                    className="w-full rounded-2xl shadow-2xl object-cover" />
                  <p className="text-white text-sm font-bold mt-3 text-center">{lightboxImg.label}</p>
                  <button onClick={() => setLightboxImg(null)}
                    className="absolute -top-3 -left-3 w-9 h-9 bg-white/15 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all">
                    <X size={18} />
                  </button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className="text-brand">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
