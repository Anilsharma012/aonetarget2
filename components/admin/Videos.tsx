
import React from 'react';

interface Props {
  // Fix: Corrected signature to match AdminDashboard's showToast
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Videos: React.FC<Props> = ({ showToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
       <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">Video Lecture Series</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Manage VOD Library & Course Attachments</p>
       </div>
       <button 
        onClick={() => showToast("Initializing Upload Stream...")}
        className="bg-navy text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-xl tracking-widest hover:scale-105 transition-all"
       >
        + Upload New Lecture
       </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[1,2,3].map(i => (
         <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-2xl transition-all">
            <div className="aspect-video bg-navy relative group cursor-pointer overflow-hidden">
               <img src={`https://picsum.photos/400/225?sig=${i}`} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" alt="" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                     <span className="material-icons-outlined text-3xl">play_arrow</span>
                  </div>
               </div>
               <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-[9px] font-black bg-black/60 text-white px-3 py-1 rounded-full uppercase">45:10 MINS</span>
                  <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">HD 1080P</span>
               </div>
            </div>
            <div className="p-6">
               <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Physics / Mechanics</p>
               <h4 className="font-black text-navy uppercase text-sm mb-3 leading-tight truncate">Lecture 0{i}: Motion in a straight line (Basic)</h4>
               <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                     <span className="material-icons-outlined text-xs text-gray-300">visibility</span>
                     <span className="text-[10px] font-bold text-gray-400">1.2K Views</span>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => showToast("Edit details...")} className="p-2 text-navy hover:bg-gray-50 rounded-lg"><span className="material-icons-outlined text-sm">edit</span></button>
                     <button onClick={() => showToast("Deleted successfully", "error")} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><span className="material-icons-outlined text-sm">delete</span></button>
                  </div>
               </div>
            </div>
         </div>
       ))}
    </div>
  </div>
);

export default Videos;
