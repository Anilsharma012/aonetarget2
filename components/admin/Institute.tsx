
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Institute: React.FC<Props> = ({ showToast }) => (
  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 animate-fade-in max-w-2xl">
     <h3 className="text-xl font-black text-navy uppercase tracking-widest mb-8 border-b border-gray-50 pb-4">Institute Settings</h3>
     <div className="space-y-6">
        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Institute Name</label>
           <input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none" value="Aone Target Institute" readOnly />
        </div>
        <div className="flex flex-col gap-2">
           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Official Email</label>
           <input className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none" value="contact@aonetarget.com" readOnly />
        </div>
        <button onClick={() => showToast("Profile settings saved!")} className="w-full bg-navy text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl mt-6">Update Profile</button>
     </div>
  </div>
);

export default Institute;
