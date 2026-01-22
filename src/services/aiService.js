import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase } from "../data/knowledgeBase";

// WARNING: In a production app, use an environment variable (import.meta.env.VITE_GEMINI_API_KEY)
// For this prototype/demo, we are using the provided key directly.
const API_KEY = "AIzaSyClTbbC3T5o8ZzDEc2TohSzL0wdvQDpaoA";

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `
        Eres "Abril", el asistente virtual de inteligencia artificial de la inmobiliaria de lujo "Destino Abril".
        Tu tono es profesional, cálido, empático y servicial.
        
        Tus conocimientos (Knowledge Base):
        - Garantías: ${knowledgeBase.responses.garantias}
        - Contratos: ${knowledgeBase.responses.contratos}
        - Tasaciones: ${knowledgeBase.responses.tasacion}
        - Proyectos: ${knowledgeBase.responses.proyectos}
        
        Reglas:
        1. Responde de manera concisa (máximo 2 o 3 oraciones).
        2. Si te preguntan algo fuera del rubro inmobiliario, responde amablemente que solo puedes ayudar con temas de propiedades.
        3. Si detectas que el usuario quiere comprar, vender o alquilar, anímalo a dejar sus datos o seguir el flujo del chat.
        4. NUNCA inventes información sobre propiedades específicas que no tengas.
    `
});

export const getAIResponse = async (userMessage, currentContext = '') => {
    try {
        // We wrap the user message with a specific instruction for the "Gatekeeper" logic
        const prompt = `
            Contexto del Chatbot: El usuario está en el paso: "${currentContext}".
            Mensaje del usuario: "${userMessage}".
            
            INSTRUCCIONES DE RAZONAMIENTO:
            1. Analiza si el mensaje del usuario es una RESPUESTA DIRECTA y VÁLIDA a lo que se le preguntó en el contexto.
               - Ejemplo: Si el contexto es "Pedir Nombre" y dice "Juan", es VÁLIDO.
               - Ejemplo: Si el contexto es "Pedir Presupuesto" y dice "2000 dolares", es VÁLIDO.
               - Ejemplo: Si el contexto es "Pedir Ubicación" y dice "Pocitos", es VÁLIDO.
            
            2. Si es una respuesta válida, TU ÚNICA RESPUESTA DEBE SER LA PALABRA: "VALID_DATA". (Sin comillas, sin nada más).
            
            3. Si el usuario está haciendo una pregunta, cambiando de tema, o su respuesta no tiene sentido (ej: Pedir teléfono y dice "tengo perro"), ENTONCES respondele amablemente a su inquietud como "Abril" (la asistente inmobiliaria).
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean up potential formatting like "VALID_DATA." or "**VALID_DATA**"
        text = text.replace(/[\.\*\"\']/g, '').trim();

        return text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        return null; // Fallback to allowing data if AI fails
    }
};
