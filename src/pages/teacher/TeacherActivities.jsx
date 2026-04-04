import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { getTeacherLevel, getGradingCategories } from '../../utils/gradingUtils';
import {
  Plus, ArrowLeft, Calendar, FileText, CheckCircle,
  AlertCircle, Target, Layers, Filter, X, Edit3, Target as TargetIcon,
  BookOpen, Hash, AlignLeft, School
} from 'lucide-react';
import { activityStyles } from '../../components/shared/activityStyles';
import OfflineBanner from '../../utils/offlinebanner';

// ─── 1. UTILS & CONSTANTS ─────────────────────────────────────────────────────

const quarterLabel = (q) => (q ? `Q${q}` : null);

const quarterColors = {
  1: { bg: '#dbeafe', color: '#1e40af' },
  2: { bg: '#d1fae5', color: '#065f46' },
  3: { bg: '#fef3c7', color: '#92400e' },
  4: { bg: '#ede9fe', color: '#5b21b6' },
};

const MODAL_GLOBAL_STYLES = `
  @keyframes fadeInOverlay { 
    from { opacity: 0; backdrop-filter: blur(0px); } 
    to { opacity: 1; backdrop-filter: blur(6px); } 
  }
  @keyframes popInModal { 
    0% { opacity: 0; transform: scale(0.95) translateY(20px); } 
    100% { opacity: 1; transform: scale(1) translateY(0); } 
  }
  
  .glass-overlay {
    position: fixed; inset: 0; z-index: 100; background: rgba(15, 23, 42, 0.4);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
    animation: fadeInOverlay 0.3s ease-out forwards;
  }
  .glass-modal {
    background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.9); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2);
    border-radius: 1.5rem; width: 100%; animation: popInModal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; overflow: hidden;
  }

  .type-card {
    display: flex; flex-direction: column; text-align: left; padding: 1.5rem; border-radius: 1rem;
    background: rgba(255, 255, 255, 0.6); border: 2px solid transparent; cursor: pointer; transition: all 0.25s ease;
  }
  .type-card:hover { background: #ffffff; transform: translateY(-4px); box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); }
  .type-card.basic:hover { border-color: #cbd5e1; }
  .type-card.exam:hover { border-color: var(--theme-color); }
  .type-icon-wrapper { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }

  /* Modern Inputs UI */
  .glass-input-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .glass-label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
  .input-with-icon { position: relative; display: flex; align-items: center; }
  .input-with-icon.align-top { align-items: flex-start; }
  .input-icon { position: absolute; left: 1rem; color: #94a3b8; pointer-events: none; }
  .pl-10 { padding-left: 2.75rem !important; }
  .pt-3 { padding-top: 0.75rem !important; }
  
  .glass-input-modern {
    width: 100%; padding: 0.85rem 1rem; background: #f8fafc;
    border: 1.5px solid rgba(0, 0, 0, 0.08); border-radius: 0.75rem;
    font-family: inherit; font-size: 0.95rem; color: #1e293b; transition: all 0.2s ease;
  }
  .glass-input-modern:focus {
    outline: none; background: #ffffff; border-color: var(--theme-color);
    box-shadow: 0 0 0 4px var(--theme-color)20;
  }
  .glass-input-modern::placeholder { color: #cbd5e1; }
`;

// ─── 2. SKELETON LOADER COMPONENT ─────────────────────────────────────────────

const ActivitySkeletonCard = ({ themeColor }) => (
  <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm relative overflow-hidden min-h-[220px]">
    <style>{`
      @keyframes dashSkPulse { 
        0% { background-color: ${themeColor}15; } 
        50% { background-color: ${themeColor}30; } 
        100% { background-color: ${themeColor}15; } 
      }
      .dash-sk { animation: dashSkPulse 1.6s ease-in-out infinite; }
    `}</style>
    
    <div className="flex justify-between items-start gap-3">
      <div className="dash-sk" style={{ width: '60%', height: '24px', borderRadius: '8px' }} />
      <div className="dash-sk" style={{ width: '25%', height: '24px', borderRadius: '9999px' }} />
    </div>

    <div className="flex flex-col gap-2 mt-1">
      <div className="dash-sk" style={{ width: '100%', height: '14px', borderRadius: '6px' }} />
      <div className="dash-sk" style={{ width: '80%', height: '14px', borderRadius: '6px' }} />
    </div>

    <div className="flex gap-4 mt-auto pt-4 border-t border-white/50">
      <div className="dash-sk" style={{ width: '35%', height: '16px', borderRadius: '6px' }} />
      <div className="dash-sk" style={{ width: '45%', height: '16px', borderRadius: '6px' }} />
    </div>

    <div className="dash-sk mt-1" style={{ width: '100%', height: '40px', borderRadius: '0.75rem' }} />
  </div>
);

// ─── 3. TYPE SELECTOR MODAL COMPONENT ─────────────────────────────────────────

const TypeSelectorModal = ({ isOpen, onClose, onSelectBasic, onSelectExam, themeColor }) => {
  if (!isOpen) return null;

  return (
    <div className="glass-overlay" onClick={onClose}>
      <div className="glass-modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '2.5rem 2rem', textAlign: 'center' }}>
          <div 
            style={{ 
              width: '56px', height: '56px', background: `${themeColor}15`, 
              color: themeColor, borderRadius: '50%', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' 
            }}
          >
            <Layers size={28} />
          </div>
          
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>What to create?</h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
            Select the type of activity you want to assign to your students.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="type-card basic" onClick={onSelectBasic}>
              <div className="type-icon-wrapper" style={{ background: '#f1f5f9', color: '#475569' }}>
                <Edit3 size={22} />
              </div>
              <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.1rem' }}>Written Work / Task</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Standard assignment. Students submit offline or you manually encode their scores.
              </div>
            </button>

            <button className="type-card exam" style={{ background: `${themeColor}08` }} onClick={onSelectExam}>
              <div className="type-icon-wrapper" style={{ background: themeColor, color: 'white', boxShadow: `0 4px 12px ${themeColor}40` }}>
                <TargetIcon size={22} />
              </div>
              <div style={{ fontWeight: 800, color: themeColor, fontSize: '1.1rem' }}>Interactive Examination</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.4 }}>
                Create a dynamic quiz with multiple choices. The system grades it automatically.
              </div>
            </button>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, 
              cursor: 'pointer', padding: '0.6rem 1.5rem', borderRadius: '0.5rem', transition: 'all 0.2s ease' 
            }} 
            onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }} 
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

// ─── 4. CREATE ACTIVITY MODAL COMPONENT (READ-ONLY CLASS UI) ──────────────────

const CreateActivityModal = ({ isOpen, onClose, formData, setFormData, onSubmit, isSubmitting, selectedClass, modalCategories, isModalKto12, themeColor }) => {
  if (!isOpen) return null;

  return (
    <div className="glass-overlay" onClick={onClose}>
      <div className="glass-modal" style={{ maxWidth: '580px', padding: 0 }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '1.5rem 2rem', background: `linear-gradient(to right, #ffffff, ${themeColor}0A)`, 
          borderBottom: '1px solid rgba(0,0,0,0.05)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: themeColor, color: 'white', padding: '0.5rem', borderRadius: '0.75rem', boxShadow: `0 4px 10px ${themeColor}40` }}>
              <Edit3 size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>New Basic Activity</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '0.1rem' }}>Encode a written work or standard task</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: 'all 0.2s' 
            }} 
            onMouseOver={e => e.currentTarget.style.background = '#f1f5f9'} 
            onMouseOut={e => e.currentTarget.style.background = 'white'}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Read-Only Class Display & Quarter Selection */}
          <div style={{ display: 'grid', gridTemplateColumns: isModalKto12 ? '1fr 1fr' : '1fr', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            
            <div>
              <label className="glass-label"><School size={12} style={{ display: 'inline', marginRight: '4px', marginBottom: '2px' }}/> Assigned Class</label>
              <div 
                style={{ 
                  padding: '0.85rem 1rem', background: '#f8fafc',
                  border: '1.5px solid rgba(0, 0, 0, 0.08)', borderRadius: '0.75rem',
                  fontFamily: 'inherit', fontSize: '0.95rem', color: '#1e293b', fontWeight: 700,
                  display: 'flex', alignItems: 'center'
                }}
              >
                {selectedClass ? `${selectedClass.subject_description} - ${selectedClass.section_name || selectedClass.section}` : 'Loading details...'}
              </div>
            </div>

            {isModalKto12 && (
              <div>
                <label className="glass-label">Academic Quarter <span style={{ color: '#ef4444' }}>*</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                  {[1, 2, 3, 4].map(q => {
                    const qc = quarterColors[q];
                    const selected = String(formData.quarter) === String(q);
                    return (
                      <button
                        key={q} 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, quarter: q }))}
                        style={{
                          padding: '0.75rem 0', borderRadius: '0.75rem',
                          border: selected ? `2px solid ${qc.color}` : '1.5px solid rgba(0,0,0,0.08)',
                          background: selected ? qc.bg : '#f8fafc',
                          color: selected ? qc.color : '#64748b',
                          fontWeight: selected ? 800 : 600, fontSize: '0.9rem', cursor: 'pointer',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
                          transform: selected ? 'scale(1.02)' : 'scale(1)',
                          boxShadow: selected ? `0 6px 12px ${qc.color}30` : 'none'
                        }}
                      >
                        Q{q}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
            <div className="glass-input-group">
              <label className="glass-label">Activity Title</label>
              <div className="input-with-icon">
                <BookOpen size={18} className="input-icon" />
                <input 
                  required type="text" className="glass-input-modern pl-10" placeholder="e.g. Chapter 1 Essay" 
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>
            </div>

            <div className="glass-input-group">
              <label className="glass-label">Grading Category</label>
              <select 
                required className="glass-input-modern" 
                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select...</option>
                {modalCategories.filter(cat => cat.key !== 'performance').map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Score & Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="glass-input-group">
              <label className="glass-label">Max Score</label>
              <div className="input-with-icon">
                <Hash size={18} className="input-icon" />
                <input 
                  required type="number" min="1" className="glass-input-modern pl-10" placeholder="100" 
                  value={formData.max_score} onChange={e => setFormData({ ...formData, max_score: e.target.value })} 
                />
              </div>
            </div>
            
            <div className="glass-input-group">
              <label className="glass-label">Due Date <span style={{fontWeight: 400, textTransform: 'none', color: '#94a3b8'}}>(Optional)</span></label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <input 
                  type="date" className="glass-input-modern pl-10" 
                  value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} 
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="glass-input-group">
            <label className="glass-label">Instructions <span style={{fontWeight: 400, textTransform: 'none', color: '#94a3b8'}}>(Optional)</span></label>
            <div className="input-with-icon align-top">
              <AlignLeft size={18} className="input-icon mt-3" />
              <textarea 
                className="glass-input-modern pl-10 pt-3" placeholder="Enter specific instructions or remarks..." 
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} 
                style={{ minHeight: '90px', resize: 'vertical' }} 
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '0.75rem', transition: 'all 0.2s ease' }} 
              onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }} 
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={isSubmitting} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', background: themeColor, color: 'white', border: 'none', 
                fontWeight: 700, padding: '0.75rem 2rem', borderRadius: '0.75rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', 
                opacity: isSubmitting ? 0.7 : 1, boxShadow: `0 4px 15px ${themeColor}40`, transition: 'all 0.2s ease' 
              }} 
              onMouseDown={e => !isSubmitting && (e.currentTarget.style.transform = 'scale(0.96)')} 
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isSubmitting ? 'Saving...' : <><CheckCircle size={18}/> Save Activity</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// ─── 5. MAIN SCREEN COMPONENT ─────────────────────────────────────────────────

