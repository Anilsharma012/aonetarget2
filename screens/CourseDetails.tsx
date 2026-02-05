import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LiveClassesCalendar from '../components/student/LiveClassesCalendar';

interface Video {
  id: string;
  title: string;
  duration: string;
  thumbnail?: string;
  videoUrl?: string;
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
  category?: string;
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
      <header className="bg-brandBlue text-white sticky top-0 z-50">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <img src="/aone-logo.png" alt="Logo" className="h-8" onError={(e) => e.currentTarget.style.display = 'none'} />
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
          {(['videos', 'notes', 'tests', 'live'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold capitalize transition-all ${
                activeTab === tab 
                  ? 'text-brandBlue border-b-2 border-brandBlue' 
                  : 'text-gray-500 border-b-2 border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4">
        {!isEnrolled ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <span className="material-symbols-rounded text-5xl text-brandBlue mb-4">lock</span>
            <h3 className="font-bold text-lg mb-2">Enroll to Access Content</h3>
            <p className="text-gray-500 text-sm mb-4">
              Get access to all videos, notes, and tests in this course
            </p>
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-brandBlue text-white py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {enrolling ? 'Enrolling...' : course.price ? `Enroll Now - ₹${course.price}` : 'Enroll Now - Free'}
            </button>
          </div>
        ) : (
          <>
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
                    return (
                      <div 
                        key={video.id}
                        className="bg-white rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="relative">
                          <img 
                            src={video.thumbnail || `https://picsum.photos/400/225?sig=${video.id}`}
                            alt={video.title}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <button className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
                              <span className="material-symbols-rounded text-3xl text-brandBlue">play_arrow</span>
                            </button>
                          </div>
                          {isCompleted && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                              <span className="material-symbols-rounded text-sm">check_circle</span>
                              Completed
                            </div>
                          )}
                          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {video.duration || '00:00'}
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brandBlue/10 rounded-full flex items-center justify-center text-brandBlue font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{video.title}</h4>
                              <p className="text-xs text-gray-400">{video.duration || '00:00'} min</p>
                            </div>
                          </div>
                          {!isCompleted && (
                            <button 
                              onClick={() => markVideoComplete(video.id)}
                              className="p-2 text-gray-400 hover:text-green-500"
                            >
                              <span className="material-symbols-rounded">download</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'notes' && (
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
            )}

            {activeTab === 'tests' && (
              <div className="space-y-3">
                {tests.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center">
                    <span className="material-symbols-rounded text-4xl text-gray-300">quiz</span>
                    <p className="text-gray-400 mt-2">No tests available yet</p>
                  </div>
                ) : (
                  tests.map((test) => {
                    const isAttempted = progress.completedTests.includes(test.id);
                    return (
                      <div 
                        key={test.id}
                        className="bg-white rounded-xl p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                              <span className="material-symbols-rounded text-purple-500">quiz</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{test.name}</h4>
                              <p className="text-xs text-gray-400">
                                {test.questions} Questions • {test.duration || 180} mins
                              </p>
                            </div>
                          </div>
                          {isAttempted && (
                            <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded">
                              Attempted
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={() => navigate(`/test/${test.id}`)}
                          className="w-full bg-brandBlue text-white py-2 rounded-lg font-bold text-sm"
                        >
                          {isAttempted ? 'View Result' : 'Start Test'}
                        </button>
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
          </>
        )}
      </main>
    </div>
  );
};

export default CourseDetails;
