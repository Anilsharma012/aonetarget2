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
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);

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

  const getTestStatus = (test: any) => {
    const now = new Date();
    const openDate = test.openDate ? new Date(test.openDate) : null;
    const closeDate = test.closeDate ? new Date(test.closeDate) : null;

    if (openDate && now < openDate) return 'upcoming';
    if (closeDate && now > closeDate) return 'completed';
    return 'live';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { label: 'Upcoming', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'schedule' };
      case 'live':
        return { label: 'Live', bg: 'bg-green-100', text: 'text-green-700', icon: 'play_circle' };
      case 'completed':
        return { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500', icon: 'check_circle' };
      default:
        return { label: 'Available', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'info' };
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'bg-blue-500';
      case 'chemistry': return 'bg-green-500';
      case 'biology': return 'bg-orange-500';
      default: return 'bg-[#303F9F]';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toggleSeries = (seriesId: string) => {
    setExpandedSeries(prev =>
      prev.includes(seriesId) ? prev.filter(id => id !== seriesId) : [...prev, seriesId]
    );
  };

  const getSeriesTests = (series: any) => {
    return tests.filter(t => t.testSeriesId === series.id || (series.testIds && series.testIds.includes(t.id)));
  };

  const filteredTests = tests.filter(t => activeTab === 'all' || t.subject?.toLowerCase() === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-[#1A237E] to-[#303F9F] text-white pt-8 pb-6 px-4">
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
                activeTab === tab ? 'bg-white text-[#1A237E] shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-[#303F9F]">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-4">
            {testSeries.length > 0 && (
              <section className="mb-6">
                <h3 className="font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
                  <span className="material-symbols-rounded text-[#303F9F] text-lg">library_books</span>
                  Test Series
                </h3>
                <div className="space-y-3">
                  {testSeries.map((series) => {
                    const seriesTests = getSeriesTests(series);
                    const isExpanded = expandedSeries.includes(series.id);
                    return (
                      <div key={series.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <button
                          onClick={() => toggleSeries(series.id)}
                          className="w-full flex items-center justify-between p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1A237E] to-[#303F9F] flex items-center justify-center">
                              <span className="material-symbols-rounded text-white text-lg">assignment</span>
                            </div>
                            <div className="text-left">
                              <h4 className="font-bold text-sm text-gray-800">{series.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {series.totalTests || seriesTests.length} Tests
                                {series.description ? ` · ${series.description}` : ''}
                              </p>
                            </div>
                          </div>
                          <span className={`material-symbols-rounded text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                            expand_more
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="border-t border-gray-100 px-4 pb-4">
                            {seriesTests.length > 0 ? (
                              seriesTests.map((test) => {
                                const status = getTestStatus(test);
                                const badge = getStatusBadge(status);
                                return (
                                  <div key={test.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-semibold text-xs text-gray-700">{test.title || test.name}</h5>
                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.bg} ${badge.text}`}>
                                          {badge.label}
                                        </span>
                                      </div>
                                      <div className="flex gap-3 mt-1 text-[10px] text-gray-400">
                                        <span className="flex items-center gap-0.5">
                                          <span className="material-symbols-rounded text-[12px]">timer</span>
                                          {test.duration || 60} mins
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                          <span className="material-symbols-rounded text-[12px]">help</span>
                                          {test.questions?.length || test.totalQuestions || test.numberOfQuestions || 0} Qs
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => status !== 'upcoming' && navigate(`/test/${test.id}`)}
                                      disabled={status === 'upcoming'}
                                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                                        status === 'upcoming'
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                          : 'bg-[#1A237E] text-white'
                                      }`}
                                    >
                                      {status === 'completed' ? 'Review' : status === 'upcoming' ? 'Upcoming' : 'Start'}
                                    </button>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-[10px] text-gray-400 py-3 text-center">No tests in this series yet</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h3 className="font-bold text-sm mb-3 text-gray-700 flex items-center gap-2">
                <span className="material-symbols-rounded text-[#303F9F] text-lg">quiz</span>
                Available Tests
              </h3>
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => {
                  const status = getTestStatus(test);
                  const badge = getStatusBadge(status);
                  return (
                    <div key={test.id} className="bg-white rounded-xl p-4 shadow-sm mb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`w-2 h-2 rounded-full ${getSubjectColor(test.subject)}`}></span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{test.subject || 'General'}</span>
                            <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                              <span className="material-symbols-rounded text-[10px]">{badge.icon}</span>
                              {badge.label}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm">{test.title || test.name}</h4>

                          <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-rounded text-[14px]">help</span>
                              {test.questions?.length || test.totalQuestions || test.numberOfQuestions || 0} Questions
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-rounded text-[14px]">timer</span>
                              {test.duration || 60} mins
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-rounded text-[14px]">stars</span>
                              {test.totalMarks || test.marks || 0} Marks
                            </span>
                          </div>

                          {(test.openDate || test.closeDate) && (
                            <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
                              {test.openDate && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-rounded text-[14px]">event</span>
                                  Opens: {formatDate(test.openDate)}
                                </span>
                              )}
                              {test.closeDate && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-rounded text-[14px]">event_busy</span>
                                  Closes: {formatDate(test.closeDate)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => status !== 'upcoming' && navigate(`/test/${test.id}`)}
                          disabled={status === 'upcoming'}
                          className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                            status === 'upcoming'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : status === 'completed'
                              ? 'bg-[#303F9F] text-white'
                              : 'bg-[#1A237E] text-white'
                          }`}
                        >
                          <span className="material-symbols-rounded text-[16px]">
                            {status === 'completed' ? 'visibility' : status === 'upcoming' ? 'lock' : 'play_arrow'}
                          </span>
                          {status === 'completed' ? 'Review Test' : status === 'upcoming' ? 'Upcoming' : 'Start Test'}
                        </button>
                        <button className="px-4 bg-gray-100 text-gray-600 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-rounded text-[14px]">description</span>
                          Syllabus
                        </button>
                      </div>
                    </div>
                  );
                })
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
