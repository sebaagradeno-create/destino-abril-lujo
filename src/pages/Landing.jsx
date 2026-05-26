import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext.jsx';
import {
  ArrowRight, Star, Instagram, Facebook, Twitter, Share2, Send,
  CheckCircle, BedDouble, Bath, Maximize2, MapPin, ChevronLeft,
  ChevronRight, Search
} from 'lucide-react';

const formatPrecio = (precio, moneda) => {
  if (!precio) return 'Consultar';
  return `${moneda === 'UYU' ? '$' : 'U$S'} ${precio.toLocaleString('es-UY')}`;
};

// ─── CARRUSEL PROPIEDADES DESTACADAS ────────────────────────────────────────
const FeaturedCarousel = ({ properties }) => {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const prev = () => setIdx(i => (i - 1 + properties.length) % properties.length);
  const next = () => setIdx(i => (i + 1) % properties.length);

  useEffect(() => {
    if (paused || properties.length < 2) return;
    timer.current = setTimeout(next, 5000);
    return () => clearTimeout(timer.current);
  }, [idx, paused, properties.length]);

  if (properties.length === 0) {
    return (
      <div className="animate-pulse">
        <div className="h-[55vh] bg-gray-900 w-full mb-6" />
        <div className="h-6 bg-gray-800 rounded w-1/2 mx-auto mb-3" />
        <div className="h-4 bg-gray-800 rounded w-1/3 mx-auto" />
      </div>
    );
  }

  const prop = properties[idx];
  const allImgs = prop.imagen_principal
    ? [prop.imagen_principal, ...(prop.imagenes || []).filter(u => u !== prop.imagen_principal)]
    : (prop.imagenes || []);

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Imagen principal */}
      <div className="relative h-[55vh] overflow-hidden group">
        <Link to={`/propiedad/${prop.id}`}>
          {allImgs[0] ? (
            <img src={allImgs[0]} alt={prop.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={e => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-6xl">🏠</div>
          )}
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </Link>

        {/* Badge tipo */}
        <span className={`absolute top-5 left-5 z-10 px-3 py-1 text-xs uppercase tracking-widest font-bold ${prop.tipo_operacion === 'venta' ? 'bg-amber-600 text-black' : 'bg-emerald-700 text-white'}`}>
          {prop.tipo_operacion}
        </span>

        {/* Precio badge */}
        <span className="absolute top-5 right-5 z-10 bg-[#D4AF37] text-black px-3 py-1 text-sm font-bold">
          {formatPrecio(prop.precio, prop.moneda)}
        </span>

        {/* Info sobre la imagen (bottom) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <Link to={`/propiedad/${prop.id}`}>
            <h3 className="text-white text-2xl font-header mb-1 line-clamp-1 hover:text-[#D4AF37] transition-colors">{prop.titulo}</h3>
          </Link>
          <div className="flex items-center gap-4 text-gray-300 text-sm">
            {prop.barrio && <span className="flex items-center gap-1"><MapPin size={13} />{prop.barrio}</span>}
            {prop.dormitorios != null && <span className="flex items-center gap-1"><BedDouble size={13} />{prop.dormitorios} dorm.</span>}
            {prop.banios != null && <span className="flex items-center gap-1"><Bath size={13} />{prop.banios} baños</span>}
            {prop.superficie_total && <span className="flex items-center gap-1"><Maximize2 size={13} />{prop.superficie_total}m²</span>}
          </div>
        </div>

        {/* Flechas */}
        {properties.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 hover:bg-[#D4AF37] hover:text-black text-white flex items-center justify-center transition-all">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/50 hover:bg-[#D4AF37] hover:text-black text-white flex items-center justify-center transition-all">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dots + contador */}
      {properties.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-5">
          {properties.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-6 h-2 bg-[#D4AF37]' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'}`} />
          ))}
          <span className="text-gray-600 text-xs ml-2">{idx + 1}/{properties.length}</span>
        </div>
      )}

      {/* Miniaturas */}
      {properties.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {properties.map((p, i) => (
            <button key={p.id} onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all ${i === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
              {p.imagen_principal ? (
                <img src={p.imagen_principal} alt="" className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
              ) : (
                <div className="w-full h-full bg-gray-800" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── BUSCADOR RÁPIDO ─────────────────────────────────────────────────────────
const BuscadorRapido = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('alquiler');
  const [barrio, setBarrio] = useState('');
  const [dorm, setDorm] = useState('');

  const buscar = (e) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (tipo) p.set('tipo', tipo);
    if (barrio.trim()) p.set('barrio', barrio.trim());
    if (dorm) p.set('dorm', dorm);
    navigate(`/propiedades?${p}`);
  };

  return (
    <section className="py-16 bg-[#D4AF37]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-header text-black text-center mb-8">Encontrá tu propiedad ideal</h2>
        <form onSubmit={buscar} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <select value={tipo} onChange={e => setTipo(e.target.value)}
            className="flex-shrink-0 bg-white border-0 text-gray-900 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer">
            <option value="alquiler">Alquilar</option>
            <option value="venta">Comprar</option>
          </select>
          <input
            type="text"
            value={barrio}
            onChange={e => setBarrio(e.target.value)}
            placeholder="Barrio o zona... (ej: Pocitos, Carrasco)"
            className="flex-1 bg-white border-0 text-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 placeholder-gray-400"
          />
          <select value={dorm} onChange={e => setDorm(e.target.value)}
            className="flex-shrink-0 bg-white border-0 text-gray-900 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/20 cursor-pointer">
            <option value="">Cualquier dormitorio</option>
            <option value="1">1+ dormitorio</option>
            <option value="2">2+ dormitorios</option>
            <option value="3">3+ dormitorios</option>
            <option value="4">4+ dormitorios</option>
          </select>
          <button type="submit"
            className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors flex-shrink-0">
            <Search size={16} /> Buscar
          </button>
        </form>
      </div>
    </section>
  );
};

// ─── LANDING PRINCIPAL ───────────────────────────────────────────────────────
const Landing = () => {
  const { featuredProperties, addLead } = useCRM();
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

      {/* Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-50 z-0" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2666&auto=format&fit=crop')] bg-cover bg-center opacity-30 z-0" />
        <div className="z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="block text-amber-500 tracking-[0.3em] uppercase text-sm mb-4 font-body">Real Estate Uruguay</span>
          <h1 className="text-5xl md:text-7xl font-header mb-8 leading-tight">
            Encuentre su lugar <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4DF4E]">Exclusivo</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
            Propiedades de lujo, atención personalizada y la llave a su nuevo estilo de vida en Uruguay.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/propiedades" className="btn-primary group flex items-center gap-2">
              Ver Propiedades <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); }}
              className="bg-transparent border border-[#D4AF37] text-[#D4AF37] px-6 py-3 font-bold uppercase tracking-widest hover:bg-[#D4AF37] hover:text-black transition-all flex items-center gap-2"
            >
              <Share2 size={18} /> Compartir
            </button>
          </div>
        </div>
      </section>

      {/* Propiedades Destacadas — Carrusel */}
      <section className="py-16 px-6 md:px-12 bg-[#0C0C0C]">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-header mb-2">Propiedades Destacadas</h2>
              <div className="h-1 w-20 bg-[#D4AF37]" />
            </div>
            <Link to="/propiedades" className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors uppercase text-xs tracking-widest">
              Ver todo <ArrowRight size={14} />
            </Link>
          </div>
          <FeaturedCarousel properties={featuredProperties} />
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-[#111] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="w-full h-96 border border-[#D4AF37]/30 p-4">
              <div className="w-full h-full bg-gray-800 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center grayscale hover:grayscale-0 transition-all duration-700" />
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
              <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"><Instagram size={18} /></a>
              <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"><Facebook size={18} /></a>
              <a href="#" className="w-10 h-10 border border-gray-700 flex items-center justify-center rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all"><Twitter size={18} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Buscador rápido */}
      <BuscadorRapido />

      {/* Formulario de Contacto */}
      <section className="py-24 bg-black" id="contacto">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-amber-500 tracking-[0.3em] uppercase text-xs font-body">Contacto directo</span>
            <h2 className="text-3xl md:text-4xl font-header mt-3 mb-4">
              Hablemos de su <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F4DF4E]">propiedad</span>
            </h2>
            <div className="h-px w-16 bg-[#D4AF37] mx-auto" />
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
                <input required type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Juan García"
                  className="bg-[#111] border border-gray-800 text-white px-4 py-3 focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-gray-500">WhatsApp *</label>
                <input required type="text" value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+598 99 000 000"
                  className="bg-[#111] border border-gray-800 text-white px-4 py-3 focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-gray-500">¿Qué le interesa?</label>
                <select value={form.intent} onChange={e => setForm(p => ({ ...p, intent: e.target.value }))}
                  className="bg-[#111] border border-gray-800 text-white px-4 py-3 focus:border-[#D4AF37] focus:outline-none transition-colors">
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
                <input type="text" value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  placeholder="Zona, presupuesto, detalles..."
                  className="bg-[#111] border border-gray-800 text-white px-4 py-3 focus:border-[#D4AF37] focus:outline-none transition-colors placeholder-gray-700" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" disabled={formSending} className="btn-primary flex items-center gap-2 disabled:opacity-60">
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
