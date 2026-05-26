const N8N_CHATBOT = 'https://n8n.automatizameuy.com/webhook/chatbot-destino-abril';

export const getChatbotResponse = async (mensaje, historial = '') => {
  try {
    const res = await fetch(N8N_CHATBOT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensaje, historial, canal: 'web' })
    });
    if (!res.ok) throw new Error('n8n unreachable');
    return await res.json(); // { respuesta, agente, propiedades_encontradas }
  } catch {
    return {
      respuesta: 'Disculpá, estoy teniendo un problema técnico. ¿Podés repetir tu consulta?',
      agente: 'April',
      propiedades_encontradas: 0
    };
  }
};
