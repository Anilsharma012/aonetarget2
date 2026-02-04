import React, { useState, useEffect } from 'react';
import { buyersAPI } from '../../../src/services/apiClient';

interface Buyer {
  id: string;
  date: string;
  email: string;
  paymentMethod: string;
  amount: number;
  paymentAmount: number;
  coupon: string;
  method: string;
  status: 'successful' | 'failed' | 'pending';
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Buyers: React.FC<Props> = ({ showToast }) => {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [filteredBuyers, setFilteredBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState<Buyer | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    paymentMethod: '',
    amount: 0,
    paymentAmount: 0,
    coupon: '',
    method: 'online',
    status: 'successful' as 'successful' | 'failed' | 'pending'
  });

  useEffect(() => {
    loadBuyers();
  }, []);

  useEffect(() => {
    let filtered = buyers;

    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    setFilteredBuyers(filtered);
    setCurrentPage(1);
  }, [buyers, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBuyers = filteredBuyers.slice(startIndex, endIndex);

  const loadBuyers = async () => {
    try {
      setLoading(true);
      const data = await buyersAPI.getAll();
      setBuyers(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load buyers', 'error');
      // Use demo data if API fails
      setBuyers([
        {
          id: 'BUY-001',
          date: '2025-01-20',
          email: 'rahul.deshmukh@gmail.com',
          paymentMethod: 'Credit Card',
          amount: 5000,
          paymentAmount: 5000,
          coupon: 'SAVE20',
          method: 'online',
          status: 'successful'
        },
        {
          id: 'BUY-002',
          date: '2025-01-21',
          email: 'sneha.patil@gmail.com',
          paymentMethod: 'Debit Card',
          amount: 3500,
          paymentAmount: 3500,
          coupon: 'N/A',
          method: 'online',
          status: 'successful'
        },
        {
          id: 'BUY-003',
          date: '2025-01-22',
          email: 'vikram.singh@gmail.com',
          paymentMethod: 'UPI',
          amount: 7000,
          paymentAmount: 7000,
          coupon: 'FLAT500',
          method: 'online',
          status: 'successful'
        },
        {
          id: 'BUY-004',
          date: '2025-01-23',
          email: 'pooja.verma@gmail.com',
          paymentMethod: 'Net Banking',
          amount: 4500,
          paymentAmount: 4000,
          coupon: 'WELCOME10',
          method: 'online',
          status: 'pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBuyer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.paymentMethod || !formData.amount) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const newBuyer: Buyer = {
        id: `BUY-${String(buyers.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        ...formData
      };

      await buyersAPI.create(newBuyer);
      setBuyers([...buyers, newBuyer]);
      resetForm();
      setShowAddModal(false);
      showToast(`Buyer ${newBuyer.email} added successfully`, 'success');
    } catch (error) {
      showToast('Failed to add buyer', 'error');
    }
  };

  const handleEditBuyer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBuyer) return;

    try {
      const updatedBuyer: Buyer = {
        ...selectedBuyer,
        ...formData
      };

      await buyersAPI.update(selectedBuyer.id, updatedBuyer);
      setBuyers(buyers.map(b => b.id === selectedBuyer.id ? updatedBuyer : b));
      resetForm();
      setShowEditModal(false);
      setSelectedBuyer(null);
      showToast('Buyer updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update buyer', 'error');
    }
  };

  const handleDeleteBuyer = async (buyerId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    try {
      await buyersAPI.delete(buyerId);
      setBuyers(buyers.filter(b => b.id !== buyerId));
      showToast(`${email} has been deleted`, 'success');
    } catch (error) {
      showToast('Failed to delete buyer', 'error');
    }
  };

  const handleEditClick = (buyer: Buyer) => {
    setSelectedBuyer(buyer);
    setFormData({
      email: buyer.email,
      paymentMethod: buyer.paymentMethod,
      amount: buyer.amount,
      paymentAmount: buyer.paymentAmount,
      coupon: buyer.coupon,
      method: buyer.method,
      status: buyer.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      paymentMethod: '',
      amount: 0,
      paymentAmount: 0,
      coupon: '',
      method: 'online',
      status: 'successful'
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Date', 'Email', 'Payment Method', 'Amount', 'Payment Amount', 'Coupon', 'Method', 'Status'];
      const rows = filteredBuyers.map(b => [
        b.id,
        b.date,
        b.email,
        b.paymentMethod,
        b.amount,
        b.paymentAmount,
        b.coupon,
        b.method,
        b.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `buyers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported ${filteredBuyers.length} buyer(s) to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Buyers List</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage All Customer Transactions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-6 py-3 bg-white border border-gray-200 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Export CSV</button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="px-6 py-4 bg-navy text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all">+ Add Buyer</button>
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
            placeholder="Search by email, ID or payment method..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none"
        >
          <option value="all">Status: All</option>
          <option value="successful">Successful</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading buyers...</div>
        ) : filteredBuyers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No buyers found</div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F8F9FA] font-black text-gray-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">Date</th>
                <th className="px-6 py-4 border-b border-gray-100">Email</th>
                <th className="px-6 py-4 border-b border-gray-100">Payment Status</th>
                <th className="px-6 py-4 border-b border-gray-100">Student Details</th>
                <th className="px-6 py-4 border-b border-gray-100">Amount</th>
                <th className="px-6 py-4 border-b border-gray-100">Payment Amount</th>
                <th className="px-6 py-4 border-b border-gray-100">Coupon</th>
                <th className="px-6 py-4 border-b border-gray-100">Method</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Status</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBuyers.map(b => (
                <tr key={b.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy">{new Date(b.date).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-gray-600">{b.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy uppercase bg-gray-100 px-2 py-1 rounded-md w-fit inline-block">{b.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600">{b.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy">₹{b.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy">₹{b.paymentAmount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600">{b.coupon}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy uppercase bg-blue-100 px-2 py-1 rounded-md">{b.method}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase inline-block ${
                      b.status === 'successful' ? 'bg-green-100 text-green-600' :
                      b.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity flex-wrap">
                      <button onClick={() => handleEditClick(b)} title="Edit" className="p-2 bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteBuyer(b.id, b.email)} title="Delete" className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredBuyers.length > 0 && (
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredBuyers.length)} of {filteredBuyers.length}
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

      {/* Add Buyer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Add New Buyer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddBuyer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Payment Method *</label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="E.g., UPI, Credit Card"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Amount *</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Payment Amount</label>
                  <input
                    type="number"
                    value={formData.paymentAmount}
                    onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter payment amount"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Coupon</label>
                  <input
                    type="text"
                    value={formData.coupon}
                    onChange={(e) => setFormData({ ...formData, coupon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter coupon code"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'successful' | 'pending' | 'failed' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all">Add Buyer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Buyer Modal */}
      {showEditModal && selectedBuyer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Edit Buyer</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditBuyer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Buyer ID</label>
                  <input type="text" disabled value={selectedBuyer.id} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold bg-gray-50 cursor-not-allowed" />
                </div>
                <div></div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter email" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Payment Method *</label>
                  <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="E.g., UPI, Credit Card" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Amount *</label>
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter amount" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Payment Amount</label>
                  <input type="number" value={formData.paymentAmount} onChange={(e) => setFormData({ ...formData, paymentAmount: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter payment amount" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Coupon</label>
                  <input type="text" value={formData.coupon} onChange={(e) => setFormData({ ...formData, coupon: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter coupon code" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'successful' | 'pending' | 'failed' })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5">
                    <option value="successful">Successful</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
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

export default Buyers;
