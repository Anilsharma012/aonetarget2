
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Packages: React.FC<Props> = ({ showToast }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
     <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h4 className="text-lg font-black text-navy uppercase tracking-widest mb-4">Course Bundles</h4>
        <p className="text-xs text-gray-400 font-medium">Create and manage multi-course batches here.</p>
        <button onClick={() => showToast("Managing Bundles...")} className="mt-4 bg-navy text-white px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest">Manage</button>
     </div>
     <div className="bg-navy rounded-[2.5rem] p-10 text-white flex flex-col justify-center">
        <h4 className="text-xl font-black uppercase tracking-widest mb-2">Assignment Root</h4>
        <p className="text-[10px] opacity-60 font-bold tracking-[0.2em] uppercase">Batching Engine Active</p>
     </div>
  </div>
);

export default Packages;
