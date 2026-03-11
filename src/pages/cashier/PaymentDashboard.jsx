import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Wallet, 
  Search, 
  Receipt, 
  ArrowRight, 
  Banknote, 
  History,
  CheckCircle2
} from 'lucide-react';

const CashierDashboard = () => {
  const { user, branding } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data lang ito para makita ang layout. 
  // Ikokonekta niyo ito sa PHP / MySQL later.
  const recentTransactions = [
    { id: 'TXN-001', student: 'Julliana Marie', amount: 5000, type: 'Tuition Fee', date: 'Today, 10:30 AM', status: 'Completed' },
    { id: 'TXN-002', student: 'Mark Llyod', amount: 1500, type: 'Miscellaneous', date: 'Today, 09:15 AM', status: 'Completed' },
    { id: 'TXN-003', student: 'Sarah Geronimo', amount: 10000, type: 'Downpayment', date: 'Yesterday', status: 'Completed' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Dito ilalagay ang Axios call para hanapin ang student sa database
    console.log("Searching for Student ID:", searchQuery);
    alert(`Searching for ${searchQuery}... (Backend not yet connected)`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Cashier Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, <span style={{ color: branding.theme_color || '#2563eb' }}>{user?.full_name || 'Cashier'}</span>. Here's your collection overview.
          </p>
        </div>
        
        {/* Quick Date/Time */}
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <History className="text-slate-400" size={20} />
          <div className="text-sm">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Today's Date</p>
            <p className="font-bold text-slate-800">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* 2. Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Today's Collection */}
        <div className="bg-emerald-500 rounded-[2rem] p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-emerald-400 opacity-50">
            <Wallet size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-2">Today's Collection</p>
            <h3 className="text-4xl font-black">₱16,500.00</h3>
            <p className="text-sm font-medium mt-4 flex items-center gap-1.5">
              <CheckCircle2 size={16} /> 3 Transactions Completed
            </p>
          </div>
        </div>

        {/* Card 2: Pending Payments (Draft) */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Banknote size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Expected Today</p>
              <h3 className="text-2xl font-black text-slate-800">₱45,000.00</h3>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Action */}
        <button className="bg-slate-900 hover:bg-slate-800 transition-colors rounded-[2rem] p-6 text-left flex flex-col justify-between group shadow-lg shadow-slate-200">
          <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
            <Receipt size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Generate Reports</h3>
            <p className="text-slate-400 text-sm mt-1">Export daily collection summary</p>
          </div>
        </button>
      </div>

      {/* 3. Main Action Area: Search & Process Payment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Search Student */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-2">Process Payment</h3>
            <p className="text-slate-500 text-sm mb-6">Enter Student ID to view billing and process a new transaction.</p>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="text-slate-400" size={18} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. 2026-0001"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 text-white font-bold rounded-2xl flex items-center justify-center space-x-2 transition-transform active:scale-[0.98] shadow-md"
                style={{ backgroundColor: branding.theme_color || '#2563eb' }}
              >
                <span>Find Student</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Recent Transactions Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Recent Transactions</h3>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction ID</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentTransactions.map((tx, index) => (
                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-700">{tx.id}</td>
                      <td className="py-4">
                        <p className="font-bold text-slate-800">{tx.student}</p>
                        <p className="text-xs text-slate-400">{tx.type} • {tx.date}</p>
                      </td>
                      <td className="py-4 font-black text-slate-800">₱{tx.amount.toLocaleString()}</td>
                      <td className="py-4">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CashierDashboard;