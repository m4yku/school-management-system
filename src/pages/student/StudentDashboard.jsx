import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar as CalendarIcon, 
  CheckCircle2, Bell, Megaphone, FileText, Download, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  const API_BASE_URL = "http://localhost/sms-api"; 

  const [branding, setBranding] = useState({
    school_name: 'School Portal',
    theme_color: '#001f3f',
    school_logo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandRes = await axios.get(`${API_BASE_URL}/branding.php`);
        if (brandRes.data) setBranding(brandRes.data);

        const studentRes = await axios.get(`${API_BASE_URL}/get_students.php`);
        const myData = studentRes.data.find(s => s.email === user.email);
        if (myData) setStudentData(myData);
      } catch (err) {
        console.error("Dashboard Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user.email]);

  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse text-slate-400">LOADING DATA...</div>;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside style={{ backgroundColor: branding.theme_color }} className="w-72 text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl shrink-0 z-20">
        <div className="p-8 text-center border-b border-white/5">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-xl">
            {branding.school_logo ? (
              <img src={`${API_BASE_URL}/${branding.school_logo}`} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-800 font-black text-2xl italic">CSPB</span>
            )}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">{branding.school_name}</h2>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <SidebarBtn icon={<User size={18}/>} label="Dashboard" active />
          <SidebarBtn icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} label="LMS Classroom" onClick={() => !isLocked && navigate('/lms')} disabled={isLocked} />
          <SidebarBtn icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={logout} className="w-full p-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* TOP HEADER: YEAR LEVEL & CLASSIFICATION */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {/* ITO ANG HINAHANAP MO: ENROLLMENT TYPE */}
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                {studentData?.enrollment_type || 'NEW STUDENT'}
              </span>
              {/* ITO ANG HINAHANAP MO: YEAR LEVEL */}
              <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {studentData?.grade_level || 'GRADE LEVEL TBA'}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${studentData?.enrollment_status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {studentData?.enrollment_status || 'PENDING'}
              </span>
            </div>

            <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-1">
              Mabuhay, <span style={{ color: branding.theme_color }}>{studentData?.first_name || 'Joshua'}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">
              ID: {studentData?.student_id} | S.Y. {studentData?.school_year}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* ANNOUNCEMENT */}
              <div style={{ backgroundColor: branding.theme_color }} className="text-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl overflow-hidden">
                <Megaphone size={24} className="shrink-0 animate-bounce" />
                <marquee className="font-black text-sm uppercase tracking-widest italic">
                   Attention: Please complete your profile requirements to avoid LMS interruption. Official School Year {studentData?.school_year} is now active.
                </marquee>
              </div>

              {/* DETAILED STUDENT INFO TABLE */}
              <section className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Info size={80} /></div>
                <h3 className="font-black text-slate-400 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                   <CheckCircle2 size={14} className="text-green-500"/> Official Enrollment Details
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
                   <InfoGroup label="Classification" value={studentData?.enrollment_type} />
                   <InfoGroup label="Year Level" value={studentData?.grade_level} />
                   <InfoGroup label="School Year" value={studentData?.school_year} />
                   <InfoGroup label="LRN Number" value={studentData?.lrn} />
                   <InfoGroup label="Prev School" value={studentData?.prev_school} />
                   <InfoGroup label="Payment Plan" value={studentData?.payment_plan} />
                   <InfoGroup label="Portal Status" value={studentData?.enrollment_status} />
                   <InfoGroup label="Verified Date" value="---" />
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-8">
               {/* LOCK STATUS CARD */}
               <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${isLocked ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 leading-none">Access Control</p>
                 <div className="flex items-center gap-4">
                    <div className={`${isLocked ? 'bg-red-500' : 'bg-emerald-500'} text-white p-4 rounded-3xl shadow-lg`}>
                       {isLocked ? <Lock size={28}/> : <Unlock size={28}/>}
                    </div>
                    <div>
                       <p className={`font-black text-2xl leading-none ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
                       </p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">E-Learning Ready</p>
                    </div>
                 </div>
               </div>

               {/* QUICK LINKS */}
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                 <h3 className="font-black text-[10px] uppercase tracking-widest mb-6 text-slate-500">Quick Downloads</h3>
                 <div className="space-y-3">
                    <DownloadBtn label="Class Schedule" />
                    <DownloadBtn label="Student Handbook" />
                 </div>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// HELPERS
const SidebarBtn = ({ icon, label, active, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg shadow-yellow-500/20' : disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}>
    {icon} {label}
  </button>
);

const InfoGroup = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">{label}</p>
    <p className="text-[13px] font-black text-slate-800">{value || 'NOT SET'}</p>
  </div>
);

const DownloadBtn = ({ label }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[11px] font-bold">
     {label} <Download size={14} className="text-yellow-500" />
  </button>
);

export default StudentDashboard;