import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import SplashScreen from './components/SplashScreen';

const Home = lazy(() => import('./screens/Home'));
const CourseDetails = lazy(() => import('./screens/CourseDetails'));
const Checkout = lazy(() => import('./screens/Checkout'));
const StudyDashboard = lazy(() => import('./screens/StudyDashboard'));
const Success = lazy(() => import('./screens/Success'));
const AdminDashboard = lazy(() => import('./screens/AdminDashboard'));
const AdminLogin = lazy(() => import('./screens/AdminLogin'));
const StudentLogin = lazy(() => import('./screens/StudentLogin'));
const StudentProfile = lazy(() => import('./screens/StudentProfile'));
const StudentDashboard = lazy(() => import('./screens/StudentDashboard'));
const CoursesScreen = lazy(() => import('./screens/CoursesScreen'));
const ExploreCourses = lazy(() => import('./screens/ExploreCourses'));
const CategoryPage = lazy(() => import('./screens/CategoryPage'));
const SubCategoryDetail = lazy(() => import('./screens/SubCategoryDetail'));
const ChatsScreen = lazy(() => import('./screens/ChatsScreen'));
const MyCourses = lazy(() => import('./screens/MyCourses'));
const LiveClasses = lazy(() => import('./screens/LiveClasses'));
const MockTests = lazy(() => import('./screens/MockTests'));
const TestTaking = lazy(() => import('./screens/TestTaking'));
const EbookNotes = lazy(() => import('./screens/EbookNotes'));
const Downloads = lazy(() => import('./screens/Downloads'));
const Notifications = lazy(() => import('./screens/Notifications'));
const WatchHistory = lazy(() => import('./screens/WatchHistory'));
const HelpSupport = lazy(() => import('./screens/HelpSupport'));
const Settings = lazy(() => import('./screens/Settings'));
const ReferEarn = lazy(() => import('./screens/ReferEarn'));
const PurchaseSuccess = lazy(() => import('./screens/PurchaseSuccess'));
const ContentTypeDetail = lazy(() => import('./screens/ContentTypeDetail'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-100">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-800 rounded-full animate-spin" />
      <p className="text-xs text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splashShown', 'true');
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
    <div className="min-h-screen bg-surface-100">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/admin-login" element={<AdminLogin setAuth={setIsAdminLoggedIn} />} />
            <Route 
              path="/admin" 
              element={isAdminLoggedIn ? <AdminDashboard setAuth={setIsAdminLoggedIn} /> : <Navigate to="/admin-login" />} 
            />
            
            <Route path="/student-login" element={<StudentLogin setAuth={setIsStudentLoggedIn} />} />
            
            <Route path="*" element={
              <div className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative">
                <div className="pb-22">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/batches" element={<Navigate to="/explore" />} />
                      <Route path="/courses" element={<CoursesScreen />} />
                      <Route path="/explore" element={<ExploreCourses />} />
                      <Route path="/explore/:categoryId" element={<CategoryPage />} />
                      <Route path="/explore/:categoryId/:subId" element={<SubCategoryDetail />} />
                      <Route path="/content/:contentType" element={<ContentTypeDetail />} />
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
                  </Suspense>
                </div>
                <BottomNav isLoggedIn={isStudentLoggedIn} />
              </div>
            } />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
};

export default App;
