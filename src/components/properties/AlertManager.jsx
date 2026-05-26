import { useEffect, useState } from "react";
import { Bell, BellOff, Plus, Trash2 } from "lucide-react";
import { supabase, isConfigured } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const CITIES = ["all","دمشق","حلب","اللاذقية","طرطوس","حمص","حماة","إدلب","دير الزور","الرقة","الحسكة","درعا","السويداء","القنيطرة"];
const TYPES  = ["all","سكني","تجاري","صناعي","أرض"];

const DEFAULT_FORM = { label: "", city: "all", property_type: "all", min_price: "", max_price: "" };

export default function AlertManager() {
  const { user } = useAuth();
  const [alerts, setAlerts]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(DEFAULT_FORM);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    if (!isConfigured || !user) return;
    supabase
      .from("property_alerts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { setAlerts(data || []); setLoading(false); });
  }, [user]);

  const save = async () => {
    if (!form.label.trim()) return toast.error("أدخل اسماً للتنبيه");
    setSaving(true);
    const { data, error } = await supabase
      .from("property_alerts")
      .insert({
        user_id:       user.id,
        label:         form.label.trim(),
        city:          form.city === "all" ? null : form.city,
        property_type: form.property_type === "all" ? null : form.property_type,
        min_price:     form.min_price ? Number(form.min_price) : null,
        max_price:     form.max_price ? Number(form.max_price) : null,
      })
      .select()
      .single();
    setSaving(false);
    if (error) return toast.error("حدث خطأ");
    setAlerts((prev) => [data, ...prev]);
    setForm(DEFAULT_FORM);
    setShowForm(false);
    toast.success("تم إنشاء التنبيه ✓");
  };

  const toggle = async (alert) => {
    const { error } = await supabase
      .from("property_alerts")
      .update({ active: !alert.active })
      .eq("id", alert.id);
    if (!error) setAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, active: !a.active } : a));
  };

  const remove = async (id) => {
    await supabase.from("property_alerts").delete().eq("id", id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast.success("تم حذف التنبيه");
  };

  if (loading) return <div className="text-charcoal/40 text-sm text-center py-6">جاري التحميل...</div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-navy font-bold text-sm">تنبيهات العقارات</p>
          <p className="text-charcoal/50 text-xs mt-0.5">أُخطَر فور إضافة عقار يطابق بحثك</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-brand text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand/90 transition-colors"
        >
          <Plus size={14} /> تنبيه جديد
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-navy/10 rounded-2xl p-4 space-y-3">
          <input
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="اسم التنبيه (مثال: شقة في دمشق)"
            className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy outline-none focus:border-brand"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-charcoal/50 mb-1 block">المدينة</label>
              <select
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy outline-none focus:border-brand"
              >
                {CITIES.map((c) => <option key={c} value={c}>{c === "all" ? "كل المدن" : c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-charcoal/50 mb-1 block">نوع العقار</label>
              <select
                value={form.property_type}
                onChange={(e) => setForm({ ...form, property_type: e.target.value })}
                className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy outline-none focus:border-brand"
              >
                {TYPES.map((t) => <option key={t} value={t}>{t === "all" ? "كل الأنواع" : t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-charcoal/50 mb-1 block">الحد الأدنى للسعر ($)</label>
              <input
                type="number"
                value={form.min_price}
                onChange={(e) => setForm({ ...form, min_price: e.target.value })}
                placeholder="0"
                className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-[11px] text-charcoal/50 mb-1 block">الحد الأقصى ($)</label>
              <input
                type="number"
                value={form.max_price}
                onChange={(e) => setForm({ ...form, max_price: e.target.value })}
                placeholder="بلا حد"
                className="w-full border border-navy/15 rounded-xl px-3 py-2 text-sm text-navy outline-none focus:border-brand"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 bg-[#f37124] hover:bg-[#e06515] disabled:opacity-50 text-white font-bold py-2 rounded-xl text-sm transition-colors"
            >
              {saving ? "جاري الحفظ..." : "حفظ التنبيه"}
            </button>
            <button
              onClick={() => { setShowForm(false); setForm(DEFAULT_FORM); }}
              className="px-4 py-2 border border-navy/15 rounded-xl text-sm text-charcoal/60 hover:border-navy/30 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {alerts.length === 0 ? (
        <div className="bg-white border border-navy/10 rounded-2xl p-8 text-center">
          <Bell size={32} className="mx-auto text-navy/20 mb-3" />
          <p className="text-charcoal/50 text-sm">لا توجد تنبيهات بعد</p>
          <p className="text-charcoal/35 text-xs mt-1">أنشئ تنبيهاً وسنخبرك فور توفر عقار مناسب</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <div key={alert.id} className="bg-white border border-navy/10 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${alert.active ? "bg-brand/10" : "bg-navy/5"}`}>
              {alert.active
                ? <Bell size={16} className="text-brand" />
                : <BellOff size={16} className="text-charcoal/30" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-navy font-bold text-sm truncate">{alert.label}</p>
              <p className="text-charcoal/45 text-xs mt-0.5">
                {[
                  alert.city || "كل المدن",
                  alert.property_type || "كل الأنواع",
                  alert.min_price || alert.max_price
                    ? `$${alert.min_price || 0} – ${alert.max_price ? "$" + alert.max_price : "∞"}`
                    : null,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => toggle(alert)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                  alert.active
                    ? "border-brand/30 text-brand bg-brand/5 hover:bg-brand/10"
                    : "border-navy/15 text-charcoal/40 hover:border-navy/30"
                }`}
              >
                {alert.active ? "مفعّل" : "موقوف"}
              </button>
              <button
                onClick={() => remove(alert.id)}
                className="text-red-400 hover:text-red-600 transition-colors p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
