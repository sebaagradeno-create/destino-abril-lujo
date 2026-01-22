import React from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { ArrowRight, Star, Instagram, Facebook, Twitter, Share2 } from 'lucide-react';

const Landing = () => {
    const { properties } = useCRM();

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

            {/* Footer */}
            <footer className="py-12 bg-black border-t border-gray-900 text-center">
                <h4 className="font-header text-2xl text-[#D4AF37] mb-4">DESTINO ABRIL</h4>
                <p className="text-gray-600 text-xs tracking-widest uppercase">© 2026. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

export default Landing;
