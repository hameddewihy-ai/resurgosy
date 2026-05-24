import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

const HIDE_ON = [
  '/engineer/dashboard',
  '/investor/vip',
  '/clearing/dashboard',
  '/owner/add-property',
  '/dashboard',
  '/admin/news',
];

const WA_NUMBER  = '963000000000';
const WA_DEFAULT = 'مرحباً، أودّ الاستفسار عن خدمات منصة RESURGO العقارية.';

export default function WhatsAppButton() {
  const { pathname } = useLocation();
  const [open,    setOpen]    = useState(false);
  const [msg,     setMsg]     = useState(WA_DEFAULT);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;

  const send = () => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setOpen(false);
    setMsg(WA_DEFAULT);
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2" dir="rtl">

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 12 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            className="bg-white rounded-2xl shadow-2xl shadow-navy/15 border border-navy/10 w-72 overflow-hidden">

            {/* Header */}
            <div className="bg-[#25D366] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none">RESURGO</p>
                  <p className="text-white/70 text-[10px] mt-0.5">عادةً يرد خلال دقائق</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Chat bubble */}
            <div className="px-4 py-3 bg-[#ece5dd]">
              <div className="bg-white rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm max-w-[90%]">
                <p className="text-charcoal/80 text-xs leading-relaxed">
                  مرحباً 👋 كيف يمكننا مساعدتك؟ اكتب رسالتك وسنرد عليك فوراً.
                </p>
                <p className="text-charcoal/30 text-[9px] mt-1 text-left">الآن</p>
              </div>
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-navy/8">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={3}
                placeholder="اكتب رسالتك هنا..."
                className="w-full text-xs text-navy border border-navy/10 rounded-xl px-3 py-2 resize-none focus:outline-none focus:border-[#25D366]/50 bg-cream/50 leading-relaxed"
                dir="rtl"
              />
              <button onClick={send}
                className="w-full mt-2 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20b858] text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                <MessageCircle size={15} />
                إرسال عبر واتساب
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <AnimatePresence>
        {visible && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 18, stiffness: 280, delay: 0.1 }}
            onClick={() => setOpen((o) => !o)}
            className="relative group"
            aria-label="تواصل عبر واتساب">

            {/* Pulse rings — only when closed */}
            {!open && (
              <>
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
                <span className="absolute -inset-2 rounded-full bg-[#25D366] animate-pulse opacity-10" />
              </>
            )}

            {/* Main button */}
            <div className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 transition-all duration-300 ${open ? 'bg-charcoal/80 scale-95' : 'bg-[#25D366] group-hover:scale-110'}`}>
              <AnimatePresence mode="wait">
                {open ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={22} className="text-white" />
                  </motion.div>
                ) : (
                  <motion.div key="wa" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MessageCircle size={26} className="text-white fill-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tooltip — only when closed */}
            {!open && (
              <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-navy text-white text-[11px] px-3 py-1.5 rounded-lg font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                تواصل عبر واتساب
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-navy" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
