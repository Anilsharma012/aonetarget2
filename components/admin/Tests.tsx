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
        testsAPI.getAll().catch(() => []),
        coursesAPI.getAll().catch(() => [])
      ]);
      setTests(Array.isArray(testData) ? testData : []);
      setCourses(Array.isArray(courseData) ? courseData : []);
    } catch (error) {
      console.log('Starting with empty state - MongoDB may not have data yet');
      setTests([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredTests = tests.filter(test => {
    const matchesSearch = !searchQuery || (test.name && test.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCourse = !filterCourse || (test.course === filterCourse);
    const matchesStatus = !filterStatus || (test.status === filterStatus);
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
        // Update existing test in API and state
        await testsAPI.update(editingTest.id, testData);
        setTests(tests.map(t => t.id === editingTest.id ? testData : t));
        showToast('Test updated successfully!');
      } else {
        // Add new test to API and state
        await testsAPI.create(testData);
        setTests([...tests, testData]);
        showToast('Test created successfully!');
      }

      handleCloseModal();
    } catch (error) {
      showToast('Failed to save test', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      try {
        await testsAPI.delete(id);
        setTests(tests.filter(t => t.id !== id));
        showToast('Test deleted successfully!');
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
        setTests(tests.filter(t => !selectedTests.includes(t.id)));
        setSelectedTests([]);
        showToast(`${selectedTests.length} tests deleted!`);
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
      const updatedTest = { ...test, featured: !test.featured };
      await testsAPI.update(test.id, updatedTest);
      setTests(tests.map(t => t.id === test.id ? updatedTest : t));
      showToast(test.featured ? 'Removed from featured!' : 'Added to featured!');
    } catch (error) {
      showToast('Failed to update test', 'error');
    }
  };

  const toggleStatus = async (test: Test) => {
    const newStatus = test.status === 'active' ? 'inactive' : 'active';
    try {
      const updatedTest = { ...test, status: newStatus };
      await testsAPI.update(test.id, updatedTest);
      setTests(tests.map(t => t.id === test.id ? updatedTest : t));
      showToast(`Test ${newStatus}!`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">Mock Tests</h2>
          <p className="text-sm text-gray-500 mt-1">Manage and publish exams</p>
        </div>
        <div className="flex gap-3">
          {selectedTests.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span className="material-icons-outlined text-lg">delete</span>
              Delete ({selectedTests.length})
            </button>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="bg-navy text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-navy/90 transition-colors flex items-center gap-2"
          >
            <span className="material-icons-outlined text-lg">add</span>
            Create Test
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Row */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <select
            value={filterCourse}
            onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 min-w-[150px]"
          >
            <option value="">All Courses</option>
            {[...new Set(tests.map(t => t.course))].map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="scheduled">Scheduled</option>
            <option value="draft">Draft</option>
          </select>

          <div className="flex-1"></div>

          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search test..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTests.length === paginatedTests.length && paginatedTests.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Title</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Open Date</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Close Date</th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Questions</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <span className="material-icons-outlined text-6xl text-gray-200 mb-2 block">quiz</span>
                    <p className="text-gray-400 font-medium">No tests found</p>
                  </td>
                </tr>
              ) : (
                paginatedTests.map((test, index) => (
                  <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTests.includes(test.id)}
                        onChange={() => toggleSelectTest(test.id)}
                        className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-navy uppercase">{test.name}</span>
                      <p className="text-xs text-gray-400 mt-0.5">Added: {test.date}</p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{test.course}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{test.openDate || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{test.closeDate || 'N/A'}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">{test.questions}</span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => toggleStatus(test)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          test.status === 'active'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {test.status === 'active' ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => toggleFeatured(test)}
                        className={`transition-colors ${test.featured ? 'text-yellow-500' : 'text-gray-300'}`}
                        title={test.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <span className="material-icons-outlined text-lg">star</span>
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(test)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTests.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTests.length)} of {filteredTests.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-sm font-bold rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-navy text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-black text-navy uppercase tracking-wide">
                {editingTest ? 'Edit Test' : 'Create Test'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Test Title *</label>
                <input
                  type="text"
                  placeholder="Enter test title"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Course *</label>
                  <select
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  >
                    <option value="">Select Course</option>
                    <option value="NEET">NEET</option>
                    <option value="IIT-JEE">IIT-JEE</option>
                    <option value="BOARDS">BOARDS</option>
                    <option value="AIIMS">AIIMS</option>
                    <option value="JIPMER">JIPMER</option>
                    <option value="KVPY">KVPY</option>
                    <option value="OLYMPIAD">OLYMPIAD</option>
                    {[...new Set(tests.map(t => t.course))].map(course => (
                      !['NEET', 'IIT-JEE', 'BOARDS', 'AIIMS', 'JIPMER', 'KVPY', 'OLYMPIAD'].includes(course) && (
                        <option key={course} value={course}>{course}</option>
                      )
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Questions *</label>
                  <input
                    type="number"
                    placeholder="Number of questions"
                    value={formData.questions}
                    onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Duration (mins)</label>
                  <input
                    type="number"
                    placeholder="Duration in minutes"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Open Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.openDate}
                    onChange={(e) => setFormData({ ...formData, openDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Click to select date & time</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Close Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.closeDate}
                    onChange={(e) => setFormData({ ...formData, closeDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-medium outline-none focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Click to select date & time</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-navy focus:ring-navy"
                  />
                  <span className="text-sm font-medium text-gray-700">Mark as Featured</span>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-4">
              <button
                onClick={handleCloseModal}
                className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-navy text-white py-3.5 rounded-xl font-bold text-sm uppercase hover:bg-navy/90 transition-colors"
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
