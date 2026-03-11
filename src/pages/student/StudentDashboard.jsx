import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // SIMULATED DATA (Sa Phase 2, manggagaling ito sa PHP API mo)
  const [studentInfo, setStudentInfo] = useState({
    paymentStatus: "Unpaid", // Subukan mong gawing "Paid" para makita ang pagbabago
    balance: "15,500.00",
    enrollmentStatus: "Enrolled"
  });

  const schoolName = "Colegio de San Pascual Baylon";
  const schoolAcronym = "CSPB";

  const handleLogout = () => {
    if (window.confirm("Logout from CSPB Portal?")) {
      logout();
      navigate('/');
    }
  };

  // Logic para sa pag-access ng LMS
  const handleLMSAccess = () => {
    if (studentInfo.paymentStatus !== "Paid") {
      alert("⚠️ ACCESS RESTRICTED: Mangyaring makipag-ugnayan sa Cashier para sa iyong bayarin upang ma-access ang LMS.");
    } else {
      navigate('/lms');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard', locked: false },
    { name: 'LMS (E-Learning)', icon: '📚', action: handleLMSAccess, locked: studentInfo.paymentStatus !== "Paid" },
    { name: 'Accounting', icon: '💳', path: '/accounting', locked: false },
    { name: 'Enrollment', icon: '📝', path: '/enrollment', locked: false },
    { name: 'Grades', icon: '📊', path: '/grades', locked: false },
  ];

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col md:flex-row font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#001f3f] text-white transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-8 flex flex-col items-center border-b border-white/10">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-[#001f3f] font-black text-xl border-4 border-yellow-500 mb-3 shadow-2xl">
              {schoolAcronym}
            </div>
            <h2 className="text-center font-black text-[10px] uppercase tracking-tighter leading-tight">{schoolName}</h2>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={item.action ? item.action : () => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all group
                  ${item.locked ? 'opacity-50 cursor-not-allowed bg-slate-800/50' : 'hover:bg-yellow-500 hover:text-[#001f3f] text-slate-300'}
                `}
              >
                <div className="flex items-center gap-4">
                  <span>{item.icon}</span>
                  {item.name}
                </div>
                {item.locked && <span className="text-xs">🔒</span>}
              </button>
            ))}
          </nav>

          <div className="p-6 bg-black/20 border-t border-white/5">
            <button onClick={handleLogout} className="w-full py-3 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-600/30">
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-10 pb-32">
        <div className="max-w-6xl mx-auto">
          
          <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Mabuhay, <span className="text-[#001f3f]">{user?.full_name?.split(' ')[0] || 'Student'}</span>!
              </h1>
              <p className="text-slate-500 font-medium mt-2 italic">Student ID: {user?.student_id || '2024-0001'}</p>
            </div>
            
            {/* Status Indicator */}
            <div className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 shadow-sm ${studentInfo.paymentStatus === "Paid" ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200 animate-pulse'}`}>
              <span className={`w-3 h-3 rounded-full ${studentInfo.paymentStatus === "Paid" ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-xs font-black uppercase tracking-widest ${studentInfo.paymentStatus === "Paid" ? 'text-green-700' : 'text-red-700'}`}>
                {studentInfo.paymentStatus === "Paid" ? "Cleared / Paid" : "Account Locked"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Payment Warning Card if Unpaid */}
            {studentInfo.paymentStatus !== "Paid" && (
              <div className="lg:col-span-3 bg-red-600 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-4 border-red-400">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <span className="text-4xl">⚠️</span>
                  <div>
                    <h3 className="font-black uppercase tracking-tighter">Urgent: Financial Hold</h3>
                    <p className="text-xs font-medium opacity-90">Hindi mo ma-aaccess ang LMS at mga lesson dahil sa iyong balance na ₱{studentInfo.balance}.</p>
                  </div>
                </div>
                <button onClick={() => navigate('/accounting')} className="bg-white text-red-600 px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-yellow-500 hover:text-[#001f3f] transition-all">
                  Settle Payment Now
                </button>
              </div>
            )}

            <StatCard title="Total Balance" value={`₱${studentInfo.balance}`} icon="💳" color="border-l-red-500" />
            <StatCard title="LMS Access" value={studentInfo.paymentStatus === "Paid" ? "Active" : "Locked"} icon="🔒" color="border-l-yellow-600" />
            <StatCard title="Enrollment" value={studentInfo.enrollmentStatus} icon="🎓" color="border-l-blue-500" />
          </div>

          {/* Grid Layout for Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <button 
              onClick={handleLMSAccess}
              className={`p-10 rounded-[2.5rem] border-2 flex flex-col items-center gap-4 transition-all group
                ${studentInfo.paymentStatus === "Paid" 
                  ? 'bg-white border-slate-200 hover:border-blue-600 hover:shadow-2xl' 
                  : 'bg-slate-100 border-dashed border-slate-300 opacity-60'}`}
             >
               <span className={`text-6xl ${studentInfo.paymentStatus === "Paid" ? 'group-hover:scale-110 transition-transform' : ''}`}>
                 {studentInfo.paymentStatus === "Paid" ? "📖" : "🔒"}
               </span>
               <div className="text-center">
                 <h3 className="font-black text-xl text-slate-800 uppercase">Go to LMS</h3>
                 <p className="text-xs text-slate-500 font-bold mt-1">
                   {studentInfo.paymentStatus === "Paid" ? "Start your lessons today" : "Payment Required to Unlock"}
                 </p>
               </div>
             </button>

             <button onClick={() => navigate('/accounting')} className="p-10 rounded-[2.5rem] bg-[#001f3f] text-white flex flex-col items-center gap-4 hover:shadow-2xl transition-all border-4 border-transparent hover:border-yellow-500 group">
               <span className="text-6xl group-hover:rotate-12 transition-transform">💰</span>
               <div className="text-center">
                 <h3 className="font-black text-xl uppercase">View Accounting</h3>
                 <p className="text-xs text-yellow-500 font-bold mt-1 tracking-widest uppercase">Check Fees & Dues</p>
               </div>
             </button>
          </div>

        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl border-l-[6px] ${color} shadow-sm flex justify-between items-center`}>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl font-black text-slate-800">{value}</p>
    </div>
    <div className="text-3xl opacity-20">{icon}</div>
  </div>
);

export default StudentDashboard;