import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { supabase } from '../supabaseClient';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'admin123' || password === 'destino2026') {
            sessionStorage.setItem('auth_token', 'validated');
            navigate('/crm');
        } else {
            setError('Contraseña incorrecta');
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/crm`
            }
        });
        if (error) {
            setError('Error con Google: ' + error.message);
            setLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        setLoading(true);
        setError('');
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
                redirectTo: `${window.location.origin}/crm`
            }
        });
        if (error) {
            setError('Error con Facebook: ' + error.message);
            setLoading(false);
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

                {/* OAuth buttons */}
                <div className="w-full flex flex-col gap-3 mb-6">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-800 font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                        <GoogleIcon /> Ingresar con Google
                    </button>
                    <button
                        onClick={handleFacebookLogin}
                        disabled={loading}
                        className="flex items-center justify-center gap-3 w-full py-3 bg-[#1877F2] text-white font-medium text-sm hover:bg-[#166FE5] transition-colors disabled:opacity-50"
                    >
                        <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        Ingresar con Facebook
                    </button>
                </div>

                <div className="w-full flex items-center gap-3 mb-6">
                    <div className="flex-1 h-px bg-gray-800"></div>
                    <span className="text-gray-600 text-xs">o con contraseña</span>
                    <div className="flex-1 h-px bg-gray-800"></div>
                </div>

                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Contraseña del equipo"
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
