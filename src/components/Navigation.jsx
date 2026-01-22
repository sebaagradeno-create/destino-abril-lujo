import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Home } from 'lucide-react';

const Navigation = () => {
    const location = useLocation();
    const isCRM = location.pathname === '/crm';

    return (
        <nav className="fixed top-0 w-full z-40 bg-black/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-6 md:px-12 transition-all duration-300">
            <div className="flex items-center gap-2">
                <Link to="/" className="hover:opacity-80 transition-opacity">
                    <img src="/logo.jpg" alt="Destino Abril" className="h-16 w-auto object-contain" />
                </Link>
            </div>

            <div className="flex items-center gap-8">
                <Link
                    to="/"
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest hover:text-[#D4AF37] transition-colors ${location.pathname === '/' ? 'text-[#D4AF37]' : 'text-gray-400'}`}
                >
                    <Home size={16} /> <span className="hidden md:inline">Inicio</span>
                </Link>
                <Link
                    to="/crm"
                    className={`flex items-center gap-2 text-sm uppercase tracking-widest hover:text-[#D4AF37] transition-colors ${isCRM ? 'text-[#D4AF37]' : 'text-gray-400'}`}
                >
                    <LayoutDashboard size={16} /> <span className="hidden md:inline">Panel CRM</span>
                </Link>
            </div>
        </nav>
    );
};

export default Navigation;
