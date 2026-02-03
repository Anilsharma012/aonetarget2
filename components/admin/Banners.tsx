
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Banners: React.FC<Props> = ({ showToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-center">
       <h3 className="text-xl font-black text-navy uppercase tracking-widest">App Slide Banners</h3>
       <button onClick={() => showToast("Opening Banner Uploader...")} className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest">+ Add Slider</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       <div className="aspect-[2/1] bg-navy/5 rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
          <span className="material-icons-outlined text-4xl mb-2">add_photo_alternate</span>
          <p className="text-[10px] font-black uppercase">Slot 1 Available</p>
       </div>
       <div className="aspect-[2/1] bg-navy/5 rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300">
          <span className="material-icons-outlined text-4xl mb-2">add_photo_alternate</span>
          <p className="text-[10px] font-black uppercase">Slot 2 Available</p>
       </div>
    </div>
  </div>
);

export default Banners;
