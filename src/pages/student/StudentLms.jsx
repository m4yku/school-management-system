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

  const getStudentDetails = (grade, section, program) => {
    if (!grade) return { dept: "N/A", displaySection: section || "TBA" };
    const g = grade.toString().toUpperCase();
    const gNum = parseInt(g.replace(/\D/g, ''));

    if (g.includes('KINDER') || (gNum >= 1 && gNum <= 6)) return { dept: "Elementary", displaySection: section || "TBA" };
    if (gNum >= 7 && gNum <= 10) return { dept: "Junior High School", displaySection: section || "TBA" };
    if (gNum === 11 || gNum === 12) {
      const strand = program || ""; 
      return { dept: "Senior High School", displaySection: strand ? `${strand} - ${section}` : section };
    }
    if (g.includes('YEAR') || gNum > 12 || g.includes('COLLEGE')) return { dept: "College", displaySection: section || "TBA" };
    return { dept: "Basic Education", displaySection: section || "TBA" };
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_students.php`);
      const studentList = response.data.students || [];
      const billingItems = response.data.billing_items || [];
      const myData = studentList.find(s => s.email === user.email);
      
      if (myData) {
        // --- GATEKEEPER LOGIC (ENHANCED) ---
        const currentEnrollment = (myData.enrollment_status || "").trim();
        const currentPaymentStatus = (myData.payment_status || "").toLowerCase().trim();
        const paidAmount = parseFloat(myData.paid_amount || 0);

        // Hanapin ang Tuition Fee amount mula sa billing items
        const tuitionItem = billingItems.find(item => 
          item.billing_id === myData.billing_id && 
          item.item_name.toLowerCase().includes('tuition')
        );
        const tuitionFee = tuitionItem ? parseFloat(tuitionItem.amount) : 0;
        const tuitionThreshold = tuitionFee * 0.5; // 50% Requirement

        // Logic: Dapat Enrolled AT (Paid >= 50% ng Tuition)
        const isEnrolled = currentEnrollment === 'Enrolled';
        const hasMetTuitionRequirement = paidAmount >= tuitionThreshold;

        if (isEnrolled && hasMetTuitionRequirement) {
          myData.isLmsLocked = false;
        } else {
          myData.isLmsLocked = true;
          // Karagdagang info para sa Lock Screen
          myData.neededAmount = tuitionThreshold - paidAmount;
          myData.tuitionTotal = tuitionFee;
        }

        const { dept, displaySection } = getStudentDetails(myData.grade_level, myData.section, myData.program_name);
        myData.dynamicDept = dept;
        myData.formattedSection = displaySection;
        
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-sans font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Verifying Credentials...
    </div>
  );

  if (studentData?.isLmsLocked) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-6 bg-slate-50 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border-2 border-red-100 text-center animate-in zoom-in duration-300">
          <div className="w-24 h-24 bg-red-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-red-200">
            <Lock size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">LMS Locked</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">
            Paumanhin, <span className="font-black text-slate-800">{studentData?.first_name}</span>. 
            Naka-lock ang iyong access. Kailangan mong mabayaran ang <strong className="font-bold text-slate-900">hindi bababa sa 50% ng iyong Tuition Fee</strong> para ma-activate ang portal.
            <br/><br/>
            <div className="bg-red-50 p-6 rounded-[1.5rem] text-[11px] space-y-2 border border-red-100 shadow-inner">
                <p className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-wider">
                  Tuition Fee: 
                  <span className="font-black text-slate-900">₱{parseFloat(studentData?.tuitionTotal || 0).toLocaleString()}</span>
                </p>
                <p className="flex justify-between items-center text-slate-500 font-bold uppercase tracking-wider">
                  Amount Paid: 
                  <span className="font-black text-blue-600">₱{parseFloat(studentData?.paid_amount || 0).toLocaleString()}</span>
                </p>
                {studentData?.neededAmount > 0 && (
                  <p className="flex justify-between items-center text-red-600 font-black uppercase tracking-wider pt-2 border-t border-red-200">
                    Kulang para ma-unlock: 
                    <span className="bg-white px-2 py-1 rounded shadow-sm">₱{studentData.neededAmount.toLocaleString()}</span>
                  </p>
                )}
            </div>
            <p className="mt-4 text-[10px] italic font-medium">Mangyaring magbayad sa Cashier para mabuksan ang portal.</p>
          </p>
          <button onClick={() => navigate('/student/dashboard')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const renderClassroomView = (title, icon, color, placeholderText, typeIcon) => (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-in slide-in-from-right duration-500 font-sans">
      <button onClick={() => setViewMode('grid')} className="flex items-center gap-2 text-slate-500 font-black uppercase text-[11px] tracking-widest mb-6 hover:text-slate-900 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div style={{ backgroundColor: color }} className="h-48 relative p-8 flex flex-col justify-end text-white">
          <div className="absolute top-0 right-0 p-8 opacity-20">{icon}</div>
          <div className="z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block shadow-sm">{studentData?.dynamicDept}</span>
            <h2 className="text-4xl font-black tracking-tighter leading-none">{title}</h2>
            <p className="text-white/90 font-bold text-sm mt-1">{studentData?.grade_level} - {studentData?.formattedSection} | SY {studentData?.school_year}</p>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-5 p-6 border border-slate-100 rounded-2xl hover:shadow-xl hover:border-transparent cursor-pointer transition-all bg-white group">
                <div style={{ backgroundColor: color }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-lg">{typeIcon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-black text-slate-900 tracking-tight leading-tight">{placeholderText} #{i}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1 italic">Target: {studentData?.grade_level}</p>
                    </div>
                    <MoreVertical size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'modules') return renderClassroomView("Learning Modules", <BookOpen size={120}/>, branding.theme_color, "Subject Module", <FileText size={24}/>);
  if (viewMode === 'lectures') return renderClassroomView("Video Lectures", <Video size={120}/>, "#6366f1", "Recorded Video", <PlayCircle size={24}/>);
  if (viewMode === 'quizzes') return renderClassroomView("Quizzes & Exams", <ClipboardList size={120}/>, "#f43f5e", "Graded Quiz", <CheckCircle2 size={24}/>);
  if (viewMode === 'discussion') return renderClassroomView("Class Discussion", <MessageSquare size={120}/>, "#0ea5e9", "Class Stream", <HelpCircle size={24}/>);

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-10 animate-in fade-in duration-500 font-sans">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <span className="bg-yellow-400 text-[#001f3f] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md italic">
              {studentData?.grade_level} - {studentData?.formattedSection}
            </span>
            <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md italic">
              Status: {studentData?.payment_status}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-3 leading-none">
            Classroom <span style={{ color: branding.theme_color }}>Modules</span>
          </h1>
          <p className="text-slate-400 font-black uppercase text-[11px] tracking-[0.4em]">
            SY {studentData?.school_year} | {studentData?.dynamicDept}
          </p>
        </div>
      </header>

      <div style={{ backgroundColor: branding.theme_color }} className="text-white p-8 rounded-[3rem] flex items-center gap-8 shadow-2xl relative overflow-hidden group">
        <div className="bg-white/20 p-5 rounded-[1.5rem] shadow-inner backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
          <Unlock size={28} className="text-yellow-400 animate-pulse" />
        </div>
        <div>
          <p className="font-black text-[11px] uppercase tracking-[0.2em] opacity-80">Portal Active</p>
          <p className="font-black text-2xl tracking-tight">Welcome back, {studentData?.first_name}!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div onClick={() => setViewMode('modules')}><LMSCard icon={<BookOpen size={36} />} title="Learning Modules" desc={`${studentData?.grade_level} materials.`} count="8 New" color={branding.theme_color} /></div>
          <div onClick={() => setViewMode('lectures')}><LMSCard icon={<PlayCircle size={36} />} title="Video Lectures" desc="Watch recorded lessons." count="3 Videos" color="#6366f1" /></div>
          <div onClick={() => setViewMode('quizzes')}><LMSCard icon={<ClipboardList size={36} />} title="Quizzes & Exams" desc="Grade assessments." count="2 Pending" color="#f43f5e" /></div>
          <div onClick={() => setViewMode('discussion')}><LMSCard icon={<MessageSquare size={36} />} title="Class Discussion" desc="Interact with class." count="Active" color="#0ea5e9" /></div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border-2 border-slate-50 p-10 rounded-[3rem] shadow-xl">
            <h3 className="font-black text-slate-900 mb-8 uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
              <GraduationCap size={20} className="text-emerald-500"/> Enrollment Info
            </h3>
            <div className="space-y-5">
              <StatusItem label="Department" value={studentData?.dynamicDept} />
              <StatusItem label="Payment Status" value={studentData?.payment_status} />
              <StatusItem label="Section" value={studentData?.formattedSection} />
            </div>
          </div>

          <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <h3 className="font-black text-white/40 mb-8 uppercase text-[11px] tracking-[0.2em] flex items-center gap-3">
              <BarChart3 size={20} className="text-yellow-400"/> Overall Progress
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest mb-1">Academic GPA</p>
                  <p className="text-4xl font-black tracking-tighter text-yellow-400">1.25</p>
                </div>
                <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full uppercase tracking-widest text-emerald-400 border border-emerald-400/20">Excellent</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                   <span className="text-white/40">Attendance</span>
                   <span className="text-emerald-400">98%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: '98%' }}></div>
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
  <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all cursor-pointer group h-full flex flex-col justify-between">
    <div>
      <div style={{ color: color }} className="mb-8 group-hover:scale-125 transition-transform duration-500 ease-out">{icon}</div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{title}</h3>
      </div>
      <p className="text-slate-400 text-sm font-bold leading-relaxed">{desc}</p>
    </div>
    <div className="mt-8">
       <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg uppercase tracking-widest group-hover:bg-slate-900 group-hover:text-white transition-colors">{count}</span>
    </div>
  </div>
);

const StatusItem = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="font-black text-slate-900 tracking-tight">{value}</span>
  </div>
);

export default StudentLms;