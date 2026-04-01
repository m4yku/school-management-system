import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Send, CheckCircle2, Info, 
  FileText, Loader2, AlertCircle, X, Trash2,
  Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentScholarship = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scholarshipTypes, setScholarshipTypes] = useState([]);
  // DAGDAG: State para sa existing applications ng student
  const [myApplications, setMyApplications] = useState([]);
  
  const [selectedType, setSelectedType] = useState('');
  const [files, setFiles] = useState([]); 
  const [message, setMessage] = useState({ text: '', type: '' });

  const safeThemeColor = branding?.theme_color || '#3b82f6';

  useEffect(() => {
    fetchScholarships();
    fetchMyApplications(); // I-fetch ang status pagka-load ng page
  }, []);

  const fetchScholarships = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/fetch_scholarships.php`);
      if (Array.isArray(res.data)) {
        setScholarshipTypes(res.data);
      } else {
        setScholarshipTypes([]);
      }
    } catch (err) {
      setScholarshipTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // DAGDAG: Function para makuha ang application status ng student
  const fetchMyApplications = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/get_student_applications.php?email=${user.email}`);
      if (res.data.status === 'success') {
        setMyApplications(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching application status:", err);
    }
  };

  const handleFileChange = (e) => {
    const chosenFiles = Array.from(e.target.files);
    setFiles((prevFiles) => [...prevFiles, ...chosenFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType || files.length === 0) {
      setMessage({ text: 'Please select a scholarship and upload at least one requirement.', type: 'error' });
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('email', user.email);
    formData.append('scholarship_id', selectedType);
    
    // TAMA: Gamitin ang 'files' (ito ang state name mo sa line 19)
    files.forEach(file => {
      formData.append('requirements[]', file); 
    });

    try {
      const res = await axios.post(`${API_BASE_URL}/student/submit_application.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // ... rest of your code
      if (res.data.status === 'success') {
        setMessage({ text: 'Application submitted successfully!', type: 'success' });
        setFiles([]);
        setSelectedType('');
        fetchMyApplications(); // Refresh ang listahan pagkatapos mag-submit
      } else {
        setMessage({ text: res.data.message, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Server error. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Scholarships...
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500 font-sans">
      
      <header className="space-y-2">
        <div className="flex items-center gap-2">
           <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
            Financial Aid
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
          Apply for <span style={{ color: safeThemeColor }}>Scholarship.</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">
          Centralized Grant Management System
        </p>
      </header>

      {message.text && (
        <div className={`p-5 rounded-3xl border-2 flex items-center gap-4 animate-in slide-in-from-top-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={20}/> : <AlertCircle size={20}/>}
          <p className="text-xs font-black uppercase tracking-tight">{message.text}</p>
          <button onClick={() => setMessage({text:'', type:''})} className="ml-auto"><X size={16}/></button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* MAIN FORM */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm space-y-8">
            <section className="space-y-4">
              <label className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <Info size={16} className="text-blue-500"/> Select Scholarship Program
              </label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-blue-400 outline-none transition-all font-bold text-sm"
              >
                <option value="">Choose from available grants...</option>
                {scholarshipTypes.length > 0 ? (
                  scholarshipTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} — {type.discount_value}% Discount
                    </option>
                  ))
                ) : (
                  <option disabled>No active scholarships found</option>
                )}
              </select>
            </section>

            <section className="space-y-4">
              <label className="font-black text-slate-800 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <FileText size={16} className="text-blue-500"/> Upload Documentary Requirements
              </label>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  multiple 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${
                  files.length > 0 ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 group-hover:border-blue-400'
                }`}>
                  <Upload className={`mx-auto mb-4 ${files.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} size={40} />
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">
                    {files.length > 0 ? `${files.length} file(s) selected` : "Drop files here or click to browse"}
                  </p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2 mt-4">
                  {files.map((f, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <FileText size={14} className="text-blue-500" />
                        <span className="text-[10px] font-black text-slate-600 truncate max-w-[200px] uppercase">{f.name}</span>
                      </div>
                      <button type="button" onClick={() => removeFile(index)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button 
              disabled={submitting}
              type="submit" 
              style={{ backgroundColor: safeThemeColor }}
              className="w-full text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={20}/> : <Send size={20} />}
              {submitting ? "Processing..." : "Submit Application"}
            </button>
          </form>

          {/* DAGDAG: APPLICATION STATUS TRACKER SECTION */}
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
            <h3 className="font-black text-slate-800 uppercase text-[12px] tracking-[0.2em] mb-6 flex items-center gap-2">
              <Clock size={18} className="text-blue-600" /> My Application History
            </h3>
            
            <div className="space-y-4">
              {myApplications.length > 0 ? (
                myApplications.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-slate-50/50">
                    <div className="space-y-1">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{app.scholarship_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Applied on {app.date_applied}</p>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${
                      app.status === 'Approved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                      app.status === 'Rejected' ? 'bg-red-50 border-red-100 text-red-600' :
                      'bg-orange-50 border-orange-100 text-orange-600'
                    }`}>
                      {app.status === 'Approved' ? <CheckCircle size={14}/> : 
                       app.status === 'Rejected' ? <XCircle size={14}/> : 
                       <Loader2 className="animate-spin" size={14}/>}
                      <span className="text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">No applications found.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-black text-[10px] uppercase tracking-widest mb-6 text-slate-400 italic">Submission Guide</h3>
              <ul className="space-y-4">
                <GuideItem step="1" text="Ensure GWA or Indigency requirements are scanned clearly." />
                <GuideItem step="2" text="You can upload multiple documents (e.g., Report Card and Tax Exemption)." />
                <GuideItem step="3" text="The Registrar will verify your documents within 2-3 days." />
                <GuideItem step="4" text="The Cashier will apply the discount to your billing once approved." />
              </ul>
            </div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-100 p-8 rounded-[2.5rem]">
            <h3 className="font-black text-yellow-800 text-xs uppercase tracking-widest mb-2">Need Help?</h3>
            <p className="text-[10px] font-bold text-yellow-700/70 uppercase leading-relaxed">
              For issues regarding scholarship eligibility, please visit the Office of Student Affairs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideItem = ({ step, text }) => (
  <li className="flex gap-4">
    <span className="font-black text-blue-400 text-xs">{step}.</span>
    <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed">{text}</p>
  </li>
);

export default StudentScholarship;