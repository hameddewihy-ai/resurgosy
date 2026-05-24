import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, ArrowRight, Building2, Briefcase, TrendingUp,
  Hammer, HardHat, Wrench, Users, GitMerge, BarChart3,
  Bell, Scale, Calculator,
} from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4" dir="rtl">
      <SEO title="الصفحة غير موجودة" description="الصفحة التي تبحث عنها غير موجودة." noindex={true} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-lg"
      >
        {/* 404 number */}
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="text-[140px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-brand to-brand/20 mb-4 select-none"
        >
          404
        </motion.p>

        <h1 className="text-navy font-black text-2xl mb-3">الصفحة غير موجودة</h1>
        <p className="text-charcoal/60 text-sm leading-relaxed mb-8">
          الرابط الذي أدخلته غير صحيح أو تم نقل هذه الصفحة.
          تصفّح منصاتنا للعثور على ما تبحث عنه.
        </p>

        {/* Quick links — all sections */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {[
            { to: '/properties',        icon: Building2,  label: 'العقارات'    },
            { to: '/invest',            icon: TrendingUp, label: 'الاستثمار'   },
            { to: '/jobs',              icon: Briefcase,  label: 'التوظيف'     },
            { to: '/finishing',         icon: Hammer,     label: 'الإكساء'     },
            { to: '/equipment',         icon: Wrench,     label: 'المعدات'     },
            { to: '/developers',        icon: Users,      label: 'المطورون'    },
            { to: '/crowdfund',         icon: GitMerge,   label: 'تمويل جماعي' },
            { to: '/studies',           icon: BarChart3,  label: 'الدراسات'    },
            { to: '/clearing',          icon: Scale,      label: 'التخليص'     },
            { to: '/valuation-request', icon: Calculator, label: 'التقييم'     },
            { to: '/news',              icon: Bell,       label: 'التنبيهات'   },
            { to: '/about',             icon: HardHat,    label: 'من نحن'      },
          ].map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className="bg-white p-3 flex flex-col items-center gap-1.5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] hover:shadow-[0_8px_24px_rgba(31,42,56,0.10)] rounded-lg transition-all hover:-translate-y-1">
              <Icon size={17} className="text-brand" />
              <span className="text-navy text-[11px] font-medium">{label}</span>
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn-cta flex items-center justify-center gap-2">
            <Home size={16} /> الصفحة الرئيسية
          </Link>
          <button onClick={() => navigate(-1)}
            className="btn-primary flex items-center justify-center gap-2">
            <ArrowRight size={16} /> العودة للخلف
          </button>
        </div>
      </motion.div>
    </div>
  );
}
