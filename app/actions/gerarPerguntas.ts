"use server";
import { model } from "../lib/ai";

export async function gerarPerguntasIA(cargo: string, empresa: string) {
  const prompt = `
    Você é um Psicólogo Organizacional especialista em Recrutamento e Seleção de alto nível.
    
    TAREFA: Crie um teste técnico e comportamental para a vaga de "${cargo}" na empresa "${empresa}".
    
    REGRAS OBRIGATÓRIAS:
    1. Gere exatamente 25 perguntas.
    2. Linguagem: Simples, popular, acessível (qualquer pessoa deve entender), SEM termos técnicos de RH (como "turnover", "brainstorming").
    3. Dificuldade: As perguntas devem ser situacionais (casos reais do dia a dia desse cargo).
    4. As opções de resposta NÃO podem ser óbvias. Não deve haver uma resposta "certa" clara e uma "errada" estúpida. Todas devem parecer plausíveis, mas revelam traços de personalidade diferentes.
    5. Retorne APENAS um JSON válido (sem markdown, sem texto antes ou depois).

    ESTRUTURA DO JSON (Array de objetos):
    [
      {
        "id": 1,
        "text": "Situação difícil do dia a dia...",
        "options": [
          { 
            "id": "a", 
            "text": "Ação tomada...", 
            "scores": { "etica": 2, "proatividade": -1, "vendas": 0 } 
          }
        ]
      }
    ]

    ATENÇÃO AOS SCORES (PESOS):
    Para cada opção, atribua pontos para traços de personalidade (ex: etica, proatividade, lideranca, resiliencia, organizacao, vendas).
    Valores positivos (1 a 3) para bom comportamento, negativos (-1 a -3) para mau comportamento.
    Crie armadilhas para pegar perfis antiéticos.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpeza para garantir que venha só o JSON
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erro na IA:", error);
    return null;
  }
}