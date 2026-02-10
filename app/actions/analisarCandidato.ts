"use server";
import { model } from "../lib/ai";

export async function analisarPerfilIA(cargo: string, respostas: any[], perguntas: any[]) {
  // Monta um texto legível para a IA ler o que aconteceu
  let resumoTeste = `Candidato para vaga de: ${cargo}.\n\n`;
  
  respostas.forEach((resp, index) => {
    const pergunta = perguntas.find(p => p.id === parseInt(Object.keys(resp)[0] || index + 1)); // Ajuste conforme sua estrutura de save
    // Lógica simplificada: precisamos cruzar a resposta do cara com o texto da pergunta
    // Supondo que você mande o objeto completo das respostas escolhidas
  });

  const prompt = `
    Analise as respostas deste candidato para a vaga de ${cargo}.
    
    DADOS DO TESTE:
    ${JSON.stringify(respostas)}
    
    TAREFA: Gere um relatório executivo para o dono da empresa.
    
    SAÍDA ESPERADA (JSON):
    {
      "pontosFortes": ["Item 1", "Item 2", "Item 3"],
      "pontosFracos": ["Item 1", "Item 2"],
      "veredito": "CONTRATAR" ou "NÃO CONTRATAR" ou "ENTREVISTAR COM CAUTELA",
      "observacao": "Texto curto de 2 linhas resumindo a personalidade (ex: Candidato muito focado em vendas, mas com riscos éticos moderados).",
      "matchCultural": 85 (número de 0 a 100 baseado na coerência das respostas)
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (error) {
    return {
      pontosFortes: ["Análise indisponível"],
      pontosFracos: ["Erro na IA"],
      veredito: "ANÁLISE MANUAL NECESSÁRIA",
      observacao: "A IA não conseguiu processar este teste.",
      matchCultural: 0
    };
  }
}