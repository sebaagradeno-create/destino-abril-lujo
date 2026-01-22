import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Phone, Home } from 'lucide-react';
import { useCRM } from '../context/CRMContext.jsx';
import { getAIResponse } from '../services/aiService';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    // FLOW STEPS:
    // 0: Name
    // 1: Intent (Buy/Rent/Sell)
    // 1.1: Rent Role (Tenant/Owner)
    // 2: Property Type
    // 3: Location (Where looking vs Where located)
    // 4: Specs (Dorms/Baths)
    // 5: Garage/Budget Switch
    //    -> If Seeker: 5 = Budget -> 9
    //    -> If Owner:  5 = Garage -> 6 (Appraisal) -> 9
    // 9: Phone -> End

    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState([
        { text: 'Bienvenido a Destino Abril. Soy su asistente personal. ¿Cómo se llama?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    // New State: userType ('seeker' = Buy/Tenant, 'owner' = Sell/Landlord)
    const [userType, setUserType] = useState('seeker');

    const [data, setData] = useState({
        name: '', intent: '', rentType: '', type: '', location: '', specs: '', garage: '', appraisal: '', budget: '', phone: ''
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

    const cleanName = (raw) => {
        const lower = raw.toLowerCase();
        if (raw.split(' ').length < 2) return raw;
        return raw.replace(/hola|soy|me llamo|mi nombre es|buenos dias|buenas tardes/gi, '').replace(/[\.,!]/g, '').trim();
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        // 1. Gemini AI Check
        const isQuestion = input.includes('?') || input.includes('¿') || input.length > 15;
        let aiAnswer = null;

        if (isQuestion || step === 1) {
            aiAnswer = await getAIResponse(input);
        }

        if (aiAnswer) {
            addBotMessage(aiAnswer, undefined, 0);
            if (step > 0 && step < 9) {
                setTimeout(() => {
                    setMessages(prev => [...prev, { text: "Para continuar con el proceso, ¿podría indicarme su respuesta anterior?", sender: 'bot' }]);
                }, 6000);
            }
            return;
        }

        // 2. Logic Flow

        // Step 0: Name
        if (step === 0) {
            const cleanedName = cleanName(input);
            const finalName = cleanedName.length > 0 ? cleanedName : input.split(' ').slice(0, 2).join(' ');
            setData(prev => ({ ...prev, name: finalName }));
            addBotMessage(`¡Qué gusto, ${finalName}! ¿En qué puedo ayudarte hoy?`, 1);
        }

        // Step 1 check handled in handleOption mostly, but for loose typing:
        else if (step === 1) {
            const lower = input.toLowerCase();
            if (lower.includes('comprar')) handleOption('Comprar Propiedad', 1);
            else if (lower.includes('alquilar')) handleOption('Alquilar', 1);
            else if (lower.includes('vender')) handleOption('Vender mi propiedad', 1);
            else addBotMessage("Por favor, selecciona una opción o dime si buscas Comprar, Alquilar o Vender.", 1);
        }

        // Step 1.1 Rent Role
        else if (step === 1.1) {
            const lower = input.toLowerCase();
            if (lower.includes('buscar') || lower.includes('inquilino')) handleOption('Soy Inquilino (Busco)', 1.1);
            else if (lower.includes('ofrecer') || lower.includes('propietario')) handleOption('Soy Propietario (Ofrezco)', 1.1);
            else addBotMessage("¿Buscas alquilar para vivir o eres propietario?", 1.1);
        }

        // Step 3: Location
        else if (step === 3) {
            setData(prev => ({ ...prev, location: input }));
            addBotMessage(userType === 'seeker'
                ? '¿Qué características busca? (Dormitorios, Baños...)'
                : '¿Qué características tiene la propiedad? (Dormitorios, Baños...)', 4);
        }

        // Step 4: Specs -> Branching
        else if (step === 4) {
            setData(prev => ({ ...prev, specs: input }));
            if (userType === 'seeker') {
                // Seeker -> Ask Budget
                addBotMessage('¿Cuál es su presupuesto aproximado?', 5);
            } else {
                // Owner -> Ask Garage
                addBotMessage('¿Cuenta con cochera o garaje?', 5);
            }
        }

        // Step 5: Handling the Branch
        else if (step === 5) {
            if (userType === 'seeker') {
                // Input is Budget -> Finish
                const budget = input;
                setData(prev => ({ ...prev, budget }));
                addBotMessage('Entendido. Por último, déjeme su número de WhatsApp para contactarlo.', 9);
            } else {
                // Input is Garage -> Ask Appraisal
                setData(prev => ({ ...prev, garage: input }));
                addBotMessage('¿Desea solicitar una tasación profesional?', 6);
            }
        }

        // Step 6: Appraisal (Owners only)
        else if (step === 6) {
            setData(prev => ({ ...prev, appraisal: input }));
            addBotMessage('Perfecto. Indíqueme su número de WhatsApp.', 9);
        }

        // Step 9: Phone -> End
        else if (step === 9) {
            const phone = input;
            const finalData = { ...data, phone, source: 'Chatbot' };
            setData(finalData);
            addBotMessage('Muchas gracias. Un asesor revisará su solicitud y lo contactará a la brevedad.', 10);
            addLead(finalData);
        }

        // Catch-all for typed steps 2 (Type)
        else if (step === 2) {
            setData(prev => ({ ...prev, type: input }));
            addBotMessage(userType === 'seeker'
                ? '¿En qué barrio o zona está buscando?'
                : '¿Ubicación de la propiedad?', 3);
        }
    };

    const handleOption = (option, currentStep) => {
        const text = typeof option === 'string' ? option : option.label;
        const value = typeof option === 'string' ? option : option.value;

        setMessages(prev => [...prev, { text: text, sender: 'user' }]);

        if (currentStep === 1) {
            setData(prev => ({ ...prev, intent: value }));

            if (value === 'Comprar') {
                setUserType('seeker');
                addBotMessage('Excelente. ¿Qué tipo de propiedad está buscando?', 2);
            }
            else if (value === 'Alquilar') {
                addBotMessage('¿Busca una propiedad para alquilar (Inquilino) o desea ofrecer la suya (Propietario)?', 1.1);
            }
            else { // Vender
                setUserType('owner');
                addBotMessage('Entendido. ¿Qué tipo de propiedad desea vender?', 2);
            }
        }
        else if (currentStep === 1.1) {
            setData(prev => ({ ...prev, rentType: value }));
            if (value === 'Soy Inquilino (Busco)') {
                setUserType('seeker');
                addBotMessage('¿Qué tipo de propiedad busca?', 2);
            } else {
                setUserType('owner');
                addBotMessage('Perfecto. ¿Qué tipo de propiedad ofrece?', 2);
            }
        }
        else if (currentStep === 2) {
            setData(prev => ({ ...prev, type: value }));
            addBotMessage(userType === 'seeker'
                ? '¿En qué barrio o zona está buscando?'
                : '¿Dónde se ubica la propiedad?', 3);
        }
        else if (currentStep === 5) { // Garage (Owner flow only)
            setData(prev => ({ ...prev, garage: value }));
            addBotMessage('¿Desea solicitar una tasación profesional?', 6);
        }
        else if (currentStep === 6) { // Appraisal
            setData(prev => ({ ...prev, appraisal: value }));
            addBotMessage('Perfecto. Por último, indíqueme su número de WhatsApp.', 9);
        }
    };

    const renderOptions = () => {
        if (step === 1) return ['Comprar Propiedad', 'Alquilar', 'Vender mi propiedad'];
        if (step === 1.1) return ['Soy Inquilino (Busco)', 'Soy Propietario (Ofrezco)'];
        if (step === 2) return ['Casa', 'Apartamento', 'Terreno', 'Local Comercial'];
        // Step 5 only shows options if Owner (Garage Yes/No). Seekers type budget manually.
        if (step === 5 && userType === 'owner') return ['Sí, tiene cochera', 'No tiene cochera'];
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
