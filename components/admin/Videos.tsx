import React, { useState, useEffect } from 'react';
import { videosAPI } from '../../src/services/apiClient';

interface Video {
  id: string;
  title: string;
  subject: string;
  topic: string;
  course: string;
  duration: string;
  quality: string;
  views: number;
  uploadDate: string;
  status: 'active' | 'inactive' | 'archived';
  videoUrl?: string;
  thumbnail?: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Videos: React.FC<Props> = ({ showToast }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterQuality, setFilterQuality] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    topic: '',
    course: '',
    duration: '',
    quality: 'HD 1080P',
    videoUrl: '',
    thumbnail: '',
    status: 'active' as 'active' | 'inactive' | 'archived'
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const data = await videosAPI.getAll();
      setVideos(data);
    } catch (error) {
      showToast('Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos
    .filter(video => {
      const matchesSearch = !searchQuery || video.title.toLowerCase().includes(searchQuery.toLowerCase()) || video.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !filterStatus || video.status === filterStatus;
      const matchesQuality = !filterQuality || video.quality === filterQuality;
      return matchesSearch && matchesStatus && matchesQuality;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof Video];
      const bVal = b[sortBy as keyof Video];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async () => {
    if (!formData.title || !formData.course || !formData.subject) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const videoData = {
        id: editingVideo?.id || `vid_${Date.now()}`,
        title: formData.title,
        subject: formData.subject,
        topic: formData.topic,
        course: formData.course,
        duration: formData.duration,
        quality: formData.quality,
        views: editingVideo?.views || 0,
        thumbnail: formData.thumbnail,
        videoUrl: formData.videoUrl,
        uploadDate: editingVideo?.uploadDate || new Date().toISOString(),
        status: formData.status
      };

      if (editingVideo) {
        await videosAPI.update(editingVideo.id, videoData);
        showToast('Video updated successfully!');
      } else {
        await videosAPI.create(videoData);
        showToast('Video created successfully!');
      }

      setShowModal(false);
      setEditingVideo(null);
      setFormData({ title: '', subject: '', topic: '', course: '', duration: '', quality: 'HD 1080P', videoUrl: '', thumbnail: '', status: 'active' });
      loadVideos();
    } catch (error) {
      showToast('Failed to save video', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      try {
        await videosAPI.delete(id);
        showToast('Video deleted successfully!');
        loadVideos();
      } catch (error) {
        showToast('Failed to delete video', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVideos.length === 0) {
      showToast('No videos selected', 'error');
      return;
    }
    if (confirm(`Delete ${selectedVideos.length} videos?`)) {
      try {
        for (const id of selectedVideos) {
          await videosAPI.delete(id);
        }
        showToast(`${selectedVideos.length} videos deleted successfully!`);
        setSelectedVideos([]);
        loadVideos();
      } catch (error) {
        showToast('Failed to delete videos', 'error');
      }
    }
  };

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      subject: video.subject,
      topic: video.topic,
      course: video.course,
      duration: video.duration,
      quality: video.quality,
      thumbnail: video.thumbnail || '',
      videoUrl: video.videoUrl || '',
      status: video.status
    });
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
      inactive: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
      archived: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
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
          <h3 className="text-lg font-black text-navy uppercase tracking-widest">Video Library</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {videos.length} Videos</p>
        </div>
        <button 
          onClick={() => { setEditingVideo(null); setFormData({ title: '', subject: '', topic: '', course: '', duration: '', quality: 'HD 1080P', videoUrl: '', thumbnail: '', status: 'active' }); setShowModal(true); }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-base">add</span>
          Upload Video
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">search</span>
            <input
              type="text"
              placeholder="Search by title or subject..."
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
            <option value="archived">Archived</option>
          </select>
          <select
            value={filterQuality}
            onChange={(e) => {
              setFilterQuality(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">All Quality</option>
            <option value="HD 1080P">HD 1080P</option>
            <option value="HD 720P">HD 720P</option>
            <option value="SD 480P">SD 480P</option>
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
        {paginatedVideos.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-5xl text-gray-200 mb-4 block">video_library</span>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No videos found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Quality</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedVideos.map((video, idx) => (
                    <tr key={video.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={video.thumbnail || `https://picsum.photos/40/40?sig=${video.id}`}
                            alt={video.title}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-200"
                          />
                          <span className="font-bold text-navy max-w-xs truncate">{video.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-semibold">{video.subject}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">{video.course}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold">{video.quality}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">{video.duration}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="material-icons-outlined text-sm text-gray-400">visibility</span>
                          <span className="font-bold text-gray-600">{video.views.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(video.status)}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(video)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <span className="material-icons-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
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
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVideos.length)} of {filteredVideos.length}
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
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
                {editingVideo ? 'Edit Video' : 'Upload New Video'}
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
                placeholder="Video Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject *"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <input
                  type="text"
                  placeholder="Topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
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
                  placeholder="Duration (e.g., 45:10 MINS)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="HD 1080P">HD 1080P</option>
                  <option value="HD 720P">HD 720P</option>
                  <option value="SD 480P">SD 480P</option>
                </select>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'archived' })}
                  className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Video URL"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <input
                type="text"
                placeholder="Thumbnail URL (optional)"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 p-3.5 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                {editingVideo ? 'Update' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
