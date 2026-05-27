import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowUpRight, ArrowDownRight, ShieldCheck,
  Lock, Activity, CheckCircle, Clock, Plus,
  History, Building2, Wrench, HardHat, X,
  Landmark, Smartphone, Banknote, TrendingUp, Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGlobalData } from '../../context/GlobalContext';
import SEO from '../../components/SEO';
import toast from 'react-hot-toast';
import { sendAdminAlert } from '../../utils/emailService';
import HandoverProtocolModal from '../../components/contracts/HandoverProtocolModal';

// ── Type icon map ────────────────────────────────────────────────────────────
const TRX_ICON = {
  escrow_hold: { icon: Lock,          color: 'text-amber-500',  bg: 'bg-amber-50'   },
  release:     { icon: HardHat,       color: 'text-brand',      bg: 'bg-brand/10'   },
  deposit:     { icon: ArrowDownRight,color: 'text-green-500',  bg: 'bg-green-50'   },
  withdrawal:  { icon: ArrowUpRight,  color: 'text-navy',       bg: 'bg-navy/5'     },
  earning:     { icon: Building2,     color: 'text-green-500',  bg: 'bg-green-50'   },
  default:     { icon: Wrench,        color: 'text-charcoal/50',bg: 'bg-cream'      },
};

// ── Deposit Modal ────────────────────────────────────────────────────────────
function DepositModal({ isOpen, onClose, onDeposit }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);

  const METHODS = [
    { id: 'hawalat', title: 'حوالات الهرم / الفؤاد', desc: 'إيداع نقدي عبر الحوالات المحلية', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'syriatel', title: 'سيريتل كاش', desc: 'تحويل من محفظة الدفع الإلكتروني', icon: Smartphone, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'bemo', title: 'بنك بيمو السعودي الفرنسي', desc: 'حوالة بنكية محلية', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const handleTopUp = () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('أدخل مبلغاً صحيحاً');
    if (!method) return toast.error('اختر طريقة الشحن');
    onDeposit(num, method.title);
    toast('تم استلام طلب الإيداع — سيتم المراجعة اليدوية والإضافة لرصيدك خلال 24 ساعة', { icon: '⏳', duration: 7000 });
    setAmount('');
    setMethod(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 22 }}
            className="fixed inset-x-4 top-[15vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[440px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
            dir="rtl"
          >
            <div className="px-6 py-5 border-b border-navy/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <Plus size={18} className="text-brand" />
                </div>
                <h3 className="text-navy font-black text-sm">شحن الرصيد</h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-charcoal/60 block mb-2">المبلغ المطلوب شحنه (USD)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-bold">$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pr-8 pl-4 py-3.5 rounded-2xl border border-navy/12 bg-cream text-sm font-bold text-navy outline-none focus:border-brand transition-colors" />
                </div>
              </div>

              {/* Methods */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-charcoal/60">طريقة الشحن</p>
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-right transition-all ${method?.id === m.id ? 'border-brand bg-brand/5' : 'border-navy/10 hover:border-brand/30'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.bg} ${m.color}`}>
                      <m.icon size={18} />
                    </div>
                    <div>
                      <p className="text-navy font-bold text-xs">{m.title}</p>
                      <p className="text-charcoal/50 text-[10px]">{m.desc}</p>
                    </div>
                    {method?.id === m.id && <CheckCircle size={16} className="text-brand mr-auto shrink-0" />}
                  </button>
                ))}
              </div>

              <button onClick={handleTopUp}
                className="w-full btn-brand py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 glow-hover shimmer">
                <Plus size={15} /> تأكيد الشحن
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Withdraw Modal ───────────────────────────────────────────────────────────
function WithdrawModal({ isOpen, onClose, onWithdraw, availableBalance }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(null);
  const [details, setDetails] = useState({});

  const METHODS = [
    { id: 'hawalat', title: 'حوالات الهرم / الفؤاد', desc: 'سحب نقدي عبر الحوالات المحلية', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'syriatel', title: 'سيريتل كاش', desc: 'تحويل إلى محفظة الدفع الإلكتروني', icon: Smartphone, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'bemo', title: 'بنك بيمو السعودي الفرنسي', desc: 'حوالة بنكية محلية', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const handleWithdraw = () => {
    const num = Number(amount);
    if (!num || num <= 0) return toast.error('أدخل مبلغاً صحيحاً');
    if (num > availableBalance) return toast.error('المبلغ يتجاوز الرصيد المتاح');
    if (!method) return toast.error('اختر طريقة السحب');
    
    // Simple validation for details
    if (method.id === 'syriatel' && !details.walletNumber) return toast.error('أدخل رقم المحفظة');
    if (method.id === 'hawalat' && !details.fullName) return toast.error('أدخل الاسم الكامل حسب الهوية');
    if (method.id === 'bemo' && !details.iban) return toast.error('أدخل رقم الـ IBAN');

    onWithdraw(num, method.title, details);
    toast.success(`تم تقديم طلب سحب بقيمة $${num.toLocaleString()} بنجاح ✅`);
    
    // إرسال إيميل للإدارة
    sendAdminAlert('hameddewihy@gmail.com', 'طلب سحب أموال جديد', {
      Amount: num + ' USD',
      Method: method.title,
      Details: details
    }).catch(() => {});

    setAmount('');
    setMethod(null);
    setDetails({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', damping: 22 }}
            className="fixed inset-x-4 top-[10vh] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[460px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
            dir="rtl"
          >
            <div className="px-6 py-5 border-b border-navy/8 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-navy/5 flex items-center justify-center">
                  <ArrowUpRight size={18} className="text-navy" />
                </div>
                <h3 className="text-navy font-black text-sm">سحب أموال</h3>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-navy/5 text-charcoal/40 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <Activity size={18} className="text-amber-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-amber-800">الرصيد المتاح للسحب</p>
                  <p className="text-lg font-black text-navy">${availableBalance.toLocaleString()}</p>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-charcoal/60 block mb-2">المبلغ المراد سحبه (USD)</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-bold">$</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pr-8 pl-4 py-3.5 rounded-2xl border border-navy/12 bg-cream text-sm font-bold text-navy outline-none focus:border-brand transition-colors" />
                </div>
              </div>

              {/* Methods */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-charcoal/60">طريقة السحب</p>
                <div className="grid grid-cols-1 gap-2">
                  {METHODS.map(m => (
                    <button key={m.id} onClick={() => setMethod(m)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-right transition-all ${method?.id === m.id ? 'border-brand bg-brand/5' : 'border-navy/10 hover:border-brand/30'}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.bg} ${m.color}`}>
                        <m.icon size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-navy font-bold text-xs">{m.title}</p>
                        <p className="text-charcoal/50 text-[10px]">{m.desc}</p>
                      </div>
                      {method?.id === m.id && <CheckCircle size={16} className="text-brand shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Details */}
              {method && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2">
                  <p className="text-xs font-bold text-brand">تفاصيل التحويل</p>
                  
                  {method.id === 'hawalat' && (
                    <div className="space-y-3">
                      <input type="text" placeholder="الاسم الكامل (كما في الهوية)" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream text-xs outline-none focus:border-brand"
                        onChange={e => setDetails({...details, fullName: e.target.value})} />
                      <input type="text" placeholder="رقم الهاتف للتواصل" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream text-xs outline-none focus:border-brand"
                        onChange={e => setDetails({...details, phone: e.target.value})} />
                    </div>
                  )}

                  {method.id === 'syriatel' && (
                    <div className="space-y-3">
                      <input type="text" placeholder="رقم موبايل سيريتل كاش (09xxxxxxxx)" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream text-xs outline-none focus:border-brand"
                        onChange={e => setDetails({...details, walletNumber: e.target.value})} />
                    </div>
                  )}

                  {method.id === 'bemo' && (
                    <div className="space-y-3">
                      <input type="text" placeholder="رقم الحساب أو الـ IBAN" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream text-xs outline-none focus:border-brand"
                        onChange={e => setDetails({...details, iban: e.target.value})} />
                      <input type="text" placeholder="اسم صاحب الحساب" 
                        className="w-full px-4 py-3 rounded-xl border border-navy/10 bg-cream text-xs outline-none focus:border-brand"
                        onChange={e => setDetails({...details, accountName: e.target.value})} />
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="p-6 border-t border-navy/5 bg-cream/30 shrink-0">
              <button onClick={handleWithdraw}
                className="w-full btn-brand py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl shadow-brand/20">
                <ArrowUpRight size={15} /> تأكيد طلب السحب
              </button>
              <p className="text-[10px] text-charcoal/40 text-center mt-3">تتم معالجة طلبات السحب خلال 24-48 ساعة عمل.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default function WalletDashboard() {
  const { user } = useAuth();
  const { wallet, investmentProjects, depositToWallet, withdrawFromWallet } = useGlobalData();
  const [activeTab, setActiveTab] = useState('all');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [selectedTrx, setSelectedTrx] = useState(null);

  const available = wallet.totalBalance - wallet.escrowBalance;

  // My investments (transactions that are escrow_hold with a projectId)
  const myInvestments = wallet.transactions.filter(t => t.type === 'escrow_hold' && t.projectId);

  // Filter transactions by tab
  const filteredTrx = wallet.transactions.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'escrow') return t.status === 'pending';
    if (activeTab === 'completed') return t.status === 'completed';
    if (activeTab === 'investments') return t.type === 'escrow_hold' && t.projectId;
    return true;
  });

  const TABS = [
    { id: 'all', label: 'الكل' },
    { id: 'escrow', label: 'الضمان (Escrow)' },
    { id: 'investments', label: 'استثماراتي' },
    { id: 'completed', label: 'المكتملة' },
  ];

  const handleRelease = (trx) => {
    setSelectedTrx(trx);
    setIsHandoverOpen(true);
  };

  const handleHandoverClose = () => {
    setIsHandoverOpen(false);
    setSelectedTrx(null);
  };

  return (
    <div className="min-h-screen bg-cream pb-20" dir="rtl">
      <SEO title="محفظتي | Resurgo" description="إدارة أموالك عبر المحفظة الذكية ونظام الضمان (Escrow) من Resurgo." />

      {/* Hero */}
      <div className="bg-navy pt-28 pb-16 px-4 relative overflow-hidden bg-engineering-grid-dark">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand rounded-full mix-blend-screen filter blur-[100px]" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-cta rounded-full mix-blend-screen filter blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <p className="text-white/60 font-medium flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="gradient-text-light">محفظة آمنة ومضمونة بنظام Escrow</span>
              </p>
              <h1 className="text-white font-black text-3xl sm:text-4xl mb-1 tracking-tight">المحفظة الذكية</h1>
              <p className="text-white/50 text-sm">أهلاً بك، {user?.full_name}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={() => setIsDepositOpen(true)} className="flex-1 md:flex-none btn-brand flex items-center justify-center gap-2 px-6 glow-hover">
                <Plus size={16} /> شحن الرصيد
              </button>
              <button onClick={() => setIsWithdrawOpen(true)} className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2 px-6 glow-hover">
                <ArrowUpRight size={16} /> سحب
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20 space-y-6">

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <p className="text-charcoal/60 font-medium text-sm">الرصيد المتاح</p>
              <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                <Wallet size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-navy mb-1">{available.toLocaleString()} <span className="text-lg text-charcoal/40 font-medium">USD</span></h2>
              <p className="text-green-600 text-xs font-bold flex items-center gap-1">
                <CheckCircle size={12} /> جاهز للاستخدام الفوري
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-charcoal/60 font-medium text-sm">محجوز (Escrow)</p>
                <div className="group relative cursor-help">
                  <Activity size={14} className="text-amber-500" />
                  <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-48 p-2 bg-navy text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10 text-center">
                    أموال محجوزة لضمان حقوق الأطراف في العقود والاستثمارات النشطة.
                  </div>
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                <Lock size={18} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-navy mb-1">{wallet.escrowBalance.toLocaleString()} <span className="text-lg text-charcoal/40 font-medium">USD</span></h2>
              <p className="text-amber-600 text-xs font-bold flex items-center gap-1">
                <Clock size={12} /> {myInvestments.length} استثمارات نشطة
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-navy rounded-2xl p-6 shadow-lg flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/60 font-medium text-sm">إجمالي الأصول</p>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black mb-1">{wallet.totalBalance.toLocaleString()} <span className="text-lg text-white/50 font-medium">USD</span></h2>
                <p className="text-white/40 text-xs font-medium">المتاح + المحجوز</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Investments Quick View */}
        {myInvestments.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-navy/5 flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              <h3 className="text-navy font-black text-sm">استثماراتي النشطة</h3>
              <span className="mr-auto text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full font-bold">
                {myInvestments.length} مشاريع
              </span>
            </div>
            <div className="divide-y divide-navy/5">
              {myInvestments.slice(0, 3).map(trx => {
                const proj = investmentProjects.find(p => p.id === trx.projectId);
                return (
                  <div key={trx.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                        <TrendingUp size={16} />
                      </div>
                      <div>
                        <p className="text-navy font-bold text-xs">{proj?.title || trx.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-charcoal/50 mt-0.5">
                          <span>{trx.date}</span>
                          {proj && <span className="text-emerald-600 font-bold">IRR {proj.irr}%</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-navy font-black text-sm">${Math.abs(trx.amount).toLocaleString()}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                        <Lock size={9} /> Escrow
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-3 bg-cream/50 border-t border-navy/5">
              <Link to="/invest" className="text-brand text-xs font-bold hover:underline flex items-center gap-1">
                <TrendingUp size={12} /> استكشاف المزيد من فرص الاستثمار
              </Link>
            </div>
          </motion.div>
        )}

        {/* Transactions Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-navy/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-navy/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-navy flex items-center gap-2">
              <History size={18} className="text-brand" /> سجل الحركات المالية
            </h3>
            <div className="flex gap-2 flex-wrap">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`text-xs px-3 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === t.id ? 'bg-navy text-white' : 'bg-cream text-charcoal/60 hover:bg-navy/5 hover:text-navy'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-navy/5">
            {filteredTrx.length === 0 ? (
              <div className="py-16 text-center text-charcoal/40">
                <Wallet size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">لا توجد معاملات في هذا التصنيف</p>
              </div>
            ) : filteredTrx.map((trx) => {
              const meta = TRX_ICON[trx.type] || TRX_ICON.default;
              const Icon = meta.icon;
              return (
                <div key={trx.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-cream/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${meta.bg} ${meta.color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-navy mb-1">{trx.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-charcoal/50 font-medium">
                        <span>{trx.date}</span>
                        <span className="w-1 h-1 rounded-full bg-charcoal/20" />
                        <span className="font-mono">{trx.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
                    <span className={`text-base font-black font-mono ${trx.amount > 0 ? 'text-green-600' : 'text-navy'}`}>
                      {trx.amount > 0 ? '+' : ''}{trx.amount.toLocaleString()} $
                    </span>
                    {trx.status === 'pending' ? (
                      <div className="flex flex-col items-end gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                          <Lock size={10} /> محجوز للضمان
                        </span>
                        <button
                          onClick={() => handleRelease(trx)}
                          className="text-[10px] bg-brand text-white px-2 py-1 rounded-md font-bold hover:bg-navy transition-colors"
                        >
                          إنشاء محضر وتحرير
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200">
                        <CheckCircle size={10} /> مكتمل
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTrx.length > 0 && (
            <div className="p-4 border-t border-navy/5 text-center bg-cream/50">
              <p className="text-charcoal/40 text-xs">{filteredTrx.length} معاملة معروضة</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDeposit={depositToWallet}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={withdrawFromWallet}
        availableBalance={available}
      />

      <HandoverProtocolModal
        isOpen={isHandoverOpen}
        onClose={handleHandoverClose}
        projectName={selectedTrx ? selectedTrx.title : 'المشروع'}
        taskName={selectedTrx ? selectedTrx.category : 'مهمة'}
        escrowAmount={selectedTrx ? Math.abs(selectedTrx.amount) : 0}
      />
    </div>
  );
}
