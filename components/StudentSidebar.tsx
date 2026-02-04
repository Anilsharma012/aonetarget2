import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface StudentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    name: string;
    email: string;
  } | null;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, onClose, student }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: 'home', label: 'Home', path: '/' },
    { icon: 'dashboard', label: 'Dashboard', path: '/student-dashboard' },
    { icon: 'play_circle', label: 'My Courses', path: '/my-courses' },
    { icon: 'videocam', label: 'Live Classes', path: '/live-classes' },
    { icon: 'school', label: 'Batches', path: '/batches' },
    { icon: 'quiz', label: 'Mock Tests', path: '/mock-tests' },
    { icon: 'menu_book', label: 'E-Book Notes', path: '/ebook-notes' },
    { icon: 'download', label: 'Downloads', path: '/downloads' },
    { icon: 'notifications', label: 'Notifications', path: '/notifications' },
    { icon: 'history', label: 'Watch History', path: '/watch-history' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 shadow-2xl animate-slide-in-left">
        <div className="bg-gradient-to-r from-brandBlue to-[#1A237E] p-4">
          <div className="flex items-center justify-between mb-4">
            <img 
              src="/attached_assets/image_1738944552493.png" 
              alt="Aone Target" 
              className="h-8 bg-white rounded px-2 py-1"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <button onClick={onClose} className="text-white p-1">
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div 
            className="flex items-center gap-3 bg-white/20 rounded-xl p-3 cursor-pointer hover:bg-white/30 transition-all"
            onClick={() => handleNavigation('/profile')}
          >
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-xl font-black text-brandBlue">
                {student?.name?.charAt(0)?.toUpperCase() || 'S'}
              </span>
            </div>
            <div className="flex-1 text-white">
              <p className="font-bold text-sm">{student?.name || 'Student'}</p>
              <p className="text-[10px] opacity-80">{student?.email || 'student@email.com'}</p>
            </div>
            <span className="material-symbols-rounded text-white">chevron_right</span>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-180px)] py-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-4 px-6 py-4 transition-all ${
                  isActive 
                    ? 'bg-brandBlue/10 text-brandBlue border-r-4 border-brandBlue' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className={`material-symbols-rounded ${isActive ? 'text-brandBlue' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <p className="text-[10px] text-gray-400 text-center">
            Aone Target Institute Pvt. Ltd.
          </p>
        </div>
      </div>
    </>
  );
};

export default StudentSidebar;
