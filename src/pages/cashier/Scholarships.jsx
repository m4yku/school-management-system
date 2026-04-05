import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Award, CheckCircle, X, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Scholarships = () => {
  const { API_BASE_URL } = useAuth();
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [availableScholarships, setAvailableScholarships] = useState([]);
  const [selectedScholarship, setSelectedScholarship] = useState(null);

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_billing_details.php?id=${searchId}`);
      if (res.data.status === "success") {
        setBillingData(res.data);

        // ETO ANG DAGDAG: Kunin ang scholarships ng student na ito
        const schRes = await axios.get(`${API_BASE_URL}/cashier/get_student_scholarships.php?id=${searchId}`);
        setAvailableScholarships(schRes.data.data || []);

        setAllocations({});
      } else {
        alert(res.data.message);
        setBillingData(null);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchGrants = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_approved_scholarships.php`);
      if (res.data.status === "success") setGrants(res.data.data);
      else setGrants([]);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGrants(); }, []);

  const handleApply = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/cashier/apply_scholarship_to_billing.php`, {
        application_id: selected.id,
        student_id: selected.student_id,
        discount_value: selected.value,
        discount_type: selected.discount_type
      });
      if (res.data.status === "success") {
        alert(res.data.message);
        setSelected(null);
        fetchGrants();
      } else { alert(res.data.message); }
    } catch (err) { alert("Error connecting to server."); }
    finally { setSubmitting(false); }
  };

  const filtered = grants.filter(g => 
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(search.toLowerCase()) || 
    g.student_id.includes(search)
  );

  return (
    <div className="p-8 space-y-6 text-left max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase italic">Scholarship Posting</h1>
        <p className="text-slate-400 font-medium text-sm italic">Post registrar-approved grants to student billing accounts.</p>
      </div>

      <div className="relative w-full md:w-96">
        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
        <input 
          type="text" placeholder="Search student ID or name..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-xs outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100 text-left">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholarship Program</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Benefit</th>
              <th className="p-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="font-black text-slate-800 uppercase text-sm">{g.first_name} {g.last_name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{g.student_id}</div>
                </td>
                <td className="p-6 font-bold text-slate-600 text-sm italic">{g.scholarship_name}</td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase">
                    {g.discount_type === 'Percentage' ? `${g.value}% Off` : `₱${Number(g.value).toLocaleString()} Less`}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button onClick={() => setSelected(g)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-blue-100">
                    Apply to Billing
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase tracking-widest italic">
                  {loading ? "Fetching records..." : "No approved applications found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {selected && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Award size={40} /></div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Confirm Posting</h2>
            <p className="text-slate-500 text-sm mt-2">Apply scholarship to <b>{selected.first_name} {selected.last_name}</b>'s current billing?</p>
            <div className="mt-8 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
              <button onClick={handleApply} disabled={submitting} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase shadow-xl hover:bg-blue-700 disabled:bg-slate-300">
                {submitting ? "Processing..." : "Confirm & Apply"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scholarships;