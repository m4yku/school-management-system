import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Menu, X, 
  BookOpen, CreditCard, UserCircle, Search, Receipt, 
  History, ClipboardList, GraduationCap, Layers, FileText,
  Library, Award, ChevronLeft, ChevronRight, MapPin
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import UserProfileModal from '../components/admin/UserProfileModal'; 

const AdminLayout = () => {
  const { logout, user, branding, API_BASE_URL } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuConfig = {
    admin: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
      { icon: <Settings size={20} />, label: 'Branding Engine', path: '/admin/branding' },
      { icon: <MapPin size={20} />, label: 'Room Management', path: '/admin/rooms' },
    ],
    registrar: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/registrar/dashboard' },
      { icon: <UserCircle size={20} />, label: 'Student Masterlist', path: '/registrar/students' },
      { type: 'header', label: 'Academics' }, 
      { icon: <Library size={20} />, label: 'Academic Programs', path: '/registrar/programs' }, 
      { icon: <BookOpen size={20} />, label: 'Subject Management', path: '/registrar/subjects'},
      { icon: <GraduationCap size={20} />, label: 'Class Assignments', path: '/registrar/assignments' },
      { type: 'header', label: 'Enrollment & Requests' },
      { icon: <ClipboardList size={20} />, label: 'Enrollment Module', path: '/registrar/enrollment' },
      { icon: <FileText size={20} />, label: 'Student Requests', path: '/registrar/requests' }, 
      { icon: <Award size={20} />, label: 'Scholarship Applications', path: '/registrar/scholarships' },
      { icon: <Layers size={20} />, label: 'Section Management', path: '/registrar/sections' },
    ],
    teacher: [
      { icon: <LayoutDashboard size={20} />, label: 'LMS Dashboard', path: '/teacher/dashboard' },
      { icon: <BookOpen size={20} />, label: 'My Lessons', path: '/teacher/lessons' },
    ],
    cashier: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/cashier/dashboard' },
      { icon: <Search size={20} />, label: 'Student Billing', path: '/cashier/billing' },
      { icon: <CreditCard size={20} />, label: 'Process Payment', path: '/cashier/payments' },
      { icon: <Layers size={20} />, label: 'Fee Catalog', path: '/cashier/fees' },
      { icon: <Receipt size={20} />, label: 'Scholarships', path: '/cashier/scholarships' },
      { icon: <BookOpen size={20} />, label: 'Scholarship Catalog', path: '/cashier/scholarship-catalog' },
      { icon: <History size={20} />, label: 'Collection Reports', path: '/cashier/reports' },
    ]
  };

  const currentMenu = menuConfig[user?.role] || [];

  return (
    <div className="flex h-screen bg-slate-50 relative font-sans overflow-hidden">
      
      {/* 1. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. FLOATING SIDEBAR (COLLAPSIBLE) */}
      <aside className={`
        fixed z-50 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out shadow-2xl
        inset-y-0 left-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 lg:rounded-[2rem]
        w-64 ${isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-64'} 
      `}>
        
        {/* SIDEBAR HEADER */}
        <div className={`h-20 px-4 border-b border-slate-800 flex items-center shrink-0 transition-all justify-between ${isCollapsed ? 'lg:justify-center' : 'lg:justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {branding.school_logo ? (
              <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-lg" />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg"
                style={{ backgroundColor: branding.theme_color || '#2563eb' }}
              >
                {branding.school_name?.charAt(0)}
              </div>
            )}
            
            {/* 🛑 ARCHITECT FIX: Pinalitan ang truncate ng line-clamp-2 at nilakihan ang width (w-36) para mag-wrap pababa */}
            <span className={`text-[15px] leading-tight font-black text-white tracking-tight transition-all duration-300 line-clamp-2 opacity-100 w-36 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
              {branding.school_name}
            </span>
          </div>
          
          <button className="lg:hidden text-slate-400 hover:text-white p-2 shrink-0" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {currentMenu.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div key={`header-${index}`} className={`pt-6 pb-2 transition-all duration-300 px-3 ${isCollapsed ? 'lg:text-center lg:px-0' : ''}`}>
                   <div className={`h-1.5 w-1.5 bg-slate-700 rounded-full mx-auto hidden ${isCollapsed ? 'lg:block' : ''}`} /> 
                   
                   <div className={`block ${isCollapsed ? 'lg:hidden' : ''}`}>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                      <div className="h-[1px] bg-slate-800 mt-2 w-full" />
                   </div>
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={index} 
                to={item.path} 
                onClick={() => setIsSidebarOpen(false)}
                title={isCollapsed ? item.label : ""}
                className={`flex items-center p-3 rounded-2xl transition-all duration-200 group relative gap-4
                  ${isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  ${isCollapsed ? 'lg:justify-center lg:gap-0' : ''}
                `}
                style={isActive ? { backgroundColor: branding.theme_color || '#2563eb' } : {}}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} shrink-0`}>
                  {item.icon}
                </span>
                
                <span className={`font-bold text-sm transition-all duration-300 whitespace-nowrap overflow-hidden w-auto opacity-100 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* TOGGLE EXPAND/COLLAPSE BUTTON */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-20 w-7 h-7 bg-white text-slate-800 rounded-full items-center justify-center shadow-lg border border-slate-200 hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        {/* USER INFO & LOGOUT FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0 lg:rounded-b-[2rem]">
          <div 
            className={`flex items-center mb-4 cursor-pointer hover:opacity-80 transition-all duration-300 w-full gap-3 px-2 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
            onClick={() => setIsProfileOpen(true)}
            title={isCollapsed ? "View Profile" : ""}
          >
             {user?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shrink-0" alt="Avatar"/>
             ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 border-slate-700 shrink-0"
                  style={{ color: branding.theme_color || '#2563eb' }}
                >
                  {user?.full_name?.charAt(0) || user?.role?.charAt(0)}
                </div>
             )}
             
             <div className={`overflow-hidden transition-all duration-300 flex-1 w-auto opacity-100 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
                {/* 🛑 ARCHITECT FIX: Pinalitan ang truncate ng text-xs at line-clamp-2 para mag-next line kapag mahaba ang pangalan */}
                <p className="text-[13px] leading-tight font-black text-white line-clamp-2 mb-0.5">{user?.full_name}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                  {user?.role}
                </p>
             </div>
          </div>

          <button 
            onClick={logout} 
            title={isCollapsed ? "Sign Out" : ""}
            className={`flex items-center p-3 rounded-2xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200 group w-full gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap overflow-hidden w-auto opacity-100 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-xl bg-slate-50 text-slate-600 lg:hidden hover:bg-slate-100 border border-slate-200"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-slate-800 font-black text-lg lg:text-xl capitalize tracking-tight">
               {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          <div 
            className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => setIsProfileOpen(true)}
          >
            <div className="hidden sm:block text-right">
                <p className="text-sm font-black text-slate-800 leading-none">{user?.full_name}</p>
                <p className="text-[10px] font-bold uppercase mt-1 tracking-widest" style={{ color: branding.theme_color || '#2563eb' }}>
                  System Verified
                </p>
            </div>
            {user?.profile_image ? (
               <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-12 h-12 rounded-[1rem] object-cover shadow-sm border-2 border-white ring-1 ring-slate-100" alt="Avatar"/>
            ) : (
              <div 
                className="w-12 h-12 text-white rounded-[1rem] flex items-center justify-center font-black shadow-sm"
                style={{ backgroundColor: branding.theme_color || '#2563eb' }}
              >
                {user?.full_name?.charAt(0)}
              </div>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      <UserProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={user} 
        branding={branding} 
        logout={logout} 
      />
    </div>
  );
};

export default AdminLayout;