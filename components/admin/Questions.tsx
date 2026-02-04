import React, { useState, useEffect } from 'react';
import { questionsAPI } from '../../src/services/apiClient';

interface Question {
  id: string;
  question: string;
  subject: string;
  topic: string;
  difficulty: string;
  answer: string;
  options?: string[];
}

interface Props {
  showToast: (m: string, type?: 'success' | 'error') => void;
}

const Questions: React.FC<Props> = ({ showToast }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({ question: '', subject: '', topic: '', difficulty: 'easy', answer: '' });

  useEffect(() => {
    loadQuestions();
  }, []);

  useEffect(() => {
    filterQuestions();
  }, [questions, searchQuery, subjectFilter]);

  const loadQuestions = async () => {
    try {
      const data = await questionsAPI.getAll();
      setQuestions(data);
    } catch (error) {
      showToast('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterQuestions = () => {
    let filtered = questions;
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(q => q.subject.toLowerCase() === subjectFilter.toLowerCase());
    }
    setFilteredQuestions(filtered);
  };

  const handleSubmit = async () => {
    try {
      const questionData = {
        id: editingQuestion?.id || `Q${Date.now()}`,
        question: formData.question,
        subject: formData.subject,
        topic: formData.topic,
        difficulty: formData.difficulty,
        answer: formData.answer
      };

      if (editingQuestion) {
        await questionsAPI.update(editingQuestion.id, questionData);
        showToast('Question updated successfully!');
      } else {
        await questionsAPI.create(questionData);
        showToast('Question created successfully!');
      }

      setShowModal(false);
      setEditingQuestion(null);
      setFormData({ question: '', subject: '', topic: '', difficulty: 'easy', answer: '' });
      loadQuestions();
    } catch (error) {
      showToast('Failed to save question', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await questionsAPI.delete(id);
        showToast('Question deleted successfully!');
        loadQuestions();
      } catch (error) {
        showToast('Failed to delete question', 'error');
      }
    }
  };

  const openEditModal = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty,
      answer: question.answer
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
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 animate-fade-in overflow-hidden">
      <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
        <div>
          <h3 className="text-xl font-black text-navy uppercase tracking-widest">Question Repository</h3>
          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">Total: {questions.length} Questions</p>
        </div>
        <button 
          onClick={() => { setEditingQuestion(null); setFormData({ question: '', subject: '', topic: '', difficulty: 'easy', answer: '' }); setShowModal(true); }}
          className="bg-navy text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-xl tracking-widest hover:scale-105 transition-all flex items-center gap-2"
        >
          <span className="material-icons-outlined text-sm">add</span> Add New Question
        </button>
      </div>
      
      <div className="p-6 border-b border-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select 
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 outline-none"
        >
          <option value="all">Subject: All</option>
          <option value="physics">Physics</option>
          <option value="biology">Biology</option>
          <option value="chemistry">Chemistry</option>
        </select>
        <select className="bg-gray-50 border border-gray-100 p-4 rounded-2xl text-[10px] font-black uppercase text-gray-500 outline-none">
          <option>Difficulty: All</option>
          <option value="easy">Level: Easy</option>
          <option value="medium">Level: Medium</option>
          <option value="hard">Level: Hard</option>
        </select>
        <div className="md:col-span-2 relative">
          <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">search</span>
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 rounded-2xl text-[11px] font-bold uppercase text-navy outline-none" 
            placeholder="Search by Q-ID or Topic keywords..." 
          />
        </div>
      </div>

      <div className="p-8 space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 opacity-50">
            <span className="material-icons-outlined text-6xl text-gray-200">help_outline</span>
            <p className="font-black mt-4 uppercase tracking-widest text-gray-400">No Questions Found</p>
          </div>
        ) : (
          filteredQuestions.map(q => (
            <div key={q.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 hover:border-navy/20 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black bg-navy text-white px-3 py-1 rounded-lg uppercase tracking-widest">Q-ID: #{q.id}</span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(q)} className="p-2 bg-white rounded-lg shadow-sm text-blue-600">
                    <span className="material-icons-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => handleDelete(q.id)} className="p-2 bg-white rounded-lg shadow-sm text-red-500">
                    <span className="material-icons-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              <p className="text-sm font-bold text-navy mb-4 leading-relaxed">{q.question}</p>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Subject: {q.subject}</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Topic: {q.topic}</span>
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest ml-auto">Ans: {q.answer}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-navy uppercase tracking-widest mb-6">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            <div className="space-y-4">
              <textarea
                placeholder="Enter question text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none resize-none"
                rows={4}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Subject (e.g., Physics)"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="text"
                  placeholder="Topic (e.g., Kinematics)"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
                />
              </div>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-xs font-bold outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="text"
                placeholder="Answer"
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
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
                {editingQuestion ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
