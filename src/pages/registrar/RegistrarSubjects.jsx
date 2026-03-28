import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Plus, Search, Layers, FileText, 
  Trash2, X, CheckCircle, RefreshCw, GraduationCap 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const RegistrarSubjects = () => {
  const { branding, token, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Data States
  const [subjects, setSubjects] = useState([]);
  const [programs, setPrograms] = useState([]);

  // ARCHITECT'S CONSTANTS
  const LEVEL_CONFIG = {
    'K-10': {
      levels: ['Kinder', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
      needsProgram: false
    },
    'SHS': {
      levels: ['Grade 11', 'Grade 12'],
      needsProgram: true
    },
    'College': {
      levels: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
      needsProgram: true
    }
  };

  const initialForm = {
    level_category: 'K-10', // NEW: Important for filtering
    subject_code: '',
    subject_description: '',
    units: 0,
    grade_level_applicable: 'Grade 1',
    program_id: '', 
    semester: 'N/A'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Dito mo i-rename ang PHP mo later sa get_subject_data.php para mas malinis
      const res = await axios.get(`${API_BASE_URL}/registrar/get_subjects.php`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSubjects(res.data.subjects || []);
        setPrograms(res.data.programs || []);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

const handleLevelCategoryChange = (cat) => {
    // 🛑 ARCHITECT FIX: Smart Units Logic
    // Kapag College, default sa 3. Kapag K-10 o SHS, force sa 0.
    const newUnits = (cat === 'College') ? 3 : 0;

    setFormData({
      ...formData,
      level_category: cat,
      grade_level_applicable: LEVEL_CONFIG[cat].levels[0], // Auto-select first level
      program_id: '',
      semester: cat === 'K-10' ? 'N/A' : '1st',
      units: newUnits // Idinagdag natin ito para sumabay sa pagpalit ng category!
    });
  }

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/registrar/add_subject.php`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (res.data.success) {
        setShowModal(false);
        setFormData(initialForm);
        fetchData(); 
      } else { alert("Error: " + res.data.message); }
    } catch (error) { alert("Server Error"); }
    finally { setSaveLoading(false); }
  };

  const filteredSubjects = (subjects || []).filter(s => 
    `${s.subject_code} ${s.subject_description}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter flex items-center gap-3 uppercase">
            <BookOpen className="text-blue-600" size={32} /> Subject Registry
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 italic">Curriculum Management & Masterlist</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95">
          <Plus size={20} /> New Subject
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
        <input type="text" placeholder="Search by code or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-600 shadow-sm transition-all" />
      </div>

      {/* SUBJECT GRID (Enterprise Look) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
           <div className="col-span-full py-20 text-center font-black text-slate-300 uppercase animate-pulse tracking-widest">Updating Subject Catalog...</div>
        ) : filteredSubjects.map((item) => (
          <div key={item.id} className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 hover:border-blue-100 transition-all group shadow-sm">
             <div className="flex justify-between items-start mb-4">
                <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                   item.level_category === 'College' ? 'bg-purple-100 text-purple-600' : 
                   item.level_category === 'SHS' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                }`}>
                   {item.level_category || 'K-10'}
                </span>
                <button onClick={() => handleDelete(item.id, item.subject_code)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                   <Trash2 size={16}/>
                </button>
             </div>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase leading-none">{item.subject_code}</h3>
             <p className="text-slate-500 font-bold text-sm mt-1">{item.subject_description}</p>
             <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.grade_level_applicable}</p>
                   <p className="text-[10px] font-bold text-blue-500 uppercase mt-0.5">{item.program_code || 'General'}</p>
                </div>
                <div className="text-right">
                   <p className="text-xl font-black text-slate-300 leading-none">{item.units}<span className="text-[10px]">u</span></p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* SMART MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <form onSubmit={handleSave} className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Register Subject</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Curriculum Database</p>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
            </div>

            <div className="p-10 overflow-y-auto space-y-6">
              {/* LEVEL CATEGORY SELECTOR */}
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Academic Category</label>
                 <div className="grid grid-cols-3 gap-3">
                    {Object.keys(LEVEL_CONFIG).map(cat => (
                       <button key={cat} type="button" onClick={() => handleLevelCategoryChange(cat)}
                          className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${formData.level_category === cat ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-lg scale-105' : 'bg-white border-slate-100 text-slate-300'}`}>
                          {cat}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Subject Code *</label>
                  <input required type="text" placeholder="MATH101" value={formData.subject_code} onChange={e=>setFormData({...formData, subject_code: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Units (Credit)</label>
                  <input 
                          type="number" 
                          min="0"
                          value={formData.units} 
                          onChange={e => setFormData({...formData, units: e.target.value})} 
                          disabled={formData.level_category !== 'College'} 
                          className={`w-full p-4 rounded-2xl outline-none font-bold transition-all ${
                            formData.level_category !== 'College'
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70' // Kapag naka-lock (K-10/SHS)
                              : 'bg-slate-100 text-slate-800 focus:ring-2 focus:ring-blue-500' // Kapag editable (College)
                          }`} 
                        />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Description *</label>
                  <input required type="text" placeholder="e.g. Fundamentals of Mathematics" value={formData.subject_description} onChange={e=>setFormData({...formData, subject_description: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Grade / Year Level</label>
                  <select value={formData.grade_level_applicable} onChange={e=>setFormData({...formData, grade_level_applicable: e.target.value})} className="w-full p-4 bg-slate-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-blue-500">
                    {LEVEL_CONFIG[formData.level_category].levels.map(lvl => <option key={lvl} value={lvl}>{lvl}</option>)}
                  </select>
                </div>

                {LEVEL_CONFIG[formData.level_category].needsProgram && (
                   <div className="space-y-1.5 animate-in slide-in-from-top-2">
                     <label className="text-[10px] font-black text-blue-500 uppercase ml-1">Program / Course Link</label>
                     <select required value={formData.program_id} onChange={e=>setFormData({...formData, program_id: e.target.value})} className="w-full p-4 bg-blue-50 border-2 border-blue-100 text-blue-900 rounded-2xl font-bold outline-none">
                       <option value="">-- Choose Program --</option>
                       {programs.filter(p => p.department === (formData.level_category === 'SHS' ? 'SHS' : 'College')).map(p => (
                          <option key={p.id} value={p.id}>{p.program_code}</option>
                       ))}
                     </select>
                   </div>
                )}
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
              <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 rounded-2xl font-black text-slate-400 uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button type="submit" disabled={saveLoading} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2">
                {saveLoading ? <RefreshCw className="animate-spin" size={18}/> : <><CheckCircle size={18}/> Register Subject</>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegistrarSubjects;