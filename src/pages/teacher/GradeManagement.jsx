import React, { useState, useEffect, useCallback } from 'react';
import { Save, ArrowLeft, CheckCircle, Calculator } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import OfflineBanner from '../../utils/offlinebanner';

const GradeManagement = () => {
  const { classId } = useParams();
  const { user, token, API_BASE_URL } = useAuth(); // <-- ARCHITECTURE FIX: Kinuha ang token
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const getTeacherLevel = () => {
    const role = user?.role?.toLowerCase() || '';
    if (role.includes('elementary') || role.includes('highschool')) return 'K12';
    if (role.includes('college')) return 'COLLEGE';
    return 'K12'; 
  };

  const teacherLevel = getTeacherLevel();

  const fetchGrades = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    setIsRetrying(true);
    
    try {
      // ARCHITECTURE FIX: Secured Axios GET Request
      const res = await axios.get(`${API_BASE_URL}/teacher/get_class_grades.php`, {
        params: { class_id: classId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = res.data.data ? res.data.data : res.data;
      
      if (data) {
        setStudents(data);
        setIsServerOffline(false);
      }
    } catch (error) {
      console.error("Fetch grades error:", error);
      setIsServerOffline(true);
      
      // Fallback Dummy Data (Skeleton)
      const dummyData = teacherLevel === 'K12' ? [
        { id: 101, student_id: 'S-2024-001', name: "Juan Dela Cruz", written: 0, performance: 0, exam: 0 },
        { id: 102, student_id: 'S-2024-002', name: "Maria Clara", written: 0, performance: 0, exam: 0 },
      ] : [
        { id: 201, student_id: 'C-2024-001', name: "Jose Rizal", prelim: 0, midterm: 0, finals: 0 },
      ];
      setStudents(dummyData);
    } finally {
      if (isInitialLoad) setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [classId, teacherLevel, API_BASE_URL, token]);

  useEffect(() => {
    if (user && token) {
      fetchGrades(true); 
    }
  }, [user, token, fetchGrades]);

  const handleInputChange = (id, field, value) => {
    setStudents(prev => prev.map(s => 
      s.id === id ? { ...s, [field]: parseFloat(value) || 0 } : s
    ));
  };

  const calculateFinal = (student) => {
    if (teacherLevel === 'K12') {
      const total = (student.written * 0.30) + (student.performance * 0.50) + (student.exam * 0.20);
      return Math.round(total);
    } else {
      const avg = (student.prelim + student.midterm + student.finals) / 3;
      return avg.toFixed(2);
    }
  };

  const getStatus = (grade) => {
    if (teacherLevel === 'K12') return grade >= 75 ? 'Passed' : 'Failed';
    return grade <= 3.0 && grade > 0 ? 'Passed' : 'Failed';
  };

  const saveAllGrades = async () => {
    setIsSaving(true);
    try {
      // ARCHITECTURE FIX: Secured Axios POST Request
      const payload = {
        class_id: classId,
        teacher_level: teacherLevel,
        students: students.map(s => ({
          ...s,
          final_grade: calculateFinal(s),
          remarks: getStatus(calculateFinal(s))
        }))
      };

      const res = await axios.post(`${API_BASE_URL}/teacher/save_grades.php`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if(res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Grades synced to database!' });
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Connection failed. Check network.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-transparent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-white/40 border-t-indigo-600 rounded-full animate-spin shadow-md"></div>
          <div className="text-sm font-bold text-indigo-600">Loading Gradebook...</div>
        </div>
      </div>
    );
  }

  // ... (The rest of your UI code remains exactly the same, no need to change the styling)

    return (
      <div className="w-full h-full bg-transparent">
        
        {/* GPU-OPTIMIZED CSS ANIMATION */}
        <style>{`
          @keyframes fadeInUpGPU {
            from { opacity: 0; transform: translate3d(0, 15px, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          .animate-stagger {
            animation: fadeInUpGPU 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            will-change: opacity, transform;
          }
        `}</style>

        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* ========================================== */}
          {/* HEADER SECTION */}
          {/* ========================================== */}
          <div 
            className="animate-stagger flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white/40 backdrop-blur-md px-5 py-4 rounded-xl border border-white shadow-sm"
            style={{ animationDelay: '0ms' }}
          >
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 bg-white/60 hover:bg-white rounded-lg border border-white shadow-sm transition-colors text-slate-600"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Manage Grades</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 bg-indigo-100/80 text-indigo-700 text-[9px] font-black rounded uppercase tracking-wider border border-white shadow-sm">
                    {teacherLevel} System
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">Class: {classId}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/60 text-slate-600 border border-white rounded-lg font-bold text-[11px] hover:bg-white shadow-sm transition-all">
                <Calculator size={14} /> Tools
              </button>
              <button 
                onClick={saveAllGrades}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 shadow-sm transition-all"
              >
                {isSaving ? 'Saving...' : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>

          {/* ========================================== */}
          {/* REUSABLE OFFLINE BANNER */}
          {/* ========================================== */}
          <OfflineBanner 
            isServerOffline={isServerOffline} 
            isRetrying={isRetrying} 
            onRetry={() => fetchGrades(false)} // false = wag i-trigger ang full screen loading
          />

          {statusMsg && (
            <div 
              className={`animate-stagger p-3 px-4 rounded-xl border flex items-center gap-2.5 shadow-sm backdrop-blur-md transition-all ${statusMsg.type === 'success' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700' : 'bg-red-50/80 border-red-200 text-red-700'}`}
              style={{ animationDelay: '50ms' }}
            >
              <CheckCircle size={16}/>
              <span className="text-[11px] font-bold">{statusMsg.text}</span>
            </div>
          )}

          {/* ========================================== */}
          {/* TABLE CONTAINER */}
          {/* ========================================== */}
          <div 
            className="animate-stagger bg-white/40 backdrop-blur-md border border-white rounded-xl shadow-sm overflow-hidden flex flex-col"
            style={{ animationDelay: '100ms' }}
          >
            <div className="overflow-x-auto p-1">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-slate-500 text-[9px] font-black uppercase tracking-widest border-b border-white/50 bg-white/20">
                    <th className="px-5 py-3 rounded-tl-lg">Student</th>
                    {teacherLevel === 'K12' ? (
                      <>
                        <th className="px-3 py-3 text-center">Written (30%)</th>
                        <th className="px-3 py-3 text-center">Perf (50%)</th>
                        <th className="px-3 py-3 text-center">Exam (20%)</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3 py-3 text-center">Prelim</th>
                        <th className="px-3 py-3 text-center">Midterm</th>
                        <th className="px-3 py-3 text-center">Finals</th>
                      </>
                    )}
                    <th className="px-5 py-3 text-center">Final</th>
                    <th className="px-5 py-3 text-center rounded-tr-lg">Remarks</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 text-xs">
                  {students.map((student, index) => {
                    const final = calculateFinal(student);
                    const status = getStatus(final);
                    return (
                      <tr 
                        key={student.id} 
                        className="animate-stagger hover:bg-white/50 transition-colors border-b border-white/30 last:border-0 group"
                        style={{ animationDelay: `${150 + (index * 30)}ms` }}
                      >
                        <td className="px-5 py-2.5">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center font-bold text-[10px] border border-white shadow-sm group-hover:scale-105 transition-transform">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">{student.name}</span>
                            </div>
                          </div>
                        </td>
                        
                        {/* INPUT FIELDS - GLASSMORPHISM STYLE */}
                        {teacherLevel === 'K12' ? (
                          <>
                            <td className="px-3 py-2.5"><input type="number" value={student.written} onChange={(e) => handleInputChange(student.id, 'written', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                            <td className="px-3 py-2.5"><input type="number" value={student.performance} onChange={(e) => handleInputChange(student.id, 'performance', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                            <td className="px-3 py-2.5"><input type="number" value={student.exam} onChange={(e) => handleInputChange(student.id, 'exam', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2.5"><input type="number" step="0.25" value={student.prelim} onChange={(e) => handleInputChange(student.id, 'prelim', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                            <td className="px-3 py-2.5"><input type="number" step="0.25" value={student.midterm} onChange={(e) => handleInputChange(student.id, 'midterm', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                            <td className="px-3 py-2.5"><input type="number" step="0.25" value={student.finals} onChange={(e) => handleInputChange(student.id, 'finals', e.target.value)} className="w-14 mx-auto block p-1.5 bg-white/50 backdrop-blur-sm border border-white rounded-md text-center font-bold text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-sm hover:bg-white/80" /></td>
                          </>
                        )}
                        
                        <td className="px-5 py-2.5 text-center font-black text-sm text-slate-800 drop-shadow-sm">{final}</td>
                        <td className="px-5 py-2.5 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm backdrop-blur-sm border ${status === 'Passed' ? 'bg-emerald-100/60 text-emerald-700 border-white' : 'bg-red-100/60 text-red-700 border-white'}`}>
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    );
  };

  export default GradeManagement;