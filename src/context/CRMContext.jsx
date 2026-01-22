import React, { createContext, useState, useEffect, useContext } from 'react';

const CRMContext = createContext();

export const useCRM = () => useContext(CRMContext);

import { supabase } from '../supabaseClient';

export const CRMProvider = ({ children }) => {
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        const fetchLeads = async () => {
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data) setLeads(data);
        };

        // Initial fetch
        fetchLeads();

        // Realtime subscription (Optional, but nice to have)
        const channel = supabase
            .channel('leads_updates')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
                setLeads((prev) => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const addLead = async (lead) => {
        // Optimistic update
        const tempId = Date.now();
        const displayLead = { ...lead, id: tempId, created_at: new Date().toISOString() }; // UI needs created_at/date
        setLeads((prev) => [displayLead, ...prev]);

        // Database Insert
        const { error } = await supabase
            .from('leads')
            .insert([{
                name: lead.name,
                intent: lead.intent,
                phone: lead.phone,
                source: lead.source,
                type: lead.type,
                location: lead.location,
                specs: lead.specs,
                garage: lead.garage,
                appraisal: lead.appraisal
            }]);

        if (error) {
            console.error("Error saving lead:", error);
            // Optionally rollback here
        }
    };

    const [properties] = useState([
        { id: 1, title: 'Penthouse en Punta del Este', price: 'USD 850,000', type: 'Venta', status: 'Disponible' },
        { id: 2, title: 'Casa en Carrasco', price: 'USD 4,500/mes', type: 'Alquiler', status: 'Disponible' },
        { id: 3, title: 'Apartamento en Pocitos', price: 'USD 220,000', type: 'Venta', status: 'Reservado' },
    ]);

    return (
        <CRMContext.Provider value={{ leads, addLead, properties }}>
            {children}
        </CRMContext.Provider>
    );
};
