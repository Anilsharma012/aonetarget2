import React, { useState, useEffect } from 'react';
import { newsAPI } from '../../../src/services/apiClient';

interface News { id: string; title: string; content: string; category: string; status: 'published' | 'draft'; createdDate: string; }

interface Props { showToast: (m: string, type?: 'success' | 'error') => void; }

const GlobalNews: React.FC<Props> = ({ showToast }) => {
  const [items, setItems] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<News | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ title: '', content: '', category: '', status: 'draft' as 'published' | 'draft' });

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      const data = await newsAPI.getAll().catch(() => []);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async () => {
    if (!formData.title) { showToast('Fill required fields', 'error'); return; }
    try {
      const data = {
        id: editingItem?.id || `news_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        status: formData.status,
        createdDate: editingItem?.createdDate || new Date().toISOString()
      };
      if (editingItem) {
        await newsAPI.update(editingItem.id, data);
        showToast('Updated!');
      } else {
        await newsAPI.create(data);
        showToast('Created!');
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ title: '', content: '', category: '', status: 'draft' });
      loadItems();
    } catch (error) {
      showToast('Failed to save', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete?')) {
      try {
        await newsAPI.delete(id);
        showToast('Deleted!');
        loadItems();
      } catch (error) {
        showToast('Failed', 'error');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div><h3 className="text-lg font-black text-navy uppercase tracking-widest">Global News</h3><p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {items.length}</p></div>
        <button onClick={() => { setEditingItem(null); setFormData({ title: '', content: '', category: '', status: 'draft' }); setShowModal(true); }} className="bg-navy text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2"><span className="material-icons-outlined text-base">add</span> Add News</button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="relative"><span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-navy/10" /></div><select value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-navy/10"><option value="10">10 per page</option><option value="25">25 per page</option><option value="50">50 per page</option></select></div></div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">{paginatedItems.length === 0 ? (<div className="p-12 text-center"><span className="material-icons-outlined text-5xl text-gray-200 block mb-4">newspaper</span><p className="text-gray-400 font-bold uppercase">No news found</p></div>) : (<><div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-gray-50 border-b border-gray-100"><th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">#</th><th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Title</th><th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Category</th><th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Status</th><th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Actions</th></tr></thead><tbody>{paginatedItems.map((item, idx) => (<tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 group"><td className="px-6 py-4 font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td><td className="px-6 py-4 font-bold text-navy">{item.title}</td><td className="px-6 py-4 text-gray-600">{item.category}</td><td className="px-6 py-4 text-center"><span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.status === 'published' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>{item.status}</span></td><td className="px-6 py-4 text-center"><div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingItem(item); setFormData({ title: item.title, content: item.content, category: item.category, status: item.status }); setShowModal(true); }} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"><span className="material-icons-outlined text-base">edit</span></button><button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"><span className="material-icons-outlined text-base">delete</span></button></div></td></tr>))}</tbody></table></div><div className="flex items-center justify-between bg-gray-50 border-t border-gray-100 px-6 py-4"><p className="text-sm font-bold text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}</p><div className="flex gap-2"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-lg disabled:opacity-50"><span className="material-icons-outlined">chevron_left</span></button>{Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (<button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-lg font-black text-sm ${page === currentPage ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>{page}</button>))}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-lg disabled:opacity-50"><span className="material-icons-outlined">chevron_right</span></button></div></div></>) }</div>

      {showModal && (<div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl border border-gray-100"><div className="flex justify-between items-center px-8 py-6 border-b border-gray-100"><h3 className="text-lg font-black text-navy uppercase tracking-widest">{editingItem ? 'Edit' : 'Add'} News</h3><button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><span className="material-icons-outlined">close</span></button></div><div className="p-8 space-y-4"><div><label className="block text-xs font-black text-gray-700 uppercase mb-2">Title *</label><input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10" /></div><div><label className="block text-xs font-black text-gray-700 uppercase mb-2">Content</label><textarea placeholder="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10 resize-none" /></div><div><label className="block text-xs font-black text-gray-700 uppercase mb-2">Category</label><input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10" /></div><div><label className="block text-xs font-black text-gray-700 uppercase mb-2">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'published' | 'draft' })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10"><option value="draft">Draft</option><option value="published">Published</option></select></div></div><div className="flex gap-4 px-8 py-6 border-t border-gray-100 bg-gray-50"><button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-black uppercase hover:bg-gray-300">Cancel</button><button onClick={handleSubmit} className="flex-1 bg-navy text-white py-3 rounded-lg font-black uppercase hover:bg-blue-900">{editingItem ? 'Update' : 'Create'}</button></div></div></div>)}
    </div>
  );
};

export default GlobalNews;
