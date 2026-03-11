import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Constants for our specific school branding
  const schoolName = "Colegio de San Pascual Baylon";
  const schoolAcronym = "CSPB";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'LMS (E-Learning)', icon: '📚', path: '/lms' },
    { name: 'Accounting', icon: '💳', path: '/accounting' },
    { name: 'Enrollment', icon: '📝', path: '/enrollment' },
    { name: 'Grades', icon: '📊', path: '/grades' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* --- MOBILE TOP NAVBAR --- */}
      <div className="md:hidden bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#003366] rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
            {/* Placeholder for CSPB Logo */}
            CSPB
          </div>
          <span className="font-black text-[#003366] text-xs tracking-tighter uppercase">
            {schoolName}
          </span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- SIDEBAR (Desktop & Mobile Drawer) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#001f3f] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* School Branding Section (Desktop) */}
          <div className="hidden md:flex flex-col p-8 items-center text-center gap-4 border-b border-white/10">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#003366] font-black text-2xl shadow-2xl border-4 border-yellow-500">
              {/* Replace with <img src="/logo.png" /> later */}
              CSPB
            </div>
            <div>
              <h2 className="font-black text-white text-sm leading-tight tracking-wide uppercase">
                {schoolName}
              </h2>
              <p className="text-yellow-500 text-[10px] font-bold mt-1 tracking-[0.2em]">STUDENT PORTAL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-8 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-slate-300 hover:bg-yellow-500 hover:text-[#001f3f] transition-all font-bold text-sm group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Profile & Logout Section */}
          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-[#001f3f] font-bold">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-black text-white truncate uppercase tracking-tighter">
                  {user?.full_name || 'Pascuallian Student'}
                </p>
                <p className="text-[10px] text-yellow-500/80 font-bold uppercase">Academic Year 24-25</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 font-black text-[10px] tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 uppercase"
            >
              Log out Session
            </button>
          </div>
        </div>
      </aside>

      {/* --- BACKDROP (Mobile Only) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-white border-b border-slate-200 items-center justify-between px-10 sticky top-0 z-20">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Home / Dashboard</h2>
            <span className="text-sm font-bold text-[#003366]">Official Student Management System</span>
          </div>
          
          <div className="bg-blue-50 px-5 py-2 rounded-full border border-blue-100 flex items-center gap-3">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-black text-[#003366] uppercase tracking-tighter">System Online</span>
          </div>
        </header>

        <div className="p-6 md:p-12 max-w-6xl mx-auto pb-32 md:pb-12">
          {/* Welcome Message */}
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
              Mabuhay, <span className="text-[#003366]">{user?.full_name?.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-lg">
              Welcome to the <span className="text-yellow-600 font-bold">CSPB</span> Student Portal.
            </p>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SummaryCard title="Enrollment Status" value="ENROLLED" icon="🎓" color="border-l-green-500" />
            <SummaryCard title="Financial Balance" value="₱ 0.00" icon="💳" color="border-l-blue-500" />
            <SummaryCard title="LMS Tasks" value="4 Pending" icon="🔔" color="border-l-yellow-500" />
          </div>
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map(item => (
          <button key={item.name} className="flex flex-col items-center gap-1 group">
            <span className="text-xl group-active:scale-90 transition-transform">{item.icon}</span>
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{item.name}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

const SummaryCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-200 border-l-4 ${color} flex items-center justify-between hover:shadow-md transition-shadow`}>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl font-black text-slate-800 tracking-tight">{value}</p>
    </div>
    <div className="text-3xl opacity-20">{icon}</div>
  </div>
);

export default StudentDashboard;