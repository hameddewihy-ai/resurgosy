import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, PackageCheck, AlertCircle } from 'lucide-react';
import SignaturePad from './SignaturePad';
import toast from 'react-hot-toast';

export default function HandoverProtocolModal({ isOpen, onClose, projectName = "برج ياسمين الشام", taskName = "استئجار رافعة شوكية", escrowAmount = 1200 }) {
  const [sig1, setSig1] = useState(null);
  const [sig2, setSig2] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReleaseEscrow = () => {
    if (!sig1 || !sig2) {
      toast.error('يجب توقيع محضر التسليم من الطرفين لتحرير الأموال.');
      return;
    }

    setIsProcessing(true);
    
    // Simulate network delay for releasing funds
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(`تم تحرير مبلغ ${escrowAmount}$ بنجاح من محفظة الضمان!`);
      // Here you would dispatch an action or API call to update the global wallet state
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" dir="rtl">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm" 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-navy/5 bg-brand/5">
              <h2 className="text-lg font-black text-navy flex items-center gap-2">
                <PackageCheck size={20} className="text-brand" /> محضر تسليم إلكتروني (إنهاء مهمة)
              </h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/5 text-charcoal/40 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 overflow-y-auto bg-white">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 mb-6">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="text-sm font-bold text-amber-800 mb-1">تحذير تحرير الأموال</h4>
                  <p className="text-xs text-amber-700/80 leading-relaxed">
                    بتوقيع هذا المحضر، يقر الطرف الأول باستلام العمل/المعدة بحالة ممتازة وحسب المواصفات المتفق عليها. سيتم تحرير مبلغ الضمان (Escrow) فوراً لصالح الطرف الثاني ولن يمكن التراجع عن هذه العملية.
                  </p>
                </div>
              </div>

              {/* Protocol Details */}
              <div className="space-y-4 mb-8 text-sm text-navy">
                <div className="flex justify-between py-2 border-b border-navy/5">
                  <span className="text-charcoal/50 font-bold">المشروع:</span>
                  <span className="font-black">{projectName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-navy/5">
                  <span className="text-charcoal/50 font-bold">المهمة المنجزة:</span>
                  <span className="font-bold">{taskName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-navy/5">
                  <span className="text-charcoal/50 font-bold">تاريخ التسليم:</span>
                  <span className="font-bold">{new Date().toLocaleDateString('ar-SY')}</span>
                </div>
                <div className="flex justify-between py-3 border-b-2 border-brand/20 bg-brand/5 px-3 rounded-lg">
                  <span className="text-brand font-black">المبلغ المراد تحريره (Escrow):</span>
                  <span className="font-black text-brand text-lg">{escrowAmount}$</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="text-center">
                  <SignaturePad onSave={setSig1} label="مستلم العمل (الطرف الأول)" />
                </div>
                <div className="text-center">
                  <SignaturePad onSave={setSig2} label="منفذ العمل (الطرف الثاني)" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-navy/5 bg-cream/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-charcoal/50 text-center sm:text-right">
                لا تقم بالتوقيع إلا بعد التأكد من جودة التسليم الميداني.
              </p>
              <button 
                onClick={handleReleaseEscrow}
                disabled={!sig1 || !sig2 || isProcessing}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${(!sig1 || !sig2 || isProcessing) ? 'bg-navy/5 text-charcoal/40 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/20'}`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">جاري مزامنة المحفظة...</span>
                ) : (
                  <><CheckCircle size={18} /> اعتماد التسليم وتحرير {escrowAmount}$</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
