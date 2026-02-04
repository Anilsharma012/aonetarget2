import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface StudentProfileProps {
  setAuth: (auth: boolean) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchStudentData(studentData.id);
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchStudentData = async (studentId: string) => {
    try {
      const [coursesRes, notificationsRes, testsRes] = await Promise.all([
        fetch(`/api/students/${studentId}/courses`),
        fetch('/api/notifications'),
        fetch('/api/tests')
      ]);

      const coursesData = await coursesRes.json();
      const notificationsData = await notificationsRes.json();
      const testsData = await testsRes.json();

      setEnrolledCourses(Array.isArray(coursesData) ? coursesData : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('studentData');
    localStorage.removeItem('isStudentAuthenticated');
    setAuth(false);
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <span className="material-symbols-rounded animate-spin text-4xl text-brandBlue">progress_activity</span>
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-r from-brandBlue to-[#1A237E] text-white pt-8 pb-20 px-4 rounded-b-[2rem]">
        <div className="flex justify-between items-start mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">logout</span>
          </button>
        </div>
        
        <div className="text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
            <span className="text-4xl font-black text-brandBlue">
              {student?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <h1 className="text-xl font-bold">{student?.name || 'Student'}</h1>
          <p className="text-blue-200 text-sm mt-1">{student?.email}</p>
          <div className="flex justify-center gap-4 mt-4">
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              {student?.class || '11th'}
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              {student?.target || 'NEET'}
            </span>
          </div>
        </div>
      </header>

      <div className="-mt-10 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <span className="text-2xl font-black text-brandBlue">{enrolledCourses.length}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Courses</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <span className="text-2xl font-black text-green-600">{tests.length}</span>
            <p className="text-[10px] text-gray-500 font-bold uppercase">Tests</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-black text-orange-500">{notifications.length}</span>
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
            { key: 'notifications', label: 'Alerts', icon: 'notifications' }
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
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Physics</span>
                    <span className="font-bold text-brandBlue">45%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brandBlue w-[45%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Chemistry</span>
                    <span className="font-bold text-green-600">60%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[60%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Biology</span>
                    <span className="font-bold text-orange-500">35%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 w-[35%]"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
                <span className="material-symbols-rounded text-brandRed">schedule</span>
                Upcoming Tests
              </h3>
              {tests.slice(0, 3).map((test, idx) => (
                <div key={idx} className="flex items-center gap-3 py-3 border-b last:border-0">
                  <div className="w-10 h-10 bg-brandRed/10 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-rounded text-brandRed">assignment</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{test.title || test.name}</p>
                    <p className="text-[10px] text-gray-400">{test.subject || 'General'}</p>
                  </div>
                  <button className="bg-brandBlue text-white px-3 py-1 rounded-lg text-[10px] font-bold">
                    Start
                  </button>
                </div>
              ))}
              {tests.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">No upcoming tests</p>
              )}
            </section>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-4">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-brandBlue to-[#1A237E] rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-white text-2xl">school</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{course.name || course.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{course.subject || 'NEET Preparation'}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${course.progress || 30}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">{course.progress || 30}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <span className="material-symbols-rounded text-6xl text-gray-300">school</span>
                <p className="text-sm text-gray-400 mt-4">No enrolled courses yet</p>
                <button 
                  onClick={() => navigate('/batches')}
                  className="mt-4 bg-brandBlue text-white px-6 py-2 rounded-lg text-sm font-bold"
                >
                  Browse Courses
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-4">
            {tests.length > 0 ? (
              tests.map((test, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{test.title || test.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{test.questions?.length || 0} Questions | {test.duration || 60} mins</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      test.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {test.status || 'Pending'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 bg-brandBlue text-white py-2 rounded-lg text-xs font-bold">
                      Start Test
                    </button>
                    <button className="px-4 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold">
                      Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <span className="material-symbols-rounded text-6xl text-gray-300">quiz</span>
                <p className="text-sm text-gray-400 mt-4">No tests available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-rounded text-brandBlue">
                      {notif.type === 'test' ? 'assignment' : notif.type === 'course' ? 'school' : 'notifications'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{notif.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-[10px] text-gray-300 mt-2">{notif.createdAt || 'Just now'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <span className="material-symbols-rounded text-6xl text-gray-300">notifications_off</span>
                <p className="text-sm text-gray-400 mt-4">No notifications</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProfile;
