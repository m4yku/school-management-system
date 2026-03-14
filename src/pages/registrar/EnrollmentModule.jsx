import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ClipboardList, CheckCircle, Clock, Printer, X, Search, 
  CreditCard, BookOpen, CheckSquare, Square, AlertCircle
} from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';

const EnrollmentModule = () => {
  const { branding } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [students, setStudents] = useState([]);
  const [feesCatalog, setFeesCatalog] = useState([]);
  const [loading, setLoading] = useState(false);

  const [enrollModal, setEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [corModal, setCorModal] = useState(false);

  const [enrollForm, setEnrollForm] = useState({
    school_year: '2026-2027',
    grade_level: '',
    selected_fees: [] 
  });

  const API_BASE_URL = "http://localhost/sms-api";

  useEffect(() => {
    fetchData();
    // I-fetch ang catalog kahit anong tab para ready na
    fetchFeesCatalog();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (activeTab === 'pending') endpoint = 'get_pending_students.php';
      else if (activeTab === 'assessed') endpoint = 'get_assessed_students.php'; 
      else endpoint = 'get_enrolled_students.php';

      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      if (Array.isArray(response.data)) setStudents(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesCatalog = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_fees_catalog.php`);
      if (Array.isArray(response.data)) {
          setFeesCatalog(response.data);
      }
    } catch (error) {
      console.error("Error fetching catalog", error);
    }
  };

  // --- SMART ENROLLMENT LOGIC ---
  const handleOpenEnroll = (student) => {
    setSelectedStudent(student);
    
    // Matalinong Filter: 
    // 1. Kunin ang lahat ng 'Mandatory' items (e.g. ID, Library)
    // 2. Kunin ang 'Tuition' na tumutugma sa Grade Level ng estudyante
    const matchedFees = feesCatalog.filter(f => {
        const isMandatory = f.category === 'Mandatory';
        const isCorrectTuition = f.category === 'Tuition' && f.item_name.toLowerCase().includes(student.grade_level.toLowerCase());
        return isMandatory || isCorrectTuition;
    }).map(f => f.id);

    setEnrollForm({ 
        school_year: '2026-2027',
        grade_level: student.grade_level, 
        selected_fees: matchedFees 
    });
    setEnrollModal(true);
  };

  const toggleFee = (feeId) => {
    setEnrollForm(prev => ({
      ...prev,
      selected_fees: prev.selected_fees.includes(feeId) 
        ? prev.selected_fees.filter(id => id !== feeId) 
        : [...prev.selected_fees, feeId]
    }));
  };

  const submitEnrollment = async () => {
    if (enrollForm.selected_fees.length === 0) {
        alert("Pumili ng kahit isang fee para magpatuloy.");
        return;
    }

    try {
      const payload = {
        student_id: selectedStudent.student_id,
        school_year: enrollForm.school_year,
        selected_fees: enrollForm.selected_fees
      };
      
      const response = await axios.post(`${API_BASE_URL}/process_enrollment.php`, payload);
      
      if(response.data.success) {
         alert("Successfully Assessed! Forwarded to Cashier.");
         setEnrollModal(false);
         setActiveTab('assessed'); 
      } else {
         alert(response.data.message);
      }
    } catch (error) {
      alert("Error processing enrollment. Check console for details.");
      console.error(error);
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-blue-500" size={32} /> Enrollment Module
          </h1>
          <p className="text-slate-500 text-sm italic">Assessment and Subject Sectioning</p>
        </div>
      </div>

      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto p-1 bg-slate-50 rounded-xl border border-slate-100 overflow-x-auto">
          <button onClick={() => setActiveTab('pending')} className={`flex items-center whitespace-nowrap gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <Clock size={16} /> 1. Ready to Assess
          </button>
          <button onClick={() => setActiveTab('assessed')} className={`flex items-center whitespace-nowrap gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'assessed' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <CreditCard size={16} /> 2. Assessed
          </button>
          <button onClick={() => setActiveTab('enrolled')} className={`flex items-center whitespace-nowrap gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'enrolled' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <CheckCircle size={16} /> 3. Officially Enrolled
          </button>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search student..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Info</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade Level</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action / Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
               <tr><td colSpan="3" className="p-10 text-center font-bold text-slate-400">Loading...</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr><td colSpan="3" className="p-10 text-center text-slate-400 font-bold">No records found.</td></tr>
            ) : (
              filteredStudents.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{s.first_name} {s.last_name}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {s.student_id}</p>
                  </td>
                  <td className="p-5 font-bold text-slate-600">{s.grade_level}</td>
                  <td className="p-5 text-center">
                    {activeTab === 'pending' && (
                      <button onClick={() => handleOpenEnroll(s)} className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                        Assess Fees
                      </button>
                    )}
                    {activeTab === 'assessed' && (
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full font-bold text-[10px] border border-amber-100 uppercase tracking-widest">
                        <AlertCircle size={12}/> Pending Payment
                      </span>
                    )}
                    {activeTab === 'enrolled' && (
                      <button onClick={() => { setSelectedStudent(s); setCorModal(true); }} className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center justify-center gap-2 mx-auto">
                        <Printer size={14} /> Print COR
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {enrollModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Fee Assessment</h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Select items for {selectedStudent.first_name}</p>
              </div>
              <button onClick={() => setEnrollModal(false)} className="p-2 bg-white text-slate-400 rounded-xl hover:text-red-500 shadow-sm"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Student Classification</p>
                <p className="font-bold text-blue-900">{selectedStudent.grade_level}</p>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard size={14}/> Assessment of Fees</h4>
                
                {feesCatalog.length === 0 ? (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-400 font-bold">Walang laman ang Fees Catalog. Magdagdag sa Database.</p>
                    </div>
                ) : (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-inner">
                      {feesCatalog.map(fee => {
                        const isSelected = enrollForm.selected_fees.includes(fee.id);
                        return (
                          <div key={fee.id} onClick={() => toggleFee(fee.id)}
                            className={`p-4 border-b border-slate-100 flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-3">
                              <div className={`${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                                {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                              </div>
                              <div>
                                <p className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{fee.item_name}</p>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{fee.category}</p>
                              </div>
                            </div>
                            <p className={`font-black ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>₱{parseFloat(fee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          </div>
                        );
                      })}
                      <div className="p-5 bg-slate-900 flex justify-between items-center text-white">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Assessment</p>
                        <p className="text-2xl font-black">
                          ₱{feesCatalog.filter(f => enrollForm.selected_fees.includes(f.id)).reduce((sum, f) => sum + parseFloat(f.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEnrollModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={submitEnrollment} disabled={feesCatalog.length === 0} className="px-8 py-2.5 rounded-xl font-black text-white shadow-lg bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2">
                <CheckCircle size={18}/> Confirm & Forward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COR PRINT MODAL */}
{/* COR PRINT MODAL */}
{corModal && selectedStudent && (
  <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white">
    <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in zoom-in duration-300">
      
      {/* MODAL HEADER (HIDDEN ON PRINT) */}
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Printer size={24}/></div>
          <h3 className="font-black text-slate-800 tracking-tight">Print Enrollment Form</h3>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg">
              <Printer size={18} /> Print to PDF
          </button>
          <button onClick={() => setCorModal(false)} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={20}/></button>
        </div>
      </div>

      <div className="p-12 overflow-y-auto flex-1 print:overflow-visible font-sans bg-white">
        
        {/* OFFICIAL LETTERHEAD (ONLY ON PRINT) */}
        <div className="hidden print:flex items-center justify-center gap-4 mb-8 border-b-4 border-double border-slate-800 pb-6">
          <img src={branding.school_logo} className="w-20 h-20 object-cover" alt="Logo" />
          <div className="text-center">
            <h1 className="text-2xl font-black text-slate-900 uppercase leading-tight">{branding.school_name}</h1>
            <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Office of the School Registrar</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">Certificate of Registration - S.Y. 2026-2027</p>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="space-y-8">
          <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Student Name</p>
              <h2 className="text-2xl font-black text-slate-800 uppercase">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student ID</p>
              <p className="font-mono text-lg font-bold text-slate-800">{selectedStudent.student_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Level</p>
                 <p className="font-bold text-slate-700">{selectedStudent.grade_level}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Status</p>
                 <p className="font-black text-emerald-600 uppercase tracking-tight">Officially Enrolled</p>
               </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">School Seal</p>
               <div className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-full mx-auto flex items-center justify-center text-[8px] font-bold text-slate-300 text-center uppercase">Place Seal Here</div>
            </div>
          </div>
        </div>

        {/* SIGNATURE SECTION (FOR PRINT) */}
        <div className="hidden print:grid grid-cols-2 gap-20 mt-24">
           <div className="text-center">
              <div className="border-b-2 border-slate-800 mb-2"></div>
              <p className="text-[10px] font-black uppercase text-slate-600">Registrar Signature</p>
           </div>
           <div className="text-center">
              <div className="border-b-2 border-slate-800 mb-2"></div>
              <p className="text-[10px] font-black uppercase text-slate-600">Parent/Guardian Signature</p>
           </div>
        </div>

      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default EnrollmentModule;