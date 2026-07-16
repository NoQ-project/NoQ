import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, Router } from 'react-router-dom'
import { QueueProvider } from '../context/QueueContext';
import LandingPage from '../pages/LandingPage';
import NoqLogin from '../components/auth/Login'; 
import UserPanel from '../pages/UserPanel';
import OrgPanel from '../pages/OrgPanel';
function AppRoutes() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [initialAuthView, setInitialAuthView] = useState('login');
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    navigate('/user'); 
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
     <QueueProvider>
           <Routes>
             <Route path="/" element={<LandingPage />} />
             <Route path="/user/*" element={<UserPanel />} />
             <Route path="/org/*" element={<OrgPanel />} />
            </Routes>
        </QueueProvider>
      <NoqLogin 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        initialView={initialAuthView}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default AppRoutes;