import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './screens/Home';
import Batches from './screens/Batches';
import CourseDetails from './screens/CourseDetails';
import Checkout from './screens/Checkout';
import StudyDashboard from './screens/StudyDashboard';
import Success from './screens/Success';
import AdminDashboard from './screens/AdminDashboard';
import AdminLogin from './screens/AdminLogin';
import StudentLogin from './screens/StudentLogin';
import StudentProfile from './screens/StudentProfile';
import CoursesScreen from './screens/CoursesScreen';
import ChatsScreen from './screens/ChatsScreen';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

  useEffect(() => {
    const adminAuthStatus = localStorage.getItem('isAdminAuthenticated');
    if (adminAuthStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
    
    const studentAuthStatus = localStorage.getItem('isStudentAuthenticated');
    if (studentAuthStatus === 'true') {
      setIsStudentLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#121212]">
      <Router>
        <Routes>
          {/* Admin routes are top-level and don't use the mobile frame */}
          <Route path="/admin-login" element={<AdminLogin setAuth={setIsAdminLoggedIn} />} />
          <Route 
            path="/admin" 
            element={isAdminLoggedIn ? <AdminDashboard setAuth={setIsAdminLoggedIn} /> : <Navigate to="/admin-login" />} 
          />
          
          {/* Student Login - Full screen without bottom nav */}
          <Route path="/student-login" element={<StudentLogin setAuth={setIsStudentLoggedIn} />} />
          
          {/* Main App Routes within a mobile-style centered container */}
          <Route path="*" element={
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-[#121212] shadow-xl relative">
              <div className="pb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/batches" element={<Batches />} />
                  <Route path="/courses" element={<CoursesScreen />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/study/:id" element={<StudyDashboard />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/chats" element={
                    isStudentLoggedIn ? <ChatsScreen /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/profile" element={
                    isStudentLoggedIn ? <StudentProfile setAuth={setIsStudentLoggedIn} /> : <Navigate to="/student-login" />
                  } />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
              <BottomNav isLoggedIn={isStudentLoggedIn} />
            </div>
          } />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
