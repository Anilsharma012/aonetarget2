import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState({
    courses: 0,
    tests: 0,
    alerts: 0
  });
  const [progress, setProgress] = useState({
    physics: 0,
    chemistry: 0,
    biology: 0
  });
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchDashboardData(studentData.id);
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchDashboardData = async (studentId: string) => {
    try {
      const [coursesRes, testsRes, notificationsRes, progressRes] = await Promise.all([
        fetch(`/api/students/${studentId}/courses`),
        fetch('/api/tests'),
        fetch('/api/notifications'),
        fetch(`/api/students/${studentId}/progress`)
      ]);

      const coursesData = await coursesRes.json().catch(() => []);
      const testsData = await testsRes.json().catch(() => []);
      const notificationsData = await notificationsRes.json().catch(() => []);
      const progressData = await progressRes.json().catch(() => ({}));

      setStats({
        courses: Array.isArray(coursesData) ? coursesData.length : 0,
        tests: Array.isArray(testsData) ? testsData.length : 0,
        alerts: Array.isArray(notificationsData) ? notificationsData.length : 0
      });

      if (progressData && typeof progressData === 'object') {
        setProgress({
          physics: progressData.physics || 45,
          chemistry: progressData.chemistry || 60,
          biology: progressData.biology || 35
        });
      }

      setUpcomingTests(Array.isArray(testsData) ? testsData.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="material-symbols-rounded animate-spin text-4xl text-brandBlue">progress_activity</span>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        student={student}
      />

      <header className="bg-gradient-to-r from-brandBlue to-[#1A237E] text-white pt-8 pb-20 px-4 rounded-b-[2rem]">
        <div className="flex justify-between items-start mb-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 rounded-full hover:bg-white/20"
          >
            <span className="material-symbols-rounded">menu</span>
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2 rounded-full hover:bg-white/20 relative"
            >
              <span className="material-symbols-rounded">notifications</span>
              {stats.alerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          </div>
        </div>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-xl">
            <span className="text-3xl font-black text-brandBlue">
              {student?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <h1 className="text-lg font-bold uppercase">{student?.name || 'STUDENT'}</h1>
          <p className="text-blue-200 text-xs mt-1">{student?.email}</p>
          <div className="flex justify-center gap-3 mt-3">
            <span className="bg-gray-800 px-4 py-1.5 rounded-full text-xs font-bold">
              {student?.class || '12th'}
            </span>
            <span className="bg-gray-800 px-4 py-1.5 rounded-full text-xs font-bold">
              {student?.target || 'NEET'}
            </span>
          </div>
        </div>
      </header>

      <div className="-mt-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <span className="text-2xl font-black text-brandBlue">{stats.courses}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Courses</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <span className="text-2xl font-black text-green-600">{stats.tests}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Tests</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-orange-500">{stats.alerts}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Alerts</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
            { key: 'courses', label: 'Courses', icon: 'school' },
            { key: 'tests', label: 'Tests', icon: 'quiz' },
            { key: 'alerts', label: 'Alerts', icon: 'notifications' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg font-bold text-[10px] flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.key ? 'bg-white text-brandBlue shadow-sm' : 'text-gray-500'
              }`}
            >
              <span className="material-symbols-rounded text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-brandBlue">trending_up</span>
                Your Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Physics</span>
                    <span className="font-bold text-brandBlue">{progress.physics}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brandBlue transition-all duration-500" style={{ width: `${progress.physics}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Chemistry</span>
                    <span className="font-bold text-green-600">{progress.chemistry}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progress.chemistry}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Biology</span>
                    <span className="font-bold text-orange-500">{progress.biology}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${progress.biology}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-brandRed">schedule</span>
                Upcoming Tests
              </h3>
              {upcomingTests.length > 0 ? (
                upcomingTests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-3 border-b last:border-0">
                    <div className="w-10 h-10 bg-brandRed/10 rounded-lg flex items-center justify-center">
                      <span className="material-symbols-rounded text-brandRed">assignment</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{test.title || test.name}</p>
                      <p className="text-[10px] text-gray-400">{test.subject || 'General'} | {test.duration || 60} mins</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/mock-tests/${test.id}`)}
                      className="bg-brandBlue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold"
                    >
                      Start
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming tests</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-rounded text-6xl text-gray-300">school</span>
              <p className="text-sm text-gray-400 mt-4">View your enrolled courses</p>
              <button 
                onClick={() => navigate('/my-courses')}
                className="mt-4 bg-brandBlue text-white px-6 py-2 rounded-lg text-sm font-bold"
              >
                Go to My Courses
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-rounded text-6xl text-gray-300">quiz</span>
              <p className="text-sm text-gray-400 mt-4">Take mock tests and improve</p>
              <button 
                onClick={() => navigate('/mock-tests')}
                className="mt-4 bg-brandBlue text-white px-6 py-2 rounded-lg text-sm font-bold"
              >
                Go to Mock Tests
              </button>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-rounded text-6xl text-gray-300">notifications</span>
              <p className="text-sm text-gray-400 mt-4">View all notifications</p>
              <button 
                onClick={() => navigate('/notifications')}
                className="mt-4 bg-brandBlue text-white px-6 py-2 rounded-lg text-sm font-bold"
              >
                Go to Notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
