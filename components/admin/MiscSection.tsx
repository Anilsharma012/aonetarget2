import React, { useState, useEffect } from 'react';
import { 
  coursesAPI, subjectsAPI, topicsAPI, subcoursesAPI, 
  instructionsAPI, examDocumentsAPI, newsAPI, notificationsAPI 
} from '../../src/services/apiClient';

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

type ModalType = 'courses' | 'subcourses' | 'subjects' | 'topics' | 'instructions' | 'examdocs' | 'news' | 'notifications' | null;

const MiscSection: React.FC<Props> = ({ showToast }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [counts, setCounts] = useState({ courses: 0, subcourses: 0, subjects: 0, topics: 0, instructions: 0, examdocs: 0, news: 0, notifications: 0 });

  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      const [courses, subjects, topics, subcourses, instructions, examdocs, news, notifications] = await Promise.all([
        coursesAPI.getAll().catch(() => []),
        subjectsAPI.getAll().catch(() => []),
        topicsAPI.getAll().catch(() => []),
        subcoursesAPI.getAll().catch(() => []),
        instructionsAPI.getAll().catch(() => []),
        examDocumentsAPI.getAll().catch(() => []),
        newsAPI.getAll().catch(() => []),
        notificationsAPI.getAll().catch(() => [])
      ]);
      setCounts({
        courses: courses.length,
        subcourses: subcourses.length,
        subjects: subjects.length,
        topics: topics.length,
        instructions: instructions.length,
        examdocs: examdocs.length,
        news: news.length,
        notifications: notifications.length
      });
    } catch (error) {
      console.error('Failed to load counts');
    }
  };

  const menuItems = [
    { name: 'Courses', key: 'courses', icon: 'auto_stories', color: 'bg-blue-600', count: counts.courses },
    { name: 'Sub Courses', key: 'subcourses', icon: 'collections_bookmark', color: 'bg-indigo-600', count: counts.subcourses },
    { name: 'Subjects', key: 'subjects', icon: 'science', color: 'bg-purple-600', count: counts.subjects },
    { name: 'Topics', key: 'topics', icon: 'list_alt', color: 'bg-violet-600', count: counts.topics },
    { name: 'Instructions', key: 'instructions', icon: 'help', color: 'bg-pink-600', count: counts.instructions },
    { name: 'Exam Documents', key: 'examdocs', icon: 'folder_shared', color: 'bg-orange-600', count: counts.examdocs },
    { name: 'Global News', key: 'news', icon: 'newspaper', color: 'bg-teal-600', count: counts.news },
    { name: 'Push Notify', key: 'notifications', icon: 'notifications_active', color: 'bg-amber-600', count: counts.notifications },
  ];

  const getAPI = (type: ModalType) => {
    switch (type) {
      case 'courses': return coursesAPI;
      case 'subcourses': return subcoursesAPI;
      case 'subjects': return subjectsAPI;
      case 'topics': return topicsAPI;
      case 'instructions': return instructionsAPI;
      case 'examdocs': return examDocumentsAPI;
      case 'news': return newsAPI;
      case 'notifications': return notificationsAPI;
      default: return null;
    }
  };

  const openModal = async (type: ModalType) => {
    if (!type) return;
    setActiveModal(type);
    setLoading(true);
    try {
      const api = getAPI(type);
      if (api) {
        const data = await api.getAll();
        setItems(data);
      }
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!activeModal) return;
    try {
      const api = getAPI(activeModal);
      if (api) {
        const data = {
          id: `${activeModal}_${Date.now()}`,
          name: formData.name,
          description: formData.description || '',
          ...formData
        };
        await api.create(data);
        showToast('Created successfully!');
        setFormData({});
        openModal(activeModal);
        loadCounts();
      }
    } catch (error) {
      showToast('Failed to create', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!activeModal || !confirm('Are you sure you want to delete this?')) return;
    try {
      const api = getAPI(activeModal);
      if (api) {
        await api.delete(id);
        showToast('Deleted successfully!');
        openModal(activeModal);
        loadCounts();
      }
    } catch (error) {
      showToast('Failed to delete', 'error');
    }
  };

  const getModalTitle = () => {
    const item = menuItems.find(i => i.key === activeModal);
    return item?.name || '';
  };
  
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {menuItems.map(item => (
          <div 
            key={item.name} 
            onClick={() => openModal(item.key as ModalType)}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:border-navy/10 hover:-translate-y-1 transition-all cursor-pointer group"
          >
             <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                <span className="material-icons-outlined text-2xl">{item.icon}</span>
             </div>
             <h4 className="text-sm font-black text-navy uppercase tracking-widest group-hover:text-blue-600 transition-colors">{item.name}</h4>
             <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-[0.2em]">
               {item.count} Items
             </p>
          </div>
        ))}
      </div>

      {activeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-navy uppercase tracking-widest">{getModalTitle()} Manager</h3>
              <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-3">Add New</p>
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 bg-white border border-gray-100 p-3 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex-1 bg-white border border-gray-100 p-3 rounded-xl text-xs font-bold outline-none"
                />
                <button
                  onClick={handleCreate}
                  className="bg-navy text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase"
                >
                  Add
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 opacity-50">
                <span className="material-icons-outlined text-4xl text-gray-300">folder_open</span>
                <p className="text-xs text-gray-400 mt-2">No items yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="text-xs font-black text-navy">{item.name || item.title}</p>
                      {item.description && (
                        <p className="text-[10px] text-gray-400 mt-1">{item.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MiscSection;
