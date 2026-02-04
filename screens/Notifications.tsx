import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchNotifications();
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'test': return 'assignment';
      case 'course': return 'school';
      case 'live': return 'videocam';
      case 'result': return 'emoji_events';
      case 'payment': return 'payment';
      default: return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'test': return 'bg-purple-100 text-purple-600';
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'live': return 'bg-red-100 text-red-600';
      case 'result': return 'bg-yellow-100 text-yellow-600';
      case 'payment': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-amber-500 to-[#F57C00] text-white pt-8 pb-6 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
              <span className="material-symbols-rounded">menu</span>
            </button>
            <h1 className="text-lg font-bold">Notifications</h1>
          </div>
          {notifications.length > 0 && (
            <button className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
              Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-amber-500">progress_activity</span>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-xl p-4 shadow-sm flex gap-4 ${!notif.isRead ? 'border-l-4 border-amber-500' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(notif.type)}`}>
                  <span className="material-symbols-rounded">{getNotificationIcon(notif.type)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{notif.title}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">{notif.message}</p>
                  <p className="text-[10px] text-gray-300 mt-2">{notif.createdAt || 'Just now'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <span className="material-symbols-rounded text-6xl text-gray-300">notifications_off</span>
            <p className="text-sm text-gray-400 mt-4">No notifications</p>
            <p className="text-[10px] text-gray-300 mt-1">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
