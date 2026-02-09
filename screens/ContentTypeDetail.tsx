import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface Video {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  youtubeUrl?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: string;
  isFree?: boolean;
  order?: number;
  courseId?: string;
}

interface Test {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  duration?: number;
  totalQuestions?: number;
  numberOfQuestions?: number;
  isFree?: boolean;
  courseId?: string;
}

interface LiveClass {
  _id?: string;
  id?: string;
  title?: string;
  description?: string;
  subject?: string;
  scheduledAt?: string;
  date?: string;
  time?: string;
  duration?: string;
  meetingUrl?: string;
  zoomUrl?: string;
  courseId?: string;
  instructor?: string;
}

interface Course {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  mrp?: number;
  instructor?: string;
  thumbnail?: string;
  imageUrl?: string;
  examType?: string;
  contentType?: string;
  subject?: string;
  boardType?: string;
  categoryId?: string;
}

const contentTypeConfig: Record<string, { label: string; icon: string; gradient: string }> = {
  recorded_batch: { label: 'Recorded Batch', icon: 'play_circle', gradient: 'from-[#303F9F] to-[#1A237E]' },
  live_classroom: { label: 'Live Classroom', icon: 'cast_for_education', gradient: 'from-[#D32F2F] to-[#B71C1C]' },
  crash_course: { label: 'Crash Course', icon: 'bolt', gradient: 'from-[#E65100] to-[#BF360C]' },
  mock_test: { label: 'Mock Test', icon: 'quiz', gradient: 'from-[#2E7D32] to-[#1B5E20]' },
};

const ContentTypeDetail: React.FC = () => {
  const navigate = useNavigate();
  const { contentType } = useParams<{ contentType: string }>();
  const [searchParams] = useSearchParams();
  const examType = searchParams.get('exam') || '';
  const boardType = searchParams.get('board') || '';
  const subjectParam = searchParams.get('subject') || '';
  const categorySource = searchParams.get('category') || '';

  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectParam);
  const [coursePrice, setCoursePrice] = useState<number>(0);
  const [primaryCourseId, setPrimaryCourseId] = useState<string>('');

  const studentId = localStorage.getItem('studentId') || '';
  const config = contentTypeConfig[contentType || ''] || contentTypeConfig.recorded_batch;

  const neetSubjects = [
    { id: 'biology', label: 'Biology', icon: 'biotech' },
    { id: 'chemistry', label: 'Chemistry', icon: 'science' },
    { id: 'physics', label: 'Physics', icon: 'electric_bolt' },
  ];

  const jeeSubjects = [
    { id: 'chemistry', label: 'Chemistry', icon: 'science' },
    { id: 'physics', label: 'Physics', icon: 'electric_bolt' },
    { id: 'math', label: 'Mathematics', icon: 'calculate' },
  ];

  const boardSubjects = [
    { id: 'hindi', label: 'Hindi', icon: 'translate' },
    { id: 'english', label: 'English', icon: 'menu_book' },
    { id: 'math', label: 'Mathematics', icon: 'calculate' },
    { id: 'science', label: 'Science', icon: 'science' },
    { id: 'social_science', label: 'Social Sci.', icon: 'public' },
    { id: 'sanskrit', label: 'Sanskrit', icon: 'auto_stories' },
  ];

  const getSubjects = () => {
    if (categorySource === '11-12') return boardSubjects;
    if (examType === 'neet') return neetSubjects;
    if (examType === 'iit-jee') return jeeSubjects;
    return neetSubjects;
  };

  const subjects = getSubjects();

  useEffect(() => {
    fetchData();
  }, [contentType, examType, boardType]);

  useEffect(() => {
    if (courses.length > 0 && (contentType === 'live_classroom' || contentType === 'recorded_batch' || contentType === 'mock_test')) {
      fetchContentForSubject();
    }
  }, [selectedSubject, courses]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/courses?';
      if (contentType) url += `contentType=${contentType}&`;
      if (examType) url += `examType=${examType}&`;
      if (boardType) url += `boardType=${boardType}&`;
      if (categorySource === '11-12') url += `categoryId=iit-jee&`;
      else if (examType === 'neet') url += `categoryId=neet&`;
      else if (examType === 'iit-jee') url += `categoryId=iit-jee&`;

      const coursesRes = await fetch(url);
      const allCourses: Course[] = await coursesRes.json();
      setCourses(Array.isArray(allCourses) ? allCourses : []);

      if (allCourses.length > 0) {
        const prices = allCourses.map(c => c.price || 0).filter(p => p > 0);
        setCoursePrice(prices.length > 0 ? prices[0] : 0);
        const cId = allCourses[0].id || allCourses[0]._id || '';
        setPrimaryCourseId(cId);
      }

      if (studentId) {
        try {
          const enrolledRes = await fetch(`/api/students/${studentId}/courses`);
          const enrolled = await enrolledRes.json();
          const ids = Array.isArray(enrolled) ? enrolled.map((c: any) => c.id || c.courseId || c._id) : [];
          setEnrolledCourseIds(ids);
        } catch {}
      }

      if (contentType === 'crash_course') {
        setLoading(false);
        return;
      }

      await fetchContentForCourses(allCourses);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchContentForCourses = async (coursesToFetch: Course[]) => {
    const relevantCourses = selectedSubject
      ? coursesToFetch.filter(c => c.subject === selectedSubject)
      : coursesToFetch;

    if (contentType === 'recorded_batch') {
      const allVideos: Video[] = [];
      for (const course of relevantCourses) {
        const cId = course.id || course._id || '';
        if (!cId) continue;
        try {
          const res = await fetch(`/api/courses/${cId}/videos`);
          const vids = await res.json();
          if (Array.isArray(vids)) {
            allVideos.push(...vids.map(v => ({ ...v, courseId: cId })));
          }
        } catch {}
      }
      allVideos.sort((a, b) => (a.order || 0) - (b.order || 0));
      setVideos(allVideos);
    } else if (contentType === 'mock_test') {
      const allTests: Test[] = [];
      for (const course of relevantCourses) {
        const cId = course.id || course._id || '';
        if (!cId) continue;
        try {
          const res = await fetch(`/api/courses/${cId}/tests`);
          const tsts = await res.json();
          if (Array.isArray(tsts)) {
            allTests.push(...tsts.map(t => ({ ...t, courseId: cId })));
          }
        } catch {}
      }
      setTests(allTests);
    } else if (contentType === 'live_classroom') {
      try {
        const res = await fetch('/api/live-videos');
        const allLive = await res.json();
        if (Array.isArray(allLive)) {
          const courseIds = relevantCourses.map(c => c.id || c._id);
          const filtered = allLive.filter((lc: LiveClass) => {
            if (lc.courseId && courseIds.includes(lc.courseId)) return true;
            if (selectedSubject && lc.subject === selectedSubject) return true;
            if (!lc.courseId && !selectedSubject) return true;
            return false;
          });
          setLiveClasses(filtered);
        }
      } catch {}
    }
  };

  const fetchContentForSubject = async () => {
    const relevantCourses = selectedSubject
      ? courses.filter(c => c.subject === selectedSubject)
      : courses;

    if (relevantCourses.length > 0) {
      const cId = relevantCourses[0].id || relevantCourses[0]._id || '';
      if (cId) setPrimaryCourseId(cId);
      const prices = relevantCourses.map(c => c.price || 0).filter(p => p > 0);
      if (prices.length > 0) setCoursePrice(prices[0]);
    }

    await fetchContentForCourses(relevantCourses.length > 0 ? relevantCourses : courses);
  };

  const isAnyCourseEnrolled = () => {
    return courses.some(c => {
      const cId = c.id || c._id || '';
      return enrolledCourseIds.includes(cId);
    });
  };

  const enrolled = isAnyCourseEnrolled();

  const handleBuyNow = () => {
    if (!studentId) {
      navigate('/student-login');
      return;
    }
    if (primaryCourseId) {
      navigate(`/checkout/${primaryCourseId}`);
    }
  };

  const handleEnrollFree = async () => {
    if (!studentId) {
      navigate('/student-login');
      return;
    }
    if (!primaryCourseId) return;
    try {
      await fetch(`/api/students/${studentId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: primaryCourseId }),
      });
      setEnrolledCourseIds(prev => [...prev, primaryCourseId]);
    } catch {}
  };

  const showSubjectFilter = contentType === 'live_classroom' || contentType === 'recorded_batch' || contentType === 'mock_test';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-[#303F9F] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <header className={`bg-gradient-to-br ${config.gradient} text-white pt-6 pb-8 px-4 rounded-b-[2rem] relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-all">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-black tracking-tight">{config.label}</h1>
              <p className="text-white/60 text-xs mt-0.5">
                {examType ? examType.toUpperCase() : boardType ? boardType.toUpperCase() : ''} 
                {categorySource === '11-12' ? ' | 11th-12th' : ''}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-rounded text-white text-2xl">{config.icon}</span>
            </div>
          </div>

          {enrolled && (
            <div className="flex items-center gap-2 bg-green-500/20 rounded-xl px-3 py-2 mt-2">
              <span className="material-symbols-rounded text-green-300 text-sm">check_circle</span>
              <span className="text-green-200 text-xs font-bold">Enrolled - All Content Unlocked</span>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 -mt-4 space-y-4">
        {showSubjectFilter && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="material-symbols-rounded text-[#303F9F] text-sm">filter_list</span>
              Select Subject
            </h3>
            <div className={`grid gap-2 ${subjects.length > 4 ? 'grid-cols-3' : `grid-cols-${subjects.length}`}`}>
              {subjects.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubject(selectedSubject === subj.id ? '' : subj.id)}
                  className={`py-2.5 rounded-xl text-center transition-all active:scale-95 flex flex-col items-center gap-1 ${
                    selectedSubject === subj.id
                      ? `bg-gradient-to-br ${config.gradient} text-white shadow-md`
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <span className="material-symbols-rounded text-base">{subj.icon}</span>
                  <span className="text-[9px] font-bold">{subj.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {contentType === 'recorded_batch' && (
          <RecordedBatchView videos={videos} enrolled={enrolled} onVideoClick={(v) => {
            const canPlay = enrolled || v.isFree;
            if (canPlay && v.courseId) {
              navigate(`/course/${v.courseId}`);
            }
          }} />
        )}

        {contentType === 'live_classroom' && (
          <LiveClassroomView
            liveClasses={liveClasses}
            enrolled={enrolled}
            selectedSubject={selectedSubject}
          />
        )}

        {contentType === 'crash_course' && (
          <CrashCourseView courses={courses} enrolled={enrolled} navigate={navigate} />
        )}

        {contentType === 'mock_test' && (
          <MockTestView tests={tests} enrolled={enrolled} navigate={navigate} />
        )}

        {courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-rounded text-5xl text-gray-200">{config.icon}</span>
            </div>
            <p className="text-sm font-bold text-gray-500">No content available yet</p>
            <p className="text-xs text-gray-400 mt-1.5">Content will be added soon!</p>
          </div>
        )}
      </main>

      {!enrolled && courses.length > 0 && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-shrink-0">
              <p className="text-[10px] text-gray-400">Course Price</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black text-[#1A237E]">
                  {coursePrice > 0 ? `₹${coursePrice}` : 'Free'}
                </span>
                {courses[0]?.mrp && courses[0].mrp > coursePrice && (
                  <span className="text-xs text-gray-400 line-through">₹{courses[0].mrp}</span>
                )}
                {coursePrice > 0 && (
                  <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                    {courses[0]?.mrp && courses[0].mrp > coursePrice
                      ? `${Math.round(((courses[0].mrp - coursePrice) / courses[0].mrp) * 100)}% OFF`
                      : 'BEST PRICE'
                    }
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={coursePrice > 0 ? handleBuyNow : handleEnrollFree}
              className={`flex-1 py-2.5 rounded-xl font-bold text-white text-xs shadow-lg active:scale-[0.98] transition-all ${
                coursePrice > 0
                  ? 'bg-gradient-to-r from-[#D32F2F] to-[#B71C1C]'
                  : 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]'
              }`}
            >
              {coursePrice > 0 ? `Buy Now - ₹${coursePrice}` : 'Enroll Free'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const RecordedBatchView: React.FC<{
  videos: Video[];
  enrolled: boolean;
  onVideoClick: (v: Video) => void;
}> = ({ videos, enrolled, onVideoClick }) => {
  if (videos.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
        <span className="material-symbols-rounded text-4xl text-gray-200">video_library</span>
        <p className="text-sm text-gray-400 mt-2">No recorded videos available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">
          {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
        </h3>
        <span className="text-[10px] text-gray-400">
          {videos.filter(v => v.isFree).length || 1} free to watch
        </span>
      </div>
      {videos.map((video, index) => {
        const canPlay = enrolled || video.isFree || index === 0;
        const isLocked = !canPlay;
        const vTitle = video.title || `Video ${index + 1}`;

        return (
          <button
            key={video.id || video._id || index}
            onClick={() => !isLocked && onVideoClick(video)}
            className={`w-full bg-white rounded-xl p-3.5 shadow-sm flex gap-3 text-left transition-all border border-gray-100 ${
              isLocked ? 'opacity-70' : 'active:scale-[0.98] hover:shadow-md'
            }`}
          >
            <div className="relative w-20 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              {video.thumbnail ? (
                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="material-symbols-rounded text-gray-300 text-2xl">play_circle</span>
              )}
              {isLocked && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="material-symbols-rounded text-white text-xl">lock</span>
                </div>
              )}
              {!isLocked && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-lg">
                  <span className="material-symbols-rounded text-white text-xl">play_arrow</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{vTitle}</h4>
                {!isLocked && (index === 0 || video.isFree) && (
                  <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">FREE</span>
                )}
              </div>
              {video.duration && (
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">schedule</span>
                  {video.duration}
                </p>
              )}
            </div>
            <span className="material-symbols-rounded text-gray-300 self-center text-sm">
              {isLocked ? 'lock' : 'chevron_right'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const LiveClassroomView: React.FC<{
  liveClasses: LiveClass[];
  enrolled: boolean;
  selectedSubject: string;
}> = ({ liveClasses, enrolled, selectedSubject }) => {
  if (!selectedSubject) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
        <span className="material-symbols-rounded text-4xl text-[#D32F2F]/30">cast_for_education</span>
        <p className="text-sm font-bold text-gray-500 mt-2">Select a Subject</p>
        <p className="text-xs text-gray-400 mt-1">Choose a subject above to view live classes</p>
      </div>
    );
  }

  if (liveClasses.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
        <span className="material-symbols-rounded text-4xl text-gray-200">cast_for_education</span>
        <p className="text-sm text-gray-400 mt-2">No live classes scheduled for this subject</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">
          {liveClasses.length} Live {liveClasses.length === 1 ? 'Class' : 'Classes'}
        </h3>
        {!enrolled && (
          <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
            <span className="material-symbols-rounded text-xs">lock</span>
            Purchase to unlock
          </span>
        )}
      </div>
      {liveClasses.map((lc, index) => {
        const isLocked = !enrolled;
        const lcTitle = lc.title || `Live Class ${index + 1}`;
        const schedDate = lc.scheduledAt || lc.date || '';

        return (
          <div
            key={lc.id || lc._id || index}
            className={`bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 ${isLocked ? 'opacity-75' : ''}`}
          >
            <div className="flex gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isLocked ? 'bg-gray-100' : 'bg-red-50'
              }`}>
                {isLocked ? (
                  <span className="material-symbols-rounded text-gray-400 text-xl">lock</span>
                ) : (
                  <span className="material-symbols-rounded text-[#D32F2F] text-xl">videocam</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2">{lcTitle}</h4>
                {lc.instructor && (
                  <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-rounded text-[10px]">person</span>
                    {lc.instructor}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  {schedDate && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <span className="material-symbols-rounded text-[10px]">event</span>
                      {new Date(schedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                  {(lc.time || schedDate) && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <span className="material-symbols-rounded text-[10px]">schedule</span>
                      {lc.time || new Date(schedDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {lc.duration && (
                    <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <span className="material-symbols-rounded text-[10px]">timer</span>
                      {lc.duration}
                    </span>
                  )}
                </div>
              </div>
              {isLocked && (
                <span className="material-symbols-rounded text-gray-300 self-center text-sm">lock</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CrashCourseView: React.FC<{
  courses: Course[];
  enrolled: boolean;
  navigate: (path: string) => void;
}> = ({ courses, enrolled, navigate }) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
        <span className="material-symbols-rounded text-4xl text-gray-200">bolt</span>
        <p className="text-sm text-gray-400 mt-2">No crash courses available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">
        {courses.length} Crash {courses.length === 1 ? 'Course' : 'Courses'}
      </h3>
      {courses.map((course, index) => {
        const cId = course.id || course._id || '';
        const courseName = course.name || course.title || 'Crash Course';

        return (
          <button
            key={cId || index}
            onClick={() => navigate(`/course/${cId}`)}
            className="w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-all hover:shadow-md"
          >
            <div className="h-32 bg-gradient-to-br from-[#E65100] to-[#BF360C] flex items-center justify-center relative overflow-hidden">
              {(course.imageUrl || course.thumbnail) ? (
                <img src={course.imageUrl || course.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <>
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-2 right-6 w-24 h-24 rounded-full bg-white/30"></div>
                  </div>
                  <span className="material-symbols-rounded text-white/30 text-6xl">bolt</span>
                </>
              )}
              {enrolled && (
                <span className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-rounded text-xs">check_circle</span>
                  ENROLLED
                </span>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-sm font-bold text-[#1A237E] line-clamp-2">{courseName}</h4>
              {course.description && (
                <p className="text-xs text-gray-500 mt-1.5 line-clamp-3">{course.description}</p>
              )}
              {course.instructor && (
                <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">person</span>
                  {course.instructor}
                </p>
              )}
              {course.subject && (
                <span className="inline-block bg-orange-50 text-orange-600 text-[9px] font-bold px-2 py-0.5 rounded-full mt-2 capitalize">{course.subject}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const MockTestView: React.FC<{
  tests: Test[];
  enrolled: boolean;
  navigate: (path: string) => void;
}> = ({ tests, enrolled, navigate }) => {
  if (tests.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
        <span className="material-symbols-rounded text-4xl text-gray-200">quiz</span>
        <p className="text-sm text-gray-400 mt-2">No mock tests available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-700">
          {tests.length} Mock {tests.length === 1 ? 'Test' : 'Tests'}
        </h3>
        <span className="text-[10px] text-gray-400">
          {tests.filter((t, i) => t.isFree || i === 0).length} free to attempt
        </span>
      </div>
      {tests.map((test, index) => {
        const canAccess = enrolled || test.isFree || index === 0;
        const isLocked = !canAccess;
        const tTitle = test.title || test.name || `Mock Test ${index + 1}`;
        const tId = test.id || test._id || '';
        const questions = test.totalQuestions || test.numberOfQuestions || 0;

        return (
          <button
            key={tId || index}
            onClick={() => canAccess && tId && navigate(`/test/${tId}`)}
            className={`w-full bg-white rounded-xl p-3.5 shadow-sm flex gap-3 text-left transition-all border border-gray-100 ${
              isLocked ? 'opacity-70' : 'active:scale-[0.98] hover:shadow-md'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isLocked ? 'bg-gray-100' : canAccess && (test.isFree || index === 0) ? 'bg-green-50' : 'bg-[#2E7D32]/10'
            }`}>
              {isLocked ? (
                <span className="material-symbols-rounded text-gray-400 text-xl">lock</span>
              ) : (
                <span className="material-symbols-rounded text-[#2E7D32] text-xl">quiz</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-gray-800 line-clamp-2">{tTitle}</h4>
                {canAccess && (test.isFree || index === 0) && (
                  <span className="bg-green-100 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">FREE</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                {questions > 0 && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <span className="material-symbols-rounded text-[10px]">help_outline</span>
                    {questions} Qs
                  </span>
                )}
                {test.duration && (
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <span className="material-symbols-rounded text-[10px]">schedule</span>
                    {test.duration} min
                  </span>
                )}
              </div>
            </div>
            <span className="material-symbols-rounded text-gray-300 self-center text-sm">
              {isLocked ? 'lock' : 'chevron_right'}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ContentTypeDetail;