const TeacherActivities = () => {
  const { classId: urlClassId } = useParams();
  const navigate = useNavigate();
  
  const { user, API_BASE_URL, branding } = useAuth();
  const themeColor = branding?.theme_color || '#6366f1';

  // ─── States ───
  const [assignedClasses,  setAssignedClasses]  = useState([]);
  const [viewClassId,      setViewClassId]      = useState(urlClassId || '');
  const [activities,       setActivities]       = useState([]);
  
  // UI & Loading States
  const [isServerOffline,  setIsServerOffline]  = useState(false);
  const [isRetrying,       setIsRetrying]       = useState(false);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isSubmitting,     setIsSubmitting]     = useState(false);
  const [statusMsg,        setStatusMsg]        = useState(null);

  // Modals States
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  
  // Filters States
  const [filterCategory,   setFilterCategory]   = useState('');
  const [filterQuarter,    setFilterQuarter]    = useState('');

  // Form State
  const [formData, setFormData] = useState({
    class_id:    '', title:       '', description: '',
    category:    '', quarter:     '', max_score:   100, due_date:    ''
  });

  // ─── Derived Properties ───
  
  // For the main view
  const selectedClassForView  = assignedClasses.find(c => String(c.id) === String(viewClassId));
  const viewTeacherLevel      = getTeacherLevel(selectedClassForView);
  const viewCategories        = getGradingCategories(viewTeacherLevel);
  const isViewKto12           = viewTeacherLevel !== 'College';

  // For the modal context (based on the current selected header class)
  const selectedClassForModal = assignedClasses.find(c => String(c.id) === String(formData.class_id));
  const modalTeacherLevel     = getTeacherLevel(selectedClassForModal);
  const modalCategories       = getGradingCategories(modalTeacherLevel);
  const isModalKto12          = modalTeacherLevel !== 'College';

  // ─── Effects & Handlers ───

  // 1. Fetch Assigned Classes
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
        setIsServerOffline(true); 
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, [user?.id, API_BASE_URL, viewClassId]);

  // 2. Fetch Activities for Selected Class
  const fetchActivities = useCallback(async (showLoading = true) => {
    if (!viewClassId || viewClassId === 'undefined') return;
    
    if (showLoading) setIsLoading(true);
    setIsRetrying(true);
    
    try {
      const token = localStorage.getItem('sms_token');
      const actRes = await axios.get(`${API_BASE_URL}/teacher/get_activities.php`, {
        params: { 
          class_id: viewClassId, 
          category: filterCategory || undefined,
          quarter: filterQuarter || undefined,
          all: 1 
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (actRes.data.status === 'success') {
        setActivities(actRes.data.data || []);
        setIsServerOffline(false);
      }
    } catch (err) {
      setIsServerOffline(true);
    } finally {
      setTimeout(() => { setIsLoading(false); setIsRetrying(false); }, 800);
    }
  }, [viewClassId, API_BASE_URL, filterCategory, filterQuarter]);

  useEffect(() => { 
    fetchActivities(); 
  }, [fetchActivities]);

  // 3. Dropdown Change Handler
  const handleViewClassChange = (classId) => {
    setViewClassId(classId); 
    setFilterCategory(''); 
    setFilterQuarter('');

    const cls = assignedClasses.find(c => String(c.id) === String(classId));
    const isKto12 = cls ? getTeacherLevel(cls) !== 'College' : true;
    setFormData(prev => ({ ...prev, class_id: classId, category: '', quarter: isKto12 ? '' : '' }));
  };

  // 4. Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isModalKto12 && !formData.quarter) return setStatusMsg({ type: 'error', text: 'Please select a Quarter.' });
    if (!formData.class_id || !formData.category || !formData.title || !user?.id) return setStatusMsg({ type: 'error', text: 'Please complete all required fields.' });

    setIsSubmitting(true); 
    setStatusMsg(null);

    try {
      const token = localStorage.getItem('sms_token');
      const payload = { 
        ...formData, 
        teacher_id: user.id, 
        quarter: isModalKto12 ? parseInt(formData.quarter) : null 
      };
      
      const res = await axios.post(`${API_BASE_URL}/teacher/create_activity.php`, payload, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (res.data.status === 'success') {
        setIsModalOpen(false);
        setFormData(prev => ({ ...prev, title: '', description: '', category: '', quarter: '', max_score: 100, due_date: '' }));
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

  // ─── Render Data ───
  
  // Hide 'performance' category entirely from the list view
  const displayedActivities = activities.filter(act => act.category !== 'performance');

  return (
    <div className="ta-root" style={{ '--theme-color': themeColor }}>
      {/* GLOBAL STYLES INJECTION */}
      <style>{activityStyles(themeColor)}</style>
      <style>{MODAL_GLOBAL_STYLES}</style>

      {/* HEADER SECTION */}
      <div className="ta-header">
        <div className="ta-header-left">
          <button className="ta-back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} color="#64748b" />
          </button>
          <div>
            <h1 className="ta-title">Activities & Examinations</h1>
            <select className="ta-class-selector" value={viewClassId} onChange={(e) => handleViewClassChange(e.target.value)}>
              {assignedClasses.length === 0 && <option value="">Loading classes...</option>}
              {assignedClasses.map(c => (
                <option key={c.id} value={c.id}>{c.subject_description} • {c.section_name || c.section}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="ta-add-btn" onClick={() => setShowTypeSelector(true)}>
          <Plus size={16} /> Create Activity
        </button>
      </div>

      <OfflineBanner isServerOffline={isServerOffline} isRetrying={isRetrying} onRetry={() => fetchActivities(false)} />
      
      {statusMsg && (
        <div className={`ta-status ta-status--${statusMsg.type}`}>
          {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* MAIN CONTAINER SECTION */}
      <div className="ta-container">
        
        <div className="ta-container-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="ta-container-title"><Layers size={18} color={themeColor} /> Class Activities</h2>
          
          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={14} color="#64748b" />
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)} 
              className="ta-select" 
              style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
            >
              <option value="">All Categories</option>
              {viewCategories.filter(cat => cat.key !== 'performance').map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
            
            {isViewKto12 && (
              <select 
                value={filterQuarter} 
                onChange={e => setFilterQuarter(e.target.value)} 
                className="ta-select" 
                style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
              >
                <option value="">All Quarters</option>
                <option value="1">Quarter 1</option>
                <option value="2">Quarter 2</option>
                <option value="3">Quarter 3</option>
                <option value="4">Quarter 4</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Display */}
        {isLoading ? (
          <div className="ta-grid">
            {[1, 2, 3, 4].map((n) => <ActivitySkeletonCard key={n} themeColor={themeColor} />)}
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="ta-empty-state">
            <div className="ta-empty-icon"><FileText size={24} /></div>
            <div>
              <p className="ta-empty-title">No activities found</p>
              <p className="ta-empty-desc">Click "Create Activity" to assign a task or adjust your filters.</p>
            </div>
          </div>
        ) : (
          <div className="ta-grid">
            {displayedActivities.map(act => {
              const qNum = act.quarter ? parseInt(act.quarter) : null;
              const qColors = qNum ? quarterColors[qNum] : null;
              
              return (
                <div key={act.id} className="ta-card">
                  <div className="ta-card-header">
                    <h3 className="ta-card-title">{act.title}</h3>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span className="ta-badge">{viewCategories.find(c => c.key === act.category)?.label || act.category}</span>
                      {qNum && (
                        <span style={{ padding: '0.25rem 0.65rem', borderRadius: '2rem', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px', backgroundColor: qColors.bg, color: qColors.color }}>
                          {quarterLabel(qNum)} Quarter
                        </span>
                      )}
                    </div>
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
                        section: selectedClassForView?.section_name || selectedClassForView?.section, 
                        quarter: qNum 
                      } 
                    })}
                  >
                    Grade Submissions
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALS RENDERING */}
      <TypeSelectorModal 
        isOpen={showTypeSelector} 
        onClose={() => setShowTypeSelector(false)} 
        onSelectBasic={() => { setShowTypeSelector(false); setIsModalOpen(true); }}
        onSelectExam={() => { setShowTypeSelector(false); navigate('/teacher/activities/create-exam', { state: { classId: viewClassId } }); }}
        themeColor={themeColor}
      />

      <CreateActivityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        formData={formData} 
        setFormData={setFormData}
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
        selectedClass={selectedClassForModal} 
        modalCategories={modalCategories}
        isModalKto12={isModalKto12}
        themeColor={themeColor}
      />

    </div>
  );
};

export default TeacherActivities;