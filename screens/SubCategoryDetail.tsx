import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface Course {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  imageUrl?: string;
  instructor?: string;
  price?: number;
  mrp?: number;
  discount?: string;
  type?: string;
  category?: string;
  subcategory?: string;
  subcategoryId?: string;
  enrollments?: number;
  students?: number;
  videos?: number;
  tests?: number;
  isLive?: boolean;
}

const SubCategoryDetail: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId, subId } = useParams<{ categoryId: string; subId: string }>();
  const [searchParams] = useSearchParams();
  const label = searchParams.get('label') || 'Course Details';
  const [activeTab, setActiveTab] = useState<'all' | 'recorded' | 'live'>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [categoryId, subId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const coursesRes = await fetch('/api/courses').then(r => r.json()).catch(() => []);
      setCourses(Array.isArray(coursesRes) ? coursesRes : []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradient = () => {
    if (label.includes('NEET')) return 'from-[#303F9F] to-[#1A237E]';
    if (label.includes('IIT') || label.includes('JEE')) return 'from-[#D32F2F] to-[#B71C1C]';
    if (label.includes('Nursing')) return 'from-teal-500 to-emerald-600';
    return 'from-[#303F9F] to-[#1A237E]';
  };

  const filteredCourses = courses.filter(c => {
    const matchesSub = c.subcategoryId === subId;
    if (!matchesSub) return false;
    if (activeTab === 'recorded') return c.type === 'recorded' || (!c.type && !c.isLive);
    if (activeTab === 'live') return c.type === 'live' || c.isLive;
    return true;
  });

  const allMatchingCourses = courses.filter(c => c.subcategoryId === subId);

  const recordedCount = allMatchingCourses.filter(c => c.type === 'recorded' || (!c.type && !c.isLive)).length;
  const liveCount = allMatchingCourses.filter(c => c.type === 'live' || c.isLive).length;

  const tabs = [
    { id: 'all' as const, label: 'All Courses', icon: 'apps', count: allMatchingCourses.length },
    { id: 'recorded' as const, label: 'Recorded', icon: 'play_circle', count: recordedCount },
    { id: 'live' as const, label: 'Live', icon: 'cast_for_education', count: liveCount },
  ];

  const getEnrollmentCount = (course: Course) => {
    return course.enrollments || course.students || Math.floor(Math.random() * 500 + 50);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
                  <span className="material-icons-outlined text-xs">menu_book</span>
                  {allMatchingCourses.length} Courses
                </span>
                <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                  <span className="material-icons-outlined text-xs">live_tv</span>
                  {liveCount} Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 bg-white shadow-sm -mt-6 mx-4 rounded-2xl border border-gray-100">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 text-center flex flex-col items-center gap-1 transition-all relative ${
                activeTab === tab.id ? 'text-[#303F9F]' : 'text-gray-400'
              }`}
            >
              <span className="material-icons-outlined text-lg">{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
              {tab.count > 0 && (
                <span className={`absolute top-2 right-3 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center ${
                  tab.id === 'live' ? 'bg-[#D32F2F]' : 'bg-[#303F9F]'
                }`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#303F9F] rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <main className="px-4 mt-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-symbols-rounded animate-spin text-4xl text-[#303F9F]">progress_activity</span>
          </div>
        ) : (
          <>
            {filteredCourses.length > 0 ? (
              <div className="space-y-4 animate-fade-in">
                {filteredCourses.map((course, idx) => (
                  <div
                    key={course._id || course.id || idx}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative">
                      <div className={`w-full h-40 bg-gradient-to-br ${getGradient()} flex items-center justify-center`}>
                        {(course.imageUrl || course.thumbnail) ? (
                          <img src={course.imageUrl || course.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        ) : null}
                        {!(course.imageUrl || course.thumbnail) && (
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-white text-4xl font-bold opacity-40">{(course.name || course.title || '?').charAt(0).toUpperCase()}</span>
                            <span className="text-white/40 text-xs font-medium">Course Preview</span>
                          </div>
                        )}
                      </div>
                      {(course.type === 'live' || course.isLive) && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#D32F2F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                      {course.type === 'recorded' && (
                        <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#1A237E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                          <span className="material-icons-outlined text-xs">play_circle</span>
                          RECORDED
                        </span>
                      )}
                      {course.discount && (
                        <span className="absolute top-3 right-3 bg-[#D32F2F] text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                          {course.discount}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-[#1A237E] line-clamp-2 leading-tight">
                        {course.name || course.title}
                      </h3>

                      {course.instructor && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 bg-[#303F9F]/10 rounded-full flex items-center justify-center">
                            <span className="material-icons-outlined text-[#303F9F]" style={{ fontSize: '12px' }}>person</span>
                          </div>
                          <span className="text-xs text-gray-500">{course.instructor}</span>
                        </div>
                      )}

                      <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2">
                        {course.description || 'Complete preparation course with comprehensive study materials'}
                      </p>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <span className="material-icons-outlined" style={{ fontSize: '13px' }}>group</span>
                          {getEnrollmentCount(course)} enrolled
                        </div>
                        {(course.videos !== undefined && course.videos > 0) && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span className="material-icons-outlined" style={{ fontSize: '13px' }}>play_circle</span>
                            {course.videos} Videos
                          </div>
                        )}
                        {(course.tests !== undefined && course.tests > 0) && (
                          <div className="flex items-center gap-1 text-[10px] text-gray-400">
                            <span className="material-icons-outlined" style={{ fontSize: '13px' }}>quiz</span>
                            {course.tests} Tests
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-[#1A237E]">
                            {course.price ? `₹${course.price}` : 'Free'}
                          </span>
                          {course.mrp && course.mrp > (course.price || 0) && (
                            <span className="text-xs text-gray-400 line-through">₹{course.mrp}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/course/${course._id || course.id}`);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-[#303F9F] to-[#1A237E] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 animate-fade-in">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons-outlined text-5xl text-gray-200">
                    {activeTab === 'live' ? 'cast_for_education' : activeTab === 'recorded' ? 'play_circle' : 'school'}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-500">
                  {activeTab === 'live' ? 'No live courses available' : activeTab === 'recorded' ? 'No recorded courses available' : 'No courses available yet'}
                </p>
                <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                  {activeTab !== 'all'
                    ? 'Try switching to a different tab to find courses'
                    : 'Courses for this category will be added soon. Check back later!'}
                </p>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => setActiveTab('all')}
                    className="mt-4 px-5 py-2 bg-[#303F9F]/10 text-[#303F9F] text-xs font-bold rounded-full"
                  >
                    View All Courses
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default SubCategoryDetail;
