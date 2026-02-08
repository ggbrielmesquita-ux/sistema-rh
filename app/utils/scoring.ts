// app/utils/scoring.ts
import { QUESTIONS_DB } from '../questions';

// Definição dos tipos para o TypeScript não reclamar
type Scores = { [key: string]: number };

interface ResultProfile {
  title: string;
  description: string;
  color: string; // Para usar na UI (verde, amarelo, vermelho)
}

export function calculateProfile(answers: Record<number, string>) {
  // 1. Inicializa o placar
  let totalScores: Scores = {
    vendas: 0,
    empatia: 0,
    etica: 0,
    proatividade: 0,
    equipe: 0,
    resiliencia: 0,
    organizacao: 0
  };

  // 2. Processa as respostas
  // answers é um objeto tipo { 1: '1b', 2: '2a' ... }
  Object.keys(answers).forEach((questionId) => {
    const selectedOptionId = answers[parseInt(questionId)];
    
    // Encontra a pergunta e a opção selecionada no banco de dados
    const question = QUESTIONS_DB.find(q => q.id === parseInt(questionId));
    const option = question?.options.find(opt => opt.id === selectedOptionId);

    if (option && option.scores) {
      // Soma os pontos de cada competência
      Object.entries(option.scores).forEach(([key, value]) => {
        if (!totalScores[key]) totalScores[key] = 0;
        totalScores[key] += value;
      });
    }
  });

  // 3. Lógica de Decisão do Perfil (O "Pulo do Gato")
  const profile = determineProfile(totalScores);

  return {
    scores: totalScores,
    profile: profile
  };
}

function determineProfile(scores: Scores): ResultProfile {
  // Regras de Ouro (Matadoras) - Prioridade Máxima
  
  // 1. Filtro de Ética (O mais importante)
  // Se a pessoa pontuou muito negativo em honestidade/ética, ela é reprovada automaticamente.
  if ((scores.etica || 0) < -2 || (scores.roubo || 0) > 0 || (scores.criminalidade || 0) > 0) {
    return {
      title: "⛔ PERFIL DE ALTO RISCO (Não Contratar)",
      description: "O candidato demonstrou tendências graves de desvio de conduta, falta de ética ou desrespeito a regras inegociáveis. Risco de furto, insubordinação grave ou prejuízo à imagem da empresa.",
      color: "red"
    };
  }

  // 2. Perfil "Vendedor Tubarão" (Vende muito, mas pode ser difícil de gerir)
  if ((scores.vendas || 0) > 10 && (scores.empatia || 0) < 0) {
    return {
      title: "🦈 Vendedor Agressivo (Tubarão)",
      description: "Focado puramente em resultados e comissões. Bate metas com facilidade, mas pode atropelar processos, colegas e até a satisfação do cliente a longo prazo. Precisa de gestão firme.",
      color: "yellow"
    };
  }

  // 3. Perfil "Atendente Ideal" (Equilíbrio Vendas + Empatia)
  if ((scores.vendas || 0) > 5 && (scores.empatia || 0) > 5 && (scores.proatividade || 0) > 0) {
    return {
      title: "💎 Perfil Ouro (Alto Potencial)",
      description: "Candidato raro. Equilibra agressividade de vendas com excelente atendimento e ética. Resolve problemas sozinho e joga com o time. Contratação recomendada.",
      color: "green"
    };
  }

  // 4. Perfil "Suporte/Operacional" (Não vende, mas organiza)
  if ((scores.vendas || 0) < 2 && (scores.organizacao || 0) > 5) {
    return {
      title: "📦 Perfil Operacional / Estoque",
      description: "Não tem perfil para vendas ou frente de loja. É organizado, metódico e segue regras, mas trava na hora de negociar. Melhor para estoque ou reposição.",
      color: "blue"
    };
  }

  // 5. Perfil "Passivo" (Baixa energia)
  if ((scores.proatividade || 0) < -5) {
    return {
      title: "💤 Perfil Passivo / Baixa Energia",
      description: "Candidato reativo. Só faz o que mandam (e às vezes nem isso). Demonstrou preguiça ou falta de vontade de resolver problemas.",
      color: "orange"
    };
  }

  // Padrão (Se não cair em nenhum específico)
  return {
    title: "📋 Perfil Mediano / Em Desenvolvimento",
    description: "Candidato não apresentou riscos graves, mas também não se destacou em nenhuma competência específica. Pode ser treinado, mas exigirá acompanhamento próximo.",
    color: "gray"
  };
}