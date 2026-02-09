import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../../src/services/apiClient';
import FileUploadButton from '../shared/FileUploadButton';

interface Course {
  id: string;
  name: string;
  title?: string;
}

interface Video {
  id: string;
  courseId: string;
  title: string;
  description: string;
  youtubeUrl: string;
  duration: string;
  isFree: boolean;
  order: number;
  status: 'active' | 'inactive';
}

interface Note {
  id: string;
  courseId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  isFree: boolean;
  order: number;
  status: 'active' | 'inactive';
}

interface Test {
  id: string;
  courseId: string;
  name: string;
  description: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  numberOfQuestions: number;
  openDate: string;
  closeDate: string;
  isFree: boolean;
  status: 'active' | 'inactive';
  questions: Question[];
}

interface Question {
  id: string;
  question: string;
  questionImage?: string;
  optionA: string;
  optionAImage?: string;
  optionB: string;
  optionBImage?: string;
  optionC: string;
  optionCImage?: string;
  optionD: string;
  optionDImage?: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
  negativeMarks?: number;
}

interface Props {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const API_BASE_URL = '/api';

const CourseContentManager: React.FC<Props> = ({ showToast }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'notes' | 'tests'>('videos');
  const [loading, setLoading] = useState(true);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentTestForQuestions, setCurrentTestForQuestions] = useState<Test | null>(null);

  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    duration: '',
    isFree: false,
    order: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileSize: '',
    isFree: false,
    order: 0,
    status: 'active' as 'active' | 'inactive'
  });

  const [testForm, setTestForm] = useState({
    name: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    numberOfQuestions: 0,
    marksPerQuestion: 4,
    negativeMarking: 0,
    openDate: '',
    closeDate: '',
    isFree: false,
    status: 'active' as 'active' | 'inactive'
  });

  const [questionForm, setQuestionForm] = useState({
    question: '',
    questionImage: '',
    optionA: '',
    optionAImage: '',
    optionB: '',
    optionBImage: '',
    optionC: '',
    optionCImage: '',
    optionD: '',
    optionDImage: '',
    correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    marks: 4,
    negativeMarks: 0
  });

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      loadCourseContent();
    }
  }, [selectedCourse]);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseContent = async () => {
    if (!selectedCourse) return;
    try {
      const [videosRes, notesRes, testsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/videos`),
        fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/notes`),
        fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/tests`)
      ]);
      
      const videosData = await videosRes.json();
      const notesData = await notesRes.json();
      const testsData = await testsRes.json();
      
      setVideos(Array.isArray(videosData) ? videosData : []);
      setNotes(Array.isArray(notesData) ? notesData : []);
      setTests(Array.isArray(testsData) ? testsData : []);
    } catch (error) {
      console.error('Error loading course content:', error);
    }
  };

  const extractYouTubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const handleVideoSubmit = async () => {
    if (!videoForm.title || !videoForm.youtubeUrl || !selectedCourse) {
      showToast('Please fill required fields', 'error');
      return;
    }
    
    try {
      const videoData = {
        id: editingVideo?.id || `video_${Date.now()}`,
        courseId: selectedCourse.id,
        ...videoForm,
        order: parseInt(videoForm.order.toString()) || videos.length + 1
      };
      
      const method = editingVideo ? 'PUT' : 'POST';
      const url = editingVideo 
        ? `${API_BASE_URL}/courses/${selectedCourse.id}/videos/${editingVideo.id}`
        : `${API_BASE_URL}/courses/${selectedCourse.id}/videos`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(videoData)
      });
      
      if (response.ok) {
        showToast(editingVideo ? 'Video updated!' : 'Video added!');
        setShowVideoModal(false);
        resetVideoForm();
        loadCourseContent();
      } else {
        showToast('Failed to save video', 'error');
      }
    } catch (error) {
      showToast('Failed to save video', 'error');
    }
  };

  const handleNoteSubmit = async () => {
    if (!noteForm.title || !noteForm.fileUrl || !selectedCourse) {
      showToast('Please fill required fields', 'error');
      return;
    }
    
    try {
      const noteData = {
        id: editingNote?.id || `note_${Date.now()}`,
        courseId: selectedCourse.id,
        ...noteForm,
        order: parseInt(noteForm.order.toString()) || notes.length + 1
      };
      
      const method = editingNote ? 'PUT' : 'POST';
      const url = editingNote 
        ? `${API_BASE_URL}/courses/${selectedCourse.id}/notes/${editingNote.id}`
        : `${API_BASE_URL}/courses/${selectedCourse.id}/notes`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      });
      
      if (response.ok) {
        showToast(editingNote ? 'Note updated!' : 'Note added!');
        setShowNoteModal(false);
        resetNoteForm();
        loadCourseContent();
      } else {
        showToast('Failed to save note', 'error');
      }
    } catch (error) {
      showToast('Failed to save note', 'error');
    }
  };

  const handleTestSubmit = async () => {
    if (!testForm.name || !selectedCourse) {
      showToast('Please fill required fields', 'error');
      return;
    }
    
    try {
      const testData = {
        id: editingTest?.id || `test_${Date.now()}`,
        courseId: selectedCourse.id,
        ...testForm,
        questions: editingTest?.questions || []
      };
      
      const method = editingTest ? 'PUT' : 'POST';
      const url = editingTest 
        ? `${API_BASE_URL}/courses/${selectedCourse.id}/tests/${editingTest.id}`
        : `${API_BASE_URL}/courses/${selectedCourse.id}/tests`;
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      if (response.ok) {
        showToast(editingTest ? 'Test updated!' : 'Test added!');
        setShowTestModal(false);
        resetTestForm();
        loadCourseContent();
      } else {
        showToast('Failed to save test', 'error');
      }
    } catch (error) {
      showToast('Failed to save test', 'error');
    }
  };

  const handleQuestionSubmit = async () => {
    if (!questionForm.question || !currentTestForQuestions || !selectedCourse) {
      showToast('Please fill required fields', 'error');
      return;
    }
    
    try {
      const questionData = {
        id: editingQuestion?.id || `q_${Date.now()}`,
        ...questionForm
      };
      
      const updatedQuestions = editingQuestion
        ? currentTestForQuestions.questions.map(q => q.id === editingQuestion.id ? questionData : q)
        : [...(currentTestForQuestions.questions || []), questionData];
      
      const response = await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/tests/${currentTestForQuestions.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentTestForQuestions, questions: updatedQuestions })
      });
      
      if (response.ok) {
        showToast(editingQuestion ? 'Question updated!' : 'Question added!');
        setShowQuestionModal(false);
        resetQuestionForm();
        loadCourseContent();
        setCurrentTestForQuestions({ ...currentTestForQuestions, questions: updatedQuestions });
      } else {
        showToast('Failed to save question', 'error');
      }
    } catch (error) {
      showToast('Failed to save question', 'error');
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!selectedCourse || !confirm('Delete this video?')) return;
    try {
      await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/videos/${videoId}`, { method: 'DELETE' });
      showToast('Video deleted!');
      loadCourseContent();
    } catch (error) {
      showToast('Failed to delete video', 'error');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!selectedCourse || !confirm('Delete this note?')) return;
    try {
      await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/notes/${noteId}`, { method: 'DELETE' });
      showToast('Note deleted!');
      loadCourseContent();
    } catch (error) {
      showToast('Failed to delete note', 'error');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!selectedCourse || !confirm('Delete this test?')) return;
    try {
      await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/tests/${testId}`, { method: 'DELETE' });
      showToast('Test deleted!');
      loadCourseContent();
    } catch (error) {
      showToast('Failed to delete test', 'error');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!currentTestForQuestions || !selectedCourse || !confirm('Delete this question?')) return;
    try {
      const updatedQuestions = currentTestForQuestions.questions.filter(q => q.id !== questionId);
      await fetch(`${API_BASE_URL}/courses/${selectedCourse.id}/tests/${currentTestForQuestions.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...currentTestForQuestions, questions: updatedQuestions })
      });
      showToast('Question deleted!');
      loadCourseContent();
      setCurrentTestForQuestions({ ...currentTestForQuestions, questions: updatedQuestions });
    } catch (error) {
      showToast('Failed to delete question', 'error');
    }
  };

  const resetVideoForm = () => {
    setVideoForm({ title: '', description: '', youtubeUrl: '', duration: '', isFree: false, order: 0, status: 'active' });
    setEditingVideo(null);
  };

  const resetNoteForm = () => {
    setNoteForm({ title: '', description: '', fileUrl: '', fileSize: '', isFree: false, order: 0, status: 'active' });
    setEditingNote(null);
  };

  const resetTestForm = () => {
    setTestForm({ name: '', description: '', duration: 60, totalMarks: 100, passingMarks: 40, numberOfQuestions: 0, marksPerQuestion: 4, negativeMarking: 0, openDate: '', closeDate: '', isFree: false, status: 'active' });
    setEditingTest(null);
  };

  const resetQuestionForm = () => {
    setQuestionForm({ question: '', questionImage: '', optionA: '', optionAImage: '', optionB: '', optionBImage: '', optionC: '', optionCImage: '', optionD: '', optionDImage: '', correctAnswer: 'A', explanation: '', marks: 4, negativeMarks: 0 });
    setEditingQuestion(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-navy uppercase tracking-widest">Course Content Manager</h3>
            <p className="text-xs text-gray-500 mt-1">Manage videos, notes, and tests for each course</p>
          </div>
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => {
              const course = courses.find(c => c.id === e.target.value);
              setSelectedCourse(course || null);
            }}
            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm min-w-[250px]"
          >
            <option value="">Select a course...</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name || course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedCourse ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['videos', 'notes', 'tests'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider transition-all ${
                    activeTab === tab 
                      ? 'bg-navy text-white' 
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {tab} ({tab === 'videos' ? videos.length : tab === 'notes' ? notes.length : tests.length})
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  <button
                    onClick={() => { resetVideoForm(); setShowVideoModal(true); }}
                    className="bg-navy text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                  >
                    <span className="material-icons-outlined">add</span>
                    Add Video
                  </button>
                  
                  {videos.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <span className="material-icons-outlined text-5xl block mb-2">video_library</span>
                      No videos added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {videos.map((video, idx) => (
                        <div key={video.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center text-navy font-bold">
                              {idx + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{video.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{video.duration || '00:00'}</span>
                                <span className={`px-2 py-0.5 rounded ${video.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {video.isFree ? 'FREE' : 'PAID'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingVideo(video);
                                setVideoForm({
                                  title: video.title,
                                  description: video.description || '',
                                  youtubeUrl: video.youtubeUrl,
                                  duration: video.duration,
                                  isFree: video.isFree,
                                  order: video.order,
                                  status: video.status
                                });
                                setShowVideoModal(true);
                              }}
                              className="p-2 hover:bg-white rounded-lg text-gray-600"
                            >
                              <span className="material-icons-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDeleteVideo(video.id)} className="p-2 hover:bg-white rounded-lg text-red-500">
                              <span className="material-icons-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <button
                    onClick={() => { resetNoteForm(); setShowNoteModal(true); }}
                    className="bg-navy text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                  >
                    <span className="material-icons-outlined">add</span>
                    Add Note
                  </button>
                  
                  {notes.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <span className="material-icons-outlined text-5xl block mb-2">description</span>
                      No notes added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notes.map((note, idx) => (
                        <div key={note.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                              <span className="material-icons-outlined">description</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-800">{note.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span>{note.fileSize || 'PDF'}</span>
                                <span className={`px-2 py-0.5 rounded ${note.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                  {note.isFree ? 'FREE' : 'PAID'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingNote(note);
                                setNoteForm({
                                  title: note.title,
                                  description: note.description || '',
                                  fileUrl: note.fileUrl,
                                  fileSize: note.fileSize || '',
                                  isFree: note.isFree,
                                  order: note.order,
                                  status: note.status
                                });
                                setShowNoteModal(true);
                              }}
                              className="p-2 hover:bg-white rounded-lg text-gray-600"
                            >
                              <span className="material-icons-outlined text-lg">edit</span>
                            </button>
                            <button onClick={() => handleDeleteNote(note.id)} className="p-2 hover:bg-white rounded-lg text-red-500">
                              <span className="material-icons-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tests' && (
                <div className="space-y-4">
                  <button
                    onClick={() => { resetTestForm(); setShowTestModal(true); }}
                    className="bg-navy text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2"
                  >
                    <span className="material-icons-outlined">add</span>
                    Add Test
                  </button>
                  
                  {tests.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <span className="material-icons-outlined text-5xl block mb-2">quiz</span>
                      No tests added yet
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tests.map(test => (
                        <div key={test.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                                <span className="material-icons-outlined">quiz</span>
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-800">{test.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <span>{test.duration} mins</span>
                                  <span>{test.questions?.length || 0} questions</span>
                                  <span className={`px-2 py-0.5 rounded ${test.isFree ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {test.isFree ? 'FREE' : 'PAID'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setCurrentTestForQuestions(test); }}
                                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold text-xs"
                              >
                                Manage Questions ({test.questions?.length || 0})
                              </button>
                              <button
                                onClick={() => {
                                  setEditingTest(test);
                                  setTestForm({
                                    name: test.name,
                                    description: test.description || '',
                                    duration: test.duration,
                                    totalMarks: test.totalMarks,
                                    passingMarks: test.passingMarks,
                                    numberOfQuestions: test.numberOfQuestions || 0,
                                    marksPerQuestion: (test as any).marksPerQuestion || 4,
                                    negativeMarking: (test as any).negativeMarking || 0,
                                    openDate: test.openDate || '',
                                    closeDate: test.closeDate || '',
                                    isFree: test.isFree,
                                    status: test.status
                                  });
                                  setShowTestModal(true);
                                }}
                                className="p-2 hover:bg-white rounded-lg text-gray-600"
                              >
                                <span className="material-icons-outlined text-lg">edit</span>
                              </button>
                              <button onClick={() => handleDeleteTest(test.id)} className="p-2 hover:bg-white rounded-lg text-red-500">
                                <span className="material-icons-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {currentTestForQuestions && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-black text-navy">Questions for: {currentTestForQuestions.name}</h4>
                  <p className="text-xs text-gray-500">{currentTestForQuestions.questions?.length || 0} questions added</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { resetQuestionForm(); setShowQuestionModal(true); }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                  >
                    <span className="material-icons-outlined text-lg">add</span>
                    Add Question
                  </button>
                  <button
                    onClick={() => setCurrentTestForQuestions(null)}
                    className="px-4 py-2 bg-gray-100 rounded-lg font-bold text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              {(!currentTestForQuestions.questions || currentTestForQuestions.questions.length === 0) ? (
                <div className="text-center py-8 text-gray-400">
                  No questions added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTestForQuestions.questions.map((q, idx) => (
                    <div key={q.id} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-navy text-white text-xs font-bold px-2 py-1 rounded">Q{idx + 1}</span>
                            <span className="text-xs text-gray-500">{q.marks} marks</span>
                          </div>
                          <p className="font-medium text-gray-800 mb-2">{q.question}</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className={`p-2 rounded ${q.correctAnswer === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                              A) {q.optionA}
                            </div>
                            <div className={`p-2 rounded ${q.correctAnswer === 'B' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                              B) {q.optionB}
                            </div>
                            <div className={`p-2 rounded ${q.correctAnswer === 'C' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                              C) {q.optionC}
                            </div>
                            <div className={`p-2 rounded ${q.correctAnswer === 'D' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                              D) {q.optionD}
                            </div>
                          </div>
                          {q.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingQuestion(q);
                              setQuestionForm({
                                question: q.question,
                                questionImage: q.questionImage || '',
                                optionA: q.optionA,
                                optionAImage: q.optionAImage || '',
                                optionB: q.optionB,
                                optionBImage: q.optionBImage || '',
                                optionC: q.optionC,
                                optionCImage: q.optionCImage || '',
                                optionD: q.optionD,
                                optionDImage: q.optionDImage || '',
                                correctAnswer: q.correctAnswer,
                                explanation: q.explanation,
                                marks: q.marks,
                                negativeMarks: q.negativeMarks || 0
                              });
                              setShowQuestionModal(true);
                            }}
                            className="p-2 hover:bg-white rounded-lg text-gray-600"
                          >
                            <span className="material-icons-outlined">edit</span>
                          </button>
                          <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 hover:bg-white rounded-lg text-red-500">
                            <span className="material-icons-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <span className="material-icons-outlined text-6xl text-gray-200 block mb-4">school</span>
          <p className="text-gray-400 font-bold">Select a course to manage its content</p>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="font-black text-navy">{editingVideo ? 'Edit Video' : 'Add Video'}</h3>
              <button onClick={() => { setShowVideoModal(false); resetVideoForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Video Title *</label>
                <input
                  type="text"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter video title"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">YouTube URL *</label>
                <input
                  type="text"
                  value={videoForm.youtubeUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                {videoForm.youtubeUrl && extractYouTubeId(videoForm.youtubeUrl) && (
                  <div className="mt-2 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(videoForm.youtubeUrl)}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Duration</label>
                  <input
                    type="text"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="45:30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Order</label>
                  <input
                    type="number"
                    value={videoForm.order}
                    onChange={(e) => setVideoForm({ ...videoForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={3}
                  placeholder="Video description..."
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoForm.isFree}
                    onChange={(e) => setVideoForm({ ...videoForm, isFree: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="font-bold text-sm">Free Video</span>
                </label>
                <select
                  value={videoForm.status}
                  onChange={(e) => setVideoForm({ ...videoForm, status: e.target.value as 'active' | 'inactive' })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setShowVideoModal(false); resetVideoForm(); }} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">
                Cancel
              </button>
              <button onClick={handleVideoSubmit} className="flex-1 py-3 bg-navy text-white rounded-lg font-bold">
                {editingVideo ? 'Update' : 'Add'} Video
              </button>
            </div>
          </div>
        </div>
      )}

      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-black text-navy">{editingNote ? 'Edit Note' : 'Add Note'}</h3>
              <button onClick={() => { setShowNoteModal(false); resetNoteForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Note Title *</label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter note title"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">PDF/Doc File *</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={noteForm.fileUrl}
                    onChange={(e) => setNoteForm({ ...noteForm, fileUrl: e.target.value })}
                    className="flex-1 px-4 py-3 border rounded-lg"
                    placeholder="Paste URL or upload PDF"
                  />
                  <FileUploadButton
                    accept=".pdf,application/pdf"
                    label="Upload PDF"
                    icon="upload_file"
                    onUpload={(url) => setNoteForm({ ...noteForm, fileUrl: url })}
                  />
                </div>
                {noteForm.fileUrl && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <span className="material-icons-outlined text-green-600">check_circle</span>
                    <span className="text-xs text-green-700 font-bold truncate flex-1">{noteForm.fileUrl}</span>
                    <button type="button" onClick={() => setNoteForm({ ...noteForm, fileUrl: '' })} className="text-red-500 hover:text-red-700">
                      <span className="material-icons-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">File Size</label>
                  <input
                    type="text"
                    value={noteForm.fileSize}
                    onChange={(e) => setNoteForm({ ...noteForm, fileSize: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="2.5 MB"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Order</label>
                  <input
                    type="number"
                    value={noteForm.order}
                    onChange={(e) => setNoteForm({ ...noteForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  value={noteForm.description}
                  onChange={(e) => setNoteForm({ ...noteForm, description: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteForm.isFree}
                    onChange={(e) => setNoteForm({ ...noteForm, isFree: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="font-bold text-sm">Free Note</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setShowNoteModal(false); resetNoteForm(); }} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">
                Cancel
              </button>
              <button onClick={handleNoteSubmit} className="flex-1 py-3 bg-navy text-white rounded-lg font-bold">
                {editingNote ? 'Update' : 'Add'} Note
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-black text-navy">{editingTest ? 'Edit Test' : 'Add Test'}</h3>
              <button onClick={() => { setShowTestModal(false); resetTestForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Test Name *</label>
                <input
                  type="text"
                  value={testForm.name}
                  onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                <textarea
                  value={testForm.description}
                  onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Open Date *</label>
                  <input
                    type="datetime-local"
                    value={testForm.openDate}
                    onChange={(e) => setTestForm({ ...testForm, openDate: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Test will be available from this date</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Close Date *</label>
                  <input
                    type="datetime-local"
                    value={testForm.closeDate}
                    onChange={(e) => setTestForm({ ...testForm, closeDate: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Test will close after this date</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">No. of Questions</label>
                  <input
                    type="number"
                    value={testForm.numberOfQuestions}
                    onChange={(e) => setTestForm({ ...testForm, numberOfQuestions: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={testForm.duration}
                    onChange={(e) => setTestForm({ ...testForm, duration: parseInt(e.target.value) || 60 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Marks Per Question</label>
                  <input
                    type="number"
                    value={testForm.marksPerQuestion}
                    onChange={(e) => setTestForm({ ...testForm, marksPerQuestion: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={testForm.totalMarks}
                    onChange={(e) => setTestForm({ ...testForm, totalMarks: parseInt(e.target.value) || 100 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={testForm.passingMarks}
                    onChange={(e) => setTestForm({ ...testForm, passingMarks: parseInt(e.target.value) || 40 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Negative Marking</label>
                  <input
                    type="number"
                    step="0.25"
                    value={testForm.negativeMarking}
                    onChange={(e) => setTestForm({ ...testForm, negativeMarking: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Marks deducted per wrong answer (0 = no negative)</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testForm.isFree}
                    onChange={(e) => setTestForm({ ...testForm, isFree: e.target.checked })}
                    className="w-5 h-5 rounded"
                  />
                  <span className="font-bold text-sm">Free Test</span>
                </label>
              </div>
            </div>
            <div className="flex gap-4 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setShowTestModal(false); resetTestForm(); }} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">
                Cancel
              </button>
              <button onClick={handleTestSubmit} className="flex-1 py-3 bg-navy text-white rounded-lg font-bold">
                {editingTest ? 'Update' : 'Add'} Test
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuestionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-black text-navy">{editingQuestion ? 'Edit Question' : 'Add Question'}</h3>
              <button onClick={() => { setShowQuestionModal(false); resetQuestionForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Question *</label>
                <textarea
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={3}
                  placeholder="Enter your question..."
                />
                <div className="mt-2 flex items-center gap-2">
                  <FileUploadButton
                    accept="image/*"
                    label="Question Image"
                    icon="add_photo_alternate"
                    onUpload={(url) => setQuestionForm({ ...questionForm, questionImage: url })}
                  />
                  {questionForm.questionImage && (
                    <div className="relative">
                      <img src={questionForm.questionImage} alt="Q" className="h-16 rounded-lg border" />
                      <button type="button" onClick={() => setQuestionForm({ ...questionForm, questionImage: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px]">
                        <span className="material-icons-outlined text-xs">close</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                  <div key={opt}>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Option {opt} *</label>
                    <input
                      type="text"
                      value={(questionForm as any)[`option${opt}`]}
                      onChange={(e) => setQuestionForm({ ...questionForm, [`option${opt}`]: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg"
                      placeholder={`Option ${opt}...`}
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <FileUploadButton
                        accept="image/*"
                        label="Image"
                        icon="image"
                        onUpload={(url) => setQuestionForm({ ...questionForm, [`option${opt}Image`]: url })}
                      />
                      {(questionForm as any)[`option${opt}Image`] && (
                        <div className="relative">
                          <img src={(questionForm as any)[`option${opt}Image`]} alt={`Opt ${opt}`} className="h-10 rounded border" />
                          <button type="button" onClick={() => setQuestionForm({ ...questionForm, [`option${opt}Image`]: '' })} className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px]">
                            <span className="material-icons-outlined text-[10px]">close</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Correct Answer *</label>
                  <select
                    value={questionForm.correctAnswer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correctAnswer: e.target.value as 'A' | 'B' | 'C' | 'D' })}
                    className="w-full px-4 py-3 border rounded-lg"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Marks</label>
                  <input
                    type="number"
                    value={questionForm.marks}
                    onChange={(e) => setQuestionForm({ ...questionForm, marks: parseInt(e.target.value) || 4 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.25"
                    value={questionForm.negativeMarks}
                    onChange={(e) => setQuestionForm({ ...questionForm, negativeMarks: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Explanation</label>
                <textarea
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={3}
                  placeholder="Explain the correct answer..."
                />
              </div>
            </div>
            <div className="flex gap-4 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => { setShowQuestionModal(false); resetQuestionForm(); }} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">
                Cancel
              </button>
              <button onClick={handleQuestionSubmit} className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-bold">
                {editingQuestion ? 'Update' : 'Add'} Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseContentManager;
