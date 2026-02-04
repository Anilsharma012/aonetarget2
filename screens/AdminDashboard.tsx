import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/admin/Dashboard';
import MiscSection from '../components/admin/MiscSection';
import Students from '../components/admin/Students';
import Store from '../components/admin/Store';
import Institute from '../components/admin/Institute';
import Questions from '../components/admin/Questions';
import Passages from '../components/admin/Passages';
import Tests from '../components/admin/Tests';
import SubjectiveTest from '../components/admin/SubjectiveTest';
import TestSeries from '../components/admin/TestSeries';
import AllReports from '../components/admin/AllReports';
import Videos from '../components/admin/Videos';
import VideoSeries from '../components/admin/VideoSeries';
import LiveVideos from '../components/admin/LiveVideos';
import PDFs from '../components/admin/PDFs';
import Packages from '../components/admin/Packages';
import Messages from '../components/admin/Messages';
import Blog from '../components/admin/Blog';
import Settings from '../components/admin/Settings';
import Banners from '../components/admin/Banners';
import Buyers from '../components/admin/shopping/Buyers';
import Tokens from '../components/admin/shopping/Tokens';
import Coupons from '../components/admin/shopping/Coupons';

export type AdminView = 'dashboard' | 'students' | 'buyers' | 'tokens' | 'coupons' | 'store' | 'institute' | 'questions' | 'question-bank' | 'passages' | 'tests' | 'subjective-test' | 'test-series' | 'all-reports' | 'videos' | 'video-series' | 'live-videos' | 'pdfs' | 'packages' | 'messages' | 'blog' | 'settings' | 'banners' | 'courses' | 'subcourses' | 'subjects' | 'topics' | 'instructions' | 'exam-documents' | 'global-news' | 'push-notifications';

interface Props {
  setAuth: (val: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  submenu?: { id: AdminView; label: string; icon: string }[];
}

const AdminDashboard: React.FC<Props> = ({ setAuth }) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', color: 'text-blue-400' },
    { id: 'misc', label: 'Misc Manager', icon: 'category', color: 'text-purple-400' },
    { id: 'students', label: 'Students', icon: 'people', color: 'text-orange-400' },
    {
      id: 'shopping',
      label: 'Shopping Hub',
      icon: 'shopping_cart',
      color: 'text-pink-400',
      submenu: [
        { id: 'buyers', label: 'Buyers List', icon: 'person' },
        { id: 'tokens', label: 'Tokens', icon: 'card_giftcard' },
        { id: 'coupons', label: 'Coupons', icon: 'local_offer' }
      ]
    },
    { id: 'store', label: 'Package Store', icon: 'store', color: 'text-emerald-400' },
    { id: 'institute', label: 'Institute Profile', icon: 'business', color: 'text-cyan-400' },
    {
      id: 'questions',
      label: 'Manage Questions',
      icon: 'help_outline',
      color: 'text-amber-400',
      submenu: [
        { id: 'questions', label: 'Question List', icon: 'list' },
        { id: 'question-bank', label: 'Question Bank', icon: 'library_books' },
        { id: 'passages', label: 'Passages', icon: 'article' }
      ]
    },
    {
      id: 'tests',
      label: 'Manage Test',
      icon: 'quiz',
      color: 'text-red-400',
      submenu: [
        { id: 'tests', label: 'Test', icon: 'assignment' },
        { id: 'subjective-test', label: 'Subjective Test', icon: 'description' },
        { id: 'test-series', label: 'Test Series', icon: 'playlist_add' },
        { id: 'all-reports', label: 'All Reports', icon: 'assessment' }
      ]
    },
    {
      id: 'videos',
      label: 'Video Library',
      icon: 'play_circle',
      color: 'text-indigo-400',
      submenu: [
        { id: 'videos', label: 'Videos', icon: 'video_library' },
        { id: 'video-series', label: 'Video Series', icon: 'playlist_play' }
      ]
    },
    { id: 'live-videos', label: 'Live Sessions', icon: 'live_tv', color: 'text-rose-500' },
    { id: 'pdfs', label: 'Manage PDFs', icon: 'picture_as_pdf', color: 'text-red-500' },
    { id: 'packages', label: 'Batches/Pkgs', icon: 'inventory_2', color: 'text-teal-400' },
    { id: 'messages', label: 'Messages', icon: 'chat', color: 'text-sky-400' },
    { id: 'blog', label: 'Blog Posts', icon: 'article', color: 'text-lime-400' },
    { id: 'settings', label: 'System Settings', icon: 'settings', color: 'text-gray-400' },
    { id: 'banners', label: 'App Banners', icon: 'view_carousel', color: 'text-violet-400' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setAuth(false);
    navigate('/admin-login');
  };

  const renderContent = () => {
    const props = { showToast };
    switch (activeView) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'misc': return <MiscSection {...props} />;
      case 'students': return <Students {...props} />;
      case 'buyers': return <Buyers {...props} />;
      case 'tokens': return <Tokens {...props} />;
      case 'coupons': return <Coupons {...props} />;
      case 'store': return <Store {...props} />;
      case 'institute': return <Institute {...props} />;
      case 'questions': return <Questions {...props} />;
      case 'question-bank': return <Questions {...props} view="bank" />;
      case 'passages': return <Passages {...props} />;
      case 'tests': return <Tests {...props} />;
      case 'subjective-test': return <SubjectiveTest {...props} />;
      case 'test-series': return <TestSeries {...props} />;
      case 'all-reports': return <AllReports {...props} />;
      case 'videos': return <Videos {...props} />;
      case 'video-series': return <VideoSeries {...props} />;
      case 'live-videos': return <LiveVideos {...props} />;
      case 'pdfs': return <PDFs {...props} />;
      case 'packages': return <Packages {...props} />;
      case 'messages': return <Messages {...props} />;
      case 'blog': return <Blog {...props} />;
      case 'settings': return <Settings {...props} />;
      case 'banners': return <Banners {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F2F5] overflow-hidden font-sans text-navy">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl animate-fade-in flex items-center gap-3 border ${toast.type === 'success' ? 'bg-white border-green-100 text-green-600' : 'bg-white border-red-100 text-red-600'}`}>
          <span className="material-icons-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-navy text-white transition-all duration-300 flex flex-col shadow-2xl z-50 shrink-0`}>
        <div className="p-5 flex items-center gap-3 border-b border-white/10 shrink-0">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
             <span className="text-navy font-black text-xl italic">A1</span>
          </div>
          {isSidebarOpen && <h1 className="font-black text-sm tracking-tight truncate uppercase">Aone Admin</h1>}
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-4 px-2 space-y-0.5">
           {menuItems.map((item) => (
             <div key={item.id}>
               <button
                 onClick={() => {
                   if (item.submenu) {
                     setExpandedMenu(expandedMenu === item.id ? null : item.id);
                   } else {
                     setActiveView(item.id as AdminView);
                   }
                 }}
                 className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group relative ${
                   activeView === item.id || expandedMenu === item.id ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white'
                 }`}
               >
                 {(activeView === item.id || expandedMenu === item.id) && <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-blue-400 rounded-r-full shadow-[0_0_15px_rgba(96,165,250,0.5)]"></div>}
                 <span className={`material-icons-outlined text-xl transition-colors ${activeView === item.id || expandedMenu === item.id ? item.color : 'group-hover:text-white/80'}`}>{item.icon}</span>
                 {isSidebarOpen && <span className="text-[12px] font-bold tracking-tight truncate flex-1 text-left">{item.label}</span>}
                 {isSidebarOpen && item.submenu && (
                   <span className={`material-icons-outlined text-sm transition-transform ${expandedMenu === item.id ? 'rotate-180' : ''}`}>expand_more</span>
                 )}
               </button>

               {item.submenu && expandedMenu === item.id && isSidebarOpen && (
                 <div className="pl-4 mt-1 space-y-1">
                   {item.submenu.map((subitem) => (
                     <button
                       key={subitem.id}
                       onClick={() => setActiveView(subitem.id)}
                       className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
                         activeView === subitem.id
                           ? 'bg-white/20 text-white'
                           : 'text-white/50 hover:text-white hover:bg-white/10'
                       }`}
                     >
                       <span className="material-icons-outlined text-sm">{subitem.icon}</span>
                       <span className="truncate">{subitem.label}</span>
                     </button>
                   ))}
                 </div>
               )}
             </div>
           ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
           <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 text-white/40 hover:text-white hover:bg-red-500/10 rounded-xl transition-all group">
              <span className="material-icons-outlined text-xl group-hover:text-red-400">logout</span>
              {isSidebarOpen && <span className="text-[13px] font-black uppercase tracking-widest">Sign Out</span>}
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-40 shadow-sm">
           <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-navy transition-all shadow-inner border border-gray-200/50">
                 <span className="material-icons-outlined text-xl">{isSidebarOpen ? 'menu_open' : 'menu'}</span>
              </button>
              <div className="flex flex-col">
                 <h2 className="text-sm font-black text-navy uppercase tracking-widest leading-none">
                    {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
                 </h2>
                 <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-1">Management Root / {activeView}</p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2 group focus-within:ring-4 focus-within:ring-navy/5 transition-all">
                 <span className="material-icons-outlined text-gray-400 text-lg mr-3">search</span>
                 <input type="text" placeholder="Global search..." className="bg-transparent text-xs font-bold outline-none border-none p-0 w-40" />
              </div>
              <div className="h-8 w-px bg-gray-100"></div>
              <div className="flex items-center gap-4 cursor-pointer group">
                 <div className="text-right hidden sm:block">
                    <p className="text-[11px] font-black text-navy leading-none group-hover:text-blue-600 transition-colors">Er. Deepak Sir</p>
                    <p className="text-[8px] font-bold text-green-500 uppercase mt-0.5 tracking-widest">Master Admin</p>
                 </div>
                 <div className="relative">
                    <img src="https://i.pravatar.cc/150?u=admin-deepak" className="w-11 h-11 rounded-2xl border-2 border-white shadow-xl group-hover:scale-105 transition-transform" alt="Admin" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                 </div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F8F9FA] min-h-0">
           <div className="h-full">
             {renderContent()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
