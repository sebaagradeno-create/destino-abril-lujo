import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { ArrowRight, Star, Instagram, Facebook, Twitter, Share2, Send, CheckCircle } from 'lucide-react';

const Landing = () => {
    const { properties, addLead } = useCRM();
    const [form, setForm] = useState({ name: '', phone: '', intent: '', message: '' });
    const [formSent, setFormSent] = useState(false);
    const [formSending, setFormSending] = useState(false);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormSending(true);
        await addLead({ ...form, source: 'Formulario Web', type: '', location: '', specs: '', garage: '', appraisal: '', photos: [] });
        setFormSent(true);
        setFormSending(false);
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pt-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                {/* Abstract Luxury Background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-50 z-0"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2666&auto=format&fit=crop')] bg-cover bg-center opacity-30 z-0 selection:bg-none"></div>

                <div className="z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">
                    <span className="block text-amber-500 tracking-[0.3em] uppercase text-sm mb-4 font-body">Real Estate Uruguay</span>
                    <h1 className="text-5xl md:text-7xl font-header mb-8 leading-tight">
                        Encuentre su lugar <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4DF4E]">Exclusivo</span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
                        Propiedades de lujo, atención personalizada y la llave a su nuevo estilo de vida en Uruguay.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button className="btn-primary group flex items-center gap-2">
                            Ver Propiedades <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('¡Enlace copiado al portapapeles!');
                            }}
                            className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-6 py-3 rounded-sm font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2"
                        >
                            <Share2 size={18} /> Compartir
                        </button>
                    </div>
                </div>
            </section>

            {/* Featured Properties Section */}
            <section className="py-24 px-6 md:px-12 bg-[#0C0C0C]">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-header mb-2">Propiedades Destacadas</h2>
                        <div className="h-1 w-20 bg-[#D4AF37]"></div>
                    </div>
                    <button className="hidden md:flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors uppercase text-xs tracking-widest">
                        Ver todo <ArrowRight size={14} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {properties.map((prop) => (
                        <div key={prop.id} className="group cursor-pointer">
                            <div className="relative h-64 overflow-hidden mb-4 rounded-sm">
                                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider text-white z-10">
                                    {prop.type}
                                </div>
                                {/* Placeholder for property images */}
                                <div className={`w-full h-full bg-gray-900 group-hover:scale-105 transition-transform duration-700 bg-cover bg-center`}
                                    style={{ backgroundImage: `url('https://source.unsplash.com/random/800x600?luxury,house,${prop.id}')` }}
                                >
                                    {/* Fallback gradient if image fails */}
                                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black opacity-50"></div>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-header mb-1 group-hover:text-[#D4AF37] transition-colors">{prop.title}</h3>
                                    <p className="text-gray-500 text-sm">{prop.status}</p>
                                </div>
                                <span className="text-[#D4AF37] font-bold">{prop.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* About / Social Proof */}
            <section className="py-24 bg-[#111] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="w-full h-96 border border-[#D4AF37]/30 p-4">
                            <div className="w-full h-full bg-gray-800 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700"></div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-[#D4AF37] p-8 flex flex-col justify-center items-center text-center text-black">
                            <span className="text-4xl font-header font-bold">15+</span>
                            <span className="text-sm font-bold uppercase tracking-widest mt-2">Años de Experticia</span>
                        </div>
                    </div>

                    <div>
                        <Star size={32} className="text-[#D4AF37] mb-6" fill="#D4AF37" />
                        <h2 className="text-4xl font-header mb-6">Expertos en el Mercado Uruguayo</h2>
                        <p className="text-gray-400 leading-relaxed mb-8 font-light">
                            Destino Abril no es solo una inmobiliaria; es su socio estratégico en la búsqueda de la excelencia.
                            Conectamos propiedades excepcionales con personas extraordinarias.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all">
                                <Twitter size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Formulario de Contacto */}
            <section className="py-24 bg-black" id="contacto">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="text-amber-500 tracking-[0.3em] uppercase text-xs font-body">Contacto directo</span>
                        <h2 className="text-3xl md:text-4xl font-header mt-3 mb-4">Hablemos de su <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4DF4E]">propiedad</span></h2>
                        <div className="h-px w-16 bg-[#D4AF37] mx-auto"></div>
                    </div>

                    {formSent ? (
                        <div className="flex flex-col items-center gap-4 py-16 text-center">
                            <CheckCircle size={52} className="text-[#D4AF37]" />
                            <h3 className="text-2xl font-header text-white">¡Mensaje recibido!</h3>
                            <p className="text-gray-400 max-w-sm">Un asesor de Destino Abril se pondrá en contacto con usted a la brevedad.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Nombre completo *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Juan García"
                                    className="bg-[#111] border border-gray-800 text-white px-4 py-3 rounded-sm focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">WhatsApp *</label>
                                <input
                                    required
                                    type="text"
                                    value={form.phone}
                                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                                    placeholder="+598 99 000 000"
                                    className="bg-[#111] border border-gray-800 text-white px-4 py-3 rounded-sm focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">¿Qué le interesa?</label>
                                <select
                                    value={form.intent}
                                    onChange={e => setForm(p => ({ ...p, intent: e.target.value }))}
                                    className="bg-[#111] border border-gray-800 text-white px-4 py-3 rounded-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Comprar">Comprar propiedad</option>
                                    <option value="Alquilar">Alquilar propiedad</option>
                                    <option value="Vender">Vender mi propiedad</option>
                                    <option value="Tasacion">Tasación</option>
                                    <option value="Inversión">Inversión</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase tracking-widest text-gray-500">Mensaje</label>
                                <input
                                    type="text"
                                    value={form.message}
                                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                                    placeholder="Zona, presupuesto, detalles..."
                                    className="bg-[#111] border border-gray-800 text-white px-4 py-3 rounded-sm focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700"
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={formSending}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-60"
                                >
                                    {formSending ? 'Enviando...' : <><Send size={16} /> Enviar consulta</>}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-black border-t border-gray-900 text-center">
                <h4 className="font-header text-2xl text-[#D4AF37] mb-4">DESTINO ABRIL</h4>
                <p className="text-gray-600 text-xs tracking-widest uppercase">© 2026. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Landing;
