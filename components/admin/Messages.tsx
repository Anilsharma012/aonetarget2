
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Messages: React.FC<Props> = ({ showToast }) => (
  <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 h-[600px] flex animate-fade-in overflow-hidden">
     <div className="w-80 border-r border-gray-50 bg-gray-50/50 p-6">
        <h4 className="text-sm font-black text-navy uppercase tracking-widest mb-6">Inbox</h4>
        <div className="space-y-4 opacity-30">
           <div className="h-14 bg-white rounded-xl"></div>
           <div className="h-14 bg-white rounded-xl"></div>
        </div>
     </div>
     <div className="flex-1 flex flex-col items-center justify-center opacity-10">
        <span className="material-icons-outlined text-8xl">forum</span>
        <p className="font-black mt-4 uppercase tracking-[0.4em]">Select Conversation</p>
     </div>
  </div>
);

export default Messages;
