import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, Clock, TrendingUp, Calendar, 
  FileText, Activity, ChevronRight, GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const RegistrarDashboard = () => {
  const { user, branding } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Dashboard Data States (Mock data muna for UI testing)
  const [stats, setStats] = useState({
    totalStudents: 0,
    enrolledCurrentSY: 0,
    pendingEnrollment: 0,
    newStudents: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // I-simulate natin yung API call fetching
    setTimeout(() => {
      setStats({
        totalStudents: 1250,
        enrolledCurrentSY: 850,
        pendingEnrollment: 124,
        newStudents: 310
      });

      setRecentActivities([
        { id: 1, name: 'Juan Dela Cruz', action: 'Officially Enrolled', grade: 'Grade 10', time: '10 mins ago', status: 'success' },
        { id: 2, name: 'Maria Clara', action: 'Profile Created', grade: 'Grade 11', time: '1 hour ago', status: 'pending' },
        { id: 3, name: 'Pedro Penduko', action: 'Officially Enrolled', grade: 'Grade 7', time: '2 hours ago', status: 'success' },
        { id: 4, name: 'Crisostomo Ibarra', action: 'Requested COR Print', grade: 'College', time: '3 hours ago', status: 'info' },
        { id: 5, name: 'Sisa', action: 'Profile Created', grade: 'Grade 8', time: '5 hours ago', status: 'pending' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  // UI Helper for Stat Cards
  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgColorClass }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`p-4 rounded-2xl ${bgColorClass} ${colorClass}`}>
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{loading ? '...' : value}</h3>
        <p className="text-xs font-bold text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar size={16}/> S.Y. 2026 - 2027
          </p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0] || 'Registrar'}!
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Here's what's happening in the admissions office today.
          </p>
        </div>
        
        <div className="relative z-10 flex gap-3 w-full md:w-auto mt-4 md:mt-0">
           <Link to="/registrar/students" className="flex-1 md:flex-none px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-center text-sm">
             Add Student
           </Link>
           <Link to="/registrar/enrollment" className="flex-1 md:flex-none px-6 py-3 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-center text-sm" style={{ backgroundColor: branding.theme_color || '#2563eb' }}>
             Go to Enrollment
           </Link>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-white rounded-full blur-3xl -z-0 opacity-50 transform translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          subtitle="Registered in system"
          icon={Users} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50"
        />
        <StatCard 
          title="Officially Enrolled" 
          value={stats.enrolledCurrentSY} 
          subtitle="Passed cashier assessment"
          icon={UserCheck} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50"
        />
        <StatCard 
          title="Pending Assessment" 
          value={stats.pendingEnrollment} 
          subtitle="Awaiting registrar/cashier"
          icon={Clock} 
          colorClass="text-amber-600" 
          bgColorClass="bg-amber-50"
        />
        <StatCard 
          title="New Admissions" 
          value={stats.newStudents} 
          subtitle="Transferees & New Students"
          icon={TrendingUp} 
          colorClass="text-indigo-600" 
          bgColorClass="bg-indigo-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* RECENT ACTIVITY TABLE (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-500" size={20}/> Recent Enrollments
            </h3>
            <Link to="/registrar/enrollment" className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
              View All <ChevronRight size={14}/>
            </Link>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-6">Student</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="3" className="p-10 text-center text-slate-400 font-bold">Loading activities...</td></tr>
                ) : (
                  recentActivities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-800 text-sm">{activity.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{activity.grade}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase flex w-fit items-center gap-1.5 ${
                          activity.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 
                          activity.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-bold text-slate-500">{activity.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QUICK TASKS / ENROLLMENT PROGRESS (Spans 1 column) */}
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <FileText className="text-blue-500" size={20}/> Quick Tasks
          </h3>
          
          <div className="space-y-4 flex-1">
            <Link to="/registrar/students" className="group flex items-center p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-700">Update Masterlist</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Edit student profiles</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/registrar/enrollment" className="group flex items-center p-4 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-700">Pending Assessments</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{stats.pendingEnrollment} students waiting</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/registrar/assignments" className="group flex items-center p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-emerald-700">Teacher Assignments</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Assign subjects & loads</p>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mini Progress Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100">
             <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrollment Target</p>
                <p className="text-sm font-black text-slate-800">85%</p>
             </div>
             <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
             </div>
             <p className="text-[10px] font-bold text-slate-400 mt-2 text-center">850 out of 1000 target students</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegistrarDashboard;