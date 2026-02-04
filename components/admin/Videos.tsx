import React, { useState, useEffect } from 'react';
import { videosAPI } from '../../src/services/apiClient';

interface Video {
  id: string;
  title: string;
  subject: string;
  topic: string;
  duration: string;
  quality: string;
  views: number;
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
  const [formData, setFormData] = useState({ title: '', subject: '', topic: '', duration: '', quality: 'HD 1080P', thumbnail: '' });

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

  const handleSubmit = async () => {
    try {
      const videoData = {
        id: editingVideo?.id || `vid_${Date.now()}`,
        title: formData.title,
        subject: formData.subject,
        topic: formData.topic,
        duration: formData.duration,
        quality: formData.quality,
        views: editingVideo?.views || 0,
        thumbnail: formData.thumbnail
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
      setFormData({ title: '', subject: '', topic: '', duration: '', quality: 'HD 1080P', thumbnail: '' });
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

  const openEditModal = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      subject: video.subject,
      topic: video.topic,
      duration: video.duration,
      quality: video.quality,
      thumbnail: video.thumbnail || ''
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">Video Lecture Series</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {videos.length} Videos</p>
        </div>
        <button 
          onClick={() => { setEditingVideo(null); setFormData({ title: '', subject: '', topic: '', duration: '', quality: 'HD 1080P', thumbnail: '' }); setShowModal(true); }}
          className="bg-navy text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-xl tracking-widest hover:scale-105 transition-all"
        >
          + Upload New Lecture
        </button>
      </div>

      {videos.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100">
          <span className="material-icons-outlined text-6xl text-gray-200 mb-4">video_library</span>
          <p className="text-gray-400 font-bold uppercase tracking-widest">No videos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-2xl transition-all">
              <div className="aspect-video bg-navy relative group cursor-pointer overflow-hidden">
                <img 
                  src={video.thumbnail || `https://picsum.photos/400/225?sig=${video.id}`} 
                  className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" 
                  alt={video.title} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 text-white">
                    <span className="material-icons-outlined text-3xl">play_arrow</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                  <span className="text-[9px] font-black bg-black/60 text-white px-3 py-1 rounded-full uppercase">{video.duration}</span>
                  <span className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase">{video.quality}</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{video.subject} / {video.topic}</p>
                <h4 className="font-black text-navy uppercase text-sm mb-3 leading-tight truncate">{video.title}</h4>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-xs text-gray-300">visibility</span>
                    <span className="text-[10px] font-bold text-gray-400">{video.views.toLocaleString()} Views</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(video)} className="p-2 text-navy hover:bg-gray-50 rounded-lg">
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(video.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                      <span className="material-icons-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingVideo ? 'Edit Video' : 'Add New Video'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Video Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Duration (e.g., 45:10 MINS)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="HD 1080P">HD 1080P</option>
                  <option value="HD 720P">HD 720P</option>
                  <option value="SD 480P">SD 480P</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Thumbnail URL (optional)"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
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
                {editingVideo ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Videos;
