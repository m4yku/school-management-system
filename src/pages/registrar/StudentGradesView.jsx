import React, { useState } from 'react';
import { 
  FileText, Download, User, BookOpen, 
  CheckCircle, AlertCircle, Search, Filter 
} from 'lucide-react';

const StudentGradesView = () => {
  // MOCK DATA: Ito ang data structure na dapat nating makuha sa API pagkatapos ni Mike
  const [selectedStudent, setSelectedStudent] = useState({
    name: "Juan Dela Cruz",
    student_id: "2024-00123",
    program: "BS Information Technology",
    year_level: "1st Year College",
    semester: "1st Semester",
    grades: [
      { code: 'IT101', description: 'Introduction to Computing', units: 3, final: '1.25', remarks: 'PASSED' },
      { code: 'IT102', description: 'Computer Programming 1', units: 3, final: '1.50', remarks: 'PASSED' },
      { code: 'GE101', description: 'Understanding the Self', units: 3, final: '2.00', remarks: 'PASSED' },
      { code: 'MATH1', description: 'Mathematics in the Modern World', units: 3, final: '5.00', remarks: 'FAILED' },
      { code: 'PE101', description: 'Physical Fitness', units: 2, final: '1.25', remarks: 'PASSED' },
    ]
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student Academic Records</h1>
            <p className="text-slate-500 font-medium italic">Viewing official grades and remarks</p>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
          <Download size={18} />
          Export to PDF / TOR
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: STUDENT INFO CARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <User size={120} />
            </div>
            
            <div className="space-y-4 relative z-10">
              <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                Active Student
              </span>
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase">{selectedStudent.name}</h2>
                <p className="text-slate-400 font-bold text-sm tracking-tighter">ID: {selectedStudent.student_id}</p>
              </div>
              
              <hr className="border-slate-50" />
              
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Program / Course</span>
                  <span className="text-sm font-bold text-slate-700">{selectedStudent.program}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Year Level & Sem</span>
                  <span className="text-sm font-bold text-slate-700">{selectedStudent.year_level} - {selectedStudent.semester}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: GRADES TABLE */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-500" /> Subject Grades
                </h3>
                <div className="flex gap-2">
                    <select className="text-[10px] font-bold p-2 rounded-lg border border-slate-200 outline-none">
                        <option>1st Semester 2025-2026</option>
                        <option>2nd Semester 2025-2026</option>
                    </select>
                </div>
            </div>

            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-slate-50">
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase pl-8 tracking-widest">Subject</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Units</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Final Grade</th>
                  <th className="p-5 text-[10px] font-black text-slate-400 uppercase text-center tracking-widest">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {selectedStudent.grades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-8">
                      <p className="font-bold text-slate-700 text-sm uppercase">{g.code}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{g.description}</p>
                    </td>
                    <td className="p-5 text-center font-bold text-slate-600 text-sm">{g.units}</td>
                    <td className="p-5 text-center">
                      <span className={`text-sm font-black ${parseFloat(g.final) > 3.0 ? 'text-red-500' : 'text-slate-800'}`}>
                        {g.final}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 border ${
                          g.remarks === 'PASSED' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {g.remarks === 'PASSED' ? <CheckCircle size={10}/> : <AlertCircle size={10}/>}
                          {g.remarks}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50/50">
                <tr>
                    <td colSpan="2" className="p-5 pl-8 text-right font-black text-slate-400 text-[10px] uppercase tracking-widest">General Weighted Average (GWA):</td>
                    <td className="p-5 text-center font-black text-blue-600 text-lg">1.45</td>
                    <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentGradesView;