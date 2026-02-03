
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { COURSES } from '../constants';

const Batches: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-xl font-medium tracking-wide">NEET & Medical Batches</h1>
        <button className="ml-auto p-1 rounded-full hover:bg-white/10">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </header>

      <div className="px-4 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="material-symbols-outlined text-gray-400">search</span>
          </span>
          <input className="w-full py-2.5 pl-10 pr-4 text-sm bg-gray-100 dark:bg-gray-800 border-none rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Search for courses..." type="text"/>
        </div>
      </div>

      <main className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Courses ({COURSES.length})</h2>
          <button className="text-primary text-sm font-medium flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">sort</span> Sort
          </button>
        </div>

        {COURSES.map((course) => (
          <div 
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer active:scale-[0.98] transition-all relative"
          >
            {course.tag && (
              <div className="absolute top-0 right-0 z-10 bg-amber-400 text-black text-[10px] font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                {course.tag}
              </div>
            )}
            <div className="flex p-3 gap-3">
              <div className="w-28 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-100 text-red-600 bg-red-50 mb-1 inline-block uppercase`}>
                    {course.type === 'live' ? 'Live Batch' : 'Recorded'}
                  </span>
                  <h3 className="text-sm font-bold leading-tight line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{course.subtitle}</p>
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-1 text-[10px] text-gray-500">
                    <span className="line-through">₹{course.mrp}</span>
                    <span className="text-green-600 font-bold bg-green-50 px-1 rounded">{course.discount}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">₹{course.price}</span>
                    <span className="text-[10px] text-gray-500">(सिर्फ ₹{course.price})</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">calendar_month</span> {course.startDate ? `Starts ${course.startDate}` : 'Instant Access'}
              </span>
              <button className="text-primary text-xs font-bold">VIEW DETAILS</button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Batches;
