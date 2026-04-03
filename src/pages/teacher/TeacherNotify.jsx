import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Megaphone, Calendar, Info, FileText,
  DollarSign, ShieldAlert, User, Bell
} from 'lucide-react';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext';
import { PageHeader, EmptyState } from '../../components/shared/TeacherComponents';
import { DEPARTMENT_STYLES, PRIORITY_TYPES, ANIMATION_DELAYS, SHARED_STYLES } from '../../utils/teacherConstants';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const AnnouncementSkeleton = ({ themeColor }) => (
  <div style={{
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)', borderRadius: '2rem',
    overflow: 'hidden'
  }}>
    <style>{`
      @keyframes notifSkPulse {
        0% { background-color: ${themeColor}12; }
        50% { background-color: ${themeColor}2e; }
        100% { background-color: ${themeColor}12; }
      }
      .notif-sk { animation: notifSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }
    `}</style>

    {/* Card header */}
    <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(226,232,240,0.5)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="notif-sk" style={{ width: '36px', height: '36px', borderRadius: '0.75rem' }} />
        <div className="notif-sk" style={{ width: '120px', height: '13px' }} />
      </div>
      <div className="notif-sk" style={{ width: '70px', height: '28px', borderRadius: '0.75rem' }} />
    </div>

    {/* Content */}
    <div style={{ padding: '1.75rem' }}>
      <div className="notif-sk" style={{ width: '65%', height: '22px', marginBottom: '0.75rem' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
        <div className="notif-sk" style={{ width: '100%', height: '13px' }} />
        <div className="notif-sk" style={{ width: '90%', height: '13px' }} />
        <div className="notif-sk" style={{ width: '75%', height: '13px' }} />
      </div>

      {/* Footer */}
      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid rgba(248,250,252,1)', display: 'flex', gap: '0.75rem' }}>
        <div className="notif-sk" style={{ width: '130px', height: '28px', borderRadius: '0.75rem' }} />
        <div className="notif-sk" style={{ width: '100px', height: '28px', borderRadius: '0.75rem' }} />
      </div>
    </div>
  </div>
);

const TeacherNotify = () => {
  const { API_BASE_URL, branding } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const themeColor = branding?.theme_color || '#6366f1';

  const fetchAnnouncements = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);

    const cachedAnnouncements = localStorage.getItem('sms_teacher_announcements');
    if (cachedAnnouncements) {
      try {
        setAnnouncements(JSON.parse(cachedAnnouncements));
        if (showLoading) setIsLoading(false);
      } catch (err) {
        console.warn('Cache parse error:', err);
      }
    }

    try {
      const token = localStorage.getItem('sms_token') || '';
      const response = await axios.get(`${API_BASE_URL}/teacher/get_announcements.php`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000,
      });
      if (response.data.status === 'success') {
        const data = response.data.data || [];
        setAnnouncements(data);
        localStorage.setItem('sms_teacher_announcements', JSON.stringify(data));
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message || 'Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setIsServerOffline(true);
      if (!cachedAnnouncements) setAnnouncements([]);
    } finally {
      if (showLoading) setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [API_BASE_URL]);

  useEffect(() => { fetchAnnouncements(true); }, [fetchAnnouncements]);

  const iconMap = { FileText, DollarSign, ShieldAlert, Megaphone };

  return (
    <div className="w-full h-full overflow-y-auto custom-scroll pr-2 pb-10">
      <style>{`
        ${SHARED_STYLES}
        .custom-scroll::-webkit-scrollbar { width: 8px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb {
          background-color: ${themeColor};
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background-color: ${themeColor}; opacity: 0.8; }
      `}</style>

      <div className="max-w-4xl mx-auto space-y-6">
        <PageHeader
          icon={<Bell size={24} />}
          title="Announcements"
          subtitle="Stay updated with the latest memos and notices from the school administration."
          badge={`${announcements.length} Recent Updates`}
        />

        <div className="animate-stagger" style={{ animationDelay: ANIMATION_DELAYS.banner }}>
          <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchAnnouncements(false)} />
        </div>

        <div className="space-y-5">
          {isLoading ? (
            [1, 2, 3].map(n => <AnnouncementSkeleton key={n} themeColor={themeColor} />)
          ) : announcements.length > 0 ? (
            announcements.map((announcement, index) => (
              <AnnouncementCard key={announcement.id || index} announcement={announcement} index={index} iconMap={iconMap} themeColor={themeColor} />
            ))
          ) : !isServerOffline ? (
            <div className="py-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm">
              <EmptyState icon={Megaphone} title="All caught up!" message="No new announcements at this time. Check back later for updates." />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const AnnouncementCard = ({ announcement, index, iconMap, themeColor }) => {
  const deptStyle = DEPARTMENT_STYLES[announcement.department] || DEPARTMENT_STYLES.default;
  const DepartmentIcon = iconMap[deptStyle.icon] || Megaphone;
  const priorityStyle = PRIORITY_TYPES[announcement.type] || PRIORITY_TYPES.general;

  return (
    <div
      className="animate-stagger group relative flex flex-col bg-white/70 backdrop-blur-xl border border-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-white"
      style={{ animationDelay: `${ANIMATION_DELAYS.firstCard + index * ANIMATION_DELAYS.increment}ms` }}
    >
      <div className="absolute left-0 top-10 bottom-10 w-1.5 rounded-r-full transition-all duration-300" style={{ backgroundColor: announcement.type === 'urgent' ? '#ef4444' : themeColor, opacity: 0.6 }} />

      <div className="px-6 py-4 flex justify-between items-center border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl border shadow-sm ${deptStyle.bg} ${deptStyle.border}`}>
            <DepartmentIcon size={16} className={deptStyle.color} />
          </div>
          <span className={`font-black uppercase tracking-widest text-[10px] ${deptStyle.color}`}>
            {announcement.department ? `${announcement.department} Department` : 'General Notice'}
          </span>
        </div>
        <PriorityBadge type={announcement.type} style={priorityStyle} />
      </div>

      <div className="p-7">
        <h3 className="text-xl font-black text-slate-800 leading-tight tracking-tight mb-3 group-hover:text-slate-900 transition-colors">
          {announcement.title || 'Untitled Announcement'}
        </h3>
        <p className="text-[13px] leading-relaxed text-slate-600 mb-6 font-medium">
          {announcement.content || 'No description provided.'}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest pt-5 border-t border-slate-50">
          <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg text-slate-500">
            <User size={12} style={{ color: themeColor }} />
            <span>Posted by: <span className="text-slate-800">{announcement.author || 'Admin'}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100/50 px-3 py-1.5 rounded-lg text-slate-500">
            <Calendar size={12} style={{ color: themeColor }} />
            <span className="text-slate-800">{announcement.date || 'Today'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PriorityBadge = ({ type, style }) => {
  const isUrgent = type === 'urgent';
  return (
    <span className={`${style.style} border border-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1.5 ${isUrgent ? 'animate-pulse' : ''}`}>
      {isUrgent && <ShieldAlert size={12} className="text-red-600" />}
      {!isUrgent && <Info size={12} className="text-indigo-600" />}
      {style.label}
    </span>
  );
};

export default TeacherNotify;