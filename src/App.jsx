import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import Navigation from './components/Navigation';
import Chatbot from './components/Chatbot';
import Landing from './pages/Landing';
import CRM from './pages/CRM';

function App() {
  return (
    <CRMProvider>
      <Router>
        <div className="bg-black min-h-screen text-white font-body selection:bg-amber-500 selection:text-black">
          <Navigation />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/crm" element={<CRM />} />
          </Routes>
          <Chatbot />
        </div>
      </Router>
    </CRMProvider>
  );
}

export default App;
