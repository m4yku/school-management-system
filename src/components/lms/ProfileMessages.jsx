import React from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';

const ProfileMessages = () => {
  return (
    <div className="h-[calc(100vh-140px)] bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex animate-in zoom-in-95 duration-500">
      
      {/* 1. CHAT LIST (Middle column in mock) */}
      <div className="w-80 border-r border-slate-100 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-black text-slate-800 mb-6">Messages</h2>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search contacts..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold text-slate-600 focus:ring-2 ring-indigo-100 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {[
            { name: 'Jackie Sun', msg: 'Don\'t forget your assign...', time: '2h', active: true },
            { name: 'Nymia Dela Cruz', msg: 'Great job on the lab!', time: 'Yesterday', active: false },
            { name: 'Class 10-A Group', msg: 'Mark: Sino may kopya...', time: 'Tue', active: false },
          ].map((chat, i) => (
            <div key={i} className={`p-4 rounded-[1.5rem] flex items-center gap-4 cursor-pointer transition-all ${chat.active ? 'bg-indigo-50 shadow-sm' : 'hover:bg-slate-50'}`}>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center font-black text-indigo-600 shrink-0">{chat.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h4 className="text-sm font-black text-slate-800 truncate">{chat.name}</h4>
                  <span className="text-[10px] font-bold text-slate-400">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.active ? 'text-indigo-600 font-bold' : 'text-slate-500 font-medium'}`}>{chat.msg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CHAT WINDOW (Main body in mock) */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Chat Header */}
        <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black">J</div>
             <div>
                <h3 className="text-sm font-black text-slate-800">Jackie Sun</h3>
                <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><Phone size={18} /></button>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><Video size={18} /></button>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors"><MoreVertical size={18} /></button>
          </div>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
           <div className="flex justify-start">
              <div className="max-w-[70%] bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                <p className="text-sm font-bold text-slate-600 leading-relaxed">Hi Joshua! Don't forget your graphing assignment for tomorrow's class.</p>
                <p className="text-[9px] font-black text-slate-300 mt-2 text-right">02:30 PM</p>
              </div>
           </div>
           <div className="flex justify-end">
              <div className="max-w-[70%] bg-indigo-600 p-4 rounded-2xl rounded-tr-none shadow-md">
                <p className="text-sm font-bold text-white leading-relaxed">Yes po, Teacher Jackie. Noted po rito!</p>
                <p className="text-[9px] font-black text-indigo-200 mt-2 text-right uppercase">Sent</p>
              </div>
           </div>
        </div>

        {/* Chat Input */}
        <div className="p-6 bg-white border-t border-slate-100">
           <div className="bg-slate-50 rounded-[1.5rem] p-2 flex items-center gap-2">
              <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors"><Paperclip size={20} /></button>
              <input type="text" placeholder="Type your message here..." className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-slate-700 px-2" />
              <button className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all active:scale-90">
                 <Send size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMessages;