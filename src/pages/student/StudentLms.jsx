import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Video, FileText, GraduationCap, 
  Lock, Unlock, Loader2, ArrowLeft, PlayCircle, 
  ClipboardList, MessageSquare, Info, MoreVertical,
  HelpCircle, CheckCircle2, ShieldCheck, BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentLms = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
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

  // --- UPDATED DEPARTMENT LOGIC ---
  const getDepartment = (grade) => {
    if (!grade) return "N/A";
    
    // Kinukuha lang ang numero (e.g., "Grade 12" -> 12)
    const g = parseInt(grade.toString().replace(/\D/g, '')); 
    
    if (g >= 7 && g <= 10) return "Junior High School";
    if (g === 11 || g === 12) return "Senior High School";
    if (g > 12) return "College Department";
    
    // Fallback para sa mga "1st Year", "2nd Year" etc.
    if (grade.toLowerCase().includes('year') || g < 7) return "College Department";
    
    return "Basic Education";
  };

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
            Paumanhin, <span className="font-black">{studentData?.first_name}</span>. Ang iyong access ay kasalukuyang naka-hold.
          </p>
          <button onClick={() => navigate('/student/dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderClassroomView = (title, icon, color, placeholderText, typeIcon) => (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in slide-in-from-right duration-500">
      <button 
        onClick={() => setViewMode('grid')}
        className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-6 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div style={{ backgroundColor: color }} className="h-48 relative p-8 flex flex-col justify-end text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20">{icon}</div>
          <div className="z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
              {getDepartment(studentData?.grade_level)}
            </span>
            <h2 className="text-3xl font-bold">{title}</h2>
            <p className="text-white/80 font-medium">{studentData?.grade_level} - {studentData?.section} | SY {studentData?.school_year}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-5 border border-slate-200 rounded-xl hover:shadow-md cursor-pointer transition-all bg-white group">
                <div style={{ backgroundColor: color }} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  {typeIcon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{placeholderText} #{i}</p>
                      <p className="text-[10px] text-slate-400 font-medium italic">Target: {studentData?.grade_level}</p>
                    </div>
                    <MoreVertical size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'modules') return renderClassroomView("Learning Modules", <BookOpen size={120}/>, branding.theme_color, "Subject Module", <FileText size={20}/>);
  if (viewMode === 'lectures') return renderClassroomView("Video Lectures", <Video size={120}/>, "#6366f1", "Recorded Video", <PlayCircle size={20}/>);
  if (viewMode === 'quizzes') return renderClassroomView("Quizzes & Exams", <ClipboardList size={120}/>, "#f43f5e", "Graded Quiz", <CheckCircle2 size={20}/>);
  if (viewMode === 'discussion') return renderClassroomView("Class Discussion", <MessageSquare size={120}/>, "#0ea5e9", "Class Stream", <HelpCircle size={20}/>);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md italic">
              {studentData?.grade_level} - {studentData?.section}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Classroom <span style={{ color: branding.theme_color }}>Modules</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
            SY {studentData?.school_year} | {getDepartment(studentData?.grade_level)}
          </p>
        </div>
      </header>

      <div style={{ backgroundColor: branding.theme_color }} className="text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl relative overflow-hidden">
        <div className="bg-white/20 p-4 rounded-2xl"><Unlock size={24} className="text-yellow-400 animate-pulse" /></div>
        <div>
          <p className="font-black text-[10px] uppercase tracking-widest opacity-80">Portal Active</p>
          <p className="font-bold text-sm">Welcome back, {studentData?.first_name}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div onClick={() => setViewMode('modules')}><LMSCard icon={<BookOpen size={32} />} title="Learning Modules" desc={`${studentData?.grade_level} materials.`} count="8 New" color={branding.theme_color} /></div>
          <div onClick={() => setViewMode('lectures')}><LMSCard icon={<PlayCircle size={32} />} title="Video Lectures" desc="Watch recorded lessons." count="3 Videos" color="#6366f1" /></div>
          <div onClick={() => setViewMode('quizzes')}><LMSCard icon={<ClipboardList size={32} />} title="Quizzes & Exams" desc="Grade assessments." count="2 Pending" color="#f43f5e" /></div>
          <div onClick={() => setViewMode('discussion')}><LMSCard icon={<MessageSquare size={32} />} title="Class Discussion" desc="Interact with class." count="Active" color="#0ea5e9" /></div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="font-black text-slate-800 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <GraduationCap size={16} className="text-emerald-500"/> Enrollment Info
            </h3>
            <div className="space-y-4">
              <StatusItem label="Department" value={getDepartment(studentData?.grade_level)} />
              <StatusItem label="School Year" value={studentData?.school_year} />
              <StatusItem label="Section" value={studentData?.section} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="font-black text-white/50 mb-6 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <BarChart3 size={16} className="text-yellow-400"/> Overall Progress
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Academic GPA</p>
                  <p className="text-3xl font-black tracking-tighter text-yellow-400">1.25</p>
                </div>
                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">Excellent</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-white/40">Attendance</span>
                   <span>98%</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                   <span className="text-white/40">Submissions</span>
                   <span>14/15</span>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '93%' }}></div>
                </div>
              </div>
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