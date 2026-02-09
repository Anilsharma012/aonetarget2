import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

interface CourseGroup {
  courseId: string;
  courseName: string;
  tests: any[];
}

const MockTests: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchData();
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, seriesRes, coursesRes] = await Promise.all([
        fetch('/api/tests'),
        fetch('/api/test-series'),
        fetch('/api/courses')
      ]);

      const testsData = await testsRes.json();
      const seriesData = await seriesRes.json();
      const coursesData = await coursesRes.json();

      setTests(Array.isArray(testsData) ? testsData.filter((t: any) => t.status === 'active') : []);
      setTestSeries(Array.isArray(seriesData) ? seriesData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseName = (test: any) => {
    if (test.courseName) return test.courseName;
    if (test.courseId) {
      const course = courses.find(c => c.id === test.courseId);
      return course ? (course.name || course.title) : 'Unknown';
    }
    return test.course || 'General';
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
      case 'upcoming': return { label: 'Upcoming', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'schedule' };
      case 'live': return { label: 'Live', bg: 'bg-green-100', text: 'text-green-700', icon: 'play_circle' };
      case 'completed': return { label: 'Completed', bg: 'bg-gray-100', text: 'text-gray-500', icon: 'check_circle' };
      default: return { label: 'Available', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'info' };
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

  const coursesWithTests = (() => {
    const courseMap = new Map<string, CourseGroup>();

    tests.forEach(test => {
      const courseId = test.courseId || 'unlinked';
      const courseName = getCourseName(test);
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { courseId, courseName, tests: [] });
      }
      courseMap.get(courseId)!.tests.push(test);
    });

    return Array.from(courseMap.values()).sort((a, b) => b.tests.length - a.tests.length);
  })();

  const filteredCourseGroups = selectedCourse === 'all'
    ? coursesWithTests
    : coursesWithTests.filter(g => g.courseId === selectedCourse);

  const uniqueCourseIds = coursesWithTests.map(g => g.courseId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-[#1A237E] to-[#303F9F] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <div>
            <h1 className="text-lg font-bold">Mock Tests</h1>
            <p className="text-xs text-white/70 mt-0.5">{tests.length} tests available</p>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <button
            onClick={() => setSelectedCourse('all')}
            className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
              selectedCourse === 'all'
                ? 'bg-[#1A237E] text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            All ({tests.length})
          </button>
          {coursesWithTests.map(group => (
            <button
              key={group.courseId}
              onClick={() => setSelectedCourse(group.courseId)}
              className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all ${
                selectedCourse === group.courseId
                  ? 'bg-[#1A237E] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {group.courseName} ({group.tests.length})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-[#303F9F]">progress_activity</span>
          </div>
        ) : (
          <div className="space-y-6">
            {testSeries.length > 0 && selectedCourse === 'all' && (
              <section>
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
                              <h4 className="font-bold text-sm text-gray-800">{series.seriesName || series.name}</h4>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {series.courseName || series.course || 'General'} · {series.totalTests || seriesTests.length} Tests
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

            {filteredCourseGroups.length > 0 ? (
              filteredCourseGroups.map(group => (
                <section key={group.courseId}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A237E] to-[#303F9F] flex items-center justify-center">
                      <span className="material-symbols-rounded text-white text-sm">school</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-800">{group.courseName}</h3>
                      <p className="text-[10px] text-gray-400">{group.tests.length} test(s)</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {group.tests.map((test) => {
                      const status = getTestStatus(test);
                      const badge = getStatusBadge(status);
                      return (
                        <div key={test.id} className="bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                                  <span className="material-symbols-rounded text-[10px]">{badge.icon}</span>
                                  {badge.label}
                                </span>
                                {test.featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                                    <span className="material-symbols-rounded text-[10px]">star</span>
                                    Featured
                                  </span>
                                )}
                              </div>
                              <h4 className="font-bold text-sm">{test.title || test.name}</h4>

                              <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-gray-400">
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-rounded text-[14px]">help</span>
                                  {test.questions?.length || test.totalQuestions || test.numberOfQuestions || test.questions || 0} Questions
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <span className="material-symbols-rounded text-6xl text-gray-300">quiz</span>
                <p className="text-sm text-gray-400 mt-4">No tests available</p>
                <p className="text-xs text-gray-300 mt-1">Tests will appear here when linked to courses</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockTests;
