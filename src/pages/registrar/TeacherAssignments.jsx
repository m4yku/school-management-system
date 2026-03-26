import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  GraduationCap, Plus, Search, BookOpen, Clock, 
  MapPin, Users, Edit, Trash2, X, CheckCircle, RefreshCw, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// CONSTANTS
const GRADE_LEVEL_OPTIONS = {
  K12: [
    'Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 
    'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ],
  HIGHER: [
    'Grade 11', 'Grade 12', 
    '1st Year College', '2nd Year College', '3rd Year College', '4th Year College'
  ]
};

const DAYS_MAPPING = [
  { label: 'M', full: 'Monday' },
  { label: 'T', full: 'Tuesday' },
  { label: 'W', full: 'Wednesday' },
  { label: 'Th', full: 'Thursday' },
  { label: 'F', full: 'Friday' },
  { label: 'S', full: 'Saturday' },
];

const TeacherAssignments = () => {
  const { branding, token, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // UI & Schedule States
  const [availableGradeLevels, setAvailableGradeLevels] = useState(GRADE_LEVEL_OPTIONS.K12);
  const [selectedDays, setSelectedDays] = useState([]);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");

  const initialForm = {
    teacher_id: '',
    subject_id: '',
    grade_level: 'Kinder',
    section: '',
    room: '',
    schedule: '',
    school_year: '2025-2026',
    is_active: 1
  };
  const [formData, setFormData] = useState(initialForm);

  // --- FETCH DATA ---
  const fetchAssignmentData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/registrar/get_assignment_data.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setTeachers(res.data.teachers || []);
        setSubjects(res.data.subjects || []);
        setAssignments(res.data.assignments || []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignmentData(); }, []);

  // --- RESET & CLOSE ---
  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData(initialForm);
    setSelectedDays([]);
    setStartTime("08:00");
    setEndTime("09:00");
    setAvailableGradeLevels(GRADE_LEVEL_OPTIONS.K12); 
  };

  // --- EDIT LOGIC ---
  const handleEditClick = (item) => {
    // 1. Hanapin muna ang educational_level ng subject para sa modal
    const sub = subjects.find(s => s.id === parseInt(item.subject_id));
    if (sub) {
      setAvailableGradeLevels(sub.educational_level === 'HIGHER' ? GRADE_LEVEL_OPTIONS.HIGHER : GRADE_LEVEL_OPTIONS.K12);
    }

    // 2. I-set ang form data
    setEditId(item.id);
    setFormData({
      teacher_id: item.teacher_id,
      subject_id: item.subject_id,
      grade_level: item.grade,
      section: item.section,
      room: item.room,
      schedule: item.schedule,
      school_year: item.school_year || '2025-2026',
      is_active: 1
    });

    // 3. Parse Schedule Days (e.g., "MW 08:00 am - 10:00 am")
    try {
      const parts = item.schedule.split(' ');
      const days = parts[0].match(/[A-Z][a-z]*/g) || [];
      setSelectedDays(days);
    } catch(e) { setSelectedDays([]); }

    setShowModal(true);
  };

  // --- DELETE LOGIC ---
  const confirmDelete = async () => {
    setSaveLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/delete_assignment.php`, 
        { id: deleteTarget }, 
        { headers: { Authorization: `Bearer ${token}` }}
      );
      if (res.data.success) {
        fetchAssignmentData();
        setShowDeleteModal(false);
      }
    } catch (error) { alert("Deactivation failed."); }
    finally { setSaveLoading(false); }
  };

  // --- TIME & SCHEDULE LOGIC ---
  const formatTime12h = (time) => {
    if (!time) return '';
    let [h, m] = time.split(':');
    let ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const updateScheduleString = useCallback((days, start, end) => {
    if (days.length === 0) {
      setFormData(prev => ({ ...prev, schedule: '' }));
      return;
    }
    const scheduleStr = `${days.join('')} ${formatTime12h(start)} - ${formatTime12h(end)}`;
    setFormData(prev => ({ ...prev, schedule: scheduleStr }));
  }, []);

  const toggleDay = (dayLabel) => {
    const newDays = selectedDays.includes(dayLabel)
      ? selectedDays.filter(d => d !== dayLabel)
      : [...selectedDays, dayLabel];
    setSelectedDays(newDays);
    updateScheduleString(newDays, startTime, endTime);
  };

  // --- DYNAMIC FILTER EFFECT ---
  useEffect(() => {
    if (formData.subject_id && subjects.length > 0) {
      const selectedSub = subjects.find(s => s.id === parseInt(formData.subject_id));
      if (selectedSub) {
        const isHigher = selectedSub.educational_level === 'HIGHER';
        const newOptions = isHigher ? GRADE_LEVEL_OPTIONS.HIGHER : GRADE_LEVEL_OPTIONS.K12;
        
        setAvailableGradeLevels(newOptions);
        
        // Anti-White screen/Bug: Siguraduhin na ang grade_level ay kasama sa bagong listahan
        if (!newOptions.includes(formData.grade_level)) {
            setFormData(prev => ({ ...prev, grade_level: newOptions[0] }));
        }
      }
    }
  }, [formData.subject_id, subjects]);

  // --- SAVE/UPDATE ---
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    const endpoint = editId ? 'update_assignment.php' : 'add_assignment.php';
    const payload = editId ? { ...formData, id: editId } : formData;

    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        handleCloseModal();
        fetchAssignmentData();
      } else { alert(res.data.message); }
    } catch (error) { alert("Save failed."); }
    finally { setSaveLoading(false); }
  };

  const filteredAssignments = assignments.filter(a => 
    `${a.teacher} ${a.subject} ${a.section}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <GraduationCap className="text-blue-500" size={32} /> Class Assignments
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage teaching loads and schedules</p>
        </div>
        <button onClick={() => setShowModal(true)} className="group relative overflow-hidden text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl font-bold transition-all hover:scale-105 active:scale-95" style={{backgroundColor: branding?.theme_color || '#2563eb'}}>
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          <span>Assign a Class</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input type="text" placeholder="Search teacher or subject..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm" />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Teacher & Subject</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Info</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule & Room</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading assignments...</td></tr>
            ) : filteredAssignments.length === 0 ? (
              <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold">No assignments found.</td></tr>
            ) : filteredAssignments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md" style={{backgroundColor: branding?.theme_color || '#2563eb'}}>
                        {item.teacher?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.teacher}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5"><BookOpen size={10}/> {item.subject}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-700 text-sm">{item.grade}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1 flex items-center gap-1"><Users size={12}/> Sec: {item.section}</p>
                  </td>
                  <td className="p-5">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[10px] font-black uppercase flex items-center gap-1.5 mb-1.5 w-max">
                      <Clock size={12}/> {item.schedule}
                    </span>
                    <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1.5 tracking-widest"><MapPin size={12} className="text-emerald-500"/> {item.room}</p>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(item)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-lg shadow-sm"><Edit size={16}/></button>
                      <button onClick={() => { setDeleteTarget(item.id); setShowDeleteModal(true); }} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 rounded-lg shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* CREATE/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">{editId ? 'Update Assignment' : 'Assign Class Load'}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Academic Scheduler</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teacher *</label>
                  <select required value={formData.teacher_id} onChange={e=>setFormData({...formData, teacher_id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500">
                    <option value="" disabled>-- Choose Teacher --</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subject *</label>
                  <select required value={formData.subject_id} onChange={e=>setFormData({...formData, subject_id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500">
                    <option value="" disabled>-- Choose Subject --</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grade Level *</label>
                  <select value={formData.grade_level} onChange={e=>setFormData({...formData, grade_level: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500">
                    {availableGradeLevels.map(level => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Section Name *</label>
                  <input required type="text" placeholder="e.g. Rizal" value={formData.section} onChange={e=>setFormData({...formData, section: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                </div>

                <div className="md:col-span-2 space-y-3 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Weekly Schedule Builder</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_MAPPING.map(day => (
                      <button key={day.label} type="button" onClick={() => toggleDay(day.label)} className={`w-10 h-10 rounded-xl font-bold text-xs transition-all border ${selectedDays.includes(day.label) ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-110' : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300'}`}>
                        {day.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                       <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Start Time</span>
                       <input type="time" value={startTime} onChange={(e) => {setStartTime(e.target.value); updateScheduleString(selectedDays, e.target.value, endTime);}} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex-1">
                       <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">End Time</span>
                       <input type="time" value={endTime} onChange={(e) => {setEndTime(e.target.value); updateScheduleString(selectedDays, startTime, e.target.value);}} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500" />
                    </div>
                  </div>
                  {formData.schedule && (
                    <div className="text-[11px] font-bold text-blue-600 bg-blue-50 p-2 rounded-lg flex items-center gap-2 border border-blue-100">
                      <Clock size={14}/> Preview: {formData.schedule}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Room / Lab</label>
                  <input type="text" placeholder="e.g. Room 301" value={formData.room} onChange={e=>setFormData({...formData, room: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">School Year</label>
                  <input type="text" placeholder="2025-2026" value={formData.school_year} onChange={e=>setFormData({...formData, school_year: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* FIXED FOOTER - NO OVERLAP */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end items-center gap-3 rounded-b-[2.5rem]">
              <button type="button" onClick={handleCloseModal} className="px-8 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">
                Cancel
              </button>
              <button type="submit" disabled={saveLoading} className="px-10 py-3 rounded-xl font-black text-white shadow-xl active:scale-95 transition-all flex items-center gap-2 justify-center min-w-[180px]" style={{backgroundColor: branding?.theme_color || '#2563eb'}}>
                {saveLoading ? <RefreshCw className="animate-spin" size={18}/> : <><CheckCircle size={18}/> {editId ? 'Update Assignment' : 'Save Assignment'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Deactivate Class?</h3>
            <p className="text-slate-500 font-medium mb-8">This will move the class to inactive status. Are you sure you want to proceed?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={confirmDelete} disabled={saveLoading} className="flex-1 py-4 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all">
                {saveLoading ? 'Deactivating...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;