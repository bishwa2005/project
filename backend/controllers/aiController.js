import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with your API Key
const genAI = new GoogleGenerativeAI("AIzaSyBIIW62d0U4be1bCmG2YmRjOTM0m3J99To");

export const chatWithAI = async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ msg: "Prompt is required." });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Add a personality and context to the AI
        const fullPrompt = `
            You are 'College Buddy', a helpful and encouraging AI assistant on the College Connect platform. 
            Your goal is to assist college students with their studies, career advice, and personal growth. 
            Keep your responses concise, friendly, and supportive.
            
            Student's question: "${prompt}"
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error("AI chat error:", error);
        res.status(500).send("Error communicating with the AI model.");
    }
};