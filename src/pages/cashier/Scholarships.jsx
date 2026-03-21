import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ClipboardList, CheckCircle, Award } from 'lucide-react';

const Scholarships = () => {
  // Siguraduhin na laging array ang default
  const [pendingGrants, setPendingGrants] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get('http://localhost/sms-api/cashier/get_pending_scholarships.php');
      
      // SAFETY CHECK: Siguraduhin na array ang iseset natin
      if (Array.isArray(res.data)) {
        setPendingGrants(res.data);
      } else if (res.data.status === "success" && Array.isArray(res.data.data)) {
        // Kung ang format mo ay {status: success, data: []}
        setPendingGrants(res.data.data);
      } else {
        // Kung walang nakuha, ibalik sa empty array para hindi mag-crash ang .filter()
        setPendingGrants([]);
      }
    } catch (err) {
      console.error("API Error:", err);
      setPendingGrants([]); // I-set sa empty array kapag may network error
    }
  };

  const handleApply = async (grant) => {
    if (!window.confirm(`Apply ${grant.scholarship_name} to ${grant.first_name}'s billing?`)) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost/sms-api/cashier/process_scholarship_apply.php', {
        student_scholarship_id: grant.id,
        student_id: grant.student_id,
        value: grant.value,
        discount_type: grant.discount_type
      });
      if (res.data.status === 'success') {
        alert("Scholarship applied!");
        fetchPending();
      }
    } catch (err) { alert("Error applying scholarship"); }
    finally { setLoading(false); }
  };

  // SAFETY: Dagdagan ng check bago mag-filter
  const filtered = Array.isArray(pendingGrants) 
    ? pendingGrants.filter(g => 
        (g.first_name?.toLowerCase() || "").includes(search.toLowerCase()) || 
        (g.student_id || "").includes(search)
      )
    : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-800 uppercase italic">Scholarship Applications</h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Pending grants for your approval</p>
      </div>

      <div className="relative flex-1">
        <Search className="absolute left-4 top-4 text-slate-300" size={20} />
        <input 
          className="w-full p-4 pl-12 bg-white border border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500 shadow-sm"
          placeholder="Search student or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Student</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Grant Name</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Benefit</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length > 0 ? filtered.map((grant) => (
              <tr key={grant.id}>
                <td className="p-6 font-bold uppercase text-sm">
                  {grant.first_name} {grant.last_name}
                  <div className="text-[10px] text-slate-400 font-normal">{grant.student_id}</div>
                </td>
                <td className="p-6 font-bold text-slate-700">{grant.scholarship_name}</td>
                <td className="p-6">
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px]">
                    {grant.discount_type === 'Percentage' ? `${grant.value}%` : `₱${Number(grant.value).toLocaleString()}`}
                   </span>
                </td>
                <td className="p-6 text-right">
                  <button 
                    onClick={() => handleApply(grant)}
                    className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                  >
                    Apply
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-slate-300 font-bold uppercase">No pending applications</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Scholarships;