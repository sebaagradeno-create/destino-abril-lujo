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
import { supabase } from './supabaseClient';

// Protected Route: acepta sesión por password O por OAuth de Supabase
const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    if (token) { setAllowed(true); setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        sessionStorage.setItem('auth_token', 'validated');
        setAllowed(true);
      }
      setChecking(false);
    });
  }, []);

  if (checking) return <div className="min-h-screen bg-black" />;
  if (!allowed) return <Navigate to="/login" replace />;
  return children;
};

// Layout wrapper
const Layout = ({ children }) => {
  const location = useLocation();
  const isHybridMode = location.pathname === '/' || location.pathname === '/index.html';

  useEffect(() => {
    // Hide static HTML elements if we are in the CRM/Login routes
    const staticElements = document.querySelectorAll('nav#navbar, header#inicio, section, footer');
    if (!isHybridMode) {
      staticElements.forEach(el => el.style.display = 'none');
      document.body.style.background = '#000';
    } else {
      staticElements.forEach(el => el.style.display = '');
    }
  }, [isHybridMode]);

  return (
    <div className={!isHybridMode ? "bg-black min-h-screen text-white font-body selection:bg-amber-500 selection:text-black" : ""}>
      {/* Show React nav only in CRM/Login */}
      {!isHybridMode && <Navigation />}
      {children}
      {/* Chatbot appears globally */}
      <Chatbot />
    </div>
  );
};

function App() {
  return (
    <CRMProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<div />} />
            <Route path="/propiedades" element={<Propiedades />} />
            <Route path="/propiedad/:id" element={<Propiedad />} />
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
