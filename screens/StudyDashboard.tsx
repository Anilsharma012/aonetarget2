
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CURRICULUM } from '../constants';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "What is the SI unit of Electric Charge?",
    options: ["Volt", "Coulomb", "Ampere", "Ohm"],
    correct: 1,
    explanation: "The SI unit of electric charge is the Coulomb (C), named after Charles-Augustin de Coulomb."
  },
  {
    id: 2,
    question: "According to Coulomb's Law, the force between two point charges is inversely proportional to:",
    options: ["The distance between them", "The sum of their charges", "The square of the distance between them", "The product of their charges"],
    correct: 2,
    explanation: "Coulomb's Law states F = k(q1q2/r²), where r is the distance. Thus, force is inversely proportional to the square of the distance."
  },
  {
    id: 3,
    question: "A glass rod rubbed with silk acquires which type of charge?",
    options: ["Negative", "Positive", "Neutral", "Both"],
    correct: 1,
    explanation: "When a glass rod is rubbed with silk, electrons are transferred from the rod to the silk, leaving the rod with a positive charge."
  }
];

const StudyDashboard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('videos');
  
  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleCheckAnswer = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === QUIZ_QUESTIONS[currentQuestionIndex].correct;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setQuizCompleted(false);
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen animate-fade-in flex flex-col">
      {/* Curved Header */}
      <header className="bg-brandRed text-white pt-10 pb-6 px-4 rounded-b-[2.5rem] shadow-lg sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brandRed font-black text-xs">AT</div>
            <h1 className="text-lg font-bold">NEET Physics 2026</h1>
          </div>
          <button className="p-1 rounded-full hover:bg-white/20">
            <span className="material-symbols-rounded">more_vert</span>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <h2 className="text-base font-bold mb-1">नमस्ते, Student!</h2>
          <p className="text-[10px] opacity-80 mb-3">अपनी पढ़ाई जारी रखें</p>
          <div className="flex justify-between text-[10px] mb-1">
            <span>प्रगति (Progress)</span>
            <span className="font-bold">32%</span>
          </div>
          <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
            <div className="bg-yellow-400 h-full" style={{ width: '32%' }}></div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        {/* Resume Section - Hidden when taking a test for focus */}
        {activeTab !== 'tests' && (
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
               <span className="material-symbols-rounded text-brandRed text-lg">play_circle</span> Continue Watching
            </h3>
            <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100 flex gap-4 items-center">
              <div className="relative w-24 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                 <img src="https://picsum.photos/200/120" className="w-full h-full object-cover" alt="Thumb" />
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                   <span className="material-symbols-rounded text-white">play_arrow</span>
                 </div>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-xs truncate">Unit 2: Electrostatics - Part 4</h4>
                <p className="text-[10px] text-gray-400 mt-1">45m left • Lesson 12</p>
                <div className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                   <div className="bg-brandRed h-full w-2/3"></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tabs */}
        <section>
          <div className="flex border-b border-gray-200 mb-4">
            {['वीडियो (Videos)', 'नोट्स (Notes)', 'टेस्ट (Tests)'].map((tab) => {
              const key = tab.toLowerCase().includes('video') ? 'videos' : tab.toLowerCase().includes('note') ? 'notes' : 'tests';
              const isActive = activeTab === key;
              return (
                <button 
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 pb-3 text-xs font-bold transition-all ${isActive ? 'text-brandRed border-b-2 border-brandRed' : 'text-gray-400'}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'videos' && (
            <div className="space-y-4">
              {CURRICULUM.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 flex justify-between items-center cursor-pointer bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">{item.total ? `0/${item.total} Completed` : 'Click to view'}</p>
                    </div>
                    <span className={`material-symbols-rounded text-gray-400 ${item.id === '1' ? 'rotate-180' : ''}`}>expand_more</span>
                  </div>
                  {item.id === '1' && (
                    <div className="p-2 space-y-1">
                       <div className="p-3 hover:bg-gray-50 rounded-lg flex gap-3 items-center">
                         <span className="material-symbols-rounded text-green-500 text-lg">check_circle</span>
                         <div className="flex-1">
                           <p className="text-xs font-bold">Introduction to Vectors</p>
                           <div className="flex gap-2 mt-1">
                             <span className="text-[8px] bg-blue-50 text-brandBlue px-1.5 py-0.5 rounded font-bold uppercase">Video</span>
                             <span className="text-[8px] text-gray-400">12:30 min</span>
                           </div>
                         </div>
                         <span className="material-symbols-rounded text-gray-400 text-base">download</span>
                       </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl text-center border-2 border-dashed border-gray-200">
                <span className="material-symbols-rounded text-gray-300 text-5xl">description</span>
                <p className="text-sm font-bold text-gray-400 mt-2">कोई नोट्स उपलब्ध नहीं हैं (No notes available yet)</p>
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="space-y-6">
              {!quizCompleted ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in">
                  {/* Quiz Progress */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-brandRed uppercase tracking-widest">
                      Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      Score: {score}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
                    <div 
                      className="bg-brandRed h-full transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                    ></div>
                  </div>

                  {/* Question */}
                  <h3 className="text-base font-bold text-navy leading-relaxed mb-8">
                    {QUIZ_QUESTIONS[currentQuestionIndex].question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3 mb-8">
                    {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => {
                      let optionStyles = "border-gray-100 bg-white text-gray-700";
                      let icon = "";

                      if (selectedOption === idx) {
                        optionStyles = "border-navy bg-navy/5 text-navy";
                      }

                      if (isAnswered) {
                        if (idx === QUIZ_QUESTIONS[currentQuestionIndex].correct) {
                          optionStyles = "border-green-500 bg-green-50 text-green-700";
                          icon = "check_circle";
                        } else if (selectedOption === idx) {
                          optionStyles = "border-red-500 bg-red-50 text-red-700";
                          icon = "cancel";
                        } else {
                          optionStyles = "border-gray-100 bg-white text-gray-400 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => handleOptionSelect(idx)}
                          disabled={isAnswered}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center group ${optionStyles}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${selectedOption === idx ? 'border-navy bg-navy text-white' : 'border-gray-200 text-gray-400'}`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="text-xs font-bold">{option}</span>
                          </div>
                          {icon && <span className={`material-symbols-rounded text-lg ${idx === QUIZ_QUESTIONS[currentQuestionIndex].correct ? 'text-green-500' : 'text-red-500'}`}>{icon}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Feedback Explanation */}
                  {isAnswered && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-fade-in">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Explanation:</p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {QUIZ_QUESTIONS[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {!isAnswered ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={selectedOption === null}
                      className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${selectedOption === null ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-navy text-white hover:bg-navy/90'}`}
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full bg-brandRed text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:bg-brandRed/90 transition-all"
                    >
                      {currentQuestionIndex < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      <span className="material-symbols-rounded text-base">arrow_forward</span>
                    </button>
                  )
                  }
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-white p-8 text-center animate-fade-in">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-rounded text-green-500 text-5xl">military_tech</span>
                  </div>
                  <h3 className="text-xl font-black text-navy mb-2 uppercase">Quiz Completed!</h3>
                  <p className="text-sm text-gray-400 mb-8">Excellent effort! You are getting better at Electrostatics.</p>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8 flex justify-around">
                    <div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Score</span>
                      <span className="text-2xl font-black text-navy">{score}/{QUIZ_QUESTIONS.length}</span>
                    </div>
                    <div className="w-px bg-gray-200"></div>
                    <div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">Accuracy</span>
                      <span className="text-2xl font-black text-green-600">{Math.round((score / QUIZ_QUESTIONS.length) * 100)}%</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button 
                      onClick={resetQuiz}
                      className="w-full bg-navy text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg"
                    >
                      Retry Quiz
                    </button>
                    <button 
                      onClick={() => setActiveTab('videos')}
                      className="w-full bg-white text-gray-500 border border-gray-200 py-3 rounded-xl font-bold text-xs"
                    >
                      Back to Lectures
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Floating Query Button */}
      <button className="fixed bottom-24 right-4 h-14 w-14 bg-brandBlue text-white rounded-full shadow-2xl flex items-center justify-center z-50">
        <span className="material-symbols-rounded">quiz</span>
      </button>
    </div>
  );
};

export default StudyDashboard;
