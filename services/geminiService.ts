import { GoogleGenAI } from "@google/genai";

const getClient = () => {
    try {
        // specific check to avoid ReferenceError in strict browser environments
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            return new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
    } catch (e) {
        console.warn("Environment variable access failed:", e);
    }
    return null;
};

export const getChannelInsight = async (channelName: string, groupName: string) => {
    const ai = getClient();
    if (!ai) return "AI Insights not configured (API Key missing).";

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Provide a short, 2-sentence description of the TV channel named "${channelName}" which is in the "${groupName}" category. If it is a specific known channel, describe its typical content. If it is generic, describe what such a channel typically shows. Do not hallucinate a fake history, just describe the genre.`,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Unable to fetch channel insights at the moment.";
    }
};

export const checkContentSafety = async (channelName: string): Promise<boolean> => {
   const ai = getClient();
   if (!ai) return true; // Default to safe if no AI

   try {
       const response = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: `Is the TV channel name "${channelName}" likely to contain adult or restricted content? Answer strictly with "YES" or "NO".`,
       });
       const text = response.text.trim().toUpperCase();
       return text.includes("NO");
   } catch (e) {
       return true;
   }
}