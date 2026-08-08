import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueueProvider } from '../context/QueueContext';
import LandingPage from '../pages/LandingPage';
import UserPanel from '../pages/UserPanel';
import AdminApp from '../pages/Admin';
import OrgPanel from '../pages/OrgPanel';

function AppRoutes() {
  return (
    <QueueProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/user/*" element={<UserPanel />} />
        <Route path="/org/*" element={<OrgPanel />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </QueueProvider>
  );
}

export default AppRoutes;