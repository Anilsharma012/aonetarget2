import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  type?: string;
  examType?: string;
  contentType?: string;
  subject?: string;
  categoryId?: string;
  subcategoryId?: string;
  isLive?: boolean;
  videos?: number;
  tests?: number;
}

const contentTypes = [
  { id: 'recorded_batch', label: 'Recorded Batch', icon: 'play_circle', color: 'from-[#303F9F] to-[#1A237E]' },
  { id: 'live_classroom', label: 'Live Classroom', icon: 'cast_for_education', color: 'from-[#D32F2F] to-[#B71C1C]' },
  { id: 'crash_course', label: 'Crash Course', icon: 'bolt', color: 'from-[#E65100] to-[#BF360C]' },
  { id: 'mock_test', label: 'Mock Test', icon: 'quiz', color: 'from-[#2E7D32] to-[#1B5E20]' },
];

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

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [activeExam, setActiveExam] = useState<'neet' | 'iit-jee'>('neet');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/courses');
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  const subjects = activeExam === 'neet' ? neetSubjects : jeeSubjects;

  const getFilteredCourses = () => {
    return courses.filter(c => {
      if (c.examType && c.examType !== activeExam) return false;
      if (!c.examType) {
        if (activeExam === 'neet' && c.categoryId !== 'neet') return false;
        if (activeExam === 'iit-jee' && c.categoryId !== 'iit-jee') return false;
      }
      if (selectedContent && c.contentType !== selectedContent) return false;
      if (selectedSubject && c.subject !== selectedSubject) return false;
      return true;
    });
  };

  const getContentCount = (contentTypeId: string) => {
    return courses.filter(c => {
      if (c.examType && c.examType !== activeExam) return false;
      if (!c.examType) {
        if (activeExam === 'neet' && c.categoryId !== 'neet') return false;
        if (activeExam === 'iit-jee' && c.categoryId !== 'iit-jee') return false;
      }
      return c.contentType === contentTypeId;
    }).length;
  };

  const filteredCourses = getFilteredCourses();

  const handleContentClick = (contentTypeId: string) => {
    if (selectedContent === contentTypeId) {
      setSelectedContent(null);
    } else {
      setSelectedContent(contentTypeId);
    }
    setSelectedSubject(null);
  };

  const handleExamSwitch = (exam: 'neet' | 'iit-jee') => {
    setActiveExam(exam);
    setSelectedContent(null);
    setSelectedSubject(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-[#303F9F] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-br from-[#1A237E] to-[#303F9F] text-white pt-6 pb-10 px-4 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white/10"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-all">
              <span className="material-symbols-rounded">arrow_back</span>
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight">NEET / IIT-JEE</h1>
              <p className="text-white/60 text-xs mt-0.5">Aone Target Institute</p>
            </div>
          </div>

          <div className="flex bg-white/15 rounded-2xl p-1 backdrop-blur-sm">
            <button
              onClick={() => handleExamSwitch('neet')}
              className={`flex-1 py-3 rounded-xl text-center transition-all font-bold text-sm ${
                activeExam === 'neet'
                  ? 'bg-white text-[#1A237E] shadow-lg'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="material-symbols-rounded text-lg align-middle mr-1">medical_services</span>
              NEET
            </button>
            <button
              onClick={() => handleExamSwitch('iit-jee')}
              className={`flex-1 py-3 rounded-xl text-center transition-all font-bold text-sm ${
                activeExam === 'iit-jee'
                  ? 'bg-white text-[#D32F2F] shadow-lg'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <span className="material-symbols-rounded text-lg align-middle mr-1">engineering</span>
              IIT-JEE
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-5 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {contentTypes.map(ct => {
            const count = getContentCount(ct.id);
            const isSelected = selectedContent === ct.id;
            return (
              <button
                key={ct.id}
                onClick={() => handleContentClick(ct.id)}
                className={`relative rounded-2xl p-4 text-left transition-all active:scale-95 overflow-hidden ${
                  isSelected
                    ? 'ring-2 ring-[#303F9F] ring-offset-2 shadow-xl'
                    : 'shadow-md hover:shadow-lg'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${ct.color}`}></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3">
                    <span className="material-symbols-rounded text-white text-2xl">{ct.icon}</span>
                  </div>
                  <h3 className="text-white font-bold text-sm leading-tight">{ct.label}</h3>
                  <p className="text-white/60 text-[10px] mt-1">{count} {count === 1 ? 'Course' : 'Courses'}</p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center z-10">
                    <span className="material-symbols-rounded text-[#303F9F] text-sm">check</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="material-symbols-rounded text-[#303F9F] text-sm">filter_list</span>
            Filter by Subject
          </h3>
          <div className="flex gap-2">
            {subjects.map(subj => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubject(selectedSubject === subj.id ? null : subj.id)}
                className={`flex-1 py-3 rounded-xl text-center transition-all active:scale-95 flex flex-col items-center gap-1.5 ${
                  selectedSubject === subj.id
                    ? 'bg-gradient-to-br from-[#303F9F] to-[#1A237E] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                <span className="material-symbols-rounded text-lg">{subj.icon}</span>
                <span className="text-[10px] font-bold">{subj.label}</span>
              </button>
            ))}
          </div>
        </div>

        {(selectedContent || selectedSubject) && (
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-700">
              {filteredCourses.length} {filteredCourses.length === 1 ? 'Course' : 'Courses'} Found
            </h3>
            <button
              onClick={() => { setSelectedContent(null); setSelectedSubject(null); }}
              className="text-xs text-[#303F9F] font-bold flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-sm">clear_all</span>
              Clear Filters
            </button>
          </div>
        )}

        <div className="space-y-3">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, idx) => {
              const cId = course.id || course._id || '';
              const courseName = course.name || course.title || 'Course';
              const coursePrice = course.price || 0;
              const isFree = coursePrice === 0;
              const ct = contentTypes.find(c => c.id === course.contentType);

              return (
                <button
                  key={cId || idx}
                  onClick={() => navigate(`/course/${cId}`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm flex gap-4 text-left active:scale-[0.98] transition-all border border-gray-100 hover:shadow-md"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${ct?.color || 'from-[#303F9F] to-[#1A237E]'} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {(course.imageUrl || course.thumbnail) ? (
                      <img src={course.imageUrl || course.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <span className="material-symbols-rounded text-white text-2xl opacity-70">{ct?.icon || 'school'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#1A237E] line-clamp-2 leading-tight">{courseName}</h4>
                    {course.instructor && (
                      <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-rounded text-xs">person</span>
                        {course.instructor}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {course.subject && (
                        <span className="bg-blue-50 text-[#303F9F] text-[9px] font-bold px-2 py-0.5 rounded-full capitalize">{course.subject}</span>
                      )}
                      {ct && (
                        <span className="bg-gray-50 text-gray-500 text-[9px] font-bold px-2 py-0.5 rounded-full">{ct.label}</span>
                      )}
                      <span className="text-xs font-bold ml-auto">
                        {isFree ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          <span className="text-[#1A237E]">₹{coursePrice}</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-rounded text-gray-300 self-center text-lg">chevron_right</span>
                </button>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-rounded text-5xl text-gray-200">
                  {selectedContent === 'mock_test' ? 'quiz' : selectedContent === 'live_classroom' ? 'cast_for_education' : 'school'}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-500">
                {selectedContent || selectedSubject ? 'No courses match your filters' : 'No courses available yet'}
              </p>
              <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
                {selectedContent || selectedSubject
                  ? 'Try selecting a different content type or subject'
                  : 'Courses will be added soon!'}
              </p>
              {(selectedContent || selectedSubject) && (
                <button
                  onClick={() => { setSelectedContent(null); setSelectedSubject(null); }}
                  className="mt-4 px-5 py-2 bg-[#303F9F]/10 text-[#303F9F] text-xs font-bold rounded-full"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;
