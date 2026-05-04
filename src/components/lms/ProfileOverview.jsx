import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, MapPin, Edit3, BookOpen, User as UserIcon } from 'lucide-react';

const ProfileOverview = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER CARD (Top Section) */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        
        {/* Profile Picture */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-8 border-slate-50 shadow-inner flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-5xl overflow-hidden">
            {user?.first_name?.charAt(0) || 'S'}
          </div>
          <button className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg border-4 border-white hover:scale-110 transition-transform">
            <Edit3 size={18} />
          </button>
        </div>

        {/* Basic Info */}
        <div className="text-center md:text-left z-10 flex-1">
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">
            {user?.first_name} {user?.last_name}
          </h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
             <span className="px-4 py-1.5 bg-slate-100 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest">ID: {user?.student_number || '2026-0001'}</span>
             <span className="px-4 py-1.5 bg-indigo-50 rounded-xl text-xs font-black text-indigo-600 uppercase tracking-widest">1st Year - BSIT</span>
             <span className="px-4 py-1.5 bg-emerald-50 rounded-xl text-xs font-black text-emerald-600 uppercase tracking-widest">S.Y. 2026-2027</span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Personal Info Column (Left) */}
        <div className="lg:col-span-4 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs flex items-center gap-2">
              <UserIcon size={16} className="text-indigo-500" /> Personal Info
            </h3>
            <button className="text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:underline">Edit</button>
          </div>
          <div className="space-y-6">
            <InfoItem icon={<Mail size={16} />} label="Email Address" value={user?.email || 'student@school.edu.ph'} />
            <InfoItem icon={<Phone size={16} />} label="Phone Number" value="+63 912 345 6789" />
            <InfoItem icon={<MapPin size={16} />} label="Address" value="Obando, Bulacan" />
          </div>
        </div>

        {/* Subjects Enrolled (Center/Right) */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Subjects Enrolled</h3>
           <div className="space-y-4">
              {['GE-PURPCOM', 'GE-RPH', 'IT101'].map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 transition-colors cursor-pointer group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-indigo-600 font-black text-xs shadow-sm">{sub.split('-')[1]?.charAt(0) || sub.charAt(0)}</div>
                      <span className="text-sm font-black text-slate-700 group-hover:text-indigo-600 transition-colors">{sub}</span>
                   </div>
                   <BookOpen size={16} className="text-slate-300" />
                </div>
              ))}
           </div>
        </div>

        {/* Teachers Column (Right) */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
           <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Teachers</h3>
           <div className="flex flex-col gap-6">
              {['Jackie Sun', 'Nymia Dela Cruz'].map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-600 font-black text-xs uppercase">{name.charAt(0)}</div>
                  <div>
                    <p className="text-xs font-black text-slate-700">{name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Instructor</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Student Learning Track (Graph Placeholder) */}
      <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
         <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-8">Student Learning Track</h3>
         <div className="h-48 w-full bg-slate-50 rounded-3xl flex items-end justify-around p-6 gap-2">
            {[60, 80, 45, 90, 70, 95, 85].map((val, i) => (
              <div key={i} className="w-full max-w-[40px] bg-indigo-500 rounded-t-xl transition-all hover:bg-indigo-600 cursor-help relative group" style={{ height: `${val}%` }}>
                 <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{val}%</span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

// Helper component
const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-sm border border-white">{icon}</div>
    <div>
      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value}</p>
    </div>
  </div>
);

export default ProfileOverview;