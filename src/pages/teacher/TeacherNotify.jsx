import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Calendar, AlertCircle, Info, FileText, DollarSign, ShieldAlert } from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner'; 
import { useAuth } from '../../context/AuthContext'; // <-- ARCHITECTURE FIX: Import auth

const TeacherNotify = () => {
  const { token, API_BASE_URL } = useAuth(); // <-- ARCHITECTURE FIX: Get secure token
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    setIsRetrying(true);
    const cachedAnnouncements = localStorage.getItem('sms_teacher_announcements');

    if (cachedAnnouncements && !isRetrying) {
      setAnnouncements(JSON.parse(cachedAnnouncements));
      setIsLoading(false); 
    }

    try {
      // ARCHITECTURE FIX: Secured Fetch API Call
      const response = await fetch(`${API_BASE_URL}/teacher/get_announcements.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const responseData = await response.json();
      
      // I-extract ang data depende kung paano ibinato ng PHP (wrapped in 'data' o hindi)
      const data = responseData.data ? responseData.data : responseData;

      if (Array.isArray(data) && data.length > 0) {
        setAnnouncements(data);
        localStorage.setItem('sms_teacher_announcements', JSON.stringify(data));
      } else {
        setAnnouncements([]); // Clear kung talagang walang laman ang database
      }
      
      setIsServerOffline(false); 
    } catch (error) {
      console.error("Connection failed:", error);
      setIsServerOffline(true); 

      if (!cachedAnnouncements) {
        setAnnouncements([
          { id: null, department: null, author: null, date: null, title: null, content: null, type: null }
        ]);
      }
    } finally {
      setIsLoading(false); 
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [token, API_BASE_URL, isRetrying]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // UI Helpers (No changes here, great logic!)
  const getDepartmentStyle = (department) => {
    switch (department) {
      case 'Registrar': return { color: 'text-emerald-700', bg: 'bg-emerald-100/60', border: 'border-white/60', icon: <FileText size={16} /> };
      case 'Cashier': return { color: 'text-orange-700', bg: 'bg-orange-100/60', border: 'border-white/60', icon: <DollarSign size={16} /> };
      case 'Admin': return { color: 'text-blue-700', bg: 'bg-blue-100/60', border: 'border-white/60', icon: <ShieldAlert size={16} /> };
      default: return { color: 'text-slate-700', bg: 'bg-white/40', border: 'border-white/60', icon: <Megaphone size={16} /> };
    }
  };

  const getPriorityBadge = (type) => {
    if (type === 'urgent') return <span className="bg-red-100/80 text-red-700 border border-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1"><AlertCircle size={10}/> Urgent</span>;
    if (type === 'warning') return <span className="bg-amber-100/80 text-amber-700 border border-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Notice</span>;
    if (type === 'info') return <span className="bg-blue-100/80 text-blue-700 border border-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">Info</span>;
    return <span className="bg-white/60 text-slate-500 border border-white px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm">No Type</span>;
  };

  if (isLoading && !announcements.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
          <div className="text-sm font-bold text-indigo-600">Loading announcements...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-transparent">
      
      {/* Reminder: Move this to global CSS when optimizing for production */}
      <style>{`
        @keyframes fadeInUpGPU {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-stagger {
          animation: fadeInUpGPU 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
        }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-4 pb-10">
        
        {/* HEADER */}
        <div className="animate-stagger flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" style={{ animationDelay: '0ms' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-sm shadow-indigo-500/20">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Announcements</h2>
              <p className="text-[11px] text-slate-600 font-medium mt-1">Updates and memos from school administration.</p>
            </div>
          </div>
        </div>

        {/* OFFLINE BANNER */}
        <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={fetchAnnouncements} />

        {/* LIST */}
        <div className="space-y-4">
          {announcements.map((news, index) => {
            const deptStyle = getDepartmentStyle(news.department);
            
            return (
              <div 
                key={news.id || index} 
                className="animate-stagger bg-white/40 backdrop-blur-md rounded-xl shadow-sm border border-white overflow-hidden hover:bg-white/60 hover:-translate-y-0.5 transition-all duration-300 transform-gpu group"
                style={{ animationDelay: `${100 + (index * 50)}ms` }}
              >
                <div className={`px-5 py-2.5 flex flex-wrap justify-between items-center gap-2 border-b backdrop-blur-sm ${deptStyle.bg} ${deptStyle.border}`}>
                  <div className="flex items-center space-x-2">
                    <span className={`${deptStyle.color} bg-white/50 p-1.5 rounded-md border border-white/50 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      {deptStyle.icon}
                    </span>
                    <span className={`font-black uppercase tracking-widest text-[9px] ${news.department ? deptStyle.color : 'text-slate-400 italic'}`}>
                      {news.department ? `${news.department} Dept` : 'Department (NULL)'}
                    </span>
                  </div>
                  {getPriorityBadge(news.type)}
                </div>

                <div className="p-5">
                  <h3 className={`text-base font-extrabold mb-2 leading-tight tracking-tight ${news.title ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                    {news.title || 'Title missing'}
                  </h3>
                  <p className={`text-[11px] leading-relaxed mb-4 break-words ${news.content ? 'text-slate-600' : 'text-slate-400 italic'}`}>
                    {news.content || 'Content missing.'}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-[10px] text-slate-500 font-bold border-t border-white/50 pt-3">
                    <div className="flex items-center">
                      <Info size={12} className="mr-1.5 text-indigo-400" />
                      Posted by: <span className={`ml-1 ${news.author ? 'text-slate-700' : 'text-slate-400 italic'}`}>{news.author || 'Unknown'}</span>
                    </div>
                    <div className="hidden sm:block text-slate-300">•</div>
                    <div className="flex items-center">
                      <Calendar size={12} className="mr-1.5 text-indigo-400" />
                      <span className={news.date ? 'text-slate-700' : 'text-slate-400 italic'}>{news.date || 'No date'}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* EMPTY STATE */}
          {!isLoading && announcements.length === 0 && !isServerOffline && (
            <div className="text-center py-10 bg-white/40 backdrop-blur-md rounded-xl border border-white shadow-sm">
               <p className="text-sm font-bold text-slate-500">No new announcements at this time.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TeacherNotify;