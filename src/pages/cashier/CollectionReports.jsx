import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Filter, Banknote, CreditCard, Wallet, ReceiptText, Search } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../context/AuthContext';

const CollectionReports = () => {
  const [reports, setReports] = useState([]);
  const { branding, API_BASE_URL } = useAuth();
  const [stats, setStats] = useState({ total: 0, cash: 0, gcash: 0, card: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const [filters, setFilters] = useState({ start: today, end: today });
  const [loading, setLoading] = useState(false);

  // Function para kumuha ng data mula sa PHP API
  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/cashier/get_collection_reports.php?start=${filters.start}&end=${filters.end}`);
      if (res.data.status === 'success') {
        setReports(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // CLIENT-SIDE SEARCH LOGIC
  // Sinasala nito ang reports base sa Name, ID, o Payment Method
  const filteredReports = reports.filter(p => 
    p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // PDF EXPORT LOGIC
  const exportToPDF = () => {
    // Kung may search, yung filtered results lang ang i-export. Kung wala, lahat.
    const dataToExport = filteredReports;

    if (dataToExport.length === 0) return alert("Walang data na pwedeng i-export!");

    try {
      const doc = new jsPDF();
      
      // Header ng PDF
      doc.setFontSize(18);
      doc.text("COLLECTION REPORT", 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Period: ${filters.start} to ${filters.end}`, 14, 30);
      if(searchTerm) doc.text(`Search Filter: "${searchTerm}"`, 14, 35);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);

      const tableData = dataToExport.map(p => [
        new Date(p.transaction_date).toLocaleDateString(),
        `${p.first_name} ${p.last_name}`,
        p.payment_method,
        p.fee_category,
        `P${parseFloat(p.amount_paid).toLocaleString(undefined, {minimumFractionDigits: 2})}`
      ]);

      autoTable(doc, {
        startY: 45,
        head: [['Date', 'Student Name', 'Method', 'Category', 'Amount']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillGray: [40, 40, 40], textColor: 255 },
        styles: { fontSize: 8 }
      });

      doc.save(`Collection_Report_${filters.start}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      alert("Error generating PDF.");
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-8 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Collection Reports</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Financial Audit Trail</p>
        </div>

        <div className="flex flex-wrap items-end gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">From</label>
            <input type="date" className="block bg-white border-0 rounded-xl px-4 py-2 text-xs font-bold outline-none ring-1 ring-slate-200" value={filters.start} onChange={(e) => setFilters({...filters, start: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-2">To</label>
            <input type="date" className="block bg-white border-0 rounded-xl px-4 py-2 text-xs font-bold outline-none ring-1 ring-slate-200" value={filters.end} onChange={(e) => setFilters({...filters, end: e.target.value})} />
          </div>
          <button onClick={fetchReports} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">
            <Filter size={18} strokeWidth={3} />
          </button>
          <button onClick={exportToPDF} disabled={filteredReports.length === 0} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-black disabled:bg-slate-300 shadow-xl transition-all">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Collection" value={stats.total} icon={<ReceiptText size={20}/>} color="bg-blue-600" />
        <StatCard title="Cash" value={stats.cash} icon={<Banknote size={20}/>} color="bg-emerald-500" />
        <StatCard title="GCash" value={stats.gcash} icon={<Wallet size={20}/>} color="bg-blue-500" />
        <StatCard title="Card" value={stats.card} icon={<CreditCard size={20}/>} color="bg-orange-500" />
      </div>

      {/* SEARCH AND TABLE */}
      <div className="space-y-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search student or method..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-xs shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-left">
              <tr>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Details</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Method</th>
                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.length > 0 ? filteredReports.map((p) => (
                <tr key={p.payment_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 text-xs font-bold text-slate-500 italic">
                    {new Date(p.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <div className="font-black text-slate-800 uppercase leading-none mb-1">{p.first_name} {p.last_name}</div>
                    <div className="text-[10px] text-slate-400 font-bold">{p.student_id}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      p.payment_method === 'Cash' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {p.payment_method}
                    </span>
                  </td>
                  <td className="p-6 text-right font-black text-slate-900">
                    ₱{parseFloat(p.amount_paid).toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="p-20 text-center text-slate-300 font-black uppercase tracking-widest italic">
                    {searchTerm ? `No results found for "${searchTerm}"` : "No records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Sub-component para sa Summary Cards
const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
    <div className={`${color} text-white p-4 rounded-2xl shadow-lg`}>{icon}</div>
    <div className="text-left">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{title}</p>
      <p className="text-xl font-black text-slate-900 tracking-tighter">₱{value.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
    </div>
  </div>
);

export default CollectionReports;