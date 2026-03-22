import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CaseUpper, Settings, LogOut, Menu, X, School,
  BellDot, Blocks,
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import UserProfileModal from '../components/admin/UserProfileModal'; 

const TeacherLayout = () => {
  const { logout, user, branding } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const API_BASE_URL = "http://localhost/sms-api";

  const menuConfig = {
    teacher: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: <School size={20} />, label: 'My Classes', path: '/teacher/classes' },
      { icon: <CaseUpper size={20} />, label: 'Subjects', path: '/teacher/subjects' },
    ],
  };

  const currentMenu = menuConfig[user?.role] || [];
  
  // Kunin ang admin theme color, o gumamit ng default blue kung wala pa
  const themeColor = branding?.theme_color || '#2563eb';

  return (
    <div className="flex h-screen bg-slate-100 relative font-sans overflow-hidden z-0">
      
      {/* ========================================== */}
      {/* OPTIMIZED LAG-FREE DYNAMIC BACKGROUND      */}
      {/* ========================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-100">
        
        {/* LIGHTWEIGHT OPACITY ANIMATION (Hardware Accelerated) */}
        {/* Tinanggal ang mabigat na translate3d sa nagliliwanag na blobs */}
        <style>{`
          @keyframes pulseSlow {
            0%, 100% { opacity: 0.15; }
            50% { opacity: 0.35; }
          }
          @keyframes pulseSlower {
            0%, 100% { opacity: 0.30; }
            50% { opacity: 0.10; }
          }
          .animate-glow-1 { animation: pulseSlow 8s infinite ease-in-out; }
          .animate-glow-2 { animation: pulseSlower 12s infinite ease-in-out; }
        `}</style>

        {/* Static Blobs na may magaan na Opacity Breathing.
          Mas maliit na blur value (80px instead of 120px) para mabilis i-render ng browser. 
        */}
        <div 
          className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[80px] animate-glow-1 will-change-opacity"
          style={{ backgroundColor: themeColor }}
        ></div>
        
        <div 
          className="absolute bottom-[-10%] right-[-5%] w-[55%] h-[55%] rounded-full blur-[80px] animate-glow-2 will-change-opacity"
          style={{ backgroundColor: themeColor }}
        ></div>
        
        <div 
          className="absolute top-[30%] left-[25%] w-[35%] h-[35%] rounded-full blur-[80px] animate-glow-2 will-change-opacity"
          style={{ backgroundColor: themeColor }}
        ></div>
        
        <div 
          className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] rounded-full blur-[80px] animate-glow-1 will-change-opacity"
          style={{ backgroundColor: themeColor }}
        ></div>

        {/* LIGHTWEIGHT FROSTED GLASS NOISE TEXTURE */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
          style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}
        ></div>
      </div>
      {/* ========================================== */}

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
        lg:translate-x-0 lg:sticky lg:top-0 lg:h-full shadow-2xl
      `}>
        {/* SIDEBAR HEADER */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            {branding?.school_logo ? (
              <img src={branding.school_logo} alt="Logo" className="w-9 h-9 rounded-lg object-cover bg-white" />
            ) : (
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: themeColor }}
              >
                {branding?.school_name?.charAt(0) || 'S'}
              </div>
            )}
            <span className="text-lg font-bold text-white tracking-tight truncate max-w-[140px]">
              {branding?.school_name || 'School System'}
            </span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Main Menu</p>
          {currentMenu.map((item, index) => {
            const isActive = location.pathname === item.path || (location.pathname.startsWith('/teacher/sections') && item.path === '/teacher/classes');
            
            return (
              <Link 
                key={index} 
                to={item.path} 
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group
                  ${isActive ? 'text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}
                style={isActive ? { backgroundColor: themeColor } : {}}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* USER INFO & LOGOUT */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
          <Link 
            to="/teacher/profile"
            className="flex items-center space-x-3 mb-4 px-2 cursor-pointer hover:opacity-80 transition-opacity block"
            onClick={() => setIsSidebarOpen(false)}
          >
             {user?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-8 h-8 rounded-full object-cover border border-slate-600" alt="Avatar"/>
             ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-600 text-white"
                  style={{ backgroundColor: themeColor }}
                >
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
             )}
             <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                  {user?.role} • View Profile
                </p>
             </div>
          </Link>
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
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative z-10 custom-scroll">
        
        {/* HEADER - GPU OPTIMIZED GLASSMORPHISM */}
        {/* Binabaan ang blur sa 'md' para mas magaan pero maganda pa rin */}
        <header className="h-16 bg-white/50 backdrop-blur-md border-b border-white/80 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0 shadow-sm">
          {/* LEFT SIDE: Menu Button & Page Title */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-xl bg-white/60 backdrop-blur-sm text-slate-600 lg:hidden hover:bg-white border border-white/80 shadow-sm"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h2 className="text-slate-800 font-extrabold tracking-tight text-sm lg:text-base capitalize">
               {location.pathname.split('/').pop()?.replace('-', ' ')}
            </h2>
          </div>

          {/* RIGHT SIDE: Announcements & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            
            {/* ANNOUNCEMENT QUICK LINK */}
            <Link 
              to="/teacher/announcements"
              className={`p-2 rounded-full transition-all duration-200 relative 
                ${location.pathname === '/teacher/announcements' 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'text-slate-600 hover:bg-white/60 hover:shadow-sm'
                }`}
              style={location.pathname === '/teacher/announcements' ? { color: themeColor } : {}}
              title="View Announcements"
            >
              <BellDot size={22} />
              {location.pathname !== '/teacher/announcements' && (
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>

            <div className="hidden sm:block w-px h-8 bg-slate-300/50"></div>

            {/* USER INFO */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="hidden sm:block text-right cursor-default">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.full_name}</p>
                  <p className="text-[10px] font-bold uppercase mt-1 drop-shadow-sm" style={{ color: themeColor }}>
                    System Verified
                  </p>
              </div>

              {/* AVATAR/ICON AREA */}
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsProfileOpen(true)}
                title="Update Profile Picture"
              >
                {user?.profile_image ? (
                   <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-white" alt="Avatar"/>
                ) : (
                  <div 
                    className="w-10 h-10 text-white rounded-xl flex items-center justify-center font-bold shadow-sm border border-white"
                    style={{ backgroundColor: themeColor }}
                  >
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
               </div> 
            </div>

          </div>
        </header>

        {/* PAGE CONTENT */}
        {/* Tinanggal ang p-4 lg:p-8 dito dahil nilalagyan na natin ng sariling padding yung mga pages mismo */}
        <div className="flex-1 w-full h-full p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>

      {/* PROFILE MODAL */}
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

export default TeacherLayout;