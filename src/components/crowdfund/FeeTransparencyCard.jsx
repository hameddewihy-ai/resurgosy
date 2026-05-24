import { useState } from 'react';
import { motion } from 'framer-motion';
import { Percent, HelpCircle, ChevronDown, TrendingDown, Shield } from 'lucide-react';

export default function FeeTransparencyCard({ project }) {
  const [simAmount, setSimAmount] = useState(project.minInvestment);
  const [showExplanation, setShowExplanation] = useState(false);

  if (!project.fees) return null;

  const { platform, management, exit } = project.fees;
  const holdYears = project.holdPeriod / 12;

  const platformFeeAmt  = simAmount * platform   / 100;
  const managementTotal = simAmount * management  / 100 * holdYears;
  const exitFeeAmt      = exit > 0 ? simAmount * exit / 100 : 0;
  const totalFees       = platformFeeAmt + managementTotal + exitFeeAmt;

  const traditionalOnetime = simAmount * 0.025;
  const saving = traditionalOnetime - platformFeeAmt;

  return (
    <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <p className="flex items-center gap-1.5 text-xs font-bold text-navy">
          <Percent size={13} className="text-brand" /> هيكل الرسوم الكامل
        </p>
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-[10px] text-charcoal/45 hover:text-brand flex items-center gap-1 transition-colors"
        >
          <HelpCircle size={11} /> كيف تُحسب؟
          <ChevronDown size={10} className={`transition-transform ${showExplanation ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Fee rows */}
      <div className="space-y-3 mb-4">
        {[
          { label: 'رسوم الدخول',            value: platform,    note: 'تُطرح مرة واحدة عند الاستثمار',                    isZero: false },
          { label: 'رسوم الإدارة السنوية',  value: management,  note: `على قيمة الأصول · ${holdYears.toFixed(1)} سنة`,  isZero: false },
          { label: 'رسوم الخروج المبكر',    value: exit,        note: exit > 0 ? 'عبر السوق الثانوي فقط' : 'لا توجد',  isZero: exit === 0 },
        ].map(({ label, value, note, isZero }) => (
          <div key={label} className="flex items-center justify-between">
            <div>
              <p className="text-charcoal/60 text-[11px] font-medium">{label}</p>
              <p className="text-charcoal/35 text-[10px] mt-0.5">{note}</p>
            </div>
            <span className={`font-black text-sm ${isZero ? 'text-green-600' : 'text-navy'}`}>
              {isZero ? 'مجاناً' : `${value}%`}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive fee calculator */}
      <div className="bg-cream/60 rounded-2xl p-3 mb-3 border border-navy/6">
        <p className="text-[10px] font-bold text-charcoal/50 mb-2">احسب رسومك الفعلية</p>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-charcoal/40 text-xs">$</span>
          <input
            type="range"
            min={project.minInvestment}
            max={project.maxInvestment}
            step={500}
            value={simAmount}
            onChange={e => setSimAmount(Number(e.target.value))}
            className="flex-1 accent-brand cursor-pointer"
          />
          <span className="text-navy font-black text-xs w-20 text-right">${simAmount.toLocaleString()}</span>
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'رسوم دخول (مرة واحدة)',              amount: platformFeeAmt },
            { label: `إدارة سنوية × ${holdYears.toFixed(1)} سنة`, amount: managementTotal },
            ...(exitFeeAmt > 0 ? [{ label: 'خروج مبكر (إن طُبِّق)', amount: exitFeeAmt }] : []),
          ].map(({ label, amount }) => (
            <div key={label} className="flex items-center justify-between text-[10px]">
              <span className="text-charcoal/55">{label}</span>
              <span className="text-navy font-bold">${amount.toFixed(0)}</span>
            </div>
          ))}
          <div className="border-t border-navy/8 pt-1.5 flex items-center justify-between">
            <span className="text-charcoal/60 text-xs font-bold">إجمالي الرسوم</span>
            <span className="text-cta font-black text-sm">${totalFees.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* Comparison with traditional */}
      {saving > 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl mb-3">
          <TrendingDown size={13} className="text-green-600 shrink-0" />
          <p className="text-[10px] text-green-700 leading-relaxed">
            الوساطة التقليدية: <strong>${traditionalOnetime.toFixed(0)}</strong> دفعة دخول مقابل <strong>${platformFeeAmt.toFixed(0)}</strong> — توفر <strong>${saving.toFixed(0)}</strong> عند الدخول
          </p>
        </div>
      )}

      {/* Expandable explanation */}
      <motion.div
        initial={false}
        animate={{ height: showExplanation ? 'auto' : 0, opacity: showExplanation ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <div className="pt-3 border-t border-navy/8 space-y-2.5">
          {[
            {
              title: 'رسوم الدخول',
              body: 'تُطرح مرة واحدة فقط من مبلغ الاستثمار عند إتمام العملية. تغطي تكاليف التحقق القانوني وتأسيس SPV وإدراج المستثمر.',
            },
            {
              title: 'رسوم الإدارة السنوية',
              body: 'تُحتسب على قيمة الأصل وتُطرح من العوائد الدورية (وليس من رأس المال) — تغطي إدارة الأصل والتقارير المالية الدورية.',
            },
            {
              title: 'رسوم الخروج المبكر',
              body: exit > 0
                ? 'تُطبَّق فقط عند بيع حصتك في السوق الثانوي قبل انتهاء فترة الاحتجاز. لا رسوم خروج عند الانتهاء الطبيعي للمشروع.'
                : 'لا توجد رسوم خروج مبكر في هذا المشروع.',
            },
          ].map(({ title, body }) => (
            <div key={title} className="flex gap-2 items-start">
              <Shield size={11} className="text-brand shrink-0 mt-0.5" />
              <p className="text-[10px] text-charcoal/60 leading-relaxed">
                <strong className="text-navy">{title}: </strong>{body}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
