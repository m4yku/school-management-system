import React from 'react';
import { Bookmark, BookMarked, User,PlayCircle, Clock, CheckCircle, ArrowRight, LayoutGrid, Sparkles } from 'lucide-react';

const StandardDashboard = ({ courses, nextLessons }) => {
  return (
    <div className="animate-in fade-in duration-700">
      
      {/* COURSES SECTION */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
               <Sparkles className="text-amber-500 animate-pulse" /> Recently Accessed
            </h2>
            {/* Ang 'All courses' button ay magiging gateway sa 'LmsCourses.jsx' */}
            <button 
               onClick={() => navigate('/lms/courses')} 
               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg transition-all active:scale-95"
            >
               View All Courses
            </button>
         </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
               <div 
                  key={course.class_id} 
                  // Inalis natin ang dynamic bg class dito
                  className="p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden text-white group transition-all hover:scale-[1.02] min-h-[320px] flex flex-col justify-between"
                  // DITO ANG SOLUSYON: Gagamit tayo ng inline style para sa HEX color mula sa DB
                  style={{ 
                     backgroundColor: course.color.replace('bg-[', '').replace(']', '') || '#2563eb' 
                  }}
               >
                  {/* Background Pattern Overlay para maging aesthetic */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>

                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-4">
                     <span className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {course.tag}
                     </span>
                     {/* Siguraduhin na na-import ang BookMarked sa taas! */}
                     <BookMarked size={18} className="opacity-40" />
                     </div>

                     <h3 className="text-2xl font-black mb-8 leading-tight tracking-tight drop-shadow-md">
                     {course.title}
                     </h3>
                  </div>

                  <div className="relative z-10 space-y-6">
                     {/* Progress Section */}
                     <div className="space-y-3">
                     <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest opacity-80">
                        <span>Progress</span>
                        <span>{course.progress || 0}/{course.total || 100} Lessons</span>
                     </div>
                     <div className="h-2 bg-black/20 rounded-full overflow-hidden border border-white/5">
                        <div 
                           className="h-full bg-white transition-all duration-1000 shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                           style={{ width: `${((course.progress || 0) / (course.total || 100)) * 100}%` }}
                        ></div>
                     </div>
                     </div>

                     {/* Footer Section ng bawat Course Card */}
                     <div className="flex justify-between items-center">
                     
                     {/* DITO MO ILALAGAY ANG DYNAMIC AVATAR LOGIC */}
                     <div className="flex -space-x-3 items-center">
                        {/* First Avatar: Laging visible dahil enrolled ang current user */}
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center">
                           <User size={14} className="opacity-80"/>
                        </div>
                        
                        {/* Second Avatar: Lalabas lang kung may > 1 student */}
                        {course.student_count > 1 && (
                           <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center">
                           <User size={14} className="opacity-80"/>
                           </div>
                        )}

                        {/* Dynamic Counter: Ipinapakita ang saktong "excess" counts */}
                        {course.student_count > 2 && (
                           <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-black">
                           +{course.student_count - 2}
                           </div>
                        )}
                     </div>
                     
                     {/* Ang iyong Continue Button */}
                     <button 
                        onClick={() => navigate(`/lms/course/${course.class_id}`)}
                        className="bg-[#a3e635] text-slate-900 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-white transition-all active:scale-95"
                     >
                        Continue <ArrowRight size={14} />
                     </button>
                     </div>
                  </div>
               </div>
               ))}
        </div>
      </div>

      {/* TASKS & PROMO SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
               <h3 className="text-xl font-black text-slate-800">Upcoming Tasks & Lessons</h3>
            </div>
            <div className="space-y-2">
               {nextLessons.map((lesson, idx) => (
                 <div key={idx} className="flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-slate-50 transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-[1.2rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                          <CheckCircle size={20} />
                       </div>
                       <div>
                          <h4 className="font-black text-slate-800 text-sm">{lesson.title}</h4>
                          <p className="text-[11px] font-bold text-slate-500 mt-0.5">{lesson.desc}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-12 text-sm font-bold">
                       <div className="hidden sm:flex items-center gap-2 text-slate-600">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px]">{lesson.teacher.charAt(0)}</div>
                          {lesson.teacher}
                       </div>
                       <div className="flex items-center gap-1.5 text-slate-500 w-20">
                          <Clock size={14} /> {lesson.duration}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-[#a3e635] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
               <Sparkles size={100} />
            </div>
            <div>
               <p className="text-slate-800 font-bold text-sm mb-4">Achievement Unlocked!</p>
               <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">Top 10%</span>
               <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">You are performing excellently in Mathematics!</h3>
            </div>
            <button className="w-full py-4 mt-6 bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:bg-orange-600 transition-colors flex justify-center items-center gap-2">
               View Ranking <ArrowRight size={16} />
            </button>
         </div>
      </div>
    </div>
  );
};

export default StandardDashboard;