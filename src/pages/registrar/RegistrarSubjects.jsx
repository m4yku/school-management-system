import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Plus, Search, Layers, FileText, 
  Trash2, X, CheckCircle, RefreshCw, GraduationCap 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegistrarSubjects = () => {
  const { branding, token, API_BASE_URL} = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Data States
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]); // Para sa SHS/College courses dropdown

  // Form State
  const initialForm = {
    subject_code: '',
    subject_description: '',
    units: 0,
    department: 'K-12', // Custom state para mag-toggle ng fields
    grade_level_applicable: 'Grade 7',
    program_id: '', // Null kapag K-12
    course_applicable: 'All'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/registrar/get_subjects.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSubjects(res.data.subjects || []);
        setPrograms(res.data.programs || []);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/add_subject.php`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data.success) {
        alert("Subject successfully added!");
        setShowModal(false);
        setFormData(initialForm);
        fetchData(); 
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (error) {
      alert("Server Error while saving.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData(initialForm);
  };

  // 2. Function para sa pag-delete ng subject
  const handleDelete = async (id, code) => {
    if (!window.confirm(`Sigurado ka bang buburahin ang subject na ${code}?`)) return;
    
    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/delete_subject.php`, { id }, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data.success) {
        fetchData(); // I-refresh ang table
      } else {
        alert("Error: " + res.data.message);
      }
    } catch (error) {
      alert("Server Error while deleting.");
      console.error(error);
    }
  };

 // Dagdagan ng empty array fallback
const filteredSubjects = (subjects || []).filter(s => 
  `${s.subject_code} ${s.subject_description} ${s.grade_level_applicable}`.toLowerCase().includes(searchQuery.toLowerCase())
);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BookOpen className="text-indigo-500" size={32} /> Subject Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Add and organize curriculum subjects</p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="group relative overflow-hidden text-white px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95" 
          style={{backgroundColor: branding?.theme_color || '#4f46e5'}}
        >
          <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          <span>Add New Subject</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search subject code or desc..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700 shadow-sm"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-8">Subject Code & Desc</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Units</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level & Course</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
          {loading ? (
            <tr><td colSpan="4" className="p-20 text-center text-slate-400 font-bold animate-pulse">Loading subjects...</td></tr>
          ) : filteredSubjects.length === 0 ? (
            <tr><td colSpan="4" className="p-16 text-center text-slate-400 font-bold">No subjects found.</td></tr>
          ) : (
            filteredSubjects.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-5 pl-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                       <FileText size={18}/>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.subject_code}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5 max-w-xs truncate" title={item.subject_description}>
                         {item.subject_description}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-center font-black text-slate-700">{item.units || '-'}</td>
                <td className="p-5">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 w-max mb-1">
                    <Layers size={12}/> {item.grade_level_applicable}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase">
                     <GraduationCap size={12}/> {item.program_code || 'General / All'}
                  </p>
                </td>
                <td className="p-5 text-center">
                   <button 
  onClick={() => handleDelete(item.id, item.subject_code)}
  className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-lg transition-all shadow-sm">
                      <Trash2 size={16}/>
                   </button>

                </td>
              </tr>
            ))
          )}
        </tbody>
         </table>
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Add New Subject</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Curriculum Registry</p>
              </div>
              <button type="button" onClick={handleCloseModal} className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-red-500"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Subject Code */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subject Code *</label>
                    <input required type="text" placeholder="e.g. MATH101" value={formData.subject_code} onChange={e=>setFormData({...formData, subject_code: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700" />
                  </div>

                  {/* Units */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Units (Credit)</label>
                    <input type="number" min="0" value={formData.units} onChange={e=>setFormData({...formData, units: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700" />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Description / Title *</label>
                    <input required type="text" placeholder="e.g. General Mathematics" value={formData.subject_description} onChange={e=>setFormData({...formData, subject_description: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700" />
                  </div>

                  {/* Department Toggle */}
                  <div className="space-y-1.5 md:col-span-2 border-t border-slate-100 pt-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Educational Level</label>
                    <div className="flex gap-4">
                      {['K-12', 'SHS / College'].map(dept => (
                        <label key={dept} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                          <input 
                            type="radio" 
                            name="dept" 
                            checked={formData.department === dept} 
                            onChange={() => setFormData({...formData, department: dept, program_id: ''})}
                            className="w-4 h-4 text-indigo-600"
                          /> {dept}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Grade Level */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grade / Year Level</label>
                    <input required type="text" placeholder="e.g. Grade 10, 1st Year" value={formData.grade_level_applicable} onChange={e=>setFormData({...formData, grade_level_applicable: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700" />
                  </div>

                  {/* Program / Course (Disabled kung K-12) */}
                  <div className={`space-y-1.5 ${formData.department === 'K-12' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Program / Course</label>
                    <select 
                      value={formData.program_id} 
                      onChange={e=>setFormData({...formData, program_id: e.target.value})} 
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-indigo-500 transition-all text-sm font-bold text-slate-700"
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map(p => <option key={p.id} value={p.id}>{p.program_code} ({p.department})</option>)}
                    </select>
                  </div>

               </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 rounded-b-[2.5rem]">
              <button type="button" onClick={handleCloseModal} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={saveLoading} className="px-8 py-3 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all flex items-center gap-2" style={{backgroundColor: branding?.theme_color || '#4f46e5'}}>
                {saveLoading ? <RefreshCw className="animate-spin" size={18}/> : <><CheckCircle size={18}/> Save Subject</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegistrarSubjects;