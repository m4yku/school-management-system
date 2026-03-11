import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Dito natin ilalagay ang data na galing sa iyong PHP script
  const [studentInfo, setStudentInfo] = useState({
    student_id: '',
    full_name: '',
    enrollment_type: '', // New, Transferee, o Continuing
    grade_level: '',     // Grade 7, 8, etc.
    payment_status: '',  // Paid o Unpaid (mula sa student_billing table)
    balance: 0,
    school_year: ''
  });

  // 1. FETCH DATA FROM BACKEND
  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        // Gagawa tayo ng bagong endpoint na: get_portal_info.php
        const response = await axios.get(`http://localhost/sms-api/get_portal_info.php?email=${user.email}`);
        if (response.data.success) {
          setStudentInfo(response.data.data);
        }
      } catch (err) {
        console.error("Portal Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) fetchPortalData();
  }, [user]);

  // 2. GATEKEEPER LOGIC (LMS Lock)
  // Base sa iyong code, ang status ay 'Unpaid' initially sa `student_billing` table
  const isLMSLocked = studentInfo.payment_status === 'Unpaid';

  const handleLMSAccess = () => {
    if (isLMSLocked) {
      alert(`🛑 ACCESS RESTRICTED: Naka-lock ang iyong LMS. Mangyaring bayaran ang iyong balance na ₱${studentInfo.balance} sa Cashier.`);
    } else {
      navigate('/lms');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">LOADING CSPB PORTAL...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-full md:w-72 bg-[#001f3f] text-white p-8 flex flex-col border-r-4 border-yellow-500">
        <div className="mb-10 text-center">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center text-[#001f3f] font-black text-2xl border-4 border-yellow-500 shadow-2xl">
            CSPB
          </div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em]">Student Portal</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <MenuBtn label="Dashboard" icon="🏠" active />
          {/* LMS BUTTON WITH LOCK ICON */}
          <button 
            onClick={handleLMSAccess}
            className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all
              ${isLMSLocked ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed' : 'hover:bg-yellow-500 hover:text-[#001f3f] text-slate-300'}`}
          >
            <div className="flex items-center gap-4"><span>📚</span> LMS Classroom</div>
            {isLMSLocked && <span>🔒</span>}
          </button>
          <MenuBtn label="Accounting" icon="💳" onClick={() => navigate('/accounting')} />
        </nav>

        <button onClick={logout} className="mt-10 p-4 bg-red-600/20 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-600/30 hover:bg-red-600 hover:text-white transition-all">
          Logout Session
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* TOP INFO BAR */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                {/* Dito papasok ang "New Student" o "Transferee" badge mula sa code mo */}
                <span className="bg-yellow-500 text-[#001f3f] px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {studentInfo.enrollment_type}
                </span>
                <span className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {studentInfo.grade_level}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                Mabuhay, <span className="text-[#003366]">{studentInfo.full_name.split(' ')[0]}</span>!
              </h1>
              <p className="text-slate-400 font-bold mt-2 uppercase text-xs tracking-widest">Official Student ID: {studentInfo.student_id}</p>
            </div>

            {/* PAYMENT STATUS BADGE */}
            <div className={`p-4 rounded-3xl border-2 flex items-center gap-4 ${isLMSLocked ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <div className={`w-3 h-3 rounded-full animate-pulse ${isLMSLocked ? 'bg-red-500' : 'bg-green-500'}`} />
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Status</p>
                <p className={`font-black uppercase text-sm ${isLMSLocked ? 'text-red-600' : 'text-green-600'}`}>
                  {studentInfo.payment_status}
                </p>
              </div>
            </div>
          </div>

          {/* WARNING BOARD FOR UNPAID STUDENTS */}
          {isLMSLocked && (
            <div className="bg-[#001f3f] text-white p-8 rounded-[2.5rem] mb-10 shadow-2xl relative overflow-hidden border-b-8 border-yellow-500">
               <div className="relative z-10">
                  <h3 className="text-yellow-500 font-black uppercase tracking-[0.2em] mb-2 text-xs">Access Restriction Notice</h3>
                  <h2 className="text-2xl font-black mb-4">Ang iyong LMS account ay kasalukuyang Naka-lock.</h2>
                  <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
                    Dahil sa iyong <b>{studentInfo.payment_status}</b> status, pansamantalang hindi ma-access ang mga modules. 
                    Settle your balance of <b>₱{studentInfo.balance}</b> to resume your online classes.
                  </p>
                  <button onClick={() => navigate('/accounting')} className="mt-6 bg-white text-[#001f3f] px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-yellow-500 transition-all">
                    Pay via Gcash / Bank Transfer
                  </button>
               </div>
               <div className="absolute -bottom-10 -right-10 text-[15rem] font-black text-white/5 pointer-events-none italic">
                 {studentInfo.enrollment_type.charAt(0)}
               </div>
            </div>
          )}

          {/* DASHBOARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatBox label="Current Grade" value={studentInfo.grade_level} icon="🏫" />
            <StatBox label="Outstanding Balance" value={`₱${studentInfo.balance}`} icon="💰" />
            <StatBox label="Academic Year" value={studentInfo.school_year} icon="📅" />
          </div>

        </div>
      </main>
    </div>
  );
};

// HELPER COMPONENTS
const MenuBtn = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-yellow-500 text-[#001f3f]' : 'hover:bg-white/10 text-slate-300'}`}>
    <span className="text-xl">{icon}</span> {label}
  </button>
);

const StatBox = ({ label, value, icon }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-xl transition-all">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-[#001f3f] tracking-tight">{value}</p>
    </div>
    <span className="text-3xl opacity-20">{icon}</span>
  </div>
);

export default StudentPortal;