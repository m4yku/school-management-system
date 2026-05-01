import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Home, Calendar, Bell, User, Power, BookMarked, 
  MessageSquare, Settings, Info, GraduationCap, ChevronUp, X,
  Layers, FileText, Video, CheckSquare, Award, PieChart, Users,
  Library, Microscope, BookOpen
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const LmsLayout = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // ==========================================
  // [ SECTION 1: STATE MANAGEMENT ]
  // ==========================================
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSubMenuOpen, setIsMobileSubMenuOpen] = useState(false); 
  
  const [courses, setCourses] = useState([]);
  const [studentLevel, setStudentLevel] = useState('unknown'); 
  const [activeCategory, setActiveCategory] = useState('all'); 
  
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false); 
  const lastScrollY = useRef(0);

  // ==========================================
  // [ SECTION 2: CENTRALIZED COURSE FETCHING ]
  // ==========================================
  useEffect(() => {
    const fetchCatalog = async () => {
      const studentId = user?.id || user?.username;
      if (!studentId) return;

      try {
        const res = await axios.get(`${API_BASE_URL}/lms/get_all_courses.php?student_id=${studentId}`);
        if (res.data.status === 'success' && res.data.courses.length > 0) {
          setCourses(res.data.courses);
          setStudentLevel(res.data.courses[0].level_category); 
        }
      } catch (err) {
        console.error("Layout Fetch Error:", err);
      }
    };
    if(user) fetchCatalog();
  }, [user, API_BASE_URL]);

  // ==========================================
  // [ SECTION 3: STATIC MENUS & TABS ]
  // ==========================================
  const navItems = [
    { id: 'dashboard', icon: <Home size={22} />, path: '/lms/dashboard' },
    { id: 'schedule', icon: <Calendar size={22} />, path: '/lms/calendar' },
    { id: 'courses', icon: <Library size={22} />, path: '/lms/courses' },
    { id: 'profile', icon: <User size={22} />, path: '/lms/profile' },
  ];

  const courseTabs = [
    { id: 'all', icon: <Layers size={18} />, label: 'Stream / All' },
    { id: 'lectures', icon: <FileText size={18} />, label: 'Written Lectures' },
    { id: 'videos', icon: <Video size={18} />, label: 'Video Lectures' },
    { id: 'activities', icon: <CheckSquare size={18} />, label: 'Activities' },
    { id: 'exams', icon: <Award size={18} />, label: 'Exams' },
    { id: 'grades', icon: <PieChart size={18} />, label: 'My Grades' },
    { id: 'people', icon: <Users size={18} />, label: 'Classmates' },
  ];

  // ==========================================
  // [ SECTION 4: DYNAMIC CATEGORY GENERATOR ]
  // ==========================================
  const getDynamicCategories = () => {
    const level = String(studentLevel).trim().toLowerCase();
    const baseCategories = [
      { id: 'all', label: 'All Subjects', icon: <Layers size={20} />, color: 'bg-slate-800' }
    ];

    if (level === 'college') {
      return [
        ...baseCategories,
        { id: 'ge', label: 'General Ed', icon: <BookOpen size={20} />, color: 'bg-blue-600' },
        { id: 'major', label: 'Major Subjects', icon: <Microscope size={20} />, color: 'bg-indigo-600' }
      ];
    }

    if (level === 'shs') {
      return [
        ...baseCategories,
        { id: 'core', label: 'Core Subjects', icon: <BookOpen size={20} />, color: 'bg-blue-600' },
        { id: 'applied', label: 'Applied Subjects', icon: <GraduationCap size={20} />, color: 'bg-orange-500' },
        { id: 'major', label: 'Specialized', icon: <Microscope size={20} />, color: 'bg-emerald-600' }
      ];
    }
    return baseCategories;
  };

  const categoryFilters = getDynamicCategories();

  // ==========================================
  // [ SECTION 5: ROUTE CONTEXT & LOGIC ]
  // ==========================================
  const currentPath = location.pathname;
  const isHome = currentPath.includes('dashboard');
  const isProfile = currentPath.includes('profile');
  const isCoursesList = currentPath.endsWith('/courses');
  const isCourseDetail = currentPath.includes('/course/'); 
  const isSchedule = currentPath.includes('calendar');
  
  const currentCourseTabId = searchParams.get('tab') || 'all';
  const activeCourseTab = courseTabs.find(t => t.id === currentCourseTabId) || courseTabs[0];

  // ARCHITECT FIX: I-reset ang category sa 'all' tuwing lilipat ng page!
  useEffect(() => {
    setActiveCategory('all');
    setIsMobileSubMenuOpen(false); // Isara na rin natin ang mobile drawer para sure
  }, [location.pathname]);

  const handleScroll = (e) => {
    const currentScrollY = e.target.scrollTop;
    setIsScrolled(currentScrollY > 20);
    // Hide nav dock on scroll down, show on scroll up (Applies to both Desktop and Mobile!)
    if (currentScrollY > lastScrollY.current + 15) {
      setIsNavVisible(false); 
      setIsMobileSubMenuOpen(false); 
    } else if (currentScrollY < lastScrollY.current - 15) {
      setIsNavVisible(true); 
    }
    lastScrollY.current = currentScrollY;
  };

  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileSubMenuOpen(false);
  };

  // ==========================================
  // [ SECTION 6: UI RENDER ]
  // ==========================================
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans overflow-hidden relative">
      
      {/* -------------------------------------------
          [ DESKTOP SIDEBAR CONTEXT MENUS ]
          Fixed on desktop, never hides on scroll.
          Nandito na yung Filters at Categories para sa Desktop.
      --------------------------------------------- */}
      {!isHome && (
        <aside className="hidden md:flex w-24 bg-white/70 backdrop-blur-2xl border-r border-white/50 flex-col items-center py-6 z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
           
           {isCoursesList && (
             <div className="flex flex-col gap-5 w-full px-2 mt-4">
                <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-widest mb-2">Category</p>
                {categoryFilters.map((cat) => (
                  <div key={cat.id} onClick={() => setActiveCategory(cat.id)} className="group relative flex justify-center cursor-pointer">
                     <div className={`w-12 h-12 ${cat.color} rounded-[1.2rem] text-white shadow-md flex items-center justify-center transition-all duration-500 ease-out ${activeCategory === cat.id ? 'scale-110 ring-4 ring-white/30 opacity-100' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}>
                        {cat.icon}
                     </div>
                     <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-xl transition-all duration-300">{cat.label}</span>
                  </div>
                ))}
             </div>
           )}

           {isSchedule && (
             <div className="flex flex-col gap-4 w-full px-2 mt-4">
                <p className="text-[8px] font-black uppercase text-slate-400 text-center tracking-widest mb-2 border-b border-slate-200 pb-2">Subjects</p>
                {courses.map((course, index) => {
                  const bgColors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500'];
                  const themeColor = bgColors[index % bgColors.length];
                  return (
                    <div key={course.class_id} className="group relative flex justify-center cursor-pointer">
                       <div className={`w-11 h-11 ${themeColor} rounded-[1rem] shadow-sm flex items-center justify-center transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-${themeColor.split('-')[1]}-400`}>
                          <span className="text-white text-[9px] font-black tracking-tighter uppercase">{course.tag.substring(0, 4)}</span>
                       </div>
                       <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-xl transition-all duration-300">{course.title}</span>
                    </div>
                  )
                })}
             </div>
           )}

           {isCourseDetail && (
             <div className="flex flex-col gap-4 w-full px-2 mt-4">
                <p className="text-[8px] font-black uppercase text-indigo-400 text-center tracking-widest mb-2">Classroom</p>
                {courseTabs.map((tab) => (
                  <div key={tab.id} onClick={() => navigate(`${location.pathname}?tab=${tab.id}`)} className="group relative flex justify-center cursor-pointer">
                     <div className={`w-12 h-12 rounded-[1.2rem] shadow-sm flex items-center justify-center transition-all duration-500 ease-out ${currentCourseTabId === tab.id ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)] text-white scale-110' : 'bg-slate-100/50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600'}`}>
                        {tab.icon}
                     </div>
                     <span className="absolute left-16 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50 shadow-xl transition-all duration-300">{tab.label}</span>
                  </div>
                ))}
             </div>
           )}
        </aside>
      )}

      {/* -------------------------------------------
          [ MAIN CONTENT AREA ]
      --------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
         <header className={`absolute top-0 left-0 right-0 h-20 px-6 flex justify-between items-center z-50 transition-all duration-500 ease-out ${isNavVisible ? 'translate-y-0' : '-translate-y-full'} ${isScrolled ? 'bg-white/80 backdrop-blur-[20px] shadow-sm' : 'bg-transparent'}`}>
            <div className="flex items-center gap-3">
               {branding?.school_logo && <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} className="w-10 h-10 object-contain" alt="Logo" />}
               <h2 className="font-black text-slate-800 tracking-tight hidden sm:block uppercase">LMS Hub</h2>
            </div>
            <div className="flex items-center gap-4">
               <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-black transition-transform hover:scale-105"><User size={18} /></button>
               {isProfileMenuOpen && (
                 <div className="absolute top-full right-0 mt-3 w-56 bg-white/90 backdrop-blur-2xl rounded-[1.5rem] shadow-2xl border border-white/50 p-2 z-[110]">
                    <button onClick={() => navigate('/student/dashboard')} className="w-full flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-black text-xs uppercase transition-colors"><Power size={16} /> Exit LMS</button>
                 </div>
               )}
            </div>
         </header>

         <main className="flex-1 overflow-y-auto px-4 md:px-8 pb-40 scroll-smooth relative" onScroll={handleScroll}>
            <div className="max-w-[1400px] mx-auto pt-24 pb-6">
               <Outlet context={{ activeCategory, courses }} /> 
            </div>
         </main>
      </div>

      {/* -------------------------------------------
          [ UNIVERSAL BOTTOM DOCK (MOBILE & DESKTOP) ]
          Visible on both, hides on scroll for both.
      --------------------------------------------- */}
      <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-[420px] transition-transform duration-500 ${isNavVisible ? 'translate-y-0' : 'translate-y-[150%]'}`}>
        
        {/* Main Wrapper with Liquid Glass Background */}
        <div className="bg-[#475569]/90 backdrop-blur-[40px] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col overflow-hidden">
           
           {/* =========================================
               [ MOBILE ONLY: EXPANDING DRAWER ]
               Nilagyan ng "md:hidden" para HINDI lumabas sa desktop!
           =========================================== */}
           <div className="md:hidden flex flex-col w-full">
             {(isCoursesList || isSchedule || isCourseDetail) && (
               <>
                 {/* COLLAPSED STATE: Trigger Button */}
                 {!isMobileSubMenuOpen && (
                   <button 
                     onClick={() => setIsMobileSubMenuOpen(true)}
                     className="w-full flex justify-center items-center gap-2 py-3.5 px-6 bg-white/5 hover:bg-white/10 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 transition-colors"
                   >
                     {/* DYNAMIC MIDDLE TEXT BASED ON ACTIVE ROUTE */}
                     {isCoursesList && (
                       <span className="flex items-center gap-2 text-slate-200">
                         <span className="text-indigo-400">{categoryFilters.find(c => c.id === activeCategory)?.icon}</span>
                         {categoryFilters.find(c => c.id === activeCategory)?.label.toUpperCase()}
                       </span>
                     )}
                     {isSchedule && (
                       <span className="flex items-center gap-2 text-slate-200">
                         {activeCategory === 'all' ? (
                           <><span className="text-indigo-400"><Layers size={14}/></span> ALL SUBJECTS</>
                         ) : (
                           <><span className="text-indigo-400"><BookMarked size={14}/></span> {courses.find(c => c.class_id === activeCategory)?.tag || 'FILTER SUBJECTS'}</>
                         )}
                       </span>
                     )}
                     {isCourseDetail && (
                       <span className="flex items-center gap-2 text-slate-200">
                         <span className="text-indigo-400">{activeCourseTab?.icon}</span>
                         {activeCourseTab?.label.toUpperCase()}
                       </span>
                     )}
                     <ChevronUp size={14} className="text-slate-400 ml-1" />
                   </button>
                 )}

                 {/* EXPANDED STATE: The Dark Drawer Container */}
                 <div className={`transition-all duration-300 ease-in-out ${isMobileSubMenuOpen ? 'max-h-[50vh] opacity-100' : 'max-h-0 opacity-0'} overflow-y-auto scrollbar-hide`}>
                    <div className="p-5">
                       
                       {/* Drawer Header */}
                       <div className="flex justify-between items-center mb-5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                             {isSchedule ? 'Filter Calendar' : isCoursesList ? 'Filter Categories' : 'Select View'}
                          </span>
                          <button onClick={() => setIsMobileSubMenuOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={16}/></button>
                       </div>

                       {/* Content A: Course Category Vertical List */}
                       {isCoursesList && (
                         <div className="flex flex-col gap-1">
                            {categoryFilters.map(cat => (
                              <button 
                                key={cat.id} 
                                onClick={() => { setActiveCategory(cat.id); setIsMobileSubMenuOpen(false); }}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[12px] font-black tracking-wide transition-all ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'bg-transparent text-slate-300 hover:bg-white/5'}`}
                              >
                                 <span className={activeCategory === cat.id ? 'text-indigo-400' : 'text-slate-400'}>{cat.icon}</span>
                                 {cat.label.toUpperCase()}
                              </button>
                            ))}
                         </div>
                       )}

                       {/* Content B: Calendar Subjects Vertical List */}
                       {isSchedule && (
                         <div className="flex flex-col gap-1">
                            <button 
                              onClick={() => { setActiveCategory('all'); setIsMobileSubMenuOpen(false); }}
                              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[12px] font-black tracking-wide transition-all ${activeCategory === 'all' ? 'bg-white/10 text-white' : 'bg-transparent text-slate-300 hover:bg-white/5'}`}
                            >
                               <span className={activeCategory === 'all' ? 'text-indigo-400' : 'text-slate-400'}><Layers size={16}/></span>
                               ALL SUBJECTS
                           </button>
                            
                            {courses.map((course, index) => {
                              const iconColors = ['text-blue-400', 'text-emerald-400', 'text-orange-400', 'text-purple-400', 'text-pink-400'];
                              const colorClass = iconColors[index % iconColors.length];
                              return (
                                <button 
                                  key={course.class_id} 
                                  onClick={() => { setActiveCategory(course.class_id); setIsMobileSubMenuOpen(false); }}
                                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[12px] font-black tracking-wide text-left transition-all ${activeCategory === course.class_id ? 'bg-white/10 text-white' : 'bg-transparent text-slate-300 hover:bg-white/5'}`}
                                >
                                   <span className={colorClass}><BookMarked size={16}/></span>
                                   <span className="truncate">{course.title.toUpperCase()}</span>
                                </button>
                              )
                            })}
                         </div>
                       )}

                       {/* Content C: Classroom Vertical List */}
                       {isCourseDetail && (
                         <div className="flex flex-col gap-1">
                            {courseTabs.map(tab => (
                              <button 
                                key={tab.id} 
                                onClick={() => { navigate(`${location.pathname}?tab=${tab.id}`); setIsMobileSubMenuOpen(false); }}
                                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-[12px] font-black tracking-wide transition-all ${currentCourseTabId === tab.id ? 'bg-white/10 text-white' : 'bg-transparent text-slate-300 hover:bg-white/5'}`}
                              >
                                 <span className={currentCourseTabId === tab.id ? 'text-indigo-400' : 'text-slate-400'}>{tab.icon}</span>
                                 {tab.label.toUpperCase()}
                              </button>
                            ))}
                         </div>
                       )}
                    </div>
                 </div>
               </>
             )}
           </div>

           {/* =========================================
               [ UNIVERSAL: MAIN ICONS ]
               Ito lang ang matitira kapag naka-desktop view.
           =========================================== */}
           <div className="flex justify-around w-full px-2 py-3 bg-[#475569]/40 border-t border-slate-600/50 md:border-t-0 md:bg-transparent relative">
              {navItems.map((item) => {
                 const isActive = location.pathname.includes(item.path);
                 return (
                   <button 
                     key={item.id} 
                     onClick={() => handleNavClick(item.path)} 
                     className={`p-3 rounded-2xl transition-all relative flex flex-col items-center justify-center ${isActive ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] scale-110' : 'text-slate-400 hover:text-white'}`}
                   >
                      {item.icon}
                      {isActive && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)]"></span>}
                   </button>
                 )
              })}
           </div>

        </div>
      </div>
      
    </div>
  );
};

export default LmsLayout;