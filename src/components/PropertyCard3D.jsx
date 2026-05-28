import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BadgeCheck, Home, Bath, ArrowLeft } from 'lucide-react';
import LazyImage from './ui/LazyImage';

export default function PropertyCard3D({ property, index = 0 }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare,  setGlare]  = useState({ x: 50, y: 50 });

  const onMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    setRotate({ x: -(ny - 0.5) * 12, y: (nx - 0.5) * 12 });
    setGlare({ x: nx * 100, y: ny * 100 });
  }, []);

  const onLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50 });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      style={{ perspective: '1200px' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="cursor-pointer group"
    >
      <motion.div
        animate={{ rotateX: rotate.x, rotateY: rotate.y }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="bg-white overflow-hidden relative shadow-[0_2px_8px_rgba(31,42,56,0.06)]"
        style={{ transformStyle: 'preserve-3d', borderRadius: '8px' }}
      >
        {/* Glare overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-[1.25rem]"
          style={{ background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(89,121,187,0.18), transparent 55%)` }}
        />

        {/* Image */}
        <Link to={`/properties/${property.id}`} className="block relative h-52 overflow-hidden">
          <LazyImage
            src={property.images?.[0] ?? property.image ?? ''}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />

          {/* Status badge */}
          <span className={`absolute top-3 right-3 text-[11px] px-2.5 py-1 rounded-full font-bold shadow-lg ${
            property.status === 'للبيع' ? 'bg-cta text-white shadow-cta/30' : 'bg-brand text-white shadow-brand/30'
          }`}>
            {property.status}
          </span>

          {/* Verified badge */}
          {property.verified && (
            <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-300 px-2 py-0.5 rounded-full font-bold">
              <BadgeCheck size={10} /> موثّق
            </span>
          )}

          {/* Price over image */}
          <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
            <p className="text-white font-black text-xl leading-none drop-shadow-lg">
              {property.priceDisplay ?? property.price}
            </p>
          </div>
        </Link>

        {/* Card body */}
        <Link to={`/properties/${property.id}`} className="block p-4">
          {/* Title */}
          <h3 className="text-navy font-bold text-sm leading-snug mb-1.5 line-clamp-1 group-hover:text-brand transition-colors duration-200">
            {property.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-charcoal/55 text-xs mb-3">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{property.city}{property.district ? ` · ${property.district}` : ''}</span>
          </div>

          {/* Specs row */}
          <div className="flex items-center gap-3 text-[11px] text-charcoal/50 mb-4">
            {property.area && (
              <span className="flex items-center gap-1">
                <Home size={11} className="text-charcoal/35" />
                {property.area} م²
              </span>
            )}
            {property.rooms > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-charcoal/30">·</span>
                {property.rooms} غرف
              </span>
            )}
            {property.baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath size={10} className="text-charcoal/35" />
                {property.baths}
              </span>
            )}
          </div>

          {/* Footer row: rating + CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-navy/[0.07]">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className={i < (property.rating ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/15'} />
              ))}
            </div>
            <span className={`flex items-center gap-1 text-[11px] font-bold text-brand opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:gap-1.5`}>
              عرض التفاصيل <ArrowLeft size={11} />
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
