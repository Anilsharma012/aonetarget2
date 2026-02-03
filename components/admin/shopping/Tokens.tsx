import React, { useState, useEffect } from 'react';
import { tokensAPI } from '../../../api';

interface Token {
  id: string;
  code: string;
  value: number;
  quantity: number;
  usedQuantity: number;
  expiryDate: string;
  type: 'credit' | 'exam' | 'class';
  status: 'active' | 'expired' | 'inactive';
  createdDate: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Tokens: React.FC<Props> = ({ showToast }) => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    value: 0,
    quantity: 0,
    expiryDate: '',
    type: 'credit' as 'credit' | 'exam' | 'class',
    status: 'active' as 'active' | 'expired' | 'inactive'
  });

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    let filtered = tokens;

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTokens(filtered);
    setCurrentPage(1);
  }, [tokens, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredTokens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTokens = filteredTokens.slice(startIndex, endIndex);

  const loadTokens = async () => {
    try {
      setLoading(true);
      const data = await tokensAPI.getAll();
      setTokens(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load tokens', 'error');
      // Use demo data if API fails
      setTokens([
        {
          id: 'TKN-001',
          code: 'SAVE20',
          value: 500,
          quantity: 100,
          usedQuantity: 45,
          expiryDate: '2025-12-31',
          type: 'credit',
          status: 'active',
          createdDate: '2025-01-01'
        },
        {
          id: 'TKN-002',
          code: 'WELCOME100',
          value: 1000,
          quantity: 50,
          usedQuantity: 30,
          expiryDate: '2025-06-30',
          type: 'exam',
          status: 'active',
          createdDate: '2025-01-05'
        },
        {
          id: 'TKN-003',
          code: 'CLASS50',
          value: 250,
          quantity: 200,
          usedQuantity: 120,
          expiryDate: '2025-03-31',
          type: 'class',
          status: 'active',
          createdDate: '2025-01-10'
        },
        {
          id: 'TKN-004',
          code: 'EXPIRED2024',
          value: 750,
          quantity: 75,
          usedQuantity: 75,
          expiryDate: '2024-12-31',
          type: 'credit',
          status: 'expired',
          createdDate: '2024-06-01'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.value || !formData.quantity) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    const newToken: Token = {
      id: `TKN-${String(tokens.length + 1).padStart(3, '0')}`,
      ...formData,
      usedQuantity: 0,
      createdDate: new Date().toISOString().split('T')[0]
    };

    setTokens([...tokens, newToken]);
    resetForm();
    setShowAddModal(false);
    showToast(`Token ${newToken.code} created successfully`, 'success');
  };

  const handleEditToken = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedToken) return;

    const updatedToken: Token = {
      ...selectedToken,
      ...formData
    };

    setTokens(tokens.map(t => t.id === selectedToken.id ? updatedToken : t));
    resetForm();
    setShowEditModal(false);
    setSelectedToken(null);
    showToast('Token updated successfully', 'success');
  };

  const handleDeleteToken = (tokenId: string, code: string) => {
    if (!confirm(`Are you sure you want to delete ${code}?`)) {
      return;
    }

    setTokens(tokens.filter(t => t.id !== tokenId));
    showToast(`${code} has been deleted`, 'success');
  };

  const handleEditClick = (token: Token) => {
    setSelectedToken(token);
    setFormData({
      code: token.code,
      value: token.value,
      quantity: token.quantity,
      expiryDate: token.expiryDate,
      type: token.type,
      status: token.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      value: 0,
      quantity: 0,
      expiryDate: '',
      type: 'credit',
      status: 'active'
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Code', 'Value', 'Quantity', 'Used', 'Available', 'Expiry Date', 'Type', 'Status'];
      const rows = filteredTokens.map(t => [
        t.id,
        t.code,
        t.value,
        t.quantity,
        t.usedQuantity,
        t.quantity - t.usedQuantity,
        t.expiryDate,
        t.type,
        t.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tokens-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported ${filteredTokens.length} token(s) to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export CSV', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Tokens Management</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage Credit & Exam Tokens</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-6 py-3 bg-white border border-gray-200 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Export CSV</button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="px-6 py-4 bg-navy text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all">+ Create Token</button>
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
            placeholder="Search by token code or ID..."
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
          <div className="p-8 text-center text-gray-400">Loading tokens...</div>
        ) : filteredTokens.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No tokens found</div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F8F9FA] font-black text-gray-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-6 py-4 border-b border-gray-100">Token Code</th>
                <th className="px-6 py-4 border-b border-gray-100">Value</th>
                <th className="px-6 py-4 border-b border-gray-100">Total Qty</th>
                <th className="px-6 py-4 border-b border-gray-100">Used</th>
                <th className="px-6 py-4 border-b border-gray-100">Available</th>
                <th className="px-6 py-4 border-b border-gray-100">Expiry Date</th>
                <th className="px-6 py-4 border-b border-gray-100">Type</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Status</th>
                <th className="px-6 py-4 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTokens.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center font-black text-navy text-[9px]">
                        {t.code.charAt(0)}
                      </div>
                      <span className="font-bold text-navy">{t.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-navy">₹{t.value}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-gray-600">{t.quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-red-600">{t.usedQuantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-green-600">{t.quantity - t.usedQuantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-gray-600">{new Date(t.expiryDate).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-black text-navy uppercase bg-blue-100 px-2 py-1 rounded-md w-fit inline-block capitalize">{t.type}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase inline-block ${
                      t.status === 'active' ? 'bg-green-100 text-green-600' :
                      t.status === 'expired' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity flex-wrap">
                      <button onClick={() => handleEditClick(t)} title="Edit" className="p-2 bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteToken(t.id, t.code)} title="Delete" className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {filteredTokens.length > 0 && (
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredTokens.length)} of {filteredTokens.length}
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

      {/* Add Token Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Create New Token</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddToken} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Token Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="E.g., SAVE20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Value (₹) *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter token value"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'exam' | 'class' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="credit">Credit</option>
                    <option value="exam">Exam</option>
                    <option value="class">Class</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'expired' | 'inactive' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all">Create Token</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Token Modal */}
      {showEditModal && selectedToken && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Edit Token</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditToken} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Token ID</label>
                  <input type="text" disabled value={selectedToken.id} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold bg-gray-50 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Token Code *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="E.g., SAVE20" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Value (₹) *</label>
                  <input type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter token value" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Quantity *</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" placeholder="Enter quantity" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Expiry Date</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as 'credit' | 'exam' | 'class' })} className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5">
                    <option value="credit">Credit</option>
                    <option value="exam">Exam</option>
                    <option value="class">Class</option>
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

export default Tokens;
