// NETLIFY SERVERLESS FUNCTION (Zero-Dependency Version)
// Uses native 'fetch' which is available in Node 18+ (Netlify standard)

const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyClTbbC3T5o8ZzDEc2TohSzL0wdvQDpaoA";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const KNOWLEDGE_BASE = `
EMPRESA: Inmobiliaria Destino Abril.
SERVICIOS: Venta, Alquiler, Tasaciones.
UBICACIÓN: Montevideo, Uruguay.
GARANTÍAS: Aceptamos ANDA, Contaduría (CGN), Porto Seguro, Sura.
CONTRATOS: Generalmente 2 años.
COMISIÓN: 1 mes + IVA (alquileres) o 3% + IVA (ventas).
CONTACTO: El objetivo es conseguir el WhatsApp.
`;

export const handler = async function (event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

    try {
        const { message, step, context: stepContext } = JSON.parse(event.body);

        const systemPrompt = `
        ACT AS: "Abril", chatbot inmobiliario.
        KNOWLEDGE: ${KNOWLEDGE_BASE}
        CONTEXT: Step "${step}" (${stepContext}). User said: "${message}".
        
        GOAL: Classify and Respond. RETURN JSON ONLY.
        Format: { "classification": "VALID_DATA"|"QUESTION"|"IRRELEVANT", "reply": "...", "extracted_data": "..." }
        
        RULES:
        - VALID_DATA: Direct answer to the current step (Name, Location, etc). Clean the data.
        - QUESTION: User asks something. Answer in 'reply'.
        - IRRELEVANT: Nonsense/Greeting. Polite reply.
        `;

        const payload = {
            contents: [{
                parts: [{ text: systemPrompt }] // In Gemini 1.5, system instructions are often just part of the prompt for simplicity in REST
            }]
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API Error:", errText);
            throw new Error(`Gemini API Failed: ${response.status}`);
        }

        const data = await response.json();
        let aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Clean markdown
        aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();

        return {
            statusCode: 200,
            body: aiText,
            headers: { "Content-Type": "application/json" }
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error", details: error.message })
        };
    }
};
