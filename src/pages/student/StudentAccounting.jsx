import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, CheckCircle2, Megaphone, Wallet, 
  Receipt, Calendar, Lock, Loader2, Info, Eye, X, Printer, Image as ImageIcon 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentAccounting = () => {
  const { user, branding, API_BASE_URL } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [billingItems, setBillingItems] = useState([]); 
  const [viewModal, setViewModal] = useState({ open: false, type: '' });

  const fetchData = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/student/get_students.php`);
    const allStudents = res.data.students; 
    const allItems = res.data.billing_items;
    const myData = allStudents.find(s => s.email === user.email);
    
    if (myData) {
      // 1. Kunin lahat ng items para sa billing na ito
      const rawItems = allItems.filter(item => 
        parseInt(item.billing_id) === parseInt(myData.billing_id)
      );

      // 2. Filter logic: Ipakita lang ang items na may utang pa (Amount > Paid Amount)
      const remainingItems = rawItems.map(item => {
        const amount = parseFloat(item.amount || 0);
        const paid = parseFloat(item.paid_amount || 0); // Gamitin ang actual paid per item
        const itemBalance = amount - paid;

        // Kung bayad na ang item na ito (balance is 0), wag na isama sa listahan
        if (itemBalance <= 0) return null;

        return { ...item, amount: itemBalance }; // Ipakita ang natitirang babayaran
      }).filter(item => item !== null);

      // 3. I-calculate ang overall balance base sa natitirang items
      const totalBalance = remainingItems.reduce((acc, item) => acc + item.amount, 0);
      myData.balance = totalBalance.toFixed(2);

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

  const totalAmt = parseFloat(studentData?.total_amount || 0);
  const paidAmt = parseFloat(studentData?.paid_amount || 0);
  const isPaid = paidAmt >= totalAmt && totalAmt > 0;
  const isPartial = paidAmt > 0 && paidAmt < totalAmt;
  const isUnpaid = paidAmt <= 0;
  const safeThemeColor = branding?.theme_color?.startsWith('#') ? branding.theme_color : '#3b82f6';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4 p-6 text-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Finance Records...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-12 w-full space-y-6 md:space-y-8 animate-in fade-in duration-500 font-sans print:p-0 print:m-0 print:max-w-none">
      
      {/* MAIN CONTENT (HIDDEN ON PRINT) */}
      <div className="print:hidden space-y-6 md:space-y-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-md">Finance Portal</span>
              <span className="bg-yellow-500 text-[#001f3f] px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-md italic">S.Y. {studentData?.school_year}</span>
              <span className={`px-3 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest shadow-md ${isUnpaid ? 'bg-red-500 text-white' : isPartial ? 'bg-yellow-500 text-[#001f3f]' : 'bg-emerald-500 text-white'}`}>
                {isPaid ? 'Fully Paid' : isPartial ? 'Partial Payment' : 'Unpaid'}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-1">
              Accounting <span style={{ color: safeThemeColor }}>Records</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em]">Student ID: {studentData?.student_id}</p>
          </div>
        </header>

        {(isUnpaid || isPartial) && (
          <div className={`${isUnpaid ? 'bg-red-50 border-red-100' : 'bg-yellow-50 border-yellow-100'} border-2 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex flex-row items-center gap-4 md:gap-5`}>
            <div className={`${isUnpaid ? 'bg-red-500' : 'bg-yellow-500'} text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg shrink-0`}>
                <Info size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest leading-none ${isUnpaid ? 'text-red-900' : 'text-yellow-900'}`}>
                {isUnpaid ? 'Account Pending' : 'Balance Remaining'}
              </p>
              <p className={`text-[9px] md:text-[10px] font-bold mt-1 uppercase ${isUnpaid ? 'text-red-600/70' : 'text-yellow-600/70'}`}>
                {isUnpaid ? 'Settle balance to activate features.' : `₱${parseFloat(studentData?.balance).toLocaleString()} outstanding.`}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div style={{ backgroundColor: safeThemeColor }} className="p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <Wallet size={32} className="md:w-10 md:h-10 mb-4 md:mb-6 text-yellow-500" />
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Remaining Balance</p>
                <h2 className="text-3xl md:text-4xl font-black mt-1">₱ {parseFloat(studentData?.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
              </div>

              <div className="bg-white border-2 border-slate-100 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${isUnpaid ? 'bg-red-50' : isPartial ? 'bg-yellow-50' : 'bg-emerald-50'}`}>
                    {isUnpaid ? <Lock size={20} className="text-red-500 md:w-6 md:h-6" /> : <CheckCircle2 size={20} className={`${isPartial ? 'text-yellow-600' : 'text-emerald-600'} md:w-6 md:h-6`} />}
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-full uppercase ${isUnpaid ? 'bg-red-100 text-red-700' : isPartial ? 'bg-yellow-100 text-yellow-700' : 'bg-emerald-100 text-emerald-700'}`}>
                     {isPaid ? 'Paid' : isPartial ? 'Partial' : 'Unpaid'}
                  </span>
                </div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">₱ {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-2 uppercase italic flex items-center gap-2">
                  <Calendar size={10}/> {studentData?.last_payment_date || 'N/A'}
                </p>
              </div>
            </div>

            <div 
  style={{ backgroundColor: safeThemeColor }} 
  className="text-white p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-5 shadow-xl overflow-hidden relative"
>
  {/* Custom CSS para sa scrolling animation */}
  <style>
    {`
      @keyframes scroll-text {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }
      .animate-marquee {
        display: inline-block;
        white-space: nowrap;
        animation: scroll-text 15s linear infinite;
      }
    `}
  </style>

  {/* Megaphone Icon - Naka-z-index para laging nasa ibabaw */}
  <div className="z-10 bg-inherit pr-2">
    <Megaphone 
      size={20} 
      className="shrink-0 animate-bounce text-yellow-500 md:w-6 md:h-6" 
    />
  </div>

  {/* Moving Text Container */}
  <div className="flex-1 overflow-hidden">
    <p className="animate-marquee font-black text-[10px] md:text-xs uppercase tracking-widest italic">
      Important: Please settle any outstanding balance to avoid late enrollment penalties. &nbsp;&nbsp;&nbsp;&nbsp; 
      Important: Please settle any outstanding balance to avoid late enrollment penalties.
    </p>
  </div>
</div>
            <section className="bg-white border border-slate-200 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 shadow-sm overflow-hidden">
              <h3 className="font-black text-slate-800 mb-6 md:mb-8 uppercase text-[9px] md:text-[10px] tracking-[0.2em] flex items-center gap-2">
                <Receipt size={16} className="text-blue-500"/> Assessment Details
              </h3>
              <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full text-left border-collapse min-w-[300px]">
                  <thead className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="pb-4">Description</th>
                      <th className="pb-4 text-right">Amount Due</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm font-bold text-slate-700">
                    {billingItems.length > 0 ? (
                      billingItems.map((item, index) => (
                        <tr key={index} className="border-b border-slate-50">
                          <td className="py-4 text-slate-600 font-medium uppercase">{item.item_name}</td>
                          <td className="py-4 text-right font-black text-slate-900 whitespace-nowrap">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="border-b border-slate-50">
                        <td className="py-5 text-emerald-600 italic font-medium">All items settled.</td>
                        <td className="py-5 text-right font-black text-slate-400">₱ 0.00</td>
                      </tr>
                    )}
                    <tr className="border-b border-slate-50 text-emerald-600">
                      <td className="py-5 italic font-medium">Total Paid</td>
                      <td className="py-5 text-right font-black text-base md:text-lg">- ₱ {paidAmt.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    <tr className={`${isUnpaid ? 'text-red-600' : isPartial ? 'text-yellow-600' : 'text-slate-900'}`}>
                      <td className="py-5 uppercase tracking-widest text-[9px] font-black">Balance Due</td>
                      <td className="py-5 text-right font-black text-xl md:text-2xl underline decoration-double">₱ {parseFloat(studentData?.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6 md:space-y-8">
            <div className={`p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 ${isUnpaid ? 'bg-red-50 border-red-100' : isPartial ? 'bg-yellow-50 border-yellow-100' : 'bg-emerald-50 border-emerald-100'}`}>
              <div className="flex items-center gap-4">
                <div style={{ backgroundColor: isUnpaid ? '#ef4444' : isPartial ? '#eab308' : '#10b981' }} className="text-white p-3 md:p-4 rounded-xl md:rounded-2xl shadow-lg shrink-0">
                   {isUnpaid ? <CreditCard size={20}/> : <CheckCircle2 size={20}/>}
                </div>
                <div>
                  <p className={`font-black text-lg md:text-xl leading-none ${isUnpaid ? 'text-red-700' : isPartial ? 'text-yellow-700' : 'text-emerald-700'}`}>
                    {isPaid ? 'FULLY PAID' : isPartial ? 'PARTIAL' : 'UNPAID'}
                  </p>
                  <p className="text-[8px] font-bold uppercase mt-1 opacity-70">Status: {isUnpaid ? 'Inactive' : 'Active'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl">
              <h3 className="font-black text-[8px] md:text-[9px] uppercase tracking-widest mb-5 md:mb-6 text-slate-500 italic underline decoration-yellow-500">Document Hub</h3>
              <div className="space-y-2 md:space-y-3">
                <ViewBtn label="Billing Statement" onClick={() => setViewModal({ open: true, type: 'Billing Statement' })} />
                <ViewBtn label="Official Receipt" onClick={() => setViewModal({ open: true, type: 'Official Receipt' })} />
                <ViewBtn label="Payment Voucher" onClick={() => setViewModal({ open: true, type: 'Payment Voucher' })} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {viewModal.open && studentData && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-start justify-center p-4 pt-10 backdrop-blur-sm print:p-0 print:bg-white">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden print:shadow-none print:max-h-full print:rounded-none animate-in slide-in-from-top-4 duration-300">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white print:hidden">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Receipt size={24}/></div>
                <h3 className="font-black text-slate-800 tracking-tight">Statement of Account</h3>
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
                    <p className="font-mono text-sm font-bold text-slate-500">ID: {studentData.student_id} • ₱ {parseFloat(studentData.balance).toLocaleString()} Balance</p>
                  </div>
                </div>
                <div className="text-right">
                  {branding.school_logo &&  <img 
                    src={`${API_BASE_URL}/uploads/branding/${branding?.school_logo}`} 
                    className="w-16 h-16 object-cover ml-auto mb-1" 
                    alt="Logo" 
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />}
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
                   <p className="text-3xl font-black">₱ {parseFloat(studentData.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewBtn = ({ label, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all text-[9px] md:text-[10px] font-bold uppercase tracking-widest group">
    {label} <Eye size={14} className="text-blue-400 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentAccounting;