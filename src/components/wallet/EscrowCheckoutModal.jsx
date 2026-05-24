import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Wallet, Lock, Info, FolderKanban } from 'lucide-react';
import { useAuth, ROLES } from '../../context/AuthContext';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function EscrowCheckoutModal({ isOpen, onClose, details, onConfirm }) {
  const { user } = useAuth();
  const role = user ? ROLES[user.role] : null;
  const isDeveloper = role?.id === 'developer' || role?.id === 'owner';
  
  const [fundingSource, setFundingSource] = useState('personal');

  // Mock wallet balances
  const BALANCES = {
    personal: 24500,
    project: 500000 // Mock crowdfunded project budget
  };

  const currentBalance = BALANCES[fundingSource];

  if (!isOpen || !details) return null;

  const isInsufficient = currentBalance < details.amount;

  const handleConfirm = () => {
    if (isInsufficient) {
      toast.error('رصيد المحفظة غير كافٍ. يرجى إيداع الأموال أولاً.');
      return;
    }
    
    // Process Escrow Transfer
    toast.success('تم حجز المبلغ في الضمان (Escrow) بنجاح!');
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-6 border-b border-navy/5 bg-cream/50">
            <h2 className="text-lg font-black text-navy flex items-center gap-2">
              <ShieldCheck size={20} className="text-brand" />
              تأكيد الدفع عبر المحفظة
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/5 text-charcoal/40 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto">
            <p className="text-sm text-charcoal/70 mb-5 leading-relaxed">
              أنت على وشك حجز الأموال في نظام <strong className="text-navy font-bold">الضمان المالي (Escrow)</strong>. 
              لن يتم تحويل هذا المبلغ للطرف الآخر إلا بعد إتمام الخدمة وتأكيدك.
            </p>

            <div className="bg-navy/5 rounded-2xl p-4 mb-5 border border-navy/10">
              <p className="text-xs text-charcoal/50 font-semibold mb-1 uppercase tracking-wider">تفاصيل العملية</p>
              <p className="text-base font-bold text-navy mb-3 leading-snug">{details.title}</p>
              
              <div className="flex items-center justify-between border-t border-navy/10 pt-3">
                <span className="text-sm font-semibold text-charcoal">إجمالي المبلغ المطلوب</span>
                <span className="text-xl font-black text-brand">{details.amount.toLocaleString()} $</span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200/60 mb-5">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed font-medium">
                ملاحظة: سيتم خصم رسوم المنصة (الوساطة) من مستحقات المالك لاحقاً قبل تسليمه المبلغ. لا توجد رسوم إضافية عليك.
              </p>
            </div>

            {/* Funding Source Selection (For Developers/Owners) */}
            {isDeveloper && (
              <div className="mb-5">
                <label className="text-xs font-bold text-charcoal/60 uppercase tracking-wider mb-2 block">مصدر الدفع</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFundingSource('personal')}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${fundingSource === 'personal' ? 'border-brand bg-brand/5' : 'border-navy/10 bg-white hover:border-brand/30'}`}
                  >
                    <span className="text-xs font-bold text-navy flex items-center gap-1.5"><Wallet size={12}/> الرصيد الشخصي</span>
                    <span className="text-[10px] text-charcoal/50">المحفظة العادية</span>
                  </button>
                  <button
                    onClick={() => setFundingSource('project')}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col gap-1 ${fundingSource === 'project' ? 'border-amber-500 bg-amber-50' : 'border-navy/10 bg-white hover:border-amber-500/30'}`}
                  >
                    <span className="text-xs font-bold text-navy flex items-center gap-1.5"><FolderKanban size={12}/> ميزانية المشروع</span>
                    <span className="text-[10px] text-charcoal/50">برج ياسمين الشام</span>
                  </button>
                </div>
              </div>
            )}

            {/* Wallet Info */}
            <div className={`flex items-center justify-between border-2 rounded-xl p-4 transition-colors ${fundingSource === 'project' ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-navy/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${fundingSource === 'project' ? 'bg-amber-100 text-amber-600' : 'bg-cream text-navy'}`}>
                  {fundingSource === 'project' ? <FolderKanban size={18} /> : <Wallet size={18} />}
                </div>
                <div>
                  <p className="text-xs text-charcoal/50 font-medium">الرصيد المتاح</p>
                  <p className={`text-sm font-bold ${isInsufficient ? 'text-red-500' : 'text-green-600'}`}>
                    {currentBalance.toLocaleString()} $
                  </p>
                </div>
              </div>
              {isInsufficient && (
                <span className="text-[10px] font-bold px-2 py-1 bg-red-50 text-red-600 rounded-lg">رصيد غير كافٍ</span>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 sm:p-6 border-t border-navy/5 bg-cream/50 flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isInsufficient 
                  ? 'bg-navy/10 text-navy/40 cursor-not-allowed shadow-none' 
                  : 'bg-cta hover:bg-cta/90 text-white shadow-cta/20'
              }`}
            >
              {isInsufficient ? (
                <>إيداع رصيد للمتابعة</>
              ) : (
                <>
                  <Lock size={16} /> حجز {details.amount.toLocaleString()}$ في الضمان
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-charcoal/40 font-medium">
              محمية بنظام التشفير والضمان الذكي من Resurgo
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
