
import React from 'react';

interface Props {
  // Fix: Corrected signature to match AdminDashboard's showToast
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Questions: React.FC<Props> = ({ showToast }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
     <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <div>
           <h3 className="text-xl font-black text-navy uppercase tracking-widest">Question Repository</h3>
           <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Global MCQ & Numerical Bank</p>
        </div>
        <button 
          onClick={() => showToast("Opening Question Wizard...")}
          className="bg-navy text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-xl tracking-widest hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-sm">add</span> Add New Question
        </button>
     </div>
     
     <div className="p-6 border-b border-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 outline-none">
           <option>Subject: All</option>
           <option>Physics (Bhotiki)</option>
           <option>Biology (Jeev Vigyan)</option>
        </select>
        <select className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 outline-none">
           <option>Difficulty: All</option>
           <option>Level: Easy</option>
           <option>Level: Hard</option>
        </select>
        <div className="md:col-span-2 relative">
           <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">search</span>
           <input className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl text-[11px] font-bold uppercase text-navy outline-none" placeholder="Search by Q-ID or Topic keywords..." />
        </div>
     </div>

     {/* Demo List */}
     <div className="p-8 space-y-4">
        {[1,2].map(i => (
          <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-navy/20 transition-all group">
             <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black bg-navy text-white px-3 py-1 rounded-lg uppercase tracking-widest">Q-ID: #890{i}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => showToast(`Editing Q-ID #890${i}`)} className="p-2 bg-white rounded-lg shadow-sm text-blue-600"><span className="material-icons-outlined text-sm">edit</span></button>
                   <button onClick={() => showToast(`Deleted Q-ID #890${i}`, "error")} className="p-2 bg-white rounded-lg shadow-sm text-red-500"><span className="material-icons-outlined text-sm">delete</span></button>
                </div>
             </div>
             <p className="text-sm font-bold text-navy mb-4 leading-relaxed">
                {i === 1 ? 'A stone is thrown vertically upward with a velocity of 30 m/s. Calculate the maximum height reached by the stone (g = 10 m/s²).' : 'Explain the structure and function of Mitochondria in a eukaryotic cell.'}
             </p>
             <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Subject: {i === 1 ? 'Physics' : 'Biology'}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Topic: {i === 1 ? 'Kinematics' : 'Cell Structure'}</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-auto">Ans: {i === 1 ? 'Option B (45m)' : 'Verified'}</span>
             </div>
          </div>
        ))}
     </div>

     <div className="p-8 border-t border-gray-50 text-center">
        <button onClick={() => showToast("Loading more questions...")} className="text-[10px] font-black text-navy/40 uppercase tracking-widest hover:text-navy transition-colors">Load More Questions (52,398 Remaining)</button>
     </div>
  </div>
);

export default Questions;
