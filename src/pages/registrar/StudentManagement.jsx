import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  UserPlus, X, Mail, RefreshCw, Calendar, Phone, GraduationCap, 
  BookOpen, User, Users, CreditCard, ChevronRight, ChevronLeft, Check, MapPin, Camera 
} from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';

const StudentManagement = () => {
  const { branding } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false); 
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // View Modal states
  const [viewModal, setViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const API_BASE_URL = "http://localhost/sms-api";

  // --- FETCH/REFRESH FUNCTION ---
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_students.php`);
      if (Array.isArray(response.data)) setStudents(response.data);
    } catch (error) { 
      console.error("Error fetching students:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchStudents(); 
  }, []);

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setViewModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const initialFormState = {
    // STEP 1: Personal Info
    lrn: '', first_name: '', middle_name: '', last_name: '', suffix: '', 
    nickname: '', gender: 'Male', dob: '', place_of_birth: '', 
    nationality: 'Filipino', religion: '', civil_status: 'Single',
    // STEP 2: Contact & Address
    email: '', mobile_no: '', alt_mobile_no: '', 
    address_house: '', address_brgy: '', address_city: '', address_province: '', address_zip: '',
    // STEP 3: Parent/Guardian
    father_name: '', father_occ: '', father_contact: '',
    mother_name: '', mother_occ: '', mother_contact: '',
    guardian_name: '', guardian_rel: '', guardian_contact: '', guardian_address: '',
    // STEP 4: Academic & Financial
    enrollment_type: 'New', school_year: '2026-2027', grade_level: 'Grade 7',
    section: 'TBA', prev_school: '', prev_school_address: '',
    scholarship_type: 'None', payment_plan: 'Full Payment'
  };

  const [formData, setFormData] = useState(initialFormState);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/add_student.php`, formData);
      if (response.data.success) {
        setShowModal(false);
        setFormData(initialFormState);
        setCurrentStep(1);
        fetchStudents();
        alert("Enrolled successfully! ID: " + response.data.student_id);
      } else { alert(response.data.message); }
    } catch (err) { alert("Server Error"); } finally { setSaveLoading(false); }
  };

  // UI Helpers
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 px-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${currentStep >= step ? 'text-white' : 'bg-slate-100 text-slate-400'}`}
               style={currentStep >= step ? {backgroundColor: branding.theme_color} : {}}>
            {currentStep > step ? <Check size={14} /> : step}
          </div>
          {step < 4 && <div className={`w-12 h-1 mx-2 rounded ${currentStep > step ? 'bg-blue-500' : 'bg-slate-100'}`} style={currentStep > step ? {backgroundColor: branding.theme_color} : {}} />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-blue-500" size={32} /> Student Enrollment
          </h1>
          <p className="text-slate-500 text-sm italic">Enterprise Registrar Module</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchStudents}
            className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          <button 
            onClick={() => { setFormData(initialFormState); setShowModal(true); }} 
            className="group relative overflow-hidden text-white px-8 py-4 rounded-2xl flex items-center gap-2 shadow-xl font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-2xl" 
            style={{backgroundColor: branding.theme_color}}
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out skew-x-12" />
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" /> 
            <span>Enroll New Student</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
         <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
               <tr>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID & Name</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade & LRN</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact & Address</th>
                  <th className="p-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
          {loading && students.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-20 text-center">
                <div className="flex flex-col items-center gap-3">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Fetching student records...</p>
                </div>
              </td>
            </tr>
          ) : students.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-20 text-center">
                <div className="opacity-20 flex flex-col items-center">
                  <GraduationCap size={64} className="text-slate-400" />
                  <p className="mt-4 font-black text-slate-500">No Students Enrolled Yet</p>
                </div>
              </td>
            </tr>
          ) : (
            students.map((s) => (
              <tr 
                key={s.student_id} 
                onClick={() => handleViewProfile(s)} 
                className="hover:bg-blue-50/50 transition-all duration-200 group cursor-pointer active:scale-[0.99]"
              >
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-sm transition-all group-hover:rotate-6 group-hover:scale-110 overflow-hidden bg-slate-200"
                      style={{ backgroundColor: branding.theme_color || '#2563eb' }}
                    >
                      {s.profile_image ? (
                        <img src={`${API_BASE_URL}/uploads/profiles/${s.profile_image}`} className="w-full h-full object-cover" />
                      ) : s.first_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                        ID: {s.student_id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-sm">
                  <p className="font-bold text-slate-600 flex items-center gap-1">
                    <BookOpen size={14} className="text-blue-500" /> {s.grade_level}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">LRN: {s.lrn || 'NOT PROVIDED'}</p>
                </td>
                <td className="p-5">
                  <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Phone size={12} className="text-blue-500" /> {s.mobile_no || 'N/A'}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate max-w-[150px]">
                    <MapPin size={10} /> {s.address_house || 'N/A'}
                  </p>
                </td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-tighter shadow-sm flex w-fit items-center gap-1.5 ${
                    s.is_verified 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border border-amber-100'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${s.is_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {s.is_verified ? 'PORTAL ACTIVE' : 'PENDING INVITE'}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
         </table>
      </div>

      {/* MULTI-STEP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Student Registration Wizard</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  {currentStep === 1 && "Step 1: Personal Profile"}
                  {currentStep === 2 && "Step 2: Contact & Address"}
                  {currentStep === 3 && "Step 3: Family Background"}
                  {currentStep === 4 && "Step 4: Academic & Billing"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="bg-white shadow-sm p-3 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <StepIndicator />

              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="md:col-span-1"><Input label="LRN (Required)" value={formData.lrn} onChange={v=>setFormData({...formData, lrn:v})} placeholder="12-digit LRN"/></div>
                  <div className="md:col-span-2"></div>
                  <Input label="First Name" value={formData.first_name} onChange={v=>setFormData({...formData, first_name:v})} required/>
                  <Input label="Middle Name" value={formData.middle_name} onChange={v=>setFormData({...formData, middle_name:v})}/>
                  <Input label="Last Name" value={formData.last_name} onChange={v=>setFormData({...formData, last_name:v})} required/>
                  <Input label="Suffix" value={formData.suffix} onChange={v=>setFormData({...formData, suffix:v})} placeholder="Jr, Sr, III"/>
                  <Select label="Gender" value={formData.gender} onChange={v=>setFormData({...formData, gender:v})} options={['Male', 'Female', 'Other']}/>
                  <Input label="Date of Birth" type="date" value={formData.dob} onChange={v=>setFormData({...formData, dob:v})} required/>
                  <Input label="Place of Birth" value={formData.place_of_birth} onChange={v=>setFormData({...formData, place_of_birth:v})}/>
                  <Input label="Nationality" value={formData.nationality} onChange={v=>setFormData({...formData, nationality:v})}/>
                  <Input label="Religion" value={formData.religion} onChange={v=>setFormData({...formData, religion:v})}/>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                  <Input label="Email Address" type="email" value={formData.email} onChange={v=>setFormData({...formData, email:v})} required/>
                  <Input label="Mobile Number" value={formData.mobile_no} onChange={v=>setFormData({...formData, mobile_no:v})} required/>
                  <div className="md:col-span-2"><Input label="House No. / Street" value={formData.address_house} onChange={v=>setFormData({...formData, address_house:v})}/></div>
                  <Input label="Barangay" value={formData.address_brgy} onChange={v=>setFormData({...formData, address_brgy:v})}/>
                  <Input label="City / Municipality" value={formData.address_city} onChange={v=>setFormData({...formData, address_city:v})}/>
                  <Input label="Province" value={formData.address_province} onChange={v=>setFormData({...formData, address_province:v})}/>
                  <Input label="Zip Code" value={formData.address_zip} onChange={v=>setFormData({...formData, address_zip:v})}/>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl">
                    <h4 className="md:col-span-3 text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Father's Information</h4>
                    <Input label="Full Name" value={formData.father_name} onChange={v=>setFormData({...formData, father_name:v})}/>
                    <Input label="Occupation" value={formData.father_occ} onChange={v=>setFormData({...formData, father_occ:v})}/>
                    <Input label="Contact No." value={formData.father_contact} onChange={v=>setFormData({...formData, father_contact:v})}/>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-3xl">
                    <h4 className="md:col-span-3 text-xs font-black text-pink-500 uppercase tracking-widest flex items-center gap-2"><Users size={14}/> Mother's Information</h4>
                    <Input label="Full Name" value={formData.mother_name} onChange={v=>setFormData({...formData, mother_name:v})}/>
                    <Input label="Occupation" value={formData.mother_occ} onChange={v=>setFormData({...formData, mother_occ:v})}/>
                    <Input label="Contact No." value={formData.mother_contact} onChange={v=>setFormData({...formData, mother_contact:v})}/>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-300">
                  <Select label="Enrollment Type" value={formData.enrollment_type} onChange={v=>setFormData({...formData, enrollment_type:v})} options={['New', 'Transferee', 'Continuing']}/>
                  <Select label="Grade Level" value={formData.grade_level} onChange={v=>setFormData({...formData, grade_level:v})} options={['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']}/>
                  <Input label="Previous School" value={formData.prev_school} onChange={v=>setFormData({...formData, prev_school:v})}/>
                  <Select label="Payment Plan" value={formData.payment_plan} onChange={v=>setFormData({...formData, payment_plan:v})} options={['Full Payment', 'Installment']}/>
                  <div className="md:col-span-2 bg-amber-50 p-6 rounded-3xl flex items-start gap-4 border border-amber-100">
                     <Mail className="text-amber-500 shrink-0" />
                     <p className="text-xs text-amber-800 font-medium">Upon submission, an official <b>Student ID</b> will be generated and an invitation will be sent to <b>{formData.email || 'the provided email'}</b>.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-50 flex justify-between bg-slate-50/20">
              <button disabled={currentStep === 1} onClick={prevStep} className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 disabled:opacity-0 transition-all">
                <ChevronLeft size={20}/> Previous
              </button>
              
              {currentStep < 4 ? (
                <button onClick={nextStep} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-all" style={{backgroundColor: branding.theme_color}}>
                  Next Step <ChevronRight size={20}/>
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={saveLoading} className="flex items-center gap-2 px-10 py-3 rounded-xl font-black text-white shadow-xl active:scale-95 transition-all" style={{backgroundColor: branding.theme_color}}>
                  {saveLoading ? <RefreshCw className="animate-spin" /> : <><Check size={20}/> Finish Enrollment</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE VIEW MODAL */}
      {viewModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><User size={24}/></div>
                <h3 className="font-black text-slate-800 tracking-tight">Student Full Profile</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg">
                   Print to PDF
                </button>
                <button onClick={() => setViewModal(false)} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="p-10 overflow-y-auto flex-1 print:overflow-visible font-sans">
              <div className="flex justify-between items-start mb-10 border-b-4 pb-8" style={{borderColor: branding.theme_color}}>
                 <div className="flex items-center gap-8">
                    {/* PROFILE IMAGE IN MODAL */}
                    <div className="relative group">
                       <div className="w-28 h-28 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                          {selectedStudent.profile_image ? (
                             <img 
                                src={`${API_BASE_URL}/uploads/profiles/${selectedStudent.profile_image}`} 
                                className="w-full h-full object-cover"
                                alt="Profile"
                             />
                          ) : (
                             <div className="flex flex-col items-center text-slate-300">
                                <User size={48} />
                                <span className="text-[10px] font-black mt-1">NO PHOTO</span>
                             </div>
                          )}
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-slate-100 text-blue-500 print:hidden">
                          <Camera size={16} />
                       </div>
                    </div>

                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Official Enrollment File</p>
                       <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">
                          {selectedStudent.first_name} {selectedStudent.middle_name} {selectedStudent.last_name}
                       </h2>
                       <div className="flex items-center gap-4 mt-2">
                          <p className="font-mono text-lg font-black text-slate-400 tracking-tighter">ID: {selectedStudent.student_id}</p>
                          <span className="h-4 w-[2px] bg-slate-200"></span>
                          <p className="font-bold text-slate-600 uppercase tracking-widest text-xs flex items-center gap-2">
                             <BookOpen size={14} className="text-blue-500"/> {selectedStudent.grade_level}
                          </p>
                       </div>
                    </div>
                 </div>
                 <div className="text-right print:hidden">
                    <img src={branding.school_logo} className="w-16 h-16 rounded-xl object-cover mb-2 ml-auto" alt="Logo" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{branding.school_name}</p>
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* I. PERSONAL & UPDATED CONTACT */}
                <div className="col-span-3">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4 border-b pb-2">I. Personal Information & Contact Updates</h4>
                  <div className="grid grid-cols-4 gap-y-6">
                      <InfoBox label="First Name" value={selectedStudent.first_name} bold />
                      <InfoBox label="Middle Name" value={selectedStudent.middle_name} />
                      <InfoBox label="Last Name" value={selectedStudent.last_name} bold />
                      <InfoBox label="Suffix" value={selectedStudent.suffix} />
                      
                      <InfoBox label="LRN" value={selectedStudent.lrn} />
                      <InfoBox label="Gender" value={selectedStudent.gender} />
                      <InfoBox label="Date of Birth" value={selectedStudent.dob} />
                      <InfoBox label="Email Address" value={selectedStudent.email} bold />
                      <InfoBox label="Mobile Number" value={selectedStudent.mobile_no} bold />
                      <div className="col-span-3"><InfoBox label="Home Address" value={selectedStudent.address_house} bold /></div>
                  </div>
                </div>

                {/* II. PARENT INFO */}
                <div className="col-span-3 mt-4">
                   <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 border-b pb-2">II. Parent / Guardian Details</h4>
                   <div className="grid grid-cols-3 gap-y-6">
                      <InfoBox label="Father's Name" value={selectedStudent.father_name} />
                      <InfoBox label="Father Contact" value={selectedStudent.father_contact} />
                      <InfoBox label="Mother's Name" value={selectedStudent.mother_name} />
                      <InfoBox label="Mother Contact" value={selectedStudent.mother_contact} />
                      <InfoBox label="Guardian Name" value={selectedStudent.guardian_name} />
                      <InfoBox label="Guardian Contact" value={selectedStudent.guardian_contact} />
                   </div>
                </div>

                {/* III. ACADEMIC RECORD */}
                <div className="col-span-3 mt-4">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 border-b pb-2">III. Academic Record</h4>
                  <div className="grid grid-cols-3 gap-y-6">
                      <InfoBox label="School Year" value={selectedStudent.school_year} bold />
                      <InfoBox label="Grade Level" value={selectedStudent.grade_level} bold />
                      <InfoBox label="Enrollment Type" value={selectedStudent.enrollment_type} />
                      <div className="col-span-3"><InfoBox label="Previous School" value={selectedStudent.prev_school} /></div>
                  </div>
                </div>
              </div>

              <div className="hidden print:block mt-20 border-t pt-10">
                 <div className="flex justify-between">
                    <div className="text-center">
                       <div className="w-48 border-b-2 border-slate-800 mb-2 mx-auto"></div>
                       <p className="text-[10px] font-bold uppercase">Registrar Signature</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Date Generated</p>
                       <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Components
const Input = ({ label, type="text", value, onChange, placeholder, required=false }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label} {required && '*'}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}
           className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm" />
  </div>
);

const Select = ({ label, value, onChange, options }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const InfoBox = ({ label, value, bold=false }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    <p className={`text-sm ${bold ? 'font-black text-slate-800' : 'font-medium text-slate-600'}`}>
      {value || '---'}
    </p>
  </div>
);

export default StudentManagement;