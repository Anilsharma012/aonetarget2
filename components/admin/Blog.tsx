import React, { useState, useEffect } from 'react';
import { blogAPI } from '../../src/services/apiClient';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  status: 'draft' | 'published';
  createdAt: string;
  thumbnail?: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Blog: React.FC<Props> = ({ showToast }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', author: '', status: 'draft', thumbnail: '' });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await blogAPI.getAll();
      setPosts(data);
    } catch (error) {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const postData = {
        id: editingPost?.id || `post_${Date.now()}`,
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        author: formData.author,
        status: formData.status as 'draft' | 'published',
        thumbnail: formData.thumbnail,
        createdAt: editingPost?.createdAt || new Date().toISOString()
      };

      if (editingPost) {
        await blogAPI.update(editingPost.id, postData);
        showToast('Post updated successfully!');
      } else {
        await blogAPI.create(postData);
        showToast('Post created successfully!');
      }

      setShowModal(false);
      setEditingPost(null);
      setFormData({ title: '', content: '', excerpt: '', author: '', status: 'draft', thumbnail: '' });
      loadPosts();
    } catch (error) {
      showToast('Failed to save post', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await blogAPI.delete(id);
        showToast('Post deleted successfully!');
        loadPosts();
      } catch (error) {
        showToast('Failed to delete post', 'error');
      }
    }
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: post.author,
      status: post.status,
      thumbnail: post.thumbnail || ''
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
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">Articles & Updates</h3>
          <p className="text-[10px] text-gray-400 font-bold mt-1">Total: {posts.length} Posts</p>
        </div>
        <button 
          onClick={() => { setEditingPost(null); setFormData({ title: '', content: '', excerpt: '', author: '', status: 'draft', thumbnail: '' }); setShowModal(true); }}
          className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest"
        >
          + New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="h-64 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <span className="material-icons-outlined text-7xl text-gray-200">article</span>
          <p className="font-black mt-2 uppercase tracking-widest text-gray-300">Drafts Empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl transition-all">
              <div className="aspect-video bg-navy/5 flex items-center justify-center">
                {post.thumbnail ? (
                  <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-icons-outlined text-4xl text-navy/20">article</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    post.status === 'published' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    {post.status}
                  </span>
                  <span className="text-[9px] text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-black text-navy text-sm mb-2 leading-tight line-clamp-2">{post.title}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-[10px] font-bold text-gray-400">By {post.author}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(post)} className="p-2 text-navy hover:bg-gray-50 rounded-lg">
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
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
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingPost ? 'Edit Post' : 'New Post'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Post Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="Author Name"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <textarea
                placeholder="Short excerpt/summary"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none resize-none"
                rows={2}
              />
              <textarea
                placeholder="Full content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none resize-none"
                rows={6}
              />
              <input
                type="text"
                placeholder="Thumbnail URL (optional)"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
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
                {editingPost ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
