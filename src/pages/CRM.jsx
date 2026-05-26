import React, { useState, useEffect, useMemo } from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { User, Phone, Star, Home, BedDouble, Bath, MapPin, LogOut, RefreshCw, Search, MessageCircle, TrendingUp, Users, BarChart2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CRM_WEBHOOK  = 'https://n8n.automatizameuy.com/webhook/crm-update-propiedad';
const CRM_ESTADO   = 'https://n8n.automatizameuy.com/webhook/crm-update-estado';
const API_PROPS    = 'https://n8n.automatizameuy.com/webhook/propiedades-webhook';

const ESTADOS = ['nuevo_ingreso', 'publicada', 'disponible', 'reservada', 'alquilada', 'vendida', 'no_disponible'];

const ESTADO_CFG = {
  nuevo_ingreso: { label: 'Nuevo Ingreso', cls: 'bg-blue-900/30 text-blue-300 border-blue-800/50' },
  publicada:     { label: 'Publicada',     cls: 'bg-green-900/30 text-green-300 border-green-800/50' },
  disponible:    { label: 'Disponible',    cls: 'bg-lime-900/30 text-lime-300 border-lime-800/50' },
  reservada:     { label: 'Reservada',     cls: 'bg-amber-900/30 text-amber-300 border-amber-800/50' },
  alquilada:     { label: 'Alquilada',     cls: 'bg-purple-900/30 text-purple-300 border-purple-800/50' },
  vendida:       { label: 'Vendida',       cls: 'bg-pink-900/30 text-pink-300 border-pink-800/50' },
  no_disponible: { label: 'No Disp.',      cls: 'bg-gray-800 text-gray-400 border-gray-700' },
};

const formatPrecio = (precio, moneda) => {
  if (!precio) return 'Consultar';
  return `${moneda === 'UYU' ? '$' : 'U$S'} ${precio.toLocaleString('es-UY')}`;
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
};

const SOURCE_BADGE = {
  'Chatbot Web':   { label: 'Web',       cls: 'bg-blue-900/30 text-blue-300 border-blue-800/50' },
  'web':           { label: 'Web',       cls: 'bg-blue-900/30 text-blue-300 border-blue-800/50' },
  'whatsapp':      { label: 'WhatsApp',  cls: 'bg-green-900/30 text-green-300 border-green-800/50' },
  'instagram':     { label: 'Instagram', cls: 'bg-purple-900/30 text-purple-300 border-purple-800/50' },
};

// ─── TAB: LEADS ─────────────────────────────────────────────────────────────
const TabLeads = ({ leads }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(l =>
      (l.name  || '').toLowerCase().includes(q) ||
      (l.phone || '').toLowerCase().includes(q) ||
      (l.intent|| '').toLowerCase().includes(q) ||
      (l.source|| '').toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="glass-panel overflow-hidden">
      <div className="p-5 border-b border-white/10 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-light">Leads</h2>
          <span className="bg-[#1F1F1F] px-3 py-1 text-xs border border-gray-800 text-[#D4AF37]">{leads.length} total</span>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, tel, fuente..."
            className="w-full bg-[#111] border border-gray-800 text-white text-xs pl-8 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          {leads.length === 0
            ? <><p>No hay leads captados aún.</p><p className="text-xs mt-2">Interactuá con el chatbot para generar clientes.</p></>
            : <p>No hay resultados para "{search}"</p>
          }
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-normal">Cliente</th>
                <th className="p-4 font-normal">Fuente</th>
                <th className="p-4 font-normal">Interés / Consulta</th>
                <th className="p-4 font-normal">Contacto</th>
                <th className="p-4 font-normal">Hace</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.map((lead) => {
                const badge = SOURCE_BADGE[lead.source] || { label: lead.source || '?', cls: 'bg-gray-800 text-gray-400 border-gray-700' };
                const resumen = lead.historial
                  ? lead.historial.split('\n').filter(l => l.trim()).slice(-2).join(' · ')
                  : [lead.intent, lead.type, lead.location].filter(Boolean).join(' · ') || '—';
                return (
                  <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                          <User size={14} />
                        </div>
                        <span className="font-medium">{lead.name || 'Sin nombre'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-xs border rounded-full ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-400 max-w-xs">
                      <span className="line-clamp-2">{resumen}</span>
                      {lead.appraisal === 'Sí, quiero tasación' && (
                        <span className="mt-1 block text-amber-400 font-semibold">★ Solicita tasación</span>
                      )}
                    </td>
                    <td className="p-4">
                      {lead.phone ? (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors text-xs group"
                        >
                          <MessageCircle size={13} />
                          <span>{lead.phone}</span>
                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      ) : (
                        <span className="text-gray-600 text-xs">Sin teléfono</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {timeAgo(lead.created_at || Date.now())}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── PROP CARD (con carrusel de fotos) ──────────────────────────────────────
const PropCard = ({ prop, saving, onEstado, onDestacada }) => {
  const rawImagenes = Array.isArray(prop.imagenes)
    ? prop.imagenes
    : (typeof prop.imagenes === 'string' ? (() => { try { return JSON.parse(prop.imagenes); } catch { return []; } })() : []);
  const allImgs = prop.imagen_principal
    ? [prop.imagen_principal, ...rawImagenes]
    : rawImagenes;
  // Deduplicar normalizando el sufijo de tamaño de MeLi (-F, -I, -O, -D → misma foto)
  const seenKeys = new Set();
  const imgs = allImgs.filter(u => {
    if (!u) return false;
    const key = u.replace(/-[A-Z](?:\.jpg|\.webp)$/i, '').replace(/\?.*$/, '');
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  const [idx, setIdx] = useState(0);
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + imgs.length) % imgs.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % imgs.length); };

  const estadoCfg    = ESTADO_CFG[prop.estado] || { label: prop.estado || '?', cls: 'bg-gray-800 text-gray-400 border-gray-700' };
  const isSaving     = saving === prop.id;
  const isDestSaving = saving === `d-${prop.id}`;

  return (
    <div className={`bg-[#0F0F0F] border flex flex-col overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] ${prop.destacada ? 'border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.05)]' : 'border-white/5'}`}>
      {/* Carrusel de fotos Premium */}
      <div className="relative h-56 bg-gray-900 flex-shrink-0 group">
        {imgs.length > 0 ? (
          <img key={imgs[idx]} src={imgs[idx]} alt="" className="w-full h-full object-cover transition-opacity duration-500"
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-800 bg-[#151515]"><Home size={40} strokeWidth={1} /></div>
        )}

        {/* Gradiente superior para visibilidad de badges */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

        {/* Prev / Next Controls */}
        {imgs.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D4AF37] hover:text-black">‹</button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#D4AF37] hover:text-black">›</button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm">
              {imgs.slice(0, 8).map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-[#D4AF37] scale-125' : 'bg-white/30'}`} />
              ))}
            </div>
            <span className="absolute bottom-3 right-3 text-[9px] font-bold text-white/80 bg-black/50 px-1.5 py-0.5 rounded tracking-tighter uppercase">{idx + 1}/{imgs.length}</span>
          </>
        )}

        {/* Badges de Estado */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border backdrop-blur-md shadow-lg ${estadoCfg.cls}`}>
            {estadoCfg.label}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {prop.destacada && (
            <div className="bg-[#D4AF37] text-black text-[9px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-[#D4AF37]/20 uppercase tracking-wider">
              <Star size={9} fill="currentColor" /> Destacada
            </div>
          )}
          <div className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-wider backdrop-blur-md border ${prop.es_dueno_directo ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50' : 'bg-blue-900/60 text-blue-300 border-blue-700/50'}`}>
            {prop.es_dueno_directo ? '👤 Propietario' : '🏢 Inmobiliaria'}
          </div>
        </div>
      </div>

      {/* Info de Propiedad */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[#D4AF37] font-black text-lg tracking-tight">{formatPrecio(prop.precio, prop.moneda)}</p>
          <div className="flex items-center gap-2 text-[10px] font-bold">
            <span className={`px-2 py-0.5 rounded-md ${prop.tipo_operacion === 'venta' ? 'bg-amber-900/20 text-amber-500' : 'bg-emerald-900/20 text-emerald-500'} uppercase tracking-wider border border-white/5`}>
              {prop.tipo_operacion}
            </span>
          </div>
        </div>
        
        <p className="text-white text-sm font-medium line-clamp-2 mb-3 leading-snug">{prop.titulo}</p>
        
        <div className="mt-auto space-y-2">
          {prop.barrio && (
            <p className="text-gray-400 text-xs flex items-center gap-1.5 font-medium">
              <MapPin size={12} className="text-[#D4AF37]" />
              {prop.barrio}
            </p>
          )}
          
          <div className="flex items-center gap-4 py-2 border-t border-white/5 mt-2">
            {prop.dormitorios != null && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500 font-bold">
                <BedDouble size={12} className="text-gray-600" /> {prop.dormitorios} <span className="font-normal opacity-60">Dorm.</span>
              </span>
            )}
            {prop.banios != null && (
              <span className="flex items-center gap-1 text-[11px] text-gray-500 font-bold">
                <Bath size={12} className="text-gray-600" /> {prop.banios} <span className="font-normal opacity-60">Baños</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contacto + Link original */}
      <div className="px-4 py-2 border-t border-white/5 bg-[#0a0a0a] flex items-center justify-between gap-2">
        {prop.telefono_contacto ? (
          <a
            href={`https://wa.me/${prop.telefono_contacto.replace(/\D/g, '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            <Phone size={11} />
            <span>{prop.telefono_contacto}</span>
          </a>
        ) : (
          <span className="text-[10px] text-gray-700">Sin teléfono</span>
        )}
        {prop.url_original && (
          <a
            href={prop.url_original}
            target="_blank" rel="noopener noreferrer"
            title="Ver anuncio original"
            className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#D4AF37] transition-colors border border-gray-800 hover:border-[#D4AF37]/40 px-2 py-1 rounded"
          >
            <ExternalLink size={10} /> Ver anuncio
          </a>
        )}
      </div>

      {/* Switch de Visibilidad y Controles */}
      <div className="px-4 pb-4 pt-3 flex flex-col gap-3 bg-[#121212]/50 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Portal Web</span>
            <span className={`text-[11px] font-bold ${prop.estado === 'publicada' ? 'text-green-400' : 'text-gray-600'}`}>
              {prop.estado === 'publicada' ? 'Visible en el portal' : 'Oculto'}
            </span>
          </div>
          
          {/* Switch de Visibilidad */}
          <button 
            onClick={() => onEstado(prop, prop.estado === 'publicada' ? 'no_disponible' : 'publicada')}
            disabled={isSaving}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex items-center px-1 ${prop.estado === 'publicada' ? 'bg-green-600' : 'bg-gray-800'} ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${prop.estado === 'publicada' ? 'translate-x-6' : 'translate-x-0'}`}>
              {isSaving && <RefreshCw size={10} className="text-green-600 animate-spin m-0.5" />}
            </div>
          </button>
        </div>

        <div className="flex gap-2">
          <div className="flex-1">
            <select 
              value={prop.estado || 'disponible'} 
              onChange={e => onEstado(prop, e.target.value)}
              disabled={isSaving}
              className="w-full bg-[#080808] border border-white/10 text-gray-300 text-[11px] font-bold py-2 px-3 rounded-lg focus:border-[#D4AF37] focus:outline-none disabled:opacity-50 cursor-pointer appearance-none uppercase tracking-wider"
            >
              {ESTADOS.map(est => <option key={est} value={est}>{ESTADO_CFG[est].label}</option>)}
            </select>
          </div>
          
          <button 
            onClick={() => onDestacada(prop)} 
            disabled={isDestSaving} 
            title={prop.destacada ? 'Quitar destacada' : 'Destacar en el home'}
            className={`w-10 flex items-center justify-center rounded-lg transition-all ${prop.destacada ? 'bg-[#D4AF37] text-black' : 'bg-[#080808] border border-white/10 text-gray-600 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
          >
            {isDestSaving ? <RefreshCw size={12} className="animate-spin" /> : <Star size={14} fill={prop.destacada ? 'currentColor' : 'none'} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: PROPIEDADES ────────────────────────────────────────────────────────
const TabPropiedades = () => {
  const [props, setProps]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(null);
  const [filterEstado, setFilterEstado] = useState('all');
  const [filterDestacadas, setFilterDestacadas] = useState(false);
  const [filterBarrio, setFilterBarrio] = useState('all');
  const [filterDormitorios, setFilterDormitorios] = useState('all');
  const [filterFuente, setFilterFuente] = useState('all');
  const [filterOperacion, setFilterOperacion] = useState('all');
  const [total, setTotal]               = useState(0);
  const [error, setError]               = useState(null);
  const [page, setPage]                 = useState(0);
  const LIMIT = 20;

  const BARRIOS = [
    'Pocitos', 'Carrasco', 'Punta Carretas', 'Punta Gorda', 'Buceo', 'Malvín',
    'Cordón', 'Centro', 'Ciudad Vieja', 'Palermo', 'Aguada', 'La Blanqueada',
    'Tres Cruces', 'Prado', 'Parque Batlle', 'Sayago', 'Unión',
    'Lagomar', 'Solymar', 'El Pinar', 'Shangrilá', 'Canelones',
  ];
  const DORM_OPTS = [
    { label: '1 Dorm.', val: '1' },
    { label: '2 Dorm.', val: '2' },
    { label: '3 Dorm.', val: '3' },
    { label: '4+ Dorm.', val: '4+' },
  ];

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = new URLSearchParams({ crm: 'true', limite: LIMIT, offset: page * LIMIT });
      if (filterEstado !== 'all') p.set('estado', filterEstado);
      else p.set('estado', 'all');
      if (filterDestacadas) p.set('destacadas', 'true');
      if (filterBarrio !== 'all') p.set('barrio', filterBarrio);
      if (filterDormitorios !== 'all') p.set('dormitorios', filterDormitorios);
      if (filterFuente !== 'all') p.set('es_dueno', filterFuente);
      if (filterOperacion !== 'all') p.set('operacion', filterOperacion);
      const r = await fetch(`${API_PROPS}?${p}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      const lista = Array.isArray(d) ? (d[0]?.propiedades || []) : (d.propiedades || []);
      const tot   = Array.isArray(d) ? (d[0]?.total || 0)       : (d.total || 0);
      setProps(lista);
      setTotal(tot);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filterEstado, filterDestacadas, filterBarrio, filterDormitorios, filterFuente, filterOperacion]);

  const cambiarEstado = async (prop, nuevoEstado) => {
    setSaving(prop.id);
    try {
      await fetch(CRM_ESTADO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prop.id, estado: nuevoEstado })
      });
      setProps(prev => prev.map(p => p.id === prop.id ? { ...p, estado: nuevoEstado } : p));
    } finally {
      setSaving(null);
    }
  };

  const toggleDestacada = async (prop) => {
    setSaving(`d-${prop.id}`);
    try {
      await fetch(CRM_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prop.id, destacada: !prop.destacada })
      });
      setProps(prev => prev.map(p => p.id === prop.id ? { ...p, destacada: !p.destacada } : p));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      {/* Filtros de Estado */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <button
          onClick={() => { setFilterEstado('all'); setPage(0); }}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all ${filterEstado === 'all' ? 'bg-[#D4AF37] text-black font-black' : 'bg-[#1A1A1A] text-gray-500 border border-gray-800 hover:text-white'}`}
        >
          Todas {filterEstado === 'all' && total > 0 ? `(${total})` : ''}
        </button>
        {ESTADOS.map(est => {
          const cfg = ESTADO_CFG[est];
          const isActive = filterEstado === est;
          return (
            <button key={est}
              onClick={() => { setFilterEstado(est); setPage(0); }}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all border ${isActive ? cfg.cls + ' font-black' : 'bg-[#1A1A1A] border-gray-800 text-gray-500 hover:text-white'}`}
            >
              {cfg.label}{isActive && total > 0 ? ` (${total})` : ''}
            </button>
          );
        })}
        <button onClick={() => { setFilterDestacadas(!filterDestacadas); setPage(0); }}
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider flex items-center gap-1 border transition-all ${filterDestacadas ? 'bg-[#D4AF37] text-black border-transparent font-black' : 'bg-[#1A1A1A] border-gray-800 text-gray-500 hover:text-white'}`}
        >
          <Star size={10} fill={filterDestacadas ? 'currentColor' : 'none'} /> Destacadas
        </button>
        <button onClick={() => load()} className="ml-auto text-gray-600 hover:text-primary transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filtros Secundarios */}
      <div className="flex flex-wrap gap-3 mb-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-gray-800 px-3 py-1 rounded-lg">
          <MapPin size={12} className="text-gray-500" />
          <select
            value={filterBarrio}
            onChange={e => { setFilterBarrio(e.target.value); setPage(0); }}
            className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Cualquier Barrio</option>
            {BARRIOS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-gray-800 px-3 py-1 rounded-lg">
          <BedDouble size={12} className="text-gray-500" />
          <select
            value={filterDormitorios}
            onChange={e => { setFilterDormitorios(e.target.value); setPage(0); }}
            className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Dormitorios</option>
            {DORM_OPTS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-gray-800 px-3 py-1 rounded-lg">
          <Users size={12} className="text-gray-500" />
          <select
            value={filterFuente}
            onChange={e => { setFilterFuente(e.target.value); setPage(0); }}
            className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Propietario / Inmo</option>
            <option value="true">Solo Propietarios</option>
            <option value="false">Solo Inmobiliarias</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-[#1A1A1A] border border-gray-800 px-3 py-1 rounded-lg">
          <TrendingUp size={12} className="text-gray-500" />
          <select
            value={filterOperacion}
            onChange={e => { setFilterOperacion(e.target.value); setPage(0); }}
            className="bg-transparent text-xs text-gray-300 focus:outline-none cursor-pointer"
          >
            <option value="all">Venta / Alquiler</option>
            <option value="venta">Solo Venta</option>
            <option value="alquiler">Solo Alquiler</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando propiedades...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-400">
          <p>Error al cargar propiedades: {error}</p>
          <button onClick={load} className="mt-3 text-xs text-gray-400 hover:text-white underline">Reintentar</button>
        </div>
      ) : props.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No hay propiedades con este estado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {props.map(prop => (
            <PropCard key={prop.id} prop={prop} saving={saving}
              onEstado={cambiarEstado} onDestacada={toggleDestacada} />
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-6">
        <span className="text-gray-600 text-xs">
          {total} propiedad{total !== 1 ? 'es' : ''}{filterEstado !== 'all' ? ` · ${ESTADO_CFG[filterEstado]?.label}` : ''}
        </span>
        <div className="flex gap-3">
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
            className="px-4 py-2 border border-gray-800 text-sm text-gray-500 hover:text-white disabled:opacity-30">← Anterior</button>
          <span className="px-4 py-2 text-gray-500 text-sm">Pág. {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * LIMIT >= total}
            className="px-4 py-2 border border-gray-800 text-sm text-gray-500 hover:text-white disabled:opacity-30">Siguiente →</button>
        </div>
      </div>
    </div>
  );
};

// ─── TAB: ESTADÍSTICAS ───────────────────────────────────────────────────────
const TabStats = ({ leads }) => {
  const today = new Date().toDateString();
  const leadsHoy    = leads.filter(l => new Date(l.created_at || 0).toDateString() === today).length;
  const leadsWA     = leads.filter(l => (l.source || '').toLowerCase().includes('whatsapp')).length;
  const leadsWeb    = leads.filter(l => !l.source || l.source.toLowerCase().includes('web') || l.source.toLowerCase().includes('chatbot')).length;
  const conTelefono = leads.filter(l => l.phone).length;
  const tasaciones  = leads.filter(l => l.appraisal === 'Sí, quiero tasación').length;

  const stats = [
    { label: 'Total leads', value: leads.length, icon: <Users size={20} />, color: '#D4AF37' },
    { label: 'Leads hoy', value: leadsHoy, icon: <TrendingUp size={20} />, color: '#34d399' },
    { label: 'Vía WhatsApp', value: leadsWA, icon: <MessageCircle size={20} />, color: '#4ade80' },
    { label: 'Vía Web', value: leadsWeb, icon: <BarChart2 size={20} />, color: '#60a5fa' },
    { label: 'Con teléfono', value: conTelefono, icon: <Phone size={20} />, color: '#a78bfa' },
    { label: 'Piden tasación', value: tasaciones, icon: <Star size={20} />, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="glass-panel p-5 flex items-center gap-4">
            <div style={{ color: s.color }}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {leads.length > 0 && (
        <div className="glass-panel p-5">
          <h3 className="text-sm text-gray-400 uppercase tracking-widest mb-4">Últimos 5 leads</h3>
          <div className="space-y-2">
            {leads.slice(0, 5).map(l => (
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-white">{l.name || l.phone || 'Anónimo'}</span>
                <span className="text-xs text-gray-500">{timeAgo(l.created_at || Date.now())}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── CRM PRINCIPAL ───────────────────────────────────────────────────────────
const CRM = () => {
  const { leads } = useCRM();
  const [tab, setTab] = useState('leads');
  const navigate = useNavigate();

  const handleLogout = async () => {
    sessionStorage.removeItem('auth_token');
    navigate('/login');
  };

  const TABS = [
    { id: 'leads',       label: 'Leads',         icon: <User size={14} />,     count: leads.length },
    { id: 'propiedades', label: 'Propiedades',    icon: <Home size={14} />,     count: null },
    { id: 'stats',       label: 'Estadísticas',   icon: <BarChart2 size={14} />, count: null },
  ];

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white pt-24 px-4 md:px-10 pb-16">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-header text-[#D4AF37]">CRM — Destino Abril</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de gestión interno</p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm mt-1">
          <LogOut size={14} /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-8">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-widest transition-all ${tab === t.id ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-px' : 'text-gray-500 hover:text-white'}`}>
            {t.icon}
            {t.label}
            {t.count !== null && <span className="text-xs opacity-60">({t.count})</span>}
          </button>
        ))}
      </div>

      {tab === 'leads'       && <TabLeads leads={leads} />}
      {tab === 'propiedades' && <TabPropiedades />}
      {tab === 'stats'       && <TabStats leads={leads} />}
    </div>
  );
};

export default CRM;
