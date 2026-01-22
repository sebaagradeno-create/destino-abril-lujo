export const knowledgeBase = {
    keywords: {
        garantias: ['garantia', 'garantías', 'anda', 'cgn', 'contaduría', 'aseguradora', 'porto', 'sura', 'fideciu'],
        contratos: ['contrato', 'plazo', 'ley', 'alquileres', 'contrato de alquiler'],
        tasacion: ['tasacion', 'tasar', 'valor', 'cuanto vale'],
        proyectos: ['proyecto', 'pozo', 'inversion', 'wos', 'edificio'],
    },
    responses: {
        garantias: "Trabajamos con las principales garantías del mercado para su tranquilidad: ANDA, Contaduría General de la Nación (CGN), y Aseguradoras (Porto Seguro, Sura, Mapfre). También evaluamos otras opciones según la propiedad.",
        contratos: "Nuestros contratos de alquiler se rigen por la Ley vigente, generalmente con plazos de 2 años, pero podemos negociar condiciones especiales según el caso y las necesidades de ambas partes.",
        tasacion: "Realizamos tasaciones profesionales basadas en el mercado actual. Si desea, puedo agendar una visita para valorar su propiedad sin compromiso.",
        proyectos: "Contamos con exclusivos proyectos de inversión 'en pozo' con alta rentabilidad en las zonas de mayor crecimiento. ¿Le interesa recibir nuestro portafolio de inversiones?",
        default: "Entiendo. Un asesor especializado podrá darle más detalles sobre eso. ¿Desea que lo contactemos?"
    }
};

export const checkKnowledge = (input) => {
    const lowerInput = input.toLowerCase();
    for (const [topic, keywords] of Object.entries(knowledgeBase.keywords)) {
        if (keywords.some(k => lowerInput.includes(k))) {
            return knowledgeBase.responses[topic];
        }
    }
    return null;
};
