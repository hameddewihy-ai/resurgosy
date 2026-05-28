import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, AlertCircle, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'intro',       label: 'قبول الشروط' },
  { id: 'platform',    label: 'طبيعة المنصة' },
  { id: 'accounts',    label: 'الحسابات والمسؤولية' },
  { id: 'content',     label: 'المحتوى والملكية الفكرية' },
  { id: 'listings',    label: 'إعلانات العقارات' },
  { id: 'invest',      label: 'الاستثمار والمخاطر' },
  { id: 'clearing',    label: 'خدمات المقاصة القانونية' },
  { id: 'automated-tools',          label: 'الأدوات الآلية' },
  { id: 'prohibited',  label: 'الاستخدامات المحظورة' },
  { id: 'liability',   label: 'تحديد المسؤولية' },
  { id: 'governing',   label: 'القانون الحاكم' },
  { id: 'contact',     label: 'التواصل' },
];

function useSectionObserver(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

function SectionHeading({ id, number, children }) {
  return (
    <h2 id={id} className="flex items-baseline gap-4 text-navy font-black text-2xl sm:text-3xl mb-6 scroll-mt-28">
      <span className="font-display text-5xl text-navy/10 leading-none shrink-0">{number}</span>
      {children}
    </h2>
  );
}

function Prose({ children }) {
  return <div className="text-charcoal/70 text-[15px] leading-8 space-y-4 mb-12">{children}</div>;
}

function WarningBox({ children }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm mb-4">
      <AlertCircle size={15} className="shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}

function RuleList({ items }) {
  return (
    <ul className="space-y-2.5 mr-4 mb-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-[15px] text-charcoal/70">
          <span className="w-1 h-1 rounded-full bg-brand mt-2.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  const active = useSectionObserver(SECTIONS.map((s) => s.id));
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <SEO
        title="الشروط والأحكام"
        description="شروط وأحكام استخدام منصة ريسورجو العقارية"
        path="/terms"
      />

      {/* Hero */}
      <div className="bg-navy pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex items-center justify-end pointer-events-none pr-8 sm:pr-16">
          <span className="font-display text-[140px] sm:text-[200px] leading-none text-white/[0.03] tracking-widest select-none">TERMS</span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <ScrollText size={16} className="text-brand" />
            <span className="text-brand text-xs font-bold tracking-[0.22em] uppercase">شروط الاستخدام</span>
          </div>
          <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.4] max-w-xl">
            اتفاقية<br />
            <span className="text-white/30">الاستخدام.</span>
          </h1>
          <p className="text-white/40 text-sm mt-4">آخر تحديث: مايو 2026 · تسري على جميع المستخدمين</p>
        </div>
      </div>

      {/* Under-construction banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-amber-700 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          هذه الشروط مسودة أولية للمنصة قيد الإنشاء · تخضع للمراجعة القانونية قبل الإطلاق الرسمي
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 xl:gap-24">

          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-0.5">
              <p className="text-charcoal/30 text-[10px] uppercase tracking-[0.22em] font-medium mb-4">المحتويات</p>
              {SECTIONS.map((s, i) => (
                <button key={s.id} onClick={() => scrollTo(s.id)}
                  className={`w-full text-right flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${active === s.id ? 'bg-navy/5 text-navy font-semibold' : 'text-charcoal/50 hover:text-navy hover:bg-navy/[0.03]'}`}>
                  <span className={`w-4 text-[10px] font-mono shrink-0 ${active === s.id ? 'text-brand' : 'text-charcoal/25'}`}>{String(i + 1).padStart(2, '0')}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Article */}
          <article className="min-w-0">

            <section id="intro">
              <SectionHeading id="intro" number="01">قبول الشروط</SectionHeading>
              <Prose>
                <p>
                  باستخدامك لمنصة ريسورغو ("المنصة") بأي شكل كان — تصفحاً أو تسجيلاً أو تعاملاً —
                  تُقرّ بأنك بلغت سن الرشد القانوني (18 عاماً) وتوافق على الالتزام بجميع الشروط الواردة هنا.
                </p>
                <p>
                  إن كنت تمثّل شركة أو مؤسسة، فأنت تُقرّ بأن لديك صلاحية إلزامها بهذه الشروط.
                  إن لم توافق على أي بند، يُرجى التوقف عن الاستخدام فوراً.
                </p>
              </Prose>
            </section>

            <section id="platform">
              <SectionHeading id="platform" number="02">طبيعة المنصة</SectionHeading>
              <Prose>
                <p>
                  ريسورغو منصة رقمية تجمع خدمات متعددة في المجال العقاري السوري: تصفح العقارات،
                  الاستثمار الجماعي، التوظيف الهندسي، خدمات المقاصة القانونية، والمقاولات.
                </p>
                <WarningBox>
                  المنصة حالياً في مرحلة الإنشاء والاختبار. جميع البيانات والأرقام المعروضة تجريبية ولا تمثّل عروضاً استثمارية حقيقية.
                </WarningBox>
                <p>
                  ريسورغو وسيط تقني يربط الأطراف ببعضها. لا تُعدّ المنصة طرفاً في أي اتفاقية بين المستخدمين
                  إلا في خدمات المقاصة القانونية التي تُنظَّم بشروط مستقلة.
                </p>
              </Prose>
            </section>

            <section id="accounts">
              <SectionHeading id="accounts" number="03">الحسابات والمسؤولية</SectionHeading>
              <Prose>
                <p>عند إنشاء حساب، تتحمّل المسؤولية الكاملة عن:</p>
                <RuleList items={[
                  'صحة جميع البيانات التي تُقدّمها عند التسجيل',
                  'سرية كلمة المرور وأمان جهازك',
                  'جميع الأنشطة التي تجري من خلال حسابك',
                  'إبلاغنا فوراً عند اشتباهك في أي استخدام غير مصرَّح به لحسابك',
                ]} />
                <p>
                  يحق لريسورغو تعليق أي حساب أو إلغاؤه في حال انتهاك هذه الشروط أو الاشتباه
                  في نشاط احتيالي، دون الحاجة إلى إشعار مسبق في الحالات العاجلة.
                </p>
              </Prose>
            </section>

            <section id="content">
              <SectionHeading id="content" number="04">المحتوى والملكية الفكرية</SectionHeading>
              <Prose>
                <p>
                  جميع عناصر المنصة — الكود، التصميم، النصوص، الشعارات، الخوارزميات —
                  هي ملكية حصرية لشركة ريسورغو للتقنية العقارية أو مرخَّصة لها.
                </p>
                <p>
                  يُمنح المستخدم رخصة استخدام شخصية وغير حصرية وغير قابلة للتحويل لاستخدام المنصة.
                  يُحظر تماماً:
                </p>
                <RuleList items={[
                  'نسخ أو إعادة نشر أي محتوى من المنصة تجارياً دون إذن كتابي',
                  'الهندسة العكسية لأي جزء من المنصة أو خوارزمياتها',
                  'استخراج البيانات بصورة آلية (scraping) دون اتفاقية مسبقة',
                ]} />
                <p>
                  المحتوى الذي يرفعه المستخدم (صور عقارات، وثائق) يبقى ملكاً له،
                  مع منح ريسورغو رخصة استخدام لأغراض الخدمة فقط.
                </p>
              </Prose>
            </section>

            <section id="listings">
              <SectionHeading id="listings" number="05">إعلانات العقارات</SectionHeading>
              <Prose>
                <p>يلتزم مُدرِج العقار بما يلي:</p>
                <RuleList items={[
                  'دقة جميع المعلومات المُدرَجة: المساحة، السعر، الموقع، حالة الملكية',
                  'امتلاك الصلاحية القانونية لعرض العقار (مالكاً أو وكيلاً مفوَّضاً)',
                  'عدم إدراج عقارات خارج حدود الجمهورية العربية السورية',
                  'الامتثال للوائح التسعير وقوانين التملّك السارية',
                ]} />
                <WarningBox>
                  ريسورغو لا تتحقق من ملكية العقارات بشكل مباشر في المرحلة الحالية.
                  يتحمّل البائع والمشتري مسؤولية التحقق القانوني المستقل.
                </WarningBox>
              </Prose>
            </section>

            <section id="invest">
              <SectionHeading id="invest" number="06">الاستثمار والمخاطر</SectionHeading>
              <Prose>
                <WarningBox>
                  الاستثمار في العقارات ينطوي على مخاطر حقيقية. الأرقام المعروضة حالياً تجريبية بالكامل ولا تمثّل ضمانات أو وعوداً بعوائد.
                </WarningBox>
                <p>
                  عند توفّر خاصية الاستثمار الجماعي رسمياً، ستُطبَّق شروط استثمارية مستقلة مفصَّلة
                  تشمل: مستوى المخاطر، هيكل العوائد، شروط السيولة، والإطار التنظيمي.
                </p>
                <p>
                  ريسورغو ليست جهة مرخَّصة للخدمات المالية في المرحلة الحالية. لا يُعدّ أي محتوى
                  على المنصة نصيحة استثمارية أو مالية أو قانونية.
                </p>
              </Prose>
            </section>

            <section id="clearing">
              <SectionHeading id="clearing" number="07">خدمات المقاصة القانونية</SectionHeading>
              <Prose>
                <p>
                  تُقدّم خدمات المقاصة (حصر الإرث، الوكالات، استرداد الملكية) بوصفها أدوات مساعدة
                  تقنية لإعداد المسودات وتنظيم الوثائق، وليست استشارة قانونية معتمدة.
                </p>
                <RuleList items={[
                  'المسودات القانونية المُولَّدة تتطلب مراجعة محامٍ مرخَّص قبل أي استخدام رسمي',
                  'أرقام الأرشيف السيادية تجريبية ولا تُنشئ أثراً قانونياً في المرحلة الحالية',
                  'لا يتحمّل ريسورغو مسؤولية أي قرار قانوني يستند إلى مخرجات المنصة',
                ]} />
              </Prose>
            </section>

            <section>
              <SectionHeading id="automated-tools" number="08">الأدوات الآلية</SectionHeading>
              <Prose>
                <p>
                  تستخدم المنصة أدوات تقنية متقدمة لأغراض متعددة: استخراج البيانات من الوثائق،
                  تقدير القيمة العقارية، توليد تقارير فنية، ومطابقة المستثمرين بالفرص.
                </p>
                <WarningBox>
                  المخرجات الآلية احتمالية وليست مؤكدة. يجب مراجعة كل مخرج بشرياً قبل اتخاذ قرار يستند إليه.
                </WarningBox>
                <p>
                  لا تُقدّم ريسورغو أي ضمان على دقة مخرجات النماذج الذكية.
                  استخدامك لها يعني قبولك لهذا القيد صراحةً.
                </p>
              </Prose>
            </section>

            <section id="prohibited">
              <SectionHeading id="prohibited" number="09">الاستخدامات المحظورة</SectionHeading>
              <Prose>
                <p>يُحظر صراحةً استخدام المنصة في:</p>
                <RuleList items={[
                  'نشر معلومات عقارية كاذبة أو مضلِّلة',
                  'غسيل الأموال أو أي نشاط مالي مخالف للقانون',
                  'التحرش أو التهديد أو انتهاك خصوصية أي مستخدم آخر',
                  'محاولة اختراق أنظمة المنصة أو التلاعب بها',
                  'انتحال صفة شخص آخر أو استخدام هويات مزوَّرة',
                  'الترويج لخدمات منافسة داخل المنصة',
                  'أي نشاط ينتهك القوانين السورية النافذة',
                ]} />
              </Prose>
            </section>

            <section id="liability">
              <SectionHeading id="liability" number="10">تحديد المسؤولية</SectionHeading>
              <Prose>
                <p>
                  في أقصى الحدود التي يسمح بها القانون، لا تتحمّل ريسورغو المسؤولية عن:
                </p>
                <RuleList items={[
                  'الأضرار غير المباشرة أو التبعية الناجمة عن استخدام المنصة',
                  'انقطاع الخدمة أو فقدان البيانات نتيجة ظروف خارجة عن إرادتنا',
                  'دقة المعلومات التي يُدرجها المستخدمون الآخرون',
                  'أي خسارة استثمارية تستند إلى محتوى المنصة',
                ]} />
                <p>
                  الحد الأقصى لمسؤولية ريسورغو في أي نزاع يُساوي إجمالي ما دفعته للمنصة خلال
                  الاثني عشر شهراً السابقة للحادثة المُدَّعى بها.
                </p>
              </Prose>
            </section>

            <section id="governing">
              <SectionHeading id="governing" number="11">القانون الحاكم</SectionHeading>
              <Prose>
                <p>
                  تخضع هذه الاتفاقية للقوانين السورية النافذة.
                  تختص المحاكم السورية المختصة للفصل في أي نزاع ينشأ عنها.
                  يُسعى في المقام الأول إلى تسوية النزاعات ودياً خلال 30 يوماً قبل اللجوء إلى القضاء.
                </p>
              </Prose>
            </section>

            <section id="contact">
              <SectionHeading id="contact" number="12">التواصل</SectionHeading>
              <Prose>
                <p>لأي استفسار قانوني أو شكوى تتعلق بهذه الشروط:</p>
              </Prose>
              <div className="border border-navy/10 rounded-2xl overflow-hidden">
                {[
                  ['البريد الإلكتروني',  'info@resurgosy.com'],
                  ['الجهة المختصة',      'الفريق القانوني — ريسورغو للتقنية العقارية'],
                  ['وقت الاستجابة',      'خلال 7 أيام عمل'],
                  ['لغة النزاع الرسمية', 'العربية'],
                ].map(([k, v], i, arr) => (
                  <div key={i} className={`flex items-start justify-between gap-6 px-5 py-4 text-sm ${i < arr.length - 1 ? 'border-b border-navy/[0.06]' : ''}`}>
                    <span className="text-charcoal/50 shrink-0 text-xs">{k}</span>
                    <span className="text-navy font-mono text-right">{v}</span>
                  </div>
                ))}
              </div>
            </section>

          </article>
        </div>
      </div>

      {/* Back to top */}
      {showTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 left-6 w-10 h-10 rounded-xl bg-navy border border-white/10 flex items-center justify-center text-white/60 hover:text-white shadow-xl transition-colors z-40">
          <ChevronUp size={18} />
        </motion.button>
      )}
    </div>
  );
}
