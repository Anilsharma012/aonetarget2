
import React from 'react';

interface Props {
  // Fix: Added Props interface to handle showToast passed from AdminDashboard
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Store: React.FC<Props> = ({ showToast }) => (
  <div className="space-y-8 animate-fade-in">
    <div className="flex justify-between items-center">
       <h3 className="text-xl font-black text-navy uppercase tracking-widest">Store Inventory</h3>
       <button onClick={() => showToast("Opening Add Package Wizard...")} className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest">+ Add New Package</button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
       {[1,2,3].map(i => (
         <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group">
            <div className="aspect-video bg-navy/5 flex items-center justify-center relative">
               <span className="material-icons-outlined text-4xl text-navy/20">inventory_2</span>
               <div className="absolute top-4 right-4 bg-navy text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Valid: 365 Days</div>
            </div>
            <div className="p-6">
               <h4 className="font-black text-navy uppercase text-sm mb-2 leading-tight truncate">NEET Masterclass Package {i}</h4>
               <p className="text-[10px] text-gray-400 font-bold mb-4 uppercase tracking-widest">Course: Droppers Batch</p>
               <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                  <span className="text-lg font-black text-navy">₹4,999</span>
                  <div className="flex gap-2">
                     <button className="p-2 text-navy hover:bg-navy/5 rounded-lg transition-all"><span className="material-icons-outlined text-sm">edit</span></button>
                     <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><span className="material-icons-outlined text-sm">delete</span></button>
                  </div>
               </div>
            </div>
         </div>
       ))}
    </div>
  </div>
);

export default Store;
