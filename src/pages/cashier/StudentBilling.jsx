import React, { useState } from 'react';
import axios from 'axios';
import {
  Search, Wallet, User, Printer, AlertCircle,
  CheckCircle2, ArrowRight, Banknote, X, Info
} from 'lucide-react';

const StudentBilling = () => {
  const [searchId, setSearchId] = useState('');
  const [billingData, setBillingData] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(false);

  // Modals logic
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [manualStatus, setManualStatus] = useState('Enrolled');
  const [receiptInfo, setReceiptInfo] = useState(null);

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost/sms-api/cashier/get_billing_details.php?id=${searchId}`);

      if (res.data.status === "success") {
        // Direkta na sa res.data dahil sa format ng PHP mo
        setBillingData(res.data);
        setAllocations({});
      } else {
        // Lalabas dito yung message galing sa PHP (mas accurate)
        alert(res.data.message);
        setBillingData(null);
      }
    } catch (err) {
      alert("Connection error to API.");
    } finally {
      setLoading(false);
    }
  };

  const handleAllocationChange = (itemId, value, maxBalance) => {
    const val = parseFloat(value) || 0;
    // Hindi papayagan na lumampas sa balance ang input
    setAllocations({ ...allocations, [itemId]: val > maxBalance ? maxBalance : value });
  };

  const payFullItem = (itemId, balance) => {
    setAllocations({ ...allocations, [itemId]: balance });
  };

  const totalToPay = Object.values(allocations).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  const processFinalPayment = async () => {
    try {
      const payload = {
        student_id: billingData.summary.student_id,
        pay_amount: totalToPay,
        allocations: allocations,
        enrollment_status: manualStatus
      };

      const res = await axios.post(`http://localhost/sms-api/cashier/process_billing_payment.php`, payload);

      if (res.data.status === "success") {
        // I-set ang info para sa resibo bago i-clear
        setReceiptInfo({
          name: `${billingData.summary.first_name} ${billingData.summary.last_name}`,
          id: billingData.summary.student_id,
          date: new Date().toLocaleString(),
          total: totalToPay,
          items: billingData.items.filter(item => allocations[item.id] > 0).map(item => ({
            name: item.item_name,
            paid: allocations[item.id]
          }))
        });

        setShowConfirm(false);
        setShowSuccess(true);
        setAllocations({});
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      alert("Payment transaction failed.");
    }
  };

  const handlePrint = () => {
    // Bigyan ng 100ms na delay para siguradong render na ang receiptInfo sa DOM
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto relative">
      {/* Header */}
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Student Billing Portal</h1>
        <p className="text-slate-400 font-medium italic text-sm">Review assessments and manage payment allocations.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] shadow-sm border-2 border-slate-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search Student ID (e.g. 2026-0001)"
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 text-white px-10 py-2 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {billingData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* LEFT COLUMN: Items and Identity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50">

              {/* STUDENT IDENTITY BAR */}

              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <User size={28} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-black text-slate-800 text-2xl uppercase leading-tight">
                      {billingData.summary.first_name} {billingData.summary.last_name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-slate-400 font-mono tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                        ID: {billingData.summary.student_id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Status</p>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${billingData.summary.payment_status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                    {billingData.summary.payment_status}
                  </div>
                </div>
              </div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={14} /> Itemized Allocation
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {billingData.items.map((item, i) => {
                  const itemAmount = parseFloat(item.amount) || 0;
                  const itemPaid = parseFloat(item.paid_amount) || 0;
                  const balance = itemAmount - itemPaid;
                  return (
                    <div key={i} className="flex flex-col p-5 bg-slate-50 rounded-[1.8rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700 uppercase text-sm tracking-tight">
                          {item.item_name}
                        </span>
                        <span className="font-bold text-slate-400 text-xs italic">
                          Rem. Balance: ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-2.5 font-black text-slate-300">₱</span>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full bg-white border-2 border-slate-100 p-2 pl-8 rounded-xl font-black text-blue-600 outline-none focus:border-blue-500 transition-all"
                            value={allocations[item.id] || ''}
                            onChange={(e) => handleAllocationChange(item.id, e.target.value, balance)}
                          />
                        </div>
                        <button
                          onClick={() => payFullItem(item.id, balance)}
                          className="bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95"
                        >
                          Pay Full
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Payment Summary */}
          <div className="space-y-6 text-left">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <Banknote className="text-emerald-400" size={24} />
                </div>
                <h3 className="font-black uppercase tracking-widest text-lg">Payment Summary</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Total Amount to Post</p>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex flex-col items-center">
                    <h2 className="text-5xl font-black text-emerald-400 tracking-tighter">
                      ₱{totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <button
                    onClick={() => totalToPay > 0 && setShowConfirm(true)}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3 active:scale-95"
                  >
                    Review Transaction <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-32 flex flex-col items-center text-slate-400 animate-pulse">
          <Wallet size={60} className="opacity-10 mb-4" />
          <p className="font-black uppercase tracking-[0.2em] text-sm">Waiting for Student Search</p>
          <p className="text-xs mt-2 italic">Please enter a student ID to begin billing process.</p>
        </div>
      )}

      {/* 1. CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                <CheckCircle2 className="text-emerald-500" /> Confirm Allocation
              </h2>
              <button onClick={() => setShowConfirm(false)} className="hover:rotate-90 transition-transform"><X className="text-slate-400" /></button>
            </div>

            <div className="p-10 space-y-6 text-left">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Distribution</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {billingData.items.filter(item => allocations[item.id] > 0).map(item => (
                    <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-50">
                      <span className="font-bold text-slate-600">{item.item_name}</span>
                      <span className="font-black text-slate-800">₱{Number(allocations[item.id]).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-4 border-t-2 border-slate-900 font-black text-2xl mt-4">
                  <span>GRAND TOTAL</span>
                  <span className="text-blue-600">₱{totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 space-y-4">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block text-center">Set Student Enrollment Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setManualStatus('Enrolled')}
                    className={`py-3 rounded-xl font-black text-xs uppercase transition-all ${manualStatus === 'Enrolled' ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    Enrolled
                  </button>
                  <button
                    onClick={() => setManualStatus('Pending')}
                    className={`py-3 rounded-xl font-black text-xs uppercase transition-all ${manualStatus === 'Pending' ? 'bg-amber-500 text-white shadow-xl shadow-amber-200' : 'bg-white text-slate-400 border border-slate-200'}`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              <button
                onClick={processFinalPayment}
                className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
              >
                Post Payment Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. SUCCESS & RECEIPT MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md shadow-2xl p-12 text-center animate-in zoom-in-95 duration-300 border-t-8 border-emerald-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle2 size={56} />
            </div>

            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Payment Posted!</h2>
            <p className="text-slate-400 font-medium text-sm mb-10 italic leading-relaxed">The student's ledger and enrollment status have been successfully updated.</p>

            <div className="space-y-3">
              <button
                onClick={handlePrint}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Printer size={20} /> Print Official Receipt
              </button>
              <button
                onClick={() => { setShowSuccess(false); handleSearch(); }}
                className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIDDEN PRINT RECEIPT SECTION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          /* Itago lahat ng UI elements */
          body * { 
            visibility: hidden; 
            margin: 0;
          }
          /* Ipakita lang ang print-area */
          .print-area, .print-area * { 
            visibility: visible; 
          }
          .print-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 40px;
            display: block !important;
            color: black !important;
          }
          /* Tanggalin ang mga browser headers/footers */
          @page { size: auto; margin: 0mm; }
        }
      `}} />

      {receiptInfo && (
        <div className="hidden print-area text-left font-serif">
          <div className="text-center border-b-2 border-black pb-4 mb-6">
            <h1 className="text-2xl font-black uppercase">Official Receipt</h1>
            <p className="text-sm">Smart Management School System</p>
            <p className="text-[10px] italic">Date Processed: {receiptInfo.date}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
            <div>
              <p className="uppercase font-bold text-slate-500 text-[10px]">Student Name</p>
              <p className="font-black text-lg">{receiptInfo.name}</p>
            </div>
            <div className="text-right">
              <p className="uppercase font-bold text-slate-500 text-[10px]">Student ID</p>
              <p className="font-black text-lg">{receiptInfo.id}</p>
            </div>
          </div>

          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="text-left py-2 uppercase text-xs">Description</th>
                  <th className="text-right py-2 uppercase text-xs">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {receiptInfo.items.map((item, i) => (
                  <tr key={i} className="border-b border-dotted border-slate-300">
                    <td className="py-3 text-sm">{item.name}</td>
                    <td className="text-right py-3 font-bold text-sm">₱{Number(item.paid).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-6 text-right font-bold uppercase text-xs">Total Amount Paid:</td>
                  <td className="py-6 text-right text-2xl font-black border-t-2 border-black">
                    ₱{Number(receiptInfo.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="text-center">
              <div className="w-48 border-b border-black mb-1"></div>
              <p className="text-[10px] uppercase font-bold text-slate-500 text-center">Cashier's Signature</p>
            </div>
            <div className="text-[10px] italic text-slate-400">
              Thank you for your payment. This serves as your official record.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBilling;