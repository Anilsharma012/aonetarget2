import React, { useState, useEffect } from 'react';
import { testsAPI, coursesAPI } from '../../src/services/apiClient';

interface Test {
  id: string;
  name: string;
  course: string;
  questions: number;
  status: 'active' | 'inactive' | 'scheduled' | 'draft';
  date: string;
  openDate?: string;
  closeDate?: string;
  duration?: number;
  featured?: boolean;
  totalAttempts?: number;
  avgScore?: number;
}

interface Course {
  id: string;
  title: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Tests: React.FC<Props> = ({ showToast }) => {
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    course: '',
    questions: '',
    duration: '180',
    status: 'draft' as 'active' | 'inactive' | 'scheduled' | 'draft',
    openDate: '',
    closeDate: '',
    featured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [testData, courseData] = await Promise.all([
        testsAPI.getAll(),
        coursesAPI.getAll()
      ]);
      setTests(testData);
      setCourses(courseData);
    } catch (error) {
      console.log('Using sample data...');
      // Sample data for demo
      setTests([
        { id: '1', name: 'FUNDAMENTALS OF CHEMISTRY', course: 'NEET', questions: 50, status: 'active', date: '01-07-2024', openDate: '01-07-2024 10:00 AM', closeDate: '01-07-2024 11:00 AM', duration: 60, featured: true, totalAttempts: 450, avgScore: 72 },
        { id: '2', name: 'FOSET-TEST MOCK TEST 1', course: 'NEET', questions: 180, status: 'active', date: '15-07-2024', openDate: '15-07-2024 02:00 PM', closeDate: '15-07-2024 05:00 PM', duration: 180, featured: false, totalAttempts: 230, avgScore: 65 },
        { id: '3', name: 'NEET MOCK TEST FOR 12 STD', course: 'IIT-JEE', questions: 90, status: 'draft', date: '22-07-2024', openDate: '', closeDate: '', duration: 120, featured: false },
        { id: '4', name: 'TESTING FOR BOARDS', course: 'BOARDS', questions: 100, status: 'scheduled', date: '25-07-2024', openDate: '25-07-2024 03:30 PM', closeDate: '25-07-2024 05:00 PM', duration: 90, featured: true },
        { id: '5', name: 'FREE MOCK TEST FOR NEET 2025', course: 'NEET', questions: 180, status: 'active', date: '27-07-2024', openDate: '27-07-2024 02:00 AM', closeDate: '27-07-2024 03:00 AM', duration: 60, featured: false },
        { id: '6', name: 'FINAL MOCK TEST BATCH 2024', course: 'IIT-JEE', questions: 150, status: 'active', date: '28-07-2024', openDate: '28-07-2024 01:00 PM', closeDate: '28-07-2024 04:00 PM', duration: 180, featured: true },
        { id: '7', name: 'MOCK AIIMS MOCK NEET TEST ST 1', course: 'NEET', questions: 200, status: 'active', date: '30-07-2024', openDate: '30-07-2024 02:00 PM', closeDate: '30-07-2024 05:00 PM', duration: 180 },
        { id: '8', name: 'MOCK AIIMS MOCK NEET TEST ST 2', course: 'NEET', questions: 200, status: 'inactive', date: '01-08-2024', openDate: '01-08-2024 10:00 AM', closeDate: '01-08-2024 01:00 PM', duration: 180 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse = !filterCourse || test.course === filterCourse;
    const matchesStatus = !filterStatus || test.status === filterStatus;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const paginatedTests = filteredTests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (test?: Test) => {
    if (test) {
      setEditingTest(test);
      setFormData({
        name: test.name,
        course: test.course,
        questions: test.questions.toString(),
        duration: test.duration?.toString() || '180',
        status: test.status,
        openDate: test.openDate || '',
        closeDate: test.closeDate || '',
        featured: test.featured || false
      });
    } else {
      setEditingTest(null);
      setFormData({
        name: '',
        course: '',
        questions: '',
        duration: '180',
        status: 'draft',
        openDate: '',
        closeDate: '',
        featured: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTest(null);
    setFormData({
      name: '',
      course: '',
      questions: '',
      duration: '180',
      status: 'draft',
      openDate: '',
      closeDate: '',
      featured: false
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.course || !formData.questions) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const testData = {
        id: editingTest?.id || `test_${Date.now()}`,
        name: formData.name,
        course: formData.course,
        questions: parseInt(formData.questions) || 0,
        duration: parseInt(formData.duration),
        status: formData.status,
        openDate: formData.openDate,
        closeDate: formData.closeDate,
        featured: formData.featured,
        date: editingTest?.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };

      if (editingTest) {
        await testsAPI.update(editingTest.id, testData);
        showToast('Test updated successfully!');
      } else {
        await testsAPI.create(testData);
        showToast('Test created successfully!');
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      showToast('Failed to save test', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await testsAPI.delete(id);
        showToast('Test deleted successfully!');
        loadData();
      } catch (error) {
        showToast('Failed to delete test', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTests.length === 0) return;
    if (confirm(`Delete ${selectedTests.length} selected tests?`)) {
      try {
        await Promise.all(selectedTests.map(id => testsAPI.delete(id)));
        showToast(`${selectedTests.length} tests deleted!`);
        setSelectedTests([]);
        loadData();
      } catch (error) {
        showToast('Failed to delete tests', 'error');
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedTests.length === paginatedTests.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(paginatedTests.map(t => t.id));
    }
  };

  const toggleSelectTest = (id: string) => {
    setSelectedTests(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const toggleFeatured = async (test: Test) => {
    try {
      await testsAPI.update(test.id, { ...test, featured: !test.featured });
      showToast(test.featured ? 'Removed from featured!' : 'Added to featured!');
      loadData();
    } catch (error) {
      showToast('Failed to update test', 'error');
    }
  };

  const toggleStatus = async (test: Test) => {
    const newStatus = test.status === 'active' ? 'inactive' : 'active';
    try {
      await testsAPI.update(test.id, { ...test, status: newStatus });
      showToast(`Test ${newStatus}!`);
      loadData();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const actions = [
    { label: 'Edit Configuration', icon: 'edit', color: 'text-blue-500', action: (t: Test) => openEditModal(t) },
    { label: 'Add Questions Manual', icon: 'add_circle', color: 'text-emerald-500' },
    { label: 'Import from DOCX', icon: 'description', color: 'text-blue-600' },
    { label: 'Import from Excel', icon: 'table_view', color: 'text-green-600' },
    { label: 'Question Re-arrange', icon: 'sort', color: 'text-orange-500' },
    { label: 'Student Analytics', icon: 'analytics', color: 'text-purple-500' },
    { label: 'Duplicate Exam', icon: 'content_copy', color: 'text-cyan-500' },
    { label: 'Take Preview', icon: 'play_arrow', color: 'text-navy' },
    { label: 'Archive Test', icon: 'archive', color: 'text-gray-400' },
    { label: 'Permanently Delete', icon: 'delete', color: 'text-red-500', action: (t: Test) => handleDelete(t.id) }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in relative min-h-[600px]">
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Mock Test Engine</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total: {tests.length} Tests</p>
        </div>
        <button 
          onClick={() => { setEditingTest(null); setFormData({ name: '', course: '', questions: '', duration: '180', status: 'Active' }); setShowModal(true); }}
          className="bg-navy text-white text-[11px] font-black px-8 py-4 rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
        >
          <span className="material-icons-outlined text-sm">add</span> Create New Test
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="p-16 text-center">
          <span className="material-icons-outlined text-6xl text-gray-200">quiz</span>
          <p className="font-black mt-4 uppercase tracking-widest text-gray-400">No Tests Created Yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-6 border-b border-gray-100">Test Title / Date</th>
                <th className="px-8 py-6 border-b border-gray-100">Target Course</th>
                <th className="px-8 py-6 border-b border-gray-100 text-center">Questions</th>
                <th className="px-8 py-6 border-b border-gray-100 text-center">Current Status</th>
                <th className="px-8 py-6 border-b border-gray-100 text-center">Control Panel</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {tests.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-8 py-6">
                    <p className="font-black text-navy uppercase tracking-tight text-sm leading-tight">{t.name}</p>
                    <p className="text-[10px] font-bold text-gray-300 uppercase mt-1">Added on {t.date}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-black text-navy/40 uppercase tracking-widest border border-navy/10 px-3 py-1 rounded-full">{t.course}</span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto border border-gray-100">
                      <span className="font-black text-navy text-base">{t.questions}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                      t.status === 'Active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <div className="flex flex-col items-center gap-2">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === t.id ? null : t.id)}
                        className="bg-orange-500 text-white text-[10px] font-black px-6 py-2.5 rounded-xl uppercase shadow-lg flex items-center gap-2 mx-auto hover:bg-orange-600 hover:-translate-y-0.5 transition-all"
                      >
                        Actions <span className="material-icons-outlined text-xs">expand_more</span>
                      </button>
                      
                      {activeMenu === t.id && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-3xl py-4 z-[100] border border-gray-100 text-left animate-fade-in ring-4 ring-black/5">
                          <div className="max-h-[350px] overflow-y-auto hide-scrollbar">
                            {actions.map((act, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => {
                                  if (act.action) {
                                    act.action(t);
                                  } else {
                                    showToast(`Action "${act.label}" triggered!`);
                                  }
                                  setActiveMenu(null);
                                }}
                                className={`w-full px-6 py-3 flex items-center gap-4 text-[11px] font-bold hover:bg-gray-50 transition-colors ${act.color || 'text-navy'}`}
                              >
                                <span className={`material-icons-outlined text-lg opacity-40`}>{act.icon}</span> 
                                <span className="tracking-tight">{act.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingTest ? 'Edit Test' : 'Create New Test'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Test Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="Target Course"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="No. of Questions"
                  value={formData.questions}
                  onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="number"
                  placeholder="Duration (mins)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              >
                <option value="Active">Active</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-navy text-white py-3 rounded-xl font-black text-xs uppercase"
              >
                {editingTest ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
