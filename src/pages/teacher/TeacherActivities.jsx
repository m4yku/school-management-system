import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getTeacherLevel, getGradingCategories } from '../../utils/gradingUtils';
import {
  Plus, ArrowLeft, Calendar, FileText, CheckCircle,
  AlertCircle, Target, Layers
} from 'lucide-react';
import { activityStyles } from '../../components/shared/activityStyles';

// INI-IMPORT NA NATIN ANG SHARED OFFLINE BANNER
import OfflineBanner from '../../utils/offlinebanner'; 

// ─── Premium Skeleton Card (Kapareho ng TeacherSubjects) ──────────────────────
const ActivitySkeletonCard = ({ themeColor }) => (
  <div style={{
    background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.8)', borderRadius: '1rem',
    padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
    position: 'relative', overflow: 'hidden', minHeight: '200px'
  }}>
    <style>{`
      @keyframes actSkPulse {
        0% { background-color: ${themeColor}12; }
        50% { background-color: ${themeColor}2e; }
        100% { background-color: ${themeColor}12; }
      }
      .act-sk { animation: actSkPulse 1.6s ease-in-out infinite; border-radius: 6px; }
    `}</style>

    {/* Header row: title + badge */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
      <div className="act-sk" style={{ width: '60%', height: '22px', borderRadius: '8px' }} />
      <div className="act-sk" style={{ width: '25%', height: '22px', borderRadius: '1rem' }} />
    </div>

    {/* Description lines */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
      <div className="act-sk" style={{ width: '100%', height: '14px' }} />
      <div className="act-sk" style={{ width: '80%', height: '14px' }} />
    </div>

    {/* Meta row */}
    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
      <div className="act-sk" style={{ width: '35%', height: '14px' }} />
      <div className="act-sk" style={{ width: '40%', height: '14px' }} />
    </div>

    {/* Button */}
    <div className="act-sk" style={{ width: '100%', height: '38px', borderRadius: '0.75rem', marginTop: '0.5rem' }} />
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const TeacherActivities = () => {
  const { classId: urlClassId } = useParams();
  const { user, API_BASE_URL, branding } = useAuth();
  const navigate = useNavigate();
  const themeColor = branding?.theme_color || '#6366f1';

  const [assignedClasses, setAssignedClasses] = useState([]);
  const [viewClassId, setViewClassId] = useState(urlClassId || '');
  const [activities, setActivities] = useState([]);
  
  // Offline State Variables
  const [isServerOffline, setIsServerOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // FIX: isLoading starts as true and waits for classes first
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const [formData, setFormData] = useState({
    class_id: '',
    title: '',
    description: '',
    category: '',
    max_score: 100,
    due_date: ''
  });

  // Fetch Teacher's Assigned Classes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!user?.id) return;
      try {
        const token = localStorage.getItem('sms_token');
        const res = await axios.get(`${API_BASE_URL}/teacher/get_my_schedule.php`, {
          params: { teacher_id: user.id },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.status === 'success') {
          const classes = res.data.data;
          setAssignedClasses(classes);
          setIsServerOffline(false);
          
          // FIX: Stop loading immediately if there are NO classes assigned at all
          if (classes.length === 0) {
            setIsLoading(false);
          } else if (!viewClassId && classes.length > 0) {
            setViewClassId(classes[0].id);
            setFormData(prev => ({ ...prev, class_id: classes[0].id }));
          } else if (viewClassId && viewClassId !== 'undefined') {
            setFormData(prev => ({ ...prev, class_id: viewClassId }));
          }
        }
      } catch (err) {
        console.error("Failed to load classes", err);
        setIsServerOffline(true);
        setIsLoading(false); // Stop loading on error
      }
    };
    fetchClasses();
  }, [user?.id, API_BASE_URL, viewClassId]);

  // Fetch Activities
  const fetchActivities = useCallback(async (showLoading = true) => {
    if (!viewClassId || viewClassId === 'undefined') {
      // FIX: Tinanggal ang setIsLoading(false) dito para hindi mamatay agad ang skeleton
      // habang kinukuha pa lang yung viewClassId mula sa unang useEffect.
      return;
    }
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);
    try {
      const token = localStorage.getItem('sms_token');
      const actRes = await axios.get(`${API_BASE_URL}/teacher/get_activities.php`, {
        params: { class_id: viewClassId },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (actRes.data.status === 'success') {
        setActivities(actRes.data.data || []);
        setIsServerOffline(false);
      }
    } catch (err) {
      console.error("Failed to load activities", err);
      setIsServerOffline(true);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsRetrying(false);
      }, 800);
    }
  }, [viewClassId, API_BASE_URL]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const selectedClassForModal = assignedClasses.find(c => String(c.id) === String(formData.class_id));
  const modalTeacherLevel = getTeacherLevel(selectedClassForModal);
  const modalCategories = getGradingCategories(modalTeacherLevel);

  const selectedClassForView = assignedClasses.find(c => String(c.id) === String(viewClassId));
  const viewTeacherLevel = getTeacherLevel(selectedClassForView);
  const viewCategories = getGradingCategories(viewTeacherLevel);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.class_id || !formData.category || !formData.title || !user?.id) {
      setStatusMsg({ type: 'error', text: 'Please complete all required fields properly.' });
      return;
    }
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('sms_token');
      const res = await axios.post(`${API_BASE_URL}/teacher/create_activity.php`, {
        ...formData,
        teacher_id: user.id
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data.status === 'success') {
        setIsModalOpen(false);
        setFormData({ ...formData, title: '', description: '', category: '', max_score: 100, due_date: '' });
        setStatusMsg({ type: 'success', text: 'Activity successfully saved!' });
        if (String(formData.class_id) === String(viewClassId)) {
          fetchActivities(false);
        } else {
          setViewClassId(formData.class_id);
        }
      } else {
        setStatusMsg({ type: 'error', text: res.data.message || "Failed to create activity." });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="ta-root">
      <style>{activityStyles(themeColor)}</style>

      {/* HEADER */}
      <div className="ta-header">
        <div className="ta-header-left">
          <button className="ta-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} color="#64748b" />
          </button>
          <div>
            <h1 className="ta-title">Written Works & Tasks</h1>
            <select
              className="ta-class-selector"
              value={viewClassId}
              onChange={(e) => setViewClassId(e.target.value)}
            >
              {assignedClasses.length === 0 && <option value="">Loading classes...</option>}
              {assignedClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.subject_description} • {c.section_name || c.section}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button className="ta-add-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Create Activity
        </button>
      </div>

      {/* SHARED OFFLINE BANNER */}
      <OfflineBanner
        isServerOffline={isServerOffline}
        isRetrying={isRetrying}
        onRetry={() => fetchActivities(false)}
      />

      {statusMsg && (
        <div className={`ta-status ta-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="ta-container">
        <div className="ta-container-header">
          <h2 className="ta-container-title">
            <Layers size={18} color={themeColor} /> Class Activities
          </h2>
        </div>

        {isLoading ? (
          <div className="ta-grid">
            {[1, 2, 3, 4].map((n) => (
              <ActivitySkeletonCard key={n} themeColor={themeColor} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="ta-empty-state">
            <div className="ta-empty-icon"><FileText size={24} /></div>
            <div>
              <p className="ta-empty-title">No activities found</p>
              <p className="ta-empty-desc">Click "Create Activity" to assign a task to this class.</p>
            </div>
          </div>
        ) : (
          <div className="ta-grid">
            {activities.map(act => (
              <div key={act.id} className="ta-card">
                <div className="ta-card-header">
                  <h3 className="ta-card-title">{act.title}</h3>
                  <span className="ta-badge">
                    {viewCategories.find(c => c.key === act.category)?.label || act.category}
                  </span>
                </div>
                <p className="ta-card-desc">{act.description || 'No description provided.'}</p>
                <div className="ta-card-meta">
                  <div className="ta-meta-item"><Target size={14} color={themeColor} /> {act.max_score} pts</div>
                  <div className="ta-meta-item"><Calendar size={14} color="#f59e0b" /> {act.due_date ? new Date(act.due_date).toLocaleDateString() : 'No Due Date'}</div>
                </div>
                <button
                  className="ta-grade-btn"
                  onClick={() => navigate(`/teacher/activities/${act.id}/grading`, {
                    state: {
                      subject: selectedClassForView?.subject_description,
                      section: selectedClassForView?.section_name || selectedClassForView?.section
                    }
                  })}
                >
                  Grade Submissions
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="ta-modal-overlay">
          <div className="ta-modal">
            <h2 className="ta-modal-title">Create New Activity</h2>
            <form onSubmit={handleSubmit}>
              <div className="ta-form-group">
                <label className="ta-label">Assign to Class</label>
                <select required className="ta-select" value={formData.class_id} onChange={e => setFormData({ ...formData, class_id: e.target.value, category: '' })}>
                  <option value="" disabled>Select Section & Subject...</option>
                  {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.subject_description} - {c.section_name || c.section}</option>)}
                </select>
              </div>
              <div className="ta-form-group">
                <label className="ta-label">Activity Title</label>
                <input required type="text" className="ta-input" placeholder="e.g. Chapter 1 Quiz" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="ta-form-group">
                <label className="ta-label">Category</label>
                <select required className="ta-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="" disabled>Select Grading Category...</option>
                  {modalCategories.map(cat => <option key={cat.key} value={cat.key}>{cat.label} ({cat.percentage})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="ta-form-group" style={{ flex: 1 }}>
                  <label className="ta-label">Max Score</label>
                  <input required type="number" min="1" className="ta-input" value={formData.max_score} onChange={e => setFormData({ ...formData, max_score: e.target.value })} />
                </div>
                <div className="ta-form-group" style={{ flex: 1 }}>
                  <label className="ta-label">Due Date (Optional)</label>
                  <input type="date" className="ta-input" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                </div>
              </div>
              <div className="ta-form-group">
                <label className="ta-label">Description / Instructions</label>
                <textarea className="ta-textarea" placeholder="Instructions for the students..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="ta-modal-actions">
                <button type="button" className="ta-cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="ta-add-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherActivities;