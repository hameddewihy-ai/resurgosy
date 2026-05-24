import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import {
  Building2, TrendingUp, Briefcase, FileSearch,
  Wrench, Scale, ArrowLeft, ArrowUpRight,
  ShieldCheck, Cpu, Globe, Users, MessageCircle,
  Layers, BarChart3,
} from 'lucide-react';
import SEO from '../components/SEO';

// ── Services editorial list ───────────────────────────────────────────
const SERVICES = [
  {
    num: '01', icon: Building2, label: 'العقارات',
    desc: 'شقق ودور وأراضٍ في كل المحافظات السورية — موثّقة ومفحوصة وأسعارها شفافة.',
    to: '/properties', color: 'text-brand',
  },
  {
    num: '02', icon: TrendingUp, label: 'الاستثمار',
    desc: 'فرص عقارية موثوقة بعوائد مدروسة — نساعدك تختار الاستثمار المناسب بثقة وضمانات واضحة.',
    to: '/invest', color: 'text-amber-500',
  },
  {
    num: '03', icon: Briefcase, label: 'التوظيف',
    desc: 'مهندسون ومقاولون معتمدون — ابحث عن فريقك الهندسي أو أوجد فرصة عملك الآن.',
    to: '/jobs', color: 'text-emerald-500',
  },
  {
    num: '04', icon: FileSearch, label: 'الدراسات',
    desc: 'تقارير هندسية ودراسات جدوى معتمدة — خذ قرارك الاستثماري على أساس معلومة صحيحة.',
    to: '/studies', color: 'text-violet-500',
  },
  {
    num: '05', icon: Wrench, label: 'المقاولات',
    desc: 'آليات ومعدات ثقيلة للإيجار والبيع — مجهّزة لمشاريعك الإنشائية في كل المحافظات.',
    to: '/equipment', color: 'text-cta',
  },
  {
    num: '06', icon: Scale, label: 'التخليص القانوني',
    desc: 'نتولى عنك كل الإجراءات القانونية — نقل ملكية، حصر إرث، وكالات — بلا تعقيد وبلا تأخير.',
    to: '/clearing/dashboard', color: 'text-rose-500',
  },
  {
    num: '07', icon: Users, label: 'المطورون',
    desc: 'اعرض مشروعك أمام المستثمرين وابنِ شراكات حقيقية تُنجزه على أرض الواقع.',
    to: '/developers', color: 'text-pink-500',
  },
  {
    num: '08', icon: Layers, label: 'تمويل جماعي',
    desc: 'شارك في إعادة بناء سوريا — استثمر بمبلغ صغير وخذ نصيبك من العائد.',
    to: '/crowdfund', color: 'text-sky-500',
  },
  {
    num: '09', icon: BarChart3, label: 'التقييم',
    desc: 'احصل على تقرير تقييم رسمي لعقارك — معتمد ومقبول للبيع والتمويل والتقاضي.',
    to: '/valuation-request', color: 'text-indigo-500',
  },
];

// ── Beliefs ───────────────────────────────────────────────────────────
const BELIEFS = [
  {
    title: 'الشفافية ليست خياراً — هي الأساس.',
    sub: 'كل عقار يحمل hash تحقق على البلوكتشين. كل رقم قابل للمراجعة. لا مجال للتضليل.',
  },
  {
    title: 'التقنية خادمة للإنسان، لا غاية بحد ذاتها.',
    sub: 'التقنيات الحديثة والبلوكتشين أدوات — المهندس الميداني والمستثمر السوري هم المحور.',
  },
  {
    title: 'إعادة الإعمار تحتاج بنية تحتية رقمية أولاً.',
    sub: 'قبل أن يُبنى الطابق الأول، يجب أن يكون السجل العقاري موثوقاً ولا يتلاعب فيه أحد.',
  },
  {
    title: 'السوق السوري يستحق أفضل الأدوات العالمية.',
    sub: 'معايير IVS 2025، ISO 15143-3، FIDIC — ليست ترفاً بل ضرورة في مرحلة إعادة البناء.',
  },
];

// ── Fade animation wrapper ────────────────────────────────────────────
function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function AboutPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY       = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div className="bg-[#f2f1ee]" dir="rtl">
      <SEO
        title="من نحن — قصة RESURGO"
        description="RESURGO تُعيد تعريف السوق العقاري السوري. منصة متكاملة تجمع التقنيات الحديثة والبلوكتشين لإعادة بناء الثقة في العقارات والاستثمار بسوريا."
        path="/about"
      />

      {/* ════════════════════════════════════════
          HERO — editorial, type-only, no image
      ════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen bg-navy flex flex-col justify-end overflow-hidden">

        {/* Subtle dot grid */}
        <div aria-hidden className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />

        {/* Orange vertical accent line */}
        <div aria-hidden className="absolute right-4 sm:right-12 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cta/40 to-transparent" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-20 w-full">

          <motion.p
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            className="text-cta text-xs font-bold tracking-[0.3em] uppercase mb-8">
            — من نحن
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-white font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.2] mb-8 max-w-5xl">
            نُعيد تعريف<br />
            <span className="text-brand">العقارات</span><br />
            <span className="text-white/50">السورية.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-white/45 text-lg sm:text-xl leading-relaxed max-w-2xl mb-12">
            في لحظة تاريخية فارقة، حين تستعيد سوريا عافيتها بعد سنوات من الجمود،
            أطلقنا RESURGO — منصة تجمع المستثمرين والمهندسين وأصحاب العقارات
            على أرضية واحدة موثوقة وشفافة.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="flex flex-wrap gap-3">
            <Link to="/auth?tab=register" className="btn-cta flex items-center gap-2">
              ابدأ مجاناً <ArrowLeft size={16} />
            </Link>
            <Link to="/properties"
              className="flex items-center gap-2 border border-white/15 hover:border-white/35 text-white/60 hover:text-white px-6 py-3 rounded-xl text-sm font-medium transition-all">
              تصفّح العقارات <ArrowUpRight size={15} />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom fade to cream */}
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* ════════════════════════════════════════
          CONTEXT — numbers + editorial text
      ════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Inline stats — not cards */}
          <FadeIn className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-navy/10 rounded-2xl overflow-hidden mb-20">
            {[
              { num: '14',  label: 'محافظة سورية',        sub: 'تغطية جغرافية شاملة' },
              { num: '09',  label: 'خدمات متكاملة',       sub: 'منصة واحدة — حلول كاملة' },
              { num: '03',  label: 'أطراف مستفيدة',       sub: 'مالك · مستثمر · مهندس' },
              { num: '∞',   label: 'إمكانات إعادة الإعمار', sub: 'السوق يبدأ الآن' },
            ].map(({ num, label, sub }, i) => (
              <div key={label}
                className={`px-6 py-8 text-center border-navy/10 ${i % 2 === 0 ? 'border-l' : ''} ${i === 1 ? 'md:border-l' : ''} ${i < 2 ? 'border-b md:border-b-0' : ''}`}>
                <p className="font-display text-5xl sm:text-6xl text-navy tracking-wider mb-2">{num}</p>
                <p className="text-navy font-bold text-sm mb-1">{label}</p>
                <p className="text-charcoal/40 text-xs">{sub}</p>
              </div>
            ))}
          </FadeIn>

          {/* Editorial paragraph */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 items-start">
            <FadeIn>
              <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase pt-2">— السياق</p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-charcoal/70 text-xl leading-[1.9] mb-6">
                منذ بدء مرحلة الانتقال السياسي، بات السوق العقاري السوري أمام فرصة تاريخية لإعادة البناء.
                ملايين العقارات المتنازع عليها، مئات آلاف الكوادر الهندسية التي تحتاج توثيقاً، ومليارات الدولارات
                من الاستثمارات المحتملة — كلها تنتظر بنية تحتية رقمية تستحق الثقة.
              </p>
              <p className="text-charcoal/50 text-base leading-[1.8]">
                RESURGO جاء ليملأ هذا الفراغ — منصة واحدة تجمع العقارات والاستثمار والتوظيف والتخليص القانوني،
                ليتمكن كل سوري من إنجاز ما يحتاجه بسهولة وثقة، أينما كان.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SERVICES — editorial numbered list
      ════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          <FadeIn className="flex items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-3">— خدماتنا</p>
              <h2 className="text-navy font-black text-3xl sm:text-4xl">تسعة محاور،<br />منصة واحدة.</h2>
            </div>
            <p className="text-charcoal/40 text-sm hidden sm:block max-w-xs text-left leading-relaxed">
              نؤمن أن إعادة الإعمار تتطلب حلولاً متكاملة لا متفرقة.
            </p>
          </FadeIn>

          {/* Table-style list — not cards */}
          <div className="divide-y divide-navy/[0.07]">
            {SERVICES.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: i * 0.05 }}>
                <Link to={s.to}
                  className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[80px_1fr_180px] items-center gap-4 py-6 px-4 -mx-4 hover:bg-cream/60 transition-colors group">

                  {/* Number */}
                  <span className={`font-display text-4xl sm:text-5xl leading-none ${s.color} opacity-30 group-hover:opacity-70 transition-opacity`}>
                    {s.num}
                  </span>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <s.icon size={15} className={`${s.color} shrink-0`} />
                      <p className="text-navy font-bold text-base sm:text-lg">{s.label}</p>
                    </div>
                    <p className="text-charcoal/55 text-sm leading-relaxed">{s.desc}</p>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-1 text-xs text-charcoal/30 group-hover:text-brand transition-colors justify-end">
                    <span className="hidden sm:inline">اكتشف</span>
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BELIEFS — large type, navy bg
      ════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 bg-navy">
        <div className="max-w-5xl mx-auto">

          <FadeIn>
            <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-16">— نؤمن بأن</p>
          </FadeIn>

          <div className="space-y-0 divide-y divide-white/[0.07]">
            {BELIEFS.map((b, i) => (
              <FadeIn key={i} delay={i * 0.1}
                className="py-10 first:pt-0 last:pb-0">
                <h3 className="text-white font-black text-2xl sm:text-3xl leading-snug mb-3">
                  {b.title}
                </h3>
                <p className="text-white/35 text-base leading-relaxed max-w-2xl">{b.sub}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TECH STACK — what powers the platform
      ════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          <FadeIn className="mb-12">
            <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-3">— التقنية</p>
            <h2 className="text-navy font-black text-3xl sm:text-4xl">ما الذي يُشغّل RESURGO؟</h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'بلوكتشين',         sub: 'توثيق الملكية غير قابل للتلاعب',        color: 'bg-brand/8 border-brand/15 text-brand' },
              { icon: Cpu,         label: 'أدوات تقنية',     sub: 'تقييم آلي + معاينة بصرية IVS 2025',    color: 'bg-violet-50 border-violet-100 text-violet-600' },
              { icon: Globe,       label: 'PostGIS',           sub: 'خرائط جغرافية بدقة متناهية',           color: 'bg-emerald-50 border-emerald-100 text-emerald-600' },
              { icon: Users,       label: 'منصة متعددة الأدوار', sub: 'مالك · مهندس · مستثمر · موظف تخليص', color: 'bg-amber-50 border-amber-100 text-amber-600' },
            ].map(({ icon: Icon, label, sub, color }) => (
              <FadeIn key={label}
                className={`border rounded-2xl p-6 hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${color.split(' ').slice(0,2).join(' ')} border-opacity-50`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/70 mb-3">
                  <Icon size={20} className={color.split(' ')[2]} />
                </div>
                <p className="text-navy font-bold text-sm mb-1">{label}</p>
                <p className="text-charcoal/55 text-xs leading-relaxed">{sub}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TEAM — core founding team
      ════════════════════════════════════════ */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">

          <FadeIn className="mb-12">
            <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-3">— الفريق</p>
            <h2 className="text-navy font-black text-3xl sm:text-4xl">وجوه خلف المنصة.</h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-20">
            {[
              { initials: 'أم', name: 'أحمد المصري',     role: 'المؤسس / CEO',         spec: 'استثمار عقاري',    color: 'bg-brand/10 text-brand',         border: 'border-brand/20' },
              { initials: 'نح', name: 'نور الدين حداد',  role: 'رئيس التقنية CTO',    spec: 'هندسة برمجيات',   color: 'bg-violet-50 text-violet-600',   border: 'border-violet-200' },
              { initials: 'رك', name: 'رنا الكردي',       role: 'المديرة القانونية',   spec: 'قانون عقارات',     color: 'bg-rose-50 text-rose-600',       border: 'border-rose-200' },
              { initials: 'خص', name: 'خالد الصالح',     role: 'مهندس إنشائي أول',   spec: 'هندسة مدنية',     color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-200' },
              { initials: 'سز', name: 'سارة الزهراوي',   role: 'مديرة التسويق',       spec: 'إعلام ومبيعات',   color: 'bg-amber-50 text-amber-600',     border: 'border-amber-200' },
            ].map((m, i) => (
              <FadeIn key={m.name} delay={i * 0.07}>
                <div className="flex flex-col items-center text-center p-5 rounded-2xl border border-navy/8 hover:border-brand/20 hover:shadow-md transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl ${m.color} border-2 ${m.border} flex items-center justify-center font-black text-xl mb-4 group-hover:scale-105 transition-transform duration-300`}>
                    {m.initials}
                  </div>
                  <p className="text-navy font-bold text-sm mb-0.5">{m.name}</p>
                  <p className="text-charcoal/60 text-xs mb-2">{m.role}</p>
                  <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-cream text-charcoal/50 border border-navy/8">
                    {m.spec}
                  </span>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Partners */}
          <FadeIn className="mb-8">
            <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-3">— الشركاء</p>
            <h2 className="text-navy font-black text-3xl sm:text-4xl">نبني شبكة ثقة.</h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { abbr: 'ن.م', name: 'نقابة المهندسين السوريين',   type: 'مهني',    color: 'bg-brand/8 text-brand border-brand/15' },
              { abbr: 'و.إ', name: 'وزارة الإسكان والتعمير',      type: 'حكومي',   color: 'bg-navy/5 text-navy border-navy/12' },
              { abbr: 'ب.ب', name: 'بنك بيمو السعودي الفرنسي',   type: 'مصرفي',   color: 'bg-sky-50 text-sky-700 border-sky-200' },
              { abbr: 'م.ش', name: 'مجموعة الشام العقارية',       type: 'تطوير',   color: 'bg-violet-50 text-violet-700 border-violet-200' },
              { abbr: 'م.ع', name: 'المعهد العربي للتمويل',       type: 'تمويل',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { abbr: 'ن.م', name: 'نقابة المحامين السوريين',     type: 'قانوني',  color: 'bg-rose-50 text-rose-700 border-rose-200' },
            ].map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.06}>
                <div className="flex flex-col items-center text-center p-4 rounded-xl border border-navy/8 hover:border-brand/20 hover:shadow-sm transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl ${p.color} border flex items-center justify-center font-black text-xs mb-3`}>
                    {p.abbr}
                  </div>
                  <p className="text-navy font-bold text-[11px] leading-tight mb-1">{p.name}</p>
                  <span className="text-[9px] text-charcoal/45 font-semibold uppercase tracking-wider">{p.type}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA final
      ════════════════════════════════════════ */}
      <section className="py-28 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-6">— انضم إلينا</p>
            <h2 className="text-navy font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.4] mb-6">
              سوريا تُعاد.<br />
              <span className="text-charcoal/30">وعقاراتها أولى.</span>
            </h2>
            <p className="text-charcoal/55 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              سجّل اليوم وكن من أوائل المستفيدين من المنصة عند إطلاقها الرسمي.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/auth?tab=register" className="btn-cta flex items-center gap-2 text-base px-8 py-4">
                إنشاء حساب مجاني <ArrowLeft size={18} />
              </Link>
              <Link to="/properties"
                className="flex items-center gap-2 border border-navy/20 hover:border-brand/40 text-charcoal/60 hover:text-navy px-8 py-4 rounded-xl text-base font-medium transition-all">
                تصفّح العقارات
              </Link>
            </div>
            <div className="flex items-center gap-3 mt-6 max-w-sm mx-auto">
              <div className="flex-1 h-px bg-navy/10" />
              <span className="text-charcoal/35 text-xs shrink-0">أو تواصل مباشرةً</span>
              <div className="flex-1 h-px bg-navy/10" />
            </div>
            <a href="https://wa.me/963000000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D9%85%D8%B9%D8%B1%D9%81%D8%A9%20%D8%A7%D9%84%D9%85%D8%B2%D9%8A%D8%AF%20%D8%B9%D9%86%20RESURGO"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 mt-4 px-8 py-3 rounded-xl border border-green-400/40 bg-green-50 text-green-700 text-sm font-medium hover:bg-green-100 transition-colors">
              <MessageCircle size={16} />
              تواصل عبر واتساب — بلا تسجيل
            </a>
          </FadeIn>
        </div>
      </section>

    </div>
  );
}
