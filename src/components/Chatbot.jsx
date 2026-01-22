import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Phone, Home } from 'lucide-react';
import { useCRM } from '../context/CRMContext.jsx';
import { getAIResponse } from '../services/aiService';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    // Steps: 
    // 0=Name, 1=Intent, 1.1=RentIntent, 2=Type, 3=Loc, 4=Specs, 5=Garage, 6=Tasacion, 9=Phone, 10=End
    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState([
        { text: 'Bienvenido a Destino Abril. Soy su asistente personal. ¿Cómo se llama?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [data, setData] = useState({
        name: '', intent: '', rentType: '', type: '', location: '', specs: '', garage: '', appraisal: '', phone: ''
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

    // Smart Name Cleaner
    const cleanName = (raw) => {
        const lower = raw.toLowerCase();
        // Return raw if it's short, otherwise try to strip common phrases
        if (raw.split(' ').length < 2) return raw;

        return raw.replace(/hola|soy|me llamo|mi nombre es|buenos dias|buenas tardes/gi, '')
            .replace(/[\.,!]/g, '') // remove punctuation
            .trim();
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        // 1. Gemini AI Check
        // Allow AI to answer questions at any time, or if we are in Step 1 (Main Menu) and user types loosely
        const isQuestion = input.includes('?') || input.includes('¿') || input.length > 15;
        let aiAnswer = null;

        if (isQuestion || step === 1) {
            aiAnswer = await getAIResponse(input);
        }

        if (aiAnswer) {
            addBotMessage(aiAnswer, undefined, 0);
            // Nudge back to flow if needed
            if (step > 0 && step < 9) {
                setTimeout(() => {
                    const lastBotMsg = messages.filter(m => m.sender === 'bot').pop();
                    // Don't repeat if the AI answer already guided them, but usually good to remind
                    // setMessages(prev => [...prev, { text: "Para continuar, seleccione una opción...", sender: 'bot' }]);
                }, 6000);
            }
            return;
        }

        // 2. Logic Flow

        // Step 0: Name Capture
        if (step === 0) {
            const cleanedName = cleanName(input);
            // Fallback: If cleaned name is empty or too long, just take first 2 words
            const finalName = cleanedName.length > 0 ? cleanedName : input.split(' ').slice(0, 2).join(' ');

            setData(prev => ({ ...prev, name: finalName }));
            addBotMessage(`¡Qué gusto, ${finalName}! ¿En qué puedo ayudarte hoy?`, 1);
        }

        // Step 1: Intent Selection (Handling typed input instead of click)
        else if (step === 1) {
            const lower = input.toLowerCase();
            if (lower.includes('comprar')) handleOption('Comprar Propiedad', 1);
            else if (lower.includes('alquilar')) handleOption('Alquilar', 1);
            else if (lower.includes('vender')) handleOption('Vender mi propiedad', 1);
            else addBotMessage("Entiendo. Para poder ayudarte mejor, por favor selecciona una de las opciones o dime si buscas comprar, alquilar o vender.", 1);
        }

        // Step 1.1: Rent sub-flow (Handling typed input)
        else if (step === 1.1) {
            const lower = input.toLowerCase();
            if (lower.includes('buscar') || lower.includes('inquilino')) handleOption('Soy Inquilino (Busco)', 1.1);
            else if (lower.includes('publicar') || lower.includes('propietario') || lower.includes('dueño')) handleOption('Soy Propietario (Ofrezco)', 1.1);
            else addBotMessage("¿Buscas una propiedad para vivir o quieres ofrecer la tuya en alquiler?", 1.1);
        }

        // General Flows
        else if (step === 3) { // Location
            setData(prev => ({ ...prev, location: input }));
            addBotMessage('¿Cuántos dormitorios y baños tiene? (ej: 3 dorm, 2 baños)', 4);
        }
        else if (step === 4) { // Specs
            setData(prev => ({ ...prev, specs: input }));
            addBotMessage('¿Cuenta con cochera o garaje?', 5);
        }
        else if (step === 9) { // Phone -> End
            const phone = input;
            const finalData = { ...data, phone, source: 'Chatbot' };
            setData(finalData);
            addBotMessage('Gracias por la información. Un agente analizará su solicitud y lo contactará a la brevedad.', 10);
            addLead(finalData);
        }
        else {
            // If user types something in other steps where we expect clicks (like Type or Yes/No)
            // We try to be smart, otherwise just accept it as the answer
            if (step === 2) { setData(prev => ({ ...prev, type: input })); addBotMessage('¿En qué barrio o zona se encuentra?', 3); }
            else if (step === 5) { setData(prev => ({ ...prev, garage: input })); addBotMessage('¿Desea solicitar una tasación profesional?', 6); }
            else if (step === 6) { setData(prev => ({ ...prev, appraisal: input })); addBotMessage('Perfecto. Indíqueme su número de WhatsApp.', 9); }
        }
    };

    const handleOption = (option, currentStep) => {
        const text = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.value;

        setMessages(prev => [...prev, { text: text, sender: 'user' }]);

        if (currentStep === 1) { // Main Intent
            setData(prev => ({ ...prev, intent: value }));
            if (value === 'Comprar') {
                addBotMessage('Excelente. Para asesorarlo mejor, déjeme su número de WhatsApp.', 9);
            }
            else if (value === 'Alquilar') {
                addBotMessage('¿Busca una propiedad para alquilar (Inquilino) o desea ofrecer la suya (Propietario)?', 1.1);
            }
            else { // Vender
                addBotMessage('Entendido. ¿Qué tipo de propiedad es?', 2);
            }
        }
        else if (currentStep === 1.1) { // Rent Sub-Intent
            setData(prev => ({ ...prev, rentType: value }));
            if (value === 'Soy Inquilino (Busco)') {
                // Tenant Flow -> Jump to Location? Or Type? Let's go to Type
                addBotMessage('¿Qué tipo de propiedad está buscando?', 2);
            } else {
                // Owner Flow -> Same capture
                addBotMessage('Perfecto. ¿Qué tipo de propiedad ofrece?', 2);
            }
        }
        // ... Rest of flows similar to before
        else if (currentStep === 2) { setData(prev => ({ ...prev, type: value })); addBotMessage('¿En qué barrio o zona se encuentra?', 3); }
        else if (currentStep === 5) { setData(prev => ({ ...prev, garage: value })); addBotMessage('¿Desea solicitar una tasación profesional?', 6); }
        else if (currentStep === 6) { setData(prev => ({ ...prev, appraisal: value })); addBotMessage('Perfecto. Por último, indíqueme su número de WhatsApp.', 9); }
    };

    const renderOptions = () => {
        if (step === 1) return ['Comprar Propiedad', 'Alquilar', 'Vender mi propiedad'];
        if (step === 1.1) return ['Soy Inquilino (Busco)', 'Soy Propietario (Ofrezco)'];
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
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D4AF37]">
                                        <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-amber-500 font-header tracking-wider">DESTINO ABRIL</h3>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En línea
                                        </span>
                                    </div>
                                </div>
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
                                // Re-enabled input!
                                placeholder={renderOptions() ? "Seleccione o escriba..." : "Escriba su mensaje..."}
                                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder-gray-600"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
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
