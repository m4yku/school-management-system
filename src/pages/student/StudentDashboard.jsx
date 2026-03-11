import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Siguraduhing tama ang path ng context mo
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // School Branding Constants
  const schoolName = "Colegio de San Pascual Baylon";
  const schoolAcronym = "CSPB";

  const handleLogout = () => {
    if (window.confirm("Sigurado ka bang nais mong mag-logout?")) {
      logout();
      navigate('/');
    }
  };

  // Sidebar Menu Items
  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'LMS (E-Learning)', icon: '📚', path: '/lms' },
    { name: 'Accounting', icon: '💳', path: '/accounting' },
    { name: 'Enrollment', icon: '📝', path: '/enrollment' },
    { name: 'Grades', icon: '📊', path: '/grades' },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row font-sans text-slate-900">
      
      {/* --- MOBILE TOP NAVBAR --- */}
      <div className="md:hidden bg-[#001f3f] text-white px-5 py-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-[#001f3f] font-black text-xs">
            {schoolAcronym}
          </div>
          <span className="font-bold text-xs uppercase tracking-widest">{schoolName}</span>
        </div>
        <button 
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white/10 rounded-lg"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* --- SIDEBAR (Desktop & Mobile Drawer) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-[#001f3f] text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* School Header */}
          <div className="p-8 flex flex-col items-center border-b border-white/10">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-[#001f3f] font-black text-2xl shadow-xl border-4 border-yellow-500 mb-4">
              {schoolAcronym}
            </div>
            <h2 className="text-center font-black text-sm leading-tight uppercase tracking-tighter">
              {schoolName}
            </h2>
            <span className="text-yellow-500 text-[10px] font-bold mt-2 tracking-[0.3em]">STUDENT PORTAL</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-slate-300 hover:bg-yellow-500 hover:text-[#001f3f] transition-all font-bold text-sm group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* Logout Section */}
          <div className="p-6 bg-black/20 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-white/20">👤</div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold truncate uppercase">{user?.full_name || 'CSPB Student'}</p>
                <p className="text-[10px] text-yellow-500 font-bold uppercase italic">S.Y. 2024-2025</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest border border-red-600/30"
            >
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* --- BACKDROP (Mobile Only) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[#001f3f]/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-20 bg-white border-b items-center justify-between px-10 sticky top-0">
          <div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Home / Dashboard</h2>
            <p className="text-sm font-bold text-[#001f3f]">Student Information Management System</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-green-50 px-4 py-1.5 rounded-full border border-green-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-green-700 uppercase">Account Active</span>
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
          <div className="max-w-6xl mx-auto">
            
            {/* Greeting */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Mabuhay, <span className="text-[#001f3f]">{user?.full_name?.split(' ')[0] || 'Student'}</span>!
              </h1>
              <p className="text-slate-500 font-medium text-lg mt-2">
                Maligayang pagdating sa iyong <span className="text-yellow-600 font-bold">CSPB</span> Portal.
              </p>
            </div>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard title="Enrollment Status" value="Enrolled" icon="🎓" color="border-l-green-500" />
              <StatCard title="Balance Due" value="₱ 0.00" icon="💳" color="border-l-blue-500" />
              <StatCard title="LMS Assignments" value="4 Pending" icon="🔔" color="border-l-yellow-600" />
            </div>

            {/* Two Column Layout for Data */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Schedule & Tasks */}
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Class Schedule Today</h3>
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-6 text-center py-10">
                      <p className="text-slate-400 font-bold italic">Walang pasok sa kasalukuyang oras.</p>
                      <button className="mt-4 text-xs font-black text-blue-600 uppercase border-b border-blue-600 pb-1">Tingnan ang buong schedule</button>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Announcements */}
              <div className="space-y-6">
                <section className="bg-[#001f3f] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <h3 className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">School Bulletin</h3>
                    <p className="text-sm font-bold leading-relaxed mb-4">
                      Ang ating Foundation Day ay gaganapin sa darating na Biyernes. Walang pasok ang lahat.
                    </p>
                    <span className="text-[9px] opacity-50 font-black uppercase italic">Posted 1 hour ago</span>
                  </div>
                  {/* Decorative Logo Background */}
                  <div className="absolute -bottom-6 -right-6 text-8xl font-black text-white/5 group-hover:scale-110 transition-transform">
                    {schoolAcronym}
                  </div>
                </section>

                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Links</h3>
                  <div className="flex flex-col gap-2">
                    <button className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors flex justify-between">
                      Contact Registrar <span>→</span>
                    </button>
                    <button className="w-full text-left p-3 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors flex justify-between">
                      IT Support Ticket <span>→</span>
                    </button>
                  </div>
                </section>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {menuItems.slice(0, 4).map(item => (
          <button key={item.name} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1">
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.name}</span>
          </button>
        ))}
      </div>

    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl border border-slate-200 border-l-[6px] ${color} shadow-sm hover:shadow-md transition-shadow flex justify-between items-center`}>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
    <div className="text-3xl opacity-20">{icon}</div>
  </div>
);

export default StudentDashboard;