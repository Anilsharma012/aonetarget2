import React, { useState, useEffect } from 'react';
import { bannersAPI } from '../../src/services/apiClient';

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Banners: React.FC<Props> = ({ showToast }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title: '', imageUrl: '', linkUrl: '', active: true, order: 1 });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const data = await bannersAPI.getAll();
      setBanners(data.sort((a: Banner, b: Banner) => a.order - b.order));
    } catch (error) {
      showToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const bannerData = {
        id: editingBanner?.id || `banner_${Date.now()}`,
        title: formData.title,
        imageUrl: formData.imageUrl,
        linkUrl: formData.linkUrl,
        order: formData.order,
        active: formData.active
      };

      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, bannerData);
        showToast('Banner updated successfully!');
      } else {
        await bannersAPI.create(bannerData);
        showToast('Banner created successfully!');
      }

      setShowModal(false);
      setEditingBanner(null);
      setFormData({ title: '', imageUrl: '', linkUrl: '', active: true, order: banners.length + 1 });
      loadBanners();
    } catch (error) {
      showToast('Failed to save banner', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await bannersAPI.delete(id);
        showToast('Banner deleted successfully!');
        loadBanners();
      } catch (error) {
        showToast('Failed to delete banner', 'error');
      }
    }
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      active: banner.active,
      order: banner.order || 1
    });
    setShowModal(true);
  };

  const toggleActive = async (banner: Banner) => {
    try {
      await bannersAPI.update(banner.id, { ...banner, active: !banner.active });
      loadBanners();
      showToast(`Banner ${!banner.active ? 'activated' : 'deactivated'}!`);
    } catch (error) {
      showToast('Failed to update banner', 'error');
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
        <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">App Slide Banners</h3>
          <p className="text-[10px] text-gray-400 font-bold mt-1">Total: {banners.length} Banners</p>
        </div>
        <button 
          onClick={() => { setEditingBanner(null); setFormData({ title: '', imageUrl: '', linkUrl: '', active: true, order: banners.length + 1 }); setShowModal(true); }}
          className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest"
        >
          + Add Slider
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(banner => (
          <div key={banner.id} className="relative group">
            <div className={`aspect-[2/1] rounded-[2rem] overflow-hidden border-2 ${banner.active ? 'border-navy' : 'border-gray-200'}`}>
              {banner.imageUrl ? (
                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-navy/5 flex flex-col items-center justify-center">
                  <span className="material-icons-outlined text-4xl text-gray-300">image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-black text-sm truncate">{banner.title}</p>
                  <p className="text-white/60 text-[10px] mt-1">Slot #{banner.order}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => toggleActive(banner)}
                className={`p-2 rounded-lg ${banner.active ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <span className="material-icons-outlined text-sm">{banner.active ? 'visibility' : 'visibility_off'}</span>
              </button>
              <button 
                onClick={() => openEditModal(banner)}
                className="p-2 bg-white text-navy rounded-lg shadow-lg"
              >
                <span className="material-icons-outlined text-sm">edit</span>
              </button>
              <button 
                onClick={() => handleDelete(banner.id)}
                className="p-2 bg-red-500 text-white rounded-lg shadow-lg"
              >
                <span className="material-icons-outlined text-sm">delete</span>
              </button>
            </div>
            {!banner.active && (
              <div className="absolute top-4 left-4 bg-gray-800/80 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">
                Inactive
              </div>
            )}
          </div>
        ))}

        {banners.length < 4 && (
          <div 
            onClick={() => { setEditingBanner(null); setFormData({ title: '', imageUrl: '', linkUrl: '', active: true, order: banners.length + 1 }); setShowModal(true); }}
            className="aspect-[2/1] bg-navy/5 rounded-[2rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 cursor-pointer hover:border-navy/30 hover:text-navy/50 transition-all"
          >
            <span className="material-icons-outlined text-4xl mb-2">add_photo_alternate</span>
            <p className="text-[10px] font-black uppercase">Add New Banner</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Banner Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="Link URL (optional)"
                value={formData.linkUrl}
                onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              {formData.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 pt-2">Preview</p>
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover mt-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Order / Priority</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-bold text-gray-600">Active</span>
                </div>
              </div>
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
                {editingBanner ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
