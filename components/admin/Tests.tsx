
import React, { useState } from 'react';

interface Props {
  // Fix: Corrected signature to match AdminDashboard's showToast
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Tests: React.FC<Props> = ({ showToast }) => {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);

  const tests = [
    { id: 1, name: 'PGIMS CET MOCK TEST 1', course: 'BSC NURSING 2025', q: 180, status: 'Active', date: '25 Jan 2026' },
    { id: 2, name: 'NEET FULL SYLLABUS - 01', course: 'NEET DROPPER 2.0', q: 180, status: 'Active', date: '28 Jan 2026' },
    { id: 3, name: 'PHYSICS: ELECTROSTATICS', course: 'PCM FOUNDATION', q: 45, status: 'Active', date: '01 Feb 2026' },
    { id: 4, name: 'UNIT TEST: CELL BIOLOGY', course: 'NEET CRASH COURSE', q: 90, status: 'Scheduled', date: '10 Feb 2026' },
  ];

  const actions = [
    { label: 'Edit Configuration', icon: 'edit', color: 'text-blue-500' },
    { label: 'Add Questions Manual', icon: 'add_circle', color: 'text-emerald-500' },
    { label: 'Import from DOCX', icon: 'description', color: 'text-blue-600' },
    { label: 'Import from Excel', icon: 'table_view', color: 'text-green-600' },
    { label: 'Question Re-arrange', icon: 'sort', color: 'text-orange-500' },
    { label: 'Student Analytics', icon: 'analytics', color: 'text-purple-500' },
    { label: 'Duplicate Exam', icon: 'content_copy', color: 'text-cyan-500' },
    { label: 'Take Preview', icon: 'play_arrow', color: 'text-navy' },
    { label: 'Archive Test', icon: 'archive', color: 'text-gray-400' },
    { label: 'Permanently Delete', icon: 'delete', color: 'text-red-500' }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative min-h-[600px]">
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
           <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Mock Test Engine</h3>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Design, Configure & Monitor Examinations</p>
        </div>
        <button 
          onClick={() => showToast("Initializing New Test Config...", "success")}
          className="bg-navy text-white text-[11px] font-black px-8 py-4 rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
        >
          <span className="material-icons-outlined text-sm">add</span> Create New Test
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#F8F9FA] text-[10px] font-black text-gray-400 uppercase tracking-widest">
             <tr>
               <th className="px-8 py-6 border-b border-gray-100">Test Title / Date</th>
               <th className="px-8 py-6 border-b border-gray-100">Target Course</th>
               <th className="px-8 py-6 border-b border-gray-100 text-center">Questions</th>
               <th className="px-8 py-6 border-b border-gray-100 text-center">Current Status</th>
               <th className="px-8 py-6 border-b border-gray-100 text-center">Control Panel</th>
             </tr>
          </thead>
          <tbody className="text-xs">
             {tests.map(t => (
               <tr key={t.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-8 py-6">
                     <p className="font-black text-navy uppercase tracking-tight text-sm leading-tight">{t.name}</p>
                     <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">Added on {t.date}</p>
                  </td>
                  <td className="px-8 py-6">
                     <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest border border-navy/10 px-3 py-1 rounded-full">{t.course}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto border border-gray-100">
                        <span className="font-black text-navy text-base">{t.q}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                       t.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                     }`}>
                       {t.status}
                     </span>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                     <div className="flex flex-col items-center gap-2">
                        <button 
                          onClick={() => setActiveMenu(activeMenu === t.id ? null : t.id)}
                          className="bg-orange-500 text-white text-[10px] font-black px-6 py-2.5 rounded-xl uppercase shadow-lg flex items-center gap-2 mx-auto hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
                        >
                          Actions <span className="material-icons-outlined text-xs">expand_more</span>
                        </button>
                        
                        {activeMenu === t.id && (
                          <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl py-4 z-[100] border border-gray-100 text-left animate-fade-in ring-4 ring-black/5">
                             <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
                                {actions.map((act, idx) => (
                                  <button 
                                    key={idx} 
                                    onClick={() => {
                                      showToast(`Action "${act.label}" triggered!`);
                                      setActiveMenu(null);
                                    }}
                                    className={`w-full px-6 py-3 flex items-center gap-4 text-[11px] font-bold hover:bg-gray-50 transition-colors ${act.color || 'text-navy'}`}
                                  >
                                    <span className={`material-icons-outlined text-lg opacity-40`}>{act.icon}</span> 
                                    <span className="tracking-tight">{act.label}</span>
                                  </button>
                                ))}
                             </div>
                          </div>
                        )}

                        <button 
                          onClick={() => showToast("Notifications sent to batch students!")}
                          className="bg-blue-600 text-white text-[9px] font-black px-4 py-1.5 rounded-lg uppercase shadow-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                           <span className="material-icons-outlined text-[10px]">send</span> Notify All
                        </button>
                     </div>
                  </td>
               </tr>
             ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Tests;
