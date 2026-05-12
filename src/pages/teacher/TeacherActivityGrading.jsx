import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Context at Styles
import { useAuth } from '../../context/AuthContext';
import { gradingStyles } from '../../components/shared/gradingStyles';

// 🟢 ITO YUNG IMPORT NG MGA UI COMPONENTS NA GINAWA NATIN
import {
  GradingSkeleton,
  GradeExamSubmissionModal,
  ViewSubmissionModal,
  GradingOfflineBanner,
  GradingHeader,
  GradingTable
} from '../../components/shared/TeacherActivityGradingUI';

const quarterColors = {
  1: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  2: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  3: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  4: { bg: '#ede9fe', color: '#5b21b6', border: '#c4b5fd' },
};

const TeacherActivityGrading = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Ibalik natin ito para makuha ang API URL at kulay
  const { API_BASE_URL, branding } = useAuth();
  const themeColor = branding?.theme_color || '#6366f1';

  const { subject, section } = location.state || {}; // Inalis natin ang quarter dito

  // ISANG BESES LANG IDE-DECLARE ANG MGA STATES
  const [activity, setActivity] = useState(null);
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const [gradingExamStudent, setGradingExamStudent] = useState(null);
  const [viewingWrittenWork, setViewingWrittenWork] = useState(null);
  const [toast, setToast] = useState(null);

  // 🟢 DITO NA NATIN KUKUNIN ANG QUARTER MISMO SA ACTIVITY DATA
  const activeQuarter = activity?.quarter || null;
  const qNum = activeQuarter ? parseInt(activeQuarter) : null;
  const qColors = qNum ? quarterColors[qNum] : null;

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); // 5 seconds
  };

  const handleToggleAllowLate = async () => {
    try {
      const token = localStorage.getItem('sms_token');
      const newValue = activity?.allow_late ? 0 : 1;

      const res = await axios.post(`${API_BASE_URL}/teacher/update_activity.php`, {
        activity_id: activityId,
        allow_late: newValue
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.status === 'success') {
        setActivity(prev => ({ ...prev, allow_late: newValue }));
        showToast(
          newValue ? 'success' : 'blocked',
          newValue ? 'Late submissions are now ALLOWED' : 'Late submissions are now BLOCKED'
        );
      } else {
        showToast('error', res.data.message || 'Failed to update.');
      }
    } catch (err) {
      showToast('error', 'Failed to update setting.');
    }
  };

  const fetchData = useCallback(async (showLoading = true) => {
    if (!activityId || activityId === 'undefined') return;
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);
    try {
      const token = localStorage.getItem('sms_token');
      const res = await axios.get(`${API_BASE_URL}/teacher/get_activity_scores.php`, {
        params: { activity_id: activityId },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.status === 'success') {
        setActivity(res.data.activity);
        const formattedScores = (res.data.scores || []).map(s => ({
          ...s,
          score: (s.score !== null && s.score !== '') ? Math.round(parseFloat(s.score)) : ''
        }));
        setScores(formattedScores);
        setIsServerOffline(false);
      }
    } catch (err) {
      console.error("Failed fetching activity scores", err);
      setIsServerOffline(true);
    } finally {
      setTimeout(() => { setIsLoading(false); setIsRetrying(false); }, 800);
    }
  }, [activityId, API_BASE_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isLoading) return (
    <>
      <style>{gradingStyles(themeColor)}</style>
      <GradingSkeleton themeColor={themeColor} />
    </>
  );

  const isActivityAnExam = activity?.category === 'exam' || activity?.type === 'exam' || activity?.category === 'quarterly_exam';

  return (
    <div className="tag-root">
      <style>{gradingStyles(themeColor)}</style>
      {/* 🔴 TOAST NOTIFICATION */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          padding: '0.7rem 1.4rem',
          borderRadius: '3rem',
          background: toast.type === 'success'
            ? 'rgba(209, 250, 229, 0.9)'
            : toast.type === 'blocked'
              ? 'rgba(254, 226, 226, 0.9)'
              : 'rgba(241, 245, 249, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: toast.type === 'success'
            ? '1px solid rgba(110, 231, 183, 0.7)'
            : toast.type === 'blocked'
              ? '1px solid rgba(252, 165, 165, 0.7)'
              : '1px solid rgba(203, 213, 225, 0.7)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'toastSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1), toastFadeOut 0.5s ease-out 4.5s forwards',
          maxWidth: '400px'
        }}>
          {/* Icon */}
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: toast.type === 'success'
              ? '#10b981'
              : toast.type === 'blocked'
                ? '#ef4444'
                : '#94a3b8',
            color: 'white',
            fontSize: '0.75rem',
            flexShrink: 0,
            fontWeight: 700
          }}>
            {toast.type === 'success' ? '✓' : toast.type === 'blocked' ? '✕' : '!'}
          </div>

          {/* Message */}
          <span style={{
            fontWeight: 600,
            fontSize: '0.85rem',
            color: toast.type === 'success' ? '#065f46' : toast.type === 'blocked' ? '#991b1b' : '#475569',
            lineHeight: 1.4,
            whiteSpace: 'nowrap'
          }}>
            {toast.message}
          </span>

          {/* Close button */}
          <button
            onClick={() => setToast(null)}
            style={{
              marginLeft: '0.25rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: toast.type === 'success' ? '#065f46' : toast.type === 'blocked' ? '#991b1b' : '#94a3b8',
              fontSize: '1rem',
              fontWeight: 700,
              padding: '0.25rem',
              opacity: 0.5,
              transition: 'opacity 0.2s',
              borderRadius: '50%',
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={e => e.currentTarget.style.opacity = '1'}
            onMouseOut={e => e.currentTarget.style.opacity = '0.5'}
          >
            ✕
          </button>
        </div>
      )}

      {/* Toast animations */}
      <style>{`
  @keyframes toastSlideUp {
    from { 
      transform: translateY(30px) scale(0.95); 
      opacity: 0; 
    }
    to { 
      transform: translateY(0) scale(1); 
      opacity: 1; 
    }
  }
  
  @keyframes toastFadeOut {
    from { 
      transform: translateY(0) scale(1); 
      opacity: 1; 
    }
    to { 
      transform: translateY(10px) scale(0.95); 
      opacity: 0; 
    }
  }
`}</style>

      {/* MODALS */}
      {gradingExamStudent && (
        <GradeExamSubmissionModal
          studentId={gradingExamStudent.student_id} activityId={activityId} classId={activity?.class_id}
          quarter={activeQuarter} studentName={gradingExamStudent.name} themeColor={themeColor} API_BASE_URL={API_BASE_URL}
          onClose={() => setGradingExamStudent(null)} onRefresh={() => fetchData(false)}
        />
      )}

      {viewingWrittenWork && (
        <ViewSubmissionModal
          studentId={viewingWrittenWork.student_id} activityId={activityId} classId={activity?.class_id}
          quarter={activeQuarter} studentName={viewingWrittenWork.name} maxScore={activity?.max_score}
          submission={{ type: viewingWrittenWork.submission_type || 'text', content: viewingWrittenWork.submission_content }}
          currentScore={viewingWrittenWork.score} onRefresh={() => fetchData(false)} onClose={() => setViewingWrittenWork(null)}
          themeColor={themeColor} API_BASE_URL={API_BASE_URL}
        />
      )}

      {/* UI COMPONENTS */}
      <GradingHeader
        navigate={navigate}
        themeColor={themeColor}
        subject={subject}
        section={section}
        activity={activity}
        qNum={qNum}
        qColors={qColors}
        onToggleAllowLate={handleToggleAllowLate}
      />

      <GradingOfflineBanner
        isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchData(false)}
      />

      <GradingTable
        scores={scores} themeColor={themeColor} activity={activity} isActivityAnExam={isActivityAnExam}
        setGradingExamStudent={setGradingExamStudent} setViewingWrittenWork={setViewingWrittenWork}
      />
    </div>
  );
};

export default TeacherActivityGrading;