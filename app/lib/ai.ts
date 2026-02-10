import { GoogleGenerativeAI } from "@google/generative-ai";

// Você precisa pegar uma API KEY no site: aistudio.google.com
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "SUA_CHAVE_AQUI");

export const model = genAI.getGenerativeModel({ model: "gemini-pro" });