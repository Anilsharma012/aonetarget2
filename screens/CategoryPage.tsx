import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriesAPI, subcategoriesAPI } from '../src/services/apiClient';

interface Category {
  _id?: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  description: string;
  tag: string;
  isActive: boolean;
}

interface SubCategory {
  _id?: string;
  id: string;
  categoryId: string;
  title: string;
  parentPath: string;
  icon: string;
  color: string;
  description?: string;
  order: number;
  isActive: boolean;
}

const CategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, subs, coursesRes] = await Promise.all([
          categoriesAPI.getAll(),
          subcategoriesAPI.getAll(categoryId),
          fetch('/api/courses').then(r => r.json()),
        ]);
        const cat = (Array.isArray(cats) ? cats : []).find((c: Category) => c.id === categoryId);
        setCategory(cat || null);
        setSubcategories((Array.isArray(subs) ? subs : []).filter((s: SubCategory) => s.isActive));
        setCourses(Array.isArray(coursesRes) ? coursesRes : []);
      } catch (error) {
        console.error('Error loading category:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Category not found</p>
      </div>
    );
  }

  const handleSubClick = (sub: SubCategory) => {
    const subId = sub.id.includes('_') ? sub.id : `${categoryId}_${sub.id}`;
    navigate(`/explore/${categoryId}/${subId}?label=${encodeURIComponent(sub.title)}`);
  };

  const getCoursesForCategory = () => {
    return courses.filter(c =>
      c.category?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '') ||
      c.name?.toLowerCase().includes(categoryId === 'iit-jee' ? 'jee' : categoryId || '')
    );
  };

  const getCourseCountForSub = (sub: SubCategory) => {
    const subTitle = sub.title.toLowerCase();
    return courses.filter(c =>
      c.subcategory?.toLowerCase() === subTitle ||
      c.subcategoryId === sub.id ||
      c.name?.toLowerCase().includes(subTitle) ||
      c.category?.toLowerCase().includes(subTitle)
    ).length;
  };

  const parentGroups = [...new Set(subcategories.map(s => s.parentPath).filter(Boolean))];
  const directSubs = subcategories.filter(s => !s.parentPath);
  const hasGroups = parentGroups.length > 0;

  const filteredGroupSubs = selectedGroup
    ? subcategories.filter(s => s.parentPath === selectedGroup)
    : [];

  const categoryCourses = getCoursesForCategory();
  const filteredCourses = selectedSubFilter
    ? categoryCourses.filter(c => {
        const sub = subcategories.find(s => s.id === selectedSubFilter);
        if (!sub) return false;
        const subTitle = sub.title.toLowerCase();
        return (
          c.subcategory?.toLowerCase() === subTitle ||
          c.subcategoryId === sub.id ||
          c.name?.toLowerCase().includes(subTitle) ||
          c.category?.toLowerCase().includes(subTitle)
        );
      })
    : categoryCourses;

  const gradientColors: Record<string, string> = {
    'bg-blue-500': 'from-blue-500 to-blue-600',
    'bg-indigo-500': 'from-indigo-500 to-indigo-600',
    'bg-purple-500': 'from-purple-500 to-purple-600',
    'bg-teal-500': 'from-teal-500 to-teal-600',
    'bg-green-500': 'from-green-500 to-green-600',
    'bg-orange-500': 'from-orange-500 to-orange-600',
    'bg-red-500': 'from-red-500 to-red-600',
    'bg-pink-500': 'from-pink-500 to-pink-600',
    'bg-cyan-500': 'from-cyan-500 to-cyan-600',
    'bg-emerald-500': 'from-emerald-500 to-emerald-600',
    'bg-amber-500': 'from-amber-500 to-amber-600',
    'bg-violet-500': 'from-violet-500 to-violet-600',
  };

  const getSubGradient = (color: string) => {
    return gradientColors[color] || 'from-[#303F9F] to-[#1A237E]';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className={`bg-gradient-to-br ${category.gradient} text-white pt-6 pb-8 px-4 rounded-b-[2rem]`}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-all">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="material-icons-outlined text-2xl">{category.icon}</span>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">{category.title}</h1>
              <p className="text-white/70 text-xs">{category.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
            <span className="material-icons-outlined text-sm">school</span>
            <span className="text-xs font-semibold">{categoryCourses.length} Courses</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full">
            <span className="material-icons-outlined text-sm">category</span>
            <span className="text-xs font-semibold">{subcategories.length} Subcategories</span>
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4 space-y-5">
        {hasGroups && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {parentGroups.map(group => {
                const parts = group.split(' > ');
                const shortLabel = parts[parts.length - 1] || group;
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                    className={`rounded-2xl px-5 py-3 text-center transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                      selectedGroup === group
                        ? 'bg-white shadow-lg border-2 border-[#303F9F] text-[#303F9F]'
                        : 'bg-white shadow-sm border border-gray-100 text-gray-700'
                    }`}
                  >
                    <p className="text-xs font-bold">{shortLabel}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{group !== shortLabel ? group : ''}</p>
                  </button>
                );
              })}
            </div>

            {selectedGroup && filteredGroupSubs.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-fade-in">
                <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
                  <span className="material-icons-outlined text-[#303F9F] text-lg">category</span>
                  {selectedGroup}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredGroupSubs.map(sub => {
                    const courseCount = getCourseCountForSub(sub);
                    return (
                      <button
                        key={sub.id}
                        onClick={() => handleSubClick(sub)}
                        className="bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-xl p-4 text-left transition-all active:scale-95 flex items-center gap-3 border border-gray-100 hover:border-gray-200 hover:shadow-md"
                      >
                        <div className={`w-11 h-11 bg-gradient-to-br ${getSubGradient(sub.color)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <span className="material-icons-outlined text-white text-lg">{sub.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-gray-700 line-clamp-2">{sub.title.replace(sub.parentPath + ' - ', '').replace(sub.parentPath + ' ', '')}</span>
                          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <span className="material-icons-outlined" style={{ fontSize: '10px' }}>menu_book</span>
                            {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {directSubs.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-[#303F9F] text-lg">category</span>
              Course Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {directSubs.map(sub => {
                const courseCount = getCourseCountForSub(sub);
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSubClick(sub)}
                    className="bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 rounded-xl p-4 text-left transition-all active:scale-95 border border-gray-100 hover:border-gray-200 hover:shadow-md group"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-br ${getSubGradient(sub.color)} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <span className="material-icons-outlined text-white text-xl">{sub.icon}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-800">{sub.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-icons-outlined text-gray-400" style={{ fontSize: '10px' }}>menu_book</span>
                      <p className="text-[10px] text-gray-400">{courseCount} {courseCount === 1 ? 'Course' : 'Courses'}</p>
                    </div>
                    {sub.description && (
                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2">{sub.description}</p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {categoryCourses.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-gray-700 uppercase tracking-wider mb-3">Available Courses</h3>

            {subcategories.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar">
                <button
                  onClick={() => setSelectedSubFilter(null)}
                  className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                    !selectedSubFilter
                      ? 'bg-[#1A237E] text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  All Courses ({categoryCourses.length})
                </button>
                {subcategories.map(sub => {
                  const count = getCourseCountForSub(sub);
                  return (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubFilter(selectedSubFilter === sub.id ? null : sub.id)}
                      className={`rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 flex items-center gap-1.5 ${
                        selectedSubFilter === sub.id
                          ? 'bg-[#303F9F] text-white shadow-md'
                          : 'bg-white text-gray-600 border border-gray-200'
                      }`}
                    >
                      <span className="material-icons-outlined" style={{ fontSize: '14px' }}>{sub.icon}</span>
                      {sub.title.replace(sub.parentPath ? sub.parentPath + ' - ' : '', '').replace(sub.parentPath ? sub.parentPath + ' ' : '', '')}
                      {count > 0 && <span className="opacity-70">({count})</span>}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="space-y-3">
              {filteredCourses.map((course, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/course/${course._id || course.id}`)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm flex gap-4 text-left active:scale-[0.98] transition-transform border border-gray-100 hover:shadow-md"
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; const parent = e.currentTarget.parentElement; if (parent) { const span = document.createElement('span'); span.className = 'text-white text-xl font-bold opacity-60'; span.textContent = (course.name || course.title || '?').charAt(0).toUpperCase(); parent.appendChild(span); }}} />
                    ) : (
                      <span className="text-white text-xl font-bold opacity-60">{(course.name || course.title || '?').charAt(0).toUpperCase()}</span>
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
                      <span className="font-bold text-[#303F9F]">{course.price ? `₹${course.price}` : 'Free'}</span>
                    </div>
                  </div>
                  <span className="material-icons-outlined text-gray-300 self-center">chevron_right</span>
                </button>
              ))}
              {filteredCourses.length === 0 && selectedSubFilter && (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                  <span className="material-icons-outlined text-5xl text-gray-200">search_off</span>
                  <p className="text-sm font-bold text-gray-400 mt-3">No courses found</p>
                  <p className="text-xs text-gray-300 mt-1">Try selecting a different filter</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryPage;
