import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ChevronDown, Info } from 'lucide-react';

const MODES = [
  { id: 'murabaha', label: 'مرابحة', desc: 'بيع بالتقسيط بهامش ربح محدد مسبقاً' },
  { id: 'ijara',   label: 'إجارة',   desc: 'تأجير تمويلي مع خيار التملك' },
];

function fmtNum(n) {
  return isNaN(n) ? '—' : Math.round(n).toLocaleString('ar-SA');
}

function MurabahaCalc() {
  const [price,    setPrice]    = useState('150000');
  const [down,     setDown]     = useState('30');
  const [margin,   setMargin]   = useState('12');
  const [years,    setYears]    = useState('10');

  const calc = useMemo(() => {
    const P   = parseFloat(price)   || 0;
    const dp  = (parseFloat(down)   || 0) / 100;
    const m   = (parseFloat(margin) || 0) / 100;
    const y   = parseFloat(years)   || 1;
    const financed   = P * (1 - dp);
    const totalProfit = financed * m * y;
    const totalRepay  = financed + totalProfit;
    const monthly     = totalRepay / (y * 12);
    return { financed, totalProfit, totalRepay, monthly, downAmt: P * dp };
  }, [price, down, margin, years]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">قيمة العقار ($)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)}
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">الدفعة الأولى (%)</label>
          <input type="number" value={down} onChange={e => setDown(e.target.value)} min="0" max="90"
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">هامش الربح السنوي (%)</label>
          <input type="number" value={margin} onChange={e => setMargin(e.target.value)} min="0" max="30" step="0.5"
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">مدة السداد (سنوات)</label>
          <select value={years} onChange={e => setYears(e.target.value)}
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand">
            {[5,7,10,15,20,25].map(y => <option key={y} value={y}>{y} سنة</option>)}
          </select>
        </div>
      </div>

      <div className="bg-cream rounded-2xl p-4 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">المبلغ الممول</p>
          <p className="text-navy font-black text-lg">${fmtNum(calc.financed)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">الدفعة الأولى</p>
          <p className="text-navy font-black text-lg">${fmtNum(calc.downAmt)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">إجمالي هامش الربح</p>
          <p className="text-cta font-black text-lg">${fmtNum(calc.totalProfit)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">إجمالي السداد</p>
          <p className="text-brand font-black text-lg">${fmtNum(calc.totalRepay)}</p>
        </div>
      </div>

      <div className="bg-brand text-white rounded-2xl p-4 text-center">
        <p className="text-white/60 text-xs mb-1">القسط الشهري</p>
        <p className="font-black text-3xl">${fmtNum(calc.monthly)}</p>
        <p className="text-white/50 text-[10px] mt-0.5">لمدة {years} سنة · {parseInt(years) * 12} قسطاً</p>
      </div>
    </div>
  );
}

function IjaraCalc() {
  const [assetVal,  setAssetVal]  = useState('200000');
  const [rentPct,   setRentPct]   = useState('8');
  const [years,     setYears]     = useState('15');
  const [ownOption, setOwnOption] = useState('10');

  const calc = useMemo(() => {
    const A   = parseFloat(assetVal)  || 0;
    const r   = (parseFloat(rentPct)  || 0) / 100;
    const y   = parseFloat(years)     || 1;
    const oo  = parseFloat(ownOption) || 0;
    const annualRent  = A * r;
    const monthly     = annualRent / 12;
    const totalPaid   = annualRent * y;
    const buyoutPrice = A * (oo / 100);
    return { annualRent, monthly, totalPaid, buyoutPrice };
  }, [assetVal, rentPct, years, ownOption]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">قيمة الأصل ($)</label>
          <input type="number" value={assetVal} onChange={e => setAssetVal(e.target.value)}
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">نسبة الإيجار السنوي (%)</label>
          <input type="number" value={rentPct} onChange={e => setRentPct(e.target.value)} min="0" max="20" step="0.5"
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">مدة الإجارة (سنوات)</label>
          <select value={years} onChange={e => setYears(e.target.value)}
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand">
            {[5,7,10,15,20].map(y => <option key={y} value={y}>{y} سنة</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-charcoal/60 font-medium block mb-1">سعر خيار الشراء (%)</label>
          <input type="number" value={ownOption} onChange={e => setOwnOption(e.target.value)} min="0" max="100" step="5"
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy focus:outline-none focus:border-brand" />
        </div>
      </div>

      <div className="bg-cream rounded-2xl p-4 grid grid-cols-2 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">الإيجار السنوي</p>
          <p className="text-navy font-black text-lg">${fmtNum(calc.annualRent)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-charcoal/50 mb-0.5">إجمالي الأقساط</p>
          <p className="text-cta font-black text-lg">${fmtNum(calc.totalPaid)}</p>
        </div>
        <div className="col-span-2 text-center border-t border-navy/8 pt-3">
          <p className="text-[10px] text-charcoal/50 mb-0.5">سعر خيار التملك النهائي</p>
          <p className="text-brand font-black text-xl">${fmtNum(calc.buyoutPrice)}</p>
        </div>
      </div>

      <div className="bg-brand text-white rounded-2xl p-4 text-center">
        <p className="text-white/60 text-xs mb-1">القسط الشهري</p>
        <p className="font-black text-3xl">${fmtNum(calc.monthly)}</p>
        <p className="text-white/50 text-[10px] mt-0.5">إيجار تمويلي · {years} سنة</p>
      </div>
    </div>
  );
}

export default function IslamicFinanceCalc() {
  const [mode,    setMode]    = useState('murabaha');
  const [open,    setOpen]    = useState(false);

  return (
    <div className="bg-white overflow-hidden shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg" dir="rtl">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-cream/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/15 flex items-center justify-center">
            <Calculator size={17} className="text-brand" />
          </div>
          <div className="text-right">
            <p className="text-navy font-bold text-sm">حاسبة التمويل الإسلامي</p>
            <p className="text-charcoal/45 text-xs">مرابحة · إجارة منتهية بالتمليك</p>
          </div>
        </div>
        <ChevronDown size={18} className={`text-charcoal/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Mode tabs */}
              <div className="flex bg-cream rounded-xl p-0.5 gap-0.5">
                {MODES.map(m => (
                  <button key={m.id} onClick={() => setMode(m.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${
                      mode === m.id ? 'bg-white text-navy shadow-sm' : 'text-charcoal/60 hover:text-navy'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-start gap-2 bg-brand/5 border border-brand/15 rounded-xl p-3">
                <Info size={14} className="text-brand shrink-0 mt-0.5" />
                <p className="text-xs text-charcoal/60 leading-relaxed">
                  {MODES.find(m => m.id === mode)?.desc} — حلال وفق معايير AAOIFI
                </p>
              </div>

              {mode === 'murabaha' ? <MurabahaCalc /> : <IjaraCalc />}

              <p className="text-[10px] text-charcoal/30 text-center">
                الأرقام تقديرية للمقارنة فقط · استشر مستشارك المالي
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
