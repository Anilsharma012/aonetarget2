import React, { useState, useEffect } from 'react';
import { testSeriesAPI } from '../../src/services/apiClient';

interface VideoSeriesItem {
  id: string;
  seriesName: string;
  totalVideos: number;
  course: string;
  subject: string;
  description: string;
  studentsEnrolled: number;
  status: 'active' | 'inactive' | 'draft';
  createdDate: string;
  completionRate: number;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const VideoSeries: React.FC<Props> = ({ showToast }) => {
  const [series, setSeries] = useState<VideoSeriesItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSeries, setEditingSeries] = useState<VideoSeriesItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [formData, setFormData] = useState({
    seriesName: '',
    course: '',
    subject: '',
    totalVideos: '',
    description: '',
    status: 'draft' as 'active' | 'inactive' | 'draft'
  });

  useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    try {
      const data = await testSeriesAPI.getAll().catch(() => []);
      setSeries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Starting with empty state');
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSeries = series
    .filter(item => {
      const matchesSearch = !searchQuery || (item.seriesName && item.seriesName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof VideoSeriesItem];
      const bVal = b[sortBy as keyof VideoSeriesItem];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredSeries.length / itemsPerPage);
  const paginatedSeries = filteredSeries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenModal = (item?: VideoSeriesItem) => {
    if (item) {
      setEditingSeries(item);
      setFormData({
        seriesName: item.seriesName,
        course: item.course,
        subject: item.subject,
        totalVideos: item.totalVideos.toString(),
        description: item.description,
        status: item.status
      });
    } else {
      setEditingSeries(null);
      setFormData({ seriesName: '', course: '', subject: '', totalVideos: '', description: '', status: 'draft' });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.seriesName || !formData.course || !formData.totalVideos) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const seriesData = {
        id: editingSeries?.id || `vseries_${Date.now()}`,
        seriesName: formData.seriesName,
        course: formData.course,
        subject: formData.subject,
        totalVideos: parseInt(formData.totalVideos),
        description: formData.description,
        status: formData.status,
        studentsEnrolled: editingSeries?.studentsEnrolled || 0,
        createdDate: editingSeries?.createdDate || new Date().toISOString(),
        completionRate: editingSeries?.completionRate || 0
      };

      if (editingSeries) {
        await testSeriesAPI.update(editingSeries.id, seriesData);
        showToast('Video Series updated successfully!');
      } else {
        await testSeriesAPI.create(seriesData);
        showToast('Video Series created successfully!');
      }

      setShowModal(false);
      setEditingSeries(null);
      setFormData({ seriesName: '', course: '', subject: '', totalVideos: '', description: '', status: 'draft' });
      loadSeries();
    } catch (error) {
      showToast('Failed to save Video Series', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this video series?')) {
      try {
        await testSeriesAPI.delete(id);
        showToast('Video Series deleted successfully!');
        loadSeries();
      } catch (error) {
        showToast('Failed to delete Video Series', 'error');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      inactive: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      draft: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${config.bg} ${config.text} ${config.border}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-black text-navy uppercase tracking-widest">Video Series Management</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {series.length} Series</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-base">add</span>
          Create Series
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Search series name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {paginatedSeries.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-5xl text-gray-200 mb-4 block">video_library</span>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No video series found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Series Name</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Videos</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSeries.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-navy truncate max-w-xs">{item.seriesName}</td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{item.course}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">{item.subject}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">{item.totalVideos}</td>
                      <td className="px-6 py-4 text-center font-bold text-purple-600">{item.studentsEnrolled}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600" style={{ width: `${item.completionRate}%` }}></div>
                          </div>
                          <span className="font-bold text-gray-600 w-8">{item.completionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <span className="material-icons-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Delete"
                          >
                            <span className="material-icons-outlined text-base">delete</span>
                          </button>
                          <button
                            className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-colors"
                            title="View Details"
                          >
                            <span className="material-icons-outlined text-base">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <p className="text-[10px] font-bold text-gray-500 uppercase">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSeries.length)} of {filteredSeries.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-icons-outlined text-base">chevron_left</span>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                        page === currentPage
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-icons-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-navy uppercase tracking-widest">
                {editingSeries ? 'Edit Video Series' : 'Create New Video Series'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Series Name *"
                value={formData.seriesName}
                onChange={(e) => setFormData({ ...formData, seriesName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Course *"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Total Videos *"
                  value={formData.totalVideos}
                  onChange={(e) => setFormData({ ...formData, totalVideos: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'draft' })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-black text-sm uppercase hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-sm uppercase hover:bg-indigo-700 transition-colors shadow-lg"
              >
                {editingSeries ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoSeries;
