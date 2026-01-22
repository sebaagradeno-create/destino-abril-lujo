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

export const getAIResponse = async (userMessage) => {
    try {
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating AI response:", error);
        return null; // Fallback to standard flow
    }
};
