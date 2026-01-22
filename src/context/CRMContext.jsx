import React, { createContext, useState, useEffect, useContext } from 'react';

const CRMContext = createContext();

export const useCRM = () => useContext(CRMContext);

export const CRMProvider = ({ children }) => {
    const [leads, setLeads] = useState(() => {
        const saved = localStorage.getItem('destino_abril_leads');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('destino_abril_leads', JSON.stringify(leads));
    }, [leads]);

    const addLead = (lead) => {
        const newLead = { ...lead, id: Date.now(), date: new Date().toLocaleString() };
        setLeads((prev) => [newLead, ...prev]);
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
