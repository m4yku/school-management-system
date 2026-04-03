import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft, Save, CheckCircle, AlertCircle,
  Eye, ExternalLink, FileText, X, BookOpen, Users, AlignLeft,
  WifiOff, RefreshCw
} from 'lucide-react';
import { gradingStyles } from '../../components/shared/gradingStyles';

// ─── Inline Offline Banner ────────────────────────────────────────────────────
const GradingOfflineBanner = ({ isServerOffline, isRetrying, onRetry }) => {
  if (!isServerOffline) return null;
  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(12px)',
      border: '1px solid rgba(251,191,36,0.5)', borderRadius: '0.85rem',
      padding: '0.75rem 1rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg,#f59e0b,#ef4444,#f59e0b)', opacity: 0.8 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.4rem', background: 'rgba(251,191,36,0.15)', borderRadius: '0.5rem', border: '1px solid rgba(251,191,36,0.3)', display: 'flex' }}>
          <WifiOff size={15} color="#b45309" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Database Offline</p>
          <p style={{ margin: 0, fontSize: '0.68rem', color: '#a16207', fontWeight: 500 }}>Cannot connect. Scores may not be saved.</p>
        </div>
      </div>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.4rem 0.9rem', background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(251,191,36,0.4)', borderRadius: '0.6rem',
          fontSize: '0.7rem', fontWeight: 700, color: '#92400e', cursor: 'pointer',
          opacity: isRetrying ? 0.6 : 1
        }}
      >
        <RefreshCw size={12} style={{ animation: isRetrying ? 'spin 1s linear infinite' : 'none' }} />
        {isRetrying ? 'Reconnecting...' : 'Retry'}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─── Skeleton Loading ─────────────────────────────────────────────────────────
