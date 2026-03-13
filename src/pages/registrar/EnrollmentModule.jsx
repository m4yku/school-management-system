import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ClipboardList, CheckCircle, Clock, Printer, X, Search, 
  CreditCard, BookOpen, UserCheck, CheckSquare, Square
} from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';

const EnrollmentModule = () => {
  const { branding } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'enrolled'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data States
  const [students, setStudents] = useState([]); // Can be pending or enrolled based on tab
  const [feesCatalog, setFeesCatalog] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal States
  const [enrollModal, setEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [corModal, setCorModal] = useState(false);

  // Form State
  const [enrollForm, setEnrollForm] = useState({
    school_year: '2026-2027',
    grade_level: 'Grade 7',
    enrollment_type: 'Regular',
    selected_fees: [] // Array of fee IDs checked by Registrar
  });

  const API_BASE_URL = "http://localhost/sms-api";

  // --- MOCK FETCH DATA (Replace with actual PHP endpoints later) ---
  useEffect(() => {
    fetchData();
    fetchFeesCatalog();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Logic: Kung 'pending' tab, kunin yung mga students na wala pang enrollment record ngayong SY.
      // Kung 'enrolled', kunin yung may active enrollment.
      const endpoint = activeTab === 'pending' ? 'get_pending_students.php' : 'get_enrolled_students.php';
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
      if (Array.isArray(response.data)) setStudents(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Fallback dummy data for UI testing
      setStudents([
        { student_id: 'STD-2026-001', first_name: 'Juan', last_name: 'Dela Cruz', grade_level: 'Grade 10', date_added: '2026-03-12' },
        { student_id: 'STD-2026-002', first_name: 'Maria', last_name: 'Clara', grade_level: 'Grade 11', date_added: '2026-03-13' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeesCatalog = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_fees_catalog.php`);
      if (Array.isArray(response.data)) setFeesCatalog(response.data);
    } catch (error) {
      // Fallback dummy data from Cashier
      setFeesCatalog([
        { id: 1, item_name: 'Tuition Fee (Grade 7-10)', amount: 15000, category: 'Tuition' },
        { id: 2, item_name: 'Miscellaneous Fee', amount: 2500, category: 'Mandatory' },
        { id: 3, item_name: 'School ID', amount: 250, category: 'Mandatory' },
        { id: 4, item_name: 'PE Uniform (Set)', amount: 850, category: 'Optional' }
      ]);
    }
  };

  // --- ENROLLMENT LOGIC ---
  const handleOpenEnroll = (student) => {
    setSelectedStudent(student);
    // Auto-select mandatory fees
    const mandatoryFees = feesCatalog.filter(f => f.category !== 'Optional').map(f => f.id);
    setEnrollForm({ ...enrollForm, grade_level: student.grade_level || 'Grade 7', selected_fees: mandatoryFees });
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
    try {
      const payload = {
        student_id: selectedStudent.student_id,
        ...enrollForm
      };
      // const response = await axios.post(`${API_BASE_URL}/process_enrollment.php`, payload);
      alert("Successfully Assessed! Forwarded to Cashier for Payment.");
      setEnrollModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      alert("Error processing enrollment.");
    }
  };

  // --- FILTERING ---
  const filteredStudents = students.filter(s => 
    `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ClipboardList className="text-blue-500" size={32} /> Enrollment Module
          </h1>
          <p className="text-slate-500 text-sm italic">Assessment and Subject Sectioning</p>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full md:w-auto p-1 bg-slate-50 rounded-xl border border-slate-100">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Clock size={16} /> Ready to Enroll
          </button>
          <button 
            onClick={() => setActiveTab('enrolled')}
            className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === 'enrolled' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CheckCircle size={16} /> Officially Enrolled
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search student..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-slate-700"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Info</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Grade</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Profile Created</th>
              <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400 font-bold">No students found.</td>
              </tr>
            ) : (
              filteredStudents.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-5">
                    <p className="font-bold text-slate-800">{s.first_name} {s.last_name}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">ID: {s.student_id}</p>
                  </td>
                  <td className="p-5 font-bold text-slate-600">{s.grade_level}</td>
                  <td className="p-5 text-sm text-slate-500">{s.date_added || 'Recently'}</td>
                  <td className="p-5 text-center">
                    {activeTab === 'pending' ? (
                      <button 
                        onClick={() => handleOpenEnroll(s)}
                        className="px-5 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                      >
                        Assess & Enroll
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setSelectedStudent(s); setCorModal(true); }}
                        className="px-5 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 flex items-center justify-center gap-2 mx-auto"
                      >
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

      {/* ENROLLMENT / ASSESSMENT MODAL */}
      {enrollModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-black text-slate-800">Enrollment Assessment</h3>
                <p className="text-xs text-slate-500 font-bold uppercase mt-1">Assigning fees for {selectedStudent.first_name}</p>
              </div>
              <button onClick={() => setEnrollModal(false)} className="p-2 bg-white text-slate-400 rounded-xl hover:text-red-500 shadow-sm"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              {/* Step 1: Academics */}
              <div>
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2"><BookOpen size={14}/> 1. Academic Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">School Year</label>
                    <select value={enrollForm.school_year} onChange={e=>setEnrollForm({...enrollForm, school_year: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                      <option>2026-2027</option>
                      <option>2027-2028</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Grade Level</label>
                    <select value={enrollForm.grade_level} onChange={e=>setEnrollForm({...enrollForm, grade_level: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                      <option>Grade 7</option>
                      <option>Grade 8</option>
                      <option>Grade 9</option>
                      <option>Grade 10</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Assessment of Fees */}
              <div>
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard size={14}/> 2. Assessment of Fees (From Cashier)</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                  {feesCatalog.map(fee => {
                    const isSelected = enrollForm.selected_fees.includes(fee.id);
                    return (
                      <div 
                        key={fee.id} 
                        onClick={() => toggleFee(fee.id)}
                        className={`p-4 border-b border-slate-200 flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <button className={`p-1 rounded-md ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                          <div>
                            <p className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>{fee.item_name}</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">{fee.category} Fee</p>
                          </div>
                        </div>
                        <p className={`font-black tracking-tight ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                          ₱{parseFloat(fee.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  })}
                  <div className="p-5 bg-slate-800 flex justify-between items-center text-white">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Assessed Amount</p>
                    <p className="text-2xl font-black">
                      ₱{feesCatalog.filter(f => enrollForm.selected_fees.includes(f.id)).reduce((sum, f) => sum + parseFloat(f.amount), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setEnrollModal(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={submitEnrollment} className="px-8 py-2.5 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition-all flex items-center gap-2">
                <CheckCircle size={18}/> Forward to Cashier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COR PRINT MODAL (Gagawin pag enrolled na) */}
      {corModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white">
           <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl p-10 print:shadow-none print:w-full">
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">{branding.school_name}</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Certificate of Registration</p>
                 </div>
                 <img src={branding.school_logo} className="w-16 h-16 object-cover rounded-lg" alt="logo" />
              </div>
              
              <div className="mb-8">
                 <p className="font-bold text-lg">{selectedStudent.first_name} {selectedStudent.last_name}</p>
                 <p className="font-mono text-sm text-slate-500">{selectedStudent.student_id} | {selectedStudent.grade_level}</p>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center mb-8 print:border-black print:bg-transparent">
                 <h3 className="font-black text-xl text-slate-800">STATUS: OFFICIALLY ENROLLED</h3>
                 <p className="text-xs text-slate-500 uppercase mt-1">Please present this to the cashier / library for validation.</p>
              </div>

              <div className="flex gap-4 print:hidden">
                 <button onClick={() => window.print()} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl flex justify-center gap-2 hover:bg-slate-700"><Printer size={20}/> Print COR</button>
                 <button onClick={() => setCorModal(false)} className="py-3 px-6 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Close</button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default EnrollmentModule;