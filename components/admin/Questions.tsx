import React, { useState, useEffect } from 'react';
import { questionsAPI } from '../../src/services/apiClient';

interface Question {
  id: string;
  questionText: string;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: 'mcq' | 'short-answer' | 'long-answer' | 'true-false';
  answer: string;
  options?: string[];
  createdDate: string;
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
  view?: 'list' | 'bank';
}

const Questions: React.FC<Props> = ({ showToast, view = 'list' }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  
  const [formData, setFormData] = useState({
    questionText: '',
    subject: '',
    topic: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    questionType: 'mcq' as 'mcq' | 'short-answer' | 'long-answer' | 'true-false',
    answer: '',
    options: ['', '', '', '']
  });

  const subjects = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English'];
  const topics = ['Kinematics', 'Thermodynamics', 'Optics', 'Atomic Structure', 'Organic Chemistry', 'Cell Division', 'Algebra', 'Geometry'];

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    if (searchQuery) {
      filtered = filtered.filter(q =>
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(q => q.subject === subjectFilter);
    }

    if (topicFilter !== 'all') {
      filtered = filtered.filter(q => q.topic === topicFilter);
    }

    setFilteredQuestions(filtered);
    setCurrentPage(1);
  }, [questions, searchQuery, subjectFilter, topicFilter]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await questionsAPI.getAll();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Starting with empty state - MongoDB may not have data yet');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.questionText || !formData.subject || !formData.answer) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    try {
      const questionData: Question = {
        id: editingQuestion?.id || `Q-${String(Date.now()).slice(-6)}`,
        questionText: formData.questionText,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        questionType: formData.questionType,
        answer: formData.answer,
        options: formData.questionType === 'mcq' ? formData.options.filter(o => o.trim()) : [],
        createdDate: editingQuestion?.createdDate || new Date().toISOString().split('T')[0]
      };

      console.log('Adding question:', questionData);

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, questionData);
        setQuestions(questions.map(q => q.id === editingQuestion.id ? questionData : q));
        showToast('Question updated successfully!', 'success');
      } else {
        await questionsAPI.create(questionData);
        setQuestions([...questions, questionData]);
        showToast('Question created successfully!', 'success');
      }

      resetForm();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error saving question:', error);
      showToast('Failed to save question', 'error');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      console.log('Deleting question:', id);
      await questionsAPI.delete(id);
      setQuestions(questions.filter(q => q.id !== id));
      showToast('Question deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting question:', error);
      showToast('Failed to delete question', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) return;
    if (!confirm(`Delete ${selectedQuestions.length} selected question(s)?`)) return;

    try {
      await Promise.all(selectedQuestions.map(id => questionsAPI.delete(id)));
      setQuestions(questions.filter(q => !selectedQuestions.includes(q.id)));
      setSelectedQuestions([]);
      showToast(`${selectedQuestions.length} question(s) deleted successfully!`, 'success');
    } catch (error) {
      console.error('Error deleting questions:', error);
      showToast('Failed to delete questions', 'error');
    }
  };

  const handleEditClick = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      questionType: question.questionType,
      answer: question.answer,
      options: question.options || ['', '', '', '']
    });
    setShowAddModal(true);
  };

  const toggleSelectAll = () => {
    if (selectedQuestions.length === paginatedQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(paginatedQuestions.map(q => q.id));
    }
  };

  const toggleSelectQuestion = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      subject: '',
      topic: '',
      difficulty: 'easy',
      questionType: 'mcq',
      answer: '',
      options: ['', '', '', '']
    });
    setEditingQuestion(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-600';
      case 'medium': return 'bg-yellow-100 text-yellow-600';
      case 'hard': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'mcq': return 'bg-blue-100 text-blue-600';
      case 'short-answer': return 'bg-purple-100 text-purple-600';
      case 'long-answer': return 'bg-indigo-100 text-indigo-600';
      case 'true-false': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy">
            {view === 'bank' ? 'Question Bank' : 'Question List'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {view === 'bank' ? 'Complete repository of exam questions' : 'Manage all questions in the system'}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {selectedQuestions.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <span className="material-icons-outlined text-lg">delete</span>
              Delete ({selectedQuestions.length})
            </button>
          )}
          <button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-6 py-3 bg-navy text-white text-sm font-bold rounded-xl hover:bg-navy/90 transition-colors flex items-center gap-2"
          >
            <span className="material-icons-outlined text-lg">add</span>
            Add Question
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 relative min-w-[250px]">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20 transition-all"
            placeholder="Search by question or ID..."
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-navy/20"
        >
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 outline-none focus:ring-2 focus:ring-navy/20"
        >
          <option value="all">All Topics</option>
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy mx-auto mb-2"></div>
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <span className="material-icons-outlined text-6xl text-gray-200 mb-2 block">help_outline</span>
              No questions found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.length === paginatedQuestions.length && paginatedQuestions.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-navy"
                    />
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Topic</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedQuestions.map((question, index) => (
                  <tr key={question.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleSelectQuestion(question.id)}
                        className="w-4 h-4 rounded border-gray-300 text-navy"
                      />
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-600">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-semibold text-navy line-clamp-2">{question.questionText}</span>
                      <span className="text-xs text-gray-400 mt-1 block">ID: {question.id}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{question.subject}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{question.topic}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold capitalize ${getTypeColor(question.questionType)}`}>
                        {(question.questionType || 'mcq').replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold capitalize ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditClick(question)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <span className="material-icons-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <span className="material-icons-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredQuestions.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredQuestions.length)} of {filteredQuestions.length} entries
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-gray-100 text-navy text-sm font-bold rounded-lg disabled:opacity-50"
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
                        : 'bg-gray-100 text-navy hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-gray-100 text-navy text-sm font-bold rounded-lg disabled:opacity-50"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-black text-navy uppercase">
                {editingQuestion ? 'Edit Question' : 'Add New Question'}
              </h3>
              <button
                onClick={() => { resetForm(); setShowAddModal(false); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddQuestion} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Question Text *</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20 resize-none"
                  placeholder="Enter the question"
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                  >
                    <option value="">Select Topic</option>
                    {topics.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Question Type *</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                    required
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="short-answer">Short Answer</option>
                    <option value="long-answer">Long Answer</option>
                    <option value="true-false">True/False</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              {formData.questionType === 'mcq' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Options</label>
                  <div className="space-y-2">
                    {formData.options.map((opt, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...formData.options];
                          newOpts[idx] = e.target.value;
                          setFormData({ ...formData, options: newOpts });
                        }}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                        placeholder={`Option ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Answer *</label>
                <input
                  type="text"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-navy/20"
                  placeholder="Enter the correct answer"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { resetForm(); setShowAddModal(false); }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-navy text-white text-sm font-bold rounded-lg hover:bg-navy/90 transition-colors"
                >
                  {editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
