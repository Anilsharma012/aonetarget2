import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

interface SettingsProps {
  setAuth?: (auth: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: false,
    autoPlay: true,
    downloadOverWifi: true,
    videoQuality: 'auto'
  });

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
    } else {
      navigate('/student-login');
    }
  }, []);

  const handleToggle = (key: string) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    localStorage.removeItem('isStudentAuthenticated');
    if (setAuth) setAuth(false);
    navigate('/');
  };

  const settingsGroups = [
    {
      title: 'Notifications',
      items: [
        { key: 'notifications', label: 'Push Notifications', icon: 'notifications', toggle: true },
        { key: 'emailUpdates', label: 'Email Updates', icon: 'mail', toggle: true }
      ]
    },
    {
      title: 'Appearance',
      items: [
        { key: 'darkMode', label: 'Dark Mode', icon: 'dark_mode', toggle: true }
      ]
    },
    {
      title: 'Video',
      items: [
        { key: 'autoPlay', label: 'Auto-play Videos', icon: 'play_circle', toggle: true },
        { key: 'downloadOverWifi', label: 'Download over Wi-Fi only', icon: 'wifi', toggle: true },
        { key: 'videoQuality', label: 'Video Quality', icon: 'hd', value: 'Auto' }
      ]
    },
    {
      title: 'Account',
      items: [
        { key: 'password', label: 'Change Password', icon: 'lock' },
        { key: 'privacy', label: 'Privacy Policy', icon: 'privacy_tip' },
        { key: 'terms', label: 'Terms of Service', icon: 'description' },
        { key: 'about', label: 'About App', icon: 'info', value: 'v1.0.0' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-gray-700 to-[#37474F] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <h1 className="text-lg font-bold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {settingsGroups.map((group, groupIdx) => (
          <section key={groupIdx}>
            <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-3 px-2">
              {group.title}
            </h3>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {group.items.map((item, itemIdx) => (
                <div 
                  key={item.key}
                  className={`flex items-center justify-between p-4 ${itemIdx !== group.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-gray-500">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  {item.toggle ? (
                    <button 
                      onClick={() => handleToggle(item.key)}
                      className={`w-12 h-6 rounded-full transition-all relative ${
                        settings[item.key as keyof typeof settings] ? 'bg-brandBlue' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`absolute w-5 h-5 bg-white rounded-full top-0.5 shadow transition-all ${
                        settings[item.key as keyof typeof settings] ? 'left-6' : 'left-0.5'
                      }`}></span>
                    </button>
                  ) : item.value ? (
                    <span className="text-xs text-gray-400">{item.value}</span>
                  ) : (
                    <span className="material-symbols-rounded text-gray-400">chevron_right</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-rounded">logout</span>
          Logout
        </button>

        <p className="text-center text-[10px] text-gray-300 mt-4">
          Aone Target Institute Pvt. Ltd. | Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default Settings;
