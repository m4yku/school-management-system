import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Tag, X, Info, Layers, DollarSign, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FeeCatalog = () => {
  const [fees, setFees] = useState([]);
  const { API_BASE_URL } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [formData, setFormData] = useState({ 
    item_name: '', 
    amount: '', 
    category: 'Mandatory', 
    applicable_to: 'All' 
  });

  const fetchFees = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/manage_fees.php`);
      setFees(res.data);
    } catch (err) {
      console.error("Error fetching fees:", err);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  // --- SEARCH AND FILTER LOGIC ---
  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'All' || fee.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE_URL}/cashier/manage_fees.php`, formData);
    setIsModalOpen(false);
    resetForm();
    fetchFees();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this item?")) {
      await axios.delete(`${API_BASE_URL}/cashier/manage_fees.php?id=${id}`);
      fetchFees();
    }
  };

  const resetForm = () => {
    setFormData({ item_name: '', amount: '', category: 'Mandatory', applicable_to: 'All' });
  };

  return (
    <div className="p-6 space-y-6 h-[calc(100vh-100px)] flex flex-col text-left">
      {/* Header Section */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Fee Catalog</h1>
          <p className="text-slate-400 font-medium italic text-sm">Manage standardized list of school fees.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> Add Item
        </button>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search fee name..."
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold appearance-none shadow-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Tuition">Tuition</option>
            <option value="Mandatory">Mandatory</option>
            <option value="Optional">Optional</option>
            <option value="Document">Document</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* SCROLLABLE TABLE AREA */}
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b-2 border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
                <th className="p-6">Category</th>
                <th className="p-6">Description</th>
                <th className="p-6">Applicable To</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.length > 0 ? (
                filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase ${
                        fee.category === 'Tuition' ? 'bg-blue-100 text-blue-600' : 
                        fee.category === 'Mandatory' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {fee.category}
                      </span>
                    </td>
                    <td className="p-6 font-bold text-slate-700 text-sm">{fee.item_name}</td>
                    <td className="p-6 text-xs font-bold text-slate-400 uppercase">{fee.applicable_to}</td>
                    <td className="p-6 font-black text-blue-600">₱{Number(fee.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => { setFormData(fee); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(fee.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-20 text-center text-slate-300 italic">No matching items found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL - (Mananatili ang modal structure mo pero sisiguraduhin nating functional) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
             {/* ... (Dito yung modal code na sinend ko kanina, walang pagbabago sa JSX nito) ... */}
             <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                <h2 className="font-black text-slate-800 uppercase flex items-center gap-3">
                  <Tag className="text-blue-600" /> {formData.id ? 'Edit Fee Item' : 'New Fee Item'}
                </h2>
                <button onClick={() => setIsModalOpen(false)}><X className="text-slate-400" /></button>
             </div>
             <form onSubmit={handleSubmit} className="p-10 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Fee Description</label>
                  <input required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500"
                    value={formData.item_name} onChange={(e)=>setFormData({...formData, item_name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Amount</label>
                    <input required type="number" step="0.01" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-blue-600"
                      value={formData.amount} onChange={(e)=>setFormData({...formData, amount: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Category</label>
                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none"
                      value={formData.category} onChange={(e)=>setFormData({...formData, category: e.target.value})}>
                      <option value="Tuition">Tuition</option>
                      <option value="Mandatory">Mandatory</option>
                      <option value="Optional">Optional</option>
                      <option value="Document">Document</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest mt-4">Save Fee Detail</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeCatalog;