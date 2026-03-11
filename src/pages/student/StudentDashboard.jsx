import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar as CalendarIcon, 
  CheckCircle2, Bell, Megaphone, Info, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  // API URL Base (Siguraduhing tama ito sa XAMPP folder mo)
  const API_BASE_URL = "http://localhost/sms-api"; 

  const [branding, setBranding] = useState({
    school_name: 'School Portal',
    theme_color: '#001f3f',
    school_logo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Load Branding (Logo at Kulay)
        const brandRes = await axios.get(`${API_BASE_URL}/branding.php`);
        if (brandRes.data) {
          setBranding(brandRes.data);
        }

        // 2. Load Student Information
        const studentRes = await axios.get(`${API_BASE_URL}/get_students.php`);
        // Hanapin ang record ng user base sa email
        const myData = studentRes.data.find(s => s.email === user.email);
        
        if (myData) {
          setStudentData(myData);
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchData();
    }
  }, [user.email]);

  // Lock logic para sa LMS access
  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-black animate-pulse text-slate-400">
      CONNECTING TO PORTAL...
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className="w-72 text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl shrink-0 z-20"
      >
        {/* LOGO SECTION */}
        <div className="p-8 text-center border-b border-white/5">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-xl">
            {branding.school_logo ? (
              <img 
                src={`${API_BASE_URL}/${branding.school_logo}`} 
                alt="Logo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=LOGO"; }}
              />
            ) : (
              <span className="text-slate-800 font-black text-2xl italic">CSPB</span>
            )}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">
            {branding.school_name}
          </h2>
        </div>

        {/* --- PROFILE PICTURE SECTION --- */}
        <div className="px-8 py-6 text-center border-b border-white/5 bg-black/10">
          <div className="relative inline-block">
            {/* Profile Image Circle */}
            <div className="w-20 h-20 rounded-full border-2 border-yellow-500 p-1 mx-auto mb-3 shadow-lg overflow-hidden bg-slate-700">
              {studentData?.profile_image ? (
                <img 
                  src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} 
                  className="w-full h-full rounded-full object-cover" 
                  alt="Profile"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-2xl font-black text-yellow-500">
                  {/* Unang letra ng pangalan as fallback */}
                  {studentData?.first_name?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            {/* Online Status Indicator */}
            <div className="absolute bottom-4 right-1 w-4 h-4 bg-green-500 border-2 border-[#001f3f] rounded-full shadow-sm"></div>
          </div>
          
          <p className="font-black text-sm tracking-tight truncate px-2">
            {studentData?.first_name} {studentData?.last_name}
          </p>
          <p className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest opacity-80 mt-1">
            Student Account
          </p>
        </div>

        {/* NAVIGATION LINKS */}
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

        {/* LOGOUT */}
        <div className="p-6 border-t border-white/5">
          <button onClick={logout} className="w-full p-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* HEADER: BADGES, YEAR LEVEL & STATUS */}
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {/* YEAR LEVEL */}
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                {studentData?.grade_level || 'Grade 12'}
              </span>
              {/* ENROLLMENT TYPE */}
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                {studentData?.enrollment_type || 'Continuing'}
              </span>
              {/* PORTAL STATUS */}
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${studentData?.enrollment_status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                {studentData?.enrollment_status || 'Pending'}
              </span>
            </div>

            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
              Mabuhay, <span style={{ color: branding.theme_color }}>{studentData?.first_name || 'Joshua'}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] mt-1">
              STUDENT ID: {studentData?.student_id || '2026-0004'} | S.Y. {studentData?.school_year || '2025-2026'}
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              {/* ANNOUNCEMENT */}
              <div style={{ backgroundColor: branding.theme_color }} className="text-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl overflow-hidden">
                <Megaphone size={24} className="shrink-0 animate-bounce" />
                <marquee className="font-black text-sm uppercase tracking-widest italic">
                   Welcome to the Official Student Portal. Your current status is {studentData?.enrollment_status || 'Checking'}.
                </marquee>
              </div>

              {/* ENROLLMENT DETAILS TABLE */}
              <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><Info size={100} /></div>
                <h3 className="font-black text-slate-800 mb-8 uppercase text-[11px] tracking-[0.2em] flex items-center gap-2">
                   <CheckCircle2 size={16} className="text-blue-500"/> Official Enrollment Records
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-10 relative z-10">
                   <InfoItem label="Grade Level" value={studentData?.grade_level} />
                   <InfoItem label="Classification" value={studentData?.enrollment_type} />
                   <InfoItem label="School Year" value={studentData?.school_year} />
                   <InfoItem label="Portal Access" value={studentData?.enrollment_status} />
                   <InfoItem label="Payment Plan" value={studentData?.payment_plan} />
                   <InfoItem label="LRN Number" value={studentData?.lrn} />
                </div>
              </section>
            </div>

            {/* RIGHT SIDE ACTIONS */}
            <div className="space-y-8">
               {/* ACCESS CARD */}
               <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${isLocked ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-emerald-50 border-emerald-100 shadow-sm'}`}>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Portal Status</p>
                 <div className="flex items-center gap-4">
                    <div className={`${isLocked ? 'bg-red-500' : 'bg-emerald-500'} text-white p-4 rounded-3xl shadow-lg`}>
                       {isLocked ? <Lock size={28}/> : <Unlock size={28}/>}
                    </div>
                    <div>
                       <p className={`font-black text-2xl leading-none ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
                       </p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Verification Required</p>
                    </div>
                 </div>
               </div>

               {/* DOWNLOADS */}
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                 <h3 className="font-black text-[10px] uppercase tracking-widest mb-6 text-slate-500 italic underline">Quick Access</h3>
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

// MINI COMPONENTS
const SidebarBtn = ({ icon, label, active, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg shadow-yellow-500/20' : disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-slate-300'}`}>
    {icon} {label}
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[14px] font-black text-slate-800">{value || '---'}</p>
  </div>
);

const DownloadBtn = ({ label }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[11px] font-bold">
     {label} <Download size={14} className="text-yellow-500" />
  </button>
);

export default StudentDashboard;