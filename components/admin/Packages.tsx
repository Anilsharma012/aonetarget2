import React, { useState, useEffect } from 'react';
import { packagesAPI } from '../../src/services/apiClient';

interface Package {
  id: string;
  name: string;
  description: string;
  courses: string[];
  price: number;
  status: 'active' | 'inactive';
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Packages: React.FC<Props> = ({ showToast }) => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', courses: '', price: '', status: 'active' });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await packagesAPI.getAll();
      setPackages(data);
    } catch (error) {
      showToast('Failed to load packages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const packageData = {
        id: editingPackage?.id || `pkg_${Date.now()}`,
        name: formData.name,
        description: formData.description,
        courses: formData.courses.split(',').map(c => c.trim()).filter(c => c),
        price: parseFloat(formData.price) || 0,
        status: formData.status as 'active' | 'inactive'
      };

      if (editingPackage) {
        await packagesAPI.update(editingPackage.id, packageData);
        showToast('Package updated successfully!');
      } else {
        await packagesAPI.create(packageData);
        showToast('Package created successfully!');
      }

      setShowModal(false);
      setEditingPackage(null);
      setFormData({ name: '', description: '', courses: '', price: '', status: 'active' });
      loadPackages();
    } catch (error) {
      showToast('Failed to save package', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesAPI.delete(id);
        showToast('Package deleted successfully!');
        loadPackages();
      } catch (error) {
        showToast('Failed to delete package', 'error');
      }
    }
  };

  const openEditModal = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      courses: pkg.courses.join(', '),
      price: pkg.price.toString(),
      status: pkg.status
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
        <h3 className="text-xl font-black text-navy uppercase tracking-widest">Course Bundles & Packages</h3>
        <button 
          onClick={() => { setEditingPackage(null); setFormData({ name: '', description: '', courses: '', price: '', status: 'active' }); setShowModal(true); }}
          className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest"
        >
          + Create Bundle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {packages.length === 0 ? (
          <>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-center col-span-full">
              <span className="material-icons-outlined text-6xl text-gray-200 mb-4">inventory_2</span>
              <p className="text-gray-400 font-bold uppercase tracking-widest">No Packages Created</p>
              <p className="text-xs text-gray-300 mt-2">Click "Create Bundle" to add your first package</p>
            </div>
          </>
        ) : (
          packages.map(pkg => (
            <div key={pkg.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                  pkg.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {pkg.status}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(pkg)} className="p-2 text-navy hover:bg-gray-50 rounded-lg">
                    <span className="material-icons-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <span className="material-icons-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <h4 className="text-lg font-black text-navy uppercase tracking-widest mb-2">{pkg.name}</h4>
              <p className="text-xs text-gray-400 font-medium mb-4">{pkg.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {pkg.courses.map((course, i) => (
                  <span key={i} className="text-[9px] font-black bg-navy/10 text-navy px-3 py-1 rounded-full uppercase">
                    {course}
                  </span>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-50">
                <span className="text-xl font-black text-navy">₹{pkg.price.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}

        <div className="bg-navy rounded-[2.5rem] p-10 text-white flex flex-col justify-center">
          <h4 className="text-xl font-black uppercase tracking-widest mb-2">Assignment Root</h4>
          <p className="text-[10px] opacity-60 font-bold tracking-[0.2em] uppercase">Batching Engine Active</p>
          <p className="text-xs opacity-40 mt-4">Total Packages: {packages.length}</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingPackage ? 'Edit Package' : 'Create Package'}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Package Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                type="text"
                placeholder="Courses (comma separated)"
                value={formData.courses}
                onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
                {editingPackage ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Packages;
