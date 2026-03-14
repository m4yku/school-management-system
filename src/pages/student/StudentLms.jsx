import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Video, FileText, GraduationCap, 
  Lock, Unlock, Loader2, ArrowLeft, PlayCircle, 
  ClipboardList, MessageSquare, Info, MoreVertical,
  Send, HelpCircle, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentLms = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  
  // View Modes: 'grid', 'modules', 'lectures', 'quizzes', 'discussion'
  const [viewMode, setViewMode] = useState('grid'); 

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

  const isLocked = !studentData || studentData.payment_status === 'Unpaid';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Accessing Learning Management System...
    </div>
  );

  if (isLocked) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-red-100 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-red-200">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase">LMS Locked</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            Paumanhin, <span className="font-black">{studentData?.first_name}</span>. Ang iyong **LMS** ay kasalukuyang naka-lock.
            <br/><br/>
            Mangyaring makipag-ugnayan sa <span className="text-red-600 font-black">Cashier</span> para sa settlement.
          </p>
          <button onClick={() => navigate('/student/accounting')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
            Go to Accounting <ArrowLeft size={14} className="rotate-180"/>
          </button>
        </div>
      </div>
    );
  }

  // --- SUB-PAGE UI RENDERER ---
  const renderClassroomView = (title, icon, color, placeholderText, typeIcon) => (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in slide-in-from-right duration-500">
      <button 
        onClick={() => setViewMode('grid')}
        className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-6 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to LMS Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div style={{ backgroundColor: color }} className="h-48 relative p-8 flex flex-col justify-end text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20">{icon}</div>
          <h2 className="text-3xl font-bold z-10">{title}</h2>
          <p className="text-white/80 font-medium z-10">{studentData?.section} | SY 2025-2026</p>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Announcement</h4>
              <p className="text-[11px] text-slate-400 italic">"Always check this section for new {title.toLowerCase()} updates from your instructors."</p>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {/* Action Bar for Discussion */}
            {viewMode === 'discussion' && (
              <div className="p-4 border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">{studentData?.first_name[0]}</div>
                <input type="text" placeholder="Announce something to your class..." className="flex-1 bg-transparent border-none text-sm focus:ring-0" />
                <Send size={18} className="text-slate-400 cursor-pointer hover:text-blue-600" />
              </div>
            )}

            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-5 border border-slate-200 rounded-xl hover:shadow-md cursor-pointer transition-all bg-white">
                <div style={{ backgroundColor: color }} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0">
                  {typeIcon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{placeholderText} #{i}</p>
                      <p className="text-[10px] text-slate-400">Posted: Oct {15 + i}, 2025</p>
                    </div>
                    <MoreVertical size={16} className="text-slate-400" />
                  </div>
                  {viewMode === 'discussion' && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                      <MessageSquare size={12} /> 0 Class Comments
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- LOGIC SWITCHER FOR VIEWS ---
  if (viewMode === 'modules') return renderClassroomView("Learning Modules", <BookOpen size={120}/>, branding.theme_color, "New Subject Material", <FileText size={20}/>);
  if (viewMode === 'lectures') return renderClassroomView("Video Lectures", <Video size={120}/>, "#6366f1", "New Video Lesson", <PlayCircle size={20}/>);
  if (viewMode === 'quizzes') return renderClassroomView("Quizzes & Exams", <ClipboardList size={120}/>, "#f43f5e", "New Assessment Task", <CheckCircle2 size={20}/>);
  if (viewMode === 'discussion') return renderClassroomView("Class Discussion", <MessageSquare size={120}/>, "#0ea5e9", "Class Announcement", <HelpCircle size={20}/>);

  // --- MAIN LMS GRID UI ---
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
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
            Welcome, {studentData?.first_name}! Let's start learning.
          </p>
        </div>
      </header>

      <div style={{ backgroundColor: branding.theme_color }} className="text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="bg-white/20 p-4 rounded-2xl"><Unlock size={24} className="text-yellow-400 animate-pulse" /></div>
        <div>
          <p className="font-black text-[10px] uppercase tracking-widest opacity-80">System Message</p>
          <p className="font-bold text-sm">Account Verified. All classroom sections are open.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => setViewMode('modules')}>
            <LMSCard icon={<BookOpen size={32} />} title="Learning Modules" desc="Subject lessons and reading materials." count="8 New" color={branding.theme_color} />
          </div>
          <div onClick={() => setViewMode('lectures')}>
            <LMSCard icon={<PlayCircle size={32} />} title="Video Lectures" desc="Watch recorded sessions and instructional videos." count="3 Videos" color="#6366f1" />
          </div>
          <div onClick={() => setViewMode('quizzes')}>
            <LMSCard icon={<ClipboardList size={32} />} title="Quizzes & Exams" desc="Complete assessments and check feedback." count="2 Pending" color="#f43f5e" />
          </div>
          <div onClick={() => setViewMode('discussion')}>
            <LMSCard icon={<MessageSquare size={32} />} title="Class Discussion" desc="Interact with your classmates and teachers." count="Active" color="#0ea5e9" />
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
};

const LMSCard = ({ icon, title, desc, count, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group h-full">
    <div style={{ color: color }} className="mb-6 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-md uppercase tracking-tighter">{count}</span>
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

export default StudentLms;