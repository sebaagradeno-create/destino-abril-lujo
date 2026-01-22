import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Phone, Home } from 'lucide-react';
import { useCRM } from '../context/CRMContext.jsx';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Steps: 0=Name, 1=Intent, 2=Type(if capt), 3=Loc, 4=Specs, 5=Garage, 6=Tasacion, 9=Phone, 10=End
    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState([
        { text: 'Bienvenido a Destino Abril. Soy su asistente personal. ¿Cómo se llama?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [data, setData] = useState({
        name: '', intent: '', type: '', location: '', specs: '', garage: '', appraisal: '', phone: ''
    });
    const messagesEndRef = useRef(null);
    const { addLead } = useCRM();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const addBotMessage = (text, nextStep, delay = 800) => {
        setTimeout(() => {
            setMessages(prev => [...prev, { text, sender: 'bot' }]);
            if (nextStep !== undefined) setStep(nextStep);
        }, delay);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        // Logic Flow
        if (step === 0) { // Captured Name
            setData(prev => ({ ...prev, name: input }));
            addBotMessage(`Un placer, ${input}. ¿Qué desea realizar hoy?`, 1);
        }
        else if (step === 3) { // Captured Location
            setData(prev => ({ ...prev, location: input }));
            addBotMessage('¿Cuántos dormitorios y baños tiene? (ej: 3 dorm, 2 baños)', 4);
        }
        else if (step === 4) { // Captured Specs
            setData(prev => ({ ...prev, specs: input }));
            addBotMessage('¿Cuenta con cochera o garaje?', 5); // Goes to Yes/No option
        }
        else if (step === 9) { // Captured Phone -> FINISH
            const phone = input;
            const finalData = { ...data, phone, source: 'Chatbot' };
            setData(finalData); // Update local state just in case

            addBotMessage('Gracias. Un agente analizará la información y lo contactará a la brevedad.', 10);

            // Save to CRM
            addLead(finalData);
        }
    };

    const handleOption = (option, currentStep) => {
        const text = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.value;

        setMessages(prev => [...prev, { text: text, sender: 'user' }]);

        if (currentStep === 1) { // Intent Selection
            setData(prev => ({ ...prev, intent: value }));
            if (value === 'Comprar') {
                addBotMessage('Excelente. Para asesorarlo mejor, déjeme su número de WhatsApp.', 9);
            } else {
                // Captacion Flow
                addBotMessage('Entendido. ¿Qué tipo de propiedad es?', 2);
            }
        }
        else if (currentStep === 2) { // Property Type
            setData(prev => ({ ...prev, type: value }));
            addBotMessage('¿En qué barrio o zona se encuentra?', 3);
        }
        else if (currentStep === 5) { // Garage
            setData(prev => ({ ...prev, garage: value }));
            addBotMessage('¿Desea solicitar una tasación profesional de la propiedad?', 6);
        }
        else if (currentStep === 6) { // Tasación
            setData(prev => ({ ...prev, appraisal: value }));
            addBotMessage('Perfecto. Por último, indíqueme su número de WhatsApp para contactarlo.', 9);
        }
    };

    // Helper to render options based on step
    const renderOptions = () => {
        if (step === 1) return ['Comprar Propiedad', 'Alquilar', 'Vender mi propiedad'];
        if (step === 2) return ['Casa', 'Apartamento', 'Terreno', 'Local Comercial'];
        if (step === 5) return ['Sí, tiene cochera', 'No tiene cochera'];
        if (step === 6) return ['Sí, quiero tasación', 'No, gracias'];
        return null;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-body">
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-black border border-amber-400 text-amber-400 p-4 rounded-full shadow-gold hover:scale-105 transition-all duration-300 flex items-center justify-center group"
                    style={{ width: '60px', height: '60px', borderColor: 'var(--color-gold)' }}
                >
                    <MessageSquare size={28} color="var(--color-gold)" />
                </button>
            )}

            {isOpen && (
                <div
                    className="glass-panel w-80 sm:w-96 flex flex-col overflow-hidden shadow-soft animate-fade-in-up"
                    style={{ height: '550px', animation: 'slideUp 0.4s ease-out' }}
                >
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

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/40">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-amber-700/20 border border-amber-600/30 text-white rounded-br-none'
                                            : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Options */}
                        {renderOptions() && (
                            <div className="flex flex-col gap-2 mt-2 animate-fade-in">
                                {renderOptions().map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => handleOption(opt, step)}
                                        className="p-2 text-xs border border-amber-600/50 text-amber-500 hover:bg-amber-900/30 transition-colors rounded text-left"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 border-t border-gray-800 bg-black/80">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                disabled={renderOptions() !== null || step === 10} // Disable if showing options or ended
                                placeholder={renderOptions() ? "Seleccione una opción..." : "Escriba su mensaje..."}
                                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600 disabled:opacity-50"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || renderOptions() !== null || step === 10}
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
