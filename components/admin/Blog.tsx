
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Blog: React.FC<Props> = ({ showToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-center">
       <h3 className="text-xl font-black text-navy uppercase tracking-widest">Articles & Updates</h3>
       <button onClick={() => showToast("Opening Post Editor...")} className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest">+ New Post</button>
    </div>
    <div className="h-64 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-center opacity-20">
       <span className="material-icons-outlined text-7xl">article</span>
       <p className="font-black mt-2 uppercase tracking-widest">Drafts Empty</p>
    </div>
  </div>
);

export default Blog;
