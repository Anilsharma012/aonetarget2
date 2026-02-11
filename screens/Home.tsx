import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, newsAPI, categoriesAPI, bannersAPI, testsAPI, testSeriesAPI, liveVideosAPI } from '../src/services/apiClient';
import StudentSidebar from '../components/StudentSidebar';

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

interface Banner {
  _id?: string;
  id?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  isActive?: boolean;
  order?: number;
}

const categoryIcons: Record<string, string> = {
  'NEET': 'biotech',
  'IIT-JEE': 'calculate',
  'Nursing CET': 'health_and_safety',
  'General Studies': 'menu_book',
  'NDA': 'military_tech',
  'XI': 'school',
  'XII': 'workspace_premium',
};

const categoryGradients: string[] = [
  'from-[#1A237E] to-[#303F9F]',
  'from-[#C62828] to-[#D32F2F]',
  'from-[#00695C] to-[#00897B]',
  'from-[#4A148C] to-[#7B1FA2]',
  'from-[#E65100] to-[#F57C00]',
  'from-[#1565C0] to-[#1E88E5]',
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>(COURSES);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [newsModal, setNewsModal] = useState<NewsItem | null>(null);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [testSeries, setTestSeries] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

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

    const fetchBanners = async () => {
      try {
        const data = await bannersAPI.getAll();
        const activeBanners = (Array.isArray(data) ? data : []).filter((b: any) => b.isActive !== false && b.active !== false);
        if (activeBanners.length > 0) {
          activeBanners.sort((a: Banner, b: Banner) => (a.order || 0) - (b.order || 0));
          setBanners(activeBanners);
        } else {
          setBanners([{ imageUrl: '/attached_assets/download_1770552281686.png', title: 'Aone Target Institute' }]);
        }
      } catch (error) {
        console.error('Failed to fetch banners:', error);
        setBanners([{ imageUrl: '/attached_assets/download_1770552281686.png', title: 'Aone Target Institute' }]);
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

    const fetchLiveClasses = async () => {
      try {
        const data = await liveVideosAPI.getAll();
        setLiveClasses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch live classes:', error);
      }
    };

    const fetchTestSeries = async () => {
      try {
        const data = await testSeriesAPI.getAll();
        setTestSeries(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch test series:', error);
      }
    };

    const fetchAll = () => {
      fetchCourses();
      fetchCategories();
      fetchBanners();
      fetchLiveClasses();
      fetchTestSeries();
    };

    fetchAll();
    fetchNews();

    const refreshInterval = setInterval(fetchAll, 120000);
    return () => clearInterval(refreshInterval);
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
  };

  const handleShare = (platform: string) => {
    const shareUrl = "https://aonetarget.com";
    const text = "Check out Aone Target Institute for NEET preparation!";
    
    let url = "";
    switch(platform) {
      case 'fb': url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; break;
      case 'ig': url = `https://www.instagram.com/`; break;
      case 'yt': url = `https://www.youtube.com/`; break;
      case 'tg': url = `https://t.me/share/url?url=${shareUrl}&text=${text}`; break;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col animate-fade-in pb-4">
      <header className="sticky top-0 z-40 shadow-lg" style={{ background: 'linear-gradient(135deg, #1A237E 0%, #303F9F 50%, #1A237E 100%)' }}>
        <div className="px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-xl hover:bg-white/10 transition-colors active:scale-90">
              <span className="material-icons-outlined text-white">menu</span>
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/attached_assets/alonelogo_1770810181717.jpg" 
                alt="Aone Target" 
                className="h-9 object-contain rounded"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadAPK}
              className="bg-white/15 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-1.5 hover:bg-white/25 transition-all active:scale-95 border border-white/20"
            >
              <span className="material-symbols-outlined text-white text-[18px]">android</span>
              <span className="text-[11px] font-bold uppercase text-white tracking-wider">APK</span>
            </button>
            <button className="p-2 rounded-xl hover:bg-white/10 transition-colors relative">
              <span className="material-icons-outlined text-white">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D32F2F] rounded-full border-2 border-[#1A237E] animate-pulse"></span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 flex space-x-2.5 overflow-x-auto hide-scrollbar">
          {[
            { label: 'Live', icon: 'sensors', path: '/live-classes' },
            { label: 'Courses', icon: 'school', path: '/explore' },
            { label: 'Webinars', icon: 'videocam', path: '/live-classes' },
            { label: 'Tests', icon: 'quiz', path: '/mock-tests' }
          ].map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => navigate(item.path)} 
              className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold text-white whitespace-nowrap transition-all active:scale-95 hover:bg-white/25 border border-white/15"
            >
              <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons-outlined text-gray-400 text-xl">search</span>
          </span>
          <input 
            className="block w-full pl-12 pr-4 py-3.5 border-none rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 shadow-[0_2px_15px_rgba(0,0,0,0.06)] focus:shadow-[0_4px_20px_rgba(26,35,126,0.15)] focus:ring-2 focus:ring-[#303F9F]/20 transition-all outline-none"
            placeholder="Search for courses, tests..." 
          />
        </div>

        {banners.length > 0 && (
          <div className="relative w-full overflow-hidden rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] aspect-[2/1]">
            <div className="flex transition-transform duration-700 ease-in-out h-full" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
              {banners.map((banner, index) => (
                <div key={banner._id || banner.id || index} className="w-full flex-shrink-0 h-full bg-gradient-to-br from-[#1A237E] to-[#303F9F] flex items-center justify-center">
                  {banner.imageUrl ? (
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.title || `Banner ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onClick={() => banner.linkUrl && navigate(banner.linkUrl)}
                      style={{ cursor: banner.linkUrl ? 'pointer' : 'default' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#1A237E] to-[#303F9F] flex items-center justify-center p-4">
                      <div className="text-center text-white">
                        <h3 className="text-xl font-bold">{banner.title}</h3>
                        {banner.subtitle && <p className="text-sm opacity-80 mt-1">{banner.subtitle}</p>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, index) => (
                  <button 
                    key={index}
                    onClick={() => setCurrentSlide(index)} 
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white w-7 shadow-lg' : 'bg-white/50 w-2'}`}
                  ></button>
                ))}
              </div>
            )}
          </div>
        )}

        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-800">Our Courses</h2>
              <p className="text-xs text-gray-400 mt-0.5">Explore top categories</p>
            </div>
            <button onClick={() => navigate('/explore')} className="text-[#1A237E] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all bg-[#1A237E]/5 px-4 py-2 rounded-xl">
              View All
              <span className="material-icons-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
             {categories.map((cat, i) => (
               <div 
                 key={cat._id || cat.id || i} 
                 onClick={() => navigate(`/explore/${cat.id}`)}
                 className={`relative p-4 rounded-2xl h-36 flex flex-col justify-between text-white bg-gradient-to-br ${cat.gradient || categoryGradients[i % categoryGradients.length]} overflow-hidden cursor-pointer active:scale-[0.97] transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 group`}
               >
                 {cat.imageUrl && (
                   <img src={cat.imageUrl} alt={cat.title} className="absolute inset-0 w-full h-full object-cover" />
                 )}
                 {cat.imageUrl && <div className="absolute inset-0 bg-black/40"></div>}
                 <div className="relative z-10 flex justify-between items-start">
                   {cat.tag ? (
                     <span className="bg-white/25 backdrop-blur-sm text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{cat.tag}</span>
                   ) : (
                     <span className="bg-white/20 backdrop-blur-sm text-[8px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">COURSE</span>
                   )}
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                     <span className="material-symbols-outlined text-white text-xl">{cat.icon || categoryIcons[cat.title] || 'auto_stories'}</span>
                   </div>
                 </div>
                 <div className="relative z-10">
                   <h3 className="font-bold text-lg leading-tight">{cat.title}</h3>
                   <span className="text-[10px] opacity-80 font-medium">{cat.subtitle}</span>
                 </div>
                 <div className="absolute bottom-3 right-3 h-9 w-9 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 z-10 group-hover:bg-white/40 group-hover:scale-110 transition-all duration-300">
                   <span className="material-icons-outlined text-white text-lg">arrow_forward</span>
                 </div>
               </div>
             ))}
          </div>
        </section>

        <section className="pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-gradient-to-b from-[#D32F2F] to-[#1A237E] rounded-full"></div>
            <h2 className="text-xl font-extrabold text-gray-800">Continue Learning</h2>
          </div>
          <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 dark:border-gray-700 flex gap-4 items-center cursor-pointer hover:shadow-[0_8px_30px_rgba(26,35,126,0.12)] hover:-translate-y-0.5 transition-all duration-300 group" 
            onClick={() => navigate('/study/neet-2025-physics')}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-[#D32F2F]/10 to-[#D32F2F]/20 rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 group-hover:from-[#D32F2F]/20 group-hover:to-[#D32F2F]/30 transition-all">
               <span className="material-symbols-outlined text-[#D32F2F] text-3xl">play_circle</span>
               <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#D32F2F] to-[#1A237E] w-2/3 rounded-full"></div>
            </div>
            <div className="flex-1">
              <span className="text-[10px] uppercase font-bold text-[#1A237E] tracking-wider bg-[#1A237E]/5 px-2 py-0.5 rounded-full inline-block">NEET Biology</span>
              <h4 className="font-bold text-base mt-1 text-gray-800">Cell Structure & Functions</h4>
              <div className="flex justify-between items-center mt-1.5">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <span className="material-icons-outlined text-[12px]">schedule</span>
                  25m remaining
                </span>
                <button className="text-[#1A237E] text-xs font-bold flex items-center gap-1 bg-[#1A237E]/5 px-3 py-1.5 rounded-lg group-hover:bg-[#1A237E] group-hover:text-white transition-all">
                  Resume 
                  <span className="material-icons-outlined text-xs">play_arrow</span>
                </button>
              </div>
            </div>
          </div>
        </section>
        {liveClasses.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#D32F2F] to-[#1A237E] rounded-full"></div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">Live Classes</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Join upcoming sessions</p>
                </div>
              </div>
              <button onClick={() => navigate('/live-classes')} className="text-[#1A237E] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all bg-[#1A237E]/5 px-4 py-2 rounded-xl">
                View All
                <span className="material-icons-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-3">
              {liveClasses.slice(0, 4).map((lc: any, i: number) => (
                <div key={lc._id || lc.id || i} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 dark:border-gray-700 flex gap-4 items-center hover:shadow-[0_8px_30px_rgba(26,35,126,0.12)] hover:-translate-y-0.5 transition-all duration-300 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#D32F2F] to-[#C62828] rounded-2xl flex items-center justify-center shrink-0 relative">
                    <span className="material-symbols-outlined text-white text-2xl">sensors</span>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{lc.title || lc.name || 'Live Class'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">person</span>
                        {lc.teacherName || lc.instructor || 'Instructor'}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {lc.scheduledTime ? new Date(lc.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : lc.time || 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/live-classes'); }}
                    className="bg-[#D32F2F] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-[#C62828] active:scale-95 transition-all shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">videocam</span>
                    Join
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {testSeries.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#303F9F] to-[#1A237E] rounded-full"></div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">Popular Test Series</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Practice & improve your score</p>
                </div>
              </div>
              <button onClick={() => navigate('/mock-tests')} className="text-[#1A237E] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all bg-[#1A237E]/5 px-4 py-2 rounded-xl">
                View All
                <span className="material-icons-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {testSeries.slice(0, 4).map((ts: any, i: number) => (
                <div 
                  key={ts._id || ts.id || i}
                  onClick={() => navigate('/mock-tests')}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 dark:border-gray-700 cursor-pointer hover:shadow-[0_8px_30px_rgba(26,35,126,0.12)] hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-[#1A237E]/10 to-[#303F9F]/20 rounded-xl flex items-center justify-center mb-3 group-hover:from-[#1A237E]/20 group-hover:to-[#303F9F]/30 transition-all">
                    <span className="material-symbols-outlined text-[#1A237E] text-xl">quiz</span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-800 leading-tight line-clamp-2">{ts.title || ts.name || 'Test Series'}</h4>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="material-symbols-outlined text-[12px] text-gray-400">subject</span>
                    <span className="text-[11px] text-gray-400">{ts.subject || ts.category || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">description</span>
                      {ts.totalTests || ts.tests?.length || 0} Tests
                    </span>
                    {(ts.price !== undefined && ts.price !== null) && (
                      <span className="text-xs font-bold text-[#1A237E] bg-[#1A237E]/5 px-2 py-0.5 rounded-full">
                        {ts.price === 0 ? 'Free' : `₹${ts.price}`}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {courses.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-[#1A237E] to-[#303F9F] rounded-full"></div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">Featured Batches</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Enroll in top batches</p>
                </div>
              </div>
              <button onClick={() => navigate('/explore')} className="text-[#1A237E] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all bg-[#1A237E]/5 px-4 py-2 rounded-xl">
                View All
                <span className="material-icons-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-3">
              {courses.slice(0, 4).map((course: any, i: number) => (
                <div 
                  key={course._id || course.id || i}
                  onClick={() => navigate(`/course/${course._id || course.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100/80 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-[0_8px_30px_rgba(26,35,126,0.12)] hover:-translate-y-0.5 transition-all duration-300 group flex"
                >
                  <div className={`w-24 h-24 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} flex items-center justify-center shrink-0`}>
                    {course.imageUrl || course.thumbnail ? (
                      <img src={course.imageUrl || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-white text-3xl">school</span>
                    )}
                  </div>
                  <div className="flex-1 p-3 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{course.title || course.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{course.description || course.subtitle || ''}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">group</span>
                        {course.enrollmentCount || course.students || 0} enrolled
                      </span>
                      {(course.price !== undefined && course.price !== null) && (
                        <span className="text-xs font-bold text-[#D32F2F]">
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pr-3">
                    <div className="w-8 h-8 bg-[#1A237E]/5 rounded-full flex items-center justify-center group-hover:bg-[#1A237E] group-hover:text-white transition-all">
                      <span className="material-icons-outlined text-[#1A237E] text-sm group-hover:text-white">arrow_forward</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="px-4 space-y-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100/80 flex flex-col items-center gap-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">Join our Community</p>
          <div className="flex justify-around w-full max-w-[300px]">
            {[
              { platform: 'fb', bg: '#1877F2', hoverShadow: 'hover:shadow-[0_0_20px_rgba(24,119,242,0.5)]', icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { platform: 'ig', bg: 'linear-gradient(135deg, #f9ce34, #ee2a7b, #6228d7)', hoverShadow: 'hover:shadow-[0_0_20px_rgba(238,42,123,0.5)]', icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
              { platform: 'yt', bg: '#FF0000', hoverShadow: 'hover:shadow-[0_0_20px_rgba(255,0,0,0.5)]', icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> },
              { platform: 'tg', bg: '#26A5E4', hoverShadow: 'hover:shadow-[0_0_20px_rgba(38,165,228,0.5)]', icon: <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12.016 12.016 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.762 5.341-1.07 6.988-.131.699-.383.934-.633.956-.543.05-1.026-.359-1.551-.703-.822-.538-1.286-.872-2.083-1.398-.921-.607-.324-.941.201-1.486.137-.143 2.525-2.316 2.571-2.511a.175.175 0 0 0-.039-.151.19.19 0 0 0-.17-.061c-.104.023-2.61 1.684-7.398 4.918-.7.481-1.334.717-1.901.704-.626-.013-1.83-.353-2.724-.643-.997-.325-1.789-.497-1.72-.816a.544.544 0 0 1 .198-.363c.272-.25.864-.506 1.776-.867 5.541-2.41 9.237-4.001 11.088-4.772.529-.221 1.05-.332 1.564-.334z"/></svg> },
            ].map((s, i) => (
              <button 
                key={i}
                onClick={() => handleShare(s.platform)} 
                className={`w-13 h-13 rounded-2xl flex items-center justify-center text-white shadow-md active:scale-90 transition-all duration-300 ${s.hoverShadow} hover:scale-110 hover:-translate-y-1`}
                style={{ background: s.bg, width: '52px', height: '52px' }}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleDownloadAPK}
          className="w-full text-white rounded-2xl p-5 flex items-center justify-between shadow-[0_4px_20px_rgba(26,35,126,0.3)] active:scale-[0.98] transition-all duration-200 hover:shadow-[0_8px_30px_rgba(26,35,126,0.4)] border border-white/10"
          style={{ background: 'linear-gradient(135deg, #1A237E 0%, #303F9F 100%)' }}
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-xl flex items-center justify-center border border-white/15">
              <span className="material-symbols-outlined text-white text-[28px]">install_mobile</span>
            </div>
            <div className="text-left">
              <p className="text-lg font-bold tracking-tight">Download Official APK</p>
              <p className="text-xs text-blue-200 font-medium opacity-80">Install on your Android device</p>
            </div>
          </div>
          <div className="bg-white/15 p-2.5 rounded-full border border-white/20">
            <span className="material-symbols-outlined text-white text-[24px]">download</span>
          </div>
        </button>
      </div>

      <StudentSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        student={null}
      />

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
                  <div className="absolute top-3 left-3 bg-[#D32F2F] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="material-icons-outlined text-sm">priority_high</span>
                    Urgent
                  </div>
                )}
              </div>
            )}
            <div className="p-6">
              {!newsModal.imageUrl && newsModal.priority === 'high' && (
                <div className="inline-block bg-red-100 text-[#D32F2F] text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <span className="material-icons-outlined text-sm align-middle mr-1">priority_high</span>
                  Urgent Notice
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A237E] to-[#303F9F] rounded-xl flex items-center justify-center text-white flex-shrink-0">
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
                className="w-full text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #1A237E 0%, #303F9F 100%)' }}
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
