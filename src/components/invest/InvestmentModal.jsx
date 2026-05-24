import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Crown, Wallet, AlertCircle, CheckCircle,
  TrendingUp, Calendar, Percent, Lock, ArrowLeft, BadgeCheck, Shield,
} from 'lucide-react';
import { useGlobalData } from '../../context/GlobalContext';
import KYCGate from './KYCGate';
import toast from 'react-hot-toast';

// ── Preset amounts ───────────────────────────────────────────────────────────
const PRESETS = [10000, 25000, 50000, 100000];

function isKYCVerified() {
  try { return !!JSON.parse(localStorage.getItem('resurgo-kyc'))?.verified; }
  catch { return false; }
}

// DCF projection: 40% annual dist + 60% capital appreciation (matches InvestPage model)
const DIST_RATIO = 0.4;
function projectReturns(amount, irrPct, years = 5) {
  const annualDist = amount * (irrPct / 100) * DIST_RATIO;
  const capGainRate = (irrPct / 100) * (1 - DIST_RATIO);
  const exitValue = amount * Math.pow(1 + capGainRate, years);
  const fv = Math.round(annualDist * years + exitValue);
  const profit = fv - amount;
  return { fv, profit, roi: ((profit / amount) * 100).toFixed(1), annualDist: Math.round(annualDist) };
}

export default function InvestmentModal({ isOpen, onClose, project }) {
  const { wallet, investInProject } = useGlobalData();
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'confirm' | 'success'
  const [kycDone, setKycDone] = useState(isKYCVerified);
  const [showKYC, setShowKYC] = useState(false);

  const available = wallet.totalBalance - wallet.escrowBalance;
  const numAmount = Number(String(amount).replace(/,/g, '')) || 0;
  const isEnough = numAmount <= available;
  const isBelowMin = project && numAmount > 0 && numAmount < project.minInvest;
  const isValid = numAmount > 0 && isEnough && !isBelowMin;

  // DCF-based projection (uses same model as InvestPage calculator)
  const projection = useMemo(() => {
    if (!project || numAmount <= 0) return null;
    return projectReturns(numAmount, project.irr, 5);
  }, [project, numAmount]);

  const handleClose = () => {
    setStep('input');
    setAmount('');
    setShowKYC(false);
    onClose();
  };

  const handleConfirm = () => {
    if (!isValid) return;
    investInProject(project.id, numAmount);
    setStep('success');
    setTimeout(() => {
      toast.success(`تم حجز استثمارك بنجاح في "${project.title}" ✅`);
      handleClose();
    }, 2200);
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-x-4 top-[6vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[480px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[88vh] overflow-y-auto"
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-gradient-to-l from-brand/10 to-navy/5 px-6 py-5 border-b border-navy/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand to-navy flex items-center justify-center">
                  <TrendingUp size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-navy font-black text-sm flex items-center gap-1.5">
                    استثمار في المشروع
                    {kycDone && <BadgeCheck size={14} className="text-emerald-500" title="مستثمر معتمد KYC" />}
                  </p>
                  <p className="text-charcoal/50 text-xs truncate max-w-[200px]">{project.title}</p>
                </div>
              </div>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 hover:text-navy transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">

              {/* KYC gate — must verify before investing */}
              {!kycDone ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 py-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mx-auto">
                    <Shield size={32} className="text-brand" />
                  </div>
                  <div>
                    <h3 className="text-navy font-black text-lg mb-2">التحقق من الهوية مطلوب</h3>
                    <p className="text-charcoal/55 text-sm leading-relaxed max-w-xs mx-auto">
                      للاستثمار في المشاريع المطروحة يجب إتمام عملية التحقق من الهوية (KYC) وإقرار المخاطر الاستثمارية أولاً.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowKYC(true)}
                    className="bg-gradient-to-l from-brand to-navy text-white font-black text-sm px-8 py-3 rounded-2xl flex items-center gap-2 mx-auto shadow-lg shadow-brand/20 hover:-translate-y-0.5 transition-all"
                  >
                    <BadgeCheck size={16} /> ابدأ التحقق الآن
                  </button>
                  <p className="text-charcoal/35 text-[10px]">يستغرق التحقق دقيقتين فقط · مرة واحدة فقط</p>
                </motion.div>
              ) : (
              <>

              {/* Step: Input */}
              {step === 'input' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">

                  {/* Project KPIs */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: Percent, label: 'IRR', value: `${project.irr}%`, color: 'text-emerald-600' },
                      { icon: TrendingUp, label: 'عائد', value: `${project.roi}%`, color: 'text-brand' },
                      { icon: Calendar, label: 'استرداد', value: `${project.payback}ys`, color: 'text-amber-600' },
                    ].map(({ icon: Icon, label, value, color }) => (
                      <div key={label} className="bg-cream rounded-2xl p-3 text-center">
                        <Icon size={14} className={`${color} mx-auto mb-1`} />
                        <p className={`font-black text-sm ${color}`}>{value}</p>
                        <p className="text-charcoal/50 text-[10px]">{label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Wallet balance */}
                  <div className="flex items-center justify-between bg-cream rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-charcoal/60 text-xs">
                      <Wallet size={14} className="text-brand" />
                      الرصيد المتاح
                    </div>
                    <span className="font-black text-navy text-sm">${available.toLocaleString()}</span>
                  </div>

                  {/* Preset amounts */}
                  <div>
                    <p className="text-xs text-charcoal/50 mb-2 font-medium">مبالغ مقترحة</p>
                    <div className="grid grid-cols-4 gap-2">
                      {PRESETS.map(p => (
                        <button key={p}
                          onClick={() => setAmount(p)}
                          className={`text-xs py-2 rounded-xl border font-bold transition-all ${numAmount === p ? 'bg-brand text-white border-brand' : 'border-navy/12 text-charcoal/60 hover:border-brand/40 hover:text-brand'}`}>
                          ${(p / 1000).toFixed(0)}K
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="text-xs font-bold text-charcoal/60 block mb-2">مبلغ الاستثمار (USD)</label>
                    <div className="relative">
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-bold text-sm">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && isValid) setStep('confirm'); }}
                        placeholder={`الحد الأدنى $${project.minInvest.toLocaleString()}`}
                        className={`w-full pr-8 pl-4 py-3.5 rounded-2xl border text-sm font-bold text-navy outline-none transition-all ${
                          numAmount > 0
                            ? isValid
                              ? 'border-emerald-400 bg-emerald-50/50 focus:border-emerald-500'
                              : 'border-red-300 bg-red-50/50 focus:border-red-400'
                            : 'border-navy/12 bg-cream focus:border-brand'
                        }`}
                      />
                    </div>
                    {/* Validation messages */}
                    {!isEnough && numAmount > 0 && (
                      <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 font-medium">
                        <AlertCircle size={11} /> الرصيد غير كافٍ — يمكنك إيداع المزيد من المحفظة
                      </p>
                    )}
                    {isBelowMin && (
                      <p className="flex items-center gap-1 text-amber-600 text-xs mt-1.5 font-medium">
                        <AlertCircle size={11} /> الحد الأدنى للاستثمار ${project.minInvest.toLocaleString()}
                      </p>
                    )}
                    {isValid && (
                      <p className="flex items-center gap-1 text-emerald-600 text-xs mt-1.5 font-medium">
                        <CheckCircle size={11} /> المبلغ صالح للاستثمار
                      </p>
                    )}
                  </div>

                  {/* ROI projection */}
                  {projection && isValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      className="bg-gradient-to-l from-brand/5 to-emerald-50 border border-brand/15 rounded-2xl p-4"
                    >
                      <p className="text-xs font-bold text-charcoal/60 mb-3 flex items-center gap-1">
                        <TrendingUp size={12} className="text-brand" /> توقعات العائد خلال 5 سنوات
                      </p>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <p className="text-navy font-black text-sm">${projection.fv.toLocaleString()}</p>
                          <p className="text-charcoal/50 text-[10px]">القيمة النهائية</p>
                        </div>
                        <div>
                          <p className="text-emerald-600 font-black text-sm">+${projection.profit.toLocaleString()}</p>
                          <p className="text-charcoal/50 text-[10px]">الربح الصافي</p>
                        </div>
                        <div>
                          <p className="text-brand font-black text-sm">{projection.roi}%</p>
                          <p className="text-charcoal/50 text-[10px]">العائد الإجمالي</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action button */}
                  <button
                    onClick={() => isValid && setStep('confirm')}
                    disabled={!isValid}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                      isValid
                        ? 'bg-gradient-to-l from-brand to-navy text-white shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5'
                        : 'bg-navy/10 text-charcoal/30 cursor-not-allowed'
                    }`}
                  >
                    <Crown size={15} />
                    تأكيد الاستثمار
                    <ArrowLeft size={15} />
                  </button>
                </motion.div>
              )}

              {/* Step: Confirm */}
              {step === 'confirm' && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <div className="text-center py-2">
                    <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                      <Lock size={28} className="text-amber-500" />
                    </div>
                    <h3 className="text-navy font-black text-lg mb-1">تأكيد الاستثمار</h3>
                    <p className="text-charcoal/50 text-xs">ستُحجز الأموال في نظام Escrow الآمن</p>
                  </div>

                  <div className="bg-cream rounded-2xl divide-y divide-navy/6">
                    {[
                      ['المشروع', project.title],
                      ['مبلغ الاستثمار', `$${numAmount.toLocaleString()}`],
                      ['الرصيد بعد الاستثمار', `$${(available - numAmount).toLocaleString()}`],
                      ['الحالة', 'محجوز في Escrow 🔒'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-3 text-sm">
                        <span className="text-charcoal/50 text-xs">{k}</span>
                        <span className="text-navy font-bold text-xs">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep('input')} className="flex-1 py-3.5 rounded-2xl border border-navy/12 text-charcoal/60 text-sm font-bold hover:bg-cream transition-colors">
                      رجوع
                    </button>
                    <button
                      onClick={handleConfirm}
                      onKeyDown={e => { if (e.key === 'Enter') handleConfirm(); }}
                      autoFocus
                      className="flex-1 py-3.5 rounded-2xl bg-gradient-to-l from-brand to-navy text-white text-sm font-black flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-brand/20"
                    >
                      <CheckCircle size={15} /> تأكيد نهائي
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step: Success */}
              {step === 'success' && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-5"
                  >
                    <CheckCircle size={36} className="text-emerald-500" />
                  </motion.div>
                  <h3 className="text-navy font-black text-xl mb-2">تم الاستثمار بنجاح! 🎉</h3>
                  <p className="text-charcoal/50 text-sm mb-1">تم حجز <span className="text-navy font-bold">${numAmount.toLocaleString()}</span></p>
                  <p className="text-charcoal/50 text-xs">ستجد المعاملة في محفظتك قيد المراجعة (Escrow)</p>
                </motion.div>
              )}

              </>
              )} {/* end kycDone ternary */}

            </div>

            {/* VIP badge if project is VIP */}
            {project.vip && kycDone && step === 'input' && (
              <div className="px-6 pb-5">
                <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  <Crown size={11} className="text-amber-500" />
                  هذا المشروع VIP — متاح للمستثمرين المعتمدين فقط
                </div>
              </div>
            )}
          </motion.div>

          {/* KYC modal — rendered outside the investment modal card */}
          <KYCGate
            isOpen={showKYC}
            onComplete={() => { setKycDone(true); setShowKYC(false); }}
            onClose={() => setShowKYC(false)}
          />
        </>
      )}
    </AnimatePresence>
  );
}
