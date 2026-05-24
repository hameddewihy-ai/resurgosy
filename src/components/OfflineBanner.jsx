import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineBanner() {
  const [offline, setOffline]       = useState(!navigator.onLine);
  const [showBack, setShowBack]     = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setShowBack(false); };
    const goOnline  = () => {
      setOffline(false);
      setShowBack(true);
      setTimeout(() => setShowBack(false), 3000);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {(offline || showBack) && (
        <motion.div
          key={offline ? 'offline' : 'back'}
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed top-0 inset-x-0 z-[100] flex items-center justify-center gap-2 py-2 text-xs font-bold ${
            offline ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
          }`}
          dir="rtl"
        >
          {offline
            ? <><WifiOff size={13} /> لا يوجد اتصال بالإنترنت — بعض الميزات قد لا تعمل</>
            : <><Wifi size={13} /> عاد الاتصال بالإنترنت</>
          }
        </motion.div>
      )}
    </AnimatePresence>
  );
}
