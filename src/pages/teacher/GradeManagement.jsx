import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Save, ArrowLeft, CheckCircle, AlertCircle,
  GraduationCap, ClipboardCheck, BookOpen,
  Users, Award, TrendingUp,
  Search, Filter, RefreshCw, Lock, Calendar
} from 'lucide-react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  getGradingCategories,
  calculateFinalGrade,
  getGradeStatus,
  normaliseStudent,
  buildStudentPayload,
  clampGrade,
} from '../../utils/gradingUtils';
import { gradeStyles } from '../../components/shared/GradeManagementStyles';

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
const GradeManagementSkeleton = ({ themeColor }) => (
  <div style={{ fontFamily: 'inherit', padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <style>{`@keyframes gmSkPulse { 0% { background-color: ${themeColor}12; } 50% { background-color: ${themeColor}2e; } 100% { background-color: ${themeColor}12; } } .gm-sk { animation: gmSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }`}</style>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', gap: '1rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="gm-sk" style={{ width: '38px', height: '38px', borderRadius: '0.75rem', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="gm-sk" style={{ width: '200px', height: '20px' }} />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div className="gm-sk" style={{ width: '80px', height: '20px', borderRadius: '2rem' }} />
            <div className="gm-sk" style={{ width: '100px', height: '20px', borderRadius: '2rem' }} />
            <div className="gm-sk" style={{ width: '90px', height: '20px', borderRadius: '2rem' }} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', borderRadius: '1rem', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.5)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div className="gm-sk" style={{ width: '42px', height: '42px', borderRadius: '0.75rem', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <div className="gm-sk" style={{ width: '70%', height: '11px' }} />
            <div className="gm-sk" style={{ width: '50%', height: '22px' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const GradeManagement = () => {
  const { classId } = useParams();
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const themeColor = branding?.theme_color || '#6366f1';

  const { subject: stateSubject, section: stateSection, grade_level: stateGradeLevel } = location.state || {};

  const initialQuarter = parseInt(searchParams.get('quarter')) || location.state?.quarter || 1;
  const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter);

  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [allActivities, setAllActivities] = useState([]);

  const currentLevel = useMemo(() => {
    const dept = (classInfo?.department || '').toUpperCase();
    const gl = (classInfo?.grade_level || stateGradeLevel || '').toUpperCase();
    
    if (dept === 'COLLEGE' || gl.includes('YEAR') || gl.includes('COLLEGE')) return 'College';
    if (dept === 'SHS' || gl.includes('11') || gl.includes('12')) return 'SHS';
    return 'K-10'; 
  }, [classInfo, stateGradeLevel]);

  const isK12 = currentLevel !== 'College';
  const categories = getGradingCategories(currentLevel);

  const systemLabel = currentLevel === 'College' ? 'College System' : (currentLevel === 'SHS' ? 'SHS System' : 'JHS System');

  const displaySubject = classInfo?.subject_description || classInfo?.subject_name || stateSubject || 'Grade Management';
  const displaySection = classInfo?.section || classInfo?.section_name || stateSection || 'TBA';
  const displayGradeLevel = classInfo?.grade_level || stateGradeLevel || 'Grade Level';

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      const token = localStorage.getItem('sms_token');
      const params = { class_id: classId };
      if (selectedQuarter && isK12) params.quarter = selectedQuarter;

      const res = await axios.get(`${API_BASE_URL}/teacher/get_class_grades.php`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'success') {
        // 🟢 FIX: Huwag i-overwrite ng null ang classInfo kung nagpalit ng quarter at walang laman.
        setClassInfo(prev => res.data.class_info || prev);
        setStudents(res.data.data.map(normaliseStudent) || []);
        setIsServerOffline(false);
      }
    } catch (err) {
      console.error("Fetch grades error:", err);
      setIsServerOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [classId, selectedQuarter, isK12, API_BASE_URL]);

  const fetchActivities = useCallback(async () => {
    setAllActivities([]); 
    try {
      const token = localStorage.getItem('sms_token') || '';
      const params = { class_id: classId };
      if (isK12) params.quarter = selectedQuarter;

      const res = await axios.get(`${API_BASE_URL}/teacher/get_activities.php`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'success') {
        setAllActivities(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setAllActivities([]);
    }
  }, [classId, selectedQuarter, isK12, API_BASE_URL]);

  useEffect(() => {
    if (user?.id && classId) {
      fetchData(true);
      fetchActivities();
    }
  }, [user?.id, classId, selectedQuarter, fetchData, fetchActivities]);

  const actCount = useMemo(() => {
    const k12Map = { written: 'written', quiz: 'written', assignment: 'written', task: 'written', performance: 'performance', exam: 'exam', quarterly_exam: 'exam' };
    const collegeMap = { prelim: 'prelim', midterm: 'midterm', finals: 'finals' };

    return categories.reduce((acc, cat) => {
      acc[cat.key] = allActivities.filter(a => {
        const rawCat = a.category ? a.category.toLowerCase() : '';
        let mappedCat = rawCat;
        
        if (isK12) {
           mappedCat = k12Map[rawCat] || 'written'; 
        } else {
           mappedCat = collegeMap[rawCat] || rawCat;
        }
        
        return mappedCat === cat.key;
      }).length;
      return acc;
    }, {});
  }, [allActivities, categories, isK12]);

  const syncFromActivities = async () => {
    const quarterText = isK12 ? `Quarter ${selectedQuarter}` : 'this class';
    const isConfirmed = window.confirm(`This will auto-calculate all scores based on recorded activities for ${quarterText}. Continue?`);
    if (!isConfirmed) return;

    setIsSaving(true);
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('sms_token');
      const payload = { class_id: parseInt(classId) };
      if (isK12 && selectedQuarter) payload.quarter = selectedQuarter;

      const res = await axios.post(`${API_BASE_URL}/teacher/sync_grades.php`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: `Grades synced successfully for ${quarterText}!` });
        await fetchData(false);
        await fetchActivities();
      } else {
        throw new Error(res.data.message || 'Sync failed');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Unknown server error';
      setStatusMsg({ type: 'error', text: errorMsg });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleInputChange = (id, field, value) => {
    if (value === '') {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: '' } : s));
      return;
    }
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      if (numValue <= 100) {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: numValue } : s));
      }
    }
  };

  const handleInputBlur = (id, field, value) => {
    setStudents(prev =>
      prev.map(s => s.id === id ? { ...s, [field]: value === '' ? 0 : clampGrade(value) } : s)
    );
  };

  const saveAllGrades = async () => {
    const isConfirmed = window.confirm("Are you sure you want to save/update the manual grades for this class?");
    if (!isConfirmed) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token');
      const payload = {
        class_id: parseInt(classId),
        students: students.map(s => buildStudentPayload(s, currentLevel))
      };
      if (isK12 && selectedQuarter) payload.quarter = selectedQuarter;

      const res = await axios.post(`${API_BASE_URL}/teacher/save_grades.php`, payload, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Grades successfully saved/updated!' });
      } else {
        throw new Error(res.data.message || 'Save failed');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Save failed. Check connection.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const stats = useMemo(() => students.reduce(
    (acc, s) => {
      const f = calculateFinalGrade(s, currentLevel);
      getGradeStatus(f, currentLevel) === 'Passed' ? acc.passed++ : acc.failed++;
      return acc;
    },
    { passed: 0, failed: 0 }
  ), [students, currentLevel]);

  const passRate = students.length ? Math.round((stats.passed / students.length) * 100) : 0;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      const matchSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.student_number || '').toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (filterStatus === 'All') return true;
      const final = calculateFinalGrade(s, currentLevel);
      return getGradeStatus(final, currentLevel) === filterStatus;
    });
  }, [students, searchQuery, filterStatus, currentLevel]);

  if (isLoading) {
    return (
      <>
        <style>{gradeStyles(themeColor)}</style>
        <GradeManagementSkeleton themeColor={themeColor} />
      </>
    );
  }

  return (
    <div className="gm-root">
      <style>{gradeStyles(themeColor)}</style>

      <div className="gm-header">
        <div className="gm-header-left">
          <button className="gm-back-btn" onClick={() => navigate('/teacher/classes')}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="gm-title">{displaySubject}</h1>
            <div className="gm-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span className="gm-chip"><GraduationCap size={11} />{displayGradeLevel}</span>
              <span className="gm-chip"><ClipboardCheck size={11} />Section: {displaySection}</span>
              <span className="gm-chip gm-chip--level"><BookOpen size={11} />{systemLabel}</span>
              
              {isK12 && (
                <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
                  {[1, 2, 3, 4].map(q => (
                    <button
                      key={q}
                      onClick={() => {
                        setSelectedQuarter(q);
                        // 🟢 FIX: Ipasa ang location.state para hindi makalimutan ng React Router
                        setSearchParams({ quarter: q }, { replace: true, state: location.state });
                      }}
                      style={{
                        padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800,
                        border: selectedQuarter === q ? `1px solid ${themeColor}` : '1px solid #cbd5e1',
                        background: selectedQuarter === q ? themeColor : '#f8fafc',
                        color: selectedQuarter === q ? 'white' : '#64748b',
                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}
                    >
                      {selectedQuarter === q && <Calendar size={10} />} Q{q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="gm-header-right" style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="gm-save-btn"
            style={{ backgroundColor: '#f8fafc', color: '#475569', border: '1.5px solid #e2e8f0' }}
            onClick={syncFromActivities}
            disabled={isSaving || isServerOffline}
          >
            <RefreshCw size={15} className={isSaving ? 'spin' : ''} />
            Sync from Activities
          </button>

          <button className="gm-save-btn" onClick={saveAllGrades} disabled={isSaving || isServerOffline}>
            {isSaving ? <><div className="gm-btn-spinner" /> Saving…</> : <><Save size={15} /> Save Grades</>}
          </button>
        </div>
      </div>

      {isServerOffline && (
        <div className="gm-offline-banner">
          <AlertCircle size={15} /> Server is offline. Showing cached data.
        </div>
      )}

      {statusMsg && (
        <div className={`gm-status gm-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="gm-stats">
        <div className="gm-stat-card">
          <div className="gm-stat-icon gm-stat-icon--blue"><Users size={18} /></div>
          <div><p className="gm-stat-label">Total Students</p><p className="gm-stat-value">{students.length}</p></div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon gm-stat-icon--green"><Award size={18} /></div>
          <div><p className="gm-stat-label">Passed</p><p className="gm-stat-value">{stats.passed}</p></div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon gm-stat-icon--red"><AlertCircle size={18} /></div>
          <div><p className="gm-stat-label">Failed</p><p className="gm-stat-value">{stats.failed}</p></div>
        </div>
        <div className="gm-stat-card">
          <div className="gm-stat-icon gm-stat-icon--purple"><TrendingUp size={18} /></div>
          <div><p className="gm-stat-label">Pass Rate</p><p className="gm-stat-value">{passRate}%</p></div>
          <div className="gm-pass-bar"><div className="gm-pass-bar-fill" style={{ width: `${passRate}%` }} /></div>
        </div>
      </div>

      <div className="gm-card">
        <div className="gm-toolbar">
          <div className="gm-search-wrap">
            <Search size={14} className="gm-search-icon" />
            <input type="text" placeholder="Search student name or ID…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="gm-search" />
          </div>
          <div className="gm-filter-wrap">
            <Filter size={13} />
            {['All', 'Passed', 'Failed'].map(f => (
              <button key={f} className={`gm-filter-btn ${filterStatus === f ? 'active' : ''}`} onClick={() => setFilterStatus(f)}>{f}</button>
            ))}
          </div>
        </div>

        <div className="gm-table-wrap">
          <table className="gm-table">
            <thead>
              <tr>
                <th className="gm-th gm-th--name">
                  <div className="gm-th-inner"><Users size={12} style={{ color: themeColor }} /> Student</div>
                </th>
                {categories.map(cat => {
                  const isLocked = actCount[cat.key] > 0 || (isK12 && (cat.key === 'written' || cat.key === 'exam'));
                  
                  const tooltipText = (cat.key === 'exam' || cat.key === 'prelim' || cat.key === 'midterm' || cat.key === 'finals')
                    ? `Auto-computed from ${actCount[cat.key] || 0} exam`
                    : `Auto-computed from ${actCount[cat.key] || 0} activity/ies`;

                  return (
                    <th key={cat.key} className="gm-th gm-th--center">
                      <div className="gm-cat-header">
                        <span className="gm-cat-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'center' }}>
                          {isLocked && <Lock size={10} color="#d46565" title={tooltipText} />}
                          {cat.label}
                        </span>
                        <span className="gm-cat-pct">{cat.percentage}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="gm-th gm-th--center">Final Grade</th>
                <th className="gm-th gm-th--center">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={categories.length + 3} className="gm-empty">
                    {students.length === 0 ? 'No students enrolled.' : 'No matches found.'}
                  </td>
                </tr>
              ) : filteredStudents.map((student, idx) => {
                const final = calculateFinalGrade(student, currentLevel);
                const status = getGradeStatus(final, currentLevel);
                const passed = status === 'Passed';
                return (
                  <tr key={student.id ?? idx} className="gm-row">
                    <td className="gm-td gm-td--name">
                      <div className="gm-student-info">
                        <div className="gm-avatar" style={{ backgroundColor: themeColor }}>
                          {(student.name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="gm-student-name">{student.name}</p>
                          <p className="gm-student-id">{student.student_number}</p>
                        </div>
                      </div>
                    </td>

                    {categories.map(cat => {
                      const isLocked = actCount[cat.key] > 0 || (isK12 && (cat.key === 'written' || cat.key === 'exam'));
                      
                      const tooltipText = (cat.key === 'exam' || cat.key === 'prelim' || cat.key === 'midterm' || cat.key === 'finals')
                        ? `Auto-computed from ${actCount[cat.key] || 0} exam`
                        : `Auto-computed from ${actCount[cat.key] || 0} activity/ies`;

                      return (
                        <td key={cat.key} className="gm-td gm-td--center">
                          {isLocked ? (
                            <div title={tooltipText} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '0.5rem', background: 'rgba(148,163,184,0.1)', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700, color: '#475569', cursor: 'default', userSelect: 'none', minWidth: '54px', justifyContent: 'center' }}>
                              <Lock size={10} color="#d46565" />
                              {student[cat.key] ?? 0}
                            </div>
                          ) : (
                            <input type="text" inputMode="numeric" placeholder="0" value={student[cat.key] === 0 ? '' : (student[cat.key] ?? '')} onChange={e => handleInputChange(student.id, cat.key, e.target.value)} onBlur={e => handleInputBlur(student.id, cat.key, e.target.value)} onFocus={e => e.target.select()} className="gm-input" style={{ '--focus-color': themeColor }} />
                          )}
                        </td>
                      );
                    })}

                    <td className="gm-td gm-td--center">
                      <span className={`gm-final ${passed ? 'gm-final--pass' : 'gm-final--fail'}`}>{final}</span>
                    </td>
                    <td className="gm-td gm-td--center">
                      <span className={`gm-badge ${passed ? 'gm-badge--pass' : 'gm-badge--fail'}`}>{status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="gm-table-footer">
          Showing {filteredStudents.length} of {students.length} student{students.length !== 1 ? 's' : ''}
          {classInfo?.school_year ? ` · School Year ${classInfo.school_year}` : ''}
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;