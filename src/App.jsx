import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';
import SetupPassword from './pages/auth/SetupPassword'; // O kung saan mo man sinave
import ForgotPassword from './pages/auth/ForgotPassword'; // <-- Siguraduhin na tama ang path
import ResetPassword from './pages/auth/ResetPassword';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import LandingPage from './pages/LandingPage'; // Ang bagong "Front Door"
import Login from './pages/auth/Login';
import UserManagement from './pages/admin/UserManagement';
import BrandingSettings from './pages/admin/BrandingSettings';

// Placeholder Components
const AdminDashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-blue-600 tracking-tight">Admin Dashboard</h1>
    <p className="mt-2 text-slate-600 font-medium">Welcome to the Command Center.</p>
  </div>
);

const Unauthorized = () => (
  <div className="h-screen flex flex-col items-center justify-center p-10 text-center bg-slate-50">
    <h1 className="text-6xl font-black text-slate-200 mb-4">403</h1>
    <h2 className="text-2xl font-bold text-red-600 mb-2">Unauthorized Access</h2>
    <p className="text-slate-500 mb-6">Wala kang permiso na makita ang page na ito.</p>
    <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-200">Balik sa Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. THE FRONT DOOR (Default Page) */}
          <Route path="/" element={<LandingPage />} />
          
          {/* 2. AUTHENTICATION ROUTES */}
          {/* Student Login (Manggagaling sa Landing Page Form) */}
          <Route path="/login" element={<PublicRoute><Login portal="student" /></PublicRoute>} />
          
          {/* Staff Login (Registrar, Cashier, Teachers) */}
          <Route path="/staff/login" element={<PublicRoute><Login portal="staff" /></PublicRoute>} />
          
          {/* SECRET ADMIN LOGIN (Secret Path para sa Security) */}
          <Route path="/portal/admin-access" element={<PublicRoute><Login portal="admin" /></PublicRoute>} />

          {/* ACCOUNT SETUP ROUTE (Public) */}
          <Route path="/setup-password" element={<PublicRoute><SetupPassword /></PublicRoute>} />

          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* 3. ADMIN ROUTES (Gawa mo) */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="branding" element={<BrandingSettings />} />
          </Route>

          {/* 4. CASHIER ROUTES (Kay Harvey) */}
          <Route path="/cashier" element={
            <ProtectedRoute allowedRoles={['cashier']}>
              <AdminLayout /> 
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<div className="p-10 text-2xl font-bold">Cashier Dashboard (Harvey)</div>} />
            <Route path="payments" element={<div className="p-10 text-2xl font-bold">Payments Module (Harvey)</div>} />
          </Route>

          {/* 5. LMS / TEACHER ROUTES (Kay Joshua) */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<div className="p-10 text-2xl font-bold">Teacher Dashboard (Joshua)</div>} />
            <Route path="lessons" element={<div className="p-10 text-2xl font-bold">Lessons Module (Joshua)</div>} />
          </Route>

          {/* 6. REGISTRAR ROUTES (Coming Soon) */}
          <Route path="/registrar" element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<div className="p-10 text-2xl font-bold text-blue-600">Registrar Command Center</div>} />
            <Route path="students" element={<div className="p-10 text-2xl font-bold">Student Records (Registrar)</div>} />
          </Route>

          {/* 7. FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;