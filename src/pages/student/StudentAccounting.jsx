import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, CheckCircle2, Megaphone, Wallet, 
  Receipt, Calendar, Download, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentAccounting = () => {
  const { user, branding } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const studentRes = await axios.get(`${API_BASE_URL}/get_students.php`);
      const myData = studentRes.data.find(s => s.email === user.email);
      if (myData) {
        setStudentData(myData);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) fetchData();
  }, [user.email]);

  if (loading) return (
    <div className="h-96 flex items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest">
      Loading Finance Records...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION - Inalis ang Update Info Button */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Finance Portal</span>
            <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md italic">S.Y. {studentData?.school_year}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Accounting <span style={{ color: branding.theme_color }}>Records</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Assessment for Student ID: {studentData?.student_id}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* BALANCE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{ backgroundColor: branding.theme_color }} className="p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <Wallet size={40} className="mb-6 text-yellow-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Remaining Balance</p>
              <h2 className="text-4xl font-black mt-1">₱ {studentData?.balance || '0.00'}</h2>
              <div className="mt-6 flex gap-3">
                <span className="bg-black/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-white/5">Plan: {studentData?.payment_plan || 'N/A'}</span>
              </div>
            </div>

            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-emerald-50 rounded-2xl">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase">Good Standing</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">₱ {studentData?.last_payment || '0.00'}</h2>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic flex items-center gap-2">
                <Calendar size={12}/> {studentData?.payment_date || 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: branding.theme_color }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl">
            <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
            <marquee className="font-black text-xs uppercase tracking-widest italic">Important: Please settle any outstanding balance to avoid late enrollment penalties.</marquee>
          </div>

          {/* ASSESSMENT TABLE */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
            <h3 className="font-black text-slate-800 mb-8 uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
              <Receipt size={16} className="text-blue-500"/> Assessment Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="pb-4">Description</th>
                    <th className="pb-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-700">
                  <tr className="border-b border-slate-50">
                    <td className="py-6">Tuition & Miscellaneous Fees (SY {studentData?.school_year})</td>
                    <td className="py-6 text-right font-black text-slate-900 text-lg">₱ {studentData?.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* SIDEBAR CARDS */}
        <div className="space-y-8">
          <div className="p-8 rounded-[2.5rem] border-4 bg-emerald-50 border-emerald-100">
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: branding.theme_color }} className="text-white p-4 rounded-2xl shadow-lg">
                <CreditCard size={24}/>
              </div>
              <div>
                <p className="font-black text-xl leading-none text-emerald-700">FINANCE</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Record Status: Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Quick Downloads</h3>
            <div className="space-y-3">
              <DownloadBtn label="Billing Statement" />
              <DownloadBtn label="Official Receipt" />
              <DownloadBtn label="Payment Voucher" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// MINI COMPONENTS
const DownloadBtn = ({ label }) => (
  <button className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group">
    {label} <Download size={14} className="text-yellow-500 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentAccounting;