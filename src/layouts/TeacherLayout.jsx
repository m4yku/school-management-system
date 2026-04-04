import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, CaseUpper, LogOut, Menu, X, School, BookOpen,
  BellDot, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import UserProfileModal from '../components/admin/UserProfileModal'; 

const TeacherLayout = () => {
  const { logout, user, branding, API_BASE_URL } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true); 
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuConfig = {
    teacher: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: <School size={20} />, label: 'My Classes', path: '/teacher/classes' },
      { icon: <CaseUpper size={20} />, label: 'Subjects', path: '/teacher/subjects' },
      { icon: <BookOpen size={20} />, label: 'Activities', path: '/teacher/activities' }
    ],
  };

  const currentMenu = menuConfig[user?.role] || [];
  const themeColor = branding?.theme_color || '#2563eb';

  const handleRefresh = () => {
    window.location.reload();
  };

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/teacher/sections/')) return 'Grade Management';
    if (path.includes('/teacher/grades/')) return 'Grade Management';
    if (path.includes('/teacher/activities/')) return 'Subject Tasks';
    if (path.includes('/teacher/profile')) return 'My Profile';
    if (path.includes('/teacher/announcements')) return 'Announcements';
    return path.split('/').pop()?.replace('-', ' ') || 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-50 relative font-sans overflow-hidden z-0 lg:p-0 lg:gap-0">
      
      {/* GLOBAL STYLE OVERRIDES */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&display=swap');

        h1, h2, h3, h4, h5, h6, .header-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }

        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { 
          background-color: ${themeColor}; 
          border-radius: 20px; 
          border: 2px solid transparent; 
          background-clip: content-box; 
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: ${themeColor}; opacity: 0.8; }
      `}</style>

      {/* ENHANCED DYNAMIC BACKGROUND - FLUID BLOBS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <style>{`
          @keyframes fluidMove1 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes fluidMove2 {
            0% { transform: translate(0px, 0px) scale(1.1); }
            33% { transform: translate(-30px, 50px) scale(0.9); }
            66% { transform: translate(20px, -20px) scale(1); }
            100% { transform: translate(0px, 0px) scale(1.1); }
          }
          @keyframes pulseSoft {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 0.4; }
          }

          .animate-blob-1 { animation: fluidMove1 15s infinite ease-in-out, pulseSoft 8s infinite ease-in-out; }
          .animate-blob-2 { animation: fluidMove2 18s infinite ease-in-out, pulseSoft 10s infinite ease-in-out; }
          .animate-blob-3 { animation: fluidMove1 22s infinite reverse ease-in-out, pulseSoft 12s infinite ease-in-out; }
        `}</style>

        {/* Dynamic Blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-blob-1 will-change-transform" 
          style={{ backgroundColor: themeColor }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-blob-2 will-change-transform" 
          style={{ backgroundColor: themeColor }}></div>
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-blob-3 will-change-transform" 
          style={{ backgroundColor: themeColor }}></div>
        <div className="absolute bottom-[10%] left-[10%] w-[35%] h-[35%] rounded-full blur-[100px] animate-blob-2 will-change-transform" 
          style={{ backgroundColor: themeColor }}></div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")' }}></div>
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed z-[70] bg-white/95 backdrop-blur-2xl text-slate-700 flex flex-col transition-all duration-300 ease-in-out shadow-2xl
        left-0 top-0 border border-white/60 m-4 rounded-[2rem] h-[calc(100vh-2rem)]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'} 
        lg:translate-x-0 lg:static lg:m-0 lg:h-full lg:rounded-none lg:rounded-r-[2rem] lg:shadow-[4px_0_24px_rgba(0,0,0,0.05)] lg:bg-white/80
        w-[calc(100%-2rem)] max-w-xs ${isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-64'} 
      `}>
        <div className={`h-24 px-6 border-b border-slate-200/60 flex items-center shrink-0 transition-all justify-between ${isCollapsed ? 'lg:justify-center px-0' : ''}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {branding?.school_logo ? (
              <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-white" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 border border-white" style={{ backgroundColor: themeColor }}>
                {branding?.school_name?.charAt(0) || 'S'}
              </div>
            )}
            <span className={`header-jakarta text-[15px] leading-tight font-black text-slate-800 tracking-tight transition-all duration-300 line-clamp-2 w-36 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
              {branding?.school_name || 'School System'}
            </span>
          </div>
          <button className="lg:hidden text-slate-600 hover:text-slate-900 p-2 bg-slate-100/80 rounded-xl border border-slate-200" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scroll">
          {currentMenu.map((item, index) => {
            {/* 🟢 FIXED: Dynamic Active Logic para sa Sub-paths */}
            const isActive = 
              location.pathname === item.path || 
              (location.pathname.startsWith('/teacher/sections') && item.path === '/teacher/classes') ||
              (location.pathname.startsWith('/teacher/activities') && item.path === '/teacher/activities');

            return (
              <Link 
                key={index} to={item.path} onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center p-3.5 rounded-2xl transition-all duration-200 group relative gap-4
                  ${isActive ? 'text-white shadow-md border border-white/40' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}
                  ${isCollapsed ? 'lg:justify-center lg:gap-0' : ''}
                `}
                style={isActive ? { backgroundColor: themeColor } : {}}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'} shrink-0 transition-transform group-hover:scale-110`}>{item.icon}</span>
                <span className={`font-bold text-sm transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex absolute -right-3.5 top-24 w-7 h-7 bg-white text-slate-800 rounded-full items-center justify-center shadow-md border border-slate-200 hover:scale-110 transition-transform z-50">
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        <div className="p-4 border-t border-slate-200/60 bg-white/90 shrink-0 rounded-b-[2rem] lg:rounded-b-none lg:rounded-br-[2rem]">
          
          <Link 
            to="/teacher/profile"
            onClick={() => setIsSidebarOpen(false)}
            className={`flex items-center mb-2 cursor-pointer hover:opacity-80 transition-all duration-300 w-full gap-3 px-2 ${isCollapsed ? 'lg:justify-center lg:px-0' : ''}`}
          >
             {user?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-10 h-10 rounded-full object-cover border-2 border-white shrink-0 shadow-sm transition-all" alt="Avatar"/>
             ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 border-white shrink-0 text-white shadow-sm transition-all" style={{ backgroundColor: themeColor }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
             )}
             <div className={`overflow-hidden transition-all duration-300 flex-1 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>
                <p className="header-jakarta text-[13px] leading-tight font-black text-slate-800 line-clamp-1 mb-0.5">{user?.full_name}</p>
                <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">{user?.role}</p>
             </div>
          </Link>

          <button 
            onClick={handleRefresh} 
            className={`flex items-center p-3 mb-2 rounded-2xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group w-full gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}
            title="Refresh Page"
          >
            <RefreshCw size={20} className="shrink-0 group-hover:rotate-180 transition-transform duration-500 ease-out" />
            <span className={`text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>Refresh Page</span>
          </button>

          <button onClick={logout} className={`flex items-center p-3 rounded-2xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-all duration-200 group w-full gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
            <span className={`text-sm font-bold tracking-wide transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10 lg:ml-4">
        <header className="h-24 bg-white/60 backdrop-blur-xl border-b lg:border border-white/80 lg:rounded-none lg:rounded-bl-[2.5rem] rounded-b-3xl flex items-center justify-between px-6 lg:px-10 shadow-sm transition-all shrink-0">
          <div className="flex items-center space-x-4">
            <button className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm text-slate-600 lg:hidden hover:bg-white hover:text-slate-900 border border-white shadow-sm" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 className="header-jakarta text-slate-800 font-black text-xl lg:text-2xl capitalize tracking-tight drop-shadow-sm">
               {getHeaderTitle()}
            </h2>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link to="/teacher/announcements" className={`p-3 rounded-2xl transition-all duration-200 relative ${location.pathname === '/teacher/announcements' ? 'bg-white shadow-md border border-white' : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm border border-transparent'}`} style={location.pathname === '/teacher/announcements' ? { color: themeColor } : {}}>
              <BellDot size={22} />
              {location.pathname !== '/teacher/announcements' && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </Link>
            <div className="hidden sm:block w-px h-10 bg-slate-300/50 border-l border-white"></div>
            <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>
              <div className="hidden sm:block text-right">
                  <p className="header-jakarta text-[15px] font-black text-slate-800 leading-none drop-shadow-sm">{user?.full_name}</p>
                  <p className="text-[10px] font-bold uppercase mt-1.5 tracking-widest drop-shadow-sm" style={{ color: themeColor }}>System Verified</p>
              </div>
              {user?.profile_image ? (
                 <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white" alt="Avatar"/>
              ) : (
                <div className="w-12 h-12 text-white rounded-2xl flex items-center justify-center font-black shadow-sm border-2 border-white text-lg" style={{ backgroundColor: themeColor }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 flex-1 min-h-0 flex flex-col">
          <div className="max-w-7xl mx-auto h-full w-full overflow-y-auto custom-scroll lg:pr-3">
            <Outlet />
          </div>
        </div>
      </main>

      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} branding={branding} logout={logout} />
    </div>
  );
};

export default TeacherLayout;