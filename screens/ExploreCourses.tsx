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
    <div className="min-h-screen bg-surface-100 pb-24">
      <header className="bg-gradient-to-br from-primary-800 via-primary-600 to-primary-500 text-white pt-6 pb-10 px-4 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full glass-dark flex items-center justify-center active:scale-[0.97] transition-all duration-200"
            >
              <span className="material-symbols-rounded text-xl">arrow_back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold tracking-tight">Explore Courses</h1>
              <p className="text-white/60 text-xs mt-0.5 font-medium">Choose your learning path</p>
            </div>
            <button className="w-10 h-10 rounded-full glass-dark flex items-center justify-center active:scale-[0.97] transition-all duration-200">
              <span className="material-symbols-rounded text-xl">search</span>
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                  <div className="w-14 h-14 skeleton rounded-2xl opacity-30"></div>
                  <div className="skeleton rounded-full h-2.5 w-12 opacity-30"></div>
                </div>
              ))
            ) : (
              categories.slice(0, 4).map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/explore/${cat.id}`)}
                  className="flex flex-col items-center gap-2 min-w-[72px] animate-fade-in-up active:scale-[0.97] transition-all duration-200"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-14 h-14 glass rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 shadow-glass">
                    <span className="material-symbols-rounded text-2xl text-white">{cat.icon}</span>
                  </div>
                  <span className="text-[10px] font-bold text-white/90">{cat.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </header>

      <main className="px-4 -mt-4 relative z-10 space-y-3">
        <div className="flex items-center gap-3 mb-2 pt-2">
          <div className="w-1 h-5 bg-gradient-to-b from-primary-600 to-primary-400 rounded-full" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Select Your Stream</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card-premium p-4 flex items-center gap-4">
                <div className="w-16 h-16 skeleton rounded-2xl flex-shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded-full"></div>
                  <div className="skeleton h-3 w-1/2 rounded-full"></div>
                  <div className="skeleton h-2.5 w-full rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/explore/${cat.id}`)}
              className="w-full card-premium p-4 flex items-center gap-4 active:scale-[0.97] transition-all duration-200 text-left animate-fade-in-up group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${cat.gradient} rounded-3xl flex items-center justify-center flex-shrink-0 shadow-card group-hover:shadow-elevated transition-all duration-200 group-hover:scale-105`}>
                <span className="material-symbols-rounded text-white text-3xl">{cat.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-bold text-gray-800 line-clamp-1">{cat.title}</h3>
                  {cat.tag && (
                    <span className="bg-accent-50 text-accent-500 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">{cat.tag}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">{cat.subtitle}</p>
                <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{cat.description}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center group-hover:bg-primary-50 transition-all duration-200">
                <span className="material-symbols-rounded text-gray-400 text-lg group-hover:text-primary-600 transition-colors duration-200">chevron_right</span>
              </div>
            </button>
          ))
        )}

        {!loading && (
          <div className="card-premium p-4 mt-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100/60 animate-fade-in-up" style={{ animationDelay: `${categories.length * 60 + 100}ms` }}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-rounded text-amber-600 text-2xl">lightbulb</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-amber-800">Not sure which course to pick?</p>
                <p className="text-xs text-amber-600/80 mt-1 leading-relaxed">Contact us for free career counselling and expert guidance!</p>
                <button className="mt-3 text-xs font-bold text-amber-700 bg-amber-200/60 px-4 py-2 rounded-xl active:scale-[0.97] transition-all duration-200 flex items-center gap-1.5 hover:bg-amber-200">
                  <span className="material-symbols-rounded text-sm">support_agent</span>
                  Get Free Counselling
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreCourses;
