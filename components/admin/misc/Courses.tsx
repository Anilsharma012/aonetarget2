import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../../src/services/apiClient';
import RichTextEditor from '../../shared/RichTextEditor';
import FileUploadButton from '../../shared/FileUploadButton';

interface Course {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  subjects: number;
  studentsEnrolled: number;
  status: 'active' | 'inactive';
  createdDate: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Courses: React.FC<Props> = ({ showToast }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    subjects: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => { loadCourses(); }, []);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAll().catch(() => []);
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(item => !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedItems = filteredCourses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async () => {
    if (!formData.name) { showToast('Please fill required fields', 'error'); return; }
    try {
      const courseData = {
        id: editingItem?.id || `course_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
        subjects: parseInt(formData.subjects) || 0,
        studentsEnrolled: editingItem?.studentsEnrolled || 0,
        status: formData.status,
        createdDate: editingItem?.createdDate || new Date().toISOString()
      };
      if (editingItem) {
        await coursesAPI.update(editingItem.id, courseData);
        showToast('Course updated successfully!');
      } else {
        await coursesAPI.create(courseData);
        showToast('Course created successfully!');
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', description: '', imageUrl: '', subjects: '', status: 'active' });
      loadCourses();
    } catch (error) {
      showToast('Failed to save course', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this course?')) {
      try {
        await coursesAPI.delete(id);
        showToast('Course deleted successfully!');
        loadCourses();
      } catch (error) {
        showToast('Failed to delete course', 'error');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-lg font-black text-navy uppercase tracking-widest">Courses Management</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {courses.length} Courses</p>
        </div>
        <button 
          onClick={() => { setEditingItem(null); setFormData({ name: '', description: '', imageUrl: '', subjects: '', status: 'active' }); setShowModal(true); }}
          className="bg-navy text-white px-6 py-3 rounded-xl font-black text-[11px] uppercase shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-base">add</span>
          Add Course
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }}
            className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-navy/10"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {paginatedItems.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-5xl text-gray-200 block mb-4">school</span>
            <p className="text-gray-400 font-bold uppercase tracking-wider text-sm">No courses found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left font-black text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Students</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center font-black text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item, idx) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 group">
                      <td className="px-6 py-4 font-bold text-gray-400">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td className="px-6 py-4 font-bold text-navy">{item.name}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{item.description}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">{item.subjects || 0}</td>
                      <td className="px-6 py-4 text-center font-bold text-gray-700">{item.studentsEnrolled || 0}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.status === 'active' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-700 border border-gray-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingItem(item); setFormData({ name: item.name, description: item.description, imageUrl: item.imageUrl || '', subjects: item.subjects.toString(), status: item.status }); setShowModal(true); }} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                            <span className="material-icons-outlined text-base">edit</span>
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                            <span className="material-icons-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-gray-50 border-t border-gray-100 px-6 py-4">
              <p className="text-sm font-bold text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length}</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 hover:bg-white rounded-lg disabled:opacity-50 transition-colors">
                  <span className="material-icons-outlined">chevron_left</span>
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-2 rounded-lg font-black text-sm transition-all ${page === currentPage ? 'bg-navy text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 hover:bg-white rounded-lg disabled:opacity-50 transition-colors">
                  <span className="material-icons-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl border border-gray-100">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black text-navy uppercase tracking-widest">{editingItem ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-2">Course Name *</label>
                <input type="text" placeholder="Enter course name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10" />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-2">Course Image</label>
                <div className="flex gap-3 items-center">
                  <input type="url" placeholder="Paste URL or upload image" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10" />
                  <FileUploadButton
                    accept="image/*"
                    label="Upload"
                    icon="cloud_upload"
                    onUpload={(url) => setFormData({ ...formData, imageUrl: url })}
                  />
                </div>
                {formData.imageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"
                    >
                      <span className="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-1">Enter a URL or upload an image for the course thumbnail</p>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-700 uppercase mb-2">Description (Rich Text)</label>
                <RichTextEditor 
                  content={formData.description} 
                  onChange={(html) => setFormData({ ...formData, description: html })} 
                  placeholder="Enter course description..."
                />
                <p className="text-[10px] text-gray-400 mt-1">Use the toolbar to add bold, italic, lists, etc.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2">Subjects</label>
                  <input type="number" placeholder="0" value={formData.subjects} onChange={(e) => setFormData({ ...formData, subjects: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg font-bold outline-none focus:ring-2 focus:ring-navy/10">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-4 px-8 py-6 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-black uppercase hover:bg-gray-300 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-navy text-white py-3 rounded-lg font-black uppercase hover:bg-blue-900 transition-colors">
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
