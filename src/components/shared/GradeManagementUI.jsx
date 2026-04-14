import React from 'react';
import {
  ArrowLeft, GraduationCap, ClipboardCheck, BookOpen, Calendar, Lock,
  RefreshCw, Save, CheckCircle, Unlock, Users, Award, AlertCircle, TrendingUp,
  Search, Filter
} from 'lucide-react';

import {
  getGradingCategories, calculateFinalGrade, getGradeStatus,
  normaliseStudent, buildStudentPayload, clampGrade
} from '../../utils/gradingUtils';

// ─── HELPER PARA SA GLASSMORPHISM CONTAINER ──────────────────────────────────
const getGlassStyle = () => ({
  background: 'rgba(255, 255, 255, 0.75)', 
  backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.6)', 
  boxShadow: '0 8px 32px 0 rgba(0,0,0,0.05)',
});

// ─── SKELETON COMPONENT (FIXED / NON-SCROLLABLE) ─────────────────────────────
export const GradeManagementSkeleton = ({ themeColor }) => {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full animate-[fadeIn_0.4s_ease-out_forwards]">
      <style>{`
        @keyframes shimmerGlass {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .gm-sk {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0) 100%), ${themeColor}15;
          background-size: 1000px 100%;
          animation: shimmerGlass 2.5s infinite linear;
          border-radius: 6px;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* HEADER SKELETON */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[1.5rem] w-full" style={getGlassStyle()}>
        <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-5 w-full">
          <div className="gm-sk w-8 h-8 sm:w-10 sm:h-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 w-full">
            <div className="gm-sk w-3/4 h-5 sm:h-7 max-w-xs" />
            <div className="flex flex-wrap gap-2">
              <div className="gm-sk w-16 h-4 sm:h-6 rounded-full" />
              <div className="gm-sk w-20 h-4 sm:h-6 rounded-full" />
              <div className="gm-sk w-14 h-4 sm:h-6 rounded-full" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:flex flex-wrap gap-2 w-full lg:w-auto">
          <div className="gm-sk col-span-1 sm:w-28 h-8 sm:h-10 rounded-xl" />
          <div className="gm-sk col-span-1 sm:w-28 h-8 sm:h-10 rounded-xl" />
          <div className="gm-sk col-span-2 sm:col-span-1 sm:w-36 h-8 sm:h-10 rounded-xl" />
        </div>
      </div>

      {/* STATS CARDS SKELETON */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 w-full">
        {[1, 2, 3, 4].map(n => (
          <div key={n} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-6 rounded-2xl sm:rounded-[1.5rem] w-full" style={getGlassStyle()}>
            <div className="gm-sk w-8 h-8 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1 w-full">
              <div className="gm-sk w-full sm:w-20 h-2 sm:h-3" />
              <div className="gm-sk w-3/4 sm:w-12 h-4 sm:h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* TABLE SKELETON (NON-SCROLLABLE) */}
      <div className="flex flex-col rounded-2xl sm:rounded-[1.5rem] w-full overflow-hidden" style={getGlassStyle()}>
        <div className="p-3 sm:p-6 border-b border-black/5 flex flex-col gap-3 w-full">
          <div className="gm-sk w-full h-8 sm:h-10 rounded-xl" />
        </div>
        <div className="w-full bg-white/30 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-black/5">
                <th className="p-2"><div className="gm-sk w-full h-2" /></th>
                <th className="p-2"><div className="gm-sk w-full h-2" /></th>
                <th className="p-2"><div className="gm-sk w-full h-2" /></th>
                <th className="p-2"><div className="gm-sk w-full h-2" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4].map(n => (
                <tr key={n} className="border-b border-black/5">
                  <td className="p-2">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="gm-sk w-full h-2" />
                      <div className="gm-sk w-2/3 h-1.5" />
                    </div>
                  </td>
                  <td className="p-2"><div className="gm-sk w-full h-5 sm:h-7 rounded-lg" /></td>
                  <td className="p-2"><div className="gm-sk w-full h-5 sm:h-7 rounded-lg" /></td>
                  <td className="p-2"><div className="gm-sk w-full h-3 sm:h-5 rounded-full" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── HEADER COMPONENT ────────────────────────────────────────────────────────
export const GradeHeader = ({
  displaySubject, displayGradeLevel, displaySection, systemLabel, isK12,
  selectedQuarter, setSelectedQuarter, setSearchParams, locationState,
  themeColor, isSubmitted, handleGoBack, syncFromActivities, saveAllGrades,
  submitFinalGrades, requestEditPermission, isSaving, isServerOffline, isRequesting
}) => (
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 rounded-2xl sm:rounded-[1.5rem] w-full" style={getGlassStyle()}>
    
    <div className="flex flex-row items-start sm:items-center gap-3 sm:gap-6 w-full lg:w-auto">
      <button 
        onClick={handleGoBack} 
        className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/80 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-all border border-slate-200 shrink-0 mt-0.5 sm:mt-0 shadow-sm"
      >
        <ArrowLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
      </button>
      
      <div className="flex flex-col w-full min-w-0">
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-1.5 break-words line-clamp-2">
          {displaySubject}
        </h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 border border-slate-200 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold text-slate-600 shrink-0">
            <GraduationCap size={10} className="sm:w-3 sm:h-3" /> {displayGradeLevel}
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 bg-slate-100/80 border border-slate-200 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-bold text-slate-600 shrink-0">
            <ClipboardCheck size={10} className="sm:w-3 sm:h-3" /> Sec: {displaySection}
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-black shrink-0" style={{ background: `${themeColor}15`, borderColor: `${themeColor}30`, color: themeColor }}>
            <BookOpen size={10} className="sm:w-3 sm:h-3" /> {systemLabel}
          </span>
          
          {isK12 && (
            <div className="flex flex-wrap bg-white/50 p-1 rounded-full border border-black/5 w-full sm:w-auto mt-1 sm:mt-0">
              {[1, 2, 3, 4].map(q => (
                <button
                  key={q}
                  onClick={() => { setSelectedQuarter(q); setSearchParams({ quarter: q }, { replace: true, state: locationState }); }}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 ${selectedQuarter === q ? 'shadow-sm text-white' : 'text-slate-500 hover:bg-white/50'}`}
                  style={selectedQuarter === q ? { background: themeColor } : {}}
                >
                  {selectedQuarter === q && <Calendar size={10} className="sm:w-3 sm:h-3" />} Q{q}
                </button>
              ))}
            </div>
          )}

          {isSubmitted && (
            <span className="flex items-center gap-1 sm:gap-1.5 bg-red-100 border border-red-200 text-red-700 px-2 sm:px-3 py-1 rounded-full text-[9px] sm:text-xs font-black shadow-sm mt-1 sm:mt-0 shrink-0">
              <Lock size={10} className="sm:w-3 sm:h-3" /> LOCKED
            </span>
          )}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto mt-2 lg:mt-0">
      {!isSubmitted ? (
        <>
          <button 
            className="col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm bg-white/80 border border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            onClick={syncFromActivities} disabled={isSaving || isServerOffline}
          >
            <RefreshCw size={14} className={`shrink-0 sm:w-4 sm:h-4 ${isSaving ? 'animate-spin' : ''}`} /> Sync
          </button>
          <button 
            className="col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-[11px] sm:text-sm bg-white/80 border border-slate-300 text-slate-600 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-50"
            onClick={saveAllGrades} disabled={isSaving || isServerOffline}
          >
            <Save size={14} className="shrink-0 sm:w-4 sm:h-4" /> Save
          </button>
          <button 
            className="col-span-2 sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-[12px] sm:text-sm text-white shadow-md hover:brightness-110 transition-all disabled:opacity-50"
            style={{ background: themeColor }}
            onClick={submitFinalGrades} disabled={isSaving || isServerOffline}
          >
            <CheckCircle size={14} className="shrink-0 sm:w-[18px] sm:h-[18px]" /> Submit Grades
          </button>
        </>
      ) : (
        <button 
          className="col-span-2 sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl font-black text-[12px] sm:text-sm bg-amber-500 text-white shadow-md hover:bg-amber-600 transition-all disabled:opacity-50"
          onClick={requestEditPermission} disabled={isRequesting || isServerOffline}
        >
          <Unlock size={14} className="shrink-0 sm:w-[18px] sm:h-[18px]" /> Request Edit Permission
        </button>
      )}
    </div>
  </div>
);

// ─── STATS COMPONENT ─────────────────────────────────────────────────────────
export const GradeStats = ({ studentsLength, stats, passRate, themeColor }) => (
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6 w-full">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 p-3 sm:p-6 rounded-2xl sm:rounded-[1.5rem]" style={getGlassStyle()}>
      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-blue-50 text-blue-600 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
        <Users className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Students</span>
        <span className="text-sm sm:text-2xl font-black text-slate-800 leading-none mt-0.5 sm:mt-1">{studentsLength}</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 p-3 sm:p-6 rounded-2xl sm:rounded-[1.5rem]" style={getGlassStyle()}>
      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
        <Award className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Passed</span>
        <span className="text-sm sm:text-2xl font-black text-slate-800 leading-none mt-0.5 sm:mt-1">{stats.passed}</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 p-3 sm:p-6 rounded-2xl sm:rounded-[1.5rem]" style={getGlassStyle()}>
      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-red-50 text-red-600 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
        <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed</span>
        <span className="text-sm sm:text-2xl font-black text-slate-800 leading-none mt-0.5 sm:mt-1">{stats.failed}</span>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-5 p-3 sm:p-6 rounded-2xl sm:rounded-[1.5rem]" style={getGlassStyle()}>
      <div className="w-8 h-8 sm:w-14 sm:h-14 bg-purple-50 text-purple-600 rounded-lg sm:rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
        <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
      </div>
      <div className="flex flex-col w-full">
        <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Rate</span>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-0.5 sm:mt-1 w-full">
          <span className="text-sm sm:text-2xl font-black text-slate-800 leading-none">{passRate}%</span>
          <div className="w-full h-1 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${passRate}%` }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── TABLE COMPONENT (FIXED CONTAINER WITH RESPONSIVE HEADERS) ──────────────────
export const GradeTable = ({
  themeColor, categories, actCount, isK12, isSubmitted, studentsLength,
  filteredStudents, handleInputChange, handleInputBlur, currentLevel,
  searchQuery, setSearchQuery, filterStatus, setFilterStatus, classInfo
}) => (
  <div className="flex flex-col rounded-2xl sm:rounded-[1.5rem] w-full overflow-hidden" style={getGlassStyle()}>
    
    {/* TOOLBAR - FIXED */}
    <div className="p-3 sm:p-5 lg:p-6 border-b border-black/5 flex flex-col sm:flex-row justify-between gap-3 w-full">
      <div className="relative w-full sm:max-w-sm flex items-center bg-white/60 border border-slate-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-inner">
        <Search size={14} className="text-slate-400 shrink-0 sm:w-4 sm:h-4" />
        <input 
          type="text" 
          placeholder="Search student..." 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
          className="w-full bg-transparent border-none outline-none ml-2 sm:ml-3 text-[13px] sm:text-sm font-bold text-slate-700 placeholder-slate-400" 
        />
      </div>

      <div className="flex w-full sm:w-auto items-center gap-1.5 bg-white/50 p-1.5 rounded-xl border border-slate-200">
        <div className="pl-2 pr-1 hidden sm:block shrink-0"><Filter size={14} className="text-slate-400" /></div>
        {['All', 'Passed', 'Failed'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilterStatus(f)}
            className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-black transition-all text-center whitespace-nowrap`}
            style={{
              background: filterStatus === f ? 'white' : 'transparent',
              color: filterStatus === f ? themeColor : '#64748b',
              boxShadow: filterStatus === f ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>

    {/* 🟢 FIXED: Table container - NO horizontal scroll */}
    <div className="w-full bg-white/30">
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="bg-slate-50/50 border-b border-black/5">
            {/* Student Column */}
            <th className="p-1 sm:p-3 w-[28%] sm:w-[25%] text-[8px] sm:text-xs font-black text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1 text-left">
                <Users size={10} className="hidden xs:block shrink-0" style={{ color: themeColor }} /> 
                <span className="truncate">Student</span>
              </div>
            </th>
            
            {categories.map(cat => {
              const isLocked = actCount[cat.key] > 0 || (isK12 && (cat.key === 'written' || cat.key === 'exam'));
              return (
                <th key={cat.key} className="p-1 sm:p-2 text-center border-l border-black/5 w-[16%] sm:w-[15%]">
                  <div className="flex flex-col items-center justify-center">
                    {/* 🟢 FIXED: Responsive label with abbreviation for mobile */}
                    <span className="flex items-center justify-center gap-0.5 text-[7px] sm:text-[10px] font-black text-slate-800 text-center leading-tight">
                      {isLocked && <Lock size={8} className="text-red-400 shrink-0" />} 
                      {/* 🟢 Mobile: Show abbreviation, Desktop: Show full text */}
                      <span className="hidden sm:inline truncate">{cat.label}</span>
                      <span className="sm:hidden truncate">
                        {cat.key === 'written' ? 'WW' : cat.key === 'performance' ? 'PT' : cat.key === 'exam' ? 'QE' : cat.label}
                      </span>
                    </span>
                    <span className="mt-0.5 sm:mt-1 text-[6px] sm:text-[9px] font-black px-1 py-0.5 rounded-full inline-block whitespace-nowrap" style={{ color: themeColor, background: `${themeColor}15` }}>
                      {cat.percentage}
                    </span>
                  </div>
                </th>
              );
            })}
            
            <th className="p-1 sm:p-2 text-center border-l border-black/5 text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest w-[12%] sm:w-[10%]">
              <span className="hidden sm:inline">Final</span>
              <span className="sm:hidden">Fin</span>
            </th>
            <th className="p-1 sm:p-2 text-center border-l border-black/5 text-[7px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest w-[12%] sm:w-[10%]">
              <span className="hidden sm:inline">Remarks</span>
              <span className="sm:hidden">Rem</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 ? (
            <tr>
              <td colSpan={categories.length + 3} className="text-center py-12 px-2 text-slate-500 font-bold text-[10px] sm:text-sm">
                {studentsLength === 0 ? 'No students enrolled.' : 'No matches found.'}
              </td>
            </tr>
          ) : filteredStudents.map((student, idx) => {
            const final = calculateFinalGrade(student, currentLevel);
            const status = getGradeStatus(final, currentLevel);
            const passed = status === 'Passed';
            
            return (
              <tr key={student.id ?? idx} className="border-b border-black/5 hover:bg-white/50 transition-colors">
                {/* Student Info */}
                <td className="p-1 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="hidden lg:flex w-6 h-6 sm:w-8 sm:h-8 rounded-full text-white items-center justify-center font-black text-[8px] sm:text-xs shrink-0 shadow-sm" style={{ background: themeColor }}>
                      {(student.name || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0 overflow-hidden">
                      <span className="font-bold text-slate-800 text-[9px] sm:text-[13px] leading-tight truncate">{student.name}</span>
                      <span className="font-semibold text-slate-400 text-[7px] sm:text-[10px] truncate">{student.student_number}</span>
                    </div>
                  </div>
                </td>

                {categories.map(cat => {
                  const isLocked = actCount[cat.key] > 0 || (isK12 && (cat.key === 'written' || cat.key === 'exam'));
                  return (
                    <td key={cat.key} className="p-1 text-center border-l border-black/5">
                      {isLocked ? (
                        <div className="flex justify-center items-center px-1 py-0.5 sm:py-1 rounded-md bg-slate-100/80 border border-slate-200 text-[9px] sm:text-sm font-bold text-slate-600 w-full max-w-[40px] sm:max-w-[50px] mx-auto">
                          <span className="sm:hidden">{student[cat.key] ?? 0}</span>
                          <span className="hidden sm:inline"><Lock size={9} className="text-red-400 mr-0.5 inline" />{student[cat.key] ?? 0}</span>
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          inputMode="numeric" 
                          pattern="[0-9]*"
                          placeholder="0" 
                          disabled={isSubmitted}
                          value={student[cat.key] === 0 ? '' : (student[cat.key] ?? '')} 
                          onChange={e => handleInputChange(student.id, cat.key, e.target.value)} 
                          onBlur={e => handleInputBlur(student.id, cat.key, e.target.value)} 
                          className={`w-full max-w-[35px] sm:max-w-[45px] text-center p-0.5 sm:p-1.5 rounded-md font-bold text-[9px] sm:text-sm outline-none transition-all shadow-inner border mx-auto block
                            ${isSubmitted ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/80 border-slate-300 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200'}`}
                        />
                      )}
                    </td>
                  );
                })}
                
                {/* Final Grade */}
                <td className="p-1 text-center border-l border-black/5">
                  <span className={`text-[10px] sm:text-base font-black ${passed ? 'text-emerald-600' : 'text-red-600'}`}>{final}</span>
                </td>
                
                {/* Remarks */}
                <td className="p-1 text-center border-l border-black/5">
                  <span className={`inline-block px-1 py-0.5 rounded-full text-[6px] sm:text-[9px] font-black tracking-wider uppercase shadow-sm border
                    ${passed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {status === 'Passed' ? 'Pass' : status === 'Failed' ? 'Fail' : status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
    <div className="p-2 sm:p-4 lg:px-6 bg-slate-50/50 border-t border-black/5 text-[8px] sm:text-xs font-bold text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-1">
      <span>Showing {filteredStudents.length} of {studentsLength}</span>
      {classInfo?.school_year && <span>SY {classInfo.school_year}</span>}
    </div>
  </div>
);