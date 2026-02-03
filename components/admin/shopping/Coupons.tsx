import React, { useState, useEffect } from 'react';
import { couponsAPI } from '../../../api';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  minPurchase: number;
  usedCount: number;
  usageLimit: number;
  validFrom: string;
  validUpto: string;
  description: string;
  status: 'active' | 'expired' | 'inactive';
  createdDate: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Coupons: React.FC<Props> = ({ showToast }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'flat',
    discountValue: 0,
    maxDiscount: 0,
    minPurchase: 0,
    usageLimit: 0,
    validFrom: '',
    validUpto: '',
    description: '',
    status: 'active' as 'active' | 'expired' | 'inactive'
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  useEffect(() => {
    let filtered = coupons;

    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredCoupons(filtered);
    setCurrentPage(1);
  }, [coupons, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoupons = filteredCoupons.slice(startIndex, endIndex);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      setCoupons([
        {
          id: 'CPN-001',
          code: 'SAVE20',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscount: 500,
          minPurchase: 1000,
          usedCount: 45,
          usageLimit: 100,
          validFrom: '2025-01-01',
          validUpto: '2025-12-31',
          description: 'Get 20% discount on all courses',
          status: 'active',
          createdDate: '2024-12-15'
        },
        {
          id: 'CPN-002',
          code: 'FLAT500',
          discountType: 'flat',
          discountValue: 500,
          maxDiscount: 500,
          minPurchase: 2000,
          usedCount: 30,
          usageLimit: 50,
          validFrom: '2025-01-15',
          validUpto: '2025-03-31',
          description: 'Flat ₹500 discount on purchases above ₹2000',
          status: 'active',
          createdDate: '2025-01-10'
        },
        {
          id: 'CPN-003',
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10,
          maxDiscount: 300,
          minPurchase: 500,
          usedCount: 120,
          usageLimit: 200,
          validFrom: '2024-11-01',
          validUpto: '2025-02-28',
          description: 'New users welcome bonus',
          status: 'active',
          createdDate: '2024-10-25'
        },
        {
          id: 'CPN-004',
          code: 'EXPIRED2024',
          discountType: 'percentage',
          discountValue: 15,
          maxDiscount: 400,
          minPurchase: 1500,
          usedCount: 75,
          usageLimit: 75,
          validFrom: '2024-08-01',
          validUpto: '2024-12-31',
          description: 'Expired coupon',
          status: 'expired',
          createdDate: '2024-07-20'
        }
      ]);
    } catch (error) {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountValue || !formData.validUpto) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const newCoupon: Coupon = {
      id: `CPN-${String(coupons.length + 1).padStart(3, '0')}`,
      ...formData,
      usedCount: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setCoupons([...coupons, newCoupon]);
    resetForm();
    setShowAddModal(false);
    showToast(`Coupon ${newCoupon.code} created successfully`, 'success');
  };

  const handleEditCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoupon) return;

    const updatedCoupon: Coupon = {
      ...selectedCoupon,
      ...formData
    };

    setCoupons(coupons.map(c => c.id === selectedCoupon.id ? updatedCoupon : c));
    resetForm();
    setShowEditModal(false);
    setSelectedCoupon(null);
    showToast('Coupon updated successfully', 'success');
  };

  const handleDeleteCoupon = (couponId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete ${code}?`)) {
      return;
    }

    setCoupons(coupons.filter(c => c.id !== couponId));
    showToast(`${code} has been deleted`, 'success');
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minPurchase: coupon.minPurchase,
      usageLimit: coupon.usageLimit,
      validFrom: coupon.validFrom,
      validUpto: coupon.validUpto,
      description: coupon.description,
      status: coupon.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscount: 0,
      minPurchase: 0,
      usageLimit: 0,
      validFrom: '',
      validUpto: '',
      description: '',
      status: 'active'
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Code', 'Type', 'Value', 'Max Discount', 'Min Purchase', 'Used/Limit', 'Valid From', 'Valid Upto', 'Description', 'Status'];
      const rows = filteredCoupons.map(c => [
        c.id,
        c.code,
        c.discountType,
        c.discountValue,
        c.maxDiscount,
        c.minPurchase,
        `${c.usedCount}/${c.usageLimit}`,
        c.validFrom,
        c.validUpto,
        c.description,
        c.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coupons-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported ${filteredCoupons.length} coupon(s) to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Coupons Management</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Create & Manage Discount Coupons</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-6 py-3 bg-white border border-gray-200 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Export CSV</button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="px-6 py-4 bg-navy text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all">+ Create Coupon</button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-6 border-b border-gray-50 flex flex-wrap gap-4 items-center">
        <div className="flex-1 relative min-w-[300px]">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5 transition-all"
            placeholder="Search by coupon code, ID or description..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No coupons found</div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F8F9FA] font-black text-gray-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">Coupon Code</th>
                <th className="px-6 py-4 border-b border-gray-100">Discount</th>
                <th className="px-6 py-4 border-b border-gray-100">Max Discount</th>
                <th className="px-6 py-4 border-b border-gray-100">Min Purchase</th>
                <th className="px-6 py-4 border-b border-gray-100">Used / Limit</th>
                <th className="px-6 py-4 border-b border-gray-100">Valid Period</th>
                <th className="px-6 py-4 border-b border-gray-100">Description</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Status</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCoupons.map(c => (
                <tr key={c.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center font-black text-navy text-[9px]">
                        {c.code.charAt(0)}
                      </div>
                      <span className="font-bold text-navy">{c.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy">
                      {c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600">₹{c.maxDiscount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600">₹{c.minPurchase}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-navy">{c.usedCount}/{c.usageLimit}</span>
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${(c.usedCount / c.usageLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] text-gray-600 block">{new Date(c.validFrom).toLocaleDateString('en-IN')}</span>
                    <span className="text-[9px] text-gray-600">→ {new Date(c.validUpto).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-gray-600 truncate max-w-xs block">{c.description}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase inline-block ${
                      c.status === 'active' ? 'bg-green-100 text-green-600' :
                      c.status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity flex-wrap">
                      <button onClick={() => handleEditClick(c)} title="Edit" className="p-2 bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteCoupon(c.id, c.code)} title="Delete" className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredCoupons.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase">Items Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-600 outline-none"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCoupons.length)} of {filteredCoupons.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-navy text-[10px] font-black rounded-lg disabled:opacity-50"
            >
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase ${
                      currentPage === pageNum ? 'bg-navy text-white' : 'bg-gray-100 text-navy'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-100 text-navy text-[10px] font-black rounded-lg disabled:opacity-50"
            >
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Create New Coupon</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddCoupon} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="E.g., SAVE20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'flat' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Value *</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter discount value"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Maximum discount amount"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Min Purchase (₹)</label>
                  <input
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Minimum purchase required"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Total times this coupon can be used"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Valid Upto *</label>
                  <input
                    type="date"
                    value={formData.validUpto}
                    onChange={(e) => setFormData({ ...formData, validUpto: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5 resize-none h-24"
                    placeholder="Coupon description"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all">Create Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Coupon Modal */}
      {showEditModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Edit Coupon</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditCoupon} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Coupon ID</label>
                  <input type="text" disabled value={selectedCoupon.id} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Coupon Code *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="E.g., SAVE20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Type *</label>
                  <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'flat' })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5">
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Discount Value *</label>
                  <input type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter discount value" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Max Discount (₹)</label>
                  <input type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Maximum discount amount" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Min Purchase (₹)</label>
                  <input type="number" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Minimum purchase required" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Valid From</label>
                  <input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Valid Upto *</label>
                  <input type="date" value={formData.validUpto} onChange={(e) => setFormData({ ...formData, validUpto: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5 resize-none h-24" placeholder="Coupon description" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
