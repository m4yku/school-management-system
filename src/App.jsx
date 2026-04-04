import React from 'react';
// React Required Libraries
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Account Auth
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/routing/ProtectedRoute';
import PublicRoute from './components/routing/PublicRoute';
import SetupPassword from './pages/auth/SetupPassword'; 
import ForgotPassword from './pages/auth/ForgotPassword'; 
import ResetPassword from './pages/auth/ResetPassword';

// ==========================================
// REGISTRAR PAGES (Na-update para sa bagong flow)
// ==========================================
import RegistrarDashboard from './pages/registrar/RegistrarDashboard'; // Placeholder/Gagawin pa
import StudentManagement from './pages/registrar/StudentManagement'; // Dito ang Profile & Print Profile
import EnrollmentModule from './pages/registrar/EnrollmentModule';   // Dito ang Fees, Pending/Enrolled, Print COR
import TeacherAssignments from './pages/registrar/ClassAssignments'; // Dito ang pag-assign ng Teacher sa Subjects
import StudentRequests from './pages/registrar/StudentRequests'; // <--- Ito yung bagong page
import AcademicPrograms from './pages/registrar/AcademicPrograms'; // <--- BAGONG DAGDAG
import ScholarshipApplications from './pages/registrar/ScholarshipApplications';
import RegistrarSubjects from './pages/registrar/RegistrarSubjects';
import SectionManagement from './pages/registrar/SectionManagement'; // <--- BAGONG DAGDAG
// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAccounting from './pages/student/StudentAccounting';
import StudentLms from './pages/student/StudentLms';
import StudentScholarship from './pages/student/StudentScholarship';

// Cashier Pages
import PaymentDashboard from './pages/cashier/PaymentDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';
import StudentBilling from './pages/cashier/StudentBilling';
import FeeCatalog from './pages/cashier/FeeCatalog';
import Scholarships from './pages/cashier/Scholarships';
import CollectionReports from './pages/cashier/CollectionReports';
import ScholarshipCatalog from './pages/cashier/ScholarshipCatalog';

// Teacher Pages
import TeacherDashboard from './pages/teacher/teacherdashboard';
import TeacherNotify from './pages/teacher/TeacherNotify'; 
import TeacherProfile from './pages/teacher/TeacherProfile';
import TeacherClasses from './pages/teacher/TeacherClasses';
import GradeManagement from './pages/teacher/GradeManagement';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherActivities from './pages/teacher/TeacherActivities';
import TeacherActivityGrading from './pages/teacher/TeacherActivityGrading';
import CreateExam from './pages/teacher/CreateExam';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import StudentLayout from './layouts/StudentLayout';
import TeacherLayout from './layouts/TeacherLayout';

// Pages
import LandingPage from './pages/landingpage'; 
import Login from './pages/auth/Login';
import UserManagement from './pages/admin/UserManagement';
import BrandingSettings from './pages/admin/BrandingSettings';
import RoomManagement from './pages/admin/RoomManagement';


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
          <Route path="/login" element={<PublicRoute><Login portal="student" /></PublicRoute>} />
          <Route path="/staff/login" element={<PublicRoute><Login portal="staff" /></PublicRoute>} />
          <Route path="/portal/admin-access" element={<PublicRoute><Login portal="admin" /></PublicRoute>} />

          {/* ACCOUNT SETUP ROUTE (Public) */}
          <Route path="/setup-password" element={<PublicRoute><SetupPassword /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* 3. ADMIN ROUTES */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="branding" element={<BrandingSettings />} />
            <Route path="rooms" element={<RoomManagement />} />
          </Route>

          {/* 4. CASHIER ROUTES */}
          <Route path="/cashier" element={
            <ProtectedRoute allowedRoles={['cashier']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CashierDashboard />} />
            <Route path="billing" element={<StudentBilling />} />     
            <Route path="payments" element={<PaymentDashboard />} />
            <Route path="fees" element={<FeeCatalog />} />
            <Route path="scholarships" element={<Scholarships />} />  
            <Route path="scholarship-catalog" element={<ScholarshipCatalog />} />
            <Route path="reports" element={<CollectionReports />} />  
          </Route>

          {/* 5. LMS / TEACHER ROUTES */}
          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="announcements" element={<TeacherNotify />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="profile" element={<TeacherProfile />} />
            <Route path="/teacher/sections/:classId" element={<GradeManagement />} />
            <Route path="/teacher/grades/:classId" element={<GradeManagement />} />
            <Route path="activities" element={<TeacherActivities />} />
            <Route path="activities/:classId" element={<TeacherActivities />} />
            <Route path="/teacher/activities/create-exam" element={<CreateExam />} />
          <Route path="activities/:activityId/grading" element={<TeacherActivityGrading />} />
          </Route>

          {/* 6. LMS / STUDENTS ROUTES */}
<Route path="/student" element={
  <ProtectedRoute allowedRoles={['student']}>
    <StudentLayout/>
  </ProtectedRoute>
}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<StudentDashboard />} />
  <Route path="lms" element={<StudentLms />} />
  <Route path="accounting" element={<StudentAccounting />} />
  <Route path="scholarship" element={<StudentScholarship />} /> {/* <--- BAGONG DAGDAG */}
</Route>

          {/* ============================================================== */}
          {/* 7. REGISTRAR ROUTES (NEW FLOW IMPLEMENTED) */}
          {/* ============================================================== */}
          <Route path="/registrar" element={
            <ProtectedRoute allowedRoles={['registrar']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            {/* Kapag nag-type ng /registrar, ire-redirect agad sa dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            
            {/* Sidenav Item 1: Dashboard */}
            <Route path="dashboard" element={<RegistrarDashboard />} />
            
            {/* Sidenav Item 2: Masterlist & Profiles */}
            <Route path="students" element={<StudentManagement />} />
            
            {/* BAGONG DAGDAG - Sidenav Item 3: Student Requests */}
            <Route path="requests" element={<StudentRequests />} />

            {/* Sidenav Item 4: Enrollment Module */}
            <Route path="enrollment" element={<EnrollmentModule />} />

            {/* Sidenav Item 5: Academic Programs */}
            <Route path="programs" element={<AcademicPrograms />} />
            
            {/* Sidenav Item 6: Teacher & Class Assignments */}
            <Route path="assignments" element={<TeacherAssignments />} />

            {/* Sidenav Item 7: Scholarship Applications */}
            <Route path="scholarships" element={<ScholarshipApplications />} />

            {/* FIX: Inalis ang "/registrar/" para maging relative path tulad ng iba */}
            <Route path="subjects" element={<RegistrarSubjects />} />

            <Route path="sections" element={<SectionManagement />} />
            
          </Route>

          {/* 8. FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;