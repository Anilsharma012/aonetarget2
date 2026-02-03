
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Settings: React.FC<Props> = ({ showToast }) => (
  <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 animate-fade-in">
     <h3 className="text-xl font-black text-navy uppercase tracking-widest mb-10">Global Configuration</h3>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment Gateway</p>
           <div className="h-12 bg-gray-50 rounded-xl flex items-center px-4 font-bold text-xs">RAZORPAY STABLE</div>
        </div>
        <div className="space-y-4">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
           <div className="h-12 bg-green-50 text-green-600 rounded-xl flex items-center px-4 font-black text-xs uppercase">ONLINE</div>
        </div>
     </div>
     <button onClick={() => showToast("Settings updated successfully!")} className="mt-8 bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest">Save Changes</button>
  </div>
);

export default Settings;
