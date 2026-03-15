import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, CheckCircle2, Megaphone, Wallet, 
  Receipt, Calendar, Lock, Loader2, ArrowLeft, Info, Tags, Eye, X, Printer, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentAccounting = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [billingItems, setBillingItems] = useState([]); 
  const [viewModal, setViewModal] = useState({ open: false, type: '' });

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_students.php`);
      const allStudents = res.data.students; 
      const allItems = res.data.billing_items;
      const myData = allStudents.find(s => s.email === user.email);
      
      if (myData) {
        // --- CALCULATION LOGIC ---
        const total = parseFloat(myData.total_amount || 0);
        const paid = parseFloat(myData.paid_amount || 0);
        
        // Accurate Balance: Hindi mag-ne-negative
        const calculatedBalance = Math.max(0, total - paid);
        myData.balance = calculatedBalance.toFixed(2);

        let currentPaidPool = paid;
        const rawItems = allItems.filter(item => 
          parseInt(item.billing_id) === parseInt(myData.billing_id)
        );

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
    } catch (err) {
      console.error("Error fetching accounting data:", err);
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

  // --- STRICT STATUS CHECKS (MATH BASED) ---
  const totalAmt = parseFloat(studentData?.total_amount || 0);
  const paidAmt = parseFloat(studentData?.paid_amount || 0);

  const isPaid = paidAmt >= totalAmt && totalAmt > 0;
  const isPartial = paidAmt > 0 && paidAmt < totalAmt;
  const isUnpaid = paidAmt <= 0;

  // Helper para siguraduhing HEX ang kulay (iwas oklch error)
  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#3b82f6';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Finance Records...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      
      {/* DASHBOARD - HIDDEN ON PRINT */}
      <div className="print:hidden space-y-8">
        <header className="flex justify-between items-end">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Finance Portal</span>
              <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md italic">S.Y. {studentData?.school_year}</span>
              {/* Dynamic Tag based on Math */}
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${isUnpaid ? 'bg-red-500 text-white' : isPartial ? 'bg-yellow-500 text-[#001f3f]' : 'bg-emerald-500 text-white'}`}>
                {isPaid ? 'Fully Paid' : isPartial ? 'Partial Payment' : 'Unpaid'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
              Accounting <span style={{ color: safeThemeColor }}>Records</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Assessment for Student ID: {studentData?.student_id}</p>
          </div>
        </header>

        {(isUnpaid || isPartial) && (
          <div className={`${isUnpaid ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'} border-2 p-6 rounded-[2rem] flex items-center gap-5`}>
            <div className={`${isUnpaid ? 'bg-red-500' : 'bg-yellow-500'} text-white p-3 rounded-2xl shadow-lg`}>
               <Info size={24} />
            </div>
            <div>
              <p className={`text-[11px] font-black uppercase tracking-widest leading-none ${isUnpaid ? 'text-red-900' : 'text-yellow-900'}`}>
                {isUnpaid ? 'Account Pending' : 'Balance Remaining'}
              </p>
              <p className={`text-[10px] font-bold mt-1 uppercase ${isUnpaid ? 'text-red-600/70' : 'text-yellow-600/70'}`}>
                {isUnpaid ? 'Please settle your remaining balance to activate all LMS features.' : `You have an outstanding partial balance of ₱${parseFloat(studentData?.balance).toLocaleString()}. Please settle to complete your record.`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div style={{ backgroundColor: safeThemeColor }} className="p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <Wallet size={40} className="mb-6 text-yellow-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Remaining Balance</p>
                <h2 className="text-4xl font-black mt-1">₱ {parseFloat(studentData?.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>

              <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl ${isUnpaid ? 'bg-red-50' : isPartial ? 'bg-yellow-50' : 'bg-emerald-50'}`}>
                    {isUnpaid ? <Lock size={24} className="text-red-500" /> : <CheckCircle2 size={24} className={isPartial ? 'text-yellow-600' : 'text-emerald-600'} />}
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${isUnpaid ? 'bg-red-100 text-red-700' : isPartial ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                     {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                  </span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
                <h2 className="text-2xl font-black text-slate-900 mt-1">₱ {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic flex items-center gap-2">
                  <Calendar size={12}/> {studentData?.last_payment_date || 'N/A'}
                </p>
              </div>
            </div>

            <div style={{ backgroundColor: safeThemeColor }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl">
              <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
              <marquee className="font-black text-xs uppercase tracking-widest italic">Important: Please settle any outstanding balance to avoid late enrollment penalties.</marquee>
            </div>

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
                    {billingItems.length > 0 ? (
                      billingItems.map((item, index) => (
                        <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                          <td className="py-5 text-slate-600 font-medium">{item.item_name}</td>
                          <td className="py-5 text-right font-black text-slate-900">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-50">
                        <td className="py-6 text-emerald-600 italic font-medium">All specified items have been settled.</td>
                        <td className="py-6 text-right font-black text-slate-400">₱ 0.00</td>
                      </tr>
                    )}
                    <tr className="border-b border-slate-50 text-emerald-600">
                      <td className="py-6 italic font-medium">Total Paid Amount</td>
                      <td className="py-6 text-right font-black text-lg">- ₱ {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr className={`border-t-2 border-slate-100 ${isUnpaid ? 'text-red-600' : isPartial ? 'text-yellow-600' : 'text-slate-900'}`}>
                      <td className="py-6 uppercase tracking-widest text-[10px] font-black">Current Balance Due</td>
                      <td className="py-6 text-right font-black text-2xl underline decoration-double">₱ {parseFloat(studentData?.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <div className={`p-8 rounded-[2.5rem] border-4 ${isUnpaid ? 'bg-red-50 border-red-100' : isPartial ? 'bg-yellow-50 border-yellow-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center gap-4">
                <div style={{ backgroundColor: isUnpaid ? '#ef4444' : isPartial ? '#eab308' : '#10b981' }} className="text-white p-4 rounded-2xl shadow-lg transition-colors duration-500">
                   {isUnpaid ? <CreditCard size={24}/> : <CheckCircle2 size={24}/>}
                </div>
                <div>
                  <p className={`font-black text-xl leading-none ${isUnpaid ? 'text-red-700' : isPartial ? 'text-yellow-700' : 'text-emerald-700'}`}>
                    {isPaid ? 'PAID' : isPartial ? 'PARTIAL' : 'UNPAID'}
                  </p>
                  <p className={`text-[9px] font-bold uppercase mt-1 ${isUnpaid ? 'text-red-500' : isPartial ? 'text-yellow-600' : 'text-emerald-600'}`}>
                    Record Status: {isUnpaid ? 'Inactive' : 'Active'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Document Hub</h3>
              <div className="space-y-3">
                <ViewBtn label="Billing Statement" onClick={() => setViewModal({ open: true, type: 'Billing Statement' })} />
                <ViewBtn label="Official Receipt" onClick={() => setViewModal({ open: true, type: 'Official Receipt' })} />
                <ViewBtn label="Payment Voucher" onClick={() => setViewModal({ open: true, type: 'Payment Voucher' })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {viewModal.open && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 print:shadow-none print:rounded-none print:w-full print:max-w-none">
            
            <div className="flex justify-between items-center p-8 border-b border-slate-100 print:hidden">
              <h2 className="font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2">
                <Eye size={20} className="text-blue-600"/> {viewModal.type} Preview
              </h2>
              <button onClick={() => setViewModal({ open: false, type: '' })} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto bg-slate-50 print:bg-white print:max-h-none print:overflow-visible print:p-0">
              <div id="printable-document" className="bg-white p-10 shadow-sm border border-slate-200 mx-auto font-mono text-[11px] leading-relaxed text-slate-800 print:border-none print:shadow-none print:w-full">
                
                <div className="flex flex-col items-center text-center mb-8 border-b-2 border-slate-900 pb-6">
                  {branding.school_logo ? (
                    <img src={branding.school_logo} alt="School Logo" className="w-24 h-24 object-contain mb-3" />
                  ) : (
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon className="text-slate-300" size={30} />
                    </div>
                  )}
                  <h1 className="text-xl font-black uppercase tracking-widest leading-tight">
                    {branding.school_name || "SCHOOL MANAGEMENT SYSTEM"}
                  </h1>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-60 italic mt-1">
                    Official Digital Finance Record
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-[10px]">
                  <div>
                    <p><span className="font-black">STUDENT ID:</span> {studentData.student_id}</p>
                    <p><span className="font-black">NAME:</span> {studentData.first_name} {studentData.last_name}</p>
                    <p><span className="font-black">LEVEL:</span> {studentData.grade_level} - {studentData.section}</p>
                  </div>
                  <div className="text-right">
                    <p><span className="font-black">DATE:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-black">SY:</span> {studentData.school_year}</p>
                    <p><span className="font-black">STATUS:</span> {isPaid ? 'Fully Paid' : isPartial ? 'Partial' : 'Unpaid'}</p>
                  </div>
                </div>

                <table className="w-full mb-8 border-t border-b border-slate-900 py-4">
                  <thead>
                    <tr className="font-black border-b border-slate-200 text-left">
                      <th className="py-2">PARTICULARS</th>
                      <th className="py-2 text-right">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingItems.length > 0 ? billingItems.map((item, i) => (
                      <tr key={i}>
                        <td className="py-1 uppercase text-[10px]">{item.item_name}</td>
                        <td className="text-right py-1">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    )) : (
                        <tr>
                            <td className="py-1 italic text-emerald-600">All current tuition items settled.</td>
                            <td className="text-right py-1">₱ 0.00</td>
                        </tr>
                    )}
                  </tbody>
                </table>

                <div className="space-y-1 text-right border-t-2 border-slate-900 pt-4">
                  <p className="text-[10px]"><span className="font-black uppercase">TOTAL ASSESSMENT:</span> ₱ {totalAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  <p className="text-[10px] text-emerald-600"><span className="font-black uppercase">TOTAL PAID:</span> - ₱ {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    <p className="text-lg font-black underline underline-offset-4 decoration-double">BALANCE: ₱ {parseFloat(studentData.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 text-center opacity-40 italic text-[8px]">
                  Portal Generated: {new Date().toLocaleString()} | Valid for S.Y. {studentData.school_year}.
                </div>
              </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 flex gap-4 print:hidden">
              <button 
                onClick={handlePrint} 
                className="flex-1 py-4 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:brightness-90 transition-all flex items-center justify-center gap-2 shadow-lg"
                style={{ backgroundColor: safeThemeColor }}
              >
                <Printer size={16} /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewBtn = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group"
  >
    {label} <Eye size={14} className="text-blue-400 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentAccounting;