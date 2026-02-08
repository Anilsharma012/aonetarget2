import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface Video {
  id: string;
  title: string;
  duration?: string;
  thumbnail?: string;
  isFree?: boolean;
  isLocked?: boolean;
}

interface Session {
  id: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  instructor?: string;
  status: string;
}

const SubCategoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, subId } = useParams<{ categoryId: string; subId: string }>();
  const [searchParams] = useSearchParams();
  const label = searchParams.get('label') || 'Course Details';
  const [activeTab, setActiveTab] = useState<'videos' | 'sessions' | 'notes'>('videos');
  const [videos, setVideos] = useState<Video[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [categoryId, subId]);

  const loadContent = async () => {
    try {
      const [videosRes, sessionsRes, coursesRes] = await Promise.all([
        fetch('/api/videos').then(r => r.json()).catch(() => []),
        fetch('/api/live-videos').then(r => r.json()).catch(() => []),
        fetch('/api/courses').then(r => r.json()).catch(() => [])
      ]);
      setVideos(Array.isArray(videosRes) ? videosRes : []);
      setSessions(Array.isArray(sessionsRes) ? sessionsRes : []);
      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradient = () => {
    if (label.includes('NEET')) return 'from-blue-600 to-indigo-700';
    if (label.includes('IIT') || label.includes('JEE')) return 'from-orange-500 to-red-600';
    if (label.includes('Nursing')) return 'from-teal-500 to-emerald-600';
    return 'from-purple-500 to-violet-600';
  };

  const tabs = [
    { id: 'videos' as const, label: 'Videos', icon: 'play_circle', count: videos.length },
    { id: 'sessions' as const, label: 'Live Sessions', icon: 'cast_for_education', count: sessions.length },
    { id: 'notes' as const, label: 'Notes & PDFs', icon: 'description', count: 0 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header with Course Image */}
      <div className={`bg-gradient-to-br ${getGradient()} relative`}>
        <div className="pt-6 pb-16 px-4">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 text-white transition-all">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-black text-white tracking-tight truncate">{label}</h1>
              <p className="text-white/60 text-xs mt-0.5">Aone Target Institute</p>
            </div>
            <button className="p-2 rounded-full hover:bg-white/20 text-white">
              <span className="material-icons-outlined">share</span>
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-white text-4xl">school</span>
            </div>
            <div className="text-white">
              <h2 className="text-base font-bold">{label.split(' - ').pop()}</h2>
              <p className="text-white/70 text-xs mt-1">{label.split(' - ').slice(0, -1).join(' > ')}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px]">
                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <span className="material-icons-outlined text-xs">play_circle</span>
                  {videos.length} Videos
                </span>
                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <span className="material-icons-outlined text-xs">live_tv</span>
                  {sessions.filter(s => s.status === 'scheduled').length} Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm -mt-6 mx-4 rounded-2xl border border-gray-100">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center flex flex-col items-center gap-1 transition-all relative ${
                activeTab === tab.id ? 'text-brandBlue' : 'text-gray-400'
              }`}
            >
              <span className="material-icons-outlined text-lg">{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
              {tab.count > 0 && (
                <span className="absolute top-2 right-4 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brandBlue rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-rounded animate-spin text-4xl text-brandBlue">progress_activity</span>
          </div>
        ) : (
          <>
            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-3 animate-fade-in">
                {videos.length > 0 ? videos.map((video, idx) => (
                  <div
                    key={video.id || idx}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer"
                  >
                    <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 relative">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons-outlined text-gray-300 text-2xl">smart_display</span>
                      )}
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded">FREE</span>
                      )}
                      {idx > 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="material-icons-outlined text-white text-lg">lock</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 line-clamp-2">{video.title || `Lecture ${idx + 1}`}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                        <span className="flex items-center gap-0.5">
                          <span className="material-icons-outlined text-xs">schedule</span>
                          {video.duration || '45 min'}
                        </span>
                        <span>•</span>
                        <span>Lecture {idx + 1}</span>
                      </div>
                    </div>
                    <span className="material-icons-outlined text-gray-300">
                      {idx === 0 ? 'play_circle' : 'lock'}
                    </span>
                  </div>
                )) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <span className="material-icons-outlined text-6xl text-gray-200">video_library</span>
                    <p className="text-sm font-bold text-gray-400 mt-3">No videos available yet</p>
                    <p className="text-xs text-gray-300 mt-1">Videos will be added soon</p>
                  </div>
                )}
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div className="space-y-3 animate-fade-in">
                {sessions.filter(s => s.status === 'scheduled' || s.status === 'live').length > 0 ? (
                  sessions.filter(s => s.status === 'scheduled' || s.status === 'live').map((session, idx) => (
                    <div key={session.id || idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-red-50 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                          <span className="text-lg font-black text-red-600">
                            {session.scheduledDate ? new Date(session.scheduledDate).getDate() : '--'}
                          </span>
                          <span className="text-[8px] font-bold text-red-400 uppercase">
                            {session.scheduledDate ? new Date(session.scheduledDate).toLocaleDateString('en', { month: 'short' }) : ''}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {session.status === 'live' && (
                              <span className="flex items-center gap-1 bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                                LIVE
                              </span>
                            )}
                            {session.status === 'scheduled' && (
                              <span className="bg-amber-100 text-amber-700 text-[8px] font-bold px-2 py-0.5 rounded-full">UPCOMING</span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-gray-800">{session.title}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                            <span className="flex items-center gap-0.5">
                              <span className="material-icons-outlined text-xs">schedule</span>
                              {session.scheduledTime || '10:00 AM'}
                            </span>
                            {session.instructor && (
                              <span className="flex items-center gap-0.5">
                                <span className="material-icons-outlined text-xs">person</span>
                                {session.instructor}
                              </span>
                            )}
                          </div>
                        </div>
                        <button className={`px-3 py-2 rounded-lg text-[10px] font-bold ${
                          session.status === 'live' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-blue-50 text-brandBlue'
                        }`}>
                          {session.status === 'live' ? 'Join Now' : 'Remind Me'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <span className="material-icons-outlined text-6xl text-gray-200">event_busy</span>
                    <p className="text-sm font-bold text-gray-400 mt-3">No live sessions scheduled</p>
                    <p className="text-xs text-gray-300 mt-1">Check back later for upcoming sessions</p>
                  </div>
                )}
              </div>
            )}

            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 animate-fade-in">
                <span className="material-icons-outlined text-6xl text-gray-200">description</span>
                <p className="text-sm font-bold text-gray-400 mt-3">Notes & PDFs</p>
                <p className="text-xs text-gray-300 mt-1">Study materials will be available soon</p>
              </div>
            )}

            {/* Related Courses */}
            {courses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-black text-gray-700 mb-3">Related Courses</h3>
                <div className="space-y-3">
                  {courses.slice(0, 3).map((course, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(`/course/${course._id || course.id}`)}
                      className="w-full bg-white rounded-xl p-4 shadow-sm flex gap-3 text-left active:scale-[0.98] transition-transform"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${getGradient()} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-icons-outlined text-white text-xl">play_circle</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-800 truncate">{course.name || course.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{course.videos || 0} Videos • {course.tests || 0} Tests</p>
                        <span className="text-xs font-black text-brandBlue mt-1 inline-block">₹{course.price || 'Free'}</span>
                      </div>
                      <span className="material-icons-outlined text-gray-300 self-center text-sm">chevron_right</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SubCategoryDetail;
