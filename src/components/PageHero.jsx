import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Scroll-triggered counter for stats strip
function AnimatedCounter({ target, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);
  const elRef = useRef(null);
  useEffect(() => {
    const el = elRef.current;
    if (!el || target == null) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const inc = target / 55;
      const timer = setInterval(() => {
        cur = Math.min(cur + inc, target);
        setCount(parseFloat(cur.toFixed(1)));
        if (cur >= target) clearInterval(timer);
      }, 18);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={elRef}>{prefix}{Number.isInteger(target) ? Math.round(count) : count}{suffix}</span>;
}

export default function PageHero({
  num,
  eyebrow,
  title,
  subtitle,
  accent = 'bg-brand',
  breadcrumb,
  children,
  bgImage,
  stats,
  trustBadges,
}) {
  return (
    <div className="page-hero-wrap pt-[62px] relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        {bgImage ? (
          <>
            <img src={bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(31,42,56,0.96) 0%, rgba(31,42,56,0.80) 60%, rgba(31,42,56,0.95) 100%)' }} />
          </>
        ) : (
          <>
            {/* Subtle grid */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
              backgroundSize: '48px 48px',
            }} />
            {/* Primary radial — top right */}
            <div className="absolute top-0 right-0 w-[600px] h-[280px]" style={{
              background: 'radial-gradient(ellipse at 85% 0%, rgba(89,121,187,0.18) 0%, transparent 65%)',
            }} />
            {/* Secondary radial — bottom left */}
            <div className="absolute bottom-0 left-0 w-[400px] h-[200px]" style={{
              background: 'radial-gradient(ellipse at 10% 100%, rgba(243,113,36,0.07) 0%, transparent 60%)',
            }} />
            {/* Blur blobs */}
            <div className="absolute top-6 left-1/3 w-[360px] h-[360px] rounded-full bg-brand/7 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-[260px] h-[260px] rounded-full bg-white/[0.035] blur-3xl" />
          </>
        )}

        {/* Watermark number — dramatically larger */}
        {num && (
          <span
            className="absolute left-0 bottom-0 font-black select-none leading-none"
            style={{
              fontSize: 'clamp(160px, 22vw, 300px)',
              color: 'rgba(255,255,255,0.028)',
              fontFamily: 'Bebas Neue, sans-serif',
              lineHeight: 0.82,
            }}
          >{num}</span>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16" dir="rtl">

        {/* Breadcrumb */}
        {breadcrumb && breadcrumb.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-1 mb-5 flex-wrap"
            aria-label="breadcrumb"
          >
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronLeft size={10} className="text-white/20" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="text-[11px] text-white/40 hover:text-white/75 transition-colors font-medium">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[11px] text-white/65 font-semibold">{crumb.label}</span>
                )}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Eyebrow */}
        {eyebrow && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-2.5 mb-4"
          >
            <div className={`w-5 h-[2px] rounded-full ${accent}`} />
            <p className="eyebrow text-brand/90">
              {num && <span className="font-display tracking-widest ml-1.5 opacity-60">{num} —</span>}
              {eyebrow}
            </p>
          </motion.div>
        )}

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="mb-3"
        >
          {typeof title === 'string' ? (
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.4]">{title}</h1>
          ) : title}
        </motion.div>

        {/* Accent line */}
        <motion.div
          initial={{ scaleX: 0, originX: 1 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.7, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={`h-[3px] w-14 rounded-full mb-5 ${accent}`}
        />

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="text-white/50 text-sm sm:text-[15px] leading-[1.8] max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}

        {/* Trust badges — optional */}
        {trustBadges && trustBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.24 }}
            className="flex gap-2 flex-wrap mt-5"
          >
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 bg-white/7 border border-white/10 rounded-full px-3 py-1.5 text-xs text-white/60 whitespace-nowrap">
                {Icon && <Icon size={11} className="text-brand shrink-0" />}
                {label}
              </div>
            ))}
          </motion.div>
        )}

        {/* Extra content (children) */}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mt-6"
          >
            {children}
          </motion.div>
        )}

        {/* Stats strip — animated counters */}
        {stats && stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="flex items-center gap-8 mt-8 pt-6 border-t border-white/10 flex-wrap"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className={`font-display text-4xl sm:text-5xl leading-none tabular-nums tracking-wide ${s.color ?? 'text-white'}`}>
                  {s.target != null
                    ? <AnimatedCounter target={s.target} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
                    : s.value
                  }
                </span>
                <span className="text-white/35 text-[10px] font-bold tracking-[0.18em] uppercase mt-1.5">{s.label}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
