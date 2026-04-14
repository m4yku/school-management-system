import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  getGradingCategories, calculateFinalGrade, getGradeStatus,
  normaliseStudent, buildStudentPayload, clampGrade
} from '../../utils/gradingUtils';
import { gradeStyles } from '../../components/shared/GradeManagementStyles';
import { GradeHeader, GradeStats, GradeTable, GradeManagementSkeleton } from '../../components/shared/GradeManagementUI';

const GradeManagement = () => {
  const { classId } = useParams();
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const themeColor = branding?.theme_color || '#6366f1';

  // 🟢 Kinuha na rin natin ang grade_level mula sa location state
  const { subject: stateSubject, section: stateSection, grade_level: stateGradeLevel, fromActivities } = location.state || {};
  const initialQuarter = parseInt(searchParams.get('quarter')) || location.state?.quarter || 1;
  const [selectedQuarter, setSelectedQuarter] = useState(initialQuarter);

  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [allActivities, setAllActivities] = useState([]);

  // 🟢 DYNAMIC LEVEL COMPUTATION (College, SHS, K-10)
  const currentLevel = useMemo(() => {
    const dept = (classInfo?.department || '').toUpperCase();
    const gl = (classInfo?.grade_level || classInfo?.level || stateGradeLevel || '').toUpperCase();
    if (dept === 'COLLEGE' || gl.includes('YEAR') || gl.includes('COLLEGE')) return 'College';
    if (dept === 'SHS' || gl.includes('11') || gl.includes('12')) return 'SHS';
    return 'K-10'; 
  }, [classInfo, stateGradeLevel]);

  const isK12 = currentLevel !== 'College';
  const categories = getGradingCategories(currentLevel);

  // 🟢 DYNAMIC UI LABELS
  const systemLabel = currentLevel === 'College' ? 'College System' : (currentLevel === 'SHS' ? 'SHS System' : 'JHS System');
  const displaySubject = classInfo?.subject_description || classInfo?.subject_name || stateSubject || 'Grade Management';
  const displaySection = classInfo?.section_name || classInfo?.section || stateSection || 'TBA';
  const displayGradeLevel = classInfo?.grade_level || classInfo?.level || stateGradeLevel || 'Grade Level';

  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    try {
      const token = localStorage.getItem('sms_token');
      const params = { class_id: classId };
      if (selectedQuarter && isK12) params.quarter = selectedQuarter;

      const res = await axios.get(`${API_BASE_URL}/teacher/get_class_grades.php`, { params, headers: { Authorization: `Bearer ${token}` } });

      if (res.data.status === 'success') {
        setClassInfo(prev => res.data.class_info || prev);
        setStudents(res.data.data.map(normaliseStudent) || []);
        setIsSubmitted(res.data.class_info?.is_grades_submitted === 1 || res.data.class_info?.is_grades_submitted === true);
        setIsServerOffline(false);
      }
    } catch (err) {
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

      const res = await axios.get(`${API_BASE_URL}/teacher/get_activities.php`, { params, headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') setAllActivities(res.data.data || []);
    } catch (err) {}
  }, [classId, selectedQuarter, isK12, API_BASE_URL]);

  useEffect(() => {
    if (user?.id && classId) { fetchData(true); fetchActivities(); }
  }, [user?.id, classId, selectedQuarter, fetchData, fetchActivities]);

  const actCount = useMemo(() => {
    const k12Map = { written: 'written', quiz: 'written', assignment: 'written', task: 'written', performance: 'performance', exam: 'exam', quarterly_exam: 'exam' };
    const collegeMap = { prelim: 'prelim', midterm: 'midterm', finals: 'finals' };

    return categories.reduce((acc, cat) => {
      acc[cat.key] = allActivities.filter(a => {
        let mappedCat = (a.category ? a.category.toLowerCase() : '');
        mappedCat = isK12 ? (k12Map[mappedCat] || 'written') : (collegeMap[mappedCat] || mappedCat);
        return mappedCat === cat.key;
      }).length;
      return acc;
    }, {});
  }, [allActivities, categories, isK12]);

  const syncFromActivities = async () => {
    if (isSubmitted) return;
    const quarterText = isK12 ? `Quarter ${selectedQuarter}` : 'this class';
    if (!window.confirm(`This will auto-calculate all scores based on recorded activities for ${quarterText}. Continue?`)) return;

    setIsSaving(true); setStatusMsg(null);
    try {
      const token = localStorage.getItem('sms_token');
      const payload = { class_id: parseInt(classId) };
      if (isK12 && selectedQuarter) payload.quarter = selectedQuarter;

      const res = await axios.post(`${API_BASE_URL}/teacher/sync_grades.php`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: `Grades synced successfully for ${quarterText}!` });
        await fetchData(false); await fetchActivities();
      } else throw new Error(res.data.message || 'Sync failed');
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || err.message || 'Unknown error' });
    } finally {
      setIsSaving(false); setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleInputChange = (id, field, value) => {
    if (isSubmitted) return;
    if (value === '') return setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: '' } : s));
    if (/^\d+$/.test(value)) {
      const num = parseInt(value, 10);
      if (num <= 100) setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: num } : s));
    }
  };

  const handleInputBlur = (id, field, value) => {
    if (isSubmitted) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value === '' ? 0 : clampGrade(value) } : s));
  };

  const saveAllGrades = async () => {
    if (isSubmitted) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token');
      const payload = { class_id: parseInt(classId), students: students.map(s => buildStudentPayload(s, currentLevel)) };
      if (isK12 && selectedQuarter) payload.quarter = selectedQuarter;

      const res = await axios.post(`${API_BASE_URL}/teacher/save_grades.php`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') setStatusMsg({ type: 'success', text: 'Draft grades successfully saved!' });
      else throw new Error(res.data.message || 'Save failed');
    } catch (err) { setStatusMsg({ type: 'error', text: err.message || 'Save failed.' }); } 
    finally { setIsSaving(false); setTimeout(() => setStatusMsg(null), 4000); }
  };

  const submitFinalGrades = async () => {
    if (!window.confirm("Are you sure you want to SUBMIT these grades? This locks the gradebook.")) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('sms_token');
      const payload = {
        class_id: parseInt(classId), quarter: isK12 && selectedQuarter ? selectedQuarter : null,
        students: students.map(s => ({
          student_id: s.student_id, final_grade: calculateFinalGrade(s, currentLevel),
          remarks: getGradeStatus(calculateFinalGrade(s, currentLevel), currentLevel),
          ...buildStudentPayload(s, currentLevel)
        }))
      };

      const res = await axios.post(`${API_BASE_URL}/teacher/submit_final_grades.php`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Grades submitted and locked!' });
        setIsSubmitted(true);
      } else throw new Error(res.data.message || 'Submission failed');
    } catch (err) { setStatusMsg({ type: 'error', text: err.message || 'Failed to submit.' }); } 
    finally { setIsSaving(false); setTimeout(() => setStatusMsg(null), 4000); }
  };

  const requestEditPermission = async () => {
    if (!window.confirm("Request permission to unlock grades?")) return;
    setIsRequesting(true);
    try {
      const token = localStorage.getItem('sms_token');
      const payload = { class_id: parseInt(classId), quarter: isK12 && selectedQuarter ? selectedQuarter : null };
      const res = await axios.post(`${API_BASE_URL}/teacher/request_grade_unlock.php`, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.status === 'success') setStatusMsg({ type: 'success', text: 'Unlock request sent.' });
      else throw new Error(res.data.message || 'Request failed');
    } catch (err) { setStatusMsg({ type: 'error', text: err.message || 'Failed to send request.' }); } 
    finally { setIsRequesting(false); setTimeout(() => setStatusMsg(null), 4000); }
  };

  const handleGoBack = () => navigate(fromActivities ? `/teacher/activities/${classId}` : '/teacher/classes');

  const stats = useMemo(() => students.reduce((acc, s) => {
    getGradeStatus(calculateFinalGrade(s, currentLevel), currentLevel) === 'Passed' ? acc.passed++ : acc.failed++;
    return acc;
  }, { passed: 0, failed: 0 }), [students, currentLevel]);

  const passRate = students.length ? Math.round((stats.passed / students.length) * 100) : 0;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return students.filter(s => {
      const matchSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.student_number || '').toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (filterStatus === 'All') return true;
      return getGradeStatus(calculateFinalGrade(s, currentLevel), currentLevel) === filterStatus;
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
      
      <GradeHeader 
        displaySubject={displaySubject} displayGradeLevel={displayGradeLevel} displaySection={displaySection}
        systemLabel={systemLabel} isK12={isK12} selectedQuarter={selectedQuarter} setSelectedQuarter={setSelectedQuarter}
        setSearchParams={setSearchParams} locationState={location.state} themeColor={themeColor} isSubmitted={isSubmitted}
        handleGoBack={handleGoBack} syncFromActivities={syncFromActivities} saveAllGrades={saveAllGrades}
        submitFinalGrades={submitFinalGrades} requestEditPermission={requestEditPermission}
        isSaving={isSaving} isServerOffline={isServerOffline} isRequesting={isRequesting}
      />

      {isServerOffline && <div className="gm-offline-banner"><AlertCircle size={15} /> Server is offline. Showing cached data.</div>}
      
      {statusMsg && (
        <div className={`gm-status gm-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <GradeStats studentsLength={students.length} stats={stats} passRate={passRate} themeColor={themeColor} />

      <GradeTable 
        themeColor={themeColor} categories={categories} actCount={actCount} isK12={isK12} isSubmitted={isSubmitted}
        studentsLength={students.length} filteredStudents={filteredStudents} handleInputChange={handleInputChange}
        handleInputBlur={handleInputBlur} currentLevel={currentLevel} searchQuery={searchQuery}
        setSearchQuery={setSearchQuery} filterStatus={filterStatus} setFilterStatus={setFilterStatus} classInfo={classInfo}
      />
    </div>
  );
};

export default GradeManagement;