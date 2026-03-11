import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar as CalendarIcon, 
  CheckCircle2, Bell, Megaphone, Info, Download, Menu, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchData();
  }, [user.email]);

  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-black animate-pulse text-slate-400 uppercase tracking-widest">
      UPDATING LAYOUT...
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className={`fixed inset-y-0 left-0 z-50 w-72 text-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 border-r-4 border-yellow-500 shadow-2xl shrink-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 text-center border-b border-white/5 relative">
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-2 border-yellow-500 shadow-xl">
            {branding.school_logo ? (
              <img src={`${API_BASE_URL}/${branding.school_logo}`} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-slate-800 font-black text-xl italic">CSPB</span>
            )}
          </div>
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">{branding.school_name}</h2>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <SidebarBtn icon={<User size={18}/>} label="Dashboard" active />
          <SidebarBtn 
            icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} 
            label="LMS Classroom" 
            onClick={() => !isLocked && navigate('/lms')}
            disabled={isLocked}
          />
          <SidebarBtn icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/10">
          <button onClick={logout} className="w-full p-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        
        {/* TOP NAVBAR */}
        <nav 
          style={{ backgroundColor: branding.theme_color }} 
          className="sticky top-0 z-30 px-6 py-3 flex justify-between items-center shadow-lg border-b border-white/10"
        >
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-white bg-white/10 rounded-xl hover:bg-white/20 transition-all"><Menu size={20}/></button>
             <h2 className="font-black text-white text-xs uppercase tracking-[0.2em] hidden sm:block">Student Command Center</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer relative hidden xs:block">
                <Bell size={20}/>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#001f3f]"></span>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-[11px] font-black text-white leading-none mb-1 uppercase tracking-tight">
                    {studentData?.first_name} {studentData?.last_name}
                </p>
                <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest">
                    ID: {studentData?.student_id}
                </p>
              </div>
              
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-yellow-500 shadow-md cursor-pointer hover:scale-105 transition-all bg-white overflow-hidden">
                {studentData?.profile_image ? (
                  <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <span style={{ color: branding.theme_color }} className="font-black text-sm">
                    {studentData?.first_name?.charAt(0) || 'J'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <div className="max-w-6xl mx-auto p-6 md:p-12 w-full">
          
          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                {studentData?.grade_level || 'Grade 12'}
              </span>
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                {studentData?.enrollment_type || 'Continuing'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Mabuhay, <span style={{ color: branding.theme_color }}>{studentData?.first_name}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
               Official Student Access
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div style={{ backgroundColor: branding.theme_color }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl overflow-hidden relative border-l-8 border-yellow-500">
                <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
                <marquee className="font-black text-xs uppercase tracking-widest italic">
                   Status: {studentData?.enrollment_status === 'Verified' ? 'Your account is fully verified.' : 'Verification in progress.'}
                </marquee>
              </div>

              {/* ENROLLMENT DETAILS (WALA NA YUNG MALAKING BILOG) */}
              <section className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
                <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-blue-500"/> Enrollment Records
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 relative z-10">
                   <InfoItem label="Grade Level" value={studentData?.grade_level} />
                   <InfoItem label="Classification" value={studentData?.enrollment_type} />
                   <InfoItem label="School Year" value={studentData?.school_year} />
                   <InfoItem label="Portal Access" value={studentData?.enrollment_status} />
                   <InfoItem label="Payment Plan" value={studentData?.payment_plan} />
                   <InfoItem label="LRN Number" value={studentData?.lrn} />
                </div>
              </section>
            </div>

            <div className="space-y-8">
               <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${isLocked ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-emerald-50 border-emerald-100 shadow-sm'}`}>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">LMS Connection</p>
                 <div className="flex items-center gap-4">
                    <div style={{ backgroundColor: isLocked ? '#ef4444' : branding.theme_color }} className="text-white p-4 rounded-2xl shadow-lg">
                       {isLocked ? <Lock size={24}/> : <Unlock size={24}/>}
                    </div>
                    <div>
                       <p className={`font-black text-xl leading-none ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
                       </p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">LMS Access Status</p>
                    </div>
                 </div>
               </div>

               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
                 <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Quick Access</h3>
                 <div className="space-y-3 relative z-10">
                    <DownloadBtn label="Class Schedule" />
                    <DownloadBtn label="Student Handbook" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </main>
      
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"></div>}
    </div>
  );
};

// MINI COMPONENTS
const SidebarBtn = ({ icon, label, active, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg shadow-yellow-500/10' : disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}>
    {icon} {label}
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[13px] font-black text-slate-900">{value || '---'}</p>
  </div>
);

const DownloadBtn = ({ label }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest">
     {label} <Download size={14} className="text-yellow-500" />
  </button>
);

export default StudentDashboard;