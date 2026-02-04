import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const MockTests: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchTests();
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchTests = async () => {
    try {
      const [testsRes, seriesRes] = await Promise.all([
        fetch('/api/tests'),
        fetch('/api/test-series')
      ]);
      
      const testsData = await testsRes.json();
      const seriesData = await seriesRes.json();
      
      setTests(Array.isArray(testsData) ? testsData : []);
      setTestSeries(Array.isArray(seriesData) ? seriesData : []);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'bg-blue-500';
      case 'chemistry': return 'bg-green-500';
      case 'biology': return 'bg-orange-500';
      default: return 'bg-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-purple-600 to-[#7B1FA2] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <h1 className="text-lg font-bold">Mock Tests</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {['all', 'physics', 'chemistry', 'biology'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-purple-600">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-4">
            {testSeries.length > 0 && (
              <section className="mb-6">
                <h3 className="font-bold text-sm mb-3 text-gray-700">Test Series</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {testSeries.map((series, idx) => (
                    <div key={idx} className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 min-w-[200px] text-white">
                      <h4 className="font-bold text-sm">{series.name}</h4>
                      <p className="text-[10px] opacity-80 mt-1">{series.totalTests || 0} Tests</p>
                      <button className="mt-3 bg-white text-purple-600 px-4 py-1.5 rounded-lg text-[10px] font-bold">
                        View All
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h3 className="font-bold text-sm mb-3 text-gray-700">Available Tests</h3>
              {tests.filter(t => activeTab === 'all' || t.subject?.toLowerCase() === activeTab).length > 0 ? (
                tests
                  .filter(t => activeTab === 'all' || t.subject?.toLowerCase() === activeTab)
                  .map((test, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 shadow-sm mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`w-2 h-2 rounded-full ${getSubjectColor(test.subject)}`}></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{test.subject || 'General'}</span>
                          </div>
                          <h4 className="font-bold text-sm">{test.title || test.name}</h4>
                          <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
                            <span>{test.questions?.length || test.totalQuestions || 0} Questions</span>
                            <span>{test.duration || 60} mins</span>
                            <span>{test.marks || 0} Marks</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button 
                          onClick={() => navigate(`/take-test/${test.id}`)}
                          className="flex-1 bg-purple-600 text-white py-2 rounded-lg text-xs font-bold"
                        >
                          Start Test
                        </button>
                        <button className="px-4 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold">
                          Syllabus
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
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTests;
