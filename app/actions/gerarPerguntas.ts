"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function gerarPerguntasIA(cargo: string, empresa: string) {
  if (!process.env.GEMINI_API_KEY) throw new Error("Sem chave de API");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Atue como um recrutador especialista e psicólogo organizacional.
    Crie um teste de triagem com EXATAMENTE 25 perguntas de múltipla escolha para a vaga de "${cargo}" na empresa "${empresa}".

    REGRAS DO TESTE:
    1. Contexto: As perguntas devem ser SITUACIONAIS e específicas para a rotina de um ${cargo}.
    2. Dificuldade: Perguntas difíceis, dilemas éticos, pressão e resolução de conflitos. Nada de perguntas óbvias.
    3. Estilo: Mantenha o tom profissional mas desafiador.
    4. Formato JSON: Retorne APENAS um array JSON puro, sem markdown, sem texto antes ou depois.

    ESTRUTURA DE CADA PERGUNTA (JSON):
    {
      "pergunta": "Texto da situação...",
      "opcoes": [
        { "texto": "Ação ruim/passiva", "pontuacao": 0 },
        { "texto": "Ação mediana/correta mas simples", "pontuacao": 5 },
        { "texto": "Ação excelente/proativa/líder", "pontuacao": 10 }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro IA:", error);
    return null;
  }
}