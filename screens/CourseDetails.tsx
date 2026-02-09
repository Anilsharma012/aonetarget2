import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveClassesCalendar from '../components/student/LiveClassesCalendar';

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  isFree?: boolean;
  topicId?: string;
  topicName?: string;
  order?: number;
  completed?: boolean;
}

interface Note {
  id: string;
  title: string;
  fileUrl: string;
  fileSize?: string;
}

interface Test {
  id: string;
  name: string;
  questions: number;
  duration?: number;
  status: string;
}

interface Course {
  id: string;
  name: string;
  title?: string;
  description?: string;
  instructor?: string;
  thumbnail?: string;
  price?: number;
  mrp?: number;
  category?: string;
  enrollmentCount?: number;
}

interface Progress {
  completedVideos: string[];
  completedTests: string[];
  completedNotes: string[];
}

const CourseDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [progress, setProgress] = useState<Progress>({ completedVideos: [], completedTests: [], completedNotes: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'videos' | 'notes' | 'tests' | 'live'>('videos');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const tabConfig = [
    { key: 'videos' as const, label: 'Recorded', icon: 'play_circle' },
    { key: 'notes' as const, label: 'Notes', icon: 'description' },
    { key: 'tests' as const, label: 'Tests', icon: 'quiz' },
    { key: 'live' as const, label: 'Live Classes', icon: 'sensors' },
  ];

  const getYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v') || '';
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0] || '';
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split(/[?#]/)[0] || '';
    } else if (url.includes('youtube.com/live/')) {
      videoId = url.split('youtube.com/live/')[1]?.split(/[?#]/)[0] || '';
    }
    return videoId;
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : url;
  };

  const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  const handleImageError = useCallback((id: string) => {
    setFailedImages(prev => new Set(prev).add(id));
  }, []);

  const getGradientPlaceholder = (name: string) => {
    const initial = (name || '?').charAt(0).toUpperCase();
    const gradients = [
      'from-[#1A237E] to-[#303F9F]',
      'from-[#C62828] to-[#D32F2F]',
      'from-[#00695C] to-[#00897B]',
      'from-[#4A148C] to-[#7B1FA2]',
      'from-[#E65100] to-[#F57C00]',
    ];
    const idx = name ? name.charCodeAt(0) % gradients.length : 0;
    return { initial, gradient: gradients[idx] };
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.8));
  const handleZoomReset = () => setZoomLevel(1);

  const handleVideoClick = (video: Video) => {
    const canPlay = isEnrolled || video.isFree;
    if (canPlay && (video.youtubeUrl || video.videoUrl)) {
      setSelectedVideo(video);
      setShowVideoPlayer(true);
    }
  };

  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setVideoPlaying(false);
    setSelectedVideo(null);
  };

  const handleShare = async () => {
    const courseUrl = `${window.location.origin}/course/${id}`;
    const courseTitle = course?.name || course?.title || 'Check out this course';
    const shareData = {
      title: courseTitle,
      text: `${courseTitle} - Learn with A-One!`,
      url: courseUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${courseTitle}\n${courseUrl}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      try {
        await navigator.clipboard.writeText(`${courseTitle}\n${courseUrl}`);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      } catch {
        console.error('Share failed:', err);
      }
    }
  };
  
  const getStudentId = () => {
    const studentData = localStorage.getItem('studentData');
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        return parsed.id || '';
      } catch {
        return '';
      }
    }
    return '';
  };
  const studentId = getStudentId();

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      const [courseRes, videosRes, notesRes, testsRes, enrolledRes] = await Promise.all([
        fetch(`/api/courses/${id}`),
        fetch(`/api/courses/${id}/videos`),
        fetch(`/api/courses/${id}/notes`),
        fetch(`/api/courses/${id}/tests`),
        fetch(`/api/students/${studentId}/enrolled/${id}`)
      ]);
      
      const courseData = await courseRes.json();
      const videosData = await videosRes.json();
      const notesData = await notesRes.json();
      const testsData = await testsRes.json();
      const enrolledData = await enrolledRes.json();
      
      setCourse(courseData);
      setVideos(Array.isArray(videosData) ? videosData : []);
      setNotes(Array.isArray(notesData) ? notesData : []);
      setTests(Array.isArray(testsData) ? testsData.filter((t: Test) => t.status === 'active') : []);
      setIsEnrolled(enrolledData.enrolled || false);
      
      if (enrolledData.enrolled) {
        const progressRes = await fetch(`/api/students/${studentId}/courses/${id}/progress`);
        const progressData = await progressRes.json();
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!studentId) {
      alert('Please login first to enroll in this course');
      navigate('/student-login');
      return;
    }
    
    setEnrolling(true);
    try {
      const response = await fetch(`/api/students/${studentId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id })
      });
      
      if (response.ok) {
        setIsEnrolled(true);
        alert('Enrollment successful! You now have access to all course content.');
        const progressRes = await fetch(`/api/students/${studentId}/courses/${id}/progress`);
        const progressData = await progressRes.json();
        setProgress(progressData);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll. Please try again.');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleBuyNow = () => {
    if (!studentId) {
      alert('Please login first');
      navigate('/student-login');
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const markVideoComplete = async (videoId: string) => {
    try {
      await fetch(`/api/students/${studentId}/courses/${id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, action: 'complete' })
      });
      setProgress(prev => ({
        ...prev,
        completedVideos: [...prev.completedVideos, videoId]
      }));
    } catch (error) {
      console.error('Error marking video complete:', error);
    }
  };

  const totalVideos = videos.length;
  const completedVideos = progress.completedVideos.length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
  const isPaidCourse = course?.price && course.price > 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brandBlue"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-rounded text-6xl text-gray-300">error</span>
          <p className="text-gray-500 mt-4">Course not found</p>
          <button onClick={() => navigate('/courses')} className="mt-4 text-brandBlue font-bold">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-[#1A237E] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <img src="/aone-logo.png" alt="Logo" className="h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
          </div>
          <div className="relative">
            <button onClick={handleShare} className="p-2 rounded-full hover:bg-white/20 transition-colors">
              <span className="material-symbols-rounded">share</span>
            </button>
            {shareSuccess && (
              <div className="absolute -bottom-8 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg animate-fade-in">
                Link copied!
              </div>
            )}
          </div>
        </div>
        
        <div className="px-4 pb-4">
          <h1 className="text-lg font-bold">{course.name || course.title}</h1>
          <p className="text-sm text-white/80">{course.instructor || 'Instructor'}</p>
          
          {isEnrolled && (
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span>{completedVideos}/{totalVideos} videos completed</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex bg-white">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeTab === tab.key 
                  ? 'text-[#303F9F] border-b-2 border-[#303F9F]' 
                  : 'text-gray-500 border-b-2 border-transparent'
              }`}
            >
              <span className="material-symbols-rounded text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.key === 'live' && (
                <span className="relative flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D32F2F] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D32F2F]"></span>
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 origin-top transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}>
        {!isEnrolled && (
          <div className="bg-gradient-to-r from-[#1A237E] to-[#303F9F] rounded-2xl p-4 mb-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-rounded text-3xl">school</span>
              <div className="flex-1">
                {isPaidCourse ? (
                  <>
                    <h3 className="font-bold">Get Full Access</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xl font-black">₹{course.price}</span>
                      {course.mrp && course.mrp > (course.price || 0) && (
                        <>
                          <span className="text-sm text-white/60 line-through">₹{course.mrp}</span>
                          <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            {Math.round(((course.mrp - (course.price || 0)) / course.mrp) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold">Enroll to Unlock All Content</h3>
                    <p className="text-white/80 text-sm">Get access to all videos, notes & tests</p>
                  </>
                )}
              </div>
              {isPaidCourse ? (
                <button
                  onClick={handleBuyNow}
                  className="bg-[#D32F2F] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-red-700 transition-colors"
                >
                  Buy Now
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="bg-white text-[#1A237E] px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                >
                  {enrolling ? '...' : 'Enroll Free'}
                </button>
              )}
            </div>
          </div>
        )}

        {course.description && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-sm text-[#1A237E] mb-2 flex items-center gap-2">
              <span className="material-symbols-rounded text-base">info</span>
              About this Course
            </h3>
            <div className="flex flex-wrap gap-3 mb-3">
              {course.category && (
                <span className="inline-flex items-center gap-1 bg-[#303F9F]/10 text-[#303F9F] text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-rounded text-sm">category</span>
                  {course.category}
                </span>
              )}
              {course.instructor && (
                <span className="inline-flex items-center gap-1 bg-[#1A237E]/10 text-[#1A237E] text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-rounded text-sm">person</span>
                  {course.instructor}
                </span>
              )}
              {(course.enrollmentCount !== undefined && course.enrollmentCount > 0) && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  <span className="material-symbols-rounded text-sm">group</span>
                  {course.enrollmentCount} Enrolled
                </span>
              )}
            </div>
            <div
              className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </div>
        )}

        {(videos.length > 0 || notes.length > 0 || tests.length > 0) && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-sm text-[#1A237E] mb-3 flex items-center gap-2">
              <span className="material-symbols-rounded text-base">inventory_2</span>
              What's Included
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {videos.length > 0 && (
                <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2.5">
                  <span className="material-symbols-rounded text-[#303F9F] text-lg">play_circle</span>
                  <span className="text-xs font-bold text-gray-700">{videos.length} Videos</span>
                </div>
              )}
              {notes.length > 0 && (
                <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-2.5">
                  <span className="material-symbols-rounded text-orange-500 text-lg">description</span>
                  <span className="text-xs font-bold text-gray-700">{notes.length} Notes</span>
                </div>
              )}
              {tests.length > 0 && (
                <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2.5">
                  <span className="material-symbols-rounded text-purple-500 text-lg">quiz</span>
                  <span className="text-xs font-bold text-gray-700">{tests.length} Tests</span>
                </div>
              )}
              <div className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2.5">
                <span className="material-symbols-rounded text-[#D32F2F] text-lg">sensors</span>
                <span className="text-xs font-bold text-gray-700">Live Classes</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-4">
            {videos.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <span className="material-symbols-rounded text-4xl text-gray-300">video_library</span>
                <p className="text-gray-400 mt-2">No videos available yet</p>
              </div>
            ) : (
              videos.map((video, index) => {
                const isCompleted = progress.completedVideos.includes(video.id);
                const canPlay = isEnrolled || video.isFree || index === 0;
                const isLocked = !canPlay;
                return (
                  <div 
                    key={video.id}
                    onClick={() => !isLocked && handleVideoClick(video)}
                    className={`bg-white rounded-xl overflow-hidden shadow-sm cursor-pointer transition-transform active:scale-[0.98] ${isLocked ? 'opacity-80' : ''}`}
                  >
                    <div className="relative">
                      {!failedImages.has(video.id) ? (
                        <img 
                          src={video.thumbnail || getYouTubeThumbnail(video.youtubeUrl || video.videoUrl || '') || `https://picsum.photos/400/225?sig=${video.id}`}
                          alt={video.title}
                          className="w-full h-40 object-cover"
                          loading="lazy"
                          onError={() => handleImageError(video.id)}
                        />
                      ) : (
                        <div className={`w-full h-40 bg-gradient-to-br ${getGradientPlaceholder(video.title).gradient} flex items-center justify-center`}>
                          <span className="text-white text-4xl font-bold opacity-60">{getGradientPlaceholder(video.title).initial}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {isLocked ? (
                          <div className="w-14 h-14 bg-gray-800/80 rounded-full flex items-center justify-center">
                            <span className="material-symbols-rounded text-3xl text-white">lock</span>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                            <span className="material-symbols-rounded text-3xl text-brandBlue">play_arrow</span>
                          </div>
                        )}
                      </div>
                      {(video.isFree || index === 0) && !isEnrolled && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="material-symbols-rounded text-sm">visibility</span>
                          Preview
                        </div>
                      )}
                      {isCompleted && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="material-symbols-rounded text-sm">check_circle</span>
                          Completed
                        </div>
                      )}
                      {isLocked && (
                        <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                          <span className="material-symbols-rounded text-sm">lock</span>
                          Locked
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {video.duration || '00:00'}
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isLocked ? 'bg-gray-200 text-gray-500' : 'bg-brandBlue/10 text-brandBlue'}`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{video.title}</h4>
                          <p className="text-xs text-gray-400">{video.duration || '00:00'} min</p>
                        </div>
                      </div>
                      {isEnrolled && !isCompleted && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markVideoComplete(video.id); }}
                          className="p-2 text-gray-400 hover:text-green-500"
                        >
                          <span className="material-symbols-rounded">check_circle</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'notes' && (isEnrolled ? (
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <span className="material-symbols-rounded text-4xl text-gray-300">description</span>
                <p className="text-gray-400 mt-2">No notes available yet</p>
              </div>
            ) : (
              notes.map((note) => (
                <div 
                  key={note.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-rounded text-orange-500">description</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm">{note.title}</h4>
                    <p className="text-xs text-gray-400">PDF • {note.fileSize || '2.5 MB'}</p>
                  </div>
                  <a 
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-brandBlue/10 rounded-full flex items-center justify-center text-brandBlue"
                  >
                    <span className="material-symbols-rounded">download</span>
                  </a>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="material-symbols-rounded text-4xl text-gray-300">lock</span>
            <p className="text-gray-500 mt-2 font-medium">Enroll to access notes</p>
            {isPaidCourse ? (
              <button onClick={handleBuyNow} className="mt-4 bg-[#D32F2F] text-white px-6 py-2 rounded-xl font-bold text-sm mx-auto">Buy Now - ₹{course.price}</button>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="mt-4 bg-[#303F9F] text-white px-6 py-2 rounded-xl font-bold text-sm disabled:opacity-50">{enrolling ? 'Enrolling...' : 'Enroll Free'}</button>
            )}
          </div>
        ))}

        {activeTab === 'tests' && (
          <div className="space-y-3">
            {tests.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center">
                <span className="material-symbols-rounded text-4xl text-gray-300">quiz</span>
                <p className="text-gray-400 mt-2">No tests available yet</p>
              </div>
            ) : (
              tests.map((test: any) => {
                const isAttempted = progress.completedTests.includes(test.id);
                const canAccess = isEnrolled || test.isFree;
                const isLocked = !canAccess;
                return (
                  <div 
                    key={test.id}
                    className={`bg-white rounded-xl p-4 shadow-sm ${isLocked ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLocked ? 'bg-gray-100' : 'bg-purple-100'}`}>
                          <span className={`material-symbols-rounded ${isLocked ? 'text-gray-400' : 'text-purple-500'}`}>
                            {isLocked ? 'lock' : 'quiz'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{test.name}</h4>
                          <p className="text-xs text-gray-400">
                            {test.numberOfQuestions || test.questions || 0} Questions • {test.duration || 60} mins
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.isFree && !isEnrolled && (
                          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded">
                            FREE
                          </span>
                        )}
                        {isAttempted && (
                          <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded">
                            Attempted
                          </span>
                        )}
                        {isLocked && (
                          <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded">
                            LOCKED
                          </span>
                        )}
                      </div>
                    </div>
                    {canAccess ? (
                      <button 
                        onClick={() => navigate(`/test/${test.id}`)}
                        className="w-full bg-[#303F9F] text-white py-2.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
                      >
                        {isAttempted ? 'View Result / Retake' : 'Start Test'}
                      </button>
                    ) : (
                      <button 
                        onClick={handleBuyNow}
                        className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-rounded text-sm">lock</span>
                        Buy Course to Unlock
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'live' && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <LiveClassesCalendar studentId={studentId} courseId={id} />
          </div>
        )}

        {activeTab === 'live' && !isEnrolled && (
          <div className="bg-white rounded-xl p-8 text-center mt-4">
            <span className="material-symbols-rounded text-4xl text-gray-300">lock</span>
            <p className="text-gray-500 mt-2 font-medium">Enroll to access live classes</p>
            {isPaidCourse ? (
              <button onClick={handleBuyNow} className="mt-4 bg-[#D32F2F] text-white px-6 py-2 rounded-xl font-bold text-sm mx-auto">Buy Now - ₹{course.price}</button>
            ) : (
              <button onClick={handleEnroll} disabled={enrolling} className="mt-4 bg-[#303F9F] text-white px-6 py-2 rounded-xl font-bold text-sm disabled:opacity-50">{enrolling ? 'Enrolling...' : 'Enroll Free'}</button>
            )}
          </div>
        )}
      </main>

      {zoomLevel !== 1 && (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-1.5">
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 1.5}
            className="w-10 h-10 rounded-xl bg-[#1A237E] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#303F9F] transition-colors"
          >
            <span className="material-symbols-rounded text-xl">add</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors text-xs font-bold"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.8}
            className="w-10 h-10 rounded-xl bg-[#1A237E] text-white flex items-center justify-center disabled:opacity-30 hover:bg-[#303F9F] transition-colors"
          >
            <span className="material-symbols-rounded text-xl">remove</span>
          </button>
        </div>
      )}

      {zoomLevel === 1 && (
        <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-1.5">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 rounded-xl bg-[#1A237E] text-white flex items-center justify-center hover:bg-[#303F9F] transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-rounded text-xl">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 rounded-xl bg-[#1A237E] text-white flex items-center justify-center hover:bg-[#303F9F] transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-rounded text-xl">remove</span>
          </button>
        </div>
      )}

      {showVideoPlayer && selectedVideo && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <button onClick={closeVideoPlayer} className="flex items-center gap-2">
              <span className="material-symbols-rounded">arrow_back</span>
              <span className="font-medium">Back</span>
            </button>
            <h3 className="text-sm font-bold truncate max-w-[200px]">{selectedVideo.title}</h3>
            <button 
              onClick={() => { markVideoComplete(selectedVideo.id); closeVideoPlayer(); }}
              className="flex items-center gap-1 text-green-400 text-sm"
            >
              <span className="material-symbols-rounded text-sm">check</span>
              Done
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4" style={{ touchAction: 'manipulation' }}>
            <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden relative">
              {videoPlaying ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.youtubeUrl || selectedVideo.videoUrl || '')}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  title={selectedVideo.title}
                />
              ) : (
                <div
                  className="w-full h-full relative cursor-pointer group"
                  onClick={() => setVideoPlaying(true)}
                >
                  <img
                    src={getYouTubeThumbnail(selectedVideo.youtubeUrl || selectedVideo.videoUrl || '') || selectedVideo.thumbnail || ''}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-20 h-20 bg-[#D32F2F] rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <span className="material-symbols-rounded text-white text-4xl ml-1">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm font-medium opacity-80">Tap to play</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 text-white">
            <h4 className="font-bold">{selectedVideo.title}</h4>
            <p className="text-gray-400 text-sm">{selectedVideo.duration || '00:00'} min</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
