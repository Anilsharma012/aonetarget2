import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const Downloads: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchDownloads(studentData.id);
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchDownloads = async (studentId: string) => {
    try {
      const response = await fetch(`/api/students/${studentId}/downloads`);
      const data = await response.json();
      setDownloads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video': return 'play_circle';
      case 'pdf': return 'picture_as_pdf';
      case 'audio': return 'headphones';
      default: return 'description';
    }
  };

  const getFileColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'video': return 'bg-red-100 text-red-600';
      case 'pdf': return 'bg-orange-100 text-orange-600';
      case 'audio': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-indigo-600 to-[#303F9F] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <h1 className="text-lg font-bold">Downloads</h1>
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-indigo-600">progress_activity</span>
          </div>
        ) : downloads.length > 0 ? (
          <div className="space-y-3">
            {downloads.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getFileColor(item.type)}`}>
                  <span className="material-symbols-rounded text-2xl">{getFileIcon(item.type)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                    <span>{item.size || '0 MB'}</span>
                    <span>{item.downloadedAt || 'Recently'}</span>
                  </div>
                </div>
                <button className="p-2 text-indigo-600">
                  <span className="material-symbols-rounded">folder_open</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <span className="material-symbols-rounded text-6xl text-gray-300">download</span>
            <p className="text-sm text-gray-400 mt-4">No downloads yet</p>
            <p className="text-[10px] text-gray-300 mt-1">Downloaded videos and notes will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Downloads;
