import React, { useState } from 'react';
import axios from 'axios';
import { Search, FileText, CheckCircle, Printer, X, Banknote, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PaymentDashboard = () => {
  const { branding, API_BASE_URL } = useAuth();
  const [searchId, setSearchId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [processing, setProcessing] = useState(false);

  const handleSearch = async () => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_service_requests.php?id=${searchId}`);
      if (res.data.status === "success") {
        setData(res.data);
        setSelectedIds([]); // Clear selection sa bagong search
      } else {
        alert(res.data.message);
        setData(null);
      }
    } catch (err) { alert("API Connection Error"); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const total = data?.items
    ?.filter(item => selectedIds.includes(item.id))
    ?.reduce((sum, item) => sum + parseFloat(item.amount), 0) || 0;

  const handleProcessPayment = async () => {
    if (selectedIds.length === 0) return;
    setProcessing(true);
    try {
      // Mag-send ng array ng IDs na babayaran
      const res = await axios.post(`${API_BASE_URL}/cashier/process_service_payment.php`, {
  request_ids: selectedIds
});

      if (res.data.status === "success") {
        alert("Payment Successful! Status updated to 'Paid'.");
        handleSearch(); // Refresh list
      } else {
        alert(res.data.message);
      }
    } catch (err) { alert("Payment Failed"); }
    finally { setProcessing(false); }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 text-left">
      <div className="flex justify-between items-end border-b-2 border-slate-50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase">Service Payments</h1>
          <p className="text-slate-400 font-medium italic">Documents, Certifications, and Requests</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 bg-white p-3 rounded-[2rem] shadow-sm border border-slate-100">
        <input 
          type="text" placeholder="Enter Student ID (e.g. 2026-0003)" 
          className="flex-1 pl-6 py-3 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500"
          value={searchId} onChange={(e) => setSearchId(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700">
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><User size={24}/></div>
                <h2 className="text-xl font-black text-slate-800 uppercase">{data.student_name}</h2>
              </div>

              <div className="space-y-3">
                {data.items.length > 0 ? data.items.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleSelect(item.id)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedIds.includes(item.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-50 bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-200'}`}>
                        {selectedIds.includes(item.id) && <CheckCircle className="text-white" size={16} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-700 uppercase text-sm">{item.item_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.status}</p>
                      </div>
                    </div>
                    <span className="font-black text-lg text-slate-800">₱{parseFloat(item.amount).toLocaleString()}</span>
                  </div>
                )) : (
                  <div className="py-20 text-center opacity-30 italic font-bold uppercase tracking-widest">No Pending Requests</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Checkout Total</p>
              <h2 className="text-5xl font-black text-emerald-400 mb-8">₱{total.toLocaleString()}</h2>
              <button 
                disabled={selectedIds.length === 0 || processing}
                onClick={handleProcessPayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                {processing ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDashboard;