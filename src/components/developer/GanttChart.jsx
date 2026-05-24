import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, Calendar, CheckCircle, Clock, AlertTriangle,
  Circle, BarChart3, User, Download,
} from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';

// ── Month labels ──────────────────────────────────────────────────────────────
const MONTHS = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
                 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const YEAR = 2026;
const TOTAL_DAYS = 365;

// Status config
const STATUS_CFG = {
  completed: {
    label: 'مكتمل',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  ongoing: {
    label: 'جارٍ',
    bar: 'bg-brand',
    dot: 'bg-brand',
    text: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Clock,
  },
  delayed: {
    label: 'متأخر',
    bar: 'bg-red-500',
    dot: 'bg-red-500',
    text: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
  },
  scheduled: {
    label: 'مجدول',
    bar: 'bg-slate-300',
    dot: 'bg-slate-300',
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: Circle,
  },
};

// Convert date string "YYYY-MM-DD" to day-of-year (1-365)
function dayOfYear(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(YEAR, 0, 1);
  const diff = d - start;
  return Math.max(1, Math.round(diff / 86400000) + 1);
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ task, visible }) {
  if (!visible) return null;
  const cfg = STATUS_CFG[task.status] || STATUS_CFG.scheduled;
  const Icon = cfg.icon;
  return (
    <div className={`absolute z-30 bottom-full mb-2 right-0 w-56 p-3 rounded-2xl shadow-xl border ${cfg.bg} ${cfg.border} pointer-events-none`}>
      <p className="text-navy font-black text-xs mb-1">{task.name}</p>
      <div className="space-y-1 text-[10px]">
        <div className="flex items-center gap-1.5 text-charcoal/60">
          <User size={10} /> {task.responsible}
        </div>
        <div className="flex items-center gap-1.5 text-charcoal/60">
          <Calendar size={10} /> {task.start} → {task.end}
        </div>
        <div className="flex items-center gap-1.5">
          <Icon size={10} className={cfg.text} />
          <span className={`font-bold ${cfg.text}`}>{task.progress}% — {cfg.label}</span>
        </div>
      </div>
      {/* Arrow */}
      <div className={`absolute -bottom-1.5 right-4 w-3 h-3 rotate-45 border-b border-r ${cfg.border} ${cfg.bg}`} />
    </div>
  );
}

// ── Gantt Row ─────────────────────────────────────────────────────────────────
function GanttRow({ task, rowIndex }) {
  const [hovered, setHovered] = useState(false);
  const cfg = STATUS_CFG[task.status] || STATUS_CFG.scheduled;


  const startDay = dayOfYear(task.start);
  const endDay   = dayOfYear(task.end);
  const leftPct  = ((startDay - 1) / TOTAL_DAYS) * 100;
  const widthPct = Math.max(1, ((endDay - startDay) / TOTAL_DAYS) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rowIndex * 0.06 }}
      className="grid grid-cols-[200px_1fr] gap-0 border-b border-navy/5 hover:bg-cream/30 transition-colors"
    >
      {/* Task label */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-l border-navy/5 shrink-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <div className="min-w-0">
          <p className="text-navy font-bold text-xs truncate">{task.name}</p>
          <p className="text-charcoal/40 text-[9px] truncate">{task.responsible}</p>
        </div>
        <span className={`mr-auto shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          {task.progress}%
        </span>
      </div>

      {/* Timeline bar */}
      <div className="relative h-12 flex items-center" style={{ minWidth: 0 }}>
        {/* Month grid lines */}
        {MONTHS.map((_, mi) => (
          <div key={mi}
            className="absolute top-0 bottom-0 border-r border-navy/5"
            style={{ left: `${(mi / 12) * 100}%` }}
          />
        ))}

        {/* The bar */}
        <div
          className="absolute"
          style={{ left: `${leftPct}%`, width: `${widthPct}%`, paddingInline: '2px' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative">
            {/* Background track */}
            <div className={`h-6 rounded-full ${cfg.bar} opacity-20`} />
            {/* Progress fill */}
            <motion.div
              className={`h-6 rounded-full ${cfg.bar} absolute top-0 left-0`}
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.8, delay: rowIndex * 0.08, ease: 'easeOut' }}
              style={{ maxWidth: '100%' }}
            />
            <Tooltip task={task} visible={hovered} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main GanttChart ───────────────────────────────────────────────────────────
export default function GanttChart() {
  const { projects, ganttTasks } = useGlobalData();
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  const currentMonth = new Date().getMonth(); // 0-indexed

  const tasks = useMemo(() => {
    return (ganttTasks || []).filter(t => t.projectId === selectedProjectId);
  }, [ganttTasks, selectedProjectId]);

  // Summary counts
  const counts = useMemo(() => ({
    completed: tasks.filter(t => t.status === 'completed').length,
    ongoing:   tasks.filter(t => t.status === 'ongoing').length,
    delayed:   tasks.filter(t => t.status === 'delayed').length,
    scheduled: tasks.filter(t => t.status === 'scheduled').length,
  }), [tasks]);

  const overallProgress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(tasks.reduce((s, t) => s + t.progress, 0) / tasks.length);
  }, [tasks]);

  return (
    <div className="space-y-5">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-navy">الجدولة الزمنية (Gantt)</h2>
          <p className="text-xs text-charcoal/50 mt-0.5">مراحل البناء والمهام التشغيلية — {YEAR}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Project selector */}
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(Number(e.target.value))}
              className="appearance-none bg-cream border border-navy/10 rounded-xl pr-4 pl-9 py-2 text-xs font-bold text-navy focus:outline-none focus:border-brand cursor-pointer"
            >
              {projects.filter(p => p.developerId === 1).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
          </div>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border border-navy/10 rounded-xl text-charcoal/60 hover:text-navy hover:border-brand/30 transition-colors"
          >
            <Download size={13} /> تصدير
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(STATUS_CFG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className={`rounded-2xl border p-3 flex items-center gap-3 ${cfg.bg} ${cfg.border}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cfg.bar} bg-opacity-20`}>
                <Icon size={16} className={cfg.text} />
              </div>
              <div>
                <p className={`text-lg font-black ${cfg.text}`}>{counts[key]}</p>
                <p className="text-[10px] text-charcoal/50">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall progress */}
      <div className="bg-white border border-navy/8 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-charcoal/60 flex items-center gap-1.5">
            <BarChart3 size={13} className="text-brand" /> الإنجاز الإجمالي للمشروع
          </span>
          <span className="text-navy font-black text-sm">{overallProgress}%</span>
        </div>
        <div className="h-2.5 bg-navy/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-brand to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Gantt Table */}
      <div className="bg-white border border-navy/8 rounded-2xl overflow-hidden">
        {/* Month headers */}
        <div className="grid grid-cols-[200px_1fr] border-b border-navy/8 bg-cream/50">
          <div className="px-4 py-2.5 text-xs font-black text-charcoal/50 uppercase tracking-wide border-l border-navy/8">
            المرحلة / المهمة
          </div>
          <div className="relative">
            <div className="grid grid-cols-12 h-full">
              {MONTHS.map((month, mi) => (
                <div key={mi}
                  className={`text-center py-2.5 text-[9px] font-bold border-l border-navy/5 first:border-l-0 ${mi === currentMonth ? 'text-brand bg-brand/5' : 'text-charcoal/40'}`}>
                  {month.slice(0, 3)}
                  {mi === currentMonth && (
                    <div className="absolute top-0 bottom-0 w-0.5 bg-brand/40"
                      style={{ left: `${((mi + 0.5) / 12) * 100}%` }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task rows */}
        {tasks.length === 0 ? (
          <div className="py-16 text-center text-charcoal/40">
            <Calendar size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">لا توجد مراحل مضافة لهذا المشروع</p>
          </div>
        ) : (
          tasks.map((task, i) => <GanttRow key={task.id} task={task} rowIndex={i} />)
        )}

        {/* Legend */}
        <div className="px-4 py-3 border-t border-navy/5 bg-cream/30 flex flex-wrap gap-4">
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${cfg.bar}`} />
              <span className="text-[10px] text-charcoal/50">{cfg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 mr-auto">
            <div className="w-0.5 h-4 bg-brand/50 rounded-full" />
            <span className="text-[10px] text-charcoal/50">الشهر الحالي</span>
          </div>
        </div>
      </div>
    </div>
  );
}
