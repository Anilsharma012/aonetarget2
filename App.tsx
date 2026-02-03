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
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem('isAdminAuthenticated');
    if (authStatus === 'true') {
      setIsAdminLoggedIn(true);
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
          
          {/* Main App Routes within a mobile-style centered container */}
          <Route path="*" element={
            <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-[#121212] shadow-xl relative">
              <div className="pb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/batches" element={<Batches />} />
                  <Route path="/course/:id" element={<CourseDetails />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/study/:id" element={<StudyDashboard />} />
                  <Route path="/success" element={<Success />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          } />
        </Routes>
      </Router>
    </div>
  );
};

export default App;