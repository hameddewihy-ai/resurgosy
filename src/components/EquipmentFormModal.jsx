import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Info, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EquipmentFormModal({ isOpen, onClose, equipmentToEdit, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'light',
    rate: '',
    wetAvailable: false,
    wetRate: '',
    waiverAvailable: false,
    images: []
  });

  useEffect(() => {
    if (equipmentToEdit) {
      setFormData(equipmentToEdit);
    } else {
      setFormData({
        name: '',
        type: 'light',
        rate: '',
        wetAvailable: false,
        wetRate: '',
        waiverAvailable: false,
        images: []
      });
    }
  }, [equipmentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rate) {
      toast.error('يرجى ملء الحقول الإجبارية');
      return;
    }
    
    // Simulate image upload / processing
    toast.success(equipmentToEdit ? 'تم تعديل المعدة بنجاح' : 'تمت إضافة المعدة بنجاح');
    onSave({ ...formData, id: equipmentToEdit?.id || Date.now() });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-cream rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-navy/5 bg-white">
            <h2 className="text-lg font-black text-navy">
              {equipmentToEdit ? 'تعديل المعدة' : 'إضافة معدة جديدة'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/5 text-charcoal/40 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 overflow-y-auto">
            <form id="equip-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Photo Upload Area */}
              <div className="border-2 border-dashed border-brand/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-white hover:bg-brand/5 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera size={24} className="text-brand" />
                </div>
                <p className="text-sm font-bold text-navy mb-1">أضف صور المعدة</p>
                <p className="text-xs text-charcoal/50">اسحب الصور وأفلتها هنا أو اضغط للاستعراض</p>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">اسم/طراز المعدة *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border border-navy/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                    placeholder="مثال: حفارة كاتربيلر 320"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">التصنيف *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full bg-white border border-navy/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand appearance-none"
                  >
                    <option value="light">معدات خفيفة</option>
                    <option value="demolition">تكسير وهدم</option>
                    <option value="crane">رافعات ومناولة</option>
                    <option value="excavator">حفارات</option>
                  </select>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white p-4 space-y-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
                <p className="text-sm font-bold text-navy border-b border-navy/5 pb-2">التسعير والخدمات المتاحة</p>
                
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">أجرة التأجير الجاف (بدون مشغل) باليوم *</label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 text-sm">$</span>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleChange}
                      className="w-full bg-white border border-navy/10 rounded-xl pr-8 pl-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="wetAvailable"
                      checked={formData.wetAvailable}
                      onChange={handleChange}
                      className="w-4 h-4 text-brand rounded border-navy/20 focus:ring-brand"
                    />
                    <span className="text-sm font-semibold text-navy">أوفر تأجير رطب (مع مشغل/سائق)</span>
                  </label>

                  {formData.wetAvailable && (
                    <div className="pr-7">
                      <label className="block text-xs font-semibold text-charcoal mb-1.5">أجرة التأجير الرطب باليوم</label>
                      <div className="relative">
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 text-sm">$</span>
                        <input
                          type="number"
                          name="wetRate"
                          value={formData.wetRate}
                          onChange={handleChange}
                          className="w-full bg-white border border-navy/10 rounded-xl pr-8 pl-4 py-2.5 text-sm focus:outline-none focus:border-brand"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      name="waiverAvailable"
                      checked={formData.waiverAvailable}
                      onChange={handleChange}
                      className="w-4 h-4 text-amber-500 rounded border-navy/20 focus:ring-amber-500"
                    />
                    <span className="text-sm font-semibold text-navy flex items-center gap-1">
                      أوفر تأمين ضد الأضرار العرضية
                      <div className="group relative">
                        <Info size={14} className="text-charcoal/40 cursor-help" />
                        <div className="absolute right-0 w-48 p-2 bg-navy text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          سيتم احتساب 2.5% إضافية من قيمة الإيجار لدعم تغطية الأعطال العرضية
                        </div>
                      </div>
                    </span>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-navy/5 bg-white flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-navy/15 text-charcoal font-semibold text-sm hover:bg-cream transition-colors"
            >
              إلغاء
            </button>
            <button
              form="equip-form"
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-navy transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              {equipmentToEdit ? 'حفظ التعديلات' : 'نشر المعدة'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
