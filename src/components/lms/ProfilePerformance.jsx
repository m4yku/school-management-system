// src/components/lms/ProfilePerformance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Loader2, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const ProfilePerformance = () => {
  const { user, API_BASE_URL } = useAuth();
  const studentId = user?.id || user?.student_id || user?.username;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!studentId) return;
      try {
        const response = await axios.get(`${API_BASE_URL}/lms/get_student_performance.php?student_id=${studentId}`);
        if (response.data.status === 'success') {
          setData(response.data);
          if (response.data.availableSubjects?.length > 0) {
            setSelectedSubject(response.data.availableSubjects[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentId, API_BASE_URL]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      
      {/* HEADER BANNER */}
      <div className="bg-[#2563eb] md:rounded-[2.5rem] rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white shadow-lg shadow-blue-500/20">
        <div>
          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 inline-block">Analytics</span>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight drop-shadow-sm">Academic Performance</h1>
          <p className="text-blue-100 font-medium mt-2 text-sm md:text-base">Track your real-time engagement, submissions, and grades.</p>
        </div>
      </div>

      {/* QUICK STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 hover:border-blue-100 transition-colors">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
            <TrendingUp size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">General Weighted Average</h3>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{data?.stats?.gwa || 'N/A'}</p>
          </div>
        </div>
        
        <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 hover:border-blue-100 transition-colors">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
            <Clock size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total LMS Usage</h3>
            <p className="text-2xl md:text-3xl font-black text-slate-800">
              {data?.stats?.total_minutes || 0} <span className="text-xs md:text-sm text-slate-400 font-bold">mins</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-4 md:gap-5 hover:border-blue-100 transition-colors sm:col-span-2 md:col-span-1">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Tasks</h3>
            <p className="text-2xl md:text-3xl font-black text-slate-800">{data?.stats?.completed_tasks || 0}</p>
          </div>
        </div>
      </div>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: TIME SPENT (Weekly Usage - 100% ACCURATE DATA) */}
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-wide">LMS Weekly Usage</h3>
          <p className="text-xs font-bold text-slate-400 mb-6">Minutes spent per day (Last 7 Days)</p>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.timeSpent} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="minutes" name="Minutes" stroke="#2563EB" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#2563EB', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: LATE VS ON TIME */}
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-wide">Task Submission Rate (%)</h3>
          <p className="text-xs font-bold text-slate-400 mb-6">Ratio of On-Time vs Late passes per subject</p>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.submissionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#64748b', paddingTop: '10px' }} />
                <Bar dataKey="onTime" stackId="a" fill="#2563EB" name="On Time" radius={[0, 0, 4, 4]} />
                <Bar dataKey="late" stackId="a" fill="#EF4444" name="Late" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: OVERALL GRADES */}
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-1 uppercase tracking-wide">Overall Grades Trend</h3>
          <p className="text-xs font-bold text-slate-400 mb-6">Average General Weighted Grade per Quarter</p>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.overallGrades} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="quarter" tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="grade" name="Grade" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: SUBJECT GRADES (With Dropdown) */}
        <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1 gap-2">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Subject Performance</h3>
            <select 
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer w-full sm:w-auto"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {data?.availableSubjects?.length > 0 ? (
                data.availableSubjects.map(subj => <option key={subj} value={subj}>{subj}</option>)
              ) : (
                <option value="">No Data</option>
              )}
            </select>
          </div>
          <p className="text-xs font-bold text-slate-400 mb-6">Scores per activity in the selected subject</p>
          <div className="h-64 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.subjectGrades ? data.subjectGrades[selectedSubject] : []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="activity" tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{fontSize: 10, fill: '#64748b', fontWeight: 700}} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
                <Line type="stepAfter" dataKey="grade" name="Score (%)" stroke="#10B981" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePerformance;