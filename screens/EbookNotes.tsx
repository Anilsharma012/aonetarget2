import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../components/StudentSidebar';

const EbookNotes: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const storedStudent = localStorage.getItem('studentData');
    if (storedStudent) {
      const studentData = JSON.parse(storedStudent);
      setStudent(studentData);
      fetchEbooks();
    } else {
      navigate('/student-login');
    }
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await fetch('/api/ebooks');
      const data = await response.json();
      setEbooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'bolt';
      case 'chemistry': return 'science';
      case 'biology': return 'biotech';
      default: return 'menu_book';
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject?.toLowerCase()) {
      case 'physics': return 'from-blue-500 to-blue-700';
      case 'chemistry': return 'from-green-500 to-green-700';
      case 'biology': return 'from-orange-500 to-orange-700';
      default: return 'from-purple-500 to-purple-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <StudentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} student={student} />

      <header className="bg-gradient-to-r from-teal-600 to-[#00695C] text-white pt-8 pb-6 px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">menu</span>
          </button>
          <h1 className="text-lg font-bold">E-Book Notes</h1>
        </div>
      </header>

      <div className="p-4">
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6 overflow-x-auto">
          {['all', 'physics', 'chemistry', 'biology'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="material-symbols-rounded animate-spin text-4xl text-teal-600">progress_activity</span>
          </div>
        ) : ebooks.filter(e => activeTab === 'all' || e.subject?.toLowerCase() === activeTab).length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {ebooks
              .filter(e => activeTab === 'all' || e.subject?.toLowerCase() === activeTab)
              .map((ebook, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className={`h-24 bg-gradient-to-br ${getSubjectColor(ebook.subject)} flex items-center justify-center`}>
                    <span className="material-symbols-rounded text-white text-4xl">{getSubjectIcon(ebook.subject)}</span>
                  </div>
                  <div className="p-3">
                    <h4 className="font-bold text-xs line-clamp-2">{ebook.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">{ebook.pages || 0} pages</p>
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 bg-teal-600 text-white py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
                        <span className="material-symbols-rounded text-sm">visibility</span>
                        View
                      </button>
                      <button className="px-3 bg-gray-100 text-gray-600 py-1.5 rounded-lg">
                        <span className="material-symbols-rounded text-sm">download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <span className="material-symbols-rounded text-6xl text-gray-300">menu_book</span>
            <p className="text-sm text-gray-400 mt-4">No e-books available</p>
            <p className="text-[10px] text-gray-300 mt-1">Check back later for study materials</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EbookNotes;
