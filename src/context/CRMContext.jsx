import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const CRMContext = createContext();
export const useCRM = () => useContext(CRMContext);

const N8N_LEAD = 'https://n8n.automatizameuy.com/webhook/destino-abril-lead';

export const CRMProvider = ({ children }) => {
  const [leads, setLeads]               = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);

  // Cargar leads desde Supabase
  useEffect(() => {
    const fetchLeads = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setLeads(data);
    };
    fetchLeads();

    // Realtime: nuevos leads en vivo
    const channel = supabase
      .channel('leads_updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        setLeads(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Propiedades destacadas para la landing — solo publicadas
  const fetchFeatured = () => {
    fetch(`https://n8n.automatizameuy.com/webhook/propiedades?estado=publicada&destacadas=true&limite=9`, { cache: 'no-cache' })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? (data[0]?.propiedades || []) : (data.propiedades || []);
        // Si no hay destacadas, mostrar todas las publicadas
        if (list.length) {
          setFeaturedProperties(list);
        } else {
          return fetch(`https://n8n.automatizameuy.com/webhook/propiedades?estado=publicada&limite=9`, { cache: 'no-cache' })
            .then(r => r.json())
            .then(d => {
              const l = Array.isArray(d) ? (d[0]?.propiedades || []) : (d.propiedades || []);
              if (l.length) setFeaturedProperties(l);
            });
        }
      })
      .catch(() => {});
  };

  useEffect(() => { fetchFeatured(); }, []);

  const addLead = async (lead) => {
    // Normalizar: soporta formato nuevo (phone + historial) y viejo (name, intent, specs...)
    const payload = {
      name:      lead.name     || null,
      phone:     lead.phone    || null,
      source:    lead.source   || 'Chatbot Web',
      intent:    lead.intent   || null,
      type:      lead.type     || null,
      location:  lead.location || null,
      specs:     lead.specs    || null,
      appraisal: lead.appraisal|| null,
      historial: lead.historial|| null,
    };

    // Optimistic UI
    setLeads(prev => [{ ...payload, id: Date.now(), created_at: new Date().toISOString() }, ...prev]);

    // Notificar a n8n (guarda en DB + Telegram)
    fetch(N8N_LEAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});

    // Backup en Supabase
    supabase.from('leads').insert([payload]).catch(() => {});
  };

  return (
    <CRMContext.Provider value={{ leads, addLead, featuredProperties, refreshFeatured: fetchFeatured }}>
      {children}
    </CRMContext.Provider>
  );
};
