import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Award, Users, CheckCircle,
  ArrowRight, Shield, BarChart3, Calendar,
} from 'lucide-react';
import SEO from '../components/SEO';
import { CROWD_PROJECTS, PLATFORM_TRACK_RECORD } from '../data/crowdfundData';

const COMPLETED = CROWD_PROJECTS.filter(p => p.status === 'returning' || p.status === 'closed');

const MILESTONES = [
  { date: 'يناير 2025',  label: 'إطلاق المنصة بأول 3 مشاريع تجريبية',             done: true  },
  { date: 'مارس 2025',   label: 'أول تمويل ناجح: $350,000 لمشروع تلال دمشق',      done: true  },
  { date: 'مايو 2025',   label: 'بلوغ 200 مستثمر من 10 دول',                      done: true  },
  { date: 'أكتوبر 2025', label: 'اكتمال مشروع تلال دمشق — عائد فعلي 34.2%',      done: true  },
  { date: 'يناير 2026',  label: 'اعتماد ADGM لهيكل SPV متعدد المشاريع',           done: true  },
  { date: 'مارس 2026',   label: 'تجاوز 650 مستثمراً من 22 دولة',                  done: true  },
  { date: 'يونيو 2026',  label: 'إطلاق نظام السوق الثانوي للحصص',                 done: false },
  { date: 'Q3 2026',     label: 'توسع لأسواق المغتربين في أوروبا وأمريكا',         done: false },
];

const METHODOLOGY = [
  { title: 'عناية واجبة مستقلة',      body: 'كل مشروع يمر بتقييم من مهندسين معتمدين ومحامين متخصصين قبل الطرح. لا مشروع يُعرض دون تقرير جدوى مدقَّق.' },
  { title: 'هيكل SPV للحماية القانونية', body: 'كل مشروع يمتلك SPV مستقلة مُسجَّلة في الإمارات أو تركيا — تفصل أصول المستثمرين عن المخاطر التشغيلية للمطوّر.' },
  { title: 'تقارير شهرية شفافة',       body: 'تقارير منتظمة عن تقدم البناء والتدفقات النقدية، مع مراجعة سنوية من Deloitte ME للمشاريع الكبرى.' },
  { title: 'توزيع دقيق للعوائد',       body: 'العوائد تُوزَّع وفق الحصة الدقيقة المُسجَّلة في عقد SPV — بدون تقريب أو تأخير.' },
];

const STAT_ITEMS = [
  { label: 'مشاريع مكتملة',         value: PLATFORM_TRACK_RECORD.projectsCompleted },
  { label: 'رأسمال مُنشَر',         value: `$${(PLATFORM_TRACK_RECORD.totalDeployed / 1_000_000).toFixed(1)}M` },
  { label: 'متوسط العائد المحقَّق', value: `${PLATFORM_TRACK_RECORD.avgRealizedReturn}%` },
  { label: 'مستثمر نشط',           value: PLATFORM_TRACK_RECORD.totalInvestors },
  { label: 'دولة',                  value: PLATFORM_TRACK_RECORD.countriesCount },
  { label: 'حالات تعثر',            value: PLATFORM_TRACK_RECORD.defaults },
];

