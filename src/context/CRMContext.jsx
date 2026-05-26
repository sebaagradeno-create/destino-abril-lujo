import React, { createContext, useState, useEffect, useContext } from 'react';

const CRMContext = createContext();
export const useCRM = () => useContext(CRMContext);

const N8N_LEAD     = 'https://n8n.automatizameuy.com/webhook/destino-abril-lead';
const N8N_LEADS    = 'https://n8n.automatizameuy.com/webhook/crm-leads-destino-abril';
const N8N_PROPS    = 'https://n8n.automatizameuy.com/webhook/propiedades';

export const CRMProvider = ({ children }) => {
  const [leads, setLeads]                       = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);

  // Cargar leads desde PostgreSQL vía n8n
  useEffect(() => {
    fetch(N8N_LEADS, { cache: 'no-cache' })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.leads || []);
        if (list.length) setLeads(list);
      })
      .catch(() => {});
  }, []);

  // Propiedades destacadas para la landing
  const fetchFeatured = () => {
    fetch(`${N8N_PROPS}?estado=publicada&destacadas=true&limite=9`, { cache: 'no-cache' })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? (data[0]?.propiedades || []) : (data.propiedades || []);
        if (list.length) {
          setFeaturedProperties(list);
        } else {
          return fetch(`${N8N_PROPS}?estado=publicada&limite=9`, { cache: 'no-cache' })
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
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  return (
    <CRMContext.Provider value={{ leads, addLead, featuredProperties, refreshFeatured: fetchFeatured }}>
      {children}
    </CRMContext.Provider>
  );
};
