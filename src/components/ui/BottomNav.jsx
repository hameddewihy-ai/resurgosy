import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, TrendingUp, Bell, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GUEST_TABS = [
  { to: '/',           icon: Home,       label: 'الرئيسية'  },
  { to: '/properties', icon: Building2,  label: 'العقارات'  },
  { to: '/invest',     icon: TrendingUp, label: 'الاستثمار' },
  { to: '/auth',       icon: LogIn,      label: 'دخول',     exact: true },
];

const AUTH_TABS = [
  { to: '/',           icon: Home,       label: 'الرئيسية'  },
  { to: '/properties', icon: Building2,  label: 'العقارات'  },
  { to: '/invest',     icon: TrendingUp, label: 'الاستثمار' },
  { to: '/news',       icon: Bell,       label: 'التنبيهات' },
  { to: '/profile',    icon: User,       label: 'حسابي'     },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const { user } = useAuth();

  const isActive = (to, exact) =>
    exact ? pathname === to : (to === '/' ? pathname === '/' : pathname.startsWith(to));

  const tabs = user ? AUTH_TABS : GUEST_TABS;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-navy/10 safe-area-inset-bottom">
      <div className="flex items-stretch h-16" dir="rtl">
        {tabs.map(({ to, icon: Icon, label, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors
                ${active ? 'text-brand' : 'text-charcoal/40 hover:text-charcoal/70'}`}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />
                )}
              </div>
              <span className={`text-[9px] font-bold tracking-wide ${active ? 'text-brand' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Register CTA — guests only */}
        {!user && (
          <Link
            to="/auth?tab=register"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-cta"
          >
            <div className="w-9 h-9 rounded-xl bg-cta flex items-center justify-center -mt-1 shadow-md shadow-cta/30">
              <UserPlus size={18} className="text-white" strokeWidth={2} />
            </div>
            <span className="text-[9px] font-bold tracking-wide text-cta leading-none">تسجيل</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
