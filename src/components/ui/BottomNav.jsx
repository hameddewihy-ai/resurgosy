import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, TrendingUp, Hammer, Bell } from 'lucide-react';

const TABS = [
  { to: '/',           icon: Home,       label: 'الرئيسية'  },
  { to: '/properties', icon: Building2,  label: 'العقارات'  },
  { to: '/invest',     icon: TrendingUp, label: 'الاستثمار' },
  { to: '/finishing',  icon: Hammer,     label: 'الإكساء'   },
  { to: '/news',       icon: Bell,       label: 'التنبيهات' },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  const isActive = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-navy/10 safe-area-inset-bottom">
      <div className="flex items-stretch h-16" dir="rtl">
        {TABS.map(({ to, icon: Icon, label }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? 'text-brand' : 'text-charcoal/40 hover:text-charcoal/70'
              }`}
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
      </div>
    </nav>
  );
}
