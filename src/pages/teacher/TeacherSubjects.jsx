import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, FileText, Clock, Layers, Layout, WifiOff } from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner'; 
import { useAuth } from '../../context/AuthContext'; // <-- ADDED: Para makuha yung logged-in teacher

const TeacherSubjects = () => {
  const { user, API_BASE_URL } = useAuth(); // <-- ADDED
  const [subjects, setSubjects] = useState([]);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); 

  // Array of colors para maging dynamic yung gilid ng card kahit galing database
  const cardColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-rose-500', 'bg-cyan-500'];

  const fetchSubjects = async () => {
    if (!user || !user.id) return;

    setIsRetrying(true);
    try {
      // <-- NA-UPDATE: Gagamitin na natin yung totoong API endpoint na ginawa natin
      const response = await axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php?teacher_id=${user.id}`);
      
      if (response.data.status === 'success') {
        setSubjects(response.data.data);
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      setIsServerOffline(true);
      setSubjects([]); // <-- Tinanggal na natin ang dummy data. Dapat totoong blanko kung offline o error.
    } finally {
      setTimeout(() => setIsRetrying(false), 800); 
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  return (
    <div className="w-full h-full bg-transparent">
      
      <style>{`
        @keyframes fadeInUpGPU {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-stagger {
          animation: fadeInUpGPU 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4">
        
        {/* HEADER SECTION */}
        <div 
          className="animate-stagger flex flex-col justify-center bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" 
          style={{ animationDelay: '0ms' }}
        >
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Subjects</h2>
          <p className="text-[11px] text-slate-600 font-medium mt-0.5">Ito ang mga subjects/lessons na itinalaga sa iyo ngayong semester.</p>
        </div>

        {/* OFFLINE BANNER */}
        <div className="animate-stagger" style={{ animationDelay: '50ms' }}>
          <OfflineBanner 
            isServerOffline={isServerOffline} 
            isRetrying={isRetrying} 
            onRetry={fetchSubjects} 
          />
        </div>

        {/* SUBJECT CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {subjects.length > 0 ? (
            subjects.map((sub, index) => {
              // Kumuha ng dynamic color base sa index
              const stripeColor = cardColors[index % cardColors.length];

              return (
                <div 
                  key={sub.id} 
                  className="animate-stagger bg-white/40 backdrop-blur-md border border-white rounded-xl overflow-hidden flex shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300 transform-gpu hover:-translate-y-1 group" 
                  style={{ animationDelay: `${100 + (index * 50)}ms` }}
                >
                  {/* Dynamic Color Strip */}
                  <div className={`w-1.5 ${stripeColor}`}></div>
                  
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1 pr-2">
                        {sub.subject_description} {/* <-- Mula sa Database */}
                      </h3>
                      <span className="bg-white/60 border border-white text-slate-600 text-[9px] font-black px-2 py-1 rounded-md shadow-sm uppercase tracking-widest shrink-0">
                        {sub.units} UNITS
                      </span>
                    </div>
                    
                    {/* Grade Level & Section Info */}
                    <div className="mt-1 mb-4 flex gap-2">
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200/50">
                         {sub.grade_level}
                       </span>
                       <span className="text-[10px] font-bold text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-200/50">
                         SEC: {sub.section}
                       </span>
                    </div>
                    
                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-2 border-t border-white/50 pt-3 mt-auto">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                        <Clock size={12} className="text-indigo-500 shrink-0" /> 
                        <span className="truncate">{sub.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
                        <Layers size={12} className="text-indigo-500 shrink-0" /> 
                        <span>Modules</span> {/* Pwedeng maging dynamic rin ito later */}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all">
                        View Modules
                      </button>
                      <button className="flex-1 py-1.5 bg-white/60 backdrop-blur-sm border border-white text-slate-600 rounded-lg text-[10px] font-bold hover:bg-white hover:shadow-sm transition-all">
                        Lesson Plan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            /* EMPTY STATE KUNG WALANG ASSIGNMENT O NAGLO-LOADING */
            !isServerOffline && !isRetrying && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/30 backdrop-blur-sm rounded-xl border border-white/50">
                <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-600">No Subjects Assigned</h3>
                <p className="text-[11px] text-slate-500 mt-1 text-center max-w-sm">You currently have no classes assigned. Please coordinate with the Registrar for your teaching load.</p>
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherSubjects;