import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Banknote, History, CreditCard, Activity, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const CashierDashboard = () => {
  const { API_BASE_URL } = useAuth();
  const [isAllTxModalOpen, setIsAllTxModalOpen] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalCollections: "₱0.00",
    todayTransactions: 0,
    pendingPayments: 0,
    recentTransactions: [],
    breakdown: { Cash: 0, GCash: 0, Card: 0 }
  });

  const fetchData = async () => {
    try {
      const [statsRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/cashier/get_dashboard_stats.php`),
        axios.get(`${API_BASE_URL}/cashier/get_payments.php`)
      ]);
      setStats({
        totalCollections: statsRes.data.totalCollections,
        todayTransactions: statsRes.data.todayTransactions,
        pendingPayments: statsRes.data.pendingPayments,
        recentTransactions: paymentsRes.data || [],
        breakdown: statsRes.data.breakdown
      });
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    }
  };

const fetchAllTransactions = async () => {
  try {
    // FIX: Ginawang dynamic ang URL para future-proof ang system mo
    const response = await axios.get(`${API_BASE_URL}/cashier/get_all_payments.php`);
    
    // Siguraduhin nating array ang data bago i-set para hindi mag-error ang .map()
    setAllTransactions(Array.isArray(response.data) ? response.data : []);
    setIsAllTxModalOpen(true);
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    alert("Hindi makuha ang lahat ng records. Check PHP connection.");
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-screen text-left">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          <Activity className="text-blue-600" size={24} /> Cashier Overview
        </h1>
        <p className="text-slate-500 text-sm font-medium italic">Monitor today's financial data with precision.</p>
      </div>

      {/* Floating Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Collections", val: stats.totalCollections, color: "text-emerald-600", border: "border-emerald-100" },
          { label: "Today's Transactions", val: stats.todayTransactions, color: "text-blue-600", border: "border-blue-100" },
          { label: "Pending Issues", val: stats.pendingPayments, color: "text-orange-600", border: "border-orange-100" }
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border-2 ${card.border} hover:shadow-[0_25px_50px_rgba(0,0,0,0.08)] hover:-translate-y-2 transition-all duration-300 cursor-default`}>
            <p className="text-slate-400 text-[10px] font-black uppercase mb-1 tracking-widest">{card.label}</p>
            <h3 className={`text-3xl font-black ${card.color}`}>{card.val}</h3>
          </div>
        ))}

        {/* Dark Breakdown Card */}
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(15,23,42,0.3)] hover:-translate-y-2 transition-all duration-300 text-white border-2 border-slate-700">
          <p className="text-slate-500 text-[10px] font-black uppercase mb-3 tracking-widest text-center">Method Breakdown</p>
          <div className="flex justify-between items-center px-2 text-center">
            <div className="flex-1">
              <p className="text-[9px] text-emerald-400 font-black">CASH</p>
              <p className="font-black text-sm">₱{Number(stats.breakdown?.Cash || 0).toLocaleString()}</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-700 mx-2"></div>
            <div className="flex-1">
              <p className="text-[9px] text-blue-400 font-black">GCASH</p>
              <p className="font-black text-sm">₱{Number(stats.breakdown?.GCash || 0).toLocaleString()}</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-700 mx-2"></div>
            <div className="flex-1">
              <p className="text-[9px] text-orange-400 font-black">CARD</p>
              <p className="font-black text-sm">₱{Number(stats.breakdown?.Card || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Table with Hover Rows */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <History size={14} /> Live Transaction Log
            </p>
            <p className="text-[10px] text-slate-400 italic font-medium">Hover over rows to highlight details</p>
          </div>
          <button
            onClick={fetchAllTransactions}
            className="text-[10px] font-black uppercase tracking-widest text-blue-700 hover:text-white hover:bg-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl transition-all duration-300 shadow-sm active:scale-95"
          >
            View All Records
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border-2 border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/80 border-b-2 border-slate-100">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student ID</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fee Type</th>
                <th className="p-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.slice(0, 5).map((tx) => (
                  <tr
                    key={tx.id}
                    className="group transition-all duration-200 hover:bg-slate-100/80 cursor-default"
                  >
                    {/* Student ID */}
                    <td className="p-5 text-xs font-mono font-bold text-slate-400 group-hover:text-slate-600 transition-colors">
                      {tx.student}
                    </td>

                    {/* Name */}
                    <td className="p-5 text-sm font-bold text-slate-700">
                      Student Name
                    </td>

                    {/* Amount */}
                    <td className="p-5 text-sm font-black text-blue-600">
                      ₱{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>

                    {/* Fee Type */}
                    <td className="p-5 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                      {tx.type}
                    </td>

                    {/* Method */}
                    <td className="p-5 text-right">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border ${tx.method === 'Cash' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          tx.method === 'GCash' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            'bg-orange-50 text-orange-600 border-orange-100'
                        }`}>
                        {tx.method}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="p-20 text-center text-slate-300 italic font-medium">No records today.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAllTxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-6 text-left">
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden border-4 border-white">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Full Transaction History</h2>
                <p className="text-sm text-slate-400 font-medium italic">Complete log of student payments.</p>
              </div>
              <button onClick={() => setIsAllTxModalOpen(false)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 border-b-2 border-slate-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Type</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Method & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {allTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-xs font-mono text-slate-400">{tx.student}</td>
                      <td className="p-4 font-bold text-slate-700 text-sm">Student Name</td>
                      <td className="p-4 font-black text-blue-600 text-sm">₱{Number(tx.amount).toLocaleString()}</td>
                      <td className="p-4 text-[10px] font-bold text-slate-400 uppercase">{tx.type}</td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-500 uppercase mb-1">{tx.method}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase italic">{tx.date}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashierDashboard;