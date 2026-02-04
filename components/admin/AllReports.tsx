import React, { useState, useEffect } from 'react';

interface Report {
  id: string;
  studentName: string;
  testName: string;
  course: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: string;
  completionDate: string;
  status: 'passed' | 'failed' | 'incomplete';
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const AllReports: React.FC<Props> = ({ showToast }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);

  // Analytics State
  const [showAnalytics, setShowAnalytics] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setReports([
        { id: '1', studentName: 'Rahul Kumar', testName: 'FUNDAMENTALS OF CHEMISTRY', course: 'NEET', score: 180, totalMarks: 200, accuracy: 90, timeTaken: '45m 30s', completionDate: '01-07-2024', status: 'passed' },
        { id: '2', studentName: 'Priya Singh', testName: 'FOSET-TEST MOCK TEST 1', course: 'NEET', score: 420, totalMarks: 720, accuracy: 58.3, timeTaken: '2h 45m', completionDate: '15-07-2024', status: 'passed' },
        { id: '3', studentName: 'Arjun Verma', testName: 'NEET MOCK TEST FOR 12 STD', course: 'IIT-JEE', score: 65, totalMarks: 90, accuracy: 72.2, timeTaken: '1h 50m', completionDate: '22-07-2024', status: 'passed' },
        { id: '4', studentName: 'Divya Patel', testName: 'TESTING FOR BOARDS', course: 'BOARDS', score: 68, totalMarks: 100, accuracy: 68, timeTaken: '1h 25m', completionDate: '25-07-2024', status: 'failed' },
        { id: '5', studentName: 'Anjali Sharma', testName: 'FREE MOCK TEST FOR NEET 2025', course: 'NEET', score: 156, totalMarks: 180, accuracy: 86.7, timeTaken: '1h 05m', completionDate: '27-07-2024', status: 'passed' },
        { id: '6', studentName: 'Ravi Kumar', testName: 'FINAL MOCK TEST BATCH 2024', course: 'IIT-JEE', score: 210, totalMarks: 300, accuracy: 70, timeTaken: '2h 50m', completionDate: '28-07-2024', status: 'passed' },
        { id: '7', studentName: 'Sana Khan', testName: 'MOCK AIIMS MOCK NEET TEST ST 1', course: 'NEET', score: 450, totalMarks: 720, accuracy: 62.5, timeTaken: '2h 30m', completionDate: '30-07-2024', status: 'incomplete' },
        { id: '8', studentName: 'Vikram Singh', testName: 'MOCK AIIMS MOCK NEET TEST ST 2', course: 'NEET', score: 380, totalMarks: 720, accuracy: 52.8, timeTaken: '2h 15m', completionDate: '01-08-2024', status: 'failed' },
      ]);
    } catch (error) {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !filterStatus || report.status === filterStatus;
    const matchesCourse = !filterCourse || report.course === filterCourse;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Analytics Calculations
  const avgScore = reports.length > 0 
    ? (reports.reduce((sum, r) => sum + (r.score / r.totalMarks) * 100, 0) / reports.length).toFixed(1)
    : 0;

  const passRate = reports.length > 0
    ? ((reports.filter(r => r.status === 'passed').length / reports.length) * 100).toFixed(1)
    : 0;

  const avgAccuracy = reports.length > 0
    ? (reports.reduce((sum, r) => sum + r.accuracy, 0) / reports.length).toFixed(1)
    : 0;

  const toggleSelectAll = () => {
    if (selectedReports.length === paginatedReports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(paginatedReports.map(r => r.id));
    }
  };

  const toggleSelectReport = (id: string) => {
    setSelectedReports(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const exportReport = () => {
    showToast('Exporting reports...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">All Reports</h2>
          <p className="text-sm text-gray-500 mt-1">Student test performance analytics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportReport}
            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <span className="material-icons-outlined text-lg">download</span>
            Export Reports
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span className="material-icons-outlined text-lg">analytics</span>
            Analytics
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      {showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Attempts</p>
                <p className="text-3xl font-black text-navy mt-2">{reports.length}</p>
              </div>
              <span className="material-icons-outlined text-5xl text-blue-200">quiz</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Score</p>
                <p className="text-3xl font-black text-navy mt-2">{avgScore}%</p>
              </div>
              <span className="material-icons-outlined text-5xl text-green-200">trending_up</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pass Rate</p>
                <p className="text-3xl font-black text-navy mt-2">{passRate}%</p>
              </div>
              <span className="material-icons-outlined text-5xl text-orange-200">check_circle</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Accuracy</p>
                <p className="text-3xl font-black text-navy mt-2">{avgAccuracy}%</p>
              </div>
              <span className="material-icons-outlined text-5xl text-purple-200">bullseye</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters Row */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <select
            value={filterCourse}
            onChange={(e) => { setFilterCourse(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 min-w-[150px]"
          >
            <option value="">All Courses</option>
            <option value="NEET">NEET</option>
            <option value="IIT-JEE">IIT-JEE</option>
            <option value="BOARDS">BOARDS</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <div className="flex-1"></div>

          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search student or test..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-navy/20 w-48"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReports.length === paginatedReports.length && paginatedReports.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                  />
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Time Taken</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <span className="material-icons-outlined text-6xl text-gray-200 mb-2 block">assessment</span>
                    <p className="text-gray-400 font-medium">No reports found</p>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReports.includes(report.id)}
                        onChange={() => toggleSelectReport(report.id)}
                        className="w-4 h-4 rounded border-gray-300 text-navy focus:ring-navy"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-navy">{report.studentName}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{report.testName}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{report.course}</td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-block bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">
                        {report.score}/{report.totalMarks}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{ width: `${report.accuracy}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-8">{report.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{report.timeTaken}</td>
                    <td className="px-4 py-4 text-sm text-gray-600">{report.completionDate}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        report.status === 'passed'
                          ? 'bg-green-100 text-green-600'
                          : report.status === 'failed'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredReports.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                First
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 text-sm font-bold rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-navy text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
