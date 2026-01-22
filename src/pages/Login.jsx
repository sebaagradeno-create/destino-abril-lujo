import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, this should be a backend call
        // For this prototype, we use a simple hardcoded check
        if (password === 'admin123' || password === 'destino2026') {
            sessionStorage.setItem('auth_token', 'validated');
            navigate('/crm');
        } else {
            setError('Contraseña incorrecta');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center font-body text-white">
            <div className="glass-panel p-8 w-full max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#D4AF37]/20 flex items-center justify-center mb-6">
                    <Lock size={32} className="text-[#D4AF37]" />
                </div>

                <h1 className="text-2xl font-header text-[#D4AF37] mb-2">Acceso CRM</h1>
                <p className="text-gray-500 text-sm mb-8">Solo personal autorizado</p>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña"
                        className="p-3 bg-gray-900 border border-gray-700 rounded text-white focus:border-[#D4AF37] focus:outline-none transition-colors"
                    />

                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                    <button type="submit" className="btn-primary w-full mt-2">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
