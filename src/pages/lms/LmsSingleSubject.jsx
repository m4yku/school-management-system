import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { 
  FileText, Video, CheckSquare, Award, Clock, MoreVertical, 
  MessageCircle, FileDown, PieChart as PieChartIcon, 
  LayoutGrid, List as ListIcon, CheckCircle, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LmsSingleSubject = () => {
  const { id } = useParams(); // Ito ang class_id
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'all';
  const { user, API_BASE_URL } = useAuth();

  // ==========================================
  // [ SECTION 1: INSTANT HEADER LOAD ]
  // Kukunin natin ang basic subject info mula sa Layout para instant lumabas ang banner!
  // ==========================================
  const { courses } = useOutletContext();
  const currentCourse = courses?.find(c => String(c.class_id) === String(id)) || {};

  const [gradesViewMode, setGradesViewMode] = useState('list'); // 'list' or 'card'

  // ==========================================
  // [ SECTION 2: DYNAMIC STATES ]
  // Dito papasok ang totoong data galing sa database
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [courseFeed, setCourseFeed] = useState([]);
  const [dueSoon, setDueSoon] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [quarterStanding, setQuarterStanding] = useState({ status: 'Evaluating', grade: 0 });

  // FETCH CLASSROOM DATA
  useEffect(() => {
    const fetchClassroomData = async () => {
      setLoading(true);
      try {
        const studentIdentifier = user?.id || user?.username;
        // Ito ang bagong endpoint na kailangan sa backend
        const res = await axios.get(`${API_BASE_URL}/lms/get_classroom_feed.php?student_id=${studentIdentifier}&class_id=${id}`);
        
        if (res.data.status === 'success') {
          setCourseFeed(res.data.feed || []);
          setDueSoon(res.data.due_soon || []);
          setRecentGrades(res.data.recent_grades || []);
          setQuarterStanding(res.data.standing || { status: 'Evaluating', grade: 0 });
        }
      } catch (err) {
        console.error("Failed to fetch classroom data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && user) fetchClassroomData();
  }, [id, user, API_BASE_URL]);

  // ==========================================
  // [ SECTION 3: FILTERING LOGIC ]
  // ==========================================
  const filteredFeed = courseFeed.filter(item => {
    if (currentTab === 'all') return true;
    if (currentTab === 'lectures' && item.type === 'lecture') return true;
    if (currentTab === 'videos' && item.type === 'video') return true;
    if (currentTab === 'activities' && item.type === 'activity') return true;
    if (currentTab === 'exams' && item.type === 'exam') return true;
    return false;
  });

  const getPostStyle = (type) => {
    switch(type) {
      case 'video': return { icon: <Video size={20}/>, bg: 'bg-rose-100 text-rose-600', tag: 'Video Lecture' };
      case 'activity': return { icon: <CheckSquare size={20}/>, bg: 'bg-orange-100 text-orange-600', tag: 'Written Activity' };
      case 'exam': return { icon: <Award size={20}/>, bg: 'bg-purple-100 text-purple-600', tag: 'Major Exam' };
      default: return { icon: <FileText size={20}/>, bg: 'bg-blue-100 text-blue-600', tag: 'Handout / PDF' };
    }
  };

  // ==========================================
  // [ SECTION 4: UI RENDER ]
  // ==========================================
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 pb-20">
      
      {/* 1. THE CLASSROOM BANNER (Dynamic using Context Data) */}
      <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
         <div className="absolute -right-10 -top-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>

         <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-black/20 backdrop-blur-md text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-4 border border-white/10">
              {currentCourse.tag || 'SUBJECT CODE'}
            </span>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight leading-tight max-w-2xl">
              {currentCourse.title || 'Loading Subject...'}
            </h1>
            <p className="font-bold text-white/80 flex items-center gap-2">
              Teacher: {currentCourse.teacher || 'TBA'}
            </p>
         </div>

         {/* PIE CHART (Dynamic Standing) */}
         <div className="relative z-10 bg-white/10 backdrop-blur-xl p-5 rounded-[2rem] border border-white/20 flex items-center gap-6 shadow-2xl">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Quarter Standing</span>
               <span className="text-2xl font-black text-white">{quarterStanding.status}</span>
               <button onClick={() => navigate('?tab=grades')} className="text-[10px] font-bold text-white/80 underline mt-1 text-left hover:text-white">View full breakdown</button>
            </div>
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative shadow-inner" style={{ background: `conic-gradient(#4ade80 ${quarterStanding.grade}%, rgba(255,255,255,0.2) 0)` }}>
               <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-black">{quarterStanding.grade}%</span>
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN LAYOUT (Left Widget + Right Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         
         {/* LEFT COLUMN: WIDGETS */}
         <div className="lg:col-span-1 space-y-6">
            
            {/* Widget 1: Due Soon */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><Clock size={16} className="text-orange-500"/> Due Soon</h3>
               
               {loading ? (
                 <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" size={20} /></div>
               ) : dueSoon.length > 0 ? (
                 <div className="space-y-4">
                    {dueSoon.map((task) => (
                      <div key={task.id} className="group cursor-pointer">
                         <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</p>
                         <p className="text-[10px] font-bold text-slate-400">Due: {task.date} • {task.time}</p>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-[10px] font-bold text-slate-400 text-center py-2">No upcoming deadlines.</p>
               )}
               
               <button className="w-full mt-6 py-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors">View All</button>
            </div>

            {/* Widget 2: Recent Grades */}
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
               <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2"><PieChartIcon size={16} className="text-emerald-500"/> Recent Grades</h3>
               
               {loading ? (
                 <div className="flex justify-center p-4"><Loader2 className="animate-spin text-slate-300" size={20} /></div>
               ) : recentGrades.length > 0 ? (
                 <div className="space-y-4">
                    {recentGrades.slice(0, 3).map((item, idx) => (
                       <div key={idx} className="flex justify-between items-center group cursor-pointer" onClick={() => navigate('?tab=grades')}>
                          <div>
                             <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors truncate max-w-[120px]">{item.title}</p>
                             <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{item.type}</p>
                          </div>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                             {item.score}/{item.total}
                          </span>
                       </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-[10px] font-bold text-slate-400 text-center py-2">No recent grades.</p>
               )}
               
               <button onClick={() => navigate('?tab=grades')} className="w-full mt-6 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">Open Grades Log</button>
            </div>

         </div>

         {/* RIGHT COLUMN: THE DYNAMIC FEED OR GRADES VIEW */}
         <div className="lg:col-span-3 space-y-6">
            
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 opacity-50">
                  <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Classroom...</p>
               </div>
            ) : currentTab === 'grades' ? (
               /* KUNG NASA 'GRADES' TAB: Ipakita ang Dedicated Grades UI */
               <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                     <h2 className="text-xl font-black text-slate-800 flex items-center gap-2"><Award className="text-emerald-500" /> My Grades Log</h2>
                     
                     <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button onClick={() => setGradesViewMode('card')} className={`p-2 rounded-lg transition-all ${gradesViewMode === 'card' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={16} /></button>
                        <button onClick={() => setGradesViewMode('list')} className={`p-2 rounded-lg transition-all ${gradesViewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><ListIcon size={16} /></button>
                     </div>
                  </div>

                  {recentGrades.length === 0 ? (
                    <p className="text-center text-slate-400 py-10 font-bold text-sm">No graded activities yet.</p>
                  ) : gradesViewMode === 'card' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recentGrades.map(item => (
                           <div key={item.id} className="p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow bg-slate-50 hover:bg-white group">
                              <div className="flex justify-between items-start mb-4">
                                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-100 px-2 py-1 rounded-md">{item.type}</span>
                                 <CheckCircle size={16} className="text-emerald-400" />
                              </div>
                              <h3 className="font-black text-slate-800 mb-1">{item.title}</h3>
                              <p className="text-[10px] font-bold text-slate-500 mb-4">Graded on: {item.date}</p>
                              <div className="pt-4 border-t border-slate-200 flex justify-between items-end">
                                 <span className="text-[10px] font-black uppercase text-slate-400">Score</span>
                                 <span className="text-2xl font-black text-emerald-600">{item.score}<span className="text-sm text-slate-400">/{item.total}</span></span>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="space-y-3">
                        {recentGrades.map(item => (
                           <div key={item.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Award size={18} /></div>
                                 <div>
                                    <h3 className="font-black text-slate-800 text-sm">{item.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400">{item.type} • {item.date}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <span className="text-lg font-black text-emerald-600">{item.score}<span className="text-xs text-slate-400">/{item.total}</span></span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            ) : (
               /* KUNG NASA IBANG TAB (Lectures, Videos, All, etc.): Ipakita ang Feed */
               <>
                  {currentTab !== 'all' && (
                     <div className="flex items-center gap-2 mb-2 text-sm font-black text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Showing filter: <span className="uppercase text-indigo-600">{currentTab}</span>
                     </div>
                  )}

                  {filteredFeed.length === 0 ? (
                     <div className="bg-white rounded-[2rem] p-12 border border-slate-100 shadow-sm text-center animate-in fade-in">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300"><CheckSquare size={32} /></div>
                        <h3 className="text-lg font-black text-slate-700">No {currentTab} posted yet.</h3>
                     </div>
                  ) : (
                     filteredFeed.map((post) => {
                        const style = getPostStyle(post.type);
                        return (
                           <div key={post.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-bottom-2">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center ${style.bg} shadow-inner`}>{style.icon}</div>
                                    <div>
                                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{style.tag}</span>
                                       <h3 className="text-base md:text-lg font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer">{post.title}</h3>
                                       <p className="text-[10px] font-bold text-slate-400 mt-0.5">{post.date} • {post.time}</p>
                                    </div>
                                 </div>
                                 <button className="text-slate-300 hover:text-slate-600 transition-colors p-2"><MoreVertical size={18}/></button>
                              </div>

                              <div className="pl-16">
                                 <p className="text-sm font-bold text-slate-600 mb-4">{post.desc}</p>
                                 <div className="flex flex-wrap items-center gap-3">
                                    {post.type === 'video' && <button className="px-5 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-rose-100 transition-colors"><Video size={16} /> Watch Video</button>}
                                    {post.type === 'lecture' && <button className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-100 transition-colors"><FileDown size={16} /> Download PDF</button>}
                                    {(post.type === 'activity' || post.type === 'exam') && !post.score && <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md"><Award size={16} /> Turn In Work</button>}
                                    {post.score && <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black border border-emerald-100">Graded: {post.score}/{post.total}</div>}
                                    <button className="px-4 py-2.5 text-slate-400 hover:text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"><MessageCircle size={16} /> Add class comment</button>
                                 </div>
                              </div>
                           </div>
                        )
                     })
                  )}
               </>
            )}

         </div>
      </div>

    </div>
  );
};

export default LmsSingleSubject;