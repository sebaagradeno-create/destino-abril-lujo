import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { getChatbotResponse } from '../services/aiService';
import { useCRM } from '../context/CRMContext.jsx';

const AGENTE_INFO = {
  April: {
    color: '#D4AF37',
    label: 'April',
    sub: 'Especialista Técnica',
    bg: 'bg-amber-900/20 border-amber-600/30',
  },
  Destiny: {
    color: '#a78bfa',
    label: 'Destiny',
    sub: 'Especialista en Cierre',
    bg: 'bg-purple-900/20 border-purple-600/30',
  },
};

const PHONE_REGEX = /(\+?598\s?)?\d[\d\s\-]{7,14}\d/;

const WELCOME = {
  text: '¡Hola! Soy April, tu especialista de Destino Abril. ¿Qué tipo de propiedad estás buscando? Podés preguntarme por barrio, precio, m2 o tipo.',
  agente: 'April',
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ ...WELCOME, sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState('');
  const [leadSaved, setLeadSaved] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addLead } = useCRM();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg = { text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Detect phone number → save lead
    if (!leadSaved && PHONE_REGEX.test(text)) {
      const phone = text.match(PHONE_REGEX)?.[0] || text;
      addLead({ phone, source: 'Chatbot IA', historial });
      setLeadSaved(true);
    }

    const nuevoHistorial = historial + `\nUsuario: ${text}`;

    const { respuesta, agente } = await getChatbotResponse(text, nuevoHistorial);

    setHistorial(nuevoHistorial + `\n${agente}: ${respuesta}`);
    setMessages(prev => [...prev, { text: respuesta, sender: 'bot', agente: agente || 'April' }]);
    setLoading(false);
  };

  const agente = messages.filter(m => m.sender === 'bot').slice(-1)[0]?.agente || 'April';
  const info = AGENTE_INFO[agente] || AGENTE_INFO.April;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="border text-amber-400 p-4 rounded-full shadow-gold hover:scale-105 transition-all duration-300"
          style={{ width: 60, height: 60, background: '#000', borderColor: 'var(--color-gold)' }}
        >
          <MessageSquare size={28} color="var(--color-gold)" />
        </button>
      )}

      {isOpen && (
        <div
          className="glass-panel w-80 sm:w-96 flex flex-col overflow-hidden shadow-soft"
          style={{ height: 560, animation: 'slideUp 0.35s ease-out' }}
        >
          {/* Header */}
          <div className="bg-black/90 px-4 py-3 flex justify-between items-center border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full border flex items-center justify-center bg-gray-900 text-sm font-bold"
                style={{ borderColor: info.color, color: info.color }}>
                {info.label[0]}
              </div>
              <div>
                <p className="text-sm font-bold tracking-wide" style={{ color: info.color }}>{info.label}</p>
                <p className="text-xs text-gray-400">{info.sub}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" /> Online
              </span>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black/40">
            {messages.map((msg, i) => {
              const msgInfo = AGENTE_INFO[msg.agente] || AGENTE_INFO.April;
              return (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mr-2 mt-1 flex-shrink-0"
                      style={{ borderColor: msgInfo.color, color: msgInfo.color, background: '#111' }}>
                      {msgInfo.label[0]}
                    </div>
                  )}
                  <div className={`max-w-[82%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-amber-700/20 border border-amber-600/30 text-white rounded-br-none'
                      : `${msgInfo.bg} border text-gray-200 rounded-bl-none`
                  }`}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0"
                  style={{ borderColor: info.color, color: info.color, background: '#111' }}>
                  {info.label[0]}
                </div>
                <div className="bg-gray-800/80 border border-gray-700 rounded-lg rounded-bl-none px-4 py-2">
                  <span className="flex gap-1 items-center">
                    {[0,1,2].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-800 bg-black/90">
            {!leadSaved && messages.length > 4 && (
              <p className="text-xs text-gray-500 mb-2 text-center">
                Dejá tu WhatsApp para que te contactemos
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Escribí tu consulta..."
                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ color: info.color }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Chatbot;
