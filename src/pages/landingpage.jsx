import React, { useState } from 'react'; // Idinagdag ang useState
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ArrowRight, Menu, X } from 'lucide-react'; // Idinagdag ang Menu at X
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { branding } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State para sa Mobile Menu

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
            <button 
              onClick={() => navigate('/staff/login')}
              className="bg-slate-100 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-all"
            >
              Staff Portal
            </button>
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
            <div className="pt-4 border-t border-slate-50">
              <button 
                onClick={() => navigate('/staff/login')}
                className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-2xl text-sm"
              >
                Staff Portal Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section & Student Login Card */}
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

          {/* Right Side: Student Login Card */}
          <div className="animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 p-8 md:p-10 border border-slate-100">
              <div className="mb-8">
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Student Login</h3>
                <p className="text-slate-400 text-sm font-medium">Enter your credentials to access the portal.</p>
              </div>

              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('/login'); }}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Student ID Number</label>
                  <input 
                    type="text" required
                    placeholder="2026-0001" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Password</label>
                  <input 
                    type="password" required
                    placeholder="••••••••" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all text-sm font-bold"
                  />
                </div>
                <button 
                  type="submit"
                  className="shine-effect w-full py-4 text-white font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                  style={{ backgroundColor: branding.theme_color || '#2563eb' }}
                >
                  <span>Log In to Portal</span>
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="mt-8 text-center">
                <button type="button" onClick={() => navigate('/forgot-password')} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center border-t border-slate-100 bg-white">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 {branding.school_name}. Powered by SMS Technology.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;