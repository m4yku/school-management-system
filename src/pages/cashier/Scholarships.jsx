import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Award, CheckCircle2, Printer, X, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Scholarships = () => {
  const { API_BASE_URL } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [selectedGrant, setSelectedGrant] = useState(null);
  const [targetBilling, setTargetBilling] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_all_approved_scholarships.php`);
      if (res.data.status === "success") {
        setGrants(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) { console.error("Fetch Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGrants(); }, []);

  const handleInitiateApply = async (grant) => {
    setProcessing(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_billing_details.php?id=${grant.student_id}`);
      if (res.data.status === "success") {
        setTargetBilling(res.data);
        setSelectedGrant(grant);
      } else {
        alert("Student has no active billing record.");
      }
    } catch (err) { alert("Error fetching billing details."); }
    finally { setProcessing(false); }
  };

  const handleFinalApply = async () => {
    setProcessing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/cashier/apply_scholarship_to_billing.php`, {
        application_id: selectedGrant.id,
        student_id: selectedGrant.student_id,
        discount_value: selectedGrant.value,
        discount_type: selectedGrant.discount_type,
        scholarship_name: selectedGrant.scholarship_name
      });

      if (res.data.status === "success") {
        setReceiptInfo({
          name: selectedGrant.scholarship_name,
          total_deduction: res.data.total_deduction,
          applied_items: res.data.applied_items
        });
        setSelectedGrant(null);
        setShowSuccess(true);
        fetchGrants();
      } else { alert(res.data.message); }
    } catch (err) { alert("Error applying scholarship."); }
    finally { setProcessing(false); }
  };

  const filteredGrants = (grants || []).filter(g => 
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    g.student_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 text-left max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase italic">Scholarship Grantees</h1>
          <p className="text-slate-400 font-medium text-sm italic">Direct access to students with approved grants.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text" placeholder="Search name or ID..."
            className="pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-xs w-64 outline-none focus:border-blue-600 shadow-sm"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
              <th className="pb-4 text-left">Student</th>
              <th className="pb-4 text-left">Scholarship</th>
              <th className="pb-4 text-center">Value</th>
              <th className="pb-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredGrants.map((grant) => (
              <tr key={grant.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="py-5">
                  <div className="font-black text-slate-700 text-xs uppercase">{grant.first_name} {grant.last_name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{grant.student_id}</div>
                </td>
                <td className="py-5 text-xs font-bold text-slate-600 uppercase italic">{grant.scholarship_name}</td>
                <td className="py-5 text-center">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase">
                    {grant.discount_type === 'Percentage' ? `${grant.value}%` : `₱${parseFloat(grant.value).toLocaleString()}`}
                  </span>
                </td>
                <td className="py-5 text-right">
                  <button onClick={() => handleInitiateApply(grant)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-black transition-all">
                    Apply to Billing
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PREVIEW MODAL */}
      {selectedGrant && targetBilling && (() => {
        const tuitionItem = targetBilling.items.find(i => i.item_name.toLowerCase().includes('tuition'));
        const currentTuitionBal = tuitionItem ? (parseFloat(tuitionItem.amount) - parseFloat(tuitionItem.paid_amount)) : 0;
        const previewDiscount = selectedGrant.discount_type === 'Percentage'
          ? currentTuitionBal * (parseFloat(selectedGrant.value) / 100)
          : parseFloat(selectedGrant.value);

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 text-left">
            <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10">
              <h2 className="text-xl font-black text-slate-800 uppercase mb-2 flex items-center gap-2"><Award size={24} /> Grant Preview</h2>
              <p className="text-slate-400 text-xs font-bold uppercase mb-6">{selectedGrant.scholarship_name}</p>
              
              <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-4">
                  <span>Current Balance</span>
                  <span>₱{parseFloat(targetBilling.summary.balance).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex justify-between text-xs font-black text-emerald-600 uppercase italic">
                    <span>Deduction Amount</span>
                    <span>- ₱{previewDiscount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSelectedGrant(null)} className="py-4 text-[10px] font-black uppercase text-slate-400">Cancel</button>
                <button onClick={handleFinalApply} disabled={processing} className="bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-black transition-all">
                  {processing ? "Applying..." : "Confirm Apply"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-blue-900/40 backdrop-blur-md z-[160] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
            <h2 className="text-2xl font-black text-slate-800 uppercase">Grant Applied!</h2>
            
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl text-left border border-slate-100">
              {receiptInfo?.applied_items?.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[10px] font-bold text-slate-600 py-1">
                  <span>{item.item_name}</span>
                  <span className="text-emerald-600">-₱{item.discount.toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between font-black text-slate-800 text-xs">
                <span>TOTAL DEDUCTION</span>
                <span>₱{receiptInfo?.total_deduction.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => { window.print(); setShowSuccess(false); }} className="mt-8 w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900 transition-all">
              <Printer size={16} /> Print & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;