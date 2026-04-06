import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Wallet, User, Printer, AlertCircle,
  CheckCircle2, ArrowRight, Banknote, X, Info, History, Receipt, Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StudentBilling = () => {
  const { API_BASE_URL } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [billingData, setBillingData] = useState(null);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(false);

  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [selectedSch, setSelectedSch] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState(null);

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_billing_details.php?id=${searchId}`);
      if (res.data.status === "success") {
        setBillingData(res.data);
        const schRes = await axios.get(`${API_BASE_URL}/cashier/get_student_scholarships.php?id=${searchId}`);
        setAvailableScholarships(schRes.data.status === "success" ? schRes.data.data : []);
        setAllocations({});
      } else {
        alert(res.data.message);
        setBillingData(null);
      }
    } catch (err) { alert("Search failed."); }
    finally { setLoading(false); }
  };

  const handleAllocationChange = (itemId, value, max) => {
    const amount = Math.min(parseFloat(value) || 0, max);
    setAllocations(prev => ({ ...prev, [itemId]: amount }));
  };

  const handlePayFull = (itemId, max) => {
    setAllocations(prev => ({ ...prev, [itemId]: max }));
  };

  const totalToPost = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  // FIX: Regular Payment Logic with Success Modal
  const processFinalPayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/cashier/process_billing_payment.php`, {
        student_id: billingData.summary.student_id,
        pay_amount: totalToPost,
        allocations: allocations
      });

      if (res.data.status === "success") {
        setReceiptInfo({
          type: 'Payment',
          student_id: billingData.summary.student_id,
          total: totalToPost,
          date: new Date().toLocaleString(),
          details: Object.entries(allocations).map(([id, amt]) => ({
            name: billingData.items.find(i => i.id == id)?.item_name,
            amount: amt
          }))
        });
        setShowConfirm(false);
        setShowSuccess(true);
      } else { alert(res.data.message); }
    } catch (err) { alert("Error posting payment."); }
    finally { setLoading(false); }
  };

  // FIX: Scholarship Logic with Success Modal and Applied Items
  const handleApplyScholarship = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/cashier/apply_scholarship_to_billing.php`, {
        application_id: selectedSch.id,
        student_id: billingData.summary.student_id,
        discount_value: selectedSch.value,
        discount_type: selectedSch.discount_type,
        scholarship_name: selectedSch.scholarship_name
      });

      if (res.data.status === "success") {
        setReceiptInfo({
          type: 'Scholarship',
          name: selectedSch.scholarship_name,
          total_deduction: res.data.total_deduction || res.data.deduction,
          date: new Date().toLocaleString(),
          applied_items: res.data.applied_items || []
        });
        setSelectedSch(null);
        setShowSuccess(true);
      } else { alert(res.data.message); }
    } catch (err) { alert("Error applying scholarship."); }
    finally { setLoading(false); }
  };

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Cashiering</h1>
          <p className="text-slate-400 font-medium text-sm italic">Search student to manage accounts.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text" placeholder="Enter Student ID..."
            className="pl-6 pr-4 py-3.5 bg-white border-2 border-slate-100 rounded-2xl font-bold text-xs w-64 outline-none focus:border-blue-600 shadow-sm"
            value={searchId} onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={loading} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-900 transition-all">
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {!billingData && !loading ? (
        // ETO YUNG PAPALIT KAPAG WALA PANG SEARCHED ID
        <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/50">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 text-slate-300">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">Ready to Assess</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 max-w-xs text-center leading-relaxed">
            Search a Student ID to manage billing, <br /> apply grants, and process payments.
          </p>
        </div>
      ) : billingData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-2 space-y-6">
            {/* Student Info */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><User size={32} /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 uppercase leading-none">{billingData.summary.first_name} {billingData.summary.last_name}</h2>
                  <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-widest">{billingData.summary.student_id}</p>
                </div>
              </div>
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase">{billingData.summary.payment_status || "Active"}</span>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><Receipt size={16} /> Breakdown of Contributions</h3>
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-50">
                    <th className="pb-4 text-left">Fee Description</th>
                    <th className="pb-4 text-right">Balance</th>
                    <th className="pb-4 text-right">Amount to Pay</th>
                    <th className="pb-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {billingData.items.map((item) => {
                    const currentItemBalance = parseFloat(item.amount) - parseFloat(item.paid_amount);
                    if (currentItemBalance <= 0) return null;
                    return (
                      <tr key={item.id} className="group border-b border-slate-50">
                        <td className="py-4 text-xs font-bold text-slate-700">{item.item_name}</td>
                        <td className="py-4 text-right text-xs font-black">₱{currentItemBalance.toLocaleString()}</td>
                        <td className="py-4 text-right">
                          <input
                            type="number" value={allocations[item.id] || ''} placeholder="0.00"
                            onChange={(e) => handleAllocationChange(item.id, e.target.value, currentItemBalance)}
                            className="w-24 text-right p-2 bg-slate-50 border border-slate-100 rounded-lg font-black text-xs outline-none focus:border-blue-600"
                          />
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => handlePayFull(item.id, currentItemBalance)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Pay Full</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* History */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2"><History size={16} /> Recent Transactions</h3>
              <div className="space-y-4">
                {billingData.recent_payments?.length > 0 ? billingData.recent_payments.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-4">
                    <span className="font-bold text-slate-400 italic">{p.transaction_date}</span>
                    <span className="font-black text-slate-800 uppercase">{p.fee_category} <span className="text-[10px] text-slate-300 ml-2">({p.payment_method})</span></span>
                    <span className="font-black text-emerald-600">₱{parseFloat(p.amount_paid).toLocaleString()}</span>
                  </div>
                )) : <p className="text-center italic text-slate-300 text-xs py-4">No transactions found.</p>}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <p className="text-slate-400 text-[10px] font-black uppercase mb-2 relative z-10">Overall Balance</p>
              <h2 className="text-4xl font-black relative z-10">₱{parseFloat(billingData.summary.balance).toLocaleString()}</h2>
              <Wallet className="absolute -right-4 -bottom-4 text-white/5" size={120} />
            </div>

            <div className="bg-white rounded-[2.5rem] border-4 border-slate-900 p-8 shadow-xl">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Total Collected Today</p>
              <h2 className="text-3xl font-black text-emerald-600 mb-6">₱{totalToPost.toLocaleString()}</h2>
              <button
                disabled={totalToPost <= 0}
                onClick={() => setShowConfirm(true)}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg transition-all ${totalToPost > 0 ? 'bg-blue-600 text-white hover:bg-black' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                Review Transaction
              </button>
            </div>

            {/* Scholarships Sidebar */}
            <div className="bg-white rounded-[2.5rem] border border-blue-100 p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-blue-600 uppercase mb-4 flex items-center gap-2"><Award size={14} /> Available Scholarships</h3>
              <div className="space-y-3">
                {availableScholarships.length > 0 ? availableScholarships.map((sch, i) => (
                  <div key={i} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <p className="font-black text-slate-800 text-[10px] uppercase leading-tight">{sch.scholarship_name}</p>
                    <p className="text-[10px] font-bold text-blue-600 mb-3">{sch.discount_type === 'Percentage' ? `${sch.value}% Discount` : `₱${Number(sch.value).toLocaleString()} Fixed Grant`}</p>
                    <button onClick={() => setSelectedSch(sch)} className="w-full py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-all">Apply Grant</button>
                  </div>
                )) : <p className="text-center italic text-slate-300 text-[10px] uppercase py-4">No Approved Grants</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW PAYMENT */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 text-left">
          <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in duration-200">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-6 flex items-center gap-2"><Banknote size={24} /> Confirm Payment</h2>
            <div className="space-y-3 bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
              {Object.entries(allocations).map(([id, amt]) => amt > 0 && (
                <div key={id} className="flex justify-between text-xs font-bold text-slate-600 uppercase">
                  <span>{billingData.items.find(i => i.id == id)?.item_name}</span>
                  <span className="text-slate-900">₱{amt.toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-200 flex justify-between font-black text-emerald-600 uppercase">
                <span>Total to Post</span>
                <span className="text-lg">₱{totalToPost.toLocaleString()}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirm(false)} className="py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
              <button onClick={processFinalPayment} className="bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-black transition-all">Post Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHOLARSHIP PREVIEW */}
      {selectedSch && (() => {
        const tuitionItem = billingData.items.find(i => i.item_name.toLowerCase().includes('tuition'));
        const currentTuitionBal = tuitionItem ? (parseFloat(tuitionItem.amount) - parseFloat(tuitionItem.paid_amount)) : 0;
        const previewDiscount = selectedSch.discount_type === 'Percentage'
          ? currentTuitionBal * (parseFloat(selectedSch.value) / 100)
          : parseFloat(selectedSch.value);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 text-left">
            <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10">
              <h2 className="text-xl font-black text-slate-800 uppercase mb-2 flex items-center gap-2"><Award size={24} /> Grant Preview</h2>
              <p className="text-slate-400 text-xs font-bold uppercase mb-6 tracking-widest">{selectedSch.scholarship_name}</p>
              <div className="space-y-3 bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                  <span>Overall Balance</span>
                  <span>₱{parseFloat(billingData.summary.balance).toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <p className="text-[10px] font-black text-blue-600 uppercase">Estimated Distribution:</p>
                  {selectedSch.discount_type === 'Percentage' ? (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
                        <span>Current Tuition Balance:</span>
                        <span>₱{currentTuitionBal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-black text-slate-700 uppercase italic">
                        <span>Discount ({selectedSch.value}%)</span>
                        <span className="text-emerald-600">- ₱{previewDiscount.toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-xs font-black text-slate-700 uppercase">
                      <span>Total Grant Amount</span>
                      <span className="text-emerald-600">- ₱{previewDiscount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSelectedSch(null)} className="py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleApplyScholarship} className="bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all">Confirm Apply</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FIXED: MODAL: SUCCESS & PRINT RECEIPT (ILINAYLAY KO ITO SA LABAS) */}
      {showSuccess && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[160] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 text-center border-t-8 border-emerald-500 shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h2 className="text-2xl font-black text-slate-800 uppercase leading-tight">
                {receiptInfo?.type === 'Scholarship' ? 'Grant Applied!' : 'Transaction Successful!'}
            </h2>
            <p className="text-slate-400 font-medium text-xs mt-2 italic uppercase">The student's account has been updated.</p>

            {/* Breakdown preview sa success modal */}
            {receiptInfo?.type === 'Scholarship' && receiptInfo.applied_items?.length > 0 && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Deduction Breakdown:</p>
                    {receiptInfo.applied_items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-600 py-1">
                            <span>{item.item_name}</span>
                            <span className="text-emerald-600">-₱{item.discount.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-black text-slate-800">
                        <span>TOTAL DEDUCTION</span>
                        <span>₱{receiptInfo.total_deduction.toLocaleString()}</span>
                    </div>
                </div>
            )}

            <div className="mt-8 space-y-3">
              <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900 transition-all"><Printer size={16} /> Print Official Receipt</button>
              <button onClick={() => { setShowSuccess(false); handleSearch(); }} className="w-full text-slate-400 py-3 font-black uppercase text-[10px] hover:text-slate-600 transition-colors">Close and Refresh</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentBilling;