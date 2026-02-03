import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../../api';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  course: string;
  city: string;
  registrationDate: string;
  registrationType: string;
  status: 'active' | 'inactive';
  paymentStatus: 'paid' | 'pending' | 'failed';
  notes?: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Students: React.FC<Props> = ({ showToast }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    course: '',
    city: '',
    registrationDate: new Date().toISOString().split('T')[0],
    registrationType: 'regular',
    status: 'active' as 'active' | 'inactive',
    paymentStatus: 'pending' as 'paid' | 'pending' | 'failed',
    notes: ''
  });

  // Load students on mount
  useEffect(() => {
    loadStudents();
  }, []);

  // Filter students based on search and status
  useEffect(() => {
    let filtered = students;

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [students, searchQuery, statusFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsAPI.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load students:', error);
      showToast('Failed to connect to database. Please check server connection.', 'error');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const generateStudentId = () => {
    const maxId = Math.max(0, ...students.map(s => {
      const num = parseInt(s.id.replace('ST-', ''));
      return isNaN(num) ? 0 : num;
    }));
    return `ST-${String(maxId + 1).padStart(4, '0')}`;
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.course) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const newStudent: Student = {
        id: generateStudentId(),
        ...formData
      };

      await studentsAPI.create(newStudent);
      setStudents([...students, newStudent]);
      resetForm();
      setShowAddModal(false);
      showToast(`Student ${newStudent.name} added successfully`, 'success');
    } catch (error) {
      console.error('Add student error:', error);
      showToast('Failed to add student to database. Please try again.', 'error');
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) return;

    try {
      const updatedStudent: Student = {
        ...selectedStudent,
        ...formData
      };

      await studentsAPI.update(selectedStudent.id, updatedStudent);
      setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
      resetForm();
      setShowEditModal(false);
      setSelectedStudent(null);
      showToast('Student updated successfully', 'success');
    } catch (error) {
      console.error('Update student error:', error);
      showToast('Failed to update student. Please try again.', 'error');
    }
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`Are you sure you want to delete ${studentName}?`)) {
      return;
    }

    try {
      await studentsAPI.delete(studentId);
      setStudents(students.filter(s => s.id !== studentId));
      showToast(`${studentName} has been deleted`, 'success');
    } catch (error) {
      console.error('Delete student error:', error);
      showToast('Failed to delete student. Please try again.', 'error');
    }
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      dob: student.dob,
      course: student.course,
      city: student.city,
      registrationDate: student.registrationDate,
      registrationType: student.registrationType,
      status: student.status,
      paymentStatus: student.paymentStatus,
      notes: student.notes || ''
    });
    setShowEditModal(true);
  };

  const handleFeesClick = (student: Student) => {
    setSelectedStudent(student);
    setShowFeesModal(true);
  };

  const handleNotesClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData(prev => ({ ...prev, notes: student.notes || '' }));
    setShowNotesModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      dob: '',
      course: '',
      city: '',
      registrationDate: new Date().toISOString().split('T')[0],
      registrationType: 'regular',
      status: 'active',
      paymentStatus: 'pending',
      notes: ''
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'DOB', 'Course', 'City', 'Reg Date', 'Reg Type', 'Status', 'Payment'];
      const rows = filteredStudents.map(s => [
        s.id,
        s.name,
        s.email,
        s.phone,
        s.dob,
        s.course,
        s.city,
        s.registrationDate,
        s.registrationType,
        s.status,
        s.paymentStatus
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast(`Exported ${filteredStudents.length} student(s) to CSV`, 'success');
    } catch (error) {
      showToast('Failed to export CSV', 'error');
    }
  };

  const updatePaymentStatus = async (studentId: string, status: 'paid' | 'pending' | 'failed') => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      const updated = { ...student, paymentStatus: status };
      try {
        await studentsAPI.update(studentId, updated);
        setStudents(students.map(s => s.id === studentId ? updated : s));
        showToast(`Payment status updated to ${status}`, 'success');
      } catch (error) {
        console.error('Update payment status error:', error);
        showToast('Failed to update payment status', 'error');
      }
    }
  };

  const saveNotes = async () => {
    if (!selectedStudent) return;
    
    try {
      const updated = { ...selectedStudent, notes: formData.notes };
      await studentsAPI.update(selectedStudent.id, updated);
      setStudents(students.map(s => s.id === selectedStudent.id ? updated : s));
      setShowNotesModal(false);
      showToast('Notes saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save notes', 'error');
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-8 border-b border-gray-100 flex flex-wrap justify-between items-center bg-gray-50/30 gap-6">
        <div>
          <h3 className="text-2xl font-black text-navy uppercase tracking-tighter">Student Directory</h3>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Monitor Enrollment & Student Lifecycle</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExportCSV} className="px-6 py-3 bg-white border border-gray-200 text-navy text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">Export CSV</button>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="px-6 py-4 bg-navy text-white text-[10px] font-black rounded-2xl shadow-xl uppercase tracking-widest hover:scale-105 transition-all">+ Add New Student</button>
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
            placeholder="Search by name, email, ID or mobile..."
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 outline-none"
          >
            <option value="all">Status: All</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No students found</div>
        ) : (
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F8F9FA] font-black text-gray-400 uppercase tracking-widest sticky top-0">
              <tr>
                <th className="px-4 py-4 border-b border-gray-100">Name</th>
                <th className="px-4 py-4 border-b border-gray-100">Email</th>
                <th className="px-4 py-4 border-b border-gray-100">Contact</th>
                <th className="px-4 py-4 border-b border-gray-100">DOB</th>
                <th className="px-4 py-4 border-b border-gray-100">Course</th>
                <th className="px-4 py-4 border-b border-gray-100">Reg. Date</th>
                <th className="px-4 py-4 border-b border-gray-100">Reg. Type</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center">Status</th>
                <th className="px-4 py-4 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map(s => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-navy/10 rounded-lg flex items-center justify-center font-black text-navy text-[9px]">
                        {s.name.charAt(0)}
                      </div>
                      <span className="font-bold text-navy">{s.name}</span>
                      <span className="text-[9px] text-gray-400">{s.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] text-gray-600">{s.email}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] font-bold text-navy">{s.phone}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] text-gray-600">{new Date(s.dob).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[9px] font-black text-navy/40 uppercase bg-gray-100 px-2 py-1 rounded-md w-fit inline-block">{s.course}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[10px] text-gray-600">{new Date(s.registrationDate).toLocaleDateString('en-IN')}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[9px] font-bold text-navy uppercase bg-blue-100 px-2 py-1 rounded-md">{s.registrationType}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase inline-block ${s.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex justify-center gap-1 opacity-30 group-hover:opacity-100 transition-opacity flex-wrap">
                      <button onClick={() => handleViewStudent(s)} title="View" className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">visibility</span></button>
                      <button onClick={() => handleEditClick(s)} title="Edit" className="p-2 bg-teal-100 text-teal-600 hover:bg-teal-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">edit</span></button>
                      <button onClick={() => handleFeesClick(s)} title="Fees" className="p-2 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">account_balance_wallet</span></button>
                      <button onClick={() => handleNotesClick(s)} title="Notes" className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">note</span></button>
                      <button onClick={() => handleDeleteStudent(s.id, s.name)} title="Delete" className="p-2 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white rounded-md transition-all text-[11px]"><span className="material-icons-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && (
        <div className="p-6 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-gray-400 uppercase">Items Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-black uppercase text-gray-600 outline-none hover:border-navy"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="text-[10px] font-black text-gray-400 uppercase">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-100 text-navy text-[10px] font-black rounded-lg uppercase hover:bg-navy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      currentPage === pageNum
                        ? 'bg-navy text-white'
                        : 'bg-gray-100 text-navy hover:bg-gray-200'
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
              className="px-4 py-2 bg-gray-100 text-navy text-[10px] font-black rounded-lg uppercase hover:bg-navy hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter full name"
                  />
                </div>
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">DOB</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Course *</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Reg. Type</label>
                  <select
                    value={formData.registrationType}
                    onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="regular">Regular</option>
                    <option value="bulk">Bulk</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">Edit Student</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Student ID</label>
                  <input
                    type="text"
                    disabled
                    value={selectedStudent.id}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold bg-gray-50 cursor-not-allowed"
                  />
                </div>
                <div></div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter full name"
                  />
                </div>
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
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">DOB</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Course *</label>
                  <input
                    type="text"
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Reg. Type</label>
                  <select
                    value={formData.registrationType}
                    onChange={(e) => setFormData({ ...formData, registrationType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="regular">Regular</option>
                    <option value="bulk">Bulk</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-navy uppercase">Student Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="w-12 h-12 bg-navy/10 rounded-xl flex items-center justify-center font-black text-navy text-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-navy uppercase tracking-tight">{selectedStudent.name}</p>
                  <p className="text-[10px] font-bold text-gray-300">{selectedStudent.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Email</p>
                  <p className="text-sm font-bold text-navy">{selectedStudent.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Phone</p>
                  <p className="text-sm font-bold text-navy">{selectedStudent.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">DOB</p>
                  <p className="text-sm font-bold text-navy">{new Date(selectedStudent.dob).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Course</p>
                  <p className="text-sm font-bold text-navy">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Reg. Date</p>
                  <p className="text-sm font-bold text-navy">{new Date(selectedStudent.registrationDate).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Reg. Type</p>
                  <p className="text-sm font-bold text-navy">{selectedStudent.registrationType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {selectedStudent.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Payment</p>
                  <span className={`inline-block px-3 py-1 rounded-md text-[9px] font-black uppercase ${selectedStudent.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : selectedStudent.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                    {selectedStudent.paymentStatus}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { handleEditClick(selectedStudent); setShowViewModal(false); }}
                  className="flex-1 px-4 py-3 bg-teal-100 text-teal-600 text-[10px] font-black rounded-xl uppercase hover:bg-teal-200 transition-all"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fees Management Modal */}
      {showFeesModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-navy uppercase">Manage Fees - {selectedStudent.name}</h3>
              <button onClick={() => setShowFeesModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] font-black text-gray-400 uppercase mb-2">Current Status</p>
                <span className={`inline-block px-4 py-2 rounded-lg text-[10px] font-black uppercase ${selectedStudent.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : selectedStudent.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                  {selectedStudent.paymentStatus}
                </span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => updatePaymentStatus(selectedStudent.id, 'paid')}
                  className="w-full px-4 py-3 bg-green-100 text-green-600 text-[10px] font-black rounded-xl uppercase hover:bg-green-600 hover:text-white transition-all"
                >
                  Mark as Paid
                </button>
                <button
                  onClick={() => updatePaymentStatus(selectedStudent.id, 'pending')}
                  className="w-full px-4 py-3 bg-yellow-100 text-yellow-600 text-[10px] font-black rounded-xl uppercase hover:bg-yellow-600 hover:text-white transition-all"
                >
                  Mark as Pending
                </button>
                <button
                  onClick={() => updatePaymentStatus(selectedStudent.id, 'failed')}
                  className="w-full px-4 py-3 bg-red-100 text-red-600 text-[10px] font-black rounded-xl uppercase hover:bg-red-600 hover:text-white transition-all"
                >
                  Mark as Failed
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowFeesModal(false)}
                className="w-full px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-navy uppercase">Notes - {selectedStudent.name}</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5 resize-none h-32"
                placeholder="Add notes about this student..."
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotesModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-navy text-[10px] font-black rounded-xl uppercase hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveNotes}
                  className="flex-1 px-4 py-3 bg-navy text-white text-[10px] font-black rounded-xl uppercase hover:bg-blue-900 transition-all"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
