import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const id = setTimeout(() => setTimedOut(true), 15000);
    return () => clearTimeout(id);
  }, [loading]);

  if (loading) {
    if (timedOut) {
      return (
        <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-3" dir="rtl">
          <p className="text-navy font-bold text-sm">تعذّر التحقق من الجلسة</p>
          <button onClick={() => window.location.reload()} className="bg-brand text-white text-xs font-bold px-4 py-2 rounded-xl">إعادة المحاولة</button>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" state={{ accessDenied: true, requiredRole: roles[0] }} replace />;
  }
  return children;
}
