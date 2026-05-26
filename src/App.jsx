import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import Landing from './pages/Landing';
import CRM from './pages/CRM';
import Login from './pages/Login';
import Propiedades from './pages/Propiedades';
import Propiedad from './pages/Propiedad';

const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed]   = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    setAllowed(token === 'validated');
    setChecking(false);
  }, []);

  if (checking) return <div className="min-h-screen bg-black" />;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const isPublic  = location.pathname === '/' || location.pathname === '/index.html';
  const isAdmin   = location.pathname === '/crm' || location.pathname === '/login';

  useEffect(() => {
    const staticElements = document.querySelectorAll('nav#navbar, header#inicio, section, footer');
    if (!isPublic) {
      staticElements.forEach(el => el.style.display = 'none');
      document.body.style.background = '#000';
    } else {
      staticElements.forEach(el => el.style.display = '');
    }
  }, [isPublic]);

  return (
    <div className={!isPublic ? 'bg-black min-h-screen text-white font-body selection:bg-amber-500 selection:text-black' : ''}>
      {!isPublic && !isAdmin && <Navigation />}
      {children}
      {/* Chatbot solo en páginas públicas */}
      {!isAdmin && <Chatbot />}
    </div>
  );
};

function App() {
  return (
    <CRMProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/"            element={<div />} />
            <Route path="/propiedades" element={<Propiedades />} />
            <Route path="/propiedad/:id" element={<Propiedad />} />
            <Route path="/login"       element={<Login />} />
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
