import { useState } from 'react';
import { Users, Plus, X, Star, Briefcase, HardHat, Scale, Calculator, Wrench, CheckCircle, Send } from 'lucide-react';

const ROLES_CATALOG = [
  { id: 'structural_eng', title: 'مهندس إنشائي',    icon: HardHat,    rate: 1800, category: 'engineering' },
  { id: 'civil_eng',      title: 'مهندس مدني',       icon: HardHat,    rate: 1600, category: 'engineering' },
  { id: 'mep_eng',        title: 'مهندس MEP',         icon: Wrench,     rate: 1700, category: 'engineering' },
  { id: 'project_mgr',   title: 'مدير مشروع',        icon: Briefcase,  rate: 2200, category: 'management'  },
  { id: 'quantity_surv',  title: 'مهندس كميات',       icon: Calculator, rate: 1400, category: 'engineering' },
  { id: 'lawyer',         title: 'محامي عقارات',       icon: Scale,      rate: 2000, category: 'legal'       },
  { id: 'accountant',     title: 'محاسب مالي',        icon: Calculator, rate: 1500, category: 'finance'     },
  { id: 'architect',      title: 'مهندس معماري',      icon: HardHat,    rate: 1900, category: 'engineering' },
];

const CANDIDATES = [
  { id: 'c1',  role: 'structural_eng', name: 'د. سامر الشيخ',    city: 'دمشق',       rating: 4.9, exp: 14, available: true  },
  { id: 'c2',  role: 'structural_eng', name: 'م. علاء الدين',    city: 'حلب',        rating: 4.7, exp: 9,  available: true  },
  { id: 'c3',  role: 'civil_eng',      name: 'م. غادة نصر',      city: 'حمص',        rating: 4.8, exp: 11, available: true  },
  { id: 'c4',  role: 'mep_eng',        name: 'م. كريم حسون',      city: 'دمشق',       rating: 4.6, exp: 7,  available: false },
  { id: 'c5',  role: 'mep_eng',        name: 'م. رامي الجسر',    city: 'اللاذقية',   rating: 4.9, exp: 12, available: true  },
  { id: 'c6',  role: 'project_mgr',    name: 'أ. ليلى البكري',   city: 'دمشق',       rating: 4.8, exp: 16, available: true  },
  { id: 'c7',  role: 'quantity_surv',  name: 'م. أحمد الصالح',   city: 'حمص',        rating: 4.5, exp: 8,  available: true  },
  { id: 'c8',  role: 'lawyer',         name: 'أ. نادية الكردي',  city: 'دمشق',       rating: 4.7, exp: 13, available: true  },
  { id: 'c9',  role: 'accountant',     name: 'أ. محمود عبدو',    city: 'حماة',       rating: 4.6, exp: 10, available: true  },
  { id: 'c10', role: 'architect',      name: 'م. مي الزهراوي',   city: 'دمشق',       rating: 4.9, exp: 15, available: true  },
];

function CandidateCard({ candidate, roleTitle, onAdd, inTeam }) {
  return (
    <div className={`bg-white p-4 transition-all shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg ${inTeam ? 'ring-1 ring-brand/30' : ''}`}>
      <div className="flex items-start gap-3" dir="rtl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-blue-700 flex items-center justify-center text-white font-bold shrink-0 shadow">
          {candidate.name.split(' ').pop()[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-navy font-bold text-sm">{candidate.name}</p>
            {inTeam
              ? <CheckCircle size={16} className="text-brand shrink-0" />
              : <button onClick={() => onAdd(candidate)}
                  disabled={!candidate.available}
                  className="w-7 h-7 rounded-lg bg-brand/10 hover:bg-brand text-brand hover:text-white flex items-center justify-center transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed">
                  <Plus size={14} />
                </button>}
          </div>
          <p className="text-charcoal/60 text-xs mt-0.5">{roleTitle} · {candidate.city}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-0.5 text-yellow-500 text-xs">
              <Star size={10} fill="currentColor" />
              {candidate.rating}
            </span>
            <span className="text-charcoal/50 text-xs">{candidate.exp} سنة خبرة</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border ${candidate.available ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
              {candidate.available ? 'متاح' : 'مشغول'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamBuilder({ projectName = 'مجمع حمص الصناعي' }) {
  const [activeRole, setActiveRole] = useState('structural_eng');
  const [team, setTeam] = useState([]);
  const [sent, setSent] = useState(false);

  const addToTeam = (candidate) => {
    if (!team.find((m) => m.id === candidate.id)) {
      setTeam([...team, candidate]);
    }
  };
  const removeFromTeam = (id) => setTeam(team.filter((m) => m.id !== id));

  const roleCandidates = CANDIDATES.filter((c) => c.role === activeRole);
  const activeRoleMeta = ROLES_CATALOG.find((r) => r.id === activeRole);

  const totalMonthlyCost = team.reduce((acc, m) => {
    const r = ROLES_CATALOG.find((rl) => rl.id === m.role);
    return acc + (r?.rate || 0);
  }, 0);

  if (sent) {
    return (
      <div className="bg-white p-8 text-center shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg" dir="rtl">
        <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h3 className="text-navy font-bold text-lg mb-2">تم إرسال عروض التوظيف!</h3>
        <p className="text-charcoal/60 text-sm mb-4">
          تم إرسال دعوات الانضمام لـ <span className="text-navy font-bold">{team.length} كادر</span> في مشروع "{projectName}".
        </p>
        <div className="bg-cream rounded-xl p-4 text-right mb-5">
          {team.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-1.5 border-b border-navy/10 last:border-0 text-sm">
              <span className="text-navy">{m.name}</span>
              <span className="text-green-600 text-xs">✓ مُرسل</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setTeam([]); setSent(false); }}
          className="btn-primary flex items-center gap-2 mx-auto">
          <Users size={16} />
          بناء فريق جديد
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir="rtl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h3 className="text-navy font-bold text-sm flex items-center gap-2">
          <Users size={16} className="text-brand" />
          تكوين فريق عمل — {projectName}
        </h3>
        <span className="text-xs text-charcoal/50">اختر الكوادر المطلوبة من الكتالوج</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Left: role selector + candidates */}
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {ROLES_CATALOG.map((r) => {
              const inTeamCount = team.filter((m) => m.role === r.id).length;
              return (
                <button key={r.id} onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${activeRole === r.id ? 'bg-brand/10 border-brand/40 text-navy' : 'border-navy/12 text-charcoal/60 hover:border-brand/30 hover:text-navy'}`}>
                  <r.icon size={13} />
                  <span>{r.title}</span>
                  {inTeamCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">{inTeamCount}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-charcoal/60 text-xs">
                {activeRoleMeta?.title} · {roleCandidates.filter((c) => c.available).length} متاح
              </p>
              <span className="text-xs text-charcoal/50">
                ${activeRoleMeta?.rate?.toLocaleString()}/شهر
              </span>
            </div>
            {roleCandidates.length === 0
              ? <p className="text-charcoal/40 text-sm py-6 text-center">لا يوجد مرشحون لهذا الدور حالياً</p>
              : roleCandidates.map((c) => (
                <CandidateCard key={c.id} candidate={c} roleTitle={activeRoleMeta?.title}
                  onAdd={addToTeam} inTeam={!!team.find((m) => m.id === c.id)} />
              ))}
          </div>
        </div>

        {/* Right: team summary */}
        <div className="space-y-3">
          <div className="bg-white p-4 shadow-[0_2px_8px_rgba(31,42,56,0.06)] rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-navy font-bold text-sm">الفريق المختار</p>
              <span className="text-xs bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded-full">
                {team.length} فرد
              </span>
            </div>

            {team.length === 0 ? (
              <div className="py-6 text-center text-charcoal/40 text-xs">
                <Users size={24} className="mx-auto mb-2 opacity-30" />
                ابدأ بإضافة كوادر من القائمة
              </div>
            ) : (
              <div className="space-y-2">
                {team.map((m) => {
                  const r = ROLES_CATALOG.find((rl) => rl.id === m.role);
                  return (
                    <div key={m.id} className="flex items-center gap-2 py-2 border-b border-navy/10 last:border-0">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {m.name.split(' ').pop()[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-navy text-xs font-medium truncate">{m.name}</p>
                        <p className="text-charcoal/50 text-[10px]">{r?.title}</p>
                      </div>
                      <p className="text-charcoal/60 text-xs shrink-0">${r?.rate?.toLocaleString()}</p>
                      <button onClick={() => removeFromTeam(m.id)} className="text-charcoal/30 hover:text-red-500 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {team.length > 0 && (
              <div className="mt-4 pt-3 border-t border-navy/10 space-y-1">
                {['engineering','management','legal','finance'].map((cat) => {
                  const catTotal = team.reduce((acc, m) => {
                    const r = ROLES_CATALOG.find((rl) => rl.id === m.role);
                    return r?.category === cat ? acc + r.rate : acc;
                  }, 0);
                  if (!catTotal) return null;
                  return (
                    <div key={cat} className="flex justify-between text-xs text-charcoal/60">
                      <span>{cat === 'engineering' ? 'هندسة' : cat === 'management' ? 'إدارة' : cat === 'legal' ? 'قانون' : 'مالية'}</span>
                      <span>${catTotal.toLocaleString()}</span>
                    </div>
                  );
                })}
                <div className="flex justify-between text-sm font-bold pt-1 border-t border-navy/10">
                  <span className="text-navy">الإجمالي / شهر</span>
                  <span className="text-cta">${totalMonthlyCost.toLocaleString()}</span>
                </div>
                <p className="text-charcoal/40 text-xs">سنوياً: ${(totalMonthlyCost * 12).toLocaleString()}</p>
              </div>
            )}
          </div>

          {team.length > 0 && (
            <button onClick={() => setSent(true)}
              className="btn-cta w-full flex items-center justify-center gap-2">
              <Send size={16} />
              إرسال عروض التوظيف ({team.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
