import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchStudentInfo = async () => {
      try {
        const response = await axios.get('http://localhost/sms-api/get_students.php');
        const myData = response.data.find(s => s.email === user.email);
        if (myData) setStudentData(myData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchStudentInfo();
  }, [user.email]);

  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-[#001f3f]">LOADING...</div>;

  return (
    // MAIN CONTAINER: h-screen para hindi lumagpas sa window height
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR: Fixed width, Full height --- */}
      <aside className="w-72 bg-[#001f3f] text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl z-20">
        <div className="p-8 text-center border-b border-white/5">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center text-[#001f3f] font-black text-xl border-4 border-yellow-500 shadow-xl">
            CSPB
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-tight">
            Colegio de San Pascual Baylon
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-6 space-y-2">
          <MenuBtn icon={<User size={18}/>} label="Dashboard" active />
          <MenuBtn 
            icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} 
            label="LMS Classroom" 
            onClick={() => !isLocked && navigate('/lms')}
            disabled={isLocked}
          />
          <MenuBtn icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        {/* Logout Button: Laging nasa ilalim ng sidebar */}
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={logout} 
            className="w-full p-4 bg-red-500/10 text-red-400 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA: Scrollable --- */}
      <main className="flex-1 overflow-y-auto bg-white/50 relative">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* Header Section: Siguradong nasa taas */}
          <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {studentData?.enrollment_type || 'NEW STUDENT'}
              </span>
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {studentData?.grade_level || 'GRADE 12'}
              </span>
            </div>
            <h1 className="text-5xl font-black text-[#001f3f] tracking-tighter mb-1">
              Mabuhay, <span className="text-blue-600">{studentData?.first_name || 'Joshua'}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">
              Student ID: {studentData?.student_id || '2026-0004'}
            </p>
          </header>

          {/* Account Restriction Alert: Dynamic positioning */}
          {isLocked && (
            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] mb-10 flex items-center gap-8 shadow-sm animate-in zoom-in-95 duration-500">
              <div className="bg-red-500 text-white p-5 rounded-3xl shadow-lg shadow-red-200">
                <Lock size={32} />
              </div>
              <div>
                <h3 className="text-red-600 font-black uppercase text-[10px] tracking-widest mb-1">Account Restriction</h3>
                <h2 className="text-xl font-black text-slate-800 leading-tight">Naka-lock ang iyong E-Learning Access</h2>
                <p className="text-slate-500 text-sm mt-1 font-medium max-w-xl">
                  Ang iyong portal ay kasalukuyang nasa <b>{studentData?.enrollment_status || 'Pending'}</b> status. Mangyaring kumpletuhin ang bayad para ma-access ang LMS.
                </p>
              </div>
            </div>
          )}

          {/* Top Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <StatCard label="Classification" value={studentData?.enrollment_type} icon={<GraduationCap size={24}/>} color="blue" />
            <StatCard label="Current Year" value={studentData?.grade_level} icon={<Calendar size={24}/>} color="yellow" />
            <StatCard label="Portal Status" value={studentData?.enrollment_status === 'Verified' ? 'Active' : 'Pending'} icon={<CheckCircle2 size={24}/>} color="emerald" />
          </div>

          {/* Detailed Info Section */}
          <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <GraduationCap size={120} />
             </div>
             <h3 className="font-black text-slate-400 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 size={14}/> Student Record Overview
             </h3>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 relative z-10">
                <InfoGroup label="School Year" value={studentData?.school_year} />
                <InfoGroup label="Payment Plan" value={studentData?.payment_plan} />
                <InfoGroup label="Previous School" value={studentData?.prev_school} />
                <InfoGroup label="LRN Number" value={studentData?.lrn} />
             </div>
          </section>
        </div>
      </main>
    </div>
  );
};

// COMPONENT HELPERS
const MenuBtn = ({ icon, label, active, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all
    ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg shadow-yellow-500/20' : 
    disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-all cursor-default">
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl font-black text-[#001f3f] group-hover:text-blue-600 transition-colors">{value || '---'}</p>
    </div>
    <div className={`p-4 rounded-2xl bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all`}>
      {icon}
    </div>
  </div>
);

const InfoGroup = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
    <p className="text-sm font-black text-slate-800">{value || 'NOT PROVIDED'}</p>
  </div>
);

export default StudentDashboard;