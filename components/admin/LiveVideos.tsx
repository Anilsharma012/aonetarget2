import React, { useState, useEffect } from 'react';
import { liveVideosAPI } from '../../src/services/apiClient';

interface LiveStream {
  id: string;
  title: string;
  description: string;
  scheduledTime: string;
  status: 'live' | 'scheduled' | 'ended';
  viewers?: number;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const LiveVideos: React.FC<Props> = ({ showToast }) => {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', scheduledTime: '' });

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    try {
      const data = await liveVideosAPI.getAll();
      setStreams(data);
    } catch (error) {
      showToast('Failed to load streams', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const streamData = {
        id: `stream_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        scheduledTime: formData.scheduledTime,
        status: 'scheduled' as const,
        viewers: 0
      };

      await liveVideosAPI.create(streamData);
      showToast('Live stream scheduled successfully!');

      setShowModal(false);
      setFormData({ title: '', description: '', scheduledTime: '' });
      loadStreams();
    } catch (error) {
      showToast('Failed to schedule stream', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this stream?')) {
      try {
        await liveVideosAPI.delete(id);
        showToast('Stream deleted successfully!');
        loadStreams();
      } catch (error) {
        showToast('Failed to delete stream', 'error');
      }
    }
  };

  const goLive = async (stream: LiveStream) => {
    try {
      await liveVideosAPI.update(stream.id, { ...stream, status: 'live' });
      showToast('Stream is now LIVE!');
      loadStreams();
    } catch (error) {
      showToast('Failed to start stream', 'error');
    }
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-black text-navy uppercase tracking-widest">Live Stream Center</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-red-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest flex items-center gap-2"
        >
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Schedule Stream
        </button>
      </div>

      {streams.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 text-center shadow-sm">
          <span className="material-icons-outlined text-7xl mb-4 text-gray-200">live_tv</span>
          <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">No Scheduled Streams</h4>
          <p className="text-xs text-gray-300 mt-2">Click "Schedule Stream" to create your first live session</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {streams.map(stream => (
            <div key={stream.id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                  stream.status === 'live' ? 'bg-red-100 text-red-600' :
                  stream.status === 'scheduled' ? 'bg-orange-100 text-orange-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {stream.status === 'live' && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>}
                  {stream.status}
                </span>
                <button onClick={() => handleDelete(stream.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <span className="material-icons-outlined text-sm">delete</span>
                </button>
              </div>
              <h4 className="font-black text-navy uppercase text-sm mb-2">{stream.title}</h4>
              <p className="text-xs text-gray-400 mb-4">{stream.description}</p>
              <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                <span className="text-[10px] font-bold text-gray-400">
                  {new Date(stream.scheduledTime).toLocaleString()}
                </span>
                {stream.status === 'scheduled' && (
                  <button 
                    onClick={() => goLive(stream)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-white rounded-full"></span> Go Live
                  </button>
                )}
                {stream.status === 'live' && (
                  <span className="text-[10px] font-bold text-red-500">{stream.viewers || 0} viewers</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">Schedule Live Stream</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Stream Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none resize-none"
                rows={3}
              />
              <input
                type="datetime-local"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
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
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black text-xs uppercase"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveVideos;
