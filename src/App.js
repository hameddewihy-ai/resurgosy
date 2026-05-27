import { lazy, Suspense, useEffect, Component } from 'react';
import * as Sentry from '@sentry/react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import { GlobalProvider } from './context/GlobalContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CrossHintBanner from './components/CrossHintBanner';
import AIChatWidget from './components/ui/AIChatWidget';
import BottomNav from './components/ui/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import PageSkeleton from './components/ui/PageSkeleton';
import OfflineBanner from './components/OfflineBanner';

// ── Eager (critical path) ────────────────────────────────────────────────────
import HomePage    from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';

// ── Lazy — split per route ───────────────────────────────────────────────────
const AuthPage              = lazy(() => import('./pages/AuthPage'));
const PropertiesPage        = lazy(() => import('./pages/PropertiesPage'));
const PropertyDetailPage    = lazy(() => import('./pages/PropertyDetailPage'));
const JobsPage              = lazy(() => import('./pages/JobsPage'));
const StudiesPage           = lazy(() => import('./pages/StudiesPage'));
const InvestPage            = lazy(() => import('./pages/InvestPage'));
const DashboardPage         = lazy(() => import('./pages/DashboardPage'));
const NewsPage              = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage        = lazy(() => import('./pages/NewsDetailPage'));
const NewsCMSPage           = lazy(() => import('./pages/admin/NewsCMSPage'));
const MasterAdminDashboard  = lazy(() => import('./pages/admin/MasterAdminDashboard'));
const AddPropertyPage       = lazy(() => import('./pages/owner/AddPropertyPage'));
const EditPropertyPage      = lazy(() => import('./pages/owner/EditPropertyPage'));
const EngineerDashboard     = lazy(() => import('./pages/engineer/EngineerDashboard'));
const InvestorVIP           = lazy(() => import('./pages/investor/InvestorVIP'));
const ClearingDashboard     = lazy(() => import('./pages/clearing/ClearingDashboard'));
const ClearingServicePage   = lazy(() => import('./pages/clearing/ClearingServicePage'));
const ContractorDashboard   = lazy(() => import('./pages/contractor/ContractorDashboard'));
const DeveloperDashboard    = lazy(() => import('./pages/developer/DeveloperDashboard'));
const WalletDashboard       = lazy(() => import('./pages/wallet/WalletDashboard'));
const EquipmentPage         = lazy(() => import('./pages/EquipmentPage'));
const FinishingPage         = lazy(() => import('./pages/finishing/FinishingPage'));
const FinishingRFQPage      = lazy(() => import('./pages/finishing/FinishingRFQPage'));
const FinishingCompaniesPage      = lazy(() => import('./pages/finishing/FinishingCompaniesPage'));
const FinishingCompanyProfilePage = lazy(() => import('./pages/finishing/FinishingCompanyProfilePage'));
const FinishingGalleryPage        = lazy(() => import('./pages/finishing/FinishingGalleryPage'));
const FinishingPricesPage         = lazy(() => import('./pages/finishing/FinishingPricesPage'));
const ExpatDashboardPage          = lazy(() => import('./pages/finishing/ExpatDashboardPage'));
const FinishingCompanyDashboard   = lazy(() => import('./pages/finishing/FinishingCompanyDashboard'));
const MyEquipmentPage       = lazy(() => import('./pages/equipment/MyEquipmentPage'));
const HandoverProtocolPage  = lazy(() => import('./pages/equipment/HandoverProtocolPage'));
const ValuationRequestPage  = lazy(() => import('./pages/realestate/ValuationRequestPage'));
const ValuationPage         = lazy(() => import('./pages/ValuationPage'));
const AppraiserDashboard    = lazy(() => import('./pages/valuation/AppraiserDashboard'));
const DevelopersPage        = lazy(() => import('./pages/DevelopersPage'));
const CrowdfundPage         = lazy(() => import('./pages/CrowdfundPage'));
const CrowdfundDetailPage   = lazy(() => import('./pages/CrowdfundDetailPage'));
const PlatformPerformancePage = lazy(() => import('./pages/PlatformPerformancePage'));
const MarketReportsPage       = lazy(() => import('./pages/MarketReportsPage'));
const DemandHeatmapPage     = lazy(() => import('./pages/DemandHeatmapPage'));
const AboutPage             = lazy(() => import('./pages/AboutPage'));
const PrivacyPage           = lazy(() => import('./pages/PrivacyPage'));
const TermsPage             = lazy(() => import('./pages/TermsPage'));
const ProfilePage           = lazy(() => import('./pages/ProfilePage'));
const ResetPasswordPage     = lazy(() => import('./pages/auth/ResetPasswordPage'));
const ConfirmPage           = lazy(() => import('./pages/auth/ConfirmPage'));

class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { Sentry.captureException(error, { extra: info }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-cream text-navy" dir="rtl">
          <p className="text-2xl font-black">حدث خطأ في تحميل الصفحة</p>
          <p className="text-charcoal/60 text-sm">يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً</p>
          <button onClick={() => window.location.reload()} className="bg-brand text-white font-bold px-6 py-2 rounded-xl text-sm">إعادة التحميل</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [pathname]);
  return null;
}

// ── Inner layout — needs useLocation (must be inside BrowserRouter) ──────────
function AppContent() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <OfflineBanner />
      <Navbar />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              <Route path="/"                      element={<HomePage />} />
              <Route path="/auth"                  element={<AuthPage />} />
              <Route path="/properties"            element={<PropertiesPage />} />
              <Route path="/properties/:id"        element={<PropertyDetailPage />} />
              <Route path="/jobs"                  element={<JobsPage />} />
              <Route path="/studies"               element={<StudiesPage />} />
              <Route path="/invest"                element={<InvestPage />} />
              <Route path="/news"                  element={<NewsPage />} />
              <Route path="/news/:id"              element={<NewsDetailPage />} />
              <Route path="/admin/news"            element={<PrivateRoute roles={['admin']}><NewsCMSPage /></PrivateRoute>} />
              <Route path="/admin/dashboard"       element={<PrivateRoute roles={['admin']}><MasterAdminDashboard /></PrivateRoute>} />
              <Route path="/equipment"             element={<EquipmentPage />} />
              <Route path="/finishing"             element={<FinishingPage />} />
              <Route path="/finishing/rfq"         element={<FinishingRFQPage />} />
              <Route path="/finishing/companies"     element={<FinishingCompaniesPage />} />
              <Route path="/finishing/companies/:id" element={<FinishingCompanyProfilePage />} />
              <Route path="/finishing/gallery"       element={<FinishingGalleryPage />} />
              <Route path="/finishing/prices"        element={<FinishingPricesPage />} />
              <Route path="/finishing/expat"            element={<PrivateRoute roles={['finishing_co','admin']}><ExpatDashboardPage /></PrivateRoute>} />
              <Route path="/finishing/company-dashboard" element={<PrivateRoute roles={['finishing_co','admin']}><FinishingCompanyDashboard /></PrivateRoute>} />
              <Route path="/developers"            element={<DevelopersPage />} />
              <Route path="/crowdfund"             element={<CrowdfundPage />} />
              <Route path="/crowdfund/track-record" element={<PlatformPerformancePage />} />
              <Route path="/crowdfund/:id"         element={<CrowdfundDetailPage />} />
              <Route path="/dashboard"             element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/owner/add-property"    element={<PrivateRoute roles={['owner','admin']}><AddPropertyPage /></PrivateRoute>} />
              <Route path="/owner/edit-property/:id" element={<PrivateRoute roles={['owner','admin']}><EditPropertyPage /></PrivateRoute>} />
              <Route path="/engineer/dashboard"    element={<PrivateRoute roles={['engineer','admin']}><EngineerDashboard /></PrivateRoute>} />
              <Route path="/investor/vip"          element={<PrivateRoute roles={['investor','admin']}><InvestorVIP /></PrivateRoute>} />
              <Route path="/clearing"              element={<ClearingServicePage />} />
              <Route path="/clearing/dashboard"    element={<PrivateRoute roles={['internal_clerk','admin']}><ClearingDashboard /></PrivateRoute>} />
              <Route path="/contractor/dashboard"  element={<PrivateRoute roles={['contractor','admin']}><ContractorDashboard /></PrivateRoute>} />
              <Route path="/developer/dashboard"   element={<PrivateRoute roles={['developer','admin']}><DeveloperDashboard /></PrivateRoute>} />
              <Route path="/wallet"                element={<PrivateRoute><WalletDashboard /></PrivateRoute>} />
              <Route path="/my-equipment"          element={<PrivateRoute><MyEquipmentPage /></PrivateRoute>} />
              <Route path="/handover/:contractId"  element={<PrivateRoute><HandoverProtocolPage /></PrivateRoute>} />
              <Route path="/heatmap"               element={<DemandHeatmapPage />} />
              <Route path="/market-reports"        element={<MarketReportsPage />} />
              <Route path="/valuation"                      element={<ValuationPage />} />
              <Route path="/valuation-request"              element={<PrivateRoute><ValuationRequestPage /></PrivateRoute>} />
              <Route path="/valuation/appraiser-dashboard"  element={<PrivateRoute roles={['appraiser','admin']}><AppraiserDashboard /></PrivateRoute>} />
              <Route path="/about"                 element={<AboutPage />} />
              <Route path="/privacy"               element={<PrivacyPage />} />
              <Route path="/terms"                 element={<TermsPage />} />
              <Route path="/profile"               element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/auth/confirm"           element={<ConfirmPage />} />
              <Route path="/auth/reset-password"   element={<ResetPasswordPage />} />
              <Route path="*"                      element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>

      <Footer />
      <CrossHintBanner />
      <WhatsAppButton />
      <AIChatWidget />
      <BottomNav />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
    <AuthProvider>
    <GlobalProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#1E293B', color: '#fff', border: '1px solid #334155', borderRadius: '12px' },
            success: { iconTheme: { primary: '#5B7DBE', secondary: '#fff' } },
          }}
        />
        <AppContent />
      </BrowserRouter>
    </GlobalProvider>
    </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
