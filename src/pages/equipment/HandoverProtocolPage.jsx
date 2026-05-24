import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, CheckCircle, AlertCircle, Fuel, Droplet, CheckSquare, UploadCloud, FileSignature, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';
import RatingWidget from '../../components/ui/RatingWidget';

const PHOTO_REQUIREMENTS = [
  { id: 'front', label: 'الواجهة الأمامية' },
  { id: 'back', label: 'الواجهة الخلفية' },
  { id: 'dashboard', label: 'لوحة العدادات (ساعات العمل)' },
  { id: 'damages', label: 'الخدوش أو الأضرار (إن وجدت)' },
];

export default function HandoverProtocolPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [showRating, setShowRating] = useState(false);
  const [photos, setPhotos] = useState({});
  const [checks, setChecks] = useState({
    fuel: 'full',
    cleanliness: true,
    operational: true,
    damages: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock contract details based on ID
  const contract = {
    id: contractId,
    equipmentName: 'حفارة كاتربيلر 320',
    renterName: 'شركة الأفق للمقاولات',
    startDate: '2026-05-10',
    endDate: '2026-05-16',
    escrowAmount: 2800,
  };

  const handlePhotoUpload = (id) => {
    // Simulate photo capture/upload
    setPhotos(prev => ({ ...prev, [id]: 'uploaded' }));
    toast.success(`تم إرفاق صورة ${PHOTO_REQUIREMENTS.find(p => p.id === id).label}`);
  };

  const handleSubmit = () => {
    if (Object.keys(photos).length < 4) {
      toast.error('يرجى توثيق جميع الصور الإلزامية الأربعة');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('تم رفع المحضر بنجاح! جاري تحرير الأموال من الضمان...', { duration: 4000 });
      setShowRating(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-cream pt-[62px] pb-24" dir="rtl">
      <SEO title="محضر استرجاع وتسليم | Resurgo" description="توثيق استلام المعدات وتخليص المستحقات المالية" />

      {/* Top Navigation */}
      <div className="bg-white border-b border-navy/10 sticky top-[62px] z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/5 text-charcoal/60 transition-colors">
            <ArrowRight size={20} />
          </button>
          <h1 className="text-navy font-black text-lg">محضر استرجاع وإنهاء عقد</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Contract Info */}
        <div className="bg-white p-5 border-t-4 border-t-brand shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider mb-1">رقم العقد #{contract.id}</p>
              <h2 className="text-xl font-black text-navy">{contract.equipmentName}</h2>
            </div>
            <div className="text-left">
              <p className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider mb-1">المبلغ المحجوز</p>
              <p className="text-xl font-black text-brand">{contract.escrowAmount.toLocaleString()}$</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-charcoal/60 bg-navy/5 p-3 rounded-xl border border-navy/10">
            <p><strong>المستأجر:</strong> {contract.renterName}</p>
            <p><strong>المدة:</strong> {contract.startDate} إلى {contract.endDate}</p>
          </div>
        </div>

        {/* Visual Documentation */}
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-base mb-1 flex items-center gap-2">
            <Camera size={18} className="text-brand" /> التوثيق البصري (Geo-tagged)
          </h3>
          <p className="text-xs text-charcoal/50 mb-4">يُرجى التقاط الصور من موقع تسليم المعدة لحفظ الحقوق وتحرير الأموال.</p>
          
          <div className="grid grid-cols-2 gap-3">
            {PHOTO_REQUIREMENTS.map((req) => (
              <button 
                key={req.id}
                onClick={() => handlePhotoUpload(req.id)}
                className={`relative h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${
                  photos[req.id] ? 'border-green-500 bg-green-50' : 'border-dashed border-navy/20 bg-white hover:border-brand/50 hover:bg-brand/5'
                }`}
              >
                {photos[req.id] ? (
                  <>
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-sm z-10">
                      <CheckCircle className="text-green-600 fill-green-100" size={32} />
                    </div>
                    {/* Mock image placeholder */}
                    <img src="https://images.unsplash.com/photo-1586864387789-228f0166ce49?w=200&blur=10" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                  </>
                ) : (
                  <>
                    <Camera size={24} className="text-charcoal/30" />
                    <span className="text-[10px] font-bold text-navy px-2 text-center">{req.label}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white p-5 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
          <h3 className="text-navy font-bold text-base mb-4 flex items-center gap-2">
            <CheckSquare size={18} className="text-brand" /> حالة الاسترجاع
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-navy/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-charcoal/60"><Fuel size={14} /></div>
                <span className="text-sm font-semibold text-navy">مستوى الوقود</span>
              </div>
              <select 
                value={checks.fuel} 
                onChange={(e) => setChecks(p => ({ ...p, fuel: e.target.value }))}
                className="bg-white border border-navy/10 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-brand"
              >
                <option value="full">ممتلئ (Full)</option>
                <option value="half">النصف</option>
                <option value="empty">فارغ</option>
              </select>
            </div>

            <label className="flex items-center justify-between border-b border-navy/5 pb-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-charcoal/60"><Droplet size={14} /></div>
                <span className="text-sm font-semibold text-navy">المعدة نظيفة وتم غسلها</span>
              </div>
              <input type="checkbox" checked={checks.cleanliness} onChange={(e) => setChecks(p => ({ ...p, cleanliness: e.target.checked }))} className="w-5 h-5 rounded text-brand focus:ring-brand border-navy/20" />
            </label>

            <label className="flex items-center justify-between border-b border-navy/5 pb-4 cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-charcoal/60"><CheckCircle size={14} /></div>
                <span className="text-sm font-semibold text-navy">حالة التشغيل سليمة (لا أعطال)</span>
              </div>
              <input type="checkbox" checked={checks.operational} onChange={(e) => setChecks(p => ({ ...p, operational: e.target.checked }))} className="w-5 h-5 rounded text-brand focus:ring-brand border-navy/20" />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><AlertCircle size={14} /></div>
                <span className="text-sm font-semibold text-amber-700">توجد أضرار جديدة غير موثقة مسبقاً؟</span>
              </div>
              <input type="checkbox" checked={checks.damages} onChange={(e) => setChecks(p => ({ ...p, damages: e.target.checked }))} className="w-5 h-5 rounded text-amber-500 focus:ring-amber-500 border-navy/20" />
            </label>
            
            {checks.damages && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                <textarea 
                  placeholder="يرجى وصف الأضرار لخصم التكلفة من التأمين..." 
                  className="w-full bg-white border border-amber-200 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-400"
                  rows="3"
                ></textarea>
              </motion.div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-brand/5 border border-brand/20 rounded-2xl p-4 flex items-start gap-3">
          <FileSignature size={20} className="text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-navy leading-relaxed font-medium">
            بتأكيد هذا المحضر، يقر الطرفان بصحة المعلومات المرفقة. بناءً عليه سيتم <strong className="text-brand font-black">تحرير الدفعة المعلقة (${contract.escrowAmount.toLocaleString()})</strong> لصالح حساب المالك مخصوماً منها نسبة عمولة المنصة المعتمدة.
          </p>
        </div>

      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-navy/10 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="px-6 py-3.5 rounded-xl border-2 border-navy/15 text-navy font-bold text-sm hover:bg-cream transition-colors">
            إلغاء
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className={`flex-1 py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand/20 transition-all ${isSubmitting ? 'bg-navy opacity-70' : 'bg-brand hover:bg-navy'}`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2"><UploadCloud className="animate-bounce" size={18} /> جاري المعالجة...</span>
            ) : (
              <span className="flex items-center gap-2"><CheckCircle size={18} /> تأكيد وتحرير الأموال</span>
            )}
          </button>
        </div>
      </div>

      {/* Rating modal after successful handover */}
      {showRating && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            dir="rtl"
          >
            <div className="text-center mb-5">
              <CheckCircle size={36} className="text-green-500 mx-auto mb-2" />
              <h3 className="text-navy font-black text-lg">تم تحرير الأموال بنجاح</h3>
              <p className="text-charcoal/55 text-sm mt-1">كيف كانت تجربتك مع هذه المعدة؟</p>
            </div>
            <RatingWidget
              type="equipment"
              targetId={contractId}
              targetName={`عقد ${contractId}`}
              onSubmit={() => navigate('/wallet')}
            />
            <button
              onClick={() => navigate('/wallet')}
              className="w-full mt-3 text-charcoal/50 text-xs hover:text-navy transition-colors"
            >
              تخطّي التقييم
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
