
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const LiveVideos: React.FC<Props> = ({ showToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-center">
       <h3 className="text-xl font-black text-navy uppercase tracking-widest">Live Stream Center</h3>
       <button onClick={() => showToast("Starting Live Stream...")} className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> GO LIVE NOW
       </button>
    </div>
    <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 text-center opacity-30 shadow-sm">
       <span className="material-icons-outlined text-7xl mb-4">live_tv</span>
       <h4 className="text-sm font-black uppercase tracking-widest">No Active Streams</h4>
    </div>
  </div>
);

export default LiveVideos;
