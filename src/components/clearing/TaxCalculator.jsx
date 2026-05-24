import { useState } from 'react';
import { Calculator, Info, Printer } from 'lucide-react';

const PROP_TYPES = [
  { id: 'residential', label: 'سكني',               rate: 0.015, example: 'شقة · فيلا · منزل',          color: 'blue'   },
  { id: 'commercial',  label: 'تجاري',               rate: 0.04,  example: 'محل · مكتب · مستودع',        color: 'orange' },
  { id: 'land_in',     label: 'أرض داخل المخطط',     rate: 0.03,  example: 'قطعة أرض ضمن تنظيم البلدية', color: 'green'  },
  { id: 'land_out',    label: 'أرض خارج المخطط',     rate: 0.02,  example: 'أرض زراعية · خارج البلدية',   color: 'teal'   },
];

const TX_CATS = [
  { id: 'sale',   label: 'بيع عادي',             note: 'الضريبة الموحدة حسب نوع العقار — 2025',      exempt: false },
  { id: 'gift',   label: 'هبة / إعارة عائلية',  note: 'معفى 100٪ — أصول وفروع وأزواج',              exempt: true  },
  { id: 'revoke', label: 'نكول عن البيع',        note: 'معفى 100٪ — يشترط إقرار خطي مشترك',          exempt: true  },
];

const RENTAL_RATES = [
  { id: 'res_sy',    label: 'إيجار سكني — مؤجر سوري',       rate: 0,     badge: 'معفى'  },
  { id: 'res_non',   label: 'إيجار سكني — مؤجر غير سوري',   rate: 0.015, badge: null    },
  { id: 'commercial',label: 'إيجار تجاري',                   rate: 0.025, badge: null    },
];

function fmt(n) {
  if (!n && n !== 0) return '—';
  return new Intl.NumberFormat('ar-SY').format(Math.round(n)) + ' ل.س';
}

export default function TaxCalculator() {
  const [mode, setMode]         = useState('sale');   // 'sale' | 'rental'
  const [propType, setPropType] = useState('residential');
  const [txCat, setTxCat]       = useState('sale');
  const [value, setValue]       = useState('');
  const [rentalType, setRentalType] = useState('res_sy');
  const [annualRent, setAnnualRent] = useState('');

  const pt  = PROP_TYPES.find(p => p.id === propType);
  const tc  = TX_CATS.find(t => t.id === txCat);
  const rt  = RENTAL_RATES.find(r => r.id === rentalType);

  const contractVal  = parseFloat(String(value).replace(/,/g, ''))     || 0;
  const annualRentVal = parseFloat(String(annualRent).replace(/,/g, '')) || 0;

  const saleRate    = txCat === 'sale' ? pt.rate : 0;
  const saleTax     = contractVal * saleRate;
  const rentalTax   = annualRentVal * (rt?.rate || 0);

  const hasSaleResult   = contractVal > 0;
  const hasRentalResult = annualRentVal > 0;

  return (
    <div className="space-y-5" dir="rtl">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-cream rounded-xl border border-navy/10">
        {[['sale','ضريبة البيع'],['rental','ضريبة الإيجار']].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === m ? 'bg-white shadow text-navy border border-navy/10' : 'text-charcoal/50 hover:text-navy'}`}>
            {l}
          </button>
        ))}
      </div>

      {/* ── SALE MODE ── */}
      {mode === 'sale' && (
        <>
          {/* Property type */}
          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2">نوع العقار</p>
            <div className="grid grid-cols-2 gap-2">
              {PROP_TYPES.map(p => (
                <button key={p.id} onClick={() => setPropType(p.id)}
                  className={`text-right p-3 rounded-xl border-2 transition-all ${propType === p.id ? 'border-brand bg-brand/5' : 'border-navy/12 hover:border-brand/30 bg-white'}`}>
                  <p className={`text-sm font-bold ${propType === p.id ? 'text-navy' : 'text-charcoal/70'}`}>{p.label}</p>
                  <p className="text-charcoal/45 text-[10px] mt-0.5">{p.example}</p>
                  <p className={`text-xs font-black mt-1.5 ${propType === p.id ? 'text-brand' : 'text-charcoal/40'}`}>
                    {(p.rate * 100).toFixed(1)}٪
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction category */}
          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2">نوع المعاملة</p>
            <div className="space-y-2">
              {TX_CATS.map(t => (
                <button key={t.id} onClick={() => setTxCat(t.id)}
                  className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${txCat === t.id ? 'border-brand bg-brand/5' : 'border-navy/12 hover:border-brand/30 bg-white'}`}>
                  <div className="flex-1">
                    <p className={`text-sm font-bold ${txCat === t.id ? 'text-navy' : 'text-charcoal/70'}`}>{t.label}</p>
                    <p className="text-charcoal/45 text-[10px] mt-0.5">{t.note}</p>
                  </div>
                  {t.exempt && (
                    <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-bold shrink-0">معفى</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Value input */}
          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2">القيمة العقدية الرضائية (ليرة سورية)</p>
            <div className="relative">
              <Calculator size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input type="number" value={value} onChange={e => setValue(e.target.value)}
                placeholder="مثال: 50000000"
                className="w-full pr-9 pl-4 py-3 rounded-xl border border-navy/12 focus:border-brand/40 text-navy text-sm outline-none" />
            </div>
            <p className="text-charcoal/40 text-[10px] mt-1 flex items-center gap-1">
              <Info size={10} />
              القيمة المُصرَّح بها في العقد — يتكافل الطرفان بسداد الضريبة
            </p>
          </div>

          {/* Sale result */}
          {hasSaleResult && (
            <div className={`rounded-2xl border-2 p-5 space-y-4 ${txCat !== 'sale' ? 'border-green-200 bg-green-50/60' : 'border-brand/20 bg-brand/5'}`}>
              {txCat !== 'sale' ? (
                <div className="text-center space-y-1">
                  <p className="text-green-700 font-black text-2xl">إعفاء كامل ✓</p>
                  <p className="text-green-600/80 text-sm">{tc?.note}</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <p className="text-charcoal/60 text-xs mb-1">إجمالي ضريبة البيوع العقارية 2025</p>
                    <p className="text-navy font-black text-3xl">{fmt(saleTax)}</p>
                    <p className="text-brand text-sm font-bold mt-1">{(saleRate * 100).toFixed(1)}٪ من القيمة العقدية</p>
                  </div>
                  <div className="border-t border-brand/15 pt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-[10px] text-charcoal/50 mb-1">القيمة العقدية</p>
                      <p className="text-navy text-sm font-bold">{fmt(contractVal)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal/50 mb-1">حصة البائع</p>
                      <p className="text-navy text-sm font-bold">{fmt(saleTax * 0.5)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-charcoal/50 mb-1">حصة المشتري</p>
                      <p className="text-navy text-sm font-bold">{fmt(saleTax * 0.5)}</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-start gap-2">
                    <Info size={13} className="shrink-0 mt-0.5" />
                    الدائرة المالية تُجري تدقيقاً عشوائياً — مخالفة التصريح تُوجب غرامة مثلي فرق الضريبة
                  </div>
                  <button onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-navy/15 text-charcoal/60 hover:text-navy text-xs font-medium transition-colors">
                    <Printer size={13} />
                    طباعة إيصال الحساب
                  </button>
                </>
              )}
            </div>
          )}

          {!hasSaleResult && (
            <div className="border border-dashed border-navy/20 rounded-2xl p-6 text-center text-charcoal/40 text-sm">
              أدخل القيمة العقدية لحساب الضريبة
            </div>
          )}
        </>
      )}

      {/* ── RENTAL MODE ── */}
      {mode === 'rental' && (
        <>
          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2">نوع الإيجار</p>
            <div className="space-y-2">
              {RENTAL_RATES.map(r => (
                <button key={r.id} onClick={() => setRentalType(r.id)}
                  className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${rentalType === r.id ? 'border-brand bg-brand/5' : 'border-navy/12 hover:border-brand/30 bg-white'}`}>
                  <p className={`flex-1 text-sm font-bold ${rentalType === r.id ? 'text-navy' : 'text-charcoal/70'}`}>{r.label}</p>
                  {r.badge
                    ? <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-bold">{r.badge}</span>
                    : <span className={`text-xs font-black ${rentalType === r.id ? 'text-brand' : 'text-charcoal/40'}`}>{(r.rate * 100).toFixed(1)}٪</span>
                  }
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-charcoal/60 mb-2">بدل الإيجار السنوي (ليرة سورية)</p>
            <div className="relative">
              <Calculator size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input type="number" value={annualRent} onChange={e => setAnnualRent(e.target.value)}
                placeholder="مثال: 2400000"
                className="w-full pr-9 pl-4 py-3 rounded-xl border border-navy/12 focus:border-brand/40 text-navy text-sm outline-none" />
            </div>
          </div>

          {hasRentalResult && (
            <div className={`rounded-2xl border-2 p-5 space-y-3 ${rt?.rate === 0 ? 'border-green-200 bg-green-50/60' : 'border-brand/20 bg-brand/5'}`}>
              {rt?.rate === 0 ? (
                <div className="text-center space-y-1">
                  <p className="text-green-700 font-black text-2xl">إعفاء كامل ✓</p>
                  <p className="text-green-600/80 text-sm">الإيجار السكني لمؤجر سوري معفى بالكامل من الضريبة</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-charcoal/60 text-xs mb-1">ضريبة الإيجار السنوية</p>
                  <p className="text-navy font-black text-3xl">{fmt(rentalTax)}</p>
                  <p className="text-brand text-sm font-bold mt-1">{(rt.rate * 100).toFixed(1)}٪ من بدل الإيجار السنوي</p>
                  <p className="text-charcoal/50 text-xs mt-1">يُدفع للدائرة المالية المختصة</p>
                </div>
              )}
            </div>
          )}

          {!hasRentalResult && (
            <div className="border border-dashed border-navy/20 rounded-2xl p-6 text-center text-charcoal/40 text-sm">
              أدخل بدل الإيجار السنوي لحساب الضريبة
            </div>
          )}
        </>
      )}

      {/* Legal note */}
      <div className="text-[10px] text-charcoal/35 text-center leading-relaxed">
        استناداً إلى إصلاحات وزارة المالية تموز-آب 2025 — القيمة العقدية الرضائية
      </div>
    </div>
  );
}
