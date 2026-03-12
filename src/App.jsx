import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';
import SetupPassword from './pages/auth/SetupPassword'; // O kung saan mo man sinave
import ForgotPassword from './pages/auth/ForgotPassword'; // <-- Siguraduhin na tama ang path
import ResetPassword from './pages/auth/ResetPassword';
import StudentManagement from './pages/registrar/StudentManagement'; // (Palitan path depende sa kung saan mo sinave)
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAccounting from './pages/student/StudentAccounting';
import PaymentDashboard from './pages/cashier/PaymentDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';


// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages
import LandingPage from './pages/landingpage'; // Ang bagong "Front Door"
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

          {/* Kung gumagamit ka ng ProtectedRoute, ganito: */}
          <Route path="student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
          <Route path="student/accounting" element={<ProtectedRoute allowedRoles={['student']}><StudentAccounting /></ProtectedRoute>} />

{/* O kung basic Route lang muna: */}
{/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}

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
            <Route path="dashboard" element={<CashierDashboard />} />
            <Route path="payments" element={<PaymentDashboard />} />
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

          {/* 6. LMS / STUDENTS ROUTES (Kay Joshua) */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="accounting" element={<StudentAccounting />} />
          </Route>

          {/* 7. REGISTRAR ROUTES (Coming Soon) */}
          <Route path="/registrar" element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <AdminLayout />
            </ProtectedRoute>
          }>

            <Route path="/registrar/students" element={<ProtectedRoute allowedRoles={['registrar']}><StudentManagement /></ProtectedRoute>}/>
            <Route path="dashboard" element={<div className="p-10 text-2xl font-bold text-blue-600">Registrar Command Center</div>} />
            <Route path="students" element={<div className="p-10 text-2xl font-bold">Student Records (Registrar)</div>} />
          </Route>

          {/* 8. FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;