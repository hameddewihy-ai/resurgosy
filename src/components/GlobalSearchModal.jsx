import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Building2, Briefcase, Users, Newspaper, ArrowLeft } from 'lucide-react';
import { useGlobalData } from '../context/GlobalContext';
import { useNews } from '../hooks/useNews';

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({ icon: Icon, label, color, children }) {
  return (
    <div className="mb-1">
      <div className="flex items-center gap-1.5 px-4 py-1.5">
        <Icon size={11} className={color} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
      </div>
      {children}
    </div>
  );
}

function ResultRow({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2 hover:bg-cream transition-colors text-right"
    >
      {children}
    </button>
  );
}

function ViewAll({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2 px-4 py-1.5 text-brand text-xs hover:bg-cream/80 transition-colors font-semibold"
    >
      <ArrowLeft size={11} /> {label}
    </button>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export default function GlobalSearchModal({ open, onClose }) {
  const [query, setQuery]  = useState('');
  const inputRef           = useRef(null);
  const navigate           = useNavigate();
  const { properties, jobs, developers } = useGlobalData();
  const { articles }       = useNews();

  useEffect(() => {
    if (open) {
      setQuery('');
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      if (open && e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const q = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (q.length < 2) return null;

    return {
      props: properties.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q)
      ).slice(0, 4),

      jobs: jobs.filter(j =>
        j.title?.toLowerCase().includes(q) ||
        j.company?.toLowerCase().includes(q)
      ).slice(0, 3),

      devs: developers.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.company?.toLowerCase().includes(q)
      ).slice(0, 3),

      news: articles.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.body?.toLowerCase().includes(q)
      ).slice(0, 3),
    };
  }, [q, properties, jobs, developers, articles]);

  const hasResults = results && (
    results.props.length + results.jobs.length +
    results.devs.length + results.news.length > 0
  );

  const go = (path) => { navigate(path); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-navy/25 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[72px] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl px-4"
            dir="rtl"
          >
            <div className="bg-white rounded-2xl shadow-2xl shadow-navy/20 border border-navy/10 overflow-hidden">

              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-navy/8">
                <Search size={16} className="text-brand shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="ابحث في العقارات، الوظائف، المطورين، الأخبار..."
                  className="flex-1 bg-transparent text-navy text-sm placeholder-charcoal/40 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')}
                    className="text-charcoal/30 hover:text-navy transition-colors">
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:block text-[10px] text-charcoal/30 border border-navy/12 rounded px-1.5 py-0.5 font-sans leading-none">
                  Esc
                </kbd>
              </div>

              {/* Hint */}
              {q.length < 2 && (
                <div className="px-4 py-5 text-center">
                  <p className="text-charcoal/35 text-xs">اكتب للبحث في العقارات والوظائف والمطورين والأخبار</p>
                  <p className="text-charcoal/25 text-[11px] mt-1">
                    اضغط <kbd className="border border-navy/12 rounded px-1 py-px font-sans">Ctrl K</kbd> في أي وقت
                  </p>
                </div>
              )}

              {/* Results */}
              {q.length >= 2 && (
                <div className="max-h-[62vh] overflow-y-auto overscroll-contain py-2">
                  {!hasResults ? (
                    <div className="py-8 text-center text-charcoal/40 text-sm">
                      لا توجد نتائج لـ "<span className="text-navy font-medium">{query}</span>"
                    </div>
                  ) : (
                    <>
                      {/* Properties */}
                      {results.props.length > 0 && (
                        <Section icon={Building2} label="العقارات" color="text-brand">
                          {results.props.map(p => (
                            <ResultRow key={p.id} onClick={() => go(`/properties/${p.id}`)}>
                              <img
                                src={p.images?.[0] ?? p.image ?? '/placeholder.png'}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover shrink-0 bg-cream"
                                loading="lazy"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{p.title}</p>
                                <p className="text-charcoal/45 text-[11px]">{p.city} · {p.priceDisplay}</p>
                              </div>
                            </ResultRow>
                          ))}
                          <ViewAll onClick={() => {
                            try { sessionStorage.setItem('resurgo-filters-session', JSON.stringify({ search: query.trim() })); } catch {}
                            go('/properties');
                          }} label="عرض كل نتائج العقارات" />
                        </Section>
                      )}

                      {/* Jobs */}
                      {results.jobs.length > 0 && (
                        <Section icon={Briefcase} label="الوظائف" color="text-amber-600">
                          {results.jobs.map(j => (
                            <ResultRow key={j.id} onClick={() => go('/jobs')}>
                              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                <Briefcase size={14} className="text-amber-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{j.title}</p>
                                <p className="text-charcoal/45 text-[11px]">{j.company}</p>
                              </div>
                            </ResultRow>
                          ))}
                        </Section>
                      )}

                      {/* Developers */}
                      {results.devs.length > 0 && (
                        <Section icon={Users} label="المطورون" color="text-indigo-500">
                          {results.devs.map(d => (
                            <ResultRow key={d.id} onClick={() => go(`/developers/${d.id}`)}>
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <Users size={14} className="text-indigo-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{d.name}</p>
                                <p className="text-charcoal/45 text-[11px]">{d.company}</p>
                              </div>
                            </ResultRow>
                          ))}
                        </Section>
                      )}

                      {/* News */}
                      {results.news.length > 0 && (
                        <Section icon={Newspaper} label="الأخبار" color="text-green-600">
                          {results.news.map(a => (
                            <ResultRow key={a.id} onClick={() => go('/news')}>
                              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                <Newspaper size={14} className="text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-navy text-xs font-semibold truncate">{a.title}</p>
                                <p className="text-charcoal/45 text-[11px] truncate">{a.date}</p>
                              </div>
                            </ResultRow>
                          ))}
                        </Section>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
