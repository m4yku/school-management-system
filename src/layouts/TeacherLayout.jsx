import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, CaseUpper, LogOut, Menu, X, School, BookOpen,
  Bell, ChevronLeft, ChevronRight, RefreshCw, Megaphone, CheckCheck,
  MoreHorizontal, Check, XSquare, BellOff, Bug
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import TeacherProfileModal from '../components/admin/UserProfileModal'; 
import ReadNotificationModal from '../components/shared/ReadNotificationModal';
import { SHARED_STYLES } from '../components/shared/teacherConstants';

// Helper function para sa Facebook-style time
const timeAgo = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m";
  return "Just now";
};

const TeacherLayout = () => {
  const { logout, user, branding, API_BASE_URL } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const optionsMenuRef = useRef(null);
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const savedState = localStorage.getItem('teacherSidebarCollapsed');
    return savedState !== null ? JSON.parse(savedState) : true;
  }); 

  useEffect(() => {
    localStorage.setItem('teacherSidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [teachingClasses, setTeachingClasses] = useState([]);
  
  // STATE PARA SA DROPDOWN AT NOTIFICATIONS
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all'); 
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [showAllInDropdown, setShowAllInDropdown] = useState(false);

  const [activeMenuNotif, setActiveMenuNotif] = useState(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, right: 0 });
  const [isBellHovered, setIsBellHovered] = useState(false);

  const isAnnouncementsPage = location.pathname === '/teacher/announcements';
  const isDashboard = location.pathname === '/teacher/dashboard';

  useEffect(() => {
    if (user?.id && user?.role === 'teacher') {
      const token = localStorage.getItem('sms_token') || '';
      axios.get(`${API_BASE_URL}/teacher/get_sections.php?teacher_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data.status === 'success') {
          setTeachingClasses(res.data.data || []);
        }
      })
      .catch(console.error);
    }
  }, [user, API_BASE_URL]);

  // FETCH NOTIFICATIONS
  useEffect(() => {
    if (user?.id && user?.role) {
      const fetchNotifications = async () => {
        try {
          const token = localStorage.getItem('sms_token');
          const res = await axios.get(`${API_BASE_URL}/teacher/get_announcements.php`, {
            params: { user_id: user.id, role: user.role, fetch_type: 'general' },
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data.status === 'success') {
            const notifs = res.data.data || [];
            setNotifications(notifs);
            const unread = notifs.filter(n => n.is_read === 0 || n.is_read === "0" || n.is_read === false).length;
            setUnreadCount(unread);
          }
        } catch (err) {
          console.error("Error fetching notifications", err);
        }
      };

      fetchNotifications();
      const intervalId = setInterval(fetchNotifications, 30000); 
      return () => clearInterval(intervalId);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    setIsNotifyOpen(false);
    setActiveMenuNotif(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedNotif) return; 

      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      const isInsideOptions = optionsMenuRef.current && optionsMenuRef.current.contains(event.target);
      const isBellButton = event.target.closest('[data-notification-bell]');

      if (!isInsideDropdown && !isInsideOptions && !isBellButton) {
        setIsNotifyOpen(false);
        setActiveMenuNotif(null);
      } else if (isInsideDropdown && !isInsideOptions) {
        setActiveMenuNotif(null); 
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); 
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [selectedNotif]); 

  const toggleNotifications = () => {
    const newState = !isNotifyOpen;
    setIsNotifyOpen(newState);
    if (!newState) {
      setShowAllInDropdown(false); 
      setActiveMenuNotif(null);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    if (unreadCount === 0) return;
    setUnreadCount(0); 
    setNotifications(prev => prev.map(n => ({...n, is_read: 1}))); 
    try {
      const token = localStorage.getItem('sms_token');
      await axios.post(`${API_BASE_URL}/teacher/mark_notifications_read.php`, 
        { user_id: user.id, role: user.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {}
  };

  // 🟢 Ginawang async function para makapag-wait sa Axios
  const handleNotifClick = async (notif) => { 
    const isCurrentlyUnread = notif.is_read === 0 || notif.is_read === "0" || notif.is_read === false;
    
    if (isCurrentlyUnread) {
      // 1. Update UI agad (Optimistic UI) para mawala agad yung blue dot
      setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, is_read: 1} : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // 2. 🟢 I-SAVE SA DATABASE ANG READ STATUS (Gamit ang mark_single_read.php)
      try {
        const token = localStorage.getItem('sms_token');
        await axios.post(`${API_BASE_URL}/notifications/mark_single_read.php`, {
          notification_id: notif.id,
          user_id: user.id,
          role: user.role
        }, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        console.error("Failed to mark read in DB", error);
      }
    }

    // 3. Buksan ang Modal at ipasa ang tamang data
    setSelectedNotif({
      id: notif.id,
      type: notif.type || 'Announcement',
      title: notif.title,
      message: notif.message,
      sender: notif.sender_name || notif.sender_role || 'Admin',
      
      // 🟢 Siguraduhing naipasa ang sender_role para lumabas ang reaction buttons 
      // kung registrar o cashier ang nag-send
      sender_role: notif.sender_role ? notif.sender_role.toLowerCase() : '',
      
      time: notif.created_at ? new Date(notif.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
      attachment: notif.attachment,
      reaction: notif.reaction
    });
  };

  const handleDeleteLocal = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const notifToDelete = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (notifToDelete && (notifToDelete.is_read === 0 || notifToDelete.is_read === "0" || notifToDelete.is_read === false)) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setActiveMenuNotif(null); 
  };

  const handleToggleReadLocal = (e, notif) => {
    e.preventDefault();
    e.stopPropagation();
    const isCurrentlyUnread = notif.is_read === 0 || notif.is_read === "0" || notif.is_read === false;
    setNotifications(prev => prev.map(n => n.id === notif.id ? {...n, is_read: isCurrentlyUnread ? 1 : 0} : n));
    setUnreadCount(prev => isCurrentlyUnread ? Math.max(0, prev - 1) : prev + 1);
    setActiveMenuNotif(prev => ({...prev, is_read: isCurrentlyUnread ? 1 : 0}));
  };

  // 🟢 FIX: I-filter para Announcements lang at hindi kasama ang Task Reminder
const filteredNotifs = notifications.filter(notif => {
  // 1. Siguraduhin na HINDI Task Reminder ang type
  if (notif.type === 'Task Reminder') return false;

  // 2. I-apply ang existing filter (All vs Unread)
  if (notifFilter === 'all') return true;
  return notif.is_read === 0 || notif.is_read === "0" || notif.is_read === false;
});

  const displayedNotifications = showAllInDropdown ? filteredNotifs : filteredNotifs.slice(0, 6);
  
  const menuConfig = {
    teacher: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: <School size={20} />, label: 'My Classes', path: '/teacher/classes' },
      { icon: <CaseUpper size={20} />, label: 'Subjects', path: '/teacher/subjects' },
      { icon: <BookOpen size={20} />, label: 'LMS', path: '/teacher/activities', state: { tab: 'Stream' } }
    ],
  };

  const currentMenu = menuConfig[user?.role] || [];
  const themeColor = branding?.theme_color || '#2563eb';

  const handleRefresh = () => window.location.reload();

  const getHeaderTitle = () => {
    const path = location.pathname;
    const isActivities = path.includes('/teacher/activities');
    const isSections = path.includes('/teacher/sections/');
    
    if (isActivities || isSections) {
      const pathParts = path.split('/');
      const classId = pathParts[pathParts.length - 1];
      const activeClass = teachingClasses.find(cls => String(cls.id) === String(classId));
      
      if (activeClass) {
        return {
          main: isSections ? `Gradebook - ${activeClass.subject}` : activeClass.subject,
          sub: activeClass.section_name || activeClass.section
        };
      }
      return { main: isSections ? 'Grade Management' : 'Classroom', sub: '' };
    }

    if (path.includes('/teacher/profile')) return { main: 'My Profile', sub: '' };
    
    return { 
      main: path.split('/').pop()?.replace('-', ' ') || 'Dashboard', 
      sub: '' 
    };
  };

  const handleUpdateLayoutReaction = (notifId, newReaction) => {
    setNotifications(prevNotifs => prevNotifs.map(notif => 
      notif.id === notifId ? { ...notif, reaction: newReaction } : notif
    ));
  };

  return (
    <div className="flex h-screen bg-slate-50 relative font-sans overflow-hidden z-0 lg:p-0 lg:gap-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800;900&display=swap');
        h1, h2, h3, h4, h5, h6, .header-jakarta { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        html, body, #root { height: 100%; overflow: hidden; }
        .sidebar-scroll { overflow-y: auto; scrollbar-width: none; -ms-overflow-style: none; }
        .sidebar-scroll::-webkit-scrollbar { display: none; }
        
        ${SHARED_STYLES(themeColor)}
      `}</style>

      {/* BACKGROUND ANIMATIONS */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-blob-1 will-change-transform" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[120px] animate-blob-2 will-change-transform" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>
        <div className="absolute top-[20%] left-[-5%] w-[40%] h-[40%] rounded-full blur-[120px] animate-blob-3 will-change-transform" style={{ backgroundColor: themeColor, opacity: 0.15 }}></div>
      </div>

      {/* OVERLAY FIXED (Z-INDEX 100) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR - FLOAT EFFECT */}
    <aside className={`fixed z-[110] bg-white/95 backdrop-blur-2xl text-slate-700 flex flex-col transition-all duration-300 ease-in-out shadow-2xl left-0 top-0 h-full w-[85%] max-w-xs m-0 rounded-r-[2rem] border-r border-white/60 lg:left-0 lg:top-0 lg:h-full lg:m-0 lg:rounded-none lg:rounded-r-[2rem] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:shadow-[4px_0_24px_rgba(0,0,0,0.05)] lg:bg-white/80 ${isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-64'}`}>

  {/* Logo Section - Fixed left alignment */}
 <div className="h-24 px-6 border-b border-slate-200/60 flex items-center shrink-0 transition-all duration-300">
  <div className="flex items-center gap-3 overflow-hidden">
    {branding?.school_logo ? (
      <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-white" />
    ) : (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 border border-white shadow-sm" style={{ backgroundColor: themeColor }}>
        {branding?.school_name?.charAt(0) || 'S'}
      </div>
    )}
    <span className={`header-jakarta text-[15px] leading-tight font-black text-slate-800 tracking-tight transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-auto lg:opacity-100'}`}>
      {branding?.school_name || 'School System'}
    </span>
  </div>
  <button className="lg:hidden text-slate-600 hover:text-slate-900 p-2 bg-slate-100/80 rounded-xl border border-slate-200 ml-auto shrink-0" onClick={() => setIsSidebarOpen(false)}>
    <X size={24} />
  </button>
</div>
        
        <nav className="flex-1 py-6 px-3 space-y-2 sidebar-scroll">
  {currentMenu.map((item, index) => {
    const isActive = location.pathname === item.path || 
                     (location.pathname.startsWith('/teacher/sections') && item.path === '/teacher/classes') || 
                     (location.pathname.startsWith('/teacher/activities') && item.path === '/teacher/activities');
    return (
      <Link 
        key={index} 
        to={item.path} 
        state={item.state} 
        onClick={() => setIsSidebarOpen(false)} 
        className={`flex items-center rounded-2xl transition-all duration-300 group relative ${
          isCollapsed ? 'lg:justify-center p-3.5' : 'gap-4 px-4 p-3.5'
        } ${isActive ? 'text-white shadow-md border border-white/40' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
        style={isActive ? { backgroundColor: themeColor } : {}}
      >
        <span className={`w-6 h-6 flex items-center justify-center shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'} transition-transform group-hover:scale-110`}>
          {item.icon}
        </span>
        
        <span className={`font-bold text-sm transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>
          {item.label}
        </span>
      </Link>
    );
  })}
  
  {teachingClasses.length > 0 && (
    <div className="pt-4 mt-4 border-t border-slate-200/60">
      <p className={`px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-all duration-300 ${isCollapsed ? 'lg:hidden' : ''}`}>
        Teaching
      </p>
      <div className="space-y-1">
        {teachingClasses.map(cls => {
          const isActiveClass = location.pathname.includes(`/${cls.id}`);
          return (
            <Link 
              key={cls.id} 
              to={`/teacher/activities/${cls.id}`} 
              state={{ tab: 'Stream' }} 
              onClick={() => setIsSidebarOpen(false)} 
              className={`flex items-center rounded-2xl transition-all duration-200 group relative ${
                isCollapsed ? 'lg:justify-center p-2.5' : 'gap-3 p-2.5'
              } ${isActiveClass ? 'text-white shadow-md border border-white/40' : 'hover:bg-slate-100/50 border border-transparent'}`}
              style={isActiveClass ? { backgroundColor: themeColor } : {}}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                isActiveClass ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300 group-hover:text-slate-700'
              }`}>
                {cls.subject?.charAt(0) || 'C'}
              </div>
              <div className={`flex flex-col min-w-0 transition-all duration-300 ${isCollapsed ? 'lg:hidden' : 'flex-1'}`}>
                <span className={`text-[13px] font-bold truncate ${isActiveClass ? 'text-white' : 'text-slate-900 group-hover:text-slate-800'}`}>
                  {cls.subject}
                </span>
                <span className={`text-[10px] font-semibold truncate ${isActiveClass ? 'text-white/80' : 'text-slate-500'}`}>
                  {cls.section_name || cls.section}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  )}
</nav>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex absolute -right-3.5 top-24 w-7 h-7 bg-white text-slate-800 rounded-full items-center justify-center shadow-md border border-slate-200 hover:scale-110 transition-transform z-50"
        >
          {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
        </button>

        {/* Bottom Section - Always left aligned */}
      <div className="p-4 border-t border-slate-200/60 bg-white/90 shrink-0 lg:rounded-br-[2rem] rounded-b-[2rem]">
      <Link 
              to="/teacher/profile"
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center mb-2 cursor-pointer hover:opacity-80 transition-all duration-300 w-full gap-3 px-2`}
            >
            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden border-2 border-white shadow-sm">
              {user?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-full h-full object-cover" alt="Avatar"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: themeColor }}>
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className={`overflow-hidden transition-all duration-300 flex-1 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="header-jakarta text-[13px] leading-tight font-black text-slate-800 line-clamp-1 mb-0.5">{user?.full_name}</p>
              <p className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">{user?.role}</p>
            </div>
          </Link>

         <button onClick={handleRefresh} className="flex items-center p-3 mb-2 rounded-2xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200 group w-full gap-4 px-4">
          <RefreshCw size={20} className="shrink-0 group-hover:rotate-180 transition-transform duration-500 ease-out" />
          <span className={`text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>
            Refresh Page
          </span>
        </button>
        
        <button onClick={logout} className="flex items-center p-3 rounded-2xl hover:bg-red-50 text-slate-700 hover:text-red-600 transition-all duration-200 group w-full gap-4 px-4">
          <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
          <span className={`text-sm font-bold tracking-wide transition-all duration-300 whitespace-nowrap ${isCollapsed ? 'lg:hidden' : ''}`}>
            Sign Out
          </span>
        </button>
      </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative lg:pl-4">
        {/* HEADER (Z-INDEX 90) */}
       <header className="relative z-[90] h-24 bg-white/60 backdrop-blur-xl border-b lg:border border-white/80 lg:rounded-none lg:rounded-bl-[2.5rem] rounded-b-3xl flex items-center justify-between px-6 lg:px-10 shadow-sm transition-all shrink-0 lg:mr-4">
       <div className="flex items-center space-x-4">
            <button className="p-2.5 rounded-xl bg-white/80 backdrop-blur-sm text-slate-600 lg:hidden border border-white shadow-sm" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div className="flex flex-col justify-center">
              <h2 className="header-jakarta text-slate-800 font-black text-lg lg:text-xl tracking-tight leading-tight uppercase">
                {getHeaderTitle().main}
              </h2>
              {getHeaderTitle().sub && (
                <p className="text-[11px] lg:text-[13px] font-bold text-slate-500 lowercase first-letter:uppercase tracking-wide mt-0.5 leading-none">
                  {getHeaderTitle().sub}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 sm:space-x-8">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={toggleNotifications}
                onMouseEnter={() => setIsBellHovered(true)}
                onMouseLeave={() => setIsBellHovered(false)}
                data-notification-bell="true"
                className="p-3 rounded-full transition-all duration-300 relative shadow-sm border border-white/40 backdrop-blur-md cursor-pointer"
                style={{
                  backgroundColor: isNotifyOpen || isBellHovered ? themeColor : 'rgba(255, 255, 255, 0.4)',
                  color: isNotifyOpen || isBellHovered ? '#ffffff' : '#475569',
                }}
              >
                <Bell size={22} className={unreadCount > 0 ? 'animate-[pulse_2s_ease-in-out_infinite]' : ''} />
                
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full border-2 border-white px-1 shadow-sm">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotifyOpen && (
                <div className={`
                  fixed sm:absolute 
                  top-[5rem] sm:top-[3.5rem] 
                  right-0 sm:-right-4 
                  w-full sm:w-[380px] 
                  max-w-[380px] mx-auto sm:mx-0
                  bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
                  border border-slate-100 overflow-hidden 
                  z-[100] animate-in slide-in-from-top-2 duration-200 
                  flex flex-col
                `}>
                  <div className="px-5 py-4 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-2xl font-black text-slate-800">Notifications</h3>
                      <button onClick={handleMarkAllAsRead} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Mark all as read">
                        <CheckCheck size={20} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setNotifFilter('all')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${notifFilter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        All
                      </button>
                      <button onClick={() => setNotifFilter('unread')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${notifFilter === 'unread' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                        Unread
                      </button>
                    </div>
                  </div>

                  <div className="px-5 py-2 flex justify-between items-center bg-white border-b border-slate-50">
                    <span className="text-sm font-bold text-slate-800">Earlier</span>
                    <Link to="/teacher/announcements" onClick={() => setIsNotifyOpen(false)} className="text-sm font-semibold text-blue-600 hover:underline">
                      See all
                    </Link>
                  </div>

                  <div className="max-h-[50vh] overflow-y-auto custom-scroll relative">
                    {displayedNotifications.length > 0 ? (
                      displayedNotifications.map(notif => {
                        const isUnread = notif.is_read === 0 || notif.is_read === "0" || notif.is_read === false;
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => { handleNotifClick(notif); setIsNotifyOpen(false); }}
                            className="group flex gap-3 p-3 mx-2 my-1 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors relative"
                          >
                            <div className="w-14 h-14 rounded-full shrink-0 flex items-center justify-center text-white shadow-sm border border-slate-100 relative" style={{ backgroundColor: themeColor }}>
                              <Megaphone size={20} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center pr-6">
                              <p className="text-[14px] text-slate-800 leading-tight">
                                <span className="font-bold text-slate-900">{notif.sender_name || notif.sender_role || 'Admin'}</span> posted a new announcement: <span className="font-medium">"{notif.title}"</span>
                              </p>
                              <p className={`text-[12px] mt-1 font-semibold ${isUnread ? 'text-blue-600' : 'text-slate-500'}`}>
                                {timeAgo(notif.created_at)}
                              </p>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 flex flex-col items-center justify-center shrink-0">
                              {isUnread && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"></div>}
                            </div>
                            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { 
                                  e.preventDefault(); e.stopPropagation(); 
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setMenuCoords({ top: rect.bottom + 5, right: window.innerWidth - rect.right });
                                  setActiveMenuNotif(activeMenuNotif?.id === notif.id ? null : notif); 
                                }} 
                                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                              >
                                <MoreHorizontal size={18} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center flex flex-col items-center">
                        <Bell size={32} className="text-slate-300 mb-2" />
                        <p className="text-slate-500 font-bold text-sm">No {notifFilter === 'unread' ? 'unread' : ''} notifications.</p>
                      </div>
                    )}
                  </div>
                  
                  {!showAllInDropdown && filteredNotifs.length > 6 && (
                    <div className="p-3 bg-white border-t border-slate-100 shadow-[0_-4px_10px_rgb(0,0,0,0.02)]">
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllInDropdown(true); }} 
                        className="block w-full py-2 text-center text-[14px] font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        See previous notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsProfileOpen(true)}>
              <div className="hidden sm:block text-right">
                <p className="header-jakarta text-[15px] font-black text-slate-800 leading-none drop-shadow-sm">{user?.full_name}</p>
                <p className="text-[10px] font-bold uppercase mt-1.5 tracking-widest drop-shadow-sm" style={{ color: themeColor }}>System Verified</p>
              </div>
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-sm shrink-0" style={{ backgroundColor: themeColor }}>
                {user?.profile_image ? (
                  <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-full h-full object-cover" alt="Avatar"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-white text-lg">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={`flex-1 min-h-0 relative ${isDashboard ? 'overflow-y-auto custom-scroll lg:overflow-hidden' : 'overflow-y-auto custom-scroll'}`}>
          <div className={`max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col ${isDashboard ? 'min-h-full lg:h-full' : 'min-h-full'}`}>
            <Outlet />
          </div>
        </div>
      </main>

      <TeacherProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} branding={branding} logout={logout} />
      
      <ReadNotificationModal 
        isOpen={!!selectedNotif} 
        onClose={() => setSelectedNotif(null)} 
        notification={selectedNotif} 
        onReactionUpdate={handleUpdateLayoutReaction}
      />

      {activeMenuNotif && (
        <div 
          ref={optionsMenuRef}
          className="fixed z-[999] w-64 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-slate-100 py-2 animate-in fade-in duration-150"
          style={{ top: `${menuCoords.top}px`, right: `${menuCoords.right}px` }}
        >
          <button onClick={(e) => { handleToggleReadLocal(e, activeMenuNotif); setActiveMenuNotif(null); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-bold text-slate-700 transition-colors">
            <Check size={16} className="text-slate-400" /> {activeMenuNotif.is_read === 0 || activeMenuNotif.is_read === "0" || activeMenuNotif.is_read === false ? 'Mark as read' : 'Mark as unread'}
          </button>
          <button onClick={(e) => handleDeleteLocal(e, activeMenuNotif.id)} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-bold text-slate-700 transition-colors">
            <XSquare size={16} className="text-slate-400" /> Remove this notification
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActiveMenuNotif(null); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-bold text-slate-700 transition-colors">
            <BellOff size={16} className="text-slate-400" /> Turn off notifications like this
          </button>
          <button onClick={(e) => { e.stopPropagation(); setActiveMenuNotif(null); }} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-3 text-sm font-bold text-slate-700 transition-colors">
            <Bug size={16} className="text-slate-400" /> Report issue to team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherLayout;