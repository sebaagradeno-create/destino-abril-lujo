import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, BedDouble, Bath, Maximize2, MapPin, ArrowLeft, ChevronLeft, ChevronRight, Star, User, X, Images } from 'lucide-react';

const API = 'https://n8n.automatizameuy.com/webhook/propiedades';

const TIPOS_PROPIEDAD = ['Apartamento', 'Casa', 'PH', 'Local', 'Oficina', 'Terreno', 'Chacra'];

const formatPrecio = (precio, moneda) => {
  if (!precio) return 'Consultar';
  const sym = moneda === 'UYU' ? '$' : 'U$S';
  return `${sym} ${precio.toLocaleString('es-UY')}`;
};

const CardPropiedad = ({ prop }) => {
  const imagenes = prop.imagen_principal
    ? [prop.imagen_principal, ...(prop.imagenes || []).filter(i => i !== prop.imagen_principal)]
    : (prop.imagenes || []);
  const [imgIdx, setImgIdx] = useState(0);

  const prev = e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length); };
  const next = e => { e.preventDefault(); e.stopPropagation(); setImgIdx(i => (i + 1) % imagenes.length); };

  return (
    <Link to={`/propiedad/${prop.id}`} className="group bg-[#0C0C0C] border border-gray-900 hover:border-[#D4AF37]/40 transition-all duration-300 flex flex-col cursor-pointer">
      {/* Carrusel de imagen */}
      <div className="relative h-52 overflow-hidden bg-gray-900 flex-shrink-0">
        {imagenes.length > 0 ? (
          <img
            src={imagenes[imgIdx]}
            alt={prop.titulo}
            onError={e => { e.target.style.display='none'; }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
            <span className="text-gray-600 text-4xl">🏠</span>
          </div>
        )}
        {/* Navegación carrusel */}
        {imagenes.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37]">
              <ChevronLeft size={14} />
            </button>
            <button onClick={next} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#D4AF37]">
              <ChevronRight size={14} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {imagenes.slice(0, 6).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-[#D4AF37]' : 'bg-white/40'}`} />
              ))}
            </div>
            <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1">
              <Images size={9} /> {imagenes.length}
            </div>
          </>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className={`px-2 py-0.5 text-xs uppercase tracking-wider font-bold ${prop.tipo_operacion === 'venta' ? 'bg-amber-600 text-black' : 'bg-emerald-700 text-white'}`}>
            {prop.tipo_operacion}
          </span>
          {prop.destacada && (
            <span className="px-2 py-0.5 text-xs bg-[#D4AF37] text-black uppercase tracking-wider font-bold flex items-center gap-1">
              <Star size={10} fill="black" /> Destacada
            </span>
          )}
        </div>
        {prop.es_dueno_directo && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-0.5 text-xs bg-orange-500 text-white uppercase tracking-wider font-bold flex items-center gap-1">
              <User size={10} /> Dueño
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <p className="text-[#D4AF37] font-bold text-lg leading-tight">{formatPrecio(prop.precio, prop.moneda)}</p>
          {prop.precio_expensas && (
            <p className="text-gray-500 text-xs">+ $ {prop.precio_expensas.toLocaleString()} exp.</p>
          )}
        </div>

        <h3 className="text-white text-sm font-medium mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
          {prop.titulo || 'Propiedad sin título'}
        </h3>

        {prop.barrio && (
          <p className="text-gray-500 text-xs flex items-center gap-1 mb-3">
            <MapPin size={11} /> {prop.barrio}{prop.ciudad ? `, ${prop.ciudad}` : ''}
          </p>
        )}

        {/* Stats */}
        <div className="flex gap-3 mt-auto pt-3 border-t border-gray-800 text-gray-400 text-xs">
          {prop.dormitorios != null && (
            <span className="flex items-center gap-1"><BedDouble size={12} /> {prop.dormitorios} dorm.</span>
          )}
          {prop.banios != null && (
            <span className="flex items-center gap-1"><Bath size={12} /> {prop.banios} baño{prop.banios !== 1 ? 's' : ''}</span>
          )}
          {prop.superficie_total && (
            <span className="flex items-center gap-1"><Maximize2 size={12} /> {prop.superficie_total} m²</span>
          )}
        </div>

        {/* Amenities */}
        {(prop.garaje || prop.piscina || prop.parrillero) && (
          <div className="flex gap-2 mt-2">
            {prop.garaje && <span className="text-[10px] text-gray-500 border border-gray-800 px-1.5 py-0.5">Garage</span>}
            {prop.piscina && <span className="text-[10px] text-gray-500 border border-gray-800 px-1.5 py-0.5">Piscina</span>}
            {prop.parrillero && <span className="text-[10px] text-gray-500 border border-gray-800 px-1.5 py-0.5">Parrillero</span>}
          </div>
        )}

        <div className="mt-3 text-xs text-[#D4AF37]/60 group-hover:text-[#D4AF37] transition-colors text-right">
          Ver detalle →
        </div>
      </div>
    </Link>
  );
};

export default function Propiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  const [filters, setFilters] = useState({
    tipo: '',
    tipo_prop: '',
    barrio: '',
    precio_min: '',
    precio_max: '',
    dorm: '',
    destacadas: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchBarrio, setSearchBarrio] = useState('');

  const fetchPropiedades = useCallback(async (f, offset) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.tipo) params.set('tipo', f.tipo);
      if (f.tipo_prop) params.set('tipo_prop', f.tipo_prop);
      if (f.barrio) params.set('barrio', f.barrio);
      if (f.precio_min) params.set('precio_min', f.precio_min);
      if (f.precio_max) params.set('precio_max', f.precio_max);
      if (f.dorm) params.set('dorm', f.dorm);
      if (f.destacadas) params.set('destacadas', 'true');
      params.set('limite', LIMIT);
      params.set('offset', offset);

      const res = await fetch(`${API}?${params}`);
      const data = await res.json();
      setPropiedades(data.propiedades || []);
      setTotal(data.total || 0);
    } catch {
      setPropiedades([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPropiedades(filters, page * LIMIT);
  }, [filters, page, fetchPropiedades]);

  const applyFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({ tipo: '', tipo_prop: '', barrio: '', precio_min: '', precio_max: '', dorm: '', destacadas: false });
    setSearchBarrio('');
    setPage(0);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== false);
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-gray-900 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="text-gray-500 hover:text-[#D4AF37] text-sm flex items-center gap-1 mb-6 transition-colors w-fit">
            <ArrowLeft size={14} /> Inicio
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-amber-500 tracking-[0.3em] uppercase text-xs">Listado completo</span>
              <h1 className="text-3xl md:text-4xl font-header mt-2">Propiedades</h1>
              <div className="h-0.5 w-12 bg-[#D4AF37] mt-3"></div>
            </div>
            <p className="text-gray-500 text-sm">{total} propiedad{total !== 1 ? 'es' : ''} encontrada{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs tipo operacion */}
        <div className="flex gap-1 mb-6 border-b border-gray-900">
          {[['', 'Todas'], ['alquiler', 'Alquiler'], ['venta', 'Venta']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => applyFilter('tipo', val)}
              className={`px-5 py-2.5 text-sm uppercase tracking-widest transition-all ${filters.tipo === val ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-px' : 'text-gray-500 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`ml-auto flex items-center gap-2 px-4 py-2 text-sm transition-all ${showFilters ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-white'}`}
          >
            <SlidersHorizontal size={15} /> Filtros
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-[#0C0C0C] border border-gray-800 p-5 mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Tipo propiedad */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Tipo</label>
              <select
                value={filters.tipo_prop}
                onChange={e => applyFilter('tipo_prop', e.target.value)}
                className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">Todos</option>
                {TIPOS_PROPIEDAD.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Barrio */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Barrio / Zona</label>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                <input
                  type="text"
                  value={searchBarrio}
                  onChange={e => { setSearchBarrio(e.target.value); applyFilter('barrio', e.target.value); }}
                  placeholder="Ej: Pocitos"
                  className="w-full bg-[#111] border border-gray-800 text-white text-sm pl-8 pr-3 py-2 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
                />
              </div>
            </div>

            {/* Precio min */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Precio mín (USD)</label>
              <input
                type="number"
                value={filters.precio_min}
                onChange={e => applyFilter('precio_min', e.target.value)}
                placeholder="0"
                className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
              />
            </div>

            {/* Precio max */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Precio máx (USD)</label>
              <input
                type="number"
                value={filters.precio_max}
                onChange={e => applyFilter('precio_max', e.target.value)}
                placeholder="Sin límite"
                className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2 focus:border-[#D4AF37] focus:outline-none placeholder-gray-700"
              />
            </div>

            {/* Dormitorios */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Dorm. mín.</label>
              <select
                value={filters.dorm}
                onChange={e => applyFilter('dorm', e.target.value)}
                className="w-full bg-[#111] border border-gray-800 text-white text-sm px-3 py-2 focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="">Todos</option>
                {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>

            {/* Footer filtros */}
            <div className="md:col-span-3 lg:col-span-5 flex items-center justify-between pt-2 border-t border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white">
                <input
                  type="checkbox"
                  checked={filters.destacadas}
                  onChange={e => applyFilter('destacadas', e.target.checked)}
                  className="accent-[#D4AF37]"
                />
                Solo destacadas
              </label>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
                  <X size={12} /> Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#0C0C0C] border border-gray-900 h-72 animate-pulse">
                <div className="h-52 bg-gray-900"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-800 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : propiedades.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-500 text-4xl mb-4">🏠</p>
            <p className="text-gray-400">No se encontraron propiedades con esos filtros.</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-[#D4AF37] text-sm hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {propiedades.map(prop => (
              <CardPropiedad key={prop.id} prop={prop} />
            ))}
          </div>
        )}

        {/* Paginacion */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-2 border border-gray-800 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-gray-500 text-sm">
              Página <span className="text-white">{page + 1}</span> de <span className="text-white">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-2 border border-gray-800 text-gray-500 hover:border-[#D4AF37] hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
