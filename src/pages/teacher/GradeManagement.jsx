import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Save, ArrowLeft, CheckCircle, AlertCircle,
  GraduationCap, ClipboardCheck, BookOpen,
  Users, Award, TrendingUp,
  Search, Filter, RefreshCw,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  getTeacherLevel,
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
    <style>{`
      @keyframes gmSkPulse {
        0% { background-color: ${themeColor}12; }
        50% { background-color: ${themeColor}2e; }
        100% { background-color: ${themeColor}12; }
      }
      .gm-sk { animation: gmSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }
    `}</style>

    {/* Header skeleton */}
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '1rem 1.25rem', borderRadius: '1.25rem',
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      gap: '1rem', flexWrap: 'wrap'
    }}>
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
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="gm-sk" style={{ width: '160px', height: '40px', borderRadius: '0.75rem' }} />
        <div className="gm-sk" style={{ width: '120px', height: '40px', borderRadius: '0.75rem' }} />
      </div>
    </div>

    {/* Stats skeleton */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
      {[1, 2, 3, 4].map(n => (
        <div key={n} style={{
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
          borderRadius: '1rem', padding: '1.25rem',
          border: '1px solid rgba(255,255,255,0.5)', display: 'flex', gap: '0.75rem', alignItems: 'center'
        }}>
          <div className="gm-sk" style={{ width: '42px', height: '42px', borderRadius: '0.75rem', flexShrink: 0 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
            <div className="gm-sk" style={{ width: '70%', height: '11px' }} />
            <div className="gm-sk" style={{ width: '50%', height: '22px' }} />
          </div>
        </div>
      ))}
    </div>

    {/* Table card skeleton */}
    <div style={{
      background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)',
      borderRadius: '1.25rem', padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
    }}>
      {/* Toolbar skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="gm-sk" style={{ width: '260px', height: '40px', borderRadius: '0.75rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="gm-sk" style={{ width: '50px', height: '40px', borderRadius: '0.75rem' }} />
          <div className="gm-sk" style={{ width: '60px', height: '40px', borderRadius: '0.75rem' }} />
          <div className="gm-sk" style={{ width: '65px', height: '40px', borderRadius: '0.75rem' }} />
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 1fr 1fr',
        gap: '0.75rem', paddingBottom: '0.75rem',
        borderBottom: '1.5px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem'
      }}>
        {[1, 2, 3, 4, 5, 6, 7].map(n => (
          <div key={n} className="gm-sk" style={{ height: '14px', width: n === 1 ? '60%' : '50%', margin: n !== 1 ? '0 auto' : '0' }} />
        ))}
      </div>

      {/* Table rows */}
      {[1, 2, 3, 4, 5, 6, 7].map(n => (
        <div key={n} style={{
          display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr) 1fr 1fr',
          gap: '0.75rem', padding: '0.85rem 0',
          borderBottom: '1px solid rgba(0,0,0,0.04)', alignItems: 'center'
        }}>
          {/* Student cell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="gm-sk" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="gm-sk" style={{ width: '120px', height: '13px' }} />
              <div className="gm-sk" style={{ width: '70px', height: '11px' }} />
            </div>
          </div>
          {/* Grade inputs */}
          {[1, 2, 3, 4].map(k => (
            <div key={k} style={{ display: 'flex', justifyContent: 'center' }}>
              <div className="gm-sk" style={{ width: '60px', height: '34px', borderRadius: '0.5rem' }} />
            </div>
          ))}
          {/* Final grade */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="gm-sk" style={{ width: '52px', height: '28px', borderRadius: '0.5rem' }} />
          </div>
          {/* Remarks badge */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="gm-sk" style={{ width: '65px', height: '24px', borderRadius: '2rem' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const GradeManagement = () => {
  const { classId }                      = useParams();
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate                         = useNavigate();

  const themeColor = branding?.theme_color || '#6366f1';

  const [students,         setStudents]        = useState([]);
  const [classInfo,        setClassInfo]       = useState(null);
  const [isLoading,        setIsLoading]       = useState(true);
  const [isSaving,         setIsSaving]        = useState(false);
  const [isServerOffline,  setIsServerOffline] = useState(false);
  const [isRetrying,       setIsRetrying]      = useState(false);
  const [statusMsg,        setStatusMsg]       = useState(null);
  const [searchQuery,      setSearchQuery]     = useState('');
  const [filterStatus,     setFilterStatus]    = useState('All');

  const teacherLevel = getTeacherLevel(classInfo);
  const categories   = getGradingCategories(teacherLevel);

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    setIsRetrying(true);
    try {
      const token   = localStorage.getItem('sms_token') || '';
      const headers = { Authorization: `Bearer ${token}` };
      const [gradesRes, metaRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/teacher/get_class_grades.php`, { params: { class_id: classId }, headers }),
        axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php`, { params: { teacher_id: user.id }, headers }),
      ]);
      if (gradesRes.data.status === 'success') {
        setStudents((gradesRes.data.data || []).map(normaliseStudent));
        setIsServerOffline(false);
      }
      if (metaRes.data.status === 'success') {
        const found = (metaRes.data.data || []).find(c => String(c.id) === String(classId));
        if (found) setClassInfo(found);
      }
    } catch {
      setIsServerOffline(true);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRetrying(false), 800);
    }
  }, [classId, API_BASE_URL, user?.id]);

  useEffect(() => {
    if (user?.id) fetchData(true);
  }, [user?.id, fetchData]);

  const syncFromActivities = async () => {
    const isConfirmed = window.confirm(
      "This will automatically calculate the totals based on all recorded activities. Manual overrides will be updated. Continue?"
    );
    if (!isConfirmed) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token') || '';
      const res = await axios.post(
        `${API_BASE_URL}/teacher/sync_grades.php`,
        { class_id: parseInt(classId) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Grades synced from activities successfully!' });
        fetchData(false);
      } else {
        throw new Error(res.data.message || 'Sync failed');
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Sync failed. Check connection.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
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
    const isConfirmed = window.confirm(
      "Are you sure you want to save/update the grades for this class? This will overwrite any existing grades."
    );
    if (!isConfirmed) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token') || '';
      const res = await axios.post(
        `${API_BASE_URL}/teacher/save_grades.php`,
        { class_id: parseInt(classId), students: students.map(s => buildStudentPayload(s, teacherLevel)) },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
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
      const f = calculateFinalGrade(s, teacherLevel);
      getGradeStatus(f, teacherLevel) === 'Passed' ? acc.passed++ : acc.failed++;
      return acc;
    },
    { passed: 0, failed: 0 }
  ), [students, teacherLevel]);

  const passRate = students.length ? Math.round((stats.passed / students.length) * 100) : 0;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      const matchSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.student_number || '').toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (filterStatus === 'All') return true;
      const final = calculateFinalGrade(s, teacherLevel);
      return getGradeStatus(final, teacherLevel) === filterStatus;
    });
  }, [students, searchQuery, filterStatus, teacherLevel]);

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

      {/* HEADER */}
      <div className="gm-header">
        <div className="gm-header-left">
          <button className="gm-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="gm-title">
              {classInfo?.subject_description || 'Grade Management'}
            </h1>
            <div className="gm-meta">
              <span className="gm-chip"><GraduationCap size={11} />{classInfo?.grade_level || 'Grade Level'}</span>
              <span className="gm-chip"><ClipboardCheck size={11} />Section: {classInfo?.section || classInfo?.section_name || 'TBA'}</span>
              <span className="gm-chip gm-chip--level"><BookOpen size={11} />{teacherLevel} System</span>
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

          {isServerOffline && (
            <button className="gm-retry-btn" onClick={() => fetchData(false)} disabled={isRetrying}>
              <RefreshCw size={14} className={isRetrying ? 'spin' : ''} />
              {isRetrying ? 'Retrying…' : 'Retry'}
            </button>
          )}

          <button className="gm-save-btn" onClick={saveAllGrades} disabled={isSaving || isServerOffline}>
            {isSaving
              ? <><div className="gm-btn-spinner" /> Saving…</>
              : <><Save size={15} /> Save Grades</>}
          </button>
        </div>
      </div>

      {isServerOffline && (
        <div className="gm-offline-banner">
          <AlertCircle size={15} />
          Server is offline. Showing cached data. Changes will not be saved.
        </div>
      )}

      {statusMsg && (
        <div className={`gm-status gm-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* STATS */}
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

      {/* GRADEBOOK */}
      <div className="gm-card">
        <div className="gm-toolbar">
          <div className="gm-search-wrap">
            <Search size={14} className="gm-search-icon" />
            <input
              type="text" placeholder="Search student name or ID…"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="gm-search"
            />
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
                <th className="gm-th gm-th--name"><div className="gm-th-inner"><Users size={12} style={{ color: themeColor }} /> Student</div></th>
                {categories.map(cat => (
                  <th key={cat.key} className="gm-th gm-th--center">
                    <div className="gm-cat-header"><span className="gm-cat-label">{cat.label}</span><span className="gm-cat-pct">{cat.percentage}</span></div>
                  </th>
                ))}
                <th className="gm-th gm-th--center">Final Grade</th>
                <th className="gm-th gm-th--center">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={categories.length + 3} className="gm-empty">{students.length === 0 ? 'No students enrolled.' : 'No matches found.'}</td></tr>
              ) : filteredStudents.map((student, idx) => {
                const final = calculateFinalGrade(student, teacherLevel);
                const status = getGradeStatus(final, teacherLevel);
                const passed = status === 'Passed';
                return (
                  <tr key={student.id ?? idx} className="gm-row">
                    <td className="gm-td gm-td--name">
                      <div className="gm-student-info">
                        <div className="gm-avatar" style={{ backgroundColor: themeColor }}>{(student.name || 'S').charAt(0).toUpperCase()}</div>
                        <div><p className="gm-student-name">{student.name}</p><p className="gm-student-id">{student.student_number}</p></div>
                      </div>
                    </td>
                    {categories.map(cat => (
                      <td key={cat.key} className="gm-td gm-td--center">
                        <input
                          type="text" inputMode="numeric" placeholder="0"
                          value={student[cat.key] === 0 ? '' : (student[cat.key] ?? '')}
                          onChange={e => handleInputChange(student.id, cat.key, e.target.value)}
                          onBlur={e => handleInputBlur(student.id, cat.key, e.target.value)}
                          onFocus={e => e.target.select()}
                          className="gm-input"
                          style={{ '--focus-color': themeColor }}
                        />
                      </td>
                    ))}
                    <td className="gm-td gm-td--center"><span className={`gm-final ${passed ? 'gm-final--pass' : 'gm-final--fail'}`}>{final}</span></td>
                    <td className="gm-td gm-td--center"><span className={`gm-badge ${passed ? 'gm-badge--pass' : 'gm-badge--fail'}`}>{status}</span></td>
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