import React, { useState, useEffect } from 'react';
import { BookOpen, Users, AlertCircle, Clock, Zap, ChevronRight } from 'lucide-react';
import { getActiveSchoolYear } from '../../utils/dateUtils'; 
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext'; // <-- ADDED: I-import ang AuthContext
import axios from 'axios'; // <-- ADDED: Gamitin natin axios for cleaner API calls

const TeacherDashboard = () => {
  const { syStart, syEnd, semester } = getActiveSchoolYear();
  const { user, API_BASE_URL } = useAuth(); // <-- ADDED: Kunin ang logged in user data
  const [stats, setStats] = useState({ classes: 0, students: 0, pendingGrading: 0 });
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchDashboardData = async () => {
    if (!user || !user.id) return; // Siguraduhing may user ID bago mag-fetch
    
    setIsRetrying(true);
    const cachedSchedules = localStorage.getItem(`sms_teacher_schedules_${user.id}`);

    if (cachedSchedules && !isRetrying) {
      const parsedSchedules = JSON.parse(cachedSchedules);
      setSchedules(parsedSchedules);
      // Pansamantalang dynamic stats base sa bilang ng subjects
      setStats({ classes: parsedSchedules.length, students: parsedSchedules.length * 30, pendingGrading: 0 });
      setIsLoading(false); 
    }

    try {
      // <-- NA-UPDATE: Gamitin ang totoong API na ginawa natin kanina
      const response = await axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php?teacher_id=${user.id}`);
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setSchedules(data);
        
        // Compute stats dynamically based on fetched schedule
        const newStats = {
           classes: data.length,
           students: data.length * 30, // Estimasyon lang muna, pwedeng gawan ng sariling API query later
           pendingGrading: 0
        };
        setStats(newStats);
        
        localStorage.setItem(`sms_teacher_schedules_${user.id}`, JSON.stringify(data));
        setIsServerOffline(false); 
      } else {
        throw new Error(response.data.message || 'Error fetching schedule');
      }
      
    } catch (error) {
      console.error(error);
      setIsServerOffline(true);
      if (!cachedSchedules) {
        setSchedules([]); // Wag mag-display ng fake data kung walang cached para iwas confusion
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800); 
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]); // Re-run kung magbago ang user (halimbawa, kakalogin lang)

  const statCards = [
    { icon: <BookOpen size={18}/>, label: 'My Classes', value: stats.classes, color: 'text-blue-600', bg: 'bg-blue-100/60' },
    { icon: <Users size={18}/>, label: 'Est. Students', value: stats.students, color: 'text-emerald-600', bg: 'bg-emerald-100/60' },
    { icon: <Clock size={18}/>, label: 'Next Class', value: schedules.length > 0 ? schedules[0].schedule.split(' ')[0] : '--', color: 'text-orange-600', bg: 'bg-orange-100/60' },
    { icon: <AlertCircle size={18}/>, label: 'Pending Grades', value: stats.pendingGrading, color: 'text-red-600', bg: 'bg-red-100/60' },
  ];

  if (isLoading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
          <div className="text-sm font-bold text-indigo-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-transparent lg:h-[calc(100vh-7rem)] lg:-mt-4 lg:overflow-hidden pb-6 lg:pb-0">
      
      <style>{`
        @keyframes fadeInUpGPU {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-stagger {
          animation: fadeInUpGPU 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
          backface-visibility: hidden;
        }
        .custom-scroll::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.4); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(107, 114, 128, 0.8); }
      `}</style>

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-3 lg:gap-4 lg:h-full">

        {/* HEADER */}
        <div className="animate-stagger shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" style={{ animationDelay: '0ms' }}>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Overview</h2>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Welcome back, <span className="font-bold">{user?.full_name}</span>! Here's your schedule and tasks for today.</p>
          </div>
          <span className="text-[11px] font-bold text-slate-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-white/80 shrink-0">
            SY {syStart}-{syEnd} <span className="text-slate-400 mx-1">|</span> {semester}
          </span>
        </div>

        {/* OFFLINE BANNER */}
        <div className="shrink-0">
          <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={fetchDashboardData} />
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
          {statCards.map((stat, index) => (
            <div key={index} className="animate-stagger bg-white/40 backdrop-blur-md p-4 rounded-xl shadow-sm border border-white hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-300 transform-gpu flex items-center gap-3 group cursor-default" style={{ animationDelay: `${100 + (index * 40)}ms` }}>
              <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color} shrink-0 shadow-inner border border-white/50 group-hover:scale-105 transition-transform duration-300 transform-gpu`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className={`text-xl font-black tracking-tight ${stat.label === 'Pending Grades' && stat.value > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================== */}
        {/* SCROLLABLE CONTAINERS AREA */}
        {/* ========================================== */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-3 md:gap-4 lg:min-h-0">
          
          {/* LEFT SIDE: SCHEDULE SECTION */}
          <div 
            className="animate-stagger lg:col-span-2 bg-white/40 backdrop-blur-md rounded-xl shadow-sm border border-white flex flex-col min-h-[400px] lg:min-h-0 lg:h-full overflow-hidden"
            style={{ animationDelay: '250ms' }}
          >
            {/* CONTAINER TITLE */}
            <div className="px-5 py-3.5 border-b border-white/60 bg-white/20 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">Your Assigned Classes</h3>
              </div>
              <span className="text-[9px] font-bold bg-white/60 text-slate-700 px-2.5 py-1 rounded-md shadow-sm border border-white uppercase tracking-wider">
                {schedules.length} Classes
              </span>
            </div>

            {/* TABLE HEADERS - Naka-hide sa Mobile, lalabas lang sa Tablet/Desktop */}
            <div className="px-5 py-2.5 bg-white/40 border-b border-white/60 shrink-0 hidden md:block">
              <div className="grid grid-cols-12 gap-2 text-slate-500 text-[9px] font-black uppercase tracking-widest items-center">
                <div className="col-span-4">Subject & Section</div>
                <div className="col-span-4">Schedule</div>
                <div className="col-span-2">Room</div>
                <div className="col-span-2 text-right">Action</div>
              </div>
            </div>
            
            {/* TABLE DATA */}
            <div className="flex-1 overflow-y-auto custom-scroll p-2">
              <div className="flex flex-col space-y-1">
                {schedules.length > 0 ? (
                  schedules.map(sched => (
                    <div key={sched.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-2 items-start md:items-center px-3 py-3 hover:bg-white/50 transition-colors border-b border-white/30 last:border-0 group rounded-lg">
                      
                      {/* Subject & Section (Dinugtong na yung Section) */}
                      <div className="md:col-span-4 pr-2">
                        <div className="font-bold text-slate-800 text-[12px] md:text-[11px] truncate">
                          {sched.subject_description}
                        </div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                          {sched.grade_level} - {sched.section}
                        </div>
                      </div>
                      
                      {/* Time */}
                      <div className="md:col-span-4 text-slate-600 text-[10px] font-semibold flex items-center gap-1.5 mt-1 md:mt-0">
                        <div className="p-1 bg-indigo-100/50 rounded text-indigo-500 shrink-0">
                          <Clock size={10} />
                        </div>
                        <span>{sched.schedule}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2 md:mt-0 md:contents">
                        {/* Room */}
                        <div className="md:col-span-2">
                          <span className="bg-white/80 text-slate-700 px-2 py-1 rounded-md text-[9px] font-bold border border-white shadow-sm truncate inline-block max-w-full">
                            {sched.room || 'TBA'}
                          </span>
                        </div>
                        
                        {/* Action */}
                        <div className="md:col-span-2 text-right">
                          <button className="inline-flex items-center justify-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold text-[9px] uppercase tracking-wider md:opacity-80 group-hover:opacity-100 transition-all bg-white/50 px-3 md:px-2 py-1.5 rounded-md border border-white/80 shadow-sm hover:bg-white hover:shadow w-fit md:w-full md:max-w-[70px] ml-auto">
                            Enter <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 h-full">
                    <BookOpen className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No classes assigned to you yet.</p>
                    <p className="text-[10px] text-slate-400 mt-1 text-center">Contact the registrar if you think this is a mistake.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: REMINDERS (Retained for UI look, can be integrated with tasks table later) */}
          <div 
            className="animate-stagger lg:col-span-1 bg-white/40 backdrop-blur-md border border-white shadow-sm rounded-xl flex flex-col min-h-[350px] lg:min-h-0 lg:h-full overflow-hidden"
            style={{ animationDelay: '300ms' }}
          >
            <div className="px-4 py-3.5 border-b border-white/60 bg-white/20 flex justify-between items-center shrink-0">
              <h3 className="text-sm font-bold text-slate-800">Tasks & Reminders</h3>
              <button className="text-[9px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider bg-white/50 px-2 py-1 rounded-md border border-white shadow-sm transition-colors">
                View All
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
              <div className="flex items-start gap-2.5 p-2.5 bg-white/50 rounded-lg border border-white shadow-sm hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 transform-gpu cursor-pointer group">
                <div className="p-1.5 bg-orange-100/80 rounded-md text-orange-500 shrink-0 group-hover:scale-110 transition-transform duration-300 transform-gpu"><Zap size={14} /></div>
                <div className="mt-0.5"><p className="text-[11px] text-slate-800 font-bold leading-tight">Grade Networking Quiz</p><p className="text-[9px] text-slate-500 font-semibold mt-0.5">Sec 3A • Due Today</p></div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white/50 rounded-lg border border-white shadow-sm hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 transform-gpu cursor-pointer group">
                <div className="p-1.5 bg-indigo-100/80 rounded-md text-indigo-500 shrink-0 group-hover:scale-110 transition-transform duration-300 transform-gpu"><BookOpen size={14} /></div>
                <div className="mt-0.5"><p className="text-[11px] text-slate-800 font-bold leading-tight">Upload Midterm Syllabus</p><p className="text-[9px] text-slate-500 font-semibold mt-0.5">Gr 12 STEM • Due Tomorrow</p></div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-white/50 rounded-lg border border-white shadow-sm hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 transform-gpu cursor-pointer group">
                <div className="p-1.5 bg-red-100/80 rounded-md text-red-500 shrink-0 group-hover:scale-110 transition-transform duration-300 transform-gpu"><AlertCircle size={14} /></div>
                <div className="mt-0.5"><p className="text-[11px] text-slate-800 font-bold leading-tight">Finalize Computed Grades</p><p className="text-[9px] text-slate-500 font-semibold mt-0.5">All Sections • Due in 3 Days</p></div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TeacherDashboard;