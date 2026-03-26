import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, 
  BookOpen, Clock, Award, Edit 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; 
import OfflineBanner from '../../utils/offlinebanner'; 

const TeacherProfile = () => {
  // Assuming useAuth provides a token for secure API calls
  const { user, token, API_BASE_URL } = useAuth(); 
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); 
  const navigate = useNavigate();

  // ARCHITECTURE FIX: Use Environment Variables for API URLs
  const fetchTeacherData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);
    
    try {
      // ARCHITECTURE FIX: Secure the API call with Authorization headers
          // Sa loob ng fetchTeacherData function:
          const response = await axios.get(`${API_BASE_URL}/teacher/profile.php`, {
            params: { id: user?.id },
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
      setIsServerOffline(false); 

      let dbData = response.data.data ? response.data.data : response.data;

      if (dbData && Object.keys(dbData).length > 0) {
        setTeacher({
          ...dbData, 
          id: dbData.id || user?.id,
          firstName: dbData.firstName || user?.full_name?.split(' ')[0] || 'Unknown',
          lastName: dbData.lastName || user?.full_name?.split(' ').slice(1).join(' ') || '',
          profile_image: dbData.profile_image || user?.profile_image || null,
          role: dbData.role || user?.role || 'Teacher',
          subjects: dbData.subjects || []
        });
      } else {
        throw new Error("No profile data found");
      }

    } catch (error) {
      console.error("Profile fetch error:", error);
      setIsServerOffline(true); 
      
      // Fallback to Context User Data for offline resilience
      const nameParts = user?.full_name?.split(' ') || ['Teacher', ''];
      
      setTeacher({
        id: user?.id || null,
        firstName: nameParts[0] || null,
        lastName: nameParts.length > 1 ? nameParts.slice(1).join(' ') : null,
        profile_image: user?.profile_image || null,
        role: user?.role || null,
        department: null, email: null, phone: null, address: null,
        status: null, dateHired: null, subjects: [] 
      });
    } finally {
      if (showLoading) setIsLoading(false); 
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [user, token, API_BASE_URL]);

  useEffect(() => {
    if (user) fetchTeacherData(true);
  }, [user, fetchTeacherData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
          <div className="text-sm font-bold text-indigo-600">Loading profile data...</div>
        </div>
      </div>
    );
  }

  if (!teacher) return null;

  return (
    <div className="w-full flex flex-col bg-transparent pb-10 lg:pb-6">
      
      {/* Note: Move these keyframes to your global index.css file for better performance */}
      <style>{`
        @keyframes fadeInUpGPU {
          from { opacity: 0; transform: translate3d(0, 15px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-stagger {
          animation: fadeInUpGPU 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          will-change: opacity, transform;
          backface-visibility: hidden;
        }
      `}</style>

      <div className="max-w-7xl mx-auto w-full flex flex-col gap-3 lg:gap-4">
        
        {/* HEADER SECTION */}
        <div className="animate-stagger shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm" style={{ animationDelay: '0ms' }}>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight leading-none">Your Profile</h2>
            <p className="text-[11px] text-slate-600 font-medium mt-1">View and manage your professional information.</p>
          </div>
          <Link to="/teacher/profile/edit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold shadow-sm shadow-indigo-500/20 transition-all w-full sm:w-auto justify-center">
            <Edit size={14} /> Edit Profile
          </Link>
        </div>

        {/* OFFLINE BANNER */}
        <div className="shrink-0">
          <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchTeacherData(false)} />
        </div>

        {/* AVATAR & INFO CARD */}
        <div className="animate-stagger shrink-0 bg-white/40 backdrop-blur-md rounded-xl border border-white shadow-sm p-5 sm:p-6" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
            <div className="relative border-4 border-white/80 rounded-[1.25rem] bg-white/50 backdrop-blur-sm shadow-sm shrink-0">
              {teacher?.profile_image ? (
                <img src={`${API_BASE_URL}/uploads/profiles/${teacher.profile_image}`} alt="Profile" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover" />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-100/80 rounded-xl flex items-center justify-center text-indigo-600 text-4xl font-extrabold uppercase">
                  {teacher?.firstName?.charAt(0) || ''}{teacher?.lastName?.charAt(0) || ''}
                </div>
              )}
            </div>

            <div className="flex-1 w-full flex flex-col sm:flex-row sm:justify-between items-center sm:items-center gap-4 sm:gap-0">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 leading-tight capitalize tracking-tight">
                  {teacher.firstName} {teacher.lastName}
                </h1>
                <p className="text-slate-600 font-bold mt-1.5 flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs uppercase tracking-wider">
                  <Briefcase size={14} className="text-indigo-500" /> 
                  <span>{teacher.role}</span>
                  <span className="text-slate-600 mx-0.5">•</span>
                  <span>{teacher.department || 'Department'}</span>
                </p>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:flex-col sm:items-end gap-2 sm:gap-1.5">
                <span className={`px-3 py-1.5 border rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm ${teacher.status === 'Active' ? 'bg-emerald-100/60 text-emerald-700 border-white' : 'bg-white/60 text-slate-500 border-white'}`}>
                  {teacher.status || 'Active'}
                </span>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider bg-white/60 px-2.5 py-1 rounded-md border border-white shadow-sm">
                  EMP ID: {teacher.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 md:gap-4 items-start">
          
          {/* LEFT: CONTACT INFO */}
          <div className="animate-stagger lg:col-span-1 w-full bg-white/40 backdrop-blur-md rounded-xl border border-white shadow-sm flex flex-col" style={{ animationDelay: '200ms' }}>
            <div className="px-5 py-3.5 border-b border-white/60 bg-white/20">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <User size={16} className="text-indigo-600" /> Contact Information
              </h3>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-500 shrink-0"><Mail size={14} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Email Address</p>
                  <p className={`text-xs font-bold ${teacher.email ? 'text-slate-800' : 'text-slate-400 italic'}`}>{teacher.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-500 shrink-0"><Phone size={14} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Phone Number</p>
                  <p className={`text-xs font-bold ${teacher.phone ? 'text-slate-800' : 'text-slate-400 italic'}`}>{teacher.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-500 shrink-0"><MapPin size={14} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Home Address</p>
                  <p className={`text-xs font-bold leading-snug ${teacher.address ? 'text-slate-800' : 'text-slate-400 italic'}`}>{teacher.address || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-4 border-t border-white/50">
                <div className="p-1.5 bg-indigo-100/50 rounded-md text-indigo-500 shrink-0"><Award size={14} /></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Date Hired</p>
                  <p className={`text-xs font-bold ${teacher.dateHired ? 'text-slate-800' : 'text-slate-400 italic'}`}>{teacher.dateHired || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: TEACHING LOAD */}
          <div className="animate-stagger lg:col-span-2 w-full bg-white/40 backdrop-blur-md rounded-xl border border-white shadow-sm flex flex-col" style={{ animationDelay: '300ms' }}>
            <div className="px-5 py-3.5 border-b border-white/60 bg-white/20 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" /> Teaching Load
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/60 text-slate-600 px-2.5 py-1 rounded-md border border-white shadow-sm">
                {teacher.subjects?.length || 0} Subjects
              </span>
            </div>

            <div className="p-4 space-y-3">
              {teacher.subjects && teacher.subjects.length > 0 ? (
                teacher.subjects.map((subject) => (
                  <div key={subject.id} className="p-3.5 rounded-xl border border-white bg-white/50 hover:bg-white/80 hover:-translate-y-0.5 transition-all duration-300 transform-gpu shadow-sm group">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-md border border-white uppercase tracking-widest shadow-sm">
                            {subject.code}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors tracking-tight">
                          {subject.name}
                        </h4>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                          <User size={12} className="text-indigo-400" /> {subject.section}
                        </p>
                      </div>
                      
                      <div className="sm:text-right">
                        <p className="text-[11px] font-bold text-slate-500 flex items-center sm:justify-end gap-1.5 bg-white/60 px-2.5 py-1.5 rounded-md border border-white shadow-sm w-fit sm:w-auto">
                          <Clock size={14} className="text-indigo-500 shrink-0" />
                          {subject.schedule}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                  <BookOpen size={36} className="mb-3 text-slate-400 opacity-50" />
                  <p className="text-xs font-bold text-slate-600">No subjects assigned currently.</p>
                  <p className="text-[10px] mt-1 font-medium">Teaching loads will appear here once connected by the Registrar.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;