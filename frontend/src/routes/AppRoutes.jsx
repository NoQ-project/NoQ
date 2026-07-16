import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import NoqLogin from '../components/NoqLogin';
import UserPanel from '../components/UserPanel';

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
      <Routes>
      
        <Route 
          path="/" 
          element={
            <LandingPage 
              onOpenAuth={(view) => {
                setInitialAuthView(view);
                setShowLoginModal(true);
              }} 
            />
          } 
        />

        
        <Route path="/user" element={<UserPanel onLogout={handleLogout} />} />

      
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

   
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