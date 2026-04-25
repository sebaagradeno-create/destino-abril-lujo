import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { User, Phone, Star, Home, BedDouble, Bath, MapPin, LogOut, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const API = 'https://n8n.automatizameuy.com/webhook/propiedades';
const N8N_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmN2Q4MjA4YS1jMDFlLTQwZDctODVlYS1lMTI4NjQ3NGM5OTgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZGFkMTJmMmQtNTk5NC00OTc5LWIzM2QtMWY2NTFhMTdhYTJiIiwiaWF0IjoxNzc2Mjc4MDA5fQ.FBPcUUMZUZyEC0zPRXLBC2m_RojBbRVAsK1wGzYdKFQ';

const formatPrecio = (precio, moneda) => {
  if (!precio) return 'Consultar';
  return `${moneda === 'UYU' ? '$' : 'U$S'} ${precio.toLocaleString('es-UY')}`;
};

const TabLeads = ({ leads }) => (
  <div className="glass-panel overflow-hidden">
    <div className="p-6 border-b border-white/10 flex justify-between items-center">
      <h2 className="text-lg font-light">Leads Recientes</h2>
      <span className="bg-[#1F1F1F] px-3 py-1 text-xs border border-gray-800 text-[#D4AF37]">{leads.length} leads</span>
    </div>
    {leads.length === 0 ? (
      <div className="p-12 text-center text-gray-500">
        <p>No hay leads captados aún.</p>
        <p className="text-sm mt-2">Interactúe con el chatbot para generar clientes potenciales.</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
              <th className="p-4 font-normal">Cliente</th>
              <th className="p-4 font-normal">Interés</th>
              <th className="p-4 font-normal">Detalles</th>
              <th className="p-4 font-normal">Contacto</th>
              <th className="p-4 font-normal">Fecha</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37]">
                      <User size={14} />
                    </div>
                    <span className="font-bold">{lead.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-900/50 text-xs">{lead.intent}</span>
                </td>
                <td className="p-4 text-xs text-gray-400">
                  {lead.type ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-gray-200 font-bold">{lead.type}</span>
                      <span>{lead.location}</span>
                      <span>{lead.specs}</span>
                      {lead.appraisal === 'Sí, quiero tasación' && <span className="text-red-400 font-bold">Solicita Tasación</span>}
                    </div>
                  ) : <span className="opacity-50">-</span>}
                </td>
                <td className="p-4 text-gray-300">
                  <div className="flex items-center gap-2"><Phone size={14} className="text-gray-500" /> {lead.phone}</div>
                </td>
                <td className="p-4 text-gray-400 font-mono text-xs">
                  {new Date(lead.created_at || Date.now()).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const TabPropiedades = () => {
  const [props, setProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [filterDestacadas, setFilterDestacadas] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limite: LIMIT, offset: page * LIMIT });
      if (filterDestacadas) p.set('destacadas', 'true');
      const r = await fetch(`${API}?${p}`);
      const d = await r.json();
      setProps(d.propiedades || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, filterDestacadas]);

  const toggleDestacada = async (prop) => {
    setSaving(prop.id);
    try {
      await fetch(`https://n8n.automatizameuy.com/api/v1/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-N8N-API-KEY': N8N_KEY }
      });
      // Call Postgres via n8n webhook (workaround)
      await fetch('https://n8n.automatizameuy.com/webhook/crm-update-propiedad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prop.id, destacada: !prop.destacada })
      }).catch(() => {});
      setProps(prev => prev.map(p => p.id === prop.id ? { ...p, destacada: !p.destacada } : p));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={() => { setFilterDestacadas(false); setPage(0); }} className={`px-4 py-2 text-sm transition-all ${!filterDestacadas ? 'bg-[#D4AF37] text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}>Todas</button>
          <button onClick={() => { setFilterDestacadas(true); setPage(0); }} className={`px-4 py-2 text-sm flex items-center gap-1 transition-all ${filterDestacadas ? 'bg-[#D4AF37] text-black' : 'border border-gray-700 text-gray-400 hover:text-white'}`}><Star size={12}/> Destacadas</button>
        </div>
        <button onClick={load} className="text-gray-500 hover:text-white"><RefreshCw size={16} /></button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando propiedades...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {props.map(prop => (
            <div key={prop.id} className={`bg-[#111] border p-4 flex flex-col gap-3 ${prop.destacada ? 'border-[#D4AF37]/40' : 'border-gray-800'}`}>
              {prop.imagen_principal && (
                <img src={prop.imagen_principal} alt="" className="w-full h-36 object-cover" onError={e => e.target.style.display='none'} />
              )}
              <div className="flex-1">
                <p className="text-[#D4AF37] font-bold text-sm mb-1">{formatPrecio(prop.precio, prop.moneda)}</p>
                <p className="text-white text-xs line-clamp-2 mb-1">{prop.titulo}</p>
                {prop.barrio && <p className="text-gray-500 text-xs flex items-center gap-1"><MapPin size={9}/>{prop.barrio}</p>}
                <div className="flex gap-2 mt-1 text-gray-600 text-xs">
                  {prop.dormitorios != null && <span className="flex items-center gap-0.5"><BedDouble size={9}/>{prop.dormitorios}</span>}
                  {prop.banios != null && <span className="flex items-center gap-0.5"><Bath size={9}/>{prop.banios}</span>}
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                <span className={`text-xs px-2 py-0.5 ${prop.tipo_operacion === 'venta' ? 'bg-amber-600/20 text-amber-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
                  {prop.tipo_operacion}
                </span>
                <button
                  onClick={() => toggleDestacada(prop)}
                  disabled={saving === prop.id}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs transition-all ${prop.destacada ? 'bg-[#D4AF37] text-black' : 'border border-gray-700 text-gray-400 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
                >
                  <Star size={11} fill={prop.destacada ? 'currentColor' : 'none'} />
                  {saving === prop.id ? '...' : prop.destacada ? 'Destacada' : 'Destacar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-3 mt-6">
        <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0} className="px-4 py-2 border border-gray-800 text-sm text-gray-500 hover:text-white disabled:opacity-30">← Anterior</button>
        <span className="px-4 py-2 text-gray-500 text-sm">Pág. {page+1}</span>
        <button onClick={() => setPage(p => p+1)} disabled={props.length < LIMIT} className="px-4 py-2 border border-gray-800 text-sm text-gray-500 hover:text-white disabled:opacity-30">Siguiente →</button>
      </div>
    </div>
  );
};

const CRM = () => {
  const { leads } = useCRM();
  const [tab, setTab] = useState('leads');
  const navigate = useNavigate();

  const handleLogout = async () => {
    sessionStorage.removeItem('auth_token');
    await supabase.auth.signOut().catch(() => {});
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white pt-24 px-6 md:px-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-header text-[#D4AF37]">CRM — Destino Abril</h1>
          <p className="text-gray-500 text-sm mt-1">Panel de gestión</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 hover:text-red-400 transition-colors text-sm">
          <LogOut size={14} /> Salir
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-8">
        <button onClick={() => setTab('leads')} className={`flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-widest transition-all ${tab === 'leads' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-px' : 'text-gray-500 hover:text-white'}`}>
          <User size={14} /> Leads ({leads.length})
        </button>
        <button onClick={() => setTab('propiedades')} className={`flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-widest transition-all ${tab === 'propiedades' ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] -mb-px' : 'text-gray-500 hover:text-white'}`}>
          <Home size={14} /> Propiedades
        </button>
      </div>

      {tab === 'leads' && <TabLeads leads={leads} />}
      {tab === 'propiedades' && <TabPropiedades />}
    </div>
  );
};

export default CRM;
