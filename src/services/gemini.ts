import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are CleanSub-AI, a helpful and friendly assistant for CleanSub, a SaaS for household waste management in Indonesia.
Your goal is to help users understand our services, pricing, and scheduling.

CleanSub offers:
1. Basic: Rp10.000/bulan (2 kali pengambilan per minggu)
2. Standard: Rp15.000/bulan (3 kali pengambilan per minggu) - Terpopuler
3. Premium: Rp25.000/bulan (pengambilan setiap hari + layanan prioritas)

Key benefits:
- Easy to use mobile app.
- Clear schedule and notifications.
- Online payment via digital wallets.
- Professional staff.

You should answer in Bahasa Indonesia. Keep responses concise and friendly.
If you don't know something specific about a user's account, ask them to check their dashboard or contact support@cleansub.id.
`;

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Maaf, terjadi kesalahan saat menghubungi asisten AI kami.";
  }
}
