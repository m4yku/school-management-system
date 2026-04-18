import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, User, Power, Library, BookMarked, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LmsLayout = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mySubjects, setMySubjects] = useState([]);

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, path: '/lms/dashboard', label: 'Home' },
    { id: 'tasks', icon: <BookMarked size={20} />, path: '/lms/tasks', label: 'Tasks' },
    { id: 'calendar', icon: <Calendar size={20} />, path: '/lms/calendar', label: 'Schedule' },
  ];

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/student/get_student_dashboard_data.php?student_id=${user.student_id}`);
        if (res.data.success) setMySubjects(res.data.scheduleToday || []);
      } catch (err) { console.error(err); }
    };
    if (user?.student_id) fetchSubjects();
  }, [user, API_BASE_URL]);

  const showSubjectRow = location.pathname.includes('dashboard');

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden relative">
      
      {/* 1. DESKTOP SIDEBAR (Discord Style) */}
      <aside className="hidden md:flex w-20 bg-white border-r border-slate-200 flex-col items-center py-6 z-40 shrink-0 shadow-sm">
         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
            <Library size={24} />
         </div>
         <div className="flex-1 w-full flex flex-col items-center gap-4 overflow-y-auto scrollbar-hide px-2">
            {mySubjects.map((sub, i) => (
               <div key={i} className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white font-black text-[10px] hover:bg-indigo-600 transition-all cursor-pointer shadow-sm active:scale-95">
                  {sub.subject.substring(0, 3)}
               </div>
            ))}
         </div>
         <button onClick={() => navigate('/student/dashboard')} className="mt-auto p-4 text-slate-400 hover:text-red-500 transition-colors" title="Exit LMS">
            <Power size={22} />
         </button>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full relative">
         <header className="h-20 px-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-30">
           <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
             {branding?.school_logo && <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} className="w-8 h-8 object-contain" alt="Logo" />}
             <span className="truncate max-w-[200px] md:max-w-none">{branding?.school_name}</span>
           </h1>
           <div className="flex items-center gap-3">
             <button className="p-2.5 bg-white rounded-full shadow-sm text-slate-500"><Bell size={18} /></button>
             <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black border border-white shadow-sm"><User size={18} /></div>
           </div>
         </header>

         {/* In-adjust natin ang padding-bottom (pb-44) para hindi matakpan ng floating dock ang content */}
         <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-44 md:pb-32">
           <div className="max-w-[1400px] mx-auto py-4">
             <Outlet />
           </div>
         </main>
      </div>

      {/* ========================================================
          PERMANENT FLOATING NAVIGATION (Universal for all sizes)
          ======================================================== */}
      <div className="fixed bottom-6 left-1/2 md:left-[calc(50%+2.5rem)] -translate-x-1/2 z-[100] w-[90%] max-w-sm flex flex-col gap-3 items-center">
        
        {/* ROW 1: DYNAMIC SUBJECTS (Mobile Only - visible on dashboard) */}
        <div className="md:hidden w-full">
            {showSubjectRow && mySubjects.length > 0 && (
            <div className="flex bg-white/70 backdrop-blur-xl p-2 rounded-[2rem] shadow-xl border border-white/40 overflow-x-auto scrollbar-hide gap-3 justify-center animate-in slide-in-from-bottom-4 duration-500">
                {mySubjects.map((sub, i) => (
                <div key={i} className="w-11 h-11 bg-slate-900 text-white rounded-full flex items-center justify-center text-[9px] font-black shrink-0 border-2 border-white shadow-md active:scale-95 transition-transform">
                    {sub.subject.substring(0, 3)}
                </div>
                ))}
            </div>
            )}
        </div>

        {/* ROW 2: MAIN FLOATING DOCK (Always Visible) */}
        <div className="bg-slate-900/95 backdrop-blur-2xl p-2 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center gap-2 border border-slate-700/50 w-full justify-between">
          
          <button 
            onClick={() => navigate('/student/dashboard')}
            className="p-3.5 rounded-full text-slate-400 hover:text-red-500 transition-all border-r border-slate-800 pr-4"
            title="Exit LMS"
          >
            <Power size={20} />
          </button>

          <div className="flex flex-1 justify-around gap-2 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <button 
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`p-3.5 rounded-full transition-all duration-300 relative ${isActive ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                  {item.icon}
                  {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"></span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>

    </div>
  );
};

export default LmsLayout;