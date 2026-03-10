import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  // 1. Hooks - Dapat nasa loob ng component pero sa itaas ng logic
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // 2. States - Para sa form inputs
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 3. Login Logic
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost/sms-api/login.php', {
        username: username,
        password: password
      });

      if (response.data.success) {
        // 3. I-save sa LocalStorage (Persistence)
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // 4. I-UPDATE ANG GLOBAL STATE (Para malaman ng ProtectedRoute na logged in ka na)
        setUser(response.data.user); 
        
        // 5. Navigate
        navigate(`/${response.data.user.role}/dashboard`);
      } else {
        setError(response.data.message); 
      }
    } catch (err) {
      setError("Connection failed. Please check if your server is running.");
    } finally {
      setLoading(false);
    }
  };

  // 4. UI Layout
  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl text-center">SMS</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Mike Test</h2>
          <p className="text-slate-500 text-sm">Sign in to your school account</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">enok</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User size={18} />
              </span>
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Enter username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock size={18} />
              </span>
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
            {/* Error Message Display */}
            {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 transition-all animate-pulse">
                <p className="text-sm text-red-700 font-medium">
                ⚠️ {error}
                </p>
            </div>
            )}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-blue-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Authenticating...' : 'Login to Portal'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-xs">
          &copy; 2026 School Management System
        </p>
      </div>
    </div>
  );
};

export default Login;