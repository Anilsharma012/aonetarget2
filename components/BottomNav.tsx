import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BottomNavProps {
  isLoggedIn?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ isLoggedIn = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const tabs = [
    { name: 'Home', icon: 'home', path: '/' },
    { name: 'Courses', icon: 'menu_book', path: '/explore' },
    { name: 'My Courses', icon: 'school', path: isLoggedIn ? '/my-courses' : '/student-login' },
    { name: 'Chats', icon: 'chat_bubble', path: isLoggedIn ? '/chats' : '/student-login' },
    { name: 'Profile', icon: 'person', path: isLoggedIn ? '/profile' : '/student-login' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md z-50 px-3 pb-2">
      <div className="relative bg-white/80 dark:bg-[#1a1a2e]/90 backdrop-blur-xl rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.12)] border border-white/30 dark:border-white/10">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            return (
              <button
                key={tab.name}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-300 group"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A237E]/10 to-[#D32F2F]/10 rounded-xl" />
                )}
                <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#1A237E] to-[#303F9F] shadow-lg shadow-[#1A237E]/30 scale-110' 
                    : 'group-hover:bg-gray-100 dark:group-hover:bg-white/10'
                }`}>
                  <span className={`material-symbols-outlined text-[22px] transition-all duration-300 ${
                    isActive ? 'text-white fill-1' : 'text-gray-400 dark:text-gray-500 group-hover:text-[#1A237E]'
                  }`}>
                    {tab.icon}
                  </span>
                </div>
                <span className={`text-[10px] font-semibold transition-all duration-300 relative ${
                  isActive ? 'text-[#1A237E] dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-[#1A237E]'
                }`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
