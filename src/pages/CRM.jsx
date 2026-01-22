import React from 'react';
import { useCRM } from '../context/CRMContext.jsx';
import { User, Phone, MessageSquare, Calendar } from 'lucide-react';

const CRM = () => {
    const { leads } = useCRM();

    return (
        <div className="min-h-screen bg-[#0C0C0C] text-white pt-24 px-6 md:px-12">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-header text-[#D4AF37]">Gestión de Leads</h1>
                <div className="bg-[#1F1F1F] px-4 py-2 rounded border border-gray-800 text-sm">
                    Total: <span className="font-bold text-[#D4AF37]">{leads.length}</span>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-lg font-light">Leads Recientes</h2>
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
                                    <th className="p-4 font-normal">Estado/Interés</th>
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
                                            <span className="px-2 py-1 rounded-full bg-blue-900/30 text-blue-400 border border-blue-900/50 text-xs">
                                                {lead.intent}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-500" /> {lead.phone}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-400 font-mono text-xs">
                                            {lead.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CRM;
