// CLIENT SIDE SERVICE (Zero-Dependency Version)

const API_KEY = "AIzaSyClTbbC3T5o8ZzDEc2TohSzL0wdvQDpaoA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const KNOWLEDGE_BASE = `
EMPRESA: Inmobiliaria Destino Abril.
SERVICIOS: Venta, Alquiler, Tasaciones.
UBICACIÓN: Montevideo, Uruguay.
GARANTÍAS: Aceptamos ANDA, Contaduría (CGN), Porto Seguro, Sura.
`;

// Direct Browser Fetch to Google (The "Parachute")
const getDirectFromGoogle = async (message, step, context) => {
    console.log("🪂 Using Direct Google API Fallback");
    try {
        const systemPrompt = `
        ACT AS: "Abril", chatbot inmobiliario.
        KNOWLEDGE: ${KNOWLEDGE_BASE}
        CONTEXT: Step "${step}" (${context}). User said: "${message}".
        
        GOAL: Classify and Respond. RETURN JSON ONLY.
        Format: { "classification": "VALID_DATA"|"QUESTION"|"IRRELEVANT", "reply": "...", "extracted_data": "..." }
        
        RULES:
        - VALID_DATA: Direct answer to the current step.
        - QUESTION: User asks something. Answer in 'reply'.
        - IRRELEVANT: Nonsense/Greeting. Polite reply.
        `;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(aiText);

    } catch (e) {
        console.error("Direct API Fail:", e);
        return {
            classification: "QUESTION",
            reply: "Mis disculpas, parece que hay inestabilidad en la red. ¿Podría repetirlo?",
            extracted_data: null
        };
    }
};

export const getAIResponse = async (userMessage, stepName, stepContext) => {
    try {
        // 1. Try Serverless Function (Primary)
        // Short timeout (3s) to fallback quickly
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, step: stepName, context: stepContext }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server unreachable");
        return await response.json();

    } catch (error) {
        // 2. Fallback to Direct Google API
        return await getDirectFromGoogle(userMessage, stepName, stepContext);
    }
};
