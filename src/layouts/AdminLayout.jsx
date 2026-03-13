import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Menu, X, 
  BookOpen, CreditCard, UserCircle, Search, Receipt, 
  History, ClipboardList, GraduationCap // <-- DAGDAG NA ICONS
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout, user, branding } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // --- ROLE-BASED NAVIGATION CONFIG ---
  const menuConfig = {
    admin: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
      { icon: <Settings size={20} />, label: 'Branding Engine', path: '/admin/branding' },
    ],
    // ==========================================
    // NA-UPDATE NA REGISTRAR FLOW
    // ==========================================
    registrar: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/registrar/dashboard' },
      { icon: <UserCircle size={20} />, label: 'Student Masterlist', path: '/registrar/students' },
      { icon: <ClipboardList size={20} />, label: 'Enrollment Module', path: '/registrar/enrollment' },
      { icon: <GraduationCap size={20} />, label: 'Class Assignments', path: '/registrar/assignments' },
    ],
    teacher: [
      { icon: <LayoutDashboard size={20} />, label: 'LMS Dashboard', path: '/teacher/dashboard' },
      { icon: <BookOpen size={20} />, label: 'My Lessons', path: '/teacher/lessons' },
    ],
    cashier: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/cashier/dashboard' },
      { icon: <Search size={20} />, label: 'Student Billing', path: '/cashier/billing' },
      { icon: <CreditCard size={20} />, label: 'Process Payment', path: '/cashier/payments' },
      { icon: <Receipt size={20} />, label: 'Scholarships', path: '/cashier/scholarships' },
      { icon: <History size={20} />, label: 'Collection Reports', path: '/cashier/reports' },
    ]
  };

  const currentMenu = menuConfig[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-slate-50 relative font-sans">
      
      {/* 1. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-0 shadow-2xl
      `}>
        {/* SIDEBAR HEADER (LOGO & SCHOOL NAME) */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {branding.school_logo ? (
              <img src={branding.school_logo} alt="Logo" className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold transition-colors"
                style={{ backgroundColor: branding.theme_color || '#2563eb' }}
              >
                {branding.school_name?.charAt(0)}
              </div>
            )}
            <span className="text-lg font-bold text-white tracking-tight truncate max-w-[140px]">
              {branding.school_name}
            </span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Main Menu</p>
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <Link 
                key={index} 
                to={item.path} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'text-white shadow-lg' 
                    : 'hover:bg-slate-800 hover:text-white'}`}
                style={isActive ? { backgroundColor: branding.theme_color || '#2563eb' } : {}}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3 mb-4 px-2">
             <div 
               className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-600"
               style={{ color: branding.theme_color || '#2563eb' }}
             >
                {user?.role?.toUpperCase().charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user?.role}</p>
             </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center space-x-3 p-3 w-full rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-xl bg-slate-50 text-slate-600 lg:hidden hover:bg-slate-100"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-slate-800 font-bold text-sm lg:text-base capitalize tracking-tight">
               {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name}</p>
                <p 
                  className="text-[10px] font-medium uppercase mt-1 italic"
                  style={{ color: branding.theme_color || '#2563eb' }}
                >
                  System Verified
                </p>
            </div>
            <div 
              className="w-10 h-10 text-white rounded-xl flex items-center justify-center font-bold shadow-md transition-colors"
              style={{ backgroundColor: branding.theme_color || '#2563eb' }}
            >
              {user?.full_name?.charAt(0)}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;