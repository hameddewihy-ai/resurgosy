import { Check } from 'lucide-react';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10" dir="rtl">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            {/* Node */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                ${done   ? 'bg-brand border-brand text-white'
                : active ? 'bg-navy border-brand text-brand shadow-lg shadow-brand/30'
                : 'bg-slate-800 border-slate-600 text-slate-500'}`}>
                {done ? <Check size={16} strokeWidth={3} /> : <span>{i + 1}</span>}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-brand' : done ? 'text-slate-300' : 'text-slate-600'}`}>
                {step}
              </span>
            </div>
            {/* Connector */}
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 transition-all duration-500 ${done ? 'bg-brand' : 'bg-slate-700'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
