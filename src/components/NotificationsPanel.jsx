import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCheck, Briefcase, Building2, TrendingUp, Info, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const NOTIF_KEY = 'resurgo-notifications';

const SEED = [
  {
    id: 'n1', type: 'job_match', read: false,
    title: 'وظيفة تناسب ملفك الشخصي',
    body:  'مهندس إنشائي أول — شركة الإعمار السورية · دمشق · 1,200 $',
    date:  '2026-05-18T08:30:00', link: '/jobs',
  },
  {
    id: 'n2', type: 'job_status', read: false,
    title: 'تم تحديث حالة طلبك',
    body:  'طلبك على "مشرف مشروع" انتقل إلى مرحلة المقابلة',
    date:  '2026-05-17T15:12:00', link: '/dashboard',
  },
  {
    id: 'n3', type: 'property', read: false,
    title: 'عقار جديد في منطقتك',
    body:  'شقة 180م² في المزة — 85,000 $ — تطابق بحثك المحفوظ',
    date:  '2026-05-17T09:00:00', link: '/properties',
  },
  {
    id: 'n4', type: 'invest', read: true,
    title: 'تحديث محفظتك الاستثمارية',
    body:  'عائد شهري +3.2% · مشروع برج الشام السكني',
    date:  '2026-05-16T11:00:00', link: '/invest',
  },
  {
    id: 'n5', type: 'system', read: true,
    title: 'مرحباً بك في RESURGO',
    body:  'اكتمل إعداد حسابك. استكشف 12,400+ عقار في 14 محافظة سورية.',
    date:  '2026-05-15T10:00:00', link: '/',
  },
];

const TYPE_META = {
  job_match:  { icon: Briefcase,   bg: 'bg-brand/10',    iconCls: 'text-brand'        },
  job_status: { icon: Briefcase,   bg: 'bg-emerald-50',  iconCls: 'text-emerald-600'  },
  property:   { icon: Building2,   bg: 'bg-amber-50',    iconCls: 'text-amber-600'    },
  invest:     { icon: TrendingUp,  bg: 'bg-violet-50',   iconCls: 'text-violet-600'   },
  system:     { icon: Info,        bg: 'bg-navy/8',      iconCls: 'text-navy/60'      },
};

function loadNotifs() {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIF_KEY));
    if (Array.isArray(raw) && raw.length > 0) return raw;
  } catch {}
  const seeded = [...SEED];
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(seeded)); } catch {}
  return seeded;
}

function saveNotifs(list) {
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(list)); } catch {}
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'الآن';
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const d = Math.floor(h / 24);
  return `منذ ${d} يوم`;
}

export function addNotification(notif) {
  const list = loadNotifs();
  const updated = [{ ...notif, id: 'n' + Date.now(), read: false, date: new Date().toISOString() }, ...list].slice(0, 30);
  saveNotifs(updated);
  window.dispatchEvent(new CustomEvent('resurgo-notif-update'));
}

export default function NotificationsPanel() {
  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState([]);
  const panelRef            = useRef(null);

  const reload = useCallback(() => setNotifs(loadNotifs()), []);

  useEffect(() => {
    reload();
    window.addEventListener('resurgo-notif-update', reload);
    return () => window.removeEventListener('resurgo-notif-update', reload);
  }, [reload]);

  useEffect(() => {
    const h = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const markRead = (id) => {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifs(updated);
    saveNotifs(updated);
  };

  const markAllRead = () => {
    const updated = notifs.map(n => ({ ...n, read: true }));
    setNotifs(updated);
    saveNotifs(updated);
  };

  const deleteNotif = (e, id) => {
    e.stopPropagation();
    const updated = notifs.filter(n => n.id !== id);
    setNotifs(updated);
    saveNotifs(updated);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
          open ? 'bg-brand/10 text-brand' : 'text-charcoal/40 hover:text-brand hover:bg-brand/8'
        }`}
        title="الإشعارات"
      >
        <Bell size={16} />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-cta text-white text-[9px] font-black rounded-full flex items-center justify-center leading-none"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full mt-2 left-0 w-[340px] bg-white border border-navy/12 rounded-2xl shadow-2xl shadow-navy/15 z-50 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-navy/8">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-brand" />
                <h3 className="text-navy font-black text-sm">الإشعارات</h3>
                {unread > 0 && (
                  <span className="bg-cta/15 text-cta text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unread} جديد</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-[10px] text-charcoal/50 hover:text-brand transition-colors px-2 py-1 rounded-lg hover:bg-cream">
                    <CheckCheck size={11} /> قراءة الكل
                  </button>
                )}
                <button onClick={() => setOpen(false)}
                  className="w-6 h-6 flex items-center justify-center text-charcoal/40 hover:text-navy hover:bg-cream rounded-lg transition-colors">
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {notifs.length === 0 ? (
                <div className="py-12 text-center text-charcoal/40">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs">لا توجد إشعارات</p>
                </div>
              ) : (
                notifs.map((n, i) => {
                  const meta = TYPE_META[n.type] || TYPE_META.system;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`group relative flex gap-3 px-4 py-3 border-b border-navy/[0.05] cursor-pointer transition-colors hover:bg-cream/70 ${!n.read ? 'bg-brand/[0.025]' : ''}`}
                      onClick={() => { markRead(n.id); setOpen(false); }}
                    >
                      {/* Unread dot */}
                      {!n.read && (
                        <span className="absolute top-4 right-2 w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      )}

                      <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon size={16} className={meta.iconCls} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-snug mb-0.5 ${!n.read ? 'text-navy font-bold' : 'text-charcoal/80 font-medium'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-charcoal/50 leading-relaxed line-clamp-2">{n.body}</p>
                        <p className="text-[9px] text-charcoal/35 mt-1">{timeAgo(n.date)}</p>
                      </div>

                      {n.link && (
                        <Link to={n.link} onClick={e => e.stopPropagation()}
                          className="shrink-0 opacity-0 group-hover:opacity-100 text-charcoal/30 hover:text-brand transition-all mt-1">
                          <ExternalLink size={11} />
                        </Link>
                      )}

                      <button
                        onClick={(e) => deleteNotif(e, n.id)}
                        className="absolute top-2 left-2 w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 text-charcoal/25 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={9} />
                      </button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-navy/8 bg-cream/50">
              <Link to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-1.5 text-xs text-brand hover:text-navy font-semibold transition-colors">
                عرض كل الإشعارات في لوحة التحكم <ExternalLink size={10} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
