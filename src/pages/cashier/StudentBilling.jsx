import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Wallet, User, Printer, AlertCircle,
  CheckCircle2, ArrowRight, Banknote, X, Info, History, Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentBilling = () => {
  const { API_BASE_URL } = useAuth();
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
      const res = await axios.get(`${API_BASE_URL}/cashier/get_billing_details.php?id=${searchId}`);
      if (res.data.status === "success") {
        setBillingData(res.data);
        setAllocations({});
      } else {
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
    setAllocations({ ...allocations, [itemId]: val > maxBalance ? maxBalance : value });
  };

  const payFullItem = (itemId, balance) => {
    setAllocations({ ...allocations, [itemId]: balance });
  };

  // Filter out items with 0 balance
  const pendingItems = billingData?.items?.filter(item => (parseFloat(item.amount) - parseFloat(item.paid_amount)) > 0) || [];
  
  // Calculate Overall Balance
  const overallBalance = billingData?.items?.reduce((acc, item) => acc + (parseFloat(item.amount) - parseFloat(item.paid_amount)), 0) || 0;
  
  const totalToPay = Object.values(allocations).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);

  const processFinalPayment = async () => {
    try {
      const payload = {
        student_id: billingData.summary.student_id,
        pay_amount: totalToPay,
        allocations: allocations,
        enrollment_status: manualStatus
      };

      const res = await axios.post(`${API_BASE_URL}/cashier/process_billing_payment.php`, payload);

      if (res.data.status === "success") {
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
    setTimeout(() => { window.print(); }, 100);
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto relative">
      <div className="flex flex-col">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Student Billing Portal</h1>
        <p className="text-slate-400 font-medium italic text-sm">Review assessments and manage payment allocations.</p>
      </div>

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
        <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-10 py-2 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {billingData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-50">
              <div className="flex justify-between items-center mb-8 border-b pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <User size={28} />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 text-2xl uppercase leading-tight">{billingData.summary.first_name} {billingData.summary.last_name}</h2>
                    <span className="text-xs font-bold text-slate-400 font-mono tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">ID: {billingData.summary.student_id}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    overallBalance === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {overallBalance === 0 ? 'Fully Paid' : 'Balance Pending'}
                  </div>
                </div>
              </div>

              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Info size={14} /> Itemized Allocation
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {pendingItems.length > 0 ? pendingItems.map((item, i) => {
                  const balance = parseFloat(item.amount) - parseFloat(item.paid_amount);
                  return (
                    <div key={i} className="flex flex-col p-5 bg-slate-50 rounded-[1.8rem] border-2 border-transparent hover:border-blue-100 hover:bg-white transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-black text-slate-700 uppercase text-sm">{item.item_name}</span>
                        <span className="font-bold text-slate-400 text-xs italic">Rem. Balance: ₱{balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-2.5 font-black text-slate-300">₱</span>
                          <input
                            type="number"
                            className="w-full bg-white border-2 border-slate-100 p-2 pl-8 rounded-xl font-black text-blue-600"
                            value={allocations[item.id] || ''}
                            onChange={(e) => handleAllocationChange(item.id, e.target.value, balance)}
                          />
                        </div>
                        <button onClick={() => payFullItem(item.id, balance)} className="bg-slate-200 hover:bg-blue-600 hover:text-white text-slate-500 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase">Pay Full</button>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-10 text-center bg-emerald-50 rounded-3xl border-2 border-dashed border-emerald-200">
                    <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-2" />
                    <p className="font-black text-emerald-800 uppercase text-sm tracking-widest">No Pending Balance</p>
                    <p className="text-emerald-600 text-[10px] font-bold italic mt-1 uppercase opacity-70 tracking-widest">Account is cleared for this period</p>
                  </div>
                )}
              </div>
            </div>

            {/* RECENT TRANSACTIONS SECTION */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <History size={14} /> Recent Transactions
              </h3>
              <div className="space-y-3">
                {billingData.history?.length > 0 ? billingData.history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Receipt size={16}/></div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{h.fee_category || 'Miscellaneous'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(h.transaction_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900">₱{parseFloat(h.amount_paid).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                )) : (
                  <p className="text-center py-6 text-slate-300 font-bold italic text-xs uppercase tracking-widest">No Payment History</p>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-6">
              <div className="space-y-8">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Overall Remaining Balance</p>
                  <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center">
                    <h2 className="text-4xl font-black text-white tracking-tighter">₱{overallBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  </div>
                </div>
                
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 opacity-60">Amount to Post Now</p>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2rem] text-center">
                    <h2 className="text-5xl font-black text-emerald-400 tracking-tighter">₱{totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  </div>
                </div>

                <button onClick={() => totalToPay > 0 && setShowConfirm(true)} className="w-full bg-emerald-500 hover:bg-emerald-600 py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-3">
                  Review Transaction <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-32 flex flex-col items-center text-slate-400 animate-pulse">
          <Wallet size={60} className="opacity-10 mb-4" />
          <p className="font-black uppercase tracking-[0.2em] text-sm">Waiting for Student Search</p>
        </div>
      )}

      {/* MODALS SECTION (Confirmation & Success remain largely the same) */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <h2 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><CheckCircle2 className="text-emerald-500" /> Confirm Allocation</h2>
              <button onClick={() => setShowConfirm(false)}><X className="text-slate-400" /></button>
            </div>
            <div className="p-10 space-y-6 text-left">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {billingData.items.filter(item => allocations[item.id] > 0).map(item => (
                  <div key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-50">
                    <span className="font-bold text-slate-600">{item.item_name}</span>
                    <span className="font-black text-slate-800">₱{Number(allocations[item.id]).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-4 border-t-2 border-slate-900 font-black text-2xl mt-4">
                <span>TOTAL</span>
                <span className="text-blue-600">₱{totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100">
                <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest block text-center mb-3">Enrollment Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setManualStatus('Enrolled')} className={`py-3 rounded-xl font-black text-xs uppercase ${manualStatus === 'Enrolled' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border'}`}>Enrolled</button>
                  <button onClick={() => setManualStatus('Pending')} className={`py-3 rounded-xl font-black text-xs uppercase ${manualStatus === 'Pending' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border'}`}>Pending</button>
                </div>
              </div>
              <button onClick={processFinalPayment} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-black shadow-xl">Post Payment Records</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md shadow-2xl p-12 text-center border-t-8 border-emerald-500">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><CheckCircle2 size={56} /></div>
            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Payment Posted!</h2>
            <p className="text-slate-400 font-medium text-sm mb-10 italic">Account record updated successfully.</p>
            <div className="space-y-3">
              <button onClick={handlePrint} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3"><Printer size={20} /> Print Receipt</button>
              <button onClick={() => { setShowSuccess(false); handleSearch(); }} className="w-full bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print logic and CSS preserved... */}
    </div>
  );
};

export default StudentBilling;