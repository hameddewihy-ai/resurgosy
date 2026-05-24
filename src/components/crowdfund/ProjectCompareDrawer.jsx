import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Scale } from 'lucide-react';
import { CROWD_PROJECTS, RISK_LABELS, fundingPct } from '../../data/crowdfundData';

const ROWS = [
  { label: 'العائد السنوي',      getValue: p => p.expectedAnnualReturn,                   format: v => `${v}%`,                    better: 'higher'     },
  { label: 'مستوى المخاطرة',     getValue: p => ({ low: 1, medium: 2, high: 3 })[p.riskLevel], format: (_, p) => RISK_LABELS[p.riskLevel], better: 'lower'  },
  { label: 'فترة الاحتجاز',      getValue: p => p.holdPeriod,                              format: v => `${v} شهر`,                 better: 'lower'      },
  { label: 'الحد الأدنى',        getValue: p => p.minInvestment,                            format: v => `$${v.toLocaleString()}`,   better: 'lower'      },
  { label: 'نسبة التمويل',       getValue: p => fundingPct(p.raisedAmount, p.targetAmount),  format: v => `${v}%`,                    better: 'higher'     },
  { label: 'المستثمرون',         getValue: p => p.investorsCount,                           format: v => v.toLocaleString(),          better: 'higher'     },
  { label: 'رسوم الدخول',        getValue: p => p.fees?.platform || 0,                      format: v => `${v}%`,                    better: 'lower'      },
  { label: 'رسوم الإدارة',       getValue: p => p.fees?.management || 0,                    format: v => `${v}%`,                    better: 'lower'      },
  { label: 'نسبة الإنجاز',       getValue: p => p.constructionProgress,                     format: v => `${v}%`,                    better: 'higher'     },
  { label: 'نوع المشروع',        getValue: p => p.type,                                     format: v => v,                           better: null         },
  { label: 'المدينة',            getValue: p => p.city,                                     format: v => v,                           better: null         },
];

function getWinner(row, p1, p2) {
  if (!row.better) return null;
  const v1 = row.getValue(p1);
  const v2 = row.getValue(p2);
  if (v1 === v2) return null;
  return (row.better === 'higher' ? v1 > v2 : v1 < v2) ? 1 : 2;
}

export default function ProjectCompareDrawer({ isOpen, onClose, project }) {
  const [compareId, setCompareId] = useState('');

  const compareProject = useMemo(
    () => compareId ? CROWD_PROJECTS.find(p => String(p.id) === compareId) : null,
    [compareId]
  );

  const scores = useMemo(() => {
    if (!compareProject) return [0, 0];
    let s1 = 0, s2 = 0;
    ROWS.forEach(row => {
      const w = getWinner(row, project, compareProject);
      if (w === 1) s1++;
      if (w === 2) s2++;
    });
    return [s1, s2];
  }, [project, compareProject]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[70]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-[71] max-h-[88vh] flex flex-col"
            dir="rtl"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1 bg-navy/15 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-3 border-b border-navy/8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-brand" />
                <p className="text-navy font-black text-sm">مقارنة المشاريع</p>
                {compareProject && (
                  <span className="text-[10px] text-charcoal/40">
                    · النقاط {scores[0]} vs {scores[1]}
                  </span>
                )}
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40">
                <X size={16} />
              </button>
            </div>

            {/* Project selector */}
            <div className="px-6 py-3 border-b border-navy/6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-brand/5 border border-brand/20 rounded-xl px-3 py-2 text-center">
                  <p className="text-brand font-bold text-xs truncate">{project.title.split('—')[0].trim()}</p>
                  <p className="text-brand/60 text-[10px]">{project.expectedAnnualReturn}% عائد</p>
                </div>
                <Scale size={14} className="text-charcoal/25 shrink-0" />
                <div className="flex-1">
                  <select
                    value={compareId}
                    onChange={e => setCompareId(e.target.value)}
                    className="w-full text-xs border border-navy/15 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-brand/40"
                  >
                    <option value="">اختر مشروعاً للمقارنة</option>
                    {CROWD_PROJECTS.filter(p => p.id !== project.id).map(p => (
                      <option key={p.id} value={String(p.id)}>
                        {p.title.split('—')[0].trim()} ({p.expectedAnnualReturn}%)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Comparison table */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {!compareProject ? (
                <div className="text-center py-12">
                  <Scale size={40} className="text-charcoal/12 mx-auto mb-3" />
                  <p className="text-charcoal/40 text-sm">اختر مشروعاً من القائمة للمقارنة</p>
                </div>
              ) : (
                <>
                  {/* Score summary */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className={`p-2 rounded-xl border ${scores[0] > scores[1] ? 'bg-green-50 border-green-200' : 'bg-navy/3 border-navy/10'}`}>
                      <p className={`font-black text-lg ${scores[0] > scores[1] ? 'text-green-700' : 'text-charcoal/50'}`}>{scores[0]}</p>
                      <p className="text-[9px] text-charcoal/45 truncate">{project.title.split('—')[0].trim()}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-charcoal/25 text-sm font-bold">vs</span>
                    </div>
                    <div className={`p-2 rounded-xl border ${scores[1] > scores[0] ? 'bg-green-50 border-green-200' : 'bg-navy/3 border-navy/10'}`}>
                      <p className={`font-black text-lg ${scores[1] > scores[0] ? 'text-green-700' : 'text-charcoal/50'}`}>{scores[1]}</p>
                      <p className="text-[9px] text-charcoal/45 truncate">{compareProject.title.split('—')[0].trim()}</p>
                    </div>
                  </div>

                  {/* Row-by-row comparison */}
                  <div className="space-y-1">
                    {ROWS.map((row, i) => {
                      const v1  = row.getValue(project);
                      const v2  = row.getValue(compareProject);
                      const win = getWinner(row, project, compareProject);
                      return (
                        <motion.div
                          key={row.label}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.025 }}
                          className="grid grid-cols-3 gap-2 py-2 border-b border-navy/5 last:border-0 items-center"
                        >
                          <div className={`text-center text-xs font-bold py-1.5 px-2 rounded-xl ${win === 1 ? 'bg-green-50 text-green-700' : 'text-charcoal/65'}`}>
                            {row.format(v1, project)}
                          </div>
                          <div className="text-center text-[10px] text-charcoal/40 font-medium">{row.label}</div>
                          <div className={`text-center text-xs font-bold py-1.5 px-2 rounded-xl ${win === 2 ? 'bg-green-50 text-green-700' : 'text-charcoal/65'}`}>
                            {row.format(v2, compareProject)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-charcoal/30 text-center mt-3">الخلايا الخضراء = القيمة الأفضل للمستثمر</p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
