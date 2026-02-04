import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

interface StudentProfileProps {
  setAuth: (auth: boolean) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    tests: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    class: '',
    target: ''
  });

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      setEditForm({
        name: studentData.name || '',
        phone: studentData.phone || '',
        class: studentData.class || '12th',
        target: studentData.target || 'NEET'
      });
      fetchStats(studentData.id);
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchStats = async (studentId: string) => {
    try {
      const [coursesRes, testsRes] = await Promise.all([
        fetch(`/api/students/${studentId}/courses`),
        fetch(`/api/students/${studentId}/test-results`)
      ]);

      const coursesData = await coursesRes.json().catch(() => []);
      const testsData = await testsRes.json().catch(() => []);

      const courses = Array.isArray(coursesData) ? coursesData : [];
      const completedCourses = courses.filter((c: any) => c.progress >= 100).length;

      setStats({
        enrolled: courses.length,
        completed: completedCourses,
        tests: Array.isArray(testsData) ? testsData.length : 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (response.ok) {
        const updatedStudent = { ...student, ...editForm };
        setStudent(updatedStudent);
        localStorage.setItem('studentData', JSON.stringify(updatedStudent));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const menuItems = [
    { icon: 'edit', label: 'Edit Profile', action: () => setIsEditing(true) },
    { icon: 'school', label: 'My Courses', path: '/my-courses' },
    { icon: 'quiz', label: 'My Tests', path: '/mock-tests' },
    { icon: 'download', label: 'Downloads', path: '/downloads' },
    { icon: 'notifications', label: 'Notifications', path: '/notifications' },
    { icon: 'help', label: 'Help & Support', path: '/help-support' },
    { icon: 'settings', label: 'Settings', path: '/settings' }
  ];

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
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-brandBlue to-[#1A237E] text-white pt-6 pb-8 px-4">
        <div className="flex justify-between items-start mb-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <button onClick={handleLogout} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">logout</span>
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
            <span className="text-3xl font-black text-brandBlue">
              {student?.name?.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">{student?.name || 'Student'}</h1>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1 bg-white/20 rounded-full"
              >
                <span className="material-symbols-rounded text-sm">edit</span>
              </button>
            </div>
            <p className="text-blue-200 text-xs mt-0.5">{student?.email}</p>
            <p className="text-blue-200 text-xs">{student?.phone || '+91 XXXXX XXXXX'}</p>
          </div>
        </div>
      </header>

      <div className="-mt-4 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-4">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Learning Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-black text-brandBlue">{stats.enrolled}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold">Enrolled</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-black text-green-600">{stats.completed}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold">Completed</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-black text-orange-500">{stats.tests}</span>
              </div>
              <p className="text-[10px] text-gray-500 font-bold">Tests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => item.path ? navigate(item.path) : item.action?.()}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-rounded text-gray-600">{item.icon}</span>
            </div>
            <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
            <span className="material-symbols-rounded text-gray-400">chevron_right</span>
          </button>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button onClick={() => setIsEditing(false)} className="p-1">
                <span className="material-symbols-rounded text-gray-400">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Class</label>
                  <select
                    value={editForm.class}
                    onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue"
                  >
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                    <option value="Dropper">Dropper</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Target</label>
                  <select
                    value={editForm.target}
                    onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
                    className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brandBlue"
                  >
                    <option value="NEET">NEET</option>
                    <option value="JEE">JEE</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 py-3 bg-brandBlue text-white rounded-xl font-bold text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
