import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';

export default function LazyImage({ src, alt, className, fallback = null }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);

  const globalData = useGlobalData();
  const lowBandwidthMode = globalData?.lowBandwidthMode;

  useEffect(() => {
    if (lowBandwidthMode) return; // Don't observe if low-bandwidth mode is active

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lowBandwidthMode]);

  if (lowBandwidthMode) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-navy-900 flex flex-col items-center justify-center text-charcoal/30 p-4 border border-dashed border-charcoal/10 rounded-lg ${className}`}>
        <ImageIcon size={20} className="mb-1 opacity-40 animate-none" />
        <span className="text-[10px] font-bold text-center">توفير بيانات (تم التعليق)</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden bg-navy/5 ${className}`}>
      {/* Placeholder / Skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-charcoal/5">
          <ImageIcon className="text-charcoal/20" size={24} />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 text-red-400 p-2 text-center">
          <ImageIcon size={20} className="mb-1 opacity-50" />
          <span className="text-[10px] uppercase font-bold">لا يمكن تحميل الصورة</span>
        </div>
      )}

      {/* Actual Image */}
      {isVisible && (
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 1.05 }}
          transition={{ duration: 0.5 }}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-all ${className}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
