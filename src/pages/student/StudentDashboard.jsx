import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, BookOpen, CreditCard, Lock, Unlock,
  LogOut, CheckCircle2, Megaphone, Wallet,
  Info, Eye, Menu, X, Camera, Save, Edit3, ArrowRight, Loader2,
  Printer, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // --- STATES FOR MODALS ---
  const [billingItems, setBillingItems] = useState([]); 
  const [viewModal, setViewModal] = useState({ open: false, type: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // --- ADDED STATE FOR ORIGINAL BILLING (PARA SA TUITION CALCULATION) ---
  const [allBillingItems, setAllBillingItems] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/student/get_students.php`);
      const studentsArray = res.data.students;
      const allItems = res.data.billing_items;

      if (studentsArray && Array.isArray(studentsArray)) {
        const myData = studentsArray.find(s => s.email === user.email);
        if (myData) {
          const total = parseFloat(myData.total_amount || 0);
          const paid = parseFloat(myData.paid_amount || 0);
          
          const rawItems = allItems.filter(item => 
            parseInt(item.billing_id) === parseInt(myData.billing_id)
          );

          // Save original items for threshold calculation
          setAllBillingItems(rawItems);

          // Logic para sa breakdown display (kung ano pa ang kulang)
          let currentPaidPool = paid;
          const remainingItems = rawItems.map(item => {
            let itemAmount = parseFloat(item.amount);
            if (currentPaidPool > 0) {
              if (currentPaidPool >= itemAmount) {
                currentPaidPool -= itemAmount;
                return null;
              } else {
                const newAmount = itemAmount - currentPaidPool;
                currentPaidPool = 0;
                return { ...item, amount: newAmount };
              }
            }
            return item;
          }).filter(item => item !== null);

          setStudentData(myData);
          setBillingItems(remainingItems);
        }
      }
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  const handlePrint = () => {
    window.print();
  };

  // --- CALCULATION LOGIC ---
  const totalAmount = parseFloat(studentData?.total_amount || 0);
  const paidAmount = parseFloat(studentData?.paid_amount || 0);
  const remainingBalance = Math.max(0, totalAmount - paidAmount);

  const isPaid = paidAmount >= totalAmount && totalAmount > 0;
  const isUnpaid = paidAmount <= 0;
  const isPartial = paidAmount > 0 && paidAmount < totalAmount;

  // --- STRICT ITEM-SPECIFIC LMS LOGIC (NEW UPDATE) ---
  // Hahanapin natin ang Tuition Item at ang specific na paid_amount nito mula sa database
  const tuitionItem = allBillingItems.find(item => 
    item.item_name.toLowerCase().includes('tuition')
  );

  // Kunin ang actual na bayad na pumasok sa Tuition item lang
  const actualTuitionPaid = tuitionItem ? parseFloat(tuitionItem.paid_amount || 0) : 0;
  const tuitionAmount = tuitionItem ? parseFloat(tuitionItem.amount || 0) : 0;
  const tuitionThreshold = tuitionAmount * 0.5;

  // LMS is active ONLY if:
  // 1. Fully paid na ang lahat (isPaid)
  // 2. OR ang ACTUAL payment sa TUITION item ay umabot na sa 50%
  const isLmsActive = isPaid || (tuitionAmount > 0 && actualTuitionPaid >= tuitionThreshold);

  // --- DYNAMIC STYLES FOR LMS CARD AND NOTICES ---
  let lmsStatusLabel = "INACTIVE";
  let lmsBgColor = "bg-red-50 border-red-100";
  let lmsStatusColor = "bg-red-500";
  let lmsTextColor = "text-red-700";

  if (isLmsActive) {
    if (isPaid) {
      lmsStatusLabel = "ACTIVE";
      lmsBgColor = "bg-emerald-50 border-emerald-100";
      lmsStatusColor = "bg-emerald-500";
      lmsTextColor = "text-emerald-700";
    } else {
      lmsStatusLabel = "ACTIVE";
      lmsBgColor = "bg-yellow-50 border-yellow-100";
      lmsStatusColor = "bg-yellow-500";
      lmsTextColor = "text-yellow-700";
    }
  }
  
  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#3b82f6';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Student Data...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500 font-sans print:p-0 print:m-0 print:max-w-none">
      
      <style>
        {`
          @keyframes scroll-text {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .animate-scroll {
            display: inline-block;
            white-space: nowrap;
            animation: scroll-text 15s linear infinite;
          }
        `}
      </style>

      {/* 1. DASHBOARD CONTENT (HIDDEN ON PRINT) */}
      <div className="print:hidden space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                {studentData?.grade_level || 'N/A'}
              </span>
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">
                {studentData?.enrollment_type || 'Continuing'}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md 
                ${isUnpaid ? 'bg-red-500 text-white' : isPaid ? 'bg-emerald-500 text-white' : 'bg-yellow-500 text-[#001f3f]'}`}>
                {isPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Partial Payment'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Mabuhay, <span style={{ color: safeThemeColor }}>{studentData?.first_name}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Student ID: {studentData?.student_id}</p>
          </div>
        </header>

        {/* --- DYNAMIC ACCOUNT NOTICE --- */}
        <div className={`border-2 p-5 rounded-3xl flex items-center gap-4 ${!isLmsActive ? 'bg-red-50 border-red-100' : isPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-yellow-50 border-yellow-100'}`}>
          <div className={`text-white p-2 rounded-xl shadow-lg ${!isLmsActive ? 'bg-red-500' : isPaid ? 'bg-emerald-500' : 'bg-yellow-500'}`}>
            {!isLmsActive ? <Lock size={20} /> : <CheckCircle2 size={20} />}
          </div>
          <div className="flex flex-col">
            <p className={`text-[11px] font-black uppercase tracking-tight ${!isLmsActive ? 'text-red-900' : isPaid ? 'text-emerald-900' : 'text-yellow-900'}`}>
              Account Status: {!isLmsActive ? 'LMS ACCESS LOCKED' : isPaid ? 'ACCOUNT FULLY SETTLED' : 'LMS ACCESS ACTIVE (PARTIAL)'}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase">
              {!isLmsActive 
                ? `Requirement: You need to pay at least ₱${tuitionThreshold.toLocaleString()} (50% of Tuition) to unlock LMS.` 
                : isPaid 
                  ? "Enjoy full access to all school services and digital platforms."
                  : `Tuition milestone reached. Remaining balance of ₱${remainingBalance.toLocaleString()} still applies for other fees.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div style={{ backgroundColor: safeThemeColor }} className="p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                  <Wallet size={40} className="mb-6 text-yellow-500" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Remaining Balance</p>
                  <h2 className="text-4xl font-black mt-1">₱ {remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                  <button onClick={() => navigate('/student/accounting')} className="mt-6 flex items-center gap-2 text-[9px] font-black uppercase bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all">
                    View Breakdown <ArrowRight size={14}/>
                  </button>
                </div>

                <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${isUnpaid ? 'bg-red-50' : isPaid ? 'bg-emerald-50' : 'bg-yellow-50'}`}>
                      {isUnpaid ? <Lock size={24} className="text-red-500" /> : <CheckCircle2 size={24} className={isPaid ? 'text-emerald-600' : 'text-yellow-600'} />}
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${isUnpaid ? 'bg-red-100 text-red-700' : isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {isPaid ? 'Paid' : isUnpaid ? 'Unpaid' : 'Partial'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">₱ {paidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic">Processed: {studentData?.last_payment_date || 'N/A'}</p>
                </div>
            </div>

            <div style={{ backgroundColor: safeThemeColor }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl overflow-hidden relative">
              <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500 z-10 bg-inherit pr-2" />
              <div className="flex-1 overflow-hidden">
                <p className="animate-scroll font-black text-xs uppercase tracking-widest italic">
                    Important: School Year {studentData?.school_year} enrollment is ongoing. Please visit the registrar for more details. 
                </p>
              </div>
            </div>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
              <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-500"/> Enrollment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                 <InfoItem label="Grade Level" value={studentData?.grade_level} />
                 <InfoItem label="Classification" value={studentData?.enrollment_type} />
                 <InfoItem label="School Year" value={studentData?.school_year} />
                 <InfoItem label="Payment Status" value={isPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Partial'} />
                 <InfoItem label="Payment Plan" value={studentData?.payment_plan} />
                 <InfoItem label="LRN Number" value={studentData?.lrn} />
              </div>
            </section>
          </div>

          <div className="space-y-8">
              {/* LMS ACCESS STATUS CARD - DYNAMICALLY UPDATED */}
              <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 ${lmsBgColor}`}>
                <div className="flex items-center gap-4">
                   <div className={`text-white p-4 rounded-2xl shadow-lg transition-colors duration-500 ${lmsStatusColor}`}>
                      {isLmsActive ? <Unlock size={24}/> : <Lock size={24}/>}
                   </div>
                   <div>
                      <p className={`font-black text-xl leading-none ${lmsTextColor}`}>
                        {lmsStatusLabel}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">LMS Access Status</p>
                   </div>
                </div>
                
                <div className="mt-4">
                   {!isLmsActive && (
                     <p className="text-[8px] font-bold text-red-700 uppercase italic leading-tight">
                        * Minimum of 50% tuition payment (₱{tuitionThreshold.toLocaleString()}) required.
                     </p>
                   )}
                   {isLmsActive && !isPaid && (
                     <p className="text-[8px] font-bold text-yellow-700 uppercase italic leading-tight">
                        * LMS Active (Tuition Milestone reached).
                     </p>
                   )}
                   {isPaid && (
                     <p className="text-[8px] font-bold text-emerald-700 uppercase italic leading-tight">
                        * LMS Active (Account Fully Paid).
                     </p>
                   )}
                </div>
              </div>

              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
                 <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Quick Access</h3>
                 <div className="space-y-3">
                    <ViewBtn label="My Full Profile" onClick={() => setIsProfileOpen(true)} />
                    <ViewBtn 
                      label="Billing Statement" 
                      onClick={() => setViewModal({ open: true, type: 'Billing Statement' })} 
                    />
                    <ViewBtn label="Class Schedule" onClick={() => navigate('')} />
                    <ViewBtn label="Student Handbook" />
                 </div>
              </div>
          </div>
        </div>
      </div>

      {/* BILLING MODAL */}
      {viewModal.open && studentData && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-start justify-center p-4 pt-10 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><CreditCard size={24}/></div>
                <h3 className="font-black text-slate-800 tracking-tight">Student Billing Statement</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg">
                   <Printer size={18} /> Print to PDF
                </button>
                <button onClick={() => setViewModal({ open: false, type: '' })} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 print:overflow-visible font-sans">
              <div className="flex items-start justify-between mb-8 border-b-4 border-slate-900 pb-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 shadow-md">
                    {studentData.profile_image ? (
                      <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400 font-black text-4xl">{studentData.first_name?.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase leading-tight">{branding.school_name}</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-2">Office of the Finance & Accounting</p>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none mb-2">{studentData.first_name} {studentData.last_name}</h2>
                    <p className="font-mono text-sm font-bold text-slate-500">ID: {studentData.student_id} • ₱ {remainingBalance.toLocaleString()} Balance</p>
                  </div>
                </div>
                <div className="text-right">
                  <img src={branding.school_logo} className="w-16 h-16 object-cover ml-auto mb-1" alt="Logo" />
                  <p className="text-[8px] font-bold text-slate-400 italic">SOA Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-6">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Particulars</th>
                      <th className="py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="py-4 font-bold text-slate-700 uppercase text-xs">{item.item_name}</td>
                        <td className="py-4 text-right font-black text-slate-900">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-slate-900 text-white p-6 rounded-3xl flex justify-between items-center mt-4 print:bg-slate-100 print:text-slate-900">
                   <p className="font-black uppercase text-[10px] tracking-widest opacity-70">Grand Total Balance</p>
                   <p className="text-3xl font-black">₱ {remainingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE MODAL */}
      {isProfileOpen && studentData && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-start justify-center p-4 pt-10 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><User size={24}/></div>
                <h3 className="font-black text-slate-800 tracking-tight">Student Full Profile</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all shadow-lg">
                   <Printer size={18} /> Print to PDF
                </button>
                <button onClick={() => setIsProfileOpen(false)} className="p-2.5 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={20}/></button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 print:overflow-visible font-sans">
              <div className="flex items-start justify-between mb-10 border-b-4 border-slate-900 pb-8">
                <div className="flex items-center gap-8">
                  <div className="w-28 h-28 rounded-2xl bg-slate-100 overflow-hidden border-2 border-slate-200 shadow-md">
                    {studentData.profile_image ? (
                      <img src={`${API_BASE_URL}/uploads/profiles/${studentData.profile_image}`} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-400 font-black text-5xl">{studentData.first_name?.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 uppercase leading-tight">{branding.school_name}</h1>
                    <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4">Official Enrollment Profile</p>
                    <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">{studentData.first_name} {studentData.last_name}</h2>
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-900 text-white px-3 py-1 rounded-lg font-mono text-xs">ID: {studentData.student_id}</span>
                      <span className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{studentData.grade_level}</span>
                    </div>
                  </div>
                </div>
                <img src={branding.school_logo} className="w-24 h-24 object-cover" alt="Logo" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
                 <InfoItem label="Enrollment Type" value={studentData.enrollment_type} />
                 <InfoItem label="Grade Level" value={studentData.grade_level} />
                 <InfoItem label="LRN Number" value={studentData.lrn} />
                 <InfoItem label="Contact Email" value={studentData.email} />
                 <InfoItem label="Account Status" value={isPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Partial'} />
                 <InfoItem label="School Year" value={studentData.school_year} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[14px] font-black text-slate-900">{value || '---'}</p>
  </div>
);

const ViewBtn = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group"
  >
    {label} <Eye size={14} className="text-blue-400 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentDashboard;