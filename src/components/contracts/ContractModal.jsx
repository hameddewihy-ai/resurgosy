import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileText, ShieldCheck } from 'lucide-react';
import SignaturePad from './SignaturePad';
import toast from 'react-hot-toast';

export default function ContractModal({ isOpen, onClose, defaultParty1 = "شركة Resurgo للوساطة العقارية", defaultRole = "عقد إيجار معدة" }) {
  const [formData, setFormData] = useState({
    date: new Date().toLocaleDateString('ar-SY'),
    type: defaultRole,
    party1: defaultParty1,
    party2: '',
    amount: '',
    duration: '',
    details: 'يلتزم الطرف الثاني باستخدام المعدة المستأجرة/أو تقديم الخدمة المتفق عليها بأعلى معايير الجودة وخلال المدة المحددة. في حال التأخير، يُطبق الشرط الجزائي المتفق عليه ودياً. يقر الطرفان بصحة المعلومات المذكورة وأهليتهما للتعاقد.',
  });

  const [sig1, setSig1] = useState(null);
  const [sig2, setSig2] = useState(null);

  const handlePrint = () => {
    if (!sig1 || !sig2) {
      toast.error('يجب إتمام التوقيع الإلكتروني للطرفين أولاً لاعتماد العقد.');
      return;
    }
    
    // Simple window.print() will use the @media print CSS to only print the contract
    window.print();
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
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm print:hidden" 
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }} 
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full print:shadow-none print:rounded-none print:h-auto print:max-h-none print:block print:max-w-none print:w-full print:m-0 print:p-0"
          >
            {/* Header (Hidden in Print) */}
            <div className="flex items-center justify-between p-5 border-b border-navy/5 bg-cream/50 print:hidden">
              <h2 className="text-lg font-black text-navy flex items-center gap-2">
                <FileText size={20} className="text-brand" /> إبرام عقد رقمي (عرفي)
              </h2>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/5 text-charcoal/40 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Contract Body (This is what gets printed) */}
            <div className="p-6 sm:p-8 overflow-y-auto print:overflow-visible resurgo-contract-print bg-white">
              
              {/* Contract Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-navy/10">
                <h1 className="text-3xl font-black text-navy mb-2 tracking-tight">RESURGO</h1>
                <p className="text-sm font-bold text-charcoal/50 uppercase tracking-widest mb-4">Ecosystem Contract</p>
                <h2 className="text-2xl font-bold text-navy underline decoration-brand decoration-4 underline-offset-8">
                  {formData.type || 'عقد اتفاق'}
                </h2>
                <p className="text-xs text-charcoal/60 mt-6">تاريخ الإبرام: {formData.date}</p>
              </div>

              {/* Editable Fields (Inputs look like normal text in print via CSS) */}
              <div className="space-y-6 text-charcoal leading-relaxed">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-navy/50 mb-1 print:text-black">الطرف الأول (صاحب المشروع/المنصة)</label>
                    <input 
                      type="text" 
                      value={formData.party1} 
                      onChange={(e) => setFormData({...formData, party1: e.target.value})}
                      className="w-full bg-cream/30 border-b-2 border-navy/10 py-2 font-bold text-navy focus:outline-none focus:border-brand print:border-none print:bg-transparent print:p-0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy/50 mb-1 print:text-black">الطرف الثاني (المقاول/المهندس)</label>
                    <input 
                      type="text" 
                      placeholder="اسم الطرف الثاني"
                      value={formData.party2} 
                      onChange={(e) => setFormData({...formData, party2: e.target.value})}
                      className="w-full bg-cream/30 border-b-2 border-navy/10 py-2 font-bold text-navy focus:outline-none focus:border-brand print:border-none print:bg-transparent print:p-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-navy/50 mb-1 print:text-black">المبلغ المتفق عليه (دولار أمريكي)</label>
                    <input 
                      type="number" 
                      placeholder="مثال: 1500"
                      value={formData.amount} 
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full bg-cream/30 border-b-2 border-navy/10 py-2 font-bold text-navy focus:outline-none focus:border-brand print:border-none print:bg-transparent print:p-0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy/50 mb-1 print:text-black">مدة التنفيذ / الإيجار</label>
                    <input 
                      type="text" 
                      placeholder="مثال: 30 يوماً من تاريخ التوقيع"
                      value={formData.duration} 
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full bg-cream/30 border-b-2 border-navy/10 py-2 font-bold text-navy focus:outline-none focus:border-brand print:border-none print:bg-transparent print:p-0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy/50 mb-1 print:text-black">الشروط والتفاصيل الإضافية</label>
                  <textarea 
                    rows={4}
                    value={formData.details} 
                    onChange={(e) => setFormData({...formData, details: e.target.value})}
                    className="w-full bg-cream/30 border border-navy/10 rounded-xl p-3 text-sm text-navy focus:outline-none focus:border-brand print:border-none print:bg-transparent print:p-0 resize-none"
                  />
                </div>
              </div>

              {/* Signatures Section */}
              <div className="mt-10 pt-8 border-t-2 border-navy/10">
                <div className="flex items-center gap-2 mb-6 justify-center print:text-black">
                  <ShieldCheck className="text-green-500" size={20} />
                  <p className="text-sm font-bold">هذا العقد موثق رقمياً ويُعتمد عليه في نظام الضمان المالي (Escrow)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
                  {/* Party 1 Signature */}
                  <div className="text-center print:break-inside-avoid">
                    <SignaturePad onSave={setSig1} label="توقيع الطرف الأول" />
                  </div>
                  
                  {/* Party 2 Signature */}
                  <div className="text-center print:break-inside-avoid">
                    <SignaturePad onSave={setSig2} label="توقيع الطرف الثاني" />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Actions (Hidden in Print) */}
            <div className="p-5 border-t border-navy/5 bg-cream/50 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <p className="text-xs text-charcoal/50 text-center sm:text-right">
                بعد توقيع الطرفين، اضغط على حفظ العقد للاحتفاظ بنسخة PDF وتأكيد المعاملة.
              </p>
              <button 
                onClick={handlePrint}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${sig1 && sig2 ? 'bg-brand text-white hover:bg-brand/90 shadow-lg shadow-brand/20' : 'bg-navy/5 text-charcoal/40 cursor-not-allowed'}`}
              >
                <Printer size={16} /> حفظ العقد كـ PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
