import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout, branding } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default closed for mobile

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'LMS', icon: '📚', path: '/lms' },
    { name: 'Accounting', icon: '💳', path: '/accounting' },
    { name: 'Enrollment', icon: '📝', path: '/enrollment' },
    { name: 'Grades', icon: '📊', path: '/grades' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* --- MOBILE TOP NAVBAR --- */}
      <div className="md:hidden bg-white border-b px-5 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
            {branding?.logoInitial || 'S'}
          </div>
          <span className="font-black text-slate-800 text-sm tracking-tight">STUDENT PORTAL</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 bg-slate-100 rounded-lg"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- SIDEBAR (Desktop & Mobile Drawer) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* School Name (Desktop Only) */}
          <div className="hidden md:flex p-6 items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
              {branding?.logoInitial || 'S'}
            </div>
            <span className="font-black text-white text-sm leading-tight">
              {branding?.schoolName || 'SMS UNIVERSITY'}
            </span>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all font-bold text-sm"
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Profile at Bottom */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">👤</div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Student'}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Verified Student</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-all"
            >
              LOGOUT SYSTEM
            </button>
          </div>
        </div>
      </aside>

      {/* --- BACKDROP (Mobile Only) --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Desktop Header (Hidden on Mobile) */}
        <header className="hidden md:flex h-16 bg-white border-b items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Overview</h2>
          <div className="flex items-center gap-4 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">
            S.Y. 2025-2026 | 1st Semester
          </div>
        </header>

        <div className="p-5 md:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
          <header className="mb-8">
            <h1 className="text-2xl md:text-4xl font-black text-slate-900">
              Mabuhay, <span className="text-blue-600">{user?.full_name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 text-sm md:text-base font-medium">Narito ang status ng iyong pag-aaral.</p>
          </header>

          {/* Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard title="Accounting" status="Paid" icon="✅" desc="Tuition is up to date" />
            <SummaryCard title="LMS Activities" status="3 Pending" icon="📝" desc="Due this week" />
          </div>

          {/* Mobile Quick Links (Grid for easier thumb access) */}
          <div className="mt-8 md:hidden">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Menu</h3>
            <div className="grid grid-cols-2 gap-3">
              {menuItems.slice(1).map(item => (
                <button key={item.name} className="bg-white p-4 rounded-2xl border border-slate-200 text-left shadow-sm">
                  <span className="text-2xl block mb-2">{item.icon}</span>
                  <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* --- BOTTOM NAV (Mobile Only - Thumb Friendly) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map(item => (
          <button key={item.name} className="flex flex-col items-center gap-1 p-2">
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

// Sub-component for clean rendering
const SummaryCard = ({ title, status, icon, desc }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
    <div className="text-3xl">{icon}</div>
    <div>
      <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight">{title}</h3>
      <p className="text-lg font-bold text-blue-600 leading-none my-1">{status}</p>
      <p className="text-[11px] text-slate-400 font-medium uppercase tracking-tighter">{desc}</p>
    </div>
  </div>
);

export default StudentDashboard;