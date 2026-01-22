import { GoogleGenerativeAI } from "@google/generative-ai";

// Shared Key (Safe for prototype, move to env for production)
const API_KEY = "AIzaSyClTbbC3T5o8ZzDEc2TohSzL0wdvQDpaoA";

// --- CLIENT SIDE LOGIC (The Safety Net) ---
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const KNOWLEDGE_BASE = `
EMPRESA: Inmobiliaria Destino Abril.
SERVICIOS: Venta, Alquiler, Tasaciones.
UBICACIÓN: Montevideo, Uruguay.
GARANTÍAS: Aceptamos ANDA, Contaduría (CGN), Porto Seguro, Sura.
CONTRATOS: Generalmente 2 años.
COMISIÓN: 1 mes de alquiler + IVA (para alquileres) o 3% + IVA (para ventas).
CONTACTO: El objetivo final es conseguir el WhatsApp del cliente.
`;

const getClientSideResponse = async (message, step, context) => {
    console.log("⚠️ Using Client-Side Fallback");
    try {
        const prompt = `
            ACT COMO: "Abril", el cerebro de un chatbot inmobiliario.
            CONOCIMIENTO: ${KNOWLEDGE_BASE}
            SITUACIÓN: Paso "${step}" (${context}). Usuario dice: "${message}".

            TU OBJETIVO: Clasificar y responder.
            Devuelve SOLO un JSON:
            {
                "classification": "VALID_DATA" | "QUESTION" | "IRRELEVANT",
                "reply": "Texto para responder duda o saludos (vacio si VALID_DATA)",
                "extracted_data": "Dato limpio si VALID_DATA"
            }
            
            REGLAS:
            - VALID_DATA: Si responde lo que pide el paso (Nombre, Ubicación, etc).
            - QUESTION: Si pregunta dudas (garantias, etc). Responde usando CONOCIMIENTO.
            - IRRELEVANT: Si no tiene sentido.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (e) {
        console.error("Client-Side Logic Failed:", e);
        return {
            classification: "QUESTION",
            reply: "Lo siento, estoy teniendo problemas técnicos. ¿Podrías intentar de nuevo?",
            extracted_data: null
        };
    }
};

// --- MAIN FUNCTION ---
export const getAIResponse = async (userMessage, stepName, stepContext) => {
    try {
        // 1. Try Serverless Function (Primary)
        // We set a short timeout so we don't keep the user waiting if it fails
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout

        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage, step: stepName, context: stepContext }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        return data;

    } catch (error) {
        // 2. Fallback to Client-Side (Secondary)
        console.warn("Backend unavailable, switching to Client-Side AI...", error);
        return await getClientSideResponse(userMessage, stepName, stepContext);
    }
};
