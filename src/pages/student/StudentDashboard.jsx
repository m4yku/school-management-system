/* Add this below your SummaryCard grid */
<div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
  
  {/* LEFT: Academic & Schedule (2 Columns wide) */}
  <div className="lg:col-span-2 space-y-8">
    
    {/* Today's Schedule Section */}
    <section>
      <div className="flex justify-between items-end mb-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Today's Schedule</h3>
        <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">View Full Calendar</span>
      </div>
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Time</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Subject</th>
              <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Room</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-blue-50/50 transition-colors">
              <td className="px-6 py-4 text-sm font-bold text-slate-700">08:00 - 10:00</td>
              <td className="px-6 py-4">
                <p className="text-sm font-black text-[#003366]">ITP 311: Systems Analysis</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Prof. Dela Cruz</p>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">Bldg 2 - RM 401</td>
            </tr>
            {/* Additional rows would go here */}
          </tbody>
        </table>
      </div>
    </section>

    {/* LMS Deadlines Section */}
    <section>
      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">LMS Deadlines</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
          <div className="bg-red-500 text-white p-2 rounded-lg text-xs font-bold">DUE TODAY</div>
          <div>
            <p className="text-sm font-black text-slate-800 leading-tight">Prelim Exam in PHP</p>
            <p className="text-[10px] text-red-600 font-bold">Submit by 11:59 PM</p>
          </div>
        </div>
      </div>
    </section>
  </div>

  {/* RIGHT: Sidebar Info (1 Column wide) */}
  <div className="space-y-8">
    {/* Bulletin Board / Announcements */}
    <section className="bg-[#003366] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em] mb-4">Campus Bulletin</h3>
        <div className="space-y-4">
          <div className="border-l-2 border-yellow-500 pl-4 py-1">
            <p className="text-xs font-bold leading-snug">Suspension of Classes: Feast of San Pascual Baylon</p>
            <span className="text-[9px] opacity-60 uppercase font-black">Posted 2h ago</span>
          </div>
          <div className="border-l-2 border-white/20 pl-4 py-1">
            <p className="text-xs font-bold leading-snug">Early Enrollment for 2nd Semester is now open.</p>
            <span className="text-[9px] opacity-60 uppercase font-black">Posted yesterday</span>
          </div>
        </div>
      </div>
      {/* Decorative school acronym in background */}
      <span className="absolute -bottom-4 -right-4 text-7xl font-black text-white/5 pointer-events-none">CSPB</span>
    </section>

    {/* Quick Links for Student Support (IT / Librarian) */}
    <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Support Services</h3>
      <div className="space-y-3">
        <button className="w-full text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors">
          Report IT Issue
        </button>
        <button className="w-full text-left px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors">
          Borrow Library Book
        </button>
      </div>
    </section>
  </div>
</div>