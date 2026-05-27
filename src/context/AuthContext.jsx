import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase, isConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export const ROLES = {
  seeker:        { label: 'باحث عقاري',   labelEn: 'Property Seeker',    icon: '🔍' },
  owner:         { label: 'مالك عقار',    labelEn: 'Property Owner',     icon: '🏠' },
  investor:      { label: 'مستثمر',       labelEn: 'Investor',           icon: '💼' },
  engineer:      { label: 'مهندس',        labelEn: 'Engineer',           icon: '🏗️' },
  developer:     { label: 'مطوّر',        labelEn: 'Developer',          icon: '🏢' },
  contractor:    { label: 'مقاول معدات',  labelEn: 'Equipment Provider', icon: '⚙️' },
  finishing_co:  { label: 'شركة إكساء',   labelEn: 'Finishing Company',  icon: '🔨' },
  internal_clerk:{ label: 'كاتب داخلي',  labelEn: 'Internal Clerk',     icon: '📋' },
  appraiser:     { label: 'خبير تقييم',  labelEn: 'Licensed Appraiser', icon: '🏅' },
  admin:         { label: 'مدير',         labelEn: 'Admin',              icon: '🛡️' },
};

const MOCK_KEY       = 'resurgo_user';
const MOCK_USERS_KEY = 'resurgo-registered-emails';

// Extract all stored fields from a Supabase session
function sessionToUser(session) {
  if (!session?.user) return null;
  const meta = session.user.user_metadata || {};
  return {
    id:                      session.user.id,
    email:                   session.user.email,
    email_confirmed:         !!session.user.email_confirmed_at,
    role:                    meta.role                    || 'seeker',
    full_name:               meta.full_name               || session.user.email?.split('@')[0] || '',
    phone:                   meta.phone                   || '',
    // Owner fields
    syrian_id_number:        meta.syrian_id_number        || '',
    province:                meta.province                || '',
    // Investor fields
    country_of_residence:    meta.country_of_residence    || '',
    investment_range:        meta.investment_range        || '',
    // Engineer fields
    professional_license_no: meta.professional_license_no || '',
    specialty:               meta.specialty               || '',
    syndicate_city:          meta.syndicate_city          || '',
    // Developer / Contractor / Finishing fields
    company_name:            meta.company_name            || '',
    commercial_register_no:  meta.commercial_register_no  || '',
    company_city:            meta.company_city            || '',
    contractor_specialty:    meta.contractor_specialty    || '',
    finishing_specialty:     meta.finishing_specialty     || '',
    work_areas:              meta.work_areas              || '',
    // Internal clerk fields
    department:              meta.department              || '',
    employee_id:             meta.employee_id             || '',
  };
}

// Merge profiles table data on top of auth metadata (profiles table wins)
function mergeProfile(u, profile) {
  if (!profile) return u;
  return {
    ...u,
    // profiles.role overrides JWT role — allows admin to assign roles without JWT refresh
    role:                    profile.role                    || u.role,
    full_name:               profile.full_name               || u.full_name,
    phone:                   profile.phone                   || u.phone,
    province:                profile.province                || u.province,
    syrian_id_number:        profile.national_id             || u.syrian_id_number,
    country_of_residence:    profile.country_of_residence    || u.country_of_residence,
    investment_range:        profile.investment_range        || u.investment_range,
    professional_license_no: profile.professional_license_no || u.professional_license_no,
    specialty:               profile.specialty               || u.specialty,
    company_name:            profile.company_name            || u.company_name,
    commercial_register_no:  profile.commercial_register_no  || u.commercial_register_no,
    department:              profile.department              || u.department,
    employee_id:             profile.employee_id             || u.employee_id,
  };
}

// Build a profiles row from the cleaned update object
function toProfileRow(uid, cleaned) {
  return {
    id:                      uid,
    full_name:               cleaned.full_name               || null,
    phone:                   cleaned.phone                   || null,
    province:                cleaned.province                || null,
    national_id:             cleaned.syrian_id_number        || null,
    country_of_residence:    cleaned.country_of_residence    || null,
    investment_range:        cleaned.investment_range        || null,
    professional_license_no: cleaned.professional_license_no || null,
    specialty:               cleaned.specialty               || null,
    company_name:            cleaned.company_name            || null,
    commercial_register_no:  cleaned.commercial_register_no  || null,
    department:              cleaned.department              || null,
    employee_id:             cleaned.employee_id             || null,
    updated_at:              new Date().toISOString(),
  };
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConfigured) {
      try {
        const saved = localStorage.getItem(MOCK_KEY);
        if (saved) setUser(JSON.parse(saved));
      } catch {}
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Force-refresh the JWT so any SQL role changes take effect immediately
        const { data: refreshed } = await supabase.auth.refreshSession();
        const activeSession = refreshed?.session ?? session;
        const base = sessionToUser(activeSession);
        if (base) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', base.id).single();
          setUser(mergeProfile(base, profile));
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const base = sessionToUser(session);
      if (base) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', base.id).single();
        setUser(mergeProfile(base, profile));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Persist mock user
  useEffect(() => {
    if (isConfigured) return;
    if (user) {
      localStorage.setItem(MOCK_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_KEY);
    }
  }, [user]);

  // ── login ───────────────────────────────────────────────────
  const login = async (email, password, roleHint = 'seeker') => {
    if (!isConfigured) {
      const isMockAdmin = email.toLowerCase().includes('admin');
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        role: isMockAdmin ? 'admin' : roleHint,
        full_name: isMockAdmin ? 'مدير النظام' : email.split('@')[0],
        email_confirmed: true,
        phone: '', province: '', syrian_id_number: '',
        country_of_residence: '', investment_range: '',
        professional_license_no: '', specialty: '', syndicate_city: '',
        company_name: '', commercial_register_no: '', company_city: '',
        contractor_specialty: '', finishing_specialty: '', work_areas: '',
        department: '', employee_id: '',
      };
      setUser(mockUser);
      toast.success(`مرحباً ${mockUser.full_name} 👋`);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success('مرحباً بعودتك 👋');
  };

  // ── register ────────────────────────────────────────────────
  const register = async (data) => {
    if (!isConfigured) {
      const registeredEmails = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
      if (registeredEmails.includes(data.email.toLowerCase())) {
        throw new Error('البريد الإلكتروني مسجّل مسبقاً. يرجى تسجيل الدخول.');
      }
      const mockUser = {
        id: crypto.randomUUID(),
        email:                   data.email,
        role:                    data.role                    || 'seeker',
        full_name:               data.full_name               || data.email.split('@')[0],
        email_confirmed:         true,
        phone:                   data.phone                   || '',
        syrian_id_number:        data.syrian_id_number        || '',
        province:                data.province                || '',
        country_of_residence:    data.country_of_residence    || '',
        investment_range:        data.investment_range        || '',
        professional_license_no: data.professional_license_no || '',
        specialty:               data.specialty               || '',
        syndicate_city:          data.syndicate_city          || '',
        company_name:            data.company_name            || '',
        commercial_register_no:  data.commercial_register_no  || '',
        company_city:            data.company_city            || '',
        contractor_specialty:    data.contractor_specialty    || '',
        finishing_specialty:     data.finishing_specialty     || '',
        work_areas:              data.work_areas              || '',
        department:              data.department              || '',
        employee_id:             data.employee_id             || '',
      };
      setUser(mockUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([...registeredEmails, data.email.toLowerCase()]));
      return;
    }

    const { data: signUpData, error } = await supabase.auth.signUp({
      email:    data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          role:                    data.role                    || 'seeker',
          full_name:               data.full_name               || '',
          phone:                   data.phone                   || '',
          syrian_id_number:        data.syrian_id_number        || '',
          province:                data.province                || '',
          country_of_residence:    data.country_of_residence    || '',
          investment_range:        data.investment_range        || '',
          professional_license_no: data.professional_license_no || '',
          specialty:               data.specialty               || '',
          syndicate_city:          data.syndicate_city          || '',
          company_name:            data.company_name            || '',
          commercial_register_no:  data.commercial_register_no  || '',
          company_city:            data.company_city            || '',
          contractor_specialty:    data.contractor_specialty    || '',
          finishing_specialty:     data.finishing_specialty     || '',
          work_areas:              data.work_areas              || '',
          department:              data.department              || '',
          employee_id:             data.employee_id             || '',
        },
      },
    });
    if (error) throw error;
    // Create profiles row immediately (best-effort — may fail before email confirm)
    if (signUpData?.user?.id) {
      await supabase.from('profiles').upsert(toProfileRow(signUpData.user.id, data)).catch(() => {});
    }
  };

  // ── resetPassword ───────────────────────────────────────────
  const resetPassword = async (email) => {
    if (!isConfigured) {
      // Mock: pretend email was sent
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  // ── updateProfile ───────────────────────────────────────────
  const updateProfile = async (updates) => {
    const cleaned = Object.fromEntries(
      Object.entries(updates).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
    );
    if (!isConfigured) {
      setUser(prev => ({ ...prev, ...cleaned }));
      toast.success('تم حفظ التغييرات');
      return;
    }
    const { error } = await supabase.auth.updateUser({ data: cleaned });
    if (error) throw error;
    await supabase.from('profiles').upsert(toProfileRow(user.id, cleaned));
    setUser(prev => ({ ...prev, ...cleaned }));
    toast.success('تم حفظ التغييرات');
  };

  // ── updatePassword ──────────────────────────────────────────
  const updatePassword = async (newPassword) => {
    if (!isConfigured) {
      toast.success('تم تغيير كلمة المرور بنجاح');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    toast.success('تم تغيير كلمة المرور بنجاح');
  };

  // ── logout ──────────────────────────────────────────────────
  const logout = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
    }
    toast('تم تسجيل الخروج', { icon: '👋' });
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, resetPassword, updateProfile, updatePassword, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
