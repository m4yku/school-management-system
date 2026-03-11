import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { branding } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-[100] shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {branding.school_logo && <img src={branding.school_logo} className="h-9 w-9 object-contain" alt="Logo" />}
            <span className="font-black text-xl text-slate-800 tracking-tighter uppercase">{branding.school_name}</span>
          </div>

          {/* DESKTOP MENU (Lilitaw lang sa md pataas) */}
          <div className="hidden md:flex items-center space-x-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Admissions</a>
            <a href="#" className="hover:text-blue-600 transition-colors">About Us</a>
          </div>

          {/* HAMBURGER BUTTON (Lilitaw lang sa mobile) */}
          <button 
            className="md:hidden p-2 text-slate-600" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-slate-200 p-6 space-y-4 md:hidden animate-in slide-in-from-top-2 duration-200">
            <a href="#" className="block text-sm font-bold text-slate-600 py-2">Home</a>
            <a href="#" className="block text-sm font-bold text-slate-600 py-2">Admissions</a>
            <a href="#" className="block text-sm font-bold text-slate-600 py-2">About Us</a>
          </div>
        )}
      </nav>

      {/* Hero Section & Portal Selection Card */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: School Info */}
          <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Official School Portal</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter text-slate-800">
              Your Future <br/>Starts <span style={{ color: branding.theme_color || '#2563eb' }}>Here.</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-md leading-relaxed">
              Experience a modern way of learning. Access your student records and school resources anywhere, anytime.
            </p>
          </div>

          {/* Right Side: Portal Selection Buttons */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 p-8 md:p-10 border border-slate-100">
              <div className="mb-8 text-center lg:text-left">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Access Your Portal</h3>
                <p className="text-slate-400 text-sm font-medium">Select your account type to continue.</p>
              </div>

              <div className="space-y-4">
                {/* STUDENT PORTAL BUTTON */}
                <button 
                  onClick={() => navigate('/login')}
                  className="group w-full p-6 bg-blue-50 hover:bg-blue-600 border border-blue-100 rounded-[2rem] flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                      <GraduationCap size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-blue-100">Portal Access</p>
                      <p className="text-lg font-black text-slate-800 group-hover:text-white leading-none">Student Portal</p>
                    </div>
                  </div>
                  <ArrowRight className="text-blue-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                {/* STAFF/TEACHER PORTAL BUTTON */}
                <button 
                  onClick={() => navigate('/staff/login')}
                  className="group w-full p-6 bg-slate-50 hover:bg-slate-800 border border-slate-200 rounded-[2rem] flex items-center justify-between transition-all duration-300 active:scale-[0.98]"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 shadow-sm group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-300">Staff Access</p>
                      <p className="text-lg font-black text-slate-800 group-hover:text-white leading-none">Staff Portal</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center border-t border-slate-100 bg-white">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {branding.school_name}. Powered by SMS Technology.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;