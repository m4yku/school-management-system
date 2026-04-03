import React, { useState, useEffect, useCallback } from 'react';
import { Users, BookOpen, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner, PageHeader, EmptyState } from '../../components/shared/TeacherComponents';
import { SHARED_STYLES, ANIMATION_DELAYS } from '../../utils/teacherConstants';

const TeacherClasses = () => {
  const { user, API_BASE_URL, branding } = useAuth(); // Kinuha ang branding dito
  const [sections, setSections] = useState([]);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Fallback color kung walang naset na theme_color
  const themeColor = branding?.theme_color || '#6366f1';

  const fetchSections = useCallback(async () => {
    if (!user?.id) return;
    setIsRetrying(true);
    try {
      const token = localStorage.getItem('sms_token') || '';
      const response = await axios.get(`${API_BASE_URL}/teacher/get_sections.php?teacher_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === 'success') {
        setSections(response.data.data || []);
        setIsServerOffline(false);
      } else {
        throw new Error(response.data.message || 'API Error');
      }
    } catch (error) {
      console.error('Fetch classes failed:', error);
      setIsServerOffline(true);
      setSections([{ id: 0, subject: 'Offline Mode', section_name: 'Database Offline', level: 'System', student_count: 0, room: 'TBA' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [user, API_BASE_URL]);

  useEffect(() => {
    if (user?.id) fetchSections();
  }, [user?.id, fetchSections]);

  if (isLoading && !sections.length) {
    return <LoadingSpinner message="Loading classes..." />;
  }

  return (
    <div className="w-full flex flex-col bg-transparent pb-8 lg:pb-4 h-full">
      <style>{SHARED_STYLES}</style>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <PageHeader
          title="My Sections"
          subtitle="Select a class below to view students, manage grades, and check schedules."
          badge={`${isServerOffline ? '0' : sections.length} Active Classes`}
        />
        <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={fetchSections} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-6">
          {sections.length > 0 && !isLoading ? (
            sections.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                isOffline={isServerOffline}
                themeColor={themeColor} // Ipinasa ang themeColor
              />
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
};

const SectionCard = ({ section, index, isOffline, themeColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`animate-stagger h-full bg-white/70 backdrop-blur-xl border border-white rounded-[1.5rem] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 transform-gpu group flex flex-col relative overflow-hidden ${
        isOffline ? 'opacity-70 pointer-events-none grayscale-[0.5]' : 'hover:shadow-xl hover:bg-white hover:-translate-y-1'
      }`}
      style={{ animationDelay: `${ANIMATION_DELAYS.firstCard + index * ANIMATION_DELAYS.increment}ms` }}
    >
      {/* HIGHLIGHT LEFT BORDER - Dynamic Color */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5 transition-opacity duration-300 rounded-l-full" 
        style={{ backgroundColor: themeColor, opacity: isHovered ? 1 : 0 }}
      />

      {/* Background accent - Dynamic Color with low opacity */}
      <div 
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: themeColor, opacity: isHovered ? 0.15 : 0.05 }}
      />

      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100/80 text-slate-600 px-3 py-1.5 rounded-lg shadow-sm">
          {section.level || 'Unassigned'}
        </span>
        <div 
          className="flex items-center gap-1.5 border px-2.5 py-1.5 rounded-lg shadow-sm" 
          style={{ backgroundColor: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}
        >
          <Users size={12} strokeWidth={2.5} />
          <span className="text-[11px] font-black">{section.student_count || 0}</span>
        </div>
      </div>

      <div className="mb-5 relative z-10 flex-1">
        <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-2.5 line-clamp-2">
          {section.section_name || 'TBA'}
        </h3>
        <div className="flex items-start gap-2">
          <BookOpen size={14} className="shrink-0 mt-0.5" style={{ color: themeColor }} />
          <span className="text-[13px] font-bold text-slate-600 leading-snug line-clamp-2">
            {section.subject}
          </span>
        </div>
      </div>

      <div className="mb-5 relative z-10">
        <div className="flex items-center gap-2.5 text-slate-500 bg-white/50 p-2.5 rounded-xl border border-slate-100">
          <MapPin size={14} className="text-slate-400 shrink-0" />
          <span className="text-[12px] font-semibold truncate">{section.room || 'Room TBA'}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-200/60 relative z-10">
        <Link
          to={`/teacher/sections/${section.id}`}
          className="w-full flex items-center justify-between px-4 py-3 border rounded-xl font-bold text-[13px] transition-all shadow-sm group/btn"
          style={{ 
            backgroundColor: isHovered ? themeColor : '#f8fafc', 
            borderColor: isHovered ? themeColor : '#f1f5f9',
            color: isHovered ? '#ffffff' : '#475569' 
          }}
        >
          <span>{isOffline ? 'Unavailable' : 'Manage Class Grades'}</span>
          <ChevronRight
            size={16}
            className={`transition-all ${isHovered ? 'text-white translate-x-1' : 'text-slate-400'}`}
          />
        </Link>
      </div>
    </div>
  );
};

export default TeacherClasses;