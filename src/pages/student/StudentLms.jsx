import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Video, FileText, GraduationCap, 
  Lock, Unlock, Loader2, ArrowLeft, PlayCircle, 
  ClipboardList, MessageSquare, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentLms = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const studentRes = await axios.get(`${API_BASE_URL}/get_students.php`);
      const myData = studentRes.data.find(s => s.email === user.email);
      if (myData) {
        setStudentData(myData);
      }
    } catch (err) {
      console.error("Error fetching LMS data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  // --- GATEKEEPER LOGIC: Lock if Unpaid ---
  const isLocked = !studentData || studentData.payment_status === 'Unpaid';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Accessing Learning Management System...
    </div>
  );

  // --- LOCK SCREEN UI ---
  if (isLocked) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-red-100 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-red-200">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">LMS Locked</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Paumanhin, <span className="font-black">{studentData?.first_name}</span>. Ang iyong **Learning Management System** ay kasalukuyang naka-lock.
            <br/><br/>
            Mangyaring makipag-ugnayan sa <span className="text-red-600 font-black">Cashier</span> para sa iyong payment settlement upang ma-access ang mga modules at quizzes.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/student/accounting')} 
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200"
            >
              Go to Accounting <ArrowLeft size={14} className="rotate-180"/>
            </button>
            <button 
              onClick={() => navigate('/student/dashboard')}
              className="w-full py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition-all"
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN LMS UI (KAPAG BAYAD NA) ---
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
              LMS Access Active
            </span>
            <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md italic">
              Grade {studentData?.grade_level} - {studentData?.section}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Classroom <span style={{ color: branding.theme_color }}>Modules</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            Welcome back, {studentData?.first_name}! Your learning journey continues.
          </p>
        </div>
      </header>

      {/* ANNOUNCEMENT BANNER */}
      <div style={{ backgroundColor: branding.theme_color }} className="text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="bg-white/20 p-4 rounded-2xl">
          <Unlock size={24} className="text-yellow-400 animate-pulse" />
        </div>
        <div>
          <p className="font-black text-[10px] uppercase tracking-widest opacity-80">System Message</p>
          <p className="font-bold text-sm">Your account is fully verified. All learning materials are now available for download.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LMS FEATURES GRID */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <LMSCard 
            icon={<BookOpen size={32} />} 
            title="Learning Modules" 
            desc="Download your PDF lessons and reading materials for this week." 
            count="8 New"
            color={branding.theme_color}
          />
          <LMSCard 
            icon={<PlayCircle size={32} />} 
            title="Video Lectures" 
            desc="Watch recorded sessions and instructional videos from your teachers." 
            count="3 Videos"
            color="#6366f1"
          />
          <LMSCard 
            icon={<ClipboardList size={32} />} 
            title="Quizzes & Exams" 
            desc="Complete your assessments and check your instant feedback." 
            count="2 Pending"
            color="#f43f5e"
          />
          <LMSCard 
            icon={<MessageSquare size={32} />} 
            title="Class Discussion" 
            desc="Interact with your classmates and ask questions to your tutors." 
            count="Active"
            color="#0ea5e9"
          />
        </div>

        {/* SIDEBAR */}
        <div className="space-y-8">
          <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500"/> Academic Status
            </h3>
            <div className="space-y-4">
              <StatusItem label="Current GPA" value="1.25" />
              <StatusItem label="Attendance" value="98%" />
              <StatusItem label="Submissions" value="14/15" />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FileText size={80} />
            </div>
            <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Upcoming Tasks</h3>
            <div className="space-y-4 relative z-10">
              <TaskItem title="Mathematics Quiz" date="Oct 28" />
              <TaskItem title="Science Project" date="Oct 30" />
              <TaskItem title="English Essay" date="Nov 02" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENTS
const LMSCard = ({ icon, title, desc, count, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
    <div style={{ color: color }} className="mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">
        {count}
      </span>
    </div>
    <p className="text-slate-400 text-xs font-medium leading-relaxed">{desc}</p>
  </div>
);

const StatusItem = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-black text-slate-900">{value}</span>
  </div>
);

const TaskItem = ({ title, date }) => (
  <div className="flex items-center justify-between group cursor-pointer">
    <div className="flex items-center gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
      <p className="text-[11px] font-black text-white group-hover:text-yellow-500 transition-colors">{title}</p>
    </div>
    <p className="text-[9px] font-bold text-slate-500">{date}</p>
  </div>
);

export default StudentLms;