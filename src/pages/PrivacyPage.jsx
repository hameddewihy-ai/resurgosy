import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle, ChevronUp } from 'lucide-react';
import SEO from '../components/SEO';

const SECTIONS = [
  { id: 'intro',      label: 'مقدمة' },
  { id: 'collect',    label: 'البيانات التي نجمعها' },
  { id: 'use',        label: 'كيف نستخدم بياناتك' },
  { id: 'share',      label: 'مشاركة البيانات' },
  { id: 'storage',    label: 'التخزين والأمان' },
  { id: 'rights',     label: 'حقوقك' },
  { id: 'cookies',    label: 'ملفات تعريف الارتباط' },
  { id: 'children',   label: 'الأطفال' },
  { id: 'changes',    label: 'تحديثات السياسة' },
  { id: 'contact',    label: 'التواصل' },
];

function useSectionObserver(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
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

function DataTable({ rows }) {
  return (
    <div className="border border-navy/10 rounded-2xl overflow-hidden mb-8">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream border-b border-navy/10">
            <th className="text-right text-charcoal/50 font-medium px-5 py-3 text-xs uppercase tracking-wider w-48">نوع البيانات</th>
            <th className="text-right text-charcoal/50 font-medium px-5 py-3 text-xs uppercase tracking-wider">الغرض</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/[0.06]">
          {rows.map(([type, purpose], i) => (
            <tr key={i} className="hover:bg-cream/50 transition-colors">
              <td className="px-5 py-3.5 text-navy font-medium text-xs font-mono align-top whitespace-nowrap">{type}</td>
              <td className="px-5 py-3.5 text-charcoal/65 text-xs leading-relaxed">{purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  const active = useSectionObserver(SECTIONS.map((s) => s.id));
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <SEO
        title="سياسة الخصوصية"
        description="سياسة الخصوصية وحماية البيانات لمنصة ريسورقو"
        path="/privacy"
      />

      {/* Hero — narrow, editorial */}
      <div className="bg-navy pt-28 pb-20 relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex items-center justify-end pointer-events-none pr-8 sm:pr-16">
          <span className="font-display text-[140px] sm:text-[200px] leading-none text-white/[0.03] tracking-widest select-none">PRIVACY</span>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <Shield size={16} className="text-brand" />
            <span className="text-brand text-xs font-bold tracking-[0.22em] uppercase">سياسة الخصوصية</span>
          </div>
          <h1 className="text-white font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.4] max-w-xl">
            بياناتك<br />
            <span className="text-white/30">ملكك.</span>
          </h1>
          <p className="text-white/40 text-sm mt-4">آخر تحديث: مايو 2026 · سارية المفعول فور النشر</p>
        </div>
      </div>

      {/* Under-construction banner */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-amber-700 text-xs">
          <AlertCircle size={14} className="shrink-0" />
          هذه السياسة مسودة أولية للمنصة قيد الإنشاء · تخضع للمراجعة القانونية قبل الإطلاق الرسمي
        </div>
      </div>

      {/* Body: sidebar + article */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-16 xl:gap-24">

          {/* Sticky TOC */}
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
              <SectionHeading id="intro" number="01">مقدمة</SectionHeading>
              <Prose>
                <p>
                  تلتزم شركة ريسورغو للتقنية العقارية ("ريسورغو"، "نحن") بحماية خصوصية مستخدميها وفق أعلى المعايير المعمول بها.
                  تُوضّح هذه السياسة طبيعة البيانات التي نجمعها، وكيفية استخدامها، والحقوق المكفولة لك.
                </p>
                <p>
                  باستخدامك للمنصة، تُقرّ بأنك قرأت هذه السياسة وفهمت مضمونها.
                  إن كنت تعترض على أي بند، يُرجى التوقف عن استخدام خدماتنا والتواصل معنا لإزالة بياناتك.
                </p>
              </Prose>
            </section>

            <section id="collect">
              <SectionHeading id="collect" number="02">البيانات التي نجمعها</SectionHeading>
              <Prose>
                <p>نجمع البيانات من مصدرين رئيسيين: ما تُقدّمه أنت مباشرةً، وما يُولَّد تلقائياً أثناء استخدامك للمنصة.</p>
              </Prose>
              <DataTable rows={[
                ['الاسم والبريد الإلكتروني',  'إنشاء الحساب والتواصل معك'],
                ['رقم الهاتف',                'التحقق الثنائي والإشعارات العقارية'],
                ['بيانات الهوية الوطنية',      'التحقق من الهوية في المعاملات القانونية فقط'],
                ['الموقع الجغرافي (اختياري)', 'تصفية العقارات القريبة منك'],
                ['بيانات الجهاز والمتصفح',    'الأمان والأداء وتحسين التجربة'],
                ['نشاط الاستعراض داخل المنصة','تحسين توصيات النظام'],
                ['وثائق رفعتها (PDF, صور)',   'خدمة المسح الضوئي والأرشفة القانونية فقط'],
              ]} />
            </section>

            <section id="use">
              <SectionHeading id="use" number="03">كيف نستخدم بياناتك</SectionHeading>
              <Prose>
                <p>نستخدم البيانات التي نجمعها للأغراض التالية حصراً:</p>
                <ul className="space-y-2 mr-4">
                  {[
                    'تشغيل الخدمات الأساسية: تصفح العقارات، الاستثمار، التوظيف، الأرشفة',
                    'تشغيل نماذج التحليل المحلية لاستخراج البيانات القانونية',
                    'إرسال الإشعارات التي تطلبها صراحةً',
                    'الوفاء بالمتطلبات القانونية والتنظيمية السورية',
                    'تحليل الاستخدام الإجمالي (بدون تعريف شخصي) لتحسين المنصة',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[15px] text-charcoal/70">
                      <span className="w-1 h-1 rounded-full bg-brand mt-2.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm">
                  لا نستخدم بياناتك في الإعلانات المستهدفة ولا نبيعها لأي طرف ثالث لأغراض تسويقية.
                </p>
              </Prose>
            </section>

            <section id="share">
              <SectionHeading id="share" number="04">مشاركة البيانات</SectionHeading>
              <Prose>
                <p>
                  لا نشارك بياناتك الشخصية مع أطراف خارجية إلا في الحالات الضرورية التالية:
                </p>
                <DataTable rows={[
                  ['مزودو البنية التحتية', 'خوادم التخزين السحابي مع اتفاقيات سرية مُلزِمة'],
                  ['الجهات الحكومية السورية', 'عند وجود أمر قضائي أو طلب رسمي مُعتمَد قانونياً'],
                  ['شركاء التحقق من الهوية', 'لإتمام معاملات التوثيق الرسمي فقط وبموافقتك'],
                  ['المركز الوطني للأرشفة', 'ربط أرقام الأرشيف السيادي في معاملات المقاصة'],
                ]} />
              </Prose>
            </section>

            <section id="storage">
              <SectionHeading id="storage" number="05">التخزين والأمان</SectionHeading>
              <Prose>
                <p>
                  تُخزَّن بياناتك على خوادم مشفَّرة باستخدام معيار AES-256-GCM.
                  تُستخدَم بروتوكولات TLS 1.3 لجميع الاتصالات بين المتصفح والخادم.
                </p>
                <p>
                  يُعاد تشفير البيانات الحساسة (وثائق الهوية، الملفات القانونية) بمفتاح خاص بكل مستخدم
                  ولا يمكن الوصول إليها من قِبل موظفي الشركة دون مسوّغ قانوني.
                </p>
                <p>
                  نحتفظ ببياناتك طوال فترة نشاط حسابك. عند حذف حسابك، تُحذف البيانات الشخصية خلال 30 يوماً،
                  باستثناء ما تُلزمنا الجهات التنظيمية بالاحتفاظ به.
                </p>
              </Prose>
            </section>

            <section id="rights">
              <SectionHeading id="rights" number="06">حقوقك</SectionHeading>
              <Prose>
                <p>يحق لك في أي وقت:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  {[
                    ['الاطلاع',   'طلب نسخة كاملة من بياناتك الشخصية'],
                    ['التصحيح',   'تحديث أي بيانات غير دقيقة'],
                    ['الحذف',     'طلب حذف حسابك وبياناتك'],
                    ['التقييد',   'تقييد معالجة بياناتك في حالات معينة'],
                    ['النقل',     'استلام بياناتك بصيغة قابلة للقراءة الآلية'],
                    ['الاعتراض', 'الاعتراض على معالجة بياناتك لأغراض معينة'],
                  ].map(([right, desc]) => (
                    <div key={right} className="border border-navy/10 rounded-xl px-4 py-3">
                      <p className="text-navy font-bold text-sm mb-0.5">{right}</p>
                      <p className="text-charcoal/55 text-xs">{desc}</p>
                    </div>
                  ))}
                </div>
                <p>لممارسة أي من هذه الحقوق، تواصل معنا عبر البريد الإلكتروني: <span className="text-brand font-mono">info@resurgo.sy</span></p>
              </Prose>
            </section>

            <section id="cookies">
              <SectionHeading id="cookies" number="07">ملفات تعريف الارتباط</SectionHeading>
              <Prose>
                <p>
                  نستخدم ملفات الارتباط الضرورية للتشغيل (جلسة المستخدم، التفضيلات الأساسية)
                  وملفات تحليلية مجهولة الهوية لقياس الأداء.
                  يمكنك تعطيل ملفات الارتباط التحليلية من إعدادات المتصفح دون تأثير على الوظائف الأساسية.
                </p>
              </Prose>
            </section>

            <section id="children">
              <SectionHeading id="children" number="08">الأطفال</SectionHeading>
              <Prose>
                <p>
                  لا توجّه منصة ريسورغو خدماتها للأفراد دون سن 18 عاماً.
                  إن اكتشفنا أن قاصراً قدّم بيانات شخصية، سنحذفها فوراً.
                </p>
              </Prose>
            </section>

            <section id="changes">
              <SectionHeading id="changes" number="09">تحديثات السياسة</SectionHeading>
              <Prose>
                <p>
                  قد نُحدّث هذه السياسة دورياً. عند حدوث تغييرات جوهرية، سنُعلمك عبر البريد الإلكتروني
                  المسجّل أو إشعار داخل المنصة قبل سريان التعديلات بـ14 يوماً.
                  مواصلة استخدام المنصة بعد الإشعار تعني موافقتك على السياسة المحدَّثة.
                </p>
              </Prose>
            </section>

            <section id="contact">
              <SectionHeading id="contact" number="10">التواصل</SectionHeading>
              <Prose>
                <p>لأي استفسار يتعلق بهذه السياسة أو بياناتك الشخصية:</p>
              </Prose>
              <div className="border border-navy/10 rounded-2xl overflow-hidden">
                {[
                  ['البريد الإلكتروني', 'info@resurgo.sy'],
                  ['العنوان',           'دمشق، سوريا — يُحدَّد عند الإطلاق الرسمي'],
                  ['وقت الاستجابة',     'خلال 5 أيام عمل'],
                ].map(([k, v], i) => (
                  <div key={i} className={`flex items-start justify-between gap-6 px-5 py-4 text-sm ${i < 2 ? 'border-b border-navy/[0.06]' : ''}`}>
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
