import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GraduationCap, Plus, Search, BookOpen, Clock, 
  MapPin, Users, Edit, Trash2, X, CheckCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TeacherAssignments = () => {
  const { branding } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Data States
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Form State
  const initialForm = {
    teacher_id: '',
    subject_id: '',
    grade_level: 'Grade 7',
    section: '',
    room: '',
    schedule: '' // e.g., "MWF 8:00 AM - 9:30 AM"
  };
  const [formData, setFormData] = useState(initialForm);

  // --- MOCK DATA & FETCHING ---
  useEffect(() => {
    // I-simulate natin ang pagkuha ng data sa PHP backend
    setTimeout(() => {
      setTeachers([
        { id: 'TCH-001', name: 'Julio Cruz', department: 'Mathematics' },
        { id: 'TCH-002', name: 'Maria Santos', department: 'Science' },
        { id: 'TCH-003', name: 'Rizalino Reyes', department: 'Languages' }
      ]);

      setSubjects([
        { id: 'SUB-M10', name: 'General Mathematics', type: 'Core' },
        { id: 'SUB-S10', name: 'Earth Science', type: 'Core' },
        { id: 'SUB-E10', name: 'English Communication', type: 'Core' }
      ]);

      setAssignments([
        { id: 1, teacher: 'Julio Cruz', subject: 'General Mathematics', grade: 'Grade 10', section: 'Rizal', room: 'Room 301', schedule: 'MWF 8:00 AM - 9:00 AM' },
        { id: 2, teacher: 'Maria Santos', subject: 'Earth Science', grade: 'Grade 10', section: 'Rizal', room: 'Lab 1', schedule: 'TTH 10:00 AM - 11:30 AM' },
        { id: 3, teacher: 'Rizalino Reyes', subject: 'English Communication', grade: 'Grade 11', section: 'Bonifacio', room: 'Room 205', schedule: 'MWF 1:00 PM - 2:00 PM' }
      ]);

      setLoading(false);
    }, 800);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaveLoading(true);
    // Logic for Axios POST request to save assignment goes here
    setTimeout(() => {
      alert("Class assignment successfully saved!");
      setShowModal(false);
      setFormData(initialForm);
      setSaveLoading(false);
    }, 1000);
  };

  // --- FILTERING ---
  const filteredAssignments = assignments.filter(a => 
    `${a.teacher} ${a.subject} ${a.section}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-blue-500" size={32} /> Class & Teacher Assignments
          </h1>
          <p className="text-slate-500 text-sm italic">Manage teaching loads and schedules</p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="group relative overflow-hidden text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl" 
          style={{backgroundColor: branding.theme_color || '#2563eb'}}
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          <span>Assign a Class</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search teacher, subject, or section..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
        />
      </div>

      {/* ASSIGNMENTS TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Teacher & Subject</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Class Info</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule & Room</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr>
              <td colSpan="4" className="p-20 text-center">
                <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest animate-pulse">Loading assignments...</p>
              </td>
            </tr>
          ) : filteredAssignments.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-16 text-center text-slate-400 font-bold">No assignments found.</td>
            </tr>
          ) : (
            filteredAssignments.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                       {item.teacher.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{item.teacher}</p>
                      <p className="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-1 mt-0.5">
                         <BookOpen size={10}/> {item.subject}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <p className="font-bold text-slate-600">{item.grade}</p>
                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 uppercase">
                     <Users size={12}/> Sec: {item.section}
                  </p>
                </td>
                <td className="p-5">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                    <Clock size={14} className="text-amber-500"/> {item.schedule}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1.5 uppercase">
                    <MapPin size={12} className="text-emerald-500"/> {item.room}
                  </p>
                </td>
                <td className="p-5 text-center">
                   <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                         <Edit size={16}/>
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                         <Trash2 size={16}/>
                      </button>
                   </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
         </table>
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Assign Class Load</h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Fill in the schedule details</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 bg-white text-slate-400 rounded-xl hover:text-red-500 shadow-sm transition-colors"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Teacher */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Select Teacher *</label>
                    <select required value={formData.teacher_id} onChange={e=>setFormData({...formData, teacher_id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm">
                      <option value="" disabled>-- Choose a Teacher --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
                    </select>
                  </div>

                  {/* Select Subject */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Select Subject *</label>
                    <select required value={formData.subject_id} onChange={e=>setFormData({...formData, subject_id: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm">
                      <option value="" disabled>-- Choose a Subject --</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.type})</option>)}
                    </select>
                  </div>

                  {/* Grade & Section */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Grade Level</label>
                    <select value={formData.grade_level} onChange={e=>setFormData({...formData, grade_level: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm">
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Section Name *</label>
                    <input required type="text" placeholder="e.g. Rizal, A, Gold" value={formData.section} onChange={e=>setFormData({...formData, section: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm" />
                  </div>

                  {/* Room & Schedule */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Room Number / Lab</label>
                    <input type="text" placeholder="e.g. Room 301, Science Lab" value={formData.room} onChange={e=>setFormData({...formData, room: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Time Schedule *</label>
                    <input required type="text" placeholder="e.g. MWF 8:00 AM - 9:30 AM" value={formData.schedule} onChange={e=>setFormData({...formData, schedule: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm" />
                  </div>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all text-sm">Cancel</button>
              <button type="submit" disabled={saveLoading} className="px-8 py-3 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2 text-sm" style={{backgroundColor: branding.theme_color || '#2563eb'}}>
                {saveLoading ? 'Saving...' : <><CheckCircle size={18}/> Save Assignment</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default TeacherAssignments;