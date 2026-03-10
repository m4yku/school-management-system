import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicRoute from './components/routing/PublicRoute'; // I-import ito
import AdminLayout from './layouts/AdminLayout'; // Import ang layout
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import UserManagement from './pages/admin/UserManagement';


// 2. Import ang Pages
import Login from './pages/auth/Login';

// Placeholder Components (Para hindi mag-error habang wala pang separate files)
const AdminDashboard = () => (
  <div className="p-10">
    <h1 className="text-3xl font-bold text-blue-600">Admin Dashboard</h1>
    <p className="mt-2 text-slate-600">Welcome to the Command Center.</p>
  </div>
);

const Unauthorized = () => (
  <div className="p-10 text-center">
    <h1 className="text-2xl font-bold text-red-600">404 - Unauthorized Access</h1>
    <p>Wala kang permiso na makita ang page na ito.</p>
    <a href="/" className="text-blue-500 underline">Balik sa Login</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 1. PUBLIC ROUTES (Walang Sidebar) */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* 2. ADMIN ROUTES (May Sidebar dahil sa AdminLayout) */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            {/* DITO MO ILALAGAY ANG MGA PAGES NA GUSTO MONG MAY SIDEBAR */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="branding" element={<div>Branding Page Content</div>} />
          </Route>

          {/* 3. FALLBACK */}
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;