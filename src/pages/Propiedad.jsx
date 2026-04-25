import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BedDouble, Bath, Maximize2, MapPin, ChevronLeft, ChevronRight, X, Star, User, Car, Waves, Flame, Sofa, Phone, MessageCircle } from 'lucide-react';

const API = 'https://n8n.automatizameuy.com/webhook/propiedades';

const formatPrecio = (precio, moneda) => {
  if (!precio) return 'Consultar precio';
  const sym = moneda === 'UYU' ? '$' : 'U$S';
  return `${sym} ${precio.toLocaleString('es-UY')}`;
};

const Carousel = ({ imagenes, titulo }) => {
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const prev = () => setIdx(i => (i - 1 + imagenes.length) % imagenes.length);
  const next = () => setIdx(i => (i + 1) % imagenes.length);

  useEffect(() => {
    if (!lightbox) return;
    const handler = e => { if (e.key === 'Escape') setLightbox(false); if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, idx]);

  if (!imagenes?.length) return (
    <div className="w-full h-96 bg-gray-900 flex items-center justify-center text-6xl">🏠</div>
  );

  return (
    <>
      {/* Carousel principal */}
      <div className="relative w-full h-[60vh] max-h-[600px] bg-black overflow-hidden group">
        <img
          src={imagenes[idx]}
          alt={`${titulo} - ${idx + 1}`}
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setLightbox(true)}
          onError={e => { e.target.src = ''; e.target.style.display = 'none'; }}
        />
        {imagenes.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-[#D4AF37] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-[#D4AF37] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {imagenes.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-[#D4AF37] w-5' : 'bg-white/50'}`} />
              ))}
            </div>
            <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-2 py-1">
              {idx + 1} / {imagenes.length}
            </div>
          </>
        )}
        <div className="absolute bottom-4 right-4 text-white/50 text-xs">Clic para ampliar</div>
      </div>

      {/* Thumbnails */}
      {imagenes.length > 1 && (
        <div className="flex gap-2 p-3 bg-[#0A0A0A] overflow-x-auto">
          {imagenes.map((img, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`flex-shrink-0 w-16 h-12 overflow-hidden border-2 transition-all ${i === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-50 hover:opacity-100'}`}>
              <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 text-white hover:text-[#D4AF37]" onClick={() => setLightbox(false)}><X size={28} /></button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-[#D4AF37]" onClick={e => { e.stopPropagation(); prev(); }}><ChevronLeft size={36} /></button>
          <img src={imagenes[idx]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-[#D4AF37]" onClick={e => { e.stopPropagation(); next(); }}><ChevronRight size={36} /></button>
          <div className="absolute bottom-4 text-gray-400 text-sm">{idx + 1} / {imagenes.length}</div>
        </div>
      )}
    </>
  );
};

export default function Propiedad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prop, setProp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ nombre: '', telefono: '', mensaje: '' });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch(`${API}?limite=100`)
      .then(r => r.json())
      .then(data => {
        const found = data.propiedades?.find(p => String(p.id) === String(id));
        if (found) setProp(found);
        else navigate('/propiedades', { replace: true });
      })
      .catch(() => navigate('/propiedades', { replace: true }))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async e => {
    e.preventDefault();
    try {
      await fetch('https://n8n.automatizameuy.com/webhook/destino-abril-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.nombre,
          phone: contactForm.telefono,
          message: contactForm.mensaje,
          source: `Web - Propiedad #${id}`,
          intent: 'consulta_propiedad',
          propiedad_id: id,
          propiedad_titulo: prop?.titulo
        })
      });
      setEnviado(true);
    } catch {}
  };

  if (loading) return (
    <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
      <div className="text-gray-500 animate-pulse">Cargando propiedad...</div>
    </div>
  );

  if (!prop) return null;

  const imagenes = prop.imagen_principal
    ? [prop.imagen_principal, ...(prop.imagenes || []).filter(i => i !== prop.imagen_principal)]
    : (prop.imagenes || []);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <Link to="/propiedades" className="text-gray-500 hover:text-[#D4AF37] text-sm flex items-center gap-1 transition-colors w-fit">
          <ArrowLeft size={14} /> Volver a propiedades
        </Link>
      </div>

      {/* Carousel */}
      <Carousel imagenes={imagenes} titulo={prop.titulo} />

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Info principal */}
        <div className="lg:col-span-2">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 text-xs uppercase tracking-wider font-bold ${prop.tipo_operacion === 'venta' ? 'bg-amber-600 text-black' : 'bg-emerald-700 text-white'}`}>
              {prop.tipo_operacion}
            </span>
            {prop.destacada && (
              <span className="px-3 py-1 text-xs bg-[#D4AF37] text-black uppercase tracking-wider font-bold flex items-center gap-1">
                <Star size={10} fill="black" /> Destacada
              </span>
            )}
            {prop.es_dueno_directo && (
              <span className="px-3 py-1 text-xs bg-orange-500 text-white uppercase tracking-wider font-bold flex items-center gap-1">
                <User size={10} /> Trato con dueño
              </span>
            )}
            {prop.verificada && (
              <span className="px-3 py-1 text-xs bg-blue-600 text-white uppercase tracking-wider font-bold">Verificada</span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-header mb-2">{prop.titulo}</h1>
          {prop.barrio && (
            <p className="text-gray-400 flex items-center gap-1 mb-6">
              <MapPin size={14} /> {prop.barrio}{prop.ciudad ? `, ${prop.ciudad}` : ''}{prop.departamento ? `, ${prop.departamento}` : ''}
            </p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {prop.dormitorios != null && (
              <div className="bg-[#0C0C0C] border border-gray-900 p-4 text-center">
                <BedDouble size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xl font-bold">{prop.dormitorios}</p>
                <p className="text-gray-500 text-xs">Dormitorios</p>
              </div>
            )}
            {prop.banios != null && (
              <div className="bg-[#0C0C0C] border border-gray-900 p-4 text-center">
                <Bath size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xl font-bold">{prop.banios}</p>
                <p className="text-gray-500 text-xs">Baños</p>
              </div>
            )}
            {prop.superficie_total && (
              <div className="bg-[#0C0C0C] border border-gray-900 p-4 text-center">
                <Maximize2 size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xl font-bold">{prop.superficie_total}</p>
                <p className="text-gray-500 text-xs">m² totales</p>
              </div>
            )}
            {prop.superficie_util && (
              <div className="bg-[#0C0C0C] border border-gray-900 p-4 text-center">
                <Maximize2 size={20} className="text-[#D4AF37] mx-auto mb-1" />
                <p className="text-xl font-bold">{prop.superficie_util}</p>
                <p className="text-gray-500 text-xs">m² útiles</p>
              </div>
            )}
          </div>

          {/* Amenidades */}
          {(prop.garaje || prop.piscina || prop.parrillero || prop.amoblado) && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Amenidades</h3>
              <div className="flex flex-wrap gap-3">
                {prop.garaje && <span className="flex items-center gap-2 bg-[#0C0C0C] border border-gray-800 px-3 py-2 text-sm"><Car size={14} className="text-[#D4AF37]" /> Garaje</span>}
                {prop.piscina && <span className="flex items-center gap-2 bg-[#0C0C0C] border border-gray-800 px-3 py-2 text-sm"><Waves size={14} className="text-[#D4AF37]" /> Piscina</span>}
                {prop.parrillero && <span className="flex items-center gap-2 bg-[#0C0C0C] border border-gray-800 px-3 py-2 text-sm"><Flame size={14} className="text-[#D4AF37]" /> Parrillero</span>}
                {prop.amoblado && <span className="flex items-center gap-2 bg-[#0C0C0C] border border-gray-800 px-3 py-2 text-sm"><Sofa size={14} className="text-[#D4AF37]" /> Amoblado</span>}
              </div>
            </div>
          )}

          {/* Descripción */}
          {prop.descripcion && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3">Descripción</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{prop.descripcion}</p>
            </div>
          )}

          {/* Resumen IA */}
          {prop.resumen_ia && (
            <div className="bg-[#0C0C0C] border border-[#D4AF37]/20 p-4 mb-8">
              <p className="text-xs uppercase tracking-widest text-[#D4AF37] mb-2">Análisis IA</p>
              <p className="text-gray-300 text-sm">{prop.resumen_ia}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Precio */}
          <div className="bg-[#0C0C0C] border border-gray-900 p-6">
            <p className="text-[#D4AF37] text-3xl font-bold mb-1">{formatPrecio(prop.precio, prop.moneda)}</p>
            {prop.precio_expensas && (
              <p className="text-gray-500 text-sm">+ $ {prop.precio_expensas.toLocaleString()} en expensas</p>
            )}
            <div className="h-px bg-gray-800 my-4"></div>
            <div className="space-y-2 text-sm text-gray-400">
              {prop.tipo_propiedad && <p><span className="text-gray-600">Tipo:</span> {prop.tipo_propiedad}</p>}
              {prop.fuente && <p><span className="text-gray-600">Fuente:</span> {prop.fuente}</p>}
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-[#0C0C0C] border border-gray-900 p-6">
            <h3 className="font-header text-lg mb-4">Consultar esta propiedad</h3>
            {enviado ? (
              <div className="text-center py-4">
                <p className="text-[#D4AF37] text-2xl mb-2">✓</p>
                <p className="text-gray-300 text-sm">Recibimos tu consulta. Te contactamos pronto.</p>
              </div>
            ) : (
              <form onSubmit={handleContact} className="space-y-3">
                <input
                  required type="text" placeholder="Tu nombre"
                  value={contactForm.nombre}
                  onChange={e => setContactForm(p => ({ ...p, nombre: e.target.value }))}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
                />
                <input
                  required type="text" placeholder="WhatsApp / Teléfono"
                  value={contactForm.telefono}
                  onChange={e => setContactForm(p => ({ ...p, telefono: e.target.value }))}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
                />
                <textarea
                  rows={3} placeholder="¿Qué querés saber?"
                  value={contactForm.mensaje}
                  onChange={e => setContactForm(p => ({ ...p, mensaje: e.target.value }))}
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2.5 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700 resize-none"
                />
                <button type="submit" className="w-full bg-[#D4AF37] text-black py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#F4DF4E] transition-colors">
                  Enviar consulta
                </button>
              </form>
            )}

            {/* WhatsApp directo */}
            <a
              href={`https://wa.me/59897595464?text=${encodeURIComponent(`Hola, me interesa la propiedad: ${prop.titulo} (ID: ${prop.id})`)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full border border-green-600 text-green-400 py-2.5 text-sm hover:bg-green-600 hover:text-white transition-all"
            >
              <MessageCircle size={16} /> WhatsApp directo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
