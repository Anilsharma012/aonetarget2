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

  const parentGroups = [...new Set(subcategories.map(s => s.parentPath).filter(Boolean))];
  const directSubs = subcategories.filter(s => !s.parentPath);
  const hasGroups = parentGroups.length > 0;

  const filteredGroupSubs = selectedGroup
    ? subcategories.filter(s => s.parentPath === selectedGroup)
    : [];

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
      </header>

      <main className="px-4 -mt-4 space-y-5">
        {hasGroups && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {parentGroups.map(group => {
                const parts = group.split(' > ');
                const shortLabel = parts[parts.length - 1] || group;
                return (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(selectedGroup === group ? null : group)}
                    className={`rounded-2xl px-5 py-3 text-center transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                      selectedGroup === group
                        ? 'bg-white shadow-lg border-2 border-brandBlue text-brandBlue'
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
                  <span className="material-icons-outlined text-brandBlue text-lg">category</span>
                  {selectedGroup}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {filteredGroupSubs.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubClick(sub)}
                      className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-left transition-all active:scale-95 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 ${sub.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="material-icons-outlined text-white text-lg">{sub.icon}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-700">{sub.title.replace(sub.parentPath + ' - ', '').replace(sub.parentPath + ' ', '')}</span>
                        {sub.description && <p className="text-[10px] text-gray-400 mt-0.5">{sub.description}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {directSubs.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brandBlue text-lg">category</span>
              Course Categories
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {directSubs.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleSubClick(sub)}
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
                  <div className={`w-16 h-16 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden`}>
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
                      <span className="font-bold text-brandBlue">{course.price ? `₹${course.price}` : 'Free'}</span>
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
