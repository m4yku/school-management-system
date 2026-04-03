import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Settings, LogOut, Menu, X, 
  BookOpen, CreditCard, UserCircle, Search, Receipt, 
  History, ClipboardList, GraduationCap, Layers, FileText,
  Library, Award, ChevronLeft, ChevronRight, MapPin,
  Bell, Megaphone 
} from 'lucide-react'; 
import { useAuth } from '../context/AuthContext';
import UserProfileModal from '../components/admin/UserProfileModal'; 
import CreateAnnouncementModal from '../components/shared/CreateAnnouncementModal';
import ReadNotificationModal from '../components/shared/ReadNotificationModal';

const AdminLayout = () => {
  const { logout, user, branding, API_BASE_URL } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [isCollapsed, setIsCollapsed] = useState(false); 
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ==========================================
  // 🚀 ARCHITECT UPDATE: NOTIFICATION STATES
  // ==========================================
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreateNotifModalOpen, setIsCreateNotifModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // 1. FETCH NOTIFICATIONS FROM BACKEND
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      // Gagamit tayo ng student_id kung student, o id kung staff
      const currentId = user.role === 'student' ? user.student_id : user.id;
      const response = await axios.get(
        `${API_BASE_URL}/notifications/get_notifications.php?user_id=${currentId}&role=${user.role}`
      );
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Auto-fetch tuwing mag-load ang layout o magpalit ng user
  useEffect(() => {
    fetchNotifications();
    // Optional: Mag-set ng interval para mag-check ng bagong notif tuwing 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // 2. MARK AS READ LOGIC
  const handleNotifClick = async (notif) => {
    const currentId = user.role === 'student' ? user.student_id : user.id;
    
    // I-set ang selected notif para lumabas ang modal
    setSelectedNotification({
      ...notif,
      sender: notif.sender_name || "System",
      time: new Date(notif.created_at).toLocaleString(),
      hasImage: notif.attachment ? true : false
    });

    setIsNotifOpen(false); // Isara ang dropdown

    // Kung unread pa, tawagin ang API para maging read
    if (notif.is_read === 0) {
      try {
        await axios.post(`${API_BASE_URL}/notifications/mark_as_read.php`, {
          notification_id: notif.id,
          user_id: currentId
        });
        fetchNotifications(); // Refresh para mawala ang red dot/badge
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    }
  };

  // Helper para sa icon ng notif list
  const getNotifIcon = (type) => {
    switch (type) {
      case 'Urgent Alert': return <AlertTriangle size={16} className="text-red-600" />;
      case 'Task Reminder': return <Clock size={16} className="text-amber-600" />;
      default: return <Megaphone size={16} className="text-blue-600" />;
    }
  };

  const menuConfig = {
    admin: [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: <Users size={20} />, label: 'User Management', path: '/admin/users' },
      { icon: <Settings size={20} />, label: 'Branding Engine', path: '/admin/branding' },
      { icon: <MapPin size={20} />, label: 'Room Management', path: '/admin/rooms' },
    ],
    registrar: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/registrar/dashboard' },
        { icon: <UserCircle size={20} />, label: 'Student Masterlist', path: '/registrar/students' },
        { type: 'header', label: 'Academics' }, 
        { icon: <Library size={20} />, label: 'Academic Programs', path: '/registrar/programs' }, 
        { icon: <BookOpen size={20} />, label: 'Subject Management', path: '/registrar/subjects'},
        { icon: <GraduationCap size={20} />, label: 'Class Assignments', path: '/registrar/assignments' },
        { type: 'header', label: 'Enrollment & Requests' },
        { icon: <ClipboardList size={20} />, label: 'Enrollment Module', path: '/registrar/enrollment' },
        { icon: <FileText size={20} />, label: 'Student Requests', path: '/registrar/requests' }, 
        { icon: <Award size={20} />, label: 'Scholarship Applications', path: '/registrar/scholarships' },
        { icon: <Layers size={20} />, label: 'Section Management', path: '/registrar/sections' },
    ],
    cashier: [
        { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/cashier/dashboard' },
        { icon: <Search size={20} />, label: 'Student Billing', path: '/cashier/billing' },
        { icon: <CreditCard size={20} />, label: 'Process Payment', path: '/cashier/payments' },
        { icon: <Layers size={20} />, label: 'Fee Catalog', path: '/cashier/fees' },
        { icon: <Receipt size={20} />, label: 'Scholarships', path: '/cashier/scholarships' },
        { icon: <BookOpen size={20} />, label: 'Scholarship Catalog', path: '/cashier/scholarship-catalog' },
        { icon: <History size={20} />, label: 'Collection Reports', path: '/cashier/reports' },
    ]
  };

  const currentMenu = menuConfig[user?.role] || [];

  return (
    <div className="flex h-screen bg-slate-50 relative font-sans overflow-hidden">
      
      {/* 1. MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* 2. SIDEBAR */}
      <aside className={`
        fixed z-50 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out shadow-2xl
        inset-y-0 left-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:h-[calc(100vh-2rem)] lg:my-4 lg:ml-4 lg:rounded-[2rem]
        w-64 ${isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-64'} 
      `}>
        {/* ... Sidebar Content stays same ... */}
        <div className={`h-20 px-4 border-b border-slate-800 flex items-center shrink-0 transition-all justify-between ${isCollapsed ? 'lg:justify-center' : 'lg:justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            {branding.school_logo ? (
              <img src={`${API_BASE_URL}/uploads/branding/${branding.school_logo}`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-lg" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shrink-0 shadow-lg" style={{ backgroundColor: branding.theme_color || '#2563eb' }}>{branding.school_name?.charAt(0)}</div>
            )}
            <span className={`text-[15px] leading-tight font-black text-white tracking-tight line-clamp-2 w-36 ${isCollapsed ? 'lg:w-0 lg:opacity-0 lg:hidden' : ''}`}>{branding.school_name}</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
          {currentMenu.map((item, index) => {
            if (item.type === 'header') return <div key={index} className="pt-6 pb-2 px-3"><p className="text-[10px] font-black uppercase text-slate-500">{item.label}</p></div>;
            const isActive = location.pathname === item.path;
            return (
              <Link key={index} to={item.path} className={`flex items-center p-3 rounded-2xl transition-all ${isActive ? 'text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'} ${isCollapsed ? 'lg:justify-center' : 'gap-4'}`} style={isActive ? { backgroundColor: branding.theme_color || '#2563eb' } : {}}>
                {item.icon}
                {!isCollapsed && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {/* ... Footer stays same ... */}
        <div className="p-4 border-t border-slate-800 shrink-0">
             <button onClick={logout} className="flex items-center p-3 rounded-2xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 w-full gap-3 transition-all">
                <LogOut size={20} />
                {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
             </button>
        </div>
      </aside>

      {/* 3. MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30 shrink-0 shadow-sm">
          <div className="flex items-center space-x-4">
            <button className="p-2 lg:hidden text-slate-600" onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
            <h2 className="text-slate-800 font-black text-lg lg:text-xl capitalize">{location.pathname.split('/').pop()?.replace('-', ' ')}</h2>
          </div>

          <div className="flex items-center">
            
            {/* NOTIFICATION SECTION */}
            <div className="flex items-center space-x-2 mr-6 pr-6 border-r border-slate-200 relative">
              
              {/* CREATE BUTTON (Only for Staff/Admin) */}
              {user?.role !== 'student' && (
                <button onClick={() => setIsCreateNotifModalOpen(true)} className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
                    <Megaphone size={20} />
                </button>
              )}

              {/* BELL DROPDOWN */}
              <div className="relative">
                <button onClick={() => setIsNotifOpen(!isNotifOpen)} className={`p-2.5 rounded-full transition-all relative ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}>
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                        {unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800">Notifications</h3>
                      <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">{unreadCount} New</span>
                    </div>
                    
                    <div className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                          <Bell className="mx-auto mb-2 opacity-20" size={40} />
                          <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={() => handleNotifClick(notif)}
                            className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-all relative ${notif.is_read === 0 ? 'bg-blue-50/50 hover:bg-blue-100' : 'hover:bg-slate-50 opacity-70'}`}
                          >
                            {notif.is_read === 0 && <div className="w-2 h-2 bg-blue-500 rounded-full absolute left-2 top-1/2 -translate-y-1/2" />}
                            
                            {/* SENDER IMAGE OR ICON */}
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 ml-2 overflow-hidden border border-slate-200">
                               {notif.sender_image ? (
                                 <img src={`${API_BASE_URL}/uploads/profiles/${notif.sender_image}`} className="w-full h-full object-cover" />
                               ) : (
                                 getNotifIcon(notif.type)
                               )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className={`text-sm leading-tight ${notif.is_read === 0 ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                                {notif.title}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 truncate">{notif.message}</p>
                              <p className="text-[9px] text-blue-500 font-black uppercase tracking-tighter mt-1">
                                {new Date(notif.created_at).toLocaleDateString()} • {notif.sender_role}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* USER PROFILE */}
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <div className="hidden sm:block text-right">
                  <p className="text-sm font-black text-slate-800">{user?.full_name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: branding.theme_color }}>{user?.role}</p>
              </div>
              <div className="w-11 h-11 bg-slate-200 rounded-2xl overflow-hidden shadow-sm border-2 border-white ring-1 ring-slate-100">
                 {user?.profile_image ? <img src={`${API_BASE_URL}/uploads/profiles/${user.profile_image}`} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-black text-slate-400">{user?.full_name?.charAt(0)}</div>}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto"><Outlet /></div>
        </div>
      </main>

      {/* MODALS */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} branding={branding} logout={logout} />
      
      <CreateAnnouncementModal 
        isOpen={isCreateNotifModalOpen} 
        onClose={() => {
            setIsCreateNotifModalOpen(false);
            fetchNotifications(); // Refresh para makita yung bagong gawa
        }} 
      />

      <ReadNotificationModal 
        isOpen={!!selectedNotification} 
        onClose={() => setSelectedNotification(null)} 
        notification={selectedNotification}
      />
    </div>
  );
};

export default AdminLayout;