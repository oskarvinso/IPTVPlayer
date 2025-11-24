import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key not found");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async getChannelInsights(channelName: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Provide a short, 2-sentence description of the TV channel or show type likely associated with the name: "${channelName}". Focus on genre and typical content.`,
      });
      return response.text || "No insights available.";
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      return "Unable to fetch channel insights at this time.";
    }
  }

  async transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            },
            {
              text: "Transcribe this audio exactly as spoken."
            }
          ]
        }
      });
      return response.text || "";
    } catch (error) {
      console.error("Transcription Error:", error);
      throw new Error("Failed to transcribe audio.");
    }
  }
}