export default function PlatformPerformancePage() {
  return (
    <div className="min-h-screen bg-white pt-[62px]" dir="rtl">
      <SEO
        title="أداء المنصة"
        description="إحصاءات ونتائج التمويل الجماعي العقاري عبر منصة ريسورقو"
        path="/crowdfund/track-record"
      />

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-navy via-navy/95 to-brand/80 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs px-4 py-2 rounded-full mb-6">
            <Award size={13} className="text-cta" />
            سجل أداء موثَّق ومُدقَّق بالأرقام الفعلية
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-[1.4]">
            نتائج حقيقية<br />
            <span className="text-cta">لا وعود</span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed max-w-xl mx-auto mb-10">
            كل مشروع أكملناه وكل عائد وزَّعناه موثَّق هنا. هذه أرقام فعلية محققة — وليست توقعات.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {STAT_ITEMS.map(({ label, value }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white/10 border border-white/15 rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-black text-white mb-0.5"
                  style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.04em' }}>
                  {value}
                </p>
                <p className="text-white/50 text-[10px] font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-navy-tint">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* ── Completed projects ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={18} className="text-green-500" />
            <h2 className="text-navy font-black text-xl">المشاريع المنجزة</h2>
          </div>

          {COMPLETED.length === 0 ? (
            <div className="bg-white p-10 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
              <TrendingUp size={36} className="text-charcoal/15 mx-auto mb-3" />
              <p className="text-charcoal/45 text-sm">المشاريع الجارية ستُضاف هنا عند إكمالها</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {COMPLETED.map((project, i) => {
                const actualReturn = project.status === 'returning' ? 34.2 : project.expectedAnnualReturn;
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
                    style={{ borderRadius: '8px' }}>
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-44 md:h-auto shrink-0 relative">
                        <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-navy/30 hidden md:block" />
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border mr-2 ${
                              project.status === 'returning'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {project.status === 'returning' ? '✅ يوزع العوائد الآن' : '✅ مكتمل'}
                            </span>
                            <h3 className="text-navy font-black text-lg mt-2 leading-tight">{project.title}</h3>
                            <p className="text-charcoal/45 text-xs mt-0.5">{project.city} · {project.type} · {project.developer}</p>
                          </div>
                          <div className="text-left shrink-0">
                            <p className="text-cta font-black text-3xl leading-none"
                              style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.04em' }}>
                              {actualReturn}%
                            </p>
                            <p className="text-charcoal/40 text-[10px] mt-0.5">عائد فعلي محقَّق</p>
                          </div>
                        </div>

                        {/* Key stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { label: 'رأس المال المُجمَّع',   value: `$${project.raisedAmount.toLocaleString()}` },
                            { label: 'المستثمرون',           value: `${project.investorsCount} من ${project.countryCount} دول` },
                            { label: 'فترة الاحتجاز',        value: `${project.holdPeriod} شهر` },
                          ].map(({ label, value }) => (
                            <div key={label} className="bg-cream/60 rounded-xl p-2.5 text-center">
                              <p className="text-navy font-black text-xs">{value}</p>
                              <p className="text-charcoal/40 text-[9px] mt-0.5">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Done milestones */}
                        <div className="space-y-1.5 mb-4">
                          {project.milestones.filter(m => m.done).map((m, mi) => (
                            <div key={mi} className="flex items-center gap-2 text-xs">
                              <CheckCircle size={11} className="text-green-500 shrink-0" />
                              <span className="text-charcoal/60">{m.label}</span>
                              <span className="text-charcoal/30 text-[10px] mr-auto">{m.date}</span>
                            </div>
                          ))}
                        </div>

                        <Link to={`/crowdfund/${project.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-navy transition-colors">
                          عرض تفاصيل المشروع <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Platform milestones ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Calendar size={18} className="text-brand" />
            <h2 className="text-navy font-black text-xl">مسيرة المنصة</h2>
          </div>

          <div className="bg-white p-6 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div className="relative">
              <div className="absolute right-[7px] top-2 bottom-2 w-px bg-navy/10" />
              <div className="space-y-5">
                {MILESTONES.map((m, i) => (
                  <div key={i} className="flex items-start gap-4 pr-6 relative">
                    <div className={`absolute right-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${m.done ? 'bg-brand border-brand' : 'bg-white border-navy/20'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-semibold ${m.done ? 'text-navy' : 'text-charcoal/40'}`}>{m.label}</p>
                      <p className="text-[10px] text-charcoal/30 mt-0.5">{m.date}</p>
                    </div>
                    {m.done && <CheckCircle size={13} className="text-green-500 shrink-0 mt-0.5" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Methodology ── */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={18} className="text-brand" />
            <h2 className="text-navy font-black text-xl">منهجيتنا في انتقاء المشاريع</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {METHODOLOGY.map(({ title, body }) => (
              <div key={title} className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield size={15} className="text-brand" />
                  </div>
                  <div>
                    <p className="text-navy font-bold text-sm mb-1.5">{title}</p>
                    <p className="text-charcoal/55 text-xs leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section-cream rounded-3xl p-10 text-center">
          <BarChart3 size={36} className="text-brand mx-auto mb-4" />
          <h2 className="text-navy font-black text-2xl mb-2">استثمر في مشاريعنا النشطة</h2>
          <p className="text-charcoal/55 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            الأداء الماضي يُرسّخ الثقة — المشاريع الحالية تنتظر انضمامك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/crowdfund"
              className="inline-flex items-center justify-center gap-2 bg-cta hover:bg-cta/90 text-white font-black px-8 py-3.5 rounded-2xl text-sm shadow-lg shadow-cta/25 transition-all hover:-translate-y-0.5">
              استعرض الفرص المتاحة <ArrowRight size={16} />
            </Link>
            <Link to="/crowdfund"
              className="inline-flex items-center justify-center gap-2 border-2 border-navy/20 text-navy hover:border-brand hover:text-brand font-bold px-8 py-3.5 rounded-2xl text-sm transition-all">
              <Users size={15} /> قصص المستثمرين
            </Link>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
