
import React from 'react';

interface Props {
  // Fix: Corrected signature to match AdminDashboard's showToast
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Students: React.FC<Props> = ({ showToast }) => {
  const students = [
    { name: 'Rahul Deshmukh', phone: '9845210022', course: 'NEET Droppers Batch', id: 'ST-2001', city: 'Pune' },
    { name: 'Sneha Patil', phone: '8876543210', course: 'Nursing CET 2025', id: 'ST-2002', city: 'Nagpur' },
    { name: 'Vikram Singh', phone: '7766554433', course: 'Class 12th PCM', id: 'ST-2003', city: 'Delhi' },
    { name: 'Pooja Verma', phone: '9988776655', course: 'Physics Crash Course', id: 'ST-2004', city: 'Indore' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
           <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Student Directory</h3>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Monitor Enrollment & Student Lifecycle</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => showToast("Exporting Excel file...")} className="px-6 py-3 bg-white border border-gray-200 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Export CSV</button>
           <button onClick={() => showToast("Opening Add Student Modal...")} className="px-6 py-4 bg-navy text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all">+ Add New Student</button>
        </div>
      </div>
      
      <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center">
         <div className="flex-1 relative min-w-[300px]">
            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5 transition-all" placeholder="Search by name, ID or mobile..." />
         </div>
         <div className="flex gap-2">
            <select className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none">
               <option>Status: All</option>
               <option>Active Only</option>
               <option>Inactive Only</option>
            </select>
            <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-navy"><span className="material-icons-outlined text-sm">filter_alt</span></button>
         </div>
      </div>

      <div className="overflow-x-auto">
         <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-[10px] font-black text-gray-400 uppercase tracking-widest">
               <tr>
                 <th className="px-8 py-5 border-b border-gray-100">Full Name / ID</th>
                 <th className="px-8 py-5 border-b border-gray-100">Assigned Package</th>
                 <th className="px-8 py-5 border-b border-gray-100 text-center">Status</th>
                 <th className="px-8 py-5 border-b border-gray-100 text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="text-xs">
               {students.map(s => (
                 <tr key={s.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center font-black text-navy text-[10px]">
                             {s.name.charAt(0)}
                          </div>
                          <div>
                             <p className="font-black text-navy uppercase tracking-tight">{s.name}</p>
                             <p className="text-[10px] font-bold text-gray-300">ID: {s.id} • {s.phone} • {s.city}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-[9px] font-black text-navy/40 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{s.course}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <span className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter">Active</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                       <div className="flex justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => showToast(`Opening profile of ${s.name}`)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-navy hover:bg-navy hover:text-white transition-all shadow-sm"><span className="material-icons-outlined text-sm">visibility</span></button>
                          <button onClick={() => showToast(`Editing profile of ${s.name}`)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm"><span className="material-icons-outlined text-sm">edit</span></button>
                          <button onClick={() => showToast("Student account deactivated", "error")} className="p-2.5 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><span className="material-icons-outlined text-sm">block</span></button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default Students;
