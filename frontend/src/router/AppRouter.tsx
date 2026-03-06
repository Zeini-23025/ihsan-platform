import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

// ─── Layout ───────────────────────────────────────────────────────────────────
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ─── Pages ────────────────────────────────────────────────────────────────────
import LandingPage from '../pages/LandingPage';
import Catalog from '../pages/public/Catalog';
import PublicDashboard from '../pages/public/PublicDashboard';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NeedDetail from '../pages/donor/NeedDetail';
import Receipt from '../pages/donor/Receipt';
import DonorDashboard from '../pages/donor/DonorDashboard';
import ValidatorDashboard from '../pages/validator/ValidatorDashboard';
import CreateNeed from '../pages/validator/CreateNeed';
import ConfirmDelivery from '../pages/validator/ConfirmDelivery';
import PartnerDashboard from '../pages/partner/PartnerDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

// ─── Layout wrapper ──────────────────────────────────────────────────────────
const Layout: React.FC = () => (
  <>
    <Navbar />
    <main style={{ paddingTop: 64 }}>
      <Outlet />
    </main>
    <Footer />
  </>
);


// ─── GuestOnly guard ─────────────────────────────────────────────────────────
const GuestOnly: React.FC = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();
  if (isAuthenticated) return <Navigate to={getDashboardPath()} replace />;
  return <Outlet />;
};

// ─── RequireRole guard ────────────────────────────────────────────────────────
const RequireRole: React.FC<{ roles: Role[] }> = ({ roles }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user || !roles.includes(user.role as Role)) return <Navigate to="/" replace />;
  return <Outlet />;
};

// (Removed unused RequireAuth guard to avoid unused declaration errors)

// ─── AppRouter ────────────────────────────────────────────────────────────────
const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/dashboard" element={<PublicDashboard />} />
        <Route path="/needs/:id" element={<NeedDetail />} />

        {/* Guest-only routes */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Donor routes */}
        <Route element={<RequireRole roles={['DONNEUR']} />}>
          <Route path="/receipt/:id" element={<Receipt />} />
          <Route path="/my-donations" element={<DonorDashboard />} />
        </Route>

        {/* Validator routes */}
        <Route element={<RequireRole roles={['VALIDATEUR']} />}>
          <Route path="/validator" element={<ValidatorDashboard />} />
          <Route path="/validator/new-need" element={<CreateNeed />} />
          <Route path="/validator/confirm/:id" element={<ConfirmDelivery />} />
        </Route>

        {/* Partner routes */}
        <Route element={<RequireRole roles={['PARTENAIRE']} />}>
          <Route path="/partner" element={<PartnerDashboard />} />
        </Route>

        {/* Admin routes */}
        <Route element={<RequireRole roles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default AppRouter;
