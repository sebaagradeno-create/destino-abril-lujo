// Client-side service to talk to the Netlify Function (Brain)

export const getAIResponse = async (userMessage, stepName, stepContext) => {
    try {
        // Try calling the Serverless Function
        const response = await fetch('/.netlify/functions/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                step: stepName,
                context: stepContext
            }),
        });

        if (!response.ok) {
            console.warn("Serverless function unavailable (are you on localhost without netlify dev?)... falling back or returning error.");
            throw new Error("Function unreachable");
        }

        const data = await response.json();
        return data; // Expecting { classification, reply, extracted_data }

    } catch (error) {
        console.error("AI Service Error:", error);
        // Fallback or simple error handling
        return {
            classification: "QUESTION", // Safe default: treat as question/unknown so it doesn't break flow
            reply: "Lo siento, tuve un problema de conexión. ¿Podría repetirlo?",
            extracted_data: null
        };
    }
};
