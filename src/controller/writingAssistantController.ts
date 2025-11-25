import type { Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});
const model = "gemini-2.5-flash";

interface WritingAssistantRequestBody {
  title: string;
  content: string;
  userPrompt: string;
}

const generateAssistantResponse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, content, userPrompt } =
    req.body as WritingAssistantRequestBody;

  if ((!title && !content) || !userPrompt) {
    res.status(400).json({
      error: "Missing required fields: title, content, or userPrompt",
    });
    return;
  }

  const systemInstruction = `You are a professional writing assistant. Your task is to refine, expand, or answer a user's question about a provided blog post. Your output MUST be formatted using standard Markdown syntax (e.g., # for headings, ** for bold, * for lists).
  - The content you are working on is titled: "${title}"
  - The current content is: "${content}"
  - The user's request is: "${userPrompt}"
  
  Generate a single, coherent, and helpful response based on the user's prompt and the provided context.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const geminiResponseText = response.text;
    res.json({ generatedText: geminiResponseText, format: "markdown" });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: "Failed to communicate with the AI model." });
  }
};

export default { generateAssistantResponse };
