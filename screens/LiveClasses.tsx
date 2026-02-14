import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';
import { liveVideosAPI } from '../src/services/apiClient';

const LiveClasses: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchLiveClasses();
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchLiveClasses = async () => {
    try {
      const data = await liveVideosAPI.getAll();
      if (Array.isArray(data)) {
        setLiveClasses(data.filter((c: any) => c.isLive));
        setUpcomingClasses(data.filter((c: any) => !c.isLive));
      }
    } catch (error) {
      console.error('Error fetching live classes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-brandRed to-[#C62828] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <h1 className="text-lg font-bold">Live Classes</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'live' ? 'bg-white text-brandRed shadow-sm' : 'text-gray-500'
            }`}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            Live Now
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
              activeTab === 'upcoming' ? 'bg-white text-brandBlue shadow-sm' : 'text-gray-500'
            }`}
          >
            Upcoming
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-24 w-full"></div>
            ))}
          </div>
        ) : activeTab === 'live' ? (
          liveClasses.length > 0 ? (
            <div className="space-y-4">
              {liveClasses.map((cls, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-red-500 uppercase">Live Now</span>
                      </div>
                      <h4 className="font-bold text-sm">{cls.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{cls.instructor} | {cls.subject}</p>
                    </div>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                      <span className="material-symbols-rounded text-sm">videocam</span>
                      Join
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-rounded text-6xl text-gray-300">videocam_off</span>
              <p className="text-sm text-gray-400 mt-4">No live classes right now</p>
              <p className="text-[10px] text-gray-300 mt-1">Check upcoming classes for schedule</p>
            </div>
          )
        ) : (
          upcomingClasses.length > 0 ? (
            <div className="space-y-4">
              {upcomingClasses.map((cls, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{cls.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">{cls.instructor} | {cls.subject}</p>
                      <p className="text-[10px] text-brandBlue font-bold mt-2">
                        <span className="material-symbols-rounded text-sm align-middle">schedule</span>
                        {' '}{cls.scheduledAt || 'Coming Soon'}
                      </p>
                    </div>
                    <button className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold">
                      Remind Me
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm">
              <span className="material-symbols-rounded text-6xl text-gray-300">event</span>
              <p className="text-sm text-gray-400 mt-4">No upcoming classes scheduled</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LiveClasses;
