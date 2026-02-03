
import React from 'react';

interface Props {
  // Fix: Corrected signature to match AdminDashboard's showToast
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const MiscSection: React.FC<Props> = ({ showToast }) => {
  const items = [
    { name: 'Courses', icon: 'auto_stories', color: 'bg-blue-600' },
    { name: 'Sub Courses', icon: 'collections_bookmark', color: 'bg-indigo-600' },
    { name: 'Subjects', icon: 'science', color: 'bg-purple-600' },
    { name: 'Topics', icon: 'list_alt', color: 'bg-violet-600' },
    { name: 'Instructions', icon: 'help', color: 'bg-pink-600' },
    { name: 'Exam Documents', icon: 'folder_shared', color: 'bg-orange-600' },
    { name: 'Global News', icon: 'newspaper', color: 'bg-teal-600' },
    { name: 'Push Notify', icon: 'notifications_active', color: 'bg-amber-600' },
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {items.map(item => (
        <div 
          key={item.name} 
          onClick={() => showToast(`Opening ${item.name} Manager`)}
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-navy/10 hover:-translate-y-1 transition-all cursor-pointer group"
        >
           <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
              <span className="material-icons-outlined text-2xl">{item.icon}</span>
           </div>
           <h4 className="text-sm font-black text-navy uppercase tracking-widest group-hover:text-blue-600 transition-colors">{item.name}</h4>
           <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">Manage Infrastructure</p>
        </div>
      ))}
    </div>
  );
};

export default MiscSection;
