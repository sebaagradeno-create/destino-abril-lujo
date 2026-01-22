import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import Landing from './pages/Landing';
import CRM from './pages/CRM';
import Login from './pages/Login';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout wrapper to hide Navigation/Chatbot on Login page
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="bg-black min-h-screen text-white font-body selection:bg-amber-500 selection:text-black">
      {!isLoginPage && <Navigation />}
      {children}
      {!isLoginPage && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <CRMProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/crm"
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </CRMProvider>
  );
}

export default App;
