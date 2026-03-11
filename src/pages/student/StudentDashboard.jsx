import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, BookOpen, CreditCard, Lock, Unlock, 
  LogOut, GraduationCap, Calendar as CalendarIcon, 
  CheckCircle2, Bell, Megaphone, FileText, Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  // Base URL para sa iyong PHP API at Uploads
  const API_BASE_URL = "http://localhost/sms-api"; 

  const [branding, setBranding] = useState({
    school_name: 'School Portal',
    theme_color: '#001f3f',
    school_logo: ''
  });

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        // 1. Load Branding Settings
        const brandRes = await axios.get(`${API_BASE_URL}/branding.php`);
        if (brandRes.data) setBranding(brandRes.data);

        // 2. Load Student Information
        const studentRes = await axios.get(`${API_BASE_URL}/get_students.php`);
        // Hanapin ang student record gamit ang email mula sa AuthContext
        const myData = studentRes.data.find(s => s.email === user.email);
        if (myData) setStudentData(myData);

      } catch (error) {
        console.error("Portal Data Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.email) fetchPortalData();
  }, [user.email]);

  // Logic para sa LMS Lock
  const isLocked = !studentData || studentData.enrollment_status === 'Pending';

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 font-black animate-pulse text-slate-400">
      CONNECTING TO CSPB SYSTEM...
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* --- SIDEBAR (Fixed Width & Dynamic Theme) --- */}
      <aside 
        style={{ backgroundColor: branding.theme_color }} 
        className="w-72 text-white flex flex-col border-r-4 border-yellow-500 shadow-2xl z-20 shrink-0"
      >
        {/* LOGO SECTION */}
        <div className="p-8 text-center border-b border-white/5">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center overflow-hidden border-4 border-yellow-500 shadow-xl transition-transform hover:scale-105">
            {branding.school_logo ? (
              <img 
                // Dito ang fix sa path: API URL + filename (hal. uploads/123.jpg)
                src={`${API_BASE_URL}/${branding.school_logo}`} 
                alt="School Logo" 
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150?text=LOGO"; }}
              />
            ) : (
              <span className="text-[#001f3f] font-black text-2xl italic">CSPB</span>
            )}
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight">
            {branding.school_name}
          </h2>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <SidebarLink icon={<User size={18}/>} label="Dashboard" active />
          
          <SidebarLink 
            icon={isLocked ? <Lock size={18}/> : <BookOpen size={18}/>} 
            label="LMS Classroom" 
            onClick={() => !isLocked && navigate('/lms')}
            disabled={isLocked}
          />
          
          <SidebarLink icon={<CreditCard size={18}/>} label="Accounting" onClick={() => navigate('/accounting')} />
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="p-6 border-t border-white/5">
          <button 
            onClick={logout} 
            className="w-full p-4 bg-white/5 text-white/60 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Scrollable) --- */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          
          {/* HEADER (Nasa Taas na Info) */}
          <header className="mb-10 flex justify-between items-start animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-yellow-500 text-[#001f3f] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                  {studentData?.enrollment_type || 'NEW STUDENT'}
                </span>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {studentData?.grade_level || 'GRADE 12'}
                </span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                Mabuhay, <span style={{ color: branding.theme_color }}>{studentData?.first_name || 'Student'}!</span>
              </h1>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em] mt-1">
                Student ID: {studentData?.student_id} | S.Y. {studentData?.school_year}
              </p>
            </div>
            
            {/* Notification Bell */}
            <div className="p-3 bg-white border rounded-2xl shadow-sm relative cursor-pointer hover:bg-slate-50 transition-all border-slate-200">
               <Bell size={20} className="text-slate-400" />
               <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Main Dashboard Content */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* NEWS MARQUEE */}
              <div 
                style={{ backgroundColor: branding.theme_color }} 
                className="text-white p-5 rounded-[2rem] flex items-center gap-5 shadow-xl shadow-slate-200 overflow-hidden"
              >
                <div className="bg-white/20 p-3 rounded-2xl shrink-0"><Megaphone size={24} /></div>
                <marquee className="font-black text-sm uppercase tracking-widest italic">
                  Important: Preliminary examinations will be conducted online via LMS starting next week. Please ensure your account status is verified.
                </marquee>
              </div>

              {/* SUBJECTS PREVIEW */}
              <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                <h3 className="font-black text-slate-800 mb-8 uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
                   <BookOpen size={18} className="text-blue-500" /> My Current Subjects
                </h3>
                <div className="grid gap-4">
                   <SubjectRow name="21st Century Literature" teacher="Dr. Maria Clara" time="8:00 AM - 9:30 AM" />
                   <SubjectRow name="General Mathematics" teacher="Prof. Jose Rizal" time="10:00 AM - 11:30 AM" />
                   <SubjectRow name="Media and Information Literacy" teacher="Mrs. Teodora Alonso" time="1:00 PM - 2:30 PM" />
                </div>
              </section>

              {/* RECORD TABLE SUMMARY */}
              <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm overflow-hidden">
                <h3 className="font-black text-slate-400 mb-8 uppercase text-[11px] tracking-[0.2em]">Student Record Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
                  <InfoItem label="LRN" value={studentData?.lrn} />
                  <InfoItem label="Prev School" value={studentData?.prev_school} />
                  <InfoItem label="Payment" value={studentData?.payment_plan} />
                  <InfoItem label="Access" value={studentData?.enrollment_status} />
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Account Status & Utilities */}
            <div className="space-y-8">
              
              {/* LMS ACCESS STATUS CARD */}
              <div className={`p-8 rounded-[2.5rem] border-4 transition-all ${isLocked ? 'bg-red-50 border-red-100 shadow-sm' : 'bg-emerald-50 border-emerald-100 shadow-sm'}`}>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Portal Verification</p>
                 <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-3xl ${isLocked ? 'bg-red-500' : 'bg-emerald-500'} text-white shadow-lg`}>
                       {isLocked ? <Lock size={28}/> : <Unlock size={28}/>}
                    </div>
                    <div>
                       <p className={`font-black text-2xl ${isLocked ? 'text-red-700' : 'text-emerald-700'}`}>
                          {isLocked ? 'LOCKED' : 'ACTIVE'}
                       </p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase">{studentData?.enrollment_status || 'Checking...'}</p>
                    </div>
                 </div>
              </div>

              {/* QUICK RESOURCE DOWNLOADS */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-6 opacity-10"><FileText size={80} /></div>
                 <h3 className="font-black text-[10px] uppercase tracking-widest mb-6 text-slate-500 relative z-10">Resources</h3>
                 <div className="space-y-3 relative z-10">
                    <DownloadBtn label="Student Handbook" icon={<FileText size={16}/>} />
                    <DownloadBtn label="Academic Calendar" icon={<CalendarIcon size={16}/>} />
                    <DownloadBtn label="Uniform Guide" icon={<Download size={16}/>} />
                 </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS (Clean & Reusable) ---

const SidebarLink = ({ icon, label, active, onClick, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-sm transition-all
    ${active ? 'bg-yellow-500 text-[#001f3f] shadow-lg shadow-yellow-500/20' : 
    disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10 text-white/70'}`}
  >
    {icon} {label}
  </button>
);

const SubjectRow = ({ name, teacher, time }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all group">
     <div>
        <h4 className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{name}</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{teacher}</p>
     </div>
     <span className="text-[9px] font-black bg-white px-3 py-1 rounded-full border shadow-sm text-slate-500">{time}</span>
  </div>
);

const DownloadBtn = ({ label, icon }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group active:scale-95">
     <div className="flex items-center gap-3 font-bold text-[11px] tracking-wide">{icon} {label}</div>
     <Download size={14} className="opacity-0 group-hover:opacity-100 transition-all text-yellow-500" />
  </button>
);

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{label}</p>
    <p className="text-sm font-black text-slate-800 truncate">{value || '---'}</p>
  </div>
);

export default StudentDashboard;