import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, BookOpen, CreditCard, Lock, Unlock,
  LogOut, CheckCircle2, Megaphone, Wallet,
  Info, Download, Menu, X, Camera, Save, Edit3, ArrowRight, Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_students.php`);
      const studentsArray = res.data.students;

      if (studentsArray && Array.isArray(studentsArray)) {
        const myData = studentsArray.find(s => s.email === user.email);
        if (myData) {
          setStudentData(myData);
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

  // --- ARITHMETIC LOGIC (SYNCED WITH STUDENT LMS) ---
  const totalAmount = parseFloat(studentData?.total_amount || 0);
  const paidAmount = parseFloat(studentData?.paid_amount || 0);
  const tuitionOnly = parseFloat(studentData?.tuition_only_amount || 0); 
  
  const remainingBalance = Math.max(0, totalAmount - paidAmount);

  // Status checks for box colors
  const isPaid = paidAmount >= totalAmount && totalAmount > 0;
  const isPartial = paidAmount > 0 && paidAmount < totalAmount;
  const isUnpaid = paidAmount <= 0;

  // --- GATEKEEPER LOGIC (GINAYA SA STUDENT LMS) ---
  // Magiging ACTIVE lang kung >= 50% ng Tuition Fee ang naibayad
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
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      
      {/* 1. WELCOME HEADER */}
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

      {/* 2. PAYMENT NOTIFICATION */}
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
          
          {/* 3. FINANCIAL OVERVIEW */}
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

          {/* 4. ANNOUNCEMENTS */}
          <div style={{ backgroundColor: safeThemeColor }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl overflow-hidden relative">
            <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
            <marquee className="font-black text-xs uppercase tracking-widest italic">Important: School Year {studentData?.school_year} enrollment is ongoing.</marquee>
          </div>

          {/* 5. ENROLLMENT DETAILS */}
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

        {/* 6. SIDE CARDS (LMS ACCESS STATUS - SYNCED LOGIC) */}
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
                    {/* Icon base sa 50% Tuition threshold */}
                    {isLmsActive ? <Unlock size={24}/> : <Lock size={24}/>}
                 </div>
                 <div>
                    <p className={`font-black text-xl leading-none 
                      ${isPaid ? 'text-emerald-700' : 
                        isUnpaid ? 'text-red-700' : 
                        'text-yellow-700'}`}>
                      {/* Text base sa 50% Tuition threshold */}
                      {isLmsActive ? 'ACTIVE' : 'INACTIVE'}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">LMS Access Status</p>
                 </div>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
               <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Quick Access</h3>
               <div className="space-y-3">
                  <DownloadBtn label="Class Schedule" onClick={() => navigate('/student/schedule')} />
                  <DownloadBtn label="Student Handbook" />
                  <DownloadBtn label="Billing Statement" onClick={() => navigate('/student/accounting')} />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[13px] font-black text-slate-900">{value || '---'}</p>
  </div>
);

const DownloadBtn = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group"
  >
    {label} <Download size={14} className="text-yellow-500 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentDashboard;