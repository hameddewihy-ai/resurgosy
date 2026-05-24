import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Mail, MessageCircle, Camera, Link2 } from 'lucide-react';

const SERVICES = [
  { label: 'العقارات',    to: '/properties'       },
  { label: 'الاستثمار',  to: '/invest'            },
  { label: 'التوظيف',    to: '/jobs'              },
  { label: 'الدراسات',   to: '/studies'           },
  { label: 'المقاولات',  to: '/equipment'         },
  { label: 'المطورون',   to: '/developers'        },
  { label: 'تمويل جماعي', to: '/crowdfund'       },
  { label: 'التقييم',    to: '/valuation-request' },
  { label: 'الأخبار',    to: '/news'              },
];

const PLATFORM = [
  { label: 'من نحن',          to: '/about'   },
  { label: 'سياسة الخصوصية', to: '/privacy' },
  { label: 'شروط الاستخدام',  to: '/terms'   },
  { label: 'تسجيل الدخول',    to: '/auth'    },
];

const SOCIAL = [
  { icon: MessageCircle, label: 'واتساب',   href: '#' },
  { icon: Camera,        label: 'انستغرام', href: '#' },
  { icon: Link2,         label: 'لينكدإن',  href: '#' },
];

// لا نعرض Footer في صفحات الـ dashboard
const HIDE_ON = [
  '/engineer/dashboard',
  '/investor/vip',
  '/clearing/dashboard',
  '/owner/add-property',
  '/dashboard',
  '/admin/news',
];

export default function Footer() {
  const { pathname } = useLocation();
  if (HIDE_ON.some(p => pathname.startsWith(p))) return null;

  return (
    <footer className="bg-navy relative overflow-hidden" dir="rtl">

      {/* Watermark — RESURGO giant text */}
      <div aria-hidden className="absolute inset-0 flex items-end justify-center pointer-events-none select-none overflow-hidden">
        <span className="font-display text-[220px] sm:text-[320px] leading-none text-white/[0.025] -mb-8 tracking-widest">
          RESURGO
        </span>
      </div>

      {/* ── CTA strip ── */}
      <div className="relative border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-cta text-xs font-bold tracking-[0.25em] uppercase mb-3">— ابدأ اليوم</p>
              <h3 className="text-white font-black text-2xl sm:text-3xl leading-tight">
                كن من أوائل المستفيدين<br />
                <span className="text-white/40">عند الإطلاق الرسمي.</span>
              </h3>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link to="/auth?tab=register"
                className="flex items-center gap-2 bg-cta hover:bg-cta/90 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors">
                إنشاء حساب <ArrowLeft size={15} />
              </Link>
              <Link to="/about"
                className="flex items-center gap-2 border border-white/15 hover:border-white/35 text-white/60 hover:text-white px-6 py-3 rounded-xl text-sm transition-colors">
                اعرف المزيد
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main body ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-14">

          {/* Brand column */}
          <div className="max-w-xs">
            <motion.div
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              <p className="font-display text-6xl sm:text-7xl text-white tracking-[0.08em] mb-4 leading-none">
                RESURGO
              </p>
              <p className="text-white/35 text-sm leading-relaxed mb-7">
                منصة العقارات والاستثمار والمقاولات في سوريا.
                مدعومة بالتقنيات المتقدمة وتقنية البلوكتشين.
              </p>

              {/* Social */}
              <div className="flex gap-2 mb-7">
                {SOCIAL.map(({ icon: Icon, label, href }) => (
                  <a key={label} href={href} aria-label={label}
                    className="w-9 h-9 rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                    <Icon size={15} />
                  </a>
                ))}
              </div>

              {/* Construction badge */}
              <span className="inline-flex items-center gap-1.5 text-[10px] bg-cta/10 text-cta border border-cta/20 px-3 py-1.5 rounded-full font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-cta animate-pulse" />
                قيد الإنشاء — بيانات تجريبية
              </span>
            </motion.div>
          </div>

          {/* Links grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 text-sm">

            {/* Services */}
            <div>
              <p className="text-white/25 text-[9px] uppercase tracking-[0.24em] mb-5 font-bold">خدمات</p>
              <ul className="space-y-2.5">
                {SERVICES.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}
                      className="group/link flex items-center gap-1.5 text-white/45 hover:text-white transition-colors duration-200">
                      <span className="w-0 group-hover/link:w-2 h-[1.5px] bg-brand rounded-full transition-all duration-200 shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Platform */}
            <div>
              <p className="text-white/25 text-[9px] uppercase tracking-[0.24em] mb-5 font-bold">المنصة</p>
              <ul className="space-y-2.5">
                {PLATFORM.map(({ label, to }) => (
                  <li key={to}>
                    <Link to={to}
                      className="group/link flex items-center gap-1.5 text-white/45 hover:text-white transition-colors duration-200">
                      <span className="w-0 group-hover/link:w-2 h-[1.5px] bg-brand rounded-full transition-all duration-200 shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="col-span-2 sm:col-span-1">
              <p className="text-white/25 text-[9px] uppercase tracking-[0.24em] mb-5 font-bold">التواصل</p>
              <ul className="space-y-3">
                <li>
                  <span className="text-white/40 flex items-center gap-2 text-xs">
                    <MessageCircle size={13} className="text-white/25 shrink-0" /> واتساب
                  </span>
                </li>
                <li>
                  <a href="mailto:info@resurgo.sy"
                    className="text-white/40 hover:text-white transition-colors duration-200 flex items-center gap-2 text-xs">
                    <Mail size={13} className="text-white/25 shrink-0" /> info@resurgo.sy
                  </a>
                </li>
                <li className="flex items-center gap-2 text-white/30 text-xs">
                  <MapPin size={13} className="text-white/20 shrink-0" /> دمشق، سوريا
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="relative border-t border-white/[0.06] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} RESURGO · جميع البيانات المعروضة تجريبية
          </p>
          <div className="flex gap-5 text-xs text-white/20">
            <Link to="/privacy" className="hover:text-white/50 transition-colors">سياسة الخصوصية</Link>
            <Link to="/terms"   className="hover:text-white/50 transition-colors">شروط الاستخدام</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
