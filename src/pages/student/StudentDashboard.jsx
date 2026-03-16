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
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // --- STATES FOR MODALS ---
  const [billingItems, setBillingItems] = useState([]); 
  const [viewModal, setViewModal] = useState({ open: false, type: '' });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_students.php`);
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

  const totalAmount = parseFloat(studentData?.total_amount || 0);
  const paidAmount = parseFloat(studentData?.paid_amount || 0);
  const tuitionOnly = parseFloat(studentData?.tuition_only_amount || 0); 
  const remainingBalance = Math.max(0, totalAmount - paidAmount);

  const isPaid = paidAmount >= totalAmount && totalAmount > 0;
  const isPartial = paidAmount > 0 && paidAmount < totalAmount;
  const isUnpaid = paidAmount <= 0;

  const tuitionThreshold = tuitionOnly * 0.5;
  const isLmsActive = paidAmount >= tuitionThreshold && tuitionThreshold > 0;
  
  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#3b82f6';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Student Data...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500 font-sans print:p-0 print:m-0 print:max-w-none">
      
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
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${isUnpaid ? 'bg-red-500 text-white' : isPartial ? 'bg-yellow-500 text-[#001f3f]' : 'bg-emerald-500 text-white'}`}>
                {isPaid ? 'Fully Paid' : isPartial ? 'Partial Payment' : 'Unpaid'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Mabuhay, <span style={{ color: safeThemeColor }}>{studentData?.first_name}!</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Student ID: {studentData?.student_id}</p>
          </div>
        </header>

        {(isUnpaid || isPartial) && (
          <div className={`${isUnpaid ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'} border-2 p-5 rounded-3xl flex items-center gap-4`}>
            <div className={`${isUnpaid ? 'bg-red-500' : 'bg-yellow-500'} text-white p-2 rounded-xl shadow-lg`}>
              {isUnpaid ? <Lock size={20} /> : <Info size={20} />}
            </div>
            <p className={`text-[11px] font-black uppercase tracking-tight ${isUnpaid ? 'text-red-900' : 'text-yellow-900'}`}>
              Account Notice: Your account status is {isUnpaid ? 'UNPAID' : 'PARTIAL'}. 
              {isUnpaid ? ' Please settle your balance to activate all features.' : ` You have a remaining balance of ₱${remainingBalance.toLocaleString()} to settle.`}
            </p>
          </div>
        )}

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
                    <div className={`p-4 rounded-2xl ${isUnpaid ? 'bg-red-50' : isPartial ? 'bg-yellow-50' : 'bg-emerald-50'}`}>
                      {isUnpaid ? <Lock size={24} className="text-red-500" /> : <CheckCircle2 size={24} className={isPartial ? 'text-yellow-600' : 'text-emerald-600'} />}
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${isUnpaid ? 'bg-red-100 text-red-700' : isPartial ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">₱ {paidAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic">Processed: {studentData?.last_payment_date || 'N/A'}</p>
                </div>
            </div>

            <div style={{ backgroundColor: safeThemeColor }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl overflow-hidden relative">
              <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
              <marquee className="font-black text-xs uppercase tracking-widest italic">Important: School Year {studentData?.school_year} enrollment is ongoing.</marquee>
            </div>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-6 md:p-10 shadow-sm">
              <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-500"/> Enrollment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                 <InfoItem label="Grade Level" value={studentData?.grade_level} />
                 <InfoItem label="Classification" value={studentData?.enrollment_type} />
                 <InfoItem label="School Year" value={studentData?.school_year} />
                 <InfoItem label="Payment Status" value={isPaid ? 'Fully Paid' : isPartial ? 'Partial' : 'Unpaid'} />
                 <InfoItem label="Payment Plan" value={studentData?.payment_plan} />
                 <InfoItem label="LRN Number" value={studentData?.lrn} />
              </div>
            </section>
          </div>

          <div className="space-y-8">
              <div className={`p-8 rounded-[2.5rem] border-4 transition-all duration-500 
                ${isPaid ? 'bg-emerald-50 border-emerald-100' : 
                  isUnpaid ? 'bg-red-50 border-red-100' : 
                  'bg-yellow-50 border-yellow-100'}`}>
                <div className="flex items-center gap-4">
                   <div className={`text-white p-4 rounded-2xl shadow-lg transition-colors duration-500 
                      ${isPaid ? 'bg-emerald-500' : 
                        isUnpaid ? 'bg-red-500' : 
                        'bg-yellow-500'}`}>
                      {isLmsActive ? <Unlock size={24}/> : <Lock size={24}/>}
                   </div>
                   <div>
                      <p className={`font-black text-xl leading-none 
                        ${isPaid ? 'text-emerald-700' : 
                          isUnpaid ? 'text-red-700' : 
                          'text-yellow-700'}`}>
                        {isLmsActive ? 'ACTIVE' : 'INACTIVE'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">LMS Access Status</p>
                   </div>
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
                    {/* BINALIK SA text-xl DITO PARA PANTAY SA SCHOOL NAME */}
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
                    {/* BINALIK SA text-xl DITO PARA PANTAY SA SCHOOL NAME */}
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
                 <InfoItem label="Account Status" value={isPaid ? 'Fully Paid' : isPartial ? 'Partial' : 'Unpaid'} />
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