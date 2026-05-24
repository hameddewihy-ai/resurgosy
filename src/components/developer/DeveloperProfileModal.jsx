import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  X, BadgeCheck, Star, MapPin, Calendar, Building2,
  Home, Award, Phone, Mail, Users, Briefcase, ChevronRight,
  Shield, ExternalLink,
} from 'lucide-react';

const BACKDROP = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const PANEL    = { hidden: { opacity: 0, y: 40, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1 } };

export default function DeveloperProfileModal({ isOpen, onClose, developer, projects = [], jobs = [], onViewProject }) {
  if (!developer) return null;

  const devProjects = projects.filter(p => p.developerId === developer.id).slice(0, 3);
  const devJobs     = jobs.filter(j =>
    j.company && developer.name && j.company.includes(developer.name.split(' ')[0])
  ).slice(0, 3);

  const handleViewProject = (proj) => {
    if (onViewProject) onViewProject(proj);
    else onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="dev-modal-backdrop"
          variants={BACKDROP}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            key="dev-modal-panel"
            variants={PANEL}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Cover image header ── */}
            <div className="relative h-48 overflow-hidden rounded-t-3xl">
              {developer.coverImage ? (
                <img
                  src={developer.coverImage}
                  alt={developer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full" style={{ backgroundColor: developer.color }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/30 to-transparent" />

              {/* Developer initials circle */}
              <div
                className="absolute bottom-0 translate-y-1/2 right-6 w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl border-4 border-white"
                style={{ backgroundColor: developer.color }}
              >
                {developer.initials}
              </div>

              {/* Verified badge */}
              {developer.verified && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold px-3 py-1.5 rounded-full">
                  <BadgeCheck size={13} className="text-brand" />
                  مطور موثّق
                </div>
              )}

              {/* Top developer badge */}
              {developer.rating >= 4.8 && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-yellow-400/90 text-navy text-[11px] font-black px-3 py-1.5 rounded-full">
                  <Award size={12} />
                  Top Developer
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 left-4 mt-0 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                style={{ left: developer.rating >= 4.8 ? '8.5rem' : '1rem' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Content ── */}
            <div className="px-6 pt-12 pb-6">

              {/* Name + city */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-navy font-black text-xl leading-snug">{developer.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-charcoal/50 text-sm">
                    <MapPin size={12} />
                    <span>{developer.city}</span>
                    <span className="text-navy/20">·</span>
                    <Calendar size={12} />
                    <span>منذ {developer.founded}</span>
                    {developer.employees && (
                      <>
                        <span className="text-navy/20">·</span>
                        <Users size={12} />
                        <span>{developer.employees} موظف</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Stars */}
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className={i < Math.floor(developer.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-navy/20'} />
                    ))}
                  </div>
                  <span className="text-charcoal/40 text-xs mt-0.5">{developer.rating} / 5.0</span>
                </div>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-4 gap-3 p-4 bg-cream rounded-2xl mb-5">
                {[
                  { label: 'مشروع', value: developer.projectsCount, icon: Building2 },
                  { label: 'مكتمل',  value: developer.completedCount, icon: Award },
                  { label: 'وحدة',   value: developer.totalUnits?.toLocaleString(), icon: Home },
                  { label: 'تقييم',  value: developer.rating, icon: Star },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="text-center">
                    <Icon size={14} className="text-brand mx-auto mb-1" />
                    <p className="text-navy font-black text-lg leading-none"
                      style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", letterSpacing: '0.03em' }}>
                      {value}
                    </p>
                    <p className="text-charcoal/40 text-[10px] font-bold uppercase tracking-wider mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Specialty tags */}
              <div className="flex gap-2 flex-wrap mb-5">
                {developer.specialty?.map(s => (
                  <span key={s} className="text-xs bg-brand/8 text-brand border border-brand/20 px-3 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>

              {/* About */}
              {developer.about && (
                <div className="mb-5">
                  <h3 className="text-navy font-bold text-sm mb-2 flex items-center gap-2">
                    <Building2 size={14} className="text-brand" />
                    نبذة عن الشركة
                  </h3>
                  <p className="text-charcoal/70 text-sm leading-relaxed">{developer.about}</p>
                </div>
              )}

              {/* Certifications */}
              {developer.certifications?.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-navy font-bold text-sm mb-2 flex items-center gap-2">
                    <Shield size={14} className="text-brand" />
                    الشهادات والاعتمادات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {developer.certifications.map(cert => (
                      <span key={cert} className="flex items-center gap-1.5 text-xs bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full font-medium">
                        <BadgeCheck size={11} className="text-green-500" />
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Projects */}
              {devProjects.length > 0 && (
                <div className="mb-5">
                  <h3 className="text-navy font-bold text-sm mb-3 flex items-center gap-2">
                    <Building2 size={14} className="text-brand" />
                    المشاريع النشطة
                    <span className="text-charcoal/40 text-xs font-normal">({devProjects.length})</span>
                  </h3>
                  <div className="grid gap-2">
                    {devProjects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => handleViewProject(proj)}
                        className="flex items-center gap-3 p-3 rounded-xl border border-navy/8 hover:border-brand/30 hover:bg-brand/3 transition-all duration-200 text-right w-full group"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          <img src={proj.image} alt={proj.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-navy font-bold text-sm truncate">{proj.name}</p>
                          <p className="text-charcoal/50 text-xs">{proj.city} · {proj.district}</p>
                        </div>
                        <div className="shrink-0 text-left">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                            proj.status === 'مكتمل' ? 'bg-green-50 text-green-700 border-green-200' :
                            proj.status === 'قيد الإنشاء' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{proj.status}</span>
                          <p className="text-charcoal/40 text-[10px] mt-1">{proj.priceFrom?.toLocaleString()} $+</p>
                        </div>
                        <ChevronRight size={14} className="text-charcoal/30 group-hover:text-brand shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Jobs */}
              {devJobs.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-navy font-bold text-sm flex items-center gap-2">
                      <Briefcase size={14} className="text-brand" />
                      وظائف مفتوحة
                    </h3>
                    <Link to="/jobs" className="text-xs text-brand hover:underline flex items-center gap-1">
                      عرض الكل <ExternalLink size={11} />
                    </Link>
                  </div>
                  <div className="grid gap-2">
                    {devJobs.map(job => (
                      <Link
                        key={job.id}
                        to="/jobs"
                        className="flex items-center justify-between p-3 rounded-xl border border-navy/8 hover:border-brand/30 hover:bg-brand/3 transition-all duration-200"
                      >
                        <div>
                          <p className="text-navy font-semibold text-xs">{job.title}</p>
                          <p className="text-charcoal/50 text-[11px] mt-0.5">{job.city} · {job.type}</p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-brand font-bold text-xs">{job.salary}</p>
                          {job.urgent && (
                            <span className="text-[10px] text-red-500 font-bold">عاجل</span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              <div className="border-t border-navy/8 pt-5">
                <h3 className="text-navy font-bold text-sm mb-3">التواصل</h3>
                <div className="flex flex-wrap gap-3">
                  {developer.phone && (
                    <a
                      href={`https://wa.me/${developer.phone.replace(/\s|\+/g, '')}?text=أودّ الاستفسار عن مشاريع ${developer.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      <Phone size={14} />
                      WhatsApp
                    </a>
                  )}
                  {developer.email && (
                    <a
                      href={`mailto:${developer.email}`}
                      className="flex items-center gap-2 border border-navy/15 text-navy hover:border-brand/40 hover:text-brand text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                    >
                      <Mail size={14} />
                      {developer.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
