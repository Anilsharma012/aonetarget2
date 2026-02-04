import React, { useState, useEffect } from 'react';
import { pdfsAPI } from '../../src/services/apiClient';

interface PDF {
  id: string;
  title: string;
  subject: string;
  course: string;
  fileUrl: string;
  fileSize?: string;
  createdAt: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const PDFs: React.FC<Props> = ({ showToast }) => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', subject: '', course: '', fileUrl: '', fileSize: '' });

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const data = await pdfsAPI.getAll();
      setPdfs(data);
    } catch (error) {
      showToast('Failed to load PDFs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const pdfData = {
        id: `pdf_${Date.now()}`,
        title: formData.title,
        subject: formData.subject,
        course: formData.course,
        fileUrl: formData.fileUrl,
        fileSize: formData.fileSize,
        createdAt: new Date().toISOString()
      };

      await pdfsAPI.create(pdfData);
      showToast('PDF uploaded successfully!');

      setShowModal(false);
      setFormData({ title: '', subject: '', course: '', fileUrl: '', fileSize: '' });
      loadPDFs();
    } catch (error) {
      showToast('Failed to upload PDF', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this PDF?')) {
      try {
        await pdfsAPI.delete(id);
        showToast('PDF deleted successfully!');
        loadPDFs();
      } catch (error) {
        showToast('Failed to delete PDF', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">PDF Assets</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {pdfs.length} Documents</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-navy text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase shadow-xl tracking-widest"
        >
          + Upload PDF
        </button>
      </div>

      {pdfs.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <span className="material-icons-outlined text-7xl text-red-200">picture_as_pdf</span>
          <p className="font-black mt-2 uppercase tracking-widest text-gray-300">No Documents Found</p>
        </div>
      ) : (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pdfs.map(pdf => (
            <div key={pdf.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-navy/20 transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-outlined text-red-500">picture_as_pdf</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-navy text-sm truncate">{pdf.title}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{pdf.subject} • {pdf.course}</p>
                  <p className="text-[9px] text-gray-300 mt-2">{pdf.fileSize || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => handleDelete(pdf.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-icons-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md mx-4">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">Upload PDF</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Document Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="File URL"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
              <input
                type="text"
                placeholder="File Size (e.g., 2.5 MB)"
                value={formData.fileSize}
                onChange={(e) => setFormData({ ...formData, fileSize: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              />
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
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFs;
