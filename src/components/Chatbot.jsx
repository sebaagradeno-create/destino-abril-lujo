import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Phone, Home } from 'lucide-react';
import { useCRM } from '../context/CRMContext.jsx';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0); // 0: Init, 1: Name, 2: Action, 3: Phone, 4: End
    const [messages, setMessages] = useState([
        { text: 'Bienvenido a Destino Abril. Soy su asistente personal. ¿Cómo se llama?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [data, setData] = useState({ name: '', intent: '', phone: '' });
    const messagesEndRef = useRef(null);
    const { addLead } = useCRM();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        // Logic Flow
        if (step === 0) {
            setData(prev => ({ ...prev, name: input }));
            setTimeout(() => {
                setMessages(prev => [...prev, { text: `Un placer, ${input}. ¿Qué desea realizar hoy?`, sender: 'bot' }]);
                setStep(1); // Show options
            }, 800);
        } else if (step === 2) { // Waiting for phone
            const phone = input;
            setData(prev => ({ ...prev, phone }));
            setTimeout(() => {
                setMessages(prev => [...prev, { text: 'Gracias. Un agente verificará su solicitud y lo contactará en breve.', sender: 'bot' }]);
                setStep(3);

                // Save to CRM
                addLead({
                    name: data.name,
                    intent: data.intent,
                    phone: phone,
                    source: 'Chatbot'
                });
            }, 800);
        }
    };

    const handleOption = (option) => {
        setMessages(prev => [...prev, { text: option, sender: 'user' }]);
        setData(prev => ({ ...prev, intent: option }));

        setTimeout(() => {
            setMessages(prev => [...prev, { text: `Excelente elección. Por favor, indíqueme su número de WhatsApp para enviarle opciones exclusivas.`, sender: 'bot' }]);
            setStep(2); // Ask phone
        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
            {/* Trigger Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black border border-amber-400 text-amber-400 p-4 rounded-full shadow-gold hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                    style={{ width: '60px', height: '60px', borderColor: 'var(--color-gold)' }}
                >
                    <MessageSquare size={28} color="var(--color-gold)" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    className="glass-panel w-80 sm:w-96 flex flex-col overflow-hidden shadow-soft animate-fade-in-up"
                    style={{ height: '500px', animation: 'slideUp 0.4s ease-out' }}
                >
                    {/* Header */}
                    <div className="bg-black/80 p-4 flex justify-between items-center border-b border-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-amber-600 flex items-center justify-center bg-gray-900">
                                <Home size={18} color="var(--color-gold)" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-amber-500 font-header tracking-wider">DESTINO ABRIL</h3>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En línea
                                </span>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-amber-700/20 border border-amber-600/30 text-white rounded-br-none'
                                            : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Options Phase */}
                        {step === 1 && (
                            <div className="flex flex-col gap-2 mt-2 animate-fade-in">
                                {['Comprar Propiedad', 'Alquilar', 'Vender mi propiedad'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleOption(opt)}
                                        className="p-2 text-xs border border-amber-600/50 text-amber-500 hover:bg-amber-900/30 transition-colors rounded text-left"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-800 bg-black/80">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={step === 1 || step === 3}
                                placeholder={step === 1 ? "Seleccione una opción..." : "Escriba su mensaje..."}
                                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || step === 1 || step === 3}
                                className="text-amber-500 hover:text-amber-300 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
};

export default Chatbot;
