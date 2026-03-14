import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CreditCard, CheckCircle2, Megaphone, Wallet, 
  Receipt, Calendar, Download, Lock, Loader2, ArrowLeft, Info, Tags
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const StudentAccounting = () => {
  const { user, branding } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [billingItems, setBillingItems] = useState([]); // State para sa listahan ng items mula sa database

  const API_BASE_URL = "http://localhost/sms-api"; 

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_students.php`);
      
      // Kunin ang data base sa bagong JSON structure (students at billing_items)
      const allStudents = res.data.students; 
      const allItems = res.data.billing_items;

      const myData = allStudents.find(s => s.email === user.email);
      
      if (myData) {
        setStudentData(myData);
        
        // I-filter ang items base sa billing_id ng student
        const myItems = allItems.filter(item => 
          parseInt(item.billing_id) === parseInt(myData.billing_id)
        );
        setBillingItems(myItems);
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

  // --- LOGIC PARA SA DOWNLOAD ---
  const handleDownload = (type) => {
    if (!studentData) return;

    const itemsText = billingItems.map(item => `${item.item_name}: PHP ${item.amount}`).join('\n');

    const content = `
========================================
       OFFICIAL BILLING RECORD
========================================
Document Type: ${type}
School Year: ${studentData.school_year}
Date Generated: ${new Date().toLocaleDateString()}

STUDENT INFORMATION:
ID: ${studentData.student_id}
Name: ${studentData.first_name} ${studentData.last_name}
Grade Level: ${studentData.grade_level}

ASSESSMENT BREAKDOWN:
${itemsText}

FINANCIAL SUMMARY:
Total Assessment: PHP ${studentData.total_amount}
Total Paid:       PHP ${studentData.paid_amount}
Balance Due:      PHP ${studentData.balance}
Status:           ${studentData.payment_status}

Last Payment Date: ${studentData.last_payment_date || 'N/A'}
========================================
       VALID PORTAL GENERATED
========================================
    `;

    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${type}_${studentData.student_id}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const isUnpaid = studentData?.payment_status === 'Unpaid';

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center font-black animate-pulse text-slate-400 uppercase tracking-widest gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      Loading Finance Records...
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 w-full space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex justify-between items-end">
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md">Finance Portal</span>
            <span className="bg-yellow-500 text-[#001f3f] px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md italic">S.Y. {studentData?.school_year}</span>
            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${isUnpaid ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {studentData?.payment_status}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2">
            Accounting <span style={{ color: branding.theme_color }}>Records</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Assessment for Student ID: {studentData?.student_id}</p>
        </div>
      </header>

      {/* PAYMENT ALERT */}
      {isUnpaid && (
        <div className="bg-red-50 border-2 border-red-100 p-6 rounded-[2rem] flex items-center gap-5">
          <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg">
            <div className="bg-red-500 text-white p-3 rounded-2xl shadow-lg">
                <Info size={24} />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-black text-red-900 uppercase tracking-widest leading-none">Account Pending</p>
            <p className="text-[10px] font-bold text-red-600/70 mt-1 uppercase">Please settle your remaining balance to activate all LMS features.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{ backgroundColor: branding.theme_color }} className="p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
              <Wallet size={40} className="mb-6 text-yellow-500" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Remaining Balance</p>
              <h2 className="text-4xl font-black mt-1">₱ {studentData?.balance || '0.00'}</h2>
            </div>

            <div className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${isUnpaid ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  {isUnpaid ? <Lock size={24} className="text-red-500" /> : <CheckCircle2 size={24} className="text-emerald-600" />}
                </div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${isUnpaid ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                   {studentData?.payment_status}
                </span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Payment</p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">₱ {studentData?.paid_amount || '0.00'}</h2>
              <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase italic flex items-center gap-2">
                <Calendar size={12}/> {studentData?.last_payment_date || 'N/A'}
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: branding.theme_color }} className="text-white p-5 rounded-3xl flex items-center gap-5 shadow-xl">
            <Megaphone size={24} className="shrink-0 animate-bounce text-yellow-500" />
            <marquee className="font-black text-xs uppercase tracking-widest italic">Important: Please settle any outstanding balance to avoid late enrollment penalties.</marquee>
          </div>

          {/* ASSESSMENT DETAILS WITH DYNAMIC BREAKDOWN */}
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
                  {/* Dynamic Rendering ng items mula sa student_billing_items */}
                  {billingItems.length > 0 ? (
                    billingItems.map((item, index) => (
                      <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-5 text-slate-600 font-medium">{item.item_name}</td>
                        <td className="py-5 text-right font-black text-slate-900">₱ {parseFloat(item.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-slate-50">
                      <td className="py-6">Tuition & Miscellaneous Fees (General)</td>
                      <td className="py-6 text-right font-black text-slate-900">₱ {studentData?.total_amount}</td>
                    </tr>
                  )}

                  <tr className="border-b border-slate-50 text-emerald-600">
                    <td className="py-6 italic font-medium">Total Paid Amount</td>
                    <td className="py-6 text-right font-black text-lg">- ₱ {studentData?.paid_amount}</td>
                  </tr>
                  <tr className={`border-t-2 border-slate-100 ${isUnpaid ? 'text-red-600' : 'text-slate-900'}`}>
                    <td className="py-6 uppercase tracking-widest text-[10px] font-black">Current Balance Due</td>
                    <td className="py-6 text-right font-black text-2xl underline decoration-double">₱ {studentData?.balance}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* SIDEBAR CARDS */}
        <div className="space-y-8">
          <div className={`p-8 rounded-[2.5rem] border-4 ${isUnpaid ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-4">
              <div style={{ backgroundColor: isUnpaid ? '#ef4444' : branding.theme_color }} className="text-white p-4 rounded-2xl shadow-lg">
                <CreditCard size={24}/>
              </div>
              <div>
                <p className={`font-black text-xl leading-none ${isUnpaid ? 'text-red-700' : 'text-emerald-700'}`}>{studentData?.payment_status?.toUpperCase()}</p>
                <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">Record Status: Active</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="font-black text-[9px] uppercase tracking-widest mb-6 text-slate-500 italic underline decoration-yellow-500">Quick Downloads</h3>
            <div className="space-y-3">
              <DownloadBtn label="Billing Statement" onClick={() => handleDownload("Billing_Statement")} />
              <DownloadBtn label="Official Receipt" onClick={() => handleDownload("Official_Receipt")} />
              <DownloadBtn label="Payment Voucher" onClick={() => handleDownload("Payment_Voucher")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DownloadBtn = ({ label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest group"
  >
    {label} <Download size={14} className="text-yellow-500 group-hover:scale-125 transition-transform" />
  </button>
);

export default StudentAccounting;