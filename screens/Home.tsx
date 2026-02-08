import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, newsAPI, categoriesAPI } from '../src/services/apiClient';

import { COURSES } from '../constants';

interface NewsItem {
  id: string;
  title: string;
  message: string;
  imageUrl?: string;
  showAsModal?: boolean;
  priority?: string;
  isActive?: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>(COURSES);
  const [categories, setCategories] = useState<any[]>([]);
  const [newsModal, setNewsModal] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev === 0 ? 1 : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await coursesAPI.getAll();
        if (data && data.length > 0) {
          setCourses(data);
        } else {
          setCourses(COURSES);
        }
      } catch (error) {
        console.error('Failed to fetch from MongoDB:', error);
        setCourses(COURSES);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await categoriesAPI.getAll();
        const active = (Array.isArray(data) ? data : []).filter((c: any) => c.isActive);
        setCategories(active);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    const fetchNews = async () => {
      try {
        const newsData = await newsAPI.getAll();
        const modalNews = newsData.find((n: NewsItem) => 
          n.showAsModal && n.isActive !== false
        );
        if (modalNews) {
          const dismissedNews = localStorage.getItem('dismissedNews');
          const dismissed = dismissedNews ? JSON.parse(dismissedNews) : [];
          if (!dismissed.includes(modalNews.id)) {
            setNewsModal(modalNews);
            setShowNewsModal(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchCourses();
    fetchCategories();
    fetchNews();
  }, []);

  const dismissNewsModal = () => {
    if (newsModal) {
      const dismissedNews = localStorage.getItem('dismissedNews');
      const dismissed = dismissedNews ? JSON.parse(dismissedNews) : [];
      dismissed.push(newsModal.id);
      localStorage.setItem('dismissedNews', JSON.stringify(dismissed));
    }
    setShowNewsModal(false);
    setNewsModal(null);
  };

  const handleDownloadAPK = () => {
    const dummyContent = "This is a dummy APK file content for Aone Target Institute.";
    const blob = new Blob([dummyContent], { type: 'application/vnd.android.package-archive' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AoneTarget_v1.0.apk');
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    console.log("APK download initiated...");
  };

  const handleShare = (platform: string) => {
    const shareUrl = "https://aonetarget.com";
    const text = "Check out Aone Target Institute for NEET preparation!";
    
    let url = "";
    switch(platform) {
      case 'fb': url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; break;
      case 'ig': url = `https://www.instagram.com/`; break; // Instagram doesn't support direct URL sharing via web links easily
      case 'yt': url = `https://www.youtube.com/`; break;
      case 'tg': url = `https://t.me/share/url?url=${shareUrl}&text=${text}`; break;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col animate-fade-in pb-4">
      {/* Header */}
      <header className="bg-brandBlue text-white sticky top-0 z-40 shadow-md">
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button className="p-1 rounded-full hover:bg-white/10">
              <span className="material-icons-outlined">menu</span>
            </button>
            <h1 className="text-lg font-bold tracking-wide">Aone Target</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadAPK}
              className="bg-white/20 px-3 py-1 rounded-lg flex items-center gap-1 hover:bg-white/30 transition active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">android</span>
              <span className="text-[10px] font-bold uppercase">APK</span>
            </button>
            <button className="p-1 rounded-full hover:bg-white/10 relative">
              <span className="material-icons-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-brandBlue"></span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 flex space-x-3 overflow-x-auto hide-scrollbar">
          {[
            { label: 'Live', path: '/live-classes' },
            { label: 'Courses', path: '/explore' },
            { label: 'Webinars', path: '/live-classes' },
            { label: 'Tests', path: '/mock-tests' }
          ].map((item, idx) => (
            <button key={idx} onClick={() => navigate(item.path)} className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition active:scale-95">
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-icons-outlined text-gray-400">search</span>
          </span>
          <input 
            className="block w-full pl-10 pr-3 py-3 border-none rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 shadow-sm"
            placeholder="Search for courses, tests..." 
          />
        </div>

        {/* Hero Banner Carousel */}
        <div className="relative w-full overflow-hidden rounded-2xl shadow-lg aspect-[2/1]">
          <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            <div className="w-full flex-shrink-0 h-full bg-white flex items-center justify-center p-4">
              <img src="/attached_assets/download_1770547691033.png" alt="Aone Target Institute" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="w-full flex-shrink-0 h-full bg-gradient-to-r from-blue-50 to-blue-100 relative">
              <div className="absolute inset-0 p-5 z-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-brandRed text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">NEET 2025</span>
                  <span className="text-xs font-semibold text-brandBlue">Admission Open</span>
                </div>
                <h2 className="text-2xl font-bold mb-1 leading-tight text-brandBlue">
                  <span className="text-brandRed">Crack NEET</span> with<br/>Dropper & Crash Course
                </h2>
                <button onClick={() => navigate('/batches')} className="bg-brandBlue text-white w-max px-4 py-2 rounded-full font-bold text-xs mt-3 shadow-lg flex items-center gap-2">
                  Enroll Now <span className="material-icons-outlined text-sm">arrow_forward</span>
                </button>
              </div>
              <div className="absolute right-0 bottom-0 h-full w-1/2 overflow-hidden">
                <img src="/attached_assets/image_1770547866141.png" className="object-cover h-full w-full opacity-60" alt="NEET Course" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            <button onClick={() => setCurrentSlide(0)} className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === 0 ? 'bg-brandBlue w-6' : 'bg-gray-300'}`}></button>
            <button onClick={() => setCurrentSlide(1)} className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === 1 ? 'bg-brandBlue w-6' : 'bg-gray-300'}`}></button>
          </div>
        </div>

        {/* Categories Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">हमारे कोर्सेज (Our Courses)</h2>
            <button onClick={() => navigate('/explore')} className="text-brandBlue text-sm font-semibold">View All</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
             {categories.map((cat, i) => (
               <div 
                 key={cat._id || cat.id || i} 
                 onClick={() => navigate(`/explore/${cat.id}`)}
                 className={`relative p-4 rounded-2xl shadow-md h-36 flex flex-col justify-between text-white bg-gradient-to-br ${cat.gradient || 'from-blue-600 to-indigo-700'} overflow-hidden cursor-pointer active:scale-95 transition-transform`}
               >
                 {cat.imageUrl && (
                   <img src={cat.imageUrl} alt={cat.title} className="absolute inset-0 w-full h-full object-cover" />
                 )}
                 {cat.imageUrl && <div className="absolute inset-0 bg-black/40"></div>}
                 <div className="relative z-10">
                   {cat.tag ? (
                     <span className="bg-white/25 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">{cat.tag}</span>
                   ) : (
                     <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">CATEGORY</span>
                   )}
                 </div>
                 <div className="relative z-10">
                   <h3 className="font-bold text-lg leading-tight">{cat.title}</h3>
                   <span className="text-[10px] opacity-90">{cat.subtitle}</span>
                 </div>
                 <div className="absolute top-3 right-3 w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center z-10">
                   <span className="material-icons-outlined text-white text-xl">{cat.icon}</span>
                 </div>
                 <div className="absolute bottom-4 right-4 h-9 w-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 z-10">
                   <span className="material-icons-outlined text-white text-xl">arrow_forward</span>
                 </div>
               </div>
             ))}
          </div>
        </section>

        {/* Continue Learning */}
        <section className="pb-4">
          <h2 className="text-lg font-bold mb-3">Continue Learning</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex gap-4 items-center cursor-pointer" onClick={() => navigate('/study/neet-2025-physics')}>
            <div className="w-14 h-14 bg-brandRed/10 rounded-lg flex items-center justify-center relative overflow-hidden shrink-0">
               <span className="material-icons-outlined text-brandRed">play_circle</span>
               <div className="absolute bottom-0 left-0 h-1 bg-brandRed w-2/3"></div>
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-gray-400">NEET Biology</span>
              <h4 className="font-bold text-sm">Cell Structure & Functions</h4>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-gray-500">25m remaining</span>
                <button className="text-brandBlue text-xs font-bold flex items-center gap-1">Resume <span className="material-icons-outlined text-xs">play_arrow</span></button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Social Media & APK Section */}
      <div className="px-4 space-y-4 mb-4">
        {/* Social Media Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center gap-3">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Join our Community</p>
          <div className="flex justify-around w-full max-w-[280px]">
            {/* Facebook */}
            <button onClick={() => handleShare('fb')} className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            {/* Instagram */}
            <button onClick={() => handleShare('ig')} className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </button>
            {/* YouTube */}
            <button onClick={() => handleShare('yt')} className="w-12 h-12 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </button>
            {/* Telegram */}
            <button onClick={() => handleShare('tg')} className="w-12 h-12 rounded-full bg-[#26A5E4] flex items-center justify-center text-white shadow-md active:scale-90 transition-transform">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.016 12.016 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.762 5.341-1.07 6.988-.131.699-.383.934-.633.956-.543.05-1.026-.359-1.551-.703-.822-.538-1.286-.872-2.083-1.398-.921-.607-.324-.941.201-1.486.137-.143 2.525-2.316 2.571-2.511a.175.175 0 0 0-.039-.151.19.19 0 0 0-.17-.061c-.104.023-2.61 1.684-7.398 4.918-.7.481-1.334.717-1.901.704-.626-.013-1.83-.353-2.724-.643-.997-.325-1.789-.497-1.72-.816a.544.544 0 0 1 .198-.363c.272-.25.864-.506 1.776-.867 5.541-2.41 9.237-4.001 11.088-4.772.529-.221 1.05-.332 1.564-.334z"/></svg>
            </button>
          </div>
        </div>

        {/* APK Sticky Prompt */}
        <button 
          onClick={handleDownloadAPK}
          className="w-full bg-[#1A237E] text-white rounded-[1.5rem] p-5 flex items-center justify-between shadow-xl active:scale-[0.98] transition-transform border-t border-white/10"
        >
          <div className="flex items-center gap-4">
            <div className="bg-[#414896] p-3 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[32px]">install_mobile</span>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold tracking-tight">Download Official APK</p>
              <p className="text-xs text-blue-200 font-medium opacity-80">Install on your Android device</p>
            </div>
          </div>
          <div className="bg-white/10 p-2 rounded-full">
            <span className="material-symbols-outlined text-white text-[28px]">download</span>
          </div>
        </button>
      </div>

      {/* Global News Modal Popup */}
      {showNewsModal && newsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform animate-scale-in">
            {newsModal.imageUrl && (
              <div className="relative">
                <img 
                  src={newsModal.imageUrl} 
                  alt={newsModal.title}
                  className="w-full h-48 object-cover"
                />
                {newsModal.priority === 'high' && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">priority_high</span>
                    Urgent
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              {!newsModal.imageUrl && newsModal.priority === 'high' && (
                <div className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <span className="material-icons-outlined text-sm align-middle mr-1">priority_high</span>
                  Urgent Notice
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brandBlue to-indigo-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-icons-outlined text-xl">campaign</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800">{newsModal.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">Aone Target Institute</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{newsModal.message}</p>
              <button
                onClick={dismissNewsModal}
                className="w-full bg-gradient-to-r from-brandBlue to-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <span className="material-icons-outlined text-sm">check_circle</span>
                Got it, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