const GradingSkeleton = ({ themeColor }) => (
  <div className="tag-root">
    <style>{`
      @keyframes gradSkPulse {
        0% { background-color: ${themeColor}12; }
        50% { background-color: ${themeColor}2e; }
        100% { background-color: ${themeColor}12; }
      }
      .grd-sk { animation: gradSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }
    `}</style>

    {/* Header skeleton */}
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '1rem 1.25rem', borderRadius: '1.25rem',
      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
        {/* Back button skeleton */}
        <div className="grd-sk" style={{ width: '38px', height: '38px', borderRadius: '0.75rem', flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="grd-sk" style={{ width: '120px', height: '12px' }} />
          <div className="grd-sk" style={{ width: '220px', height: '22px' }} />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <div className="grd-sk" style={{ width: '80px', height: '20px', borderRadius: '2rem' }} />
            <div className="grd-sk" style={{ width: '110px', height: '20px', borderRadius: '2rem' }} />
          </div>
          <div className="grd-sk" style={{ width: '340px', maxWidth: '100%', height: '52px', borderRadius: '0.75rem', marginTop: '0.25rem' }} />
        </div>
      </div>
      {/* Save button skeleton */}
      <div className="grd-sk" style={{ width: '120px', height: '40px', borderRadius: '0.75rem', flexShrink: 0 }} />
    </div>

    {/* Table skeleton */}
    <div style={{
      background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)',
      borderRadius: '1.25rem', padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
    }}>
      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1.5px solid rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
        {['STUDENT NAME', 'SUBMISSION', 'SCORE', 'STATUS'].map(col => (
          <div key={col} className="grd-sk" style={{ height: '14px', width: col === 'STUDENT NAME' ? '60%' : '50%', margin: col !== 'STUDENT NAME' ? '0 auto' : '0' }} />
        ))}
      </div>

      {/* Table rows */}
      {[1, 2, 3, 4, 5, 6].map(n => (
        <div key={n} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.8rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', alignItems: 'center' }}>
          {/* Student cell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="grd-sk" style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div className="grd-sk" style={{ width: '120px', height: '13px' }} />
              <div className="grd-sk" style={{ width: '70px', height: '11px' }} />
            </div>
          </div>
          {/* Submission */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="grd-sk" style={{ width: '60px', height: '28px', borderRadius: '0.5rem' }} />
          </div>
          {/* Score input */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="grd-sk" style={{ width: '60px', height: '34px', borderRadius: '0.6rem' }} />
          </div>
          {/* Status badge */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="grd-sk" style={{ width: '72px', height: '24px', borderRadius: '2rem' }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const TeacherActivityGrading = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const { subject, section } = location.state || {};

  const { API_BASE_URL, branding } = useAuth();
  const themeColor = branding?.theme_color || '#6366f1';

  const [activity, setActivity] = useState(null);
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

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
      setTimeout(() => {
        setIsLoading(false);
        setIsRetrying(false);
      }, 800);
    }
  }, [activityId, API_BASE_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScoreChange = (studentId, value) => {
    if (value === '') {
      setScores(prev => prev.map(s => s.student_id === studentId ? { ...s, score: '' } : s));
      return;
    }
    if (/^\d+$/.test(value)) {
      const numValue = parseInt(value, 10);
      const maxScore = activity?.max_score ? parseInt(activity.max_score, 10) : 100;
      if (numValue >= 0 && numValue <= maxScore) {
        setScores(prev => prev.map(s => s.student_id === studentId ? { ...s, score: numValue } : s));
      }
    }
  };

  const saveScores = async () => {
    const isConfirmed = window.confirm(
      "Are you sure you want to save the scores for this activity? This will update the students' records."
    );
    if (!isConfirmed) return;

    setIsSaving(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('sms_token');
      const scoresToSave = scores.filter(s => s.score !== '').map(s => ({
        student_id: s.student_id,
        score: s.score
      }));
      const res = await axios.post(`${API_BASE_URL}/teacher/save_activity_scores.php`, {
        activity_id: activityId,
        scores: scoresToSave
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.status === 'success') {
        setStatusMsg({ type: 'success', text: 'Scores updated successfully!' });
        fetchData(false);
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to update scores.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network Error.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  if (isLoading) return (
    <>
      <style>{gradingStyles(themeColor)}</style>
      <GradingSkeleton themeColor={themeColor} />
    </>
  );

  return (
    <div className="tag-root">
      <style>{gradingStyles(themeColor)}</style>

      {/* HEADER */}
      <div className="tag-header" style={{ alignItems: 'flex-start' }}>
        <div className="tag-header-info" style={{ alignItems: 'flex-start' }}>
          <button className="tag-back-btn" onClick={() => navigate(-1)} style={{ marginTop: '0.25rem' }}>
            <ArrowLeft size={18} color="#64748b" />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <BookOpen size={12} />
              <span>{subject || 'Subject'}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span>{section || 'Section'}</span>
            </div>

            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {activity?.title}
            </h1>

            <div className="tag-badge-group" style={{ marginBottom: '0.75rem' }}>
              <span className="tag-badge">{activity?.category}</span>
              <span className="tag-badge" style={{ color: themeColor }}>Max Score: {activity?.max_score && Math.round(activity.max_score)}</span>
            </div>

            {activity?.description && (
              <div style={{ display: 'flex', gap: '0.5rem', color: '#475569', backgroundColor: 'rgba(255,255,255,0.6)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(0,0,0,0.05)', maxWidth: '600px' }}>
                <AlignLeft size={16} color={themeColor} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <p style={{ margin: 0, fontSize: '0.8rem', lineHeight: '1.5' }}>
                  {activity.description}
                </p>
              </div>
            )}
          </div>
        </div>
        <button className="tag-save-btn" onClick={saveScores} disabled={isSaving}>
          <Save size={16} /> {isSaving ? 'Saving...' : 'Save Scores'}
        </button>
      </div>

      {/* OFFLINE BANNER */}
      <GradingOfflineBanner
        isServerOffline={isServerOffline}
        isRetrying={isRetrying}
        onRetry={() => fetchData(false)}
      />

      {statusMsg && (
        <div className={`tag-status tag-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TABLE */}
      <div className="tag-container">
        <table className="tag-table">
          <thead>
            <tr>
              <th className="tag-th">STUDENT NAME</th>
              <th className="tag-th" style={{ textAlign: 'center' }}>SUBMISSION</th>
              <th className="tag-th" style={{ textAlign: 'center' }}>SCORE</th>
              <th className="tag-th" style={{ textAlign: 'center' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {scores.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem auto' }} />
                  <p style={{ color: '#475569', fontWeight: 700, fontSize: '1rem', margin: '0 0 0.5rem 0' }}>No Students Found</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>There are no students enrolled in this class yet.</p>
                </td>
              </tr>
            ) : scores.map(s => {
              const status = s.status || 'Pending';
              let badgeBg = '#f1f5f9', badgeColor = '#475569';
              if (status === 'Graded') { badgeBg = '#d1fae5'; badgeColor = '#065f46'; }
              else if (status === 'Submitted') { badgeBg = '#dbeafe'; badgeColor = '#1e40af'; }

              return (
                <tr key={s.student_id}>
                  <td className="tag-td">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: themeColor }}>
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s.student_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tag-td" style={{ textAlign: 'center' }}>
                    {s.submission_content ? (
                      <button className="tag-view-btn" onClick={() => setSelectedSubmission({ name: s.name, content: s.submission_content, type: s.submission_type })}>
                        <Eye size={14} /> View
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 600 }}>No Submission</span>
                    )}
                  </td>
                  <td className="tag-td" style={{ textAlign: 'center' }}>
                    <input
                      type="text" inputMode="numeric" placeholder="0"
                      className="tag-input"
                      value={s.score}
                      onChange={(e) => handleScoreChange(s.student_id, e.target.value)}
                    />
                  </td>
                  <td className="tag-td" style={{ textAlign: 'center' }}>
                    <span style={{ display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px', backgroundColor: badgeBg, color: badgeColor }}>
                      {status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* VIEW SUBMISSION MODAL */}
      {selectedSubmission && (
        <div className="tag-modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="tag-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Student Submission</h2>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{selectedSubmission.name}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.6)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)' }}>
              {selectedSubmission.type === 'text' ? (
                <p style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', margin: 0, lineHeight: '1.5' }}>
                  {selectedSubmission.content}
                </p>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <FileText size={48} color={themeColor} style={{ marginBottom: '1rem', opacity: 0.8 }} />
                  <p style={{ fontWeight: 700, margin: '0 0 1rem 0', color: '#1e293b' }}>
                    {selectedSubmission.content ? "File Attached" : "No file submitted"}
                  </p>
                  {selectedSubmission.content && (
                    <a href={`${API_BASE_URL}/uploads/submissions/${selectedSubmission.content}`} target="_blank" rel="noreferrer" className="tag-save-btn" style={{ display: 'inline-flex', textDecoration: 'none', width: 'auto', margin: '0 auto' }}>
                      <ExternalLink size={16} /> Open/Download File
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherActivityGrading;