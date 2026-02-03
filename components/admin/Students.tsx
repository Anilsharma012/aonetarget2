import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../../api';

interface Student {
  id: string;
  name: string;
  phone: string;
  course: string;
  city: string;
  email?: string;
  status: 'active' | 'inactive';
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
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    course: '',
    city: '',
    status: 'active' as 'active' | 'inactive'
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
        s.phone.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchQuery, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsAPI.getAll();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load students', 'error');
      // Use demo data if API fails
      setStudents([
        { id: 'ST-2001', name: 'Rahul Deshmukh', phone: '9845210022', course: 'NEET Droppers Batch', city: 'Pune', status: 'active' },
        { id: 'ST-2002', name: 'Sneha Patil', phone: '8876543210', course: 'Nursing CET 2025', city: 'Nagpur', status: 'active' },
        { id: 'ST-2003', name: 'Vikram Singh', phone: '7766554433', course: 'Class 12th PCM', city: 'Delhi', status: 'active' },
        { id: 'ST-2004', name: 'Pooja Verma', phone: '9988776655', course: 'Physics Crash Course', city: 'Indore', status: 'active' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateStudentId = () => {
    const maxId = Math.max(0, ...students.map(s => {
      const num = parseInt(s.id.replace('ST-', ''));
      return isNaN(num) ? 0 : num;
    }));
    return `ST-${maxId + 1}`;
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.course) {
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
      showToast('Failed to add student', 'error');
      // Still add locally if API fails
      const newStudent: Student = {
        id: generateStudentId(),
        ...formData
      };
      setStudents([...students, newStudent]);
      resetForm();
      setShowAddModal(false);
      showToast(`Student ${newStudent.name} added (offline mode)`, 'success');
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
      showToast('Failed to update student', 'error');
      // Still update locally if API fails
      const updatedStudent: Student = {
        ...selectedStudent,
        ...formData
      };
      setStudents(students.map(s => s.id === selectedStudent.id ? updatedStudent : s));
      resetForm();
      setShowEditModal(false);
      setSelectedStudent(null);
      showToast('Student updated (offline mode)', 'success');
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
      showToast('Failed to delete student', 'error');
      // Still delete locally if API fails
      setStudents(students.filter(s => s.id !== studentId));
      showToast(`${studentName} deleted (offline mode)`, 'success');
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
      phone: student.phone,
      email: student.email || '',
      course: student.course,
      city: student.city,
      status: student.status
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      course: '',
      city: '',
      status: 'active'
    });
  };

  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Name', 'Phone', 'Email', 'Course', 'City', 'Status'];
      const rows = filteredStudents.map(s => [
        s.id,
        s.name,
        s.phone,
        s.email || '',
        s.course,
        s.city,
        s.status
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
            placeholder="Search by name, ID or mobile..."
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
          <button className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-navy"><span className="material-icons-outlined text-sm">filter_alt</span></button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No students found</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FA] text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-8 py-5 border-b border-gray-100">Full Name / ID</th>
                <th className="px-8 py-5 border-b border-gray-100">Assigned Package</th>
                <th className="px-8 py-5 border-b border-gray-100 text-center">Status</th>
                <th className="px-8 py-5 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-blue-50/20 transition-colors border-b border-gray-50 group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-navy/5 rounded-xl flex items-center justify-center font-black text-navy text-[10px]">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-navy uppercase tracking-tight">{s.name}</p>
                        <p className="text-[10px] font-bold text-gray-300">ID: {s.id} • {s.phone} • {s.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-navy/40 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{s.course}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${s.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleViewStudent(s)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-navy hover:bg-navy hover:text-white transition-all shadow-sm" title="View"><span className="material-icons-outlined text-sm">visibility</span></button>
                      <button onClick={() => handleEditClick(s)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-teal-600 hover:bg-teal-600 hover:text-white transition-all shadow-sm" title="Edit"><span className="material-icons-outlined text-sm">edit</span></button>
                      <button onClick={() => handleDeleteStudent(s.id, s.name)} className="p-2.5 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Delete"><span className="material-icons-outlined text-sm">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-navy uppercase">Add New Student</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
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
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  placeholder="Enter email"
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
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-navy uppercase">Edit Student</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleEditStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Student ID</label>
                <input
                  type="text"
                  disabled
                  value={selectedStudent.id}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold bg-gray-50 cursor-not-allowed"
                />
              </div>
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
                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-navy/5"
                  placeholder="Enter email"
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
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Phone</p>
                <p className="text-sm font-bold text-navy">{selectedStudent.phone}</p>
              </div>
              {selectedStudent.email && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Email</p>
                  <p className="text-sm font-bold text-navy">{selectedStudent.email}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Course</p>
                <p className="text-sm font-bold text-navy">{selectedStudent.course}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">City</p>
                <p className="text-sm font-bold text-navy">{selectedStudent.city}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status</p>
                <span className={`inline-block px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${selectedStudent.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {selectedStudent.status}
                </span>
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
    </div>
  );
};

export default Students;
