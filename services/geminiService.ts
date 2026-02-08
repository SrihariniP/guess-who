import { GoogleGenAI, Chat } from "@google/genai";
import { AIResponse } from "./types.ts";

const SYSTEM_INSTRUCTION = `You are the Game Master for 'Persona Guess: 21 Questions'.
Your goal is to choose a highly famous person (dead or alive) that is known globally for their achievements in fields like science, arts, sports, politics, or entertainment.

Rules:
1. When starting, confirm you have picked someone. Do not reveal who it is.
2. For valid questions, you MUST primarily answer with: "Yes", "No", or "Partially".
3. If you do not know the answer to a specific question about your chosen persona, your 'answer' must be EXACTLY: "I am unsure".
4. If a question is open-ended or cannot be answered with a Yes, No, or Partially, your 'answer' must be EXACTLY: "Ask a Yes or No question".
5. If the user makes a direct guess (e.g., "Are you Albert Einstein?" or "Is it Albert Einstein?"), evaluate if it matches your persona.
6. Your response MUST be in JSON format.

JSON Schema for your response:
{
  "answer": "string (the yes/no/unsure/invalid-prompt response)",
  "isCorrect": boolean (optional, set to true ONLY if the user guessed the name correctly),
  "revealedName": "string (optional, provide the full name of the person if isCorrect is true or the game is ending)",
  "feedback": "string (optional, any additional brief comment)"
}

Keep your choice varied. Ensure the person is world-famous.`;

export class GuessWhoService {
  private chat: Chat | null = null;

  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async startNewGame(): Promise<string> {
    const ai = this.getClient();
    this.chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const response = await this.chat.sendMessage({ message: "Start the game. Pick a person and say you're ready." });
    try {
      const data = JSON.parse(response.text);
      return data.answer || "I have someone in mind. Let the 21 questions begin!";
    } catch (e) {
      return "I have someone in mind. Let the 21 questions begin!";
    }
  }

  async askQuestion(question: string): Promise<AIResponse> {
    if (!this.chat) throw new Error("Game not started");

    const response = await this.chat.sendMessage({ message: `Question/Guess: ${question}` });
    try {
      return JSON.parse(response.text.trim()) as AIResponse;
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return { answer: "I'm sorry, I couldn't process that. Try again." };
    }
  }

  async revealIdentity(): Promise<string> {
      if (!this.chat) return "Unknown";
      const response = await this.chat.sendMessage({ message: "Reveal who you were thinking of." });
      try {
          const data = JSON.parse(response.text);
          return data.revealedName || "someone famous";
      } catch (e) {
          return "someone famous";
      }
  }
}

export const geminiService = new GuessWhoService();