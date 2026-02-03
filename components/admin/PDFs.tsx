
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const PDFs: React.FC<Props> = ({ showToast }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
     <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <h3 className="text-xl font-black text-navy uppercase tracking-widest">PDF Assets</h3>
        <button onClick={() => showToast("Opening PDF Uploader...")} className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest">+ Upload PDF</button>
     </div>
     <div className="h-64 flex flex-col items-center justify-center opacity-20">
        <span className="material-icons-outlined text-7xl text-red-500">picture_as_pdf</span>
        <p className="font-black mt-2 uppercase tracking-widest">No Documents Found</p>
     </div>
  </div>
);

export default PDFs;
