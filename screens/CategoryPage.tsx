import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SubCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description?: string;
}

interface ClassGroup {
  id: string;
  title: string;
  icon: string;
  subs: SubCategory[];
}

interface CategoryConfig {
  title: string;
  subtitle: string;
  gradient: string;
  icon: string;
  classes?: ClassGroup[];
  subCategories?: SubCategory[];
  boards?: { id: string; title: string; icon: string; classes: ClassGroup[] }[];
  subjects?: { id: string; title: string; icon: string; color: string }[];
}

const categoryData: Record<string, CategoryConfig> = {
  'neet': {
    title: 'NEET',
    subtitle: 'Medical Entrance Preparation',
    gradient: 'from-blue-600 to-indigo-700',
    icon: 'biotech',
    classes: [
      {
        id: 'class-11',
        title: 'Class 11th',
        icon: 'school',
        subs: [
          { id: 'recorded-batch', title: 'Recorded Batch', icon: 'video_library', color: 'bg-blue-500' },
          { id: 'live-classroom', title: 'Live Classroom', icon: 'cast_for_education', color: 'bg-red-500' },
          { id: 'crash-course', title: 'Crash Course', icon: 'speed', color: 'bg-orange-500' },
          { id: 'mock-test', title: 'Mock Test', icon: 'quiz', color: 'bg-green-500' }
        ]
      },
      {
        id: 'class-12',
        title: 'Class 12th',
        icon: 'school',
        subs: [
          { id: 'recorded-batch', title: 'Recorded Batch', icon: 'video_library', color: 'bg-blue-500' },
          { id: 'live-classroom', title: 'Live Classroom', icon: 'cast_for_education', color: 'bg-red-500' },
          { id: 'crash-course', title: 'Crash Course', icon: 'speed', color: 'bg-orange-500' },
          { id: 'mock-test', title: 'Mock Test', icon: 'quiz', color: 'bg-green-500' }
        ]
      },
      {
        id: 'neet-exam',
        title: 'NEET Exams',
        icon: 'workspace_premium',
        subs: [
          { id: 'recorded-batch', title: 'Recorded Batch', icon: 'video_library', color: 'bg-blue-500' },
          { id: 'live-classroom', title: 'Live Classroom', icon: 'cast_for_education', color: 'bg-red-500' },
          { id: 'crash-course', title: 'Crash Course', icon: 'speed', color: 'bg-orange-500' },
          { id: 'mock-test', title: 'Mock Test', icon: 'quiz', color: 'bg-green-500' }
        ]
      }
    ],
    subjects: [
      { id: 'biology', title: 'Biology', icon: 'genetics', color: 'bg-green-500' },
      { id: 'chemistry', title: 'Chemistry', icon: 'science', color: 'bg-purple-500' },
      { id: 'physics', title: 'Physics', icon: 'bolt', color: 'bg-amber-500' }
    ]
  },
  'iit-jee': {
    title: 'IIT-JEE',
    subtitle: 'Engineering Entrance Preparation',
    gradient: 'from-orange-500 to-red-600',
    icon: 'engineering',
    subCategories: [
      { id: 'recorded-batch', title: 'Recorded Batch', icon: 'video_library', color: 'bg-blue-500', description: 'Pre-recorded video lectures' },
      { id: 'live-classroom', title: 'Live Classroom', icon: 'cast_for_education', color: 'bg-red-500', description: 'Interactive live classes' },
      { id: 'crash-course', title: 'Crash Course', icon: 'speed', color: 'bg-orange-500', description: 'Quick revision modules' },
      { id: 'mock-test', title: 'Mock Test', icon: 'quiz', color: 'bg-green-500', description: 'Practice test series' }
    ],
    subjects: [
      { id: 'physics', title: 'Physics', icon: 'bolt', color: 'bg-amber-500' },
      { id: 'chemistry', title: 'Chemistry', icon: 'science', color: 'bg-purple-500' },
      { id: 'mathematics', title: 'Mathematics', icon: 'calculate', color: 'bg-blue-500' }
    ]
  },
  'nursing': {
    title: 'Nursing CET',
    subtitle: 'Nursing & Paramedical Courses',
    gradient: 'from-teal-500 to-emerald-600',
    icon: 'local_hospital',
    subCategories: [
      { id: 'bsc-cet-entrance', title: 'BSC CET Entrance', icon: 'school', color: 'bg-blue-500', description: 'Nursing & Paramedical entrance' },
      { id: 'nursing-officer', title: 'Nursing Officer', icon: 'medical_services', color: 'bg-red-500', description: 'Govt Job Coaching' },
      { id: 'anm-mphw', title: 'ANM-MPHW', icon: 'health_and_safety', color: 'bg-amber-500', description: 'Govt Job Coaching' },
      { id: 'gnm', title: 'GNM', icon: 'medication', color: 'bg-green-500', description: '1st, 2nd, 3rd Year Syllabus' },
      { id: 'bsc-nursing', title: 'BSC Nursing Degree', icon: 'local_pharmacy', color: 'bg-purple-500', description: 'Semester Wise Syllabus' },
      { id: 'e-book', title: 'E-Book', icon: 'auto_stories', color: 'bg-indigo-500', description: 'Study material & notes' },
      { id: 'mock-test', title: 'Mock Test', icon: 'quiz', color: 'bg-teal-500', description: 'Practice tests' }
    ]
  },
  'general': {
    title: 'General Studies',
    subtitle: 'Class 9th & 10th Board Preparation',
    gradient: 'from-purple-500 to-violet-600',
    icon: 'menu_book',
    boards: [
      {
        id: 'cbse',
        title: 'CBSE Board',
        icon: 'account_balance',
        classes: [
          {
            id: 'class-9',
            title: 'Class 9th',
            icon: 'school',
            subs: [
              { id: 'english', title: 'English', icon: 'translate', color: 'bg-blue-500' },
              { id: 'hindi', title: 'Hindi', icon: 'language', color: 'bg-orange-500' },
              { id: 'social-studies', title: 'Social Studies', icon: 'public', color: 'bg-green-500' },
              { id: 'science', title: 'Science & Tech', icon: 'science', color: 'bg-purple-500' },
              { id: 'maths', title: 'Mathematics', icon: 'calculate', color: 'bg-red-500' }
            ]
          },
          {
            id: 'class-10',
            title: 'Class 10th',
            icon: 'school',
            subs: [
              { id: 'english', title: 'English', icon: 'translate', color: 'bg-blue-500' },
              { id: 'hindi', title: 'Hindi', icon: 'language', color: 'bg-orange-500' },
              { id: 'social-studies', title: 'Social Studies', icon: 'public', color: 'bg-green-500' },
              { id: 'science', title: 'Science & Tech', icon: 'science', color: 'bg-purple-500' },
              { id: 'maths', title: 'Mathematics', icon: 'calculate', color: 'bg-red-500' }
            ]
          }
        ]
      },
      {
        id: 'hbse',
        title: 'HBSE Board',
        icon: 'account_balance',
        classes: [
          {
            id: 'class-9',
            title: 'Class 9th',
            icon: 'school',
            subs: [
              { id: 'english', title: 'English', icon: 'translate', color: 'bg-blue-500' },
              { id: 'hindi', title: 'Hindi', icon: 'language', color: 'bg-orange-500' },
              { id: 'social-studies', title: 'Social Studies', icon: 'public', color: 'bg-green-500' },
              { id: 'science', title: 'Science & Tech', icon: 'science', color: 'bg-purple-500' },
              { id: 'maths', title: 'Mathematics', icon: 'calculate', color: 'bg-red-500' }
            ]
          },
          {
            id: 'class-10',
            title: 'Class 10th',
            icon: 'school',
            subs: [
              { id: 'english', title: 'English', icon: 'translate', color: 'bg-blue-500' },
              { id: 'hindi', title: 'Hindi', icon: 'language', color: 'bg-orange-500' },
              { id: 'social-studies', title: 'Social Studies', icon: 'public', color: 'bg-green-500' },
              { id: 'science', title: 'Science & Tech', icon: 'science', color: 'bg-purple-500' },
              { id: 'maths', title: 'Mathematics', icon: 'calculate', color: 'bg-red-500' }
            ]
          }
        ]
      }
    ]
  }
};

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const config = categoryData[categoryId || ''];
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Category not found</p>
      </div>
    );
  }

  const handleSubClick = (subId: string, parentLabel: string) => {
    const flatSubId = subId.replace(/\//g, '_');
    navigate(`/explore/${categoryId}/${flatSubId}?label=${encodeURIComponent(parentLabel)}`);
  };

  const selectedClassData = config.classes?.find(c => c.id === selectedClass);
  const selectedBoardData = config.boards?.find(b => b.id === selectedBoard);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className={`bg-gradient-to-br ${config.gradient} text-white pt-6 pb-8 px-4 rounded-b-[2rem]`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-all">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-icons-outlined text-2xl">{config.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{config.title}</h1>
              <p className="text-white/70 text-xs">{config.subtitle}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4 space-y-5">
        {/* NEET / IIT-JEE with classes */}
        {config.classes && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {config.classes.map(cls => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                  className={`rounded-2xl p-4 text-center transition-all active:scale-95 ${
                    selectedClass === cls.id
                      ? 'bg-white shadow-lg border-2 border-brandBlue'
                      : 'bg-white shadow-sm border border-gray-100'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                    selectedClass === cls.id ? 'bg-brandBlue text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="material-icons-outlined text-xl">{cls.icon}</span>
                  </div>
                  <p className={`text-xs font-bold ${selectedClass === cls.id ? 'text-brandBlue' : 'text-gray-700'}`}>{cls.title}</p>
                </button>
              ))}
            </div>

            {selectedClassData && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in">
                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                  <span className="material-icons-outlined text-brandBlue text-lg">category</span>
                  {selectedClassData.title} - Choose Category
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedClassData.subs.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubClick(`${selectedClass}/${sub.id}`, `${config.title} ${selectedClassData.title} - ${sub.title}`)}
                      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-all active:scale-95 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="material-icons-outlined text-white text-lg">{sub.icon}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{sub.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* IIT-JEE / Nursing direct sub-categories */}
        {config.subCategories && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brandBlue text-lg">category</span>
              Course Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {config.subCategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(sub.id, `${config.title} - ${sub.title}`)}
                  className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-all active:scale-95"
                >
                  <div className={`w-12 h-12 ${sub.color} rounded-xl flex items-center justify-center mb-3`}>
                    <span className="material-icons-outlined text-white text-xl">{sub.icon}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-800">{sub.title}</p>
                  {sub.description && (
                    <p className="text-[10px] text-gray-400 mt-1">{sub.description}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* General Studies - Board selection */}
        {config.boards && (
          <>
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider">Select Board</h3>
            <div className="grid grid-cols-2 gap-4">
              {config.boards.map(board => (
                <button
                  key={board.id}
                  onClick={() => setSelectedBoard(selectedBoard === board.id ? null : board.id)}
                  className={`rounded-2xl p-5 text-center transition-all active:scale-95 ${
                    selectedBoard === board.id
                      ? 'bg-white shadow-lg border-2 border-purple-500'
                      : 'bg-white shadow-sm border border-gray-100'
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 ${
                    selectedBoard === board.id ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className="material-icons-outlined text-2xl">{board.icon}</span>
                  </div>
                  <p className={`text-sm font-black ${selectedBoard === board.id ? 'text-purple-600' : 'text-gray-700'}`}>{board.title}</p>
                </button>
              ))}
            </div>

            {selectedBoardData && (
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-icons-outlined text-purple-500">school</span>
                  {selectedBoardData.title} - Select Class
                </h3>
                {selectedBoardData.classes.map(cls => (
                  <div key={cls.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="material-icons-outlined text-purple-500 text-sm">{cls.icon}</span>
                      </div>
                      {cls.title}
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {cls.subs.map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => handleSubClick(`${selectedBoard}/${cls.id}/${sub.id}`, `${selectedBoardData.title} ${cls.title} - ${sub.title}`)}
                          className="bg-gray-50 hover:bg-gray-100 rounded-xl p-3 text-center transition-all active:scale-95"
                        >
                          <div className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                            <span className="material-icons-outlined text-white text-lg">{sub.icon}</span>
                          </div>
                          <p className="text-[10px] font-bold text-gray-700">{sub.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Subjects Section */}
        {config.subjects && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brandBlue text-lg">auto_awesome</span>
              Subject-Wise Courses
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {config.subjects.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(`subject/${sub.id}`, `${config.title} - ${sub.title}`)}
                  className="flex-shrink-0 bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-all active:scale-95 min-w-[100px]"
                >
                  <div className={`w-12 h-12 ${sub.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                    <span className="material-icons-outlined text-white text-xl">{sub.icon}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-700">{sub.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Courses from MongoDB */}
        {courses.filter(c => 
          c.category?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '') ||
          c.name?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '')
        ).length > 0 && (
          <div>
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Available Courses</h3>
            <div className="space-y-3">
              {courses.filter(c =>
                c.category?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '') ||
                c.name?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '')
              ).map((course, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/course/${course._id || course.id}`)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm flex gap-4 text-left active:scale-[0.98] transition-transform"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-icons-outlined text-white text-2xl">play_circle</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-800">{course.name || course.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{course.description || 'Complete preparation course'}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">play_circle</span>
                        {course.videos || 0} Videos
                      </span>
                      <span className="font-bold text-brandBlue">₹{course.price || 'Free'}</span>
                    </div>
                  </div>
                  <span className="material-icons-outlined text-gray-300 self-center">chevron_right</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
