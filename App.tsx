import React, { useState, useEffect, useCallback } from 'react';
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
import StudentDashboard from './screens/StudentDashboard';
import CoursesScreen from './screens/CoursesScreen';
import ExploreCourses from './screens/ExploreCourses';
import CategoryPage from './screens/CategoryPage';
import SubCategoryDetail from './screens/SubCategoryDetail';
import ChatsScreen from './screens/ChatsScreen';
import MyCourses from './screens/MyCourses';
import LiveClasses from './screens/LiveClasses';
import MockTests from './screens/MockTests';
import TestTaking from './screens/TestTaking';
import EbookNotes from './screens/EbookNotes';
import Downloads from './screens/Downloads';
import Notifications from './screens/Notifications';
import WatchHistory from './screens/WatchHistory';
import HelpSupport from './screens/HelpSupport';
import Settings from './screens/Settings';
import ReferEarn from './screens/ReferEarn';
import PurchaseSuccess from './screens/PurchaseSuccess';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

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
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Router>
        <Routes>
          <Route path="/admin-login" element={<AdminLogin setAuth={setIsAdminLoggedIn} />} />
          <Route 
            path="/admin" 
            element={isAdminLoggedIn ? <AdminDashboard setAuth={setIsAdminLoggedIn} /> : <Navigate to="/admin-login" />} 
          />
          
          <Route path="/student-login" element={<StudentLogin setAuth={setIsStudentLoggedIn} />} />
          
          <Route path="*" element={
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-[#121212] shadow-xl relative">
              <div className="pb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/batches" element={<Batches />} />
                  <Route path="/courses" element={<CoursesScreen />} />
                  <Route path="/explore" element={<ExploreCourses />} />
                  <Route path="/explore/:categoryId" element={<CategoryPage />} />
                  <Route path="/explore/:categoryId/:subId" element={<SubCategoryDetail />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/study/:id" element={<StudyDashboard />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="/purchase-success" element={<PurchaseSuccess />} />
                  
                  <Route path="/student-dashboard" element={
                    isStudentLoggedIn ? <StudentDashboard /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/my-courses" element={
                    isStudentLoggedIn ? <MyCourses /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/live-classes" element={
                    isStudentLoggedIn ? <LiveClasses /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/mock-tests" element={
                    isStudentLoggedIn ? <MockTests /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/test/:testId" element={
                    isStudentLoggedIn ? <TestTaking /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/ebook-notes" element={
                    isStudentLoggedIn ? <EbookNotes /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/downloads" element={
                    isStudentLoggedIn ? <Downloads /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/notifications" element={
                    isStudentLoggedIn ? <Notifications /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/watch-history" element={
                    isStudentLoggedIn ? <WatchHistory /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/help-support" element={
                    isStudentLoggedIn ? <HelpSupport /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/settings" element={
                    isStudentLoggedIn ? <Settings setAuth={setIsStudentLoggedIn} /> : <Navigate to="/student-login" />
                  } />
                  <Route path="/refer-earn" element={
                    isStudentLoggedIn ? <ReferEarn /> : <Navigate to="/student-login" />
                  } />
                  
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
