import React, { useState, useEffect, useCallback } from 'react';
import { Users, GraduationCap, ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import OfflineBanner from '../../utils/offlinebanner';
import { useAuth } from '../../context/AuthContext'; // <-- ARCHITECTURE FIX: Import auth

const TeacherClasses = () => {
  const { user, token, API_BASE_URL } = useAuth(); // <-- ARCHITECTURE FIX: Get user ID and secure token
  const [sections, setSections] = useState([]);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  const fetchSections = useCallback(async () => {
    if (!user?.id) return; // Wag mag-fetch kung walang naka-login

    setIsRetrying(true);
    try {
      // ARCHITECTURE FIX: Secured Fetch with Token and User ID
      const response = await fetch(`${API_BASE_URL}/teacher/get_sections.php?teacher_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const responseData = await response.json();
      
      // I-handle kung naka-wrap sa 'data' array ang response ng PHP
      const data = responseData.data ? responseData.data : responseData;

      if (Array.isArray(data)) {
        setSections(data);
      } else {
        setSections([]);
      }
      
      setIsServerOffline(false);
    } catch (error) {
      console.error("Fetch classes failed:", error);
      setIsServerOffline(true);
      
      // Fallback Dummy Data kapag offline para ma-test ang UI
      setSections([
        { id: 1, section_name: 'Grade 10 - Rizal', level: 'Junior High', student_count: 45, room: 'Room 101' },
        { id: 2, section_name: 'Grade 11 - STEM A', level: 'Senior High', student_count: 38, room: 'Science Lab' },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [user, token, API_BASE_URL]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (isLoading && !sections.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
          <div className="text-sm font-bold text-indigo-600">Loading classes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-transparent pb-8 lg:pb-4">
      
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

      <div className="max-w-7xl mx-auto w-full space-y-4">
        
        {/* HEADER SECTION */}
        <div className="animate-stagger flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" style={{ animationDelay: '0ms' }}>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">My Sections</h2>
            <p className="text-[11px] text-slate-600 font-medium mt-0.5">Manage the classes assigned to you.</p>
          </div>
        </div>

        {/* OFFLINE BANNER */}
        <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={fetchSections} />

        {/* GRID OF SECTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {sections.map((section, index) => (
            <div 
              key={section.id} 
              className="animate-stagger bg-white/40 backdrop-blur-md border border-white rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-white/60 transition-all duration-300 transform-gpu hover:-translate-y-1 group flex flex-col"
              style={{ animationDelay: `${100 + (index * 50)}ms` }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-100/80 text-indigo-600 rounded-lg shadow-inner group-hover:scale-110 transition-transform">
                  <Users size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest bg-white/60 border border-white px-2 py-1 rounded-md text-slate-500 shadow-sm shrink-0">
                  {section.level || 'Unassigned'}
                </span>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">
                {section.section_name}
              </h3>
              <p className="text-xs text-slate-500 font-medium mb-5 flex items-center gap-1.5 mt-1 truncate">
                <MapPin size={12} className="text-indigo-400 shrink-0" /> {section.room || 'TBA'}
              </p>

              <div className="flex items-center justify-between border-t border-white/50 pt-3 mt-auto">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <GraduationCap size={14} className="text-indigo-500 shrink-0" />
                  <span className="text-xs font-bold">{section.student_count || 0} <span className="text-[10px] font-medium text-slate-500">Students</span></span>
                </div>
                <Link 
                  to={`/teacher/sections/${section.id}`}
                  className="p-1.5 bg-white/60 text-slate-500 border border-white rounded-md group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm shrink-0"
                >
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          {/* EMPTY STATE */}
          {!isLoading && sections.length === 0 && !isServerOffline && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-xl border border-white shadow-sm">
               <Users size={36} className="mb-3 text-slate-400 opacity-50" />
               <p className="text-sm font-bold text-slate-600">No classes assigned yet.</p>
               <p className="text-[10px] font-medium text-slate-500">Please contact the Registrar for your teaching load.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherClasses;