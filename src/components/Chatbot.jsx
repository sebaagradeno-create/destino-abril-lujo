import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Phone, Home, Paperclip, Check } from 'lucide-react';
import { useCRM } from '../context/CRMContext.jsx';
import { getAIResponse } from '../services/aiService';
import { supabase } from '../supabaseClient';
import { compressImage } from '../utils/imageUtils';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);

    // FLOW STEPS:
    // ... (Existing steps)
    // 7: Photo Upload (Only for Owner)
    // 6: Appraisal -> 7 -> 9

    const [step, setStep] = useState(0);
    const [messages, setMessages] = useState([
        { text: 'Bienvenido a Destino Abril. Soy su asistente personal. ¿Cómo se llama?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [userType, setUserType] = useState('seeker');

    const [data, setData] = useState({
        name: '', intent: '', rentType: '', type: '', location: '', specs: '', garage: '', appraisal: '', budget: '', phone: '',
        photos: [] // New field for photos
    });

    const [isUploading, setIsUploading] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
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

    // ... handleSend logic ...

    const handleSend = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { text: input, sender: 'user' }];
        setMessages(newMessages);
        setInput('');

        // Define Context for AI (Updated with Photo step)
        let stepName = `Step ${step}`;
        let contextDescription = "";

        if (step === 0) { stepName = "0"; contextDescription = "Pedir Nombre del cliente"; }
        // ... (existing contexts)
        else if (step === 7) { stepName = "7"; contextDescription = "Pedir Fotos de la propiedad (opcional)"; }
        else { stepName = "GENERAL"; contextDescription = "Conversación general"; }

        // AI CALL Logic (Same as before)
        let aiOutcome = null;
        try {
            aiOutcome = await getAIResponse(input, stepName, contextDescription);
        } catch (e) { console.error("Brain fail", e); }

        if (aiOutcome && aiOutcome.classification === "QUESTION") {
            addBotMessage(aiOutcome.reply || "No tengo esa información.", undefined, 0);
            return;
        }

        if (aiOutcome && aiOutcome.classification === "IRRELEVANT") {
            addBotMessage(aiOutcome.reply || "Disculpa, ¿podrías repetir?", undefined, 0);
            return;
        }

        const cleanInput = (aiOutcome && aiOutcome.classification === "VALID_DATA" && aiOutcome.extracted_data)
            ? aiOutcome.extracted_data
            : input;

        // LOGIC FLOW
        if (step === 0) {
            setData(prev => ({ ...prev, name: cleanInput }));
            addBotMessage(`¡Qué gusto, ${cleanInput}! ¿En qué puedo ayudarte hoy?`, 1);
        }
        else if (step === 1) {
            const lower = cleanInput.toLowerCase();
            if (lower.includes('comprar')) handleOption('Comprar Propiedad', 1);
            else if (lower.includes('alquilar')) handleOption('Alquilar', 1);
            else if (lower.includes('vender')) handleOption('Vender mi propiedad', 1);
            else addBotMessage("Por favor seleccione una opción.", 1);
        }
        else if (step === 1.1) {
            const lower = cleanInput.toLowerCase();
            if (lower.includes('buscar') || lower.includes('inquilino')) handleOption('Soy Inquilino (Busco)', 1.1);
            else if (lower.includes('ofrecer') || lower.includes('propietario')) handleOption('Soy Propietario (Ofrezco)', 1.1);
            else addBotMessage("¿Buscas alquilar o eres propietario?", 1.1);
        }
        else if (step === 3) {
            setData(prev => ({ ...prev, location: cleanInput }));
            addBotMessage(userType === 'seeker'
                ? '¿Qué características busca? (Dormitorios, Baños...)'
                : '¿Qué características tiene la propiedad? (Dormitorios, Baños...)', 4);
        }
        else if (step === 4) {
            setData(prev => ({ ...prev, specs: cleanInput }));
            if (userType === 'seeker') {
                addBotMessage('¿Cuál es su presupuesto aproximado?', 5);
            } else {
                addBotMessage('¿Cuenta con cochera o garaje?', 5);
            }
        }
        else if (step === 5) {
            if (userType === 'seeker') {
                setData(prev => ({ ...prev, budget: cleanInput }));
                addBotMessage('Entendido. Por último, déjeme su número de WhatsApp para contactarlo.', 9);
            } else {
                setData(prev => ({ ...prev, garage: cleanInput }));
                addBotMessage('¿Desea solicitar una tasación profesional?', 6);
            }
        }
        else if (step === 6) { // Appraisal -> Photos
            setData(prev => ({ ...prev, appraisal: cleanInput }));
            addBotMessage('¿Tiene fotos de la propiedad para compartir? (Puede adjuntarlas ahora o decir "No tengo")', 7);
        }
        else if (step === 7) { // Photos Step (Text Response)
            // If they type "No" or "Skip"
            if (cleanInput.toLowerCase().includes('no') || cleanInput.length < 5) {
                addBotMessage('No hay problema. Por último, indíqueme su número de WhatsApp.', 9);
            } else {
                // If they typed something else relevant?
                addBotMessage('Gracias. Por último, indíqueme su número de WhatsApp.', 9);
            }
        }
        else if (step === 9) {
            const phone = cleanInput;
            const finalData = { ...data, phone, source: 'Chatbot' };
            setData(finalData);
            addBotMessage('Muchas gracias. Hemos recibido su ficha y fotos. Un asesor lo contactará a la brevedad.', 10);
            addLead(finalData);
        }
        else if (step === 2) {
            setData(prev => ({ ...prev, type: cleanInput }));
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
        else if (currentStep === 5) {
            setData(prev => ({ ...prev, garage: value }));
            addBotMessage('¿Desea solicitar una tasación profesional?', 6);
        }
        else if (currentStep === 6) {
            setData(prev => ({ ...prev, appraisal: value }));
            addBotMessage('¿Tiene fotos de la propiedad? (Puede adjuntarlas ahora)', 7);
        }
        else if (currentStep === 7) {
            // Handled via file upload mostly
        }
    };

    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const uploadedUrls = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                // Compress
                const compressedBlob = await compressImage(file);

                const fileName = `${Date.now()}-${file.name}`;
                const { data: uploadData, error } = await supabase.storage
                    .from('properties')
                    .upload(fileName, compressedBlob);

                if (error) throw error;

                const { data: publicData } = supabase.storage.from('properties').getPublicUrl(fileName);
                uploadedUrls.push(publicData.publicUrl);
            }

            setData(prev => ({ ...prev, photos: [...prev.photos, ...uploadedUrls] }));
            setMessages(prev => [...prev, { text: `📷 ${uploadedUrls.length} foto(s) subida(s)`, sender: 'user' }]);

            setTimeout(() => {
                addBotMessage('¡Excelentes fotos! Las he guardado. ¿Tiene alguna otra o desea continuar?', 7);
                // We create a "Continuing" option visually
                setMessages(prev => [...prev, {
                    text: "Continuar >", sender: 'bot', isOption: true, onClick: () => {
                        addBotMessage('Perfecto. Por último, indíqueme su número de WhatsApp.', 9);
                    }
                }]);
            }, 1000);

        } catch (error) {
            console.error(error);
            addBotMessage('Hubo un error al subir la imagen. Intente de nuevo o continúe sin foto.', 7);
        } finally {
            setIsUploading(false);
        }
    };

    const renderOptions = () => {
        if (step === 1) return ['Comprar Propiedad', 'Alquilar', 'Vender mi propiedad'];
        if (step === 1.1) return ['Soy Inquilino (Busco)', 'Soy Propietario (Ofrezco)'];
        if (step === 2) return ['Casa', 'Apartamento', 'Terreno', 'Local Comercial'];
        if (step === 5 && userType === 'owner') return ['Sí, tiene cochera', 'No tiene cochera'];
        if (step === 6) return ['Sí, quiero tasación', 'No, gracias'];
        // Step 7: We show upload button in main UI, maybe a "Skip" button here
        if (step === 7) return ['No tengo fotos por ahora'];
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
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> v3.0 Server-Brain
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
                                {msg.isOption ? (
                                    <button onClick={msg.onClick} className="bg-amber-600 text-white px-4 py-2 rounded-full text-sm hover:bg-amber-700 transition">
                                        {msg.text}
                                    </button>
                                ) : (
                                    <div
                                        className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-amber-700/20 border border-amber-600/30 text-white rounded-br-none'
                                            : 'bg-gray-800/80 border border-gray-700 text-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                )}
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
                        {/* Photo Upload Area (Only visible in step 7 for owners) */}
                        {step === 7 && (
                            <div className="mb-2 flex justify-center">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    disabled={isUploading}
                                    className="flex items-center gap-2 bg-gray-800 text-amber-400 px-4 py-2 rounded-full text-xs border border-amber-600/40 hover:bg-gray-700 transition"
                                >
                                    {isUploading ? 'Subiendo...' : <><Paperclip size={14} /> Adjuntar Fotos</>}
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
