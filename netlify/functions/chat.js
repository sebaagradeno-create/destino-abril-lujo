import { GoogleGenerativeAI } from "@google/generative-ai";

// WARNING: In a production app, use process.env.GEMINI_API_KEY
// For this prototype, we use the key ensuring it works immediately.
const API_KEY = "AIzaSyClTbbC3T5o8ZzDEc2TohSzL0wdvQDpaoA";

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

export const handler = async function (event, context) {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { message, step, context: stepContext } = JSON.parse(event.body);

        const prompt = `
            ACT COMO: "Abril", el cerebro de un chatbot inmobiliario.
            
            CONOCIMIENTO: ${KNOWLEDGE_BASE}
            
            SITUACIÓN ACTUAL:
            - El usuario está en el paso: "${step}" (${stepContext}).
            - El usuario escribió: "${message}".

            TU OBJETIVO:
            Clasificar la respuesta del usuario y decidir qué hacer.
            Debes devolver UNICAMENTE un objeto JSON con este formato (sin markdown):
            
            {
                "classification": "VALID_DATA" | "QUESTION" | "IRRELEVANT",
                "reply": "Texto de respuesta para el usuario (solo si es QUESTION o IRRELEVANT, si es VALID_DATA dejalo vacío)",
                "extracted_data": "El dato limpio si es VALID_DATA (ej: si dijo 'me llamo Juan', pon 'Juan'. Si dijo 'Pocitos', pon 'Pocitos')"
            }

            REGLAS PARA CLASIFICAR:
            1. "VALID_DATA":
               - Si el usuario responde DIRECTAMENTE a lo que pide el paso actual.
               - Ej: Paso="Pedir Nombre", Usuario="Soy Pedro" -> VALID_DATA, extracted_data="Pedro".
               - Ej: Paso="Pedir Presupuesto", Usuario="Unos 20 mil" -> VALID_DATA, extracted_data="20000".
               - Ej: Paso="Pedir Ubicación", Usuario="Busco en el centro" -> VALID_DATA, extracted_data="Centro".

            2. "QUESTION":
               - Si el usuario hace una pregunta sobre garantías, comisiones, ubicación de la oficina, etc.
               - Ej: "¿Aceptan mascota?" -> QUESTION.
               - Ej: "¿Qué garantías piden?" -> QUESTION.
               - En este caso, en "reply" debes responder la duda usando el CONOCIMIENTO.

            3. "IRRELEVANT":
               - Si el usuario dice algo sin sentido o saluda sin responder el dato.
               - En "reply", saluda y pide amablemente el dato de nuevo.

            IMPORTANTE: Responde SOLO el JSON.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Clean markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        console.log("AI Response:", text);

        return {
            statusCode: 200,
            body: text,
            headers: {
                "Content-Type": "application/json"
            }
        };

    } catch (error) {
        console.error("Error in function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process AI request" })
        };
    }
};
