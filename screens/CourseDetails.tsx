
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { COURSES, INSTRUCTORS, CURRICULUM } from '../constants';

const CourseDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = COURSES.find(c => c.id === id) || COURSES[0];

  return (
    <div className="bg-[#F3F4F6] pb-32 animate-fade-in min-h-screen">
      <header className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/10">
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <h1 className="text-lg font-semibold truncate px-2 flex-1 text-center">{course.title}</h1>
          <button className="p-1 rounded-full hover:bg-white/10 relative">
            <span className="material-icons-outlined">shopping_cart</span>
            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border border-primary"></span>
          </button>
        </div>
      </header>

      <main>
        {/* Video Preview */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          <img src={course.image} className="w-full h-full object-cover opacity-80" alt="Preview" />
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-white/20 backdrop-blur-sm border border-white/50 rounded-full p-4 hover:scale-105 transition">
              <span className="material-icons-outlined text-white text-4xl">play_arrow</span>
            </button>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">Preview</div>
        </div>

        {/* Info Block */}
        <div className="bg-white p-5 rounded-b-2xl shadow-sm mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="bg-brandRed/10 text-brandRed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Live Batch</div>
            <div className="flex items-center text-yellow-500 text-xs font-medium">
              <span className="material-icons-outlined text-base mr-1">star</span> 4.8 (1.2k)
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2 leading-tight">{course.title}</h2>
          <p className="text-gray-500 text-xs mb-4">
            Master the complete syllabus with Aone Target Institute's expert faculty. Dedicated doubt sessions and mock tests included.
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center"><span className="material-icons-outlined text-sm mr-1">language</span> Hinglish</span>
            <span className="flex items-center"><span className="material-icons-outlined text-sm mr-1">schedule</span> 12 Months</span>
            <span className="flex items-center"><span className="material-icons-outlined text-sm mr-1">verified</span> Cert.</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['#NEET2026', '#Biology', '#MockTests'].map(tag => (
              <span key={tag} className="bg-gray-100 text-[10px] text-gray-500 px-2 py-1 rounded border border-gray-200">{tag}</span>
            ))}
          </div>
        </div>

        {/* Learning Points */}
        <div className="bg-white p-5 mb-4 shadow-sm">
          <h3 className="font-bold text-base mb-4 flex items-center">
            <span className="w-1 h-5 bg-primary rounded-r mr-3"></span>
            आप क्या सीखेंगे (What you will learn)
          </h3>
          <ul className="space-y-3">
            {[
              "पीसीबी (भौतिकी, रसायन, जीव विज्ञान) के लिए दैनिक लाइव कक्षाएं",
              "500+ रिकॉर्डेड वीडियो लेक्चर्स तक पहुंच",
              "विश्लेषण के साथ 20+ फुल-लेंथ मॉक टेस्ट",
              "पीडीएफ नोट्स और डीपीपी (दैनिक अभ्यास समस्याएं)"
            ].map((text, i) => (
              <li key={i} className="flex items-start">
                <span className="material-icons-outlined text-green-500 mr-2 text-lg">check_circle</span>
                <span className="text-xs text-gray-600">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructors */}
        <div className="bg-white p-5 mb-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-base flex items-center">
               <span className="w-1 h-5 bg-primary rounded-r mr-3"></span> Instructors
             </h3>
             <button className="text-primary text-xs font-bold">View All</button>
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-2">
            {INSTRUCTORS.map((ins, i) => (
              <div key={i} className="min-w-[130px] bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <img src={ins.image} className="w-16 h-16 rounded-full mx-auto object-cover mb-2 border-2 border-primary" alt={ins.name} />
                <h4 className="font-bold text-xs truncate">{ins.name}</h4>
                <p className="text-[10px] text-gray-400">{ins.role}</p>
                <div className="mt-2 text-[10px] bg-white border border-gray-100 rounded-full py-0.5 px-2 inline-block shadow-sm">{ins.experience}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Curriculum */}
        <div className="bg-white p-5 mb-8 shadow-sm">
           <h3 className="font-bold text-base mb-4 flex items-center">
             <span className="w-1 h-5 bg-primary rounded-r mr-3"></span> Course Curriculum
           </h3>
           <div className="space-y-3">
             {CURRICULUM.map((item) => (
               <div key={item.id} className={`border border-gray-100 rounded-xl overflow-hidden ${item.locked ? 'opacity-60' : ''}`}>
                 <div className="bg-gray-50 p-3 flex justify-between items-center cursor-pointer">
                   <div className="flex items-center">
                     <span className={`material-icons-outlined mr-3 ${item.locked ? 'text-gray-400' : 'text-primary'}`}>
                       {item.locked ? 'lock' : 'folder'}
                     </span>
                     <div>
                       <p className={`font-bold text-xs ${item.locked ? 'text-gray-500' : ''}`}>{item.title}</p>
                       <p className="text-[10px] text-gray-400">{item.lessons} Lessons • {item.duration}</p>
                     </div>
                   </div>
                   {!item.locked && <span className="material-icons-outlined text-gray-400">expand_more</span>}
                 </div>
               </div>
             ))}
           </div>
           <button className="w-full mt-4 text-primary text-xs font-bold py-2">View All Syllabus</button>
        </div>
      </main>

      {/* Buy Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 shadow-xl z-50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 line-through">₹{course.mrp}</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-navy">₹{course.price}</span>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1 py-0.5 rounded">{course.discount}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-1">
            <button className="flex-1 bg-white text-brandRed border border-brandRed font-bold py-2.5 rounded-xl text-xs">Add to Cart</button>
            <button onClick={() => navigate(`/checkout/${course.id}`)} className="flex-1 bg-navy text-white font-bold py-2.5 rounded-xl text-xs flex flex-col items-center justify-center leading-tight">
              <span>Buy Now</span>
              <span className="text-[8px] opacity-80 font-normal">अभी खरीदें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
