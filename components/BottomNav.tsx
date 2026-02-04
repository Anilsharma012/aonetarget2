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
    { name: 'Batches', icon: 'school', path: '/batches' },
    { name: 'Courses', icon: 'menu_book', path: '/courses' },
    { name: 'Chats', icon: 'chat_bubble', path: isLoggedIn ? '/chats' : '/student-login' },
    { name: 'Profile', icon: 'person', path: isLoggedIn ? '/profile' : '/student-login' },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex justify-around items-center py-3">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1 w-full transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`}>
                {tab.icon}
              </span>
              <span className="text-[10px] font-medium">{tab.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
