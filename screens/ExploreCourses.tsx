import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../src/services/apiClient';

interface Category {
  _id?: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  gradient: string;
  description: string;
  tag: string;
  order: number;
  isActive: boolean;
}

const ExploreCourses: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await categoriesAPI.getAll();
        const active = (Array.isArray(data) ? data : []).filter((c: Category) => c.isActive);
        setCategories(active);
        if (active.length === 0) {
          await categoriesAPI.seed();
          const seeded = await categoriesAPI.getAll();
          setCategories((Array.isArray(seeded) ? seeded : []).filter((c: Category) => c.isActive));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-gradient-to-br from-brandBlue to-[#1A237E] text-white pt-6 pb-8 px-4 rounded-b-[2rem]">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/20 transition-all">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight">Explore Courses</h1>
            <p className="text-blue-200 text-xs mt-0.5">Choose your learning path</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-white/15 rounded-2xl"></div>
                <div className="bg-white/15 rounded h-2 w-10"></div>
              </div>
            ))
          ) : (
            categories.slice(0, 4).map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/explore/${cat.id}`)}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center hover:bg-white/25 transition-all active:scale-90">
                  <span className="material-icons-outlined text-2xl">{cat.icon}</span>
                </div>
                <span className="text-[10px] font-bold">{cat.title}</span>
              </button>
            ))
          )}
        </div>
      </header>

      <main className="px-4 mt-6 space-y-4">
        <h2 className="text-sm font-black text-gray-700 uppercase tracking-wider">Select Your Stream</h2>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-24 w-full"></div>
            ))}
          </div>
        ) : categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => navigate(`/explore/${cat.id}`)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.98] transition-all text-left"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${cat.gradient} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <span className="material-icons-outlined text-white text-3xl">{cat.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-800">{cat.title}</h3>
                {cat.tag && (
                  <span className="bg-red-100 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase">{cat.tag}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{cat.subtitle}</p>
              <p className="text-[10px] text-gray-400 mt-1">{cat.description}</p>
            </div>
            <span className="material-icons-outlined text-gray-300 text-xl">chevron_right</span>
          </button>
        ))}

        {!loading && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 mt-6">
            <div className="flex items-center gap-3">
              <span className="material-icons-outlined text-amber-500 text-2xl">lightbulb</span>
              <div>
                <p className="text-sm font-bold text-amber-800">Not sure which course to pick?</p>
                <p className="text-xs text-amber-600 mt-1">Contact us for free career counselling!</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreCourses;
