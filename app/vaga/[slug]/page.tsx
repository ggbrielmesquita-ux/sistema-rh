// app/vaga/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// MANTENHA AQUI AQUELA LISTA GIGANTE DE 25 PERGUNTAS QUE TE MANDEI ANTES!
// (Vou colocar só 1 de exemplo para o código não ficar enorme aqui, 
// mas você deve manter as 25 que já estão no seu arquivo)
   const PERGUNTAS = [
  // --- BLOCO 1: RESOLUÇÃO DE PROBLEMAS E AUTONOMIA ---
  {
    pergunta: "1. Você identifica um erro no processo da empresa que causa um pequeno prejuízo diário, mas corrigi-lo vai atrasar suas entregas pessoais da semana. O que você faz?",
    opcoes: [
      { texto: "Foco nas minhas entregas. Se eu atrasar, serei cobrado, e o erro já existia antes.", pontuacao: 2 },
      { texto: "Corrijo o erro imediatamente, mesmo que atrase minhas tarefas.", pontuacao: 7 },
      { texto: "Aviso meu superior sobre o erro para ele decidir quando corrigir.", pontuacao: 5 },
      { texto: "Monto um plano rápido, calculo o prejuízo financeiro e negocio com o gestor para priorizar isso agora.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "2. Um cliente pede uma alteração fora do contrato que vai gerar valor, mas o gerente não está disponível para autorizar.",
    opcoes: [
      { texto: "Faço a alteração como cortesia para fidelizar.", pontuacao: 5 },
      { texto: "Nego, explicando que foge do escopo contratado.", pontuacao: 2 },
      { texto: "Faço, mas deixo claro que é uma exceção única documentada.", pontuacao: 7 },
      { texto: "Analiso o custo. Se baixo, faço e uso como gancho para vender um upgrade depois. Se alto, negocio prazo.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "3. Você percebe que seu supervisor esqueceu de te passar uma informação vital e o projeto vai atrasar. Quando cobrado, o que diz?",
    opcoes: [
      { texto: "'O projeto atrasou porque não recebi a informação X a tempo'. (A verdade).", pontuacao: 2 },
      { texto: "'Houve uma falha de comunicação nossa. Vou correr para recuperar'. (Protege o chefe).", pontuacao: 7 },
      { texto: "'Percebi que a informação faltava e não cobrei. Erro meu de gestão. Já estou resolvendo assim...'", pontuacao: 10 },
      { texto: "Dou uma desculpa genérica sobre imprevistos.", pontuacao: 0 }
    ]
  },
  {
    pergunta: "4. A empresa está em crise e cortou benefícios (café, ar condicionado, festas). O clima está péssimo.",
    opcoes: [
      { texto: "Reclamo com os colegas. É desmotivador trabalhar assim.", pontuacao: 0 },
      { texto: "Entendo, mas começo a procurar outro emprego discretamente.", pontuacao: 5 },
      { texto: "Ignoro o clima e foco no meu trabalho para garantir meu emprego.", pontuacao: 7 },
      { texto: "Chamo o gestor e pergunto: 'O que a gente precisa entregar esse mês para reverter essa situação?'", pontuacao: 10 }
    ]
  },
  {
    pergunta: "5. Uma tarefa chata e repetitiva precisa ser feita todo dia, consumindo 1 hora do seu tempo.",
    opcoes: [
      { texto: "Faço rápido de qualquer jeito para me livrar.", pontuacao: 0 },
      { texto: "Faço com atenção, pois é minha obrigação.", pontuacao: 5 },
      { texto: "Delegaria para um estagiário assim que possível.", pontuacao: 2 },
      { texto: "Faço por uma semana, cronometro o tempo e crio uma automação ou processo para eliminar essa tarefa.", pontuacao: 10 }
    ]
  },

  // --- BLOCO 2: TRABALHO EM EQUIPE E LIDERANÇA ---
  {
    pergunta: "6. Um colega do seu time é muito lento e prejudica o resultado do grupo. O gerente não vê.",
    opcoes: [
      { texto: "Faço a minha parte e a dele para garantir a entrega.", pontuacao: 5 },
      { texto: "Deixo ele falhar para o gerente perceber a incompetência.", pontuacao: 0 },
      { texto: "Reclamo com o gerente sobre a postura dele.", pontuacao: 2 },
      { texto: "Ensino um método mais rápido para ele. Se não funcionar, aí falo com o gerente com dados.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "7. Em uma reunião, dão uma ideia que você sabe tecnicamente que vai dar errado.",
    opcoes: [
      { texto: "Fico calado para não ser o 'chato' do grupo.", pontuacao: 2 },
      { texto: "Falo na hora: 'Isso não vai funcionar'.", pontuacao: 5 },
      { texto: "Espero acabar e falo com o dono da ideia em particular para ajustar.", pontuacao: 10 },
      { texto: "Apoio a ideia mas levanto uma questão sutil: 'E se acontecer o risco X, qual o plano?'", pontuacao: 8 }
    ]
  },
  {
    pergunta: "8. Você recebeu um feedback duro e injusto do seu chefe na frente de todos.",
    opcoes: [
      { texto: "Discuto na hora para não parecer fraco.", pontuacao: 0 },
      { texto: "Fico quieto, mas desmotivado o dia todo.", pontuacao: 2 },
      { texto: "Aceito, mas depois envio um e-mail provando que ele estava errado.", pontuacao: 5 },
      { texto: "Ouço. Depois, no particular, pergunto: 'Entendi seu ponto. O que exatamente preciso entregar para isso não se repetir?'", pontuacao: 10 }
    ]
  },
  {
    pergunta: "9. O time decide sair para um Happy Hour às 17h, mas você tem uma pendência importante não urgente.",
    opcoes: [
      { texto: "Vou junto. Networking é importante e segunda eu resolvo.", pontuacao: 2 },
      { texto: "Fico trabalhando, mas chateado por perder a diversão.", pontuacao: 5 },
      { texto: "Termino o trabalho com foco total e encontro eles depois.", pontuacao: 10 },
      { texto: "Levo o notebook para o bar.", pontuacao: 0 }
    ]
  },
  {
    pergunta: "10. Crédito pelo trabalho: Você fez 90% do projeto, mas seu colega apresentou e levou os elogios.",
    opcoes: [
      { texto: "Fico quieto. O importante é que a empresa ganhou.", pontuacao: 5 },
      { texto: "Interrompo e digo: 'Na verdade, eu fiz a maior parte'.", pontuacao: 2 },
      { texto: "Não falo nada, mas na próxima não ajudo ele.", pontuacao: 0 },
      { texto: "Parabenizo ele, mas envio um relatório técnico complementar ao chefe detalhando os próximos passos (mostrando autoria).", pontuacao: 10 }
    ]
  },

  // --- BLOCO 3: AMBIÇÃO E VISÃO DE DONO ---
  {
    pergunta: "11. Definiram uma meta que você acha matematicamente impossível de bater.",
    opcoes: [
      { texto: "Aceito e trabalho o dobro. Se não der, tentei.", pontuacao: 5 },
      { texto: "Reclamo que a meta é desmotivadora.", pontuacao: 0 },
      { texto: "Ignoro a meta e faço o meu melhor.", pontuacao: 2 },
      { texto: "Apresento dados provando a inviabilidade e proponho uma meta nova, desafiadora mas possível, com plano de ação.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "12. Você descobre que a concorrência lançou um produto melhor e mais barato.",
    opcoes: [
      { texto: "Fico preocupado com meu emprego.", pontuacao: 2 },
      { texto: "Aviso o chefe: 'Viu isso? Estamos ferrados'.", pontuacao: 0 },
      { texto: "Continuo vendendo o meu, focando no relacionamento.", pontuacao: 5 },
      { texto: "Compro o produto deles, testo, listo os pontos fracos e monto um script de vendas para contra-atacar.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "13. O que define um profissional insubstituível?",
    opcoes: [
      { texto: "Quem detém todo o conhecimento técnico sozinho.", pontuacao: 2 },
      { texto: "Quem é leal e nunca falta.", pontuacao: 5 },
      { texto: "Quem bate metas consistentemente.", pontuacao: 7 },
      { texto: "Quem cria processos e treina pessoas para a empresa não depender dele, permitindo que ele suba de cargo.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "14. Sobrou verba no orçamento do seu setor no fim do ano.",
    opcoes: [
      { texto: "Gasto tudo em coisas úteis para não perder a verba ano que vem.", pontuacao: 5 },
      { texto: "Faço uma festa para a equipe.", pontuacao: 2 },
      { texto: "Devolvo para o caixa da empresa.", pontuacao: 7 },
      { texto: "Invisto em um curso ou ferramenta que vai trazer mais lucro no ano seguinte.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "15. Você tem duas tarefas: Uma agrada o chefe (visibilidade), a outra é vital para o cliente (resultado).",
    opcoes: [
      { texto: "Faço a do chefe. Ele decide meu salário.", pontuacao: 2 },
      { texto: "Faço a do cliente. Sem cliente não tem salário.", pontuacao: 10 },
      { texto: "Tento fazer as duas correndo.", pontuacao: 5 },
      { texto: "Pergunto ao chefe qual priorizar.", pontuacao: 5 }
    ]
  },

  // --- BLOCO 4: ÉTICA E PRESSÃO ---
  {
    pergunta: "16. Para fechar uma venda grande, o cliente pede uma 'pequena mentira' sobre o prazo de entrega.",
    opcoes: [
      { texto: "Minto. O importante é fechar, depois a gente corre atrás.", pontuacao: 0 },
      { texto: "Não minto e perco a venda. Ética é tudo.", pontuacao: 5 },
      { texto: "Prometo tentar, mas não garanto.", pontuacao: 2 },
      { texto: "Falo a verdade sobre o prazo, mas ofereço um bônus ou desconto para compensar a espera e fechar honestamente.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "17. Você vê um colega desviando material da empresa (coisa pequena).",
    opcoes: [
      { texto: "Não me meto.", pontuacao: 0 },
      { texto: "Falo com ele para parar.", pontuacao: 5 },
      { texto: "Aviso o RH anonimamente. Quem rouba pouco, rouba muito.", pontuacao: 10 },
      { texto: "Começo a vigiar ele.", pontuacao: 2 }
    ]
  },
  {
    pergunta: "18. O servidor caiu no sábado à noite. Não é sua função oficial arrumar.",
    opcoes: [
      { texto: "Desligo o celular. Meu horário acabou.", pontuacao: 0 },
      { texto: "Aviso o responsável técnico.", pontuacao: 5 },
      { texto: "Tento ajudar, mas se não conseguir, desisto.", pontuacao: 5 },
      { texto: "Resolvo ou fico em cima de quem resolve até voltar. O site fora do ar perde dinheiro.", pontuacao: 10 }
    ]
  },
  {
    pergunta: "19. A nova política da empresa exige relatórios burocráticos inúteis.",
    opcoes: [
      { texto: "Preencho de qualquer jeito.", pontuacao: 0 },
      { texto: "Preencho corretamente. Regra é regra.", pontuacao: 5 },
      { texto: "Cumpro a regra por uma semana, meço o tempo perdido e proponho uma simplificação para a diretoria.", pontuacao: 10 },
      { texto: "Reclamo com o gestor.", pontuacao: 2 }
    ]
  },
  {
    pergunta: "20. Seu chefe pede para você fazer uma tarefa pessoal dele (buscar filho na escola).",
    opcoes: [
      { texto: "Faço sorrindo. Ele é o chefe.", pontuacao: 2 },
      { texto: "Me recuso. Não sou pago para isso.", pontuacao: 5 },
      { texto: "Faço dessa vez, mas peço para não virar hábito.", pontuacao: 5 },
      { texto: "Digo educadamente: 'Posso ir, mas isso vai atrasar a entrega do relatório X. O que você prefere que eu priorize?'", pontuacao: 10 }
    ]
  },

  // --- BLOCO 5: FINALIZADORES (PERFIL COMPORTAMENTAL) ---
  {
    pergunta: "21. Se você ganhasse na loteria hoje, o que faria amanhã?",
    opcoes: [
      { texto: "Nunca mais trabalhava.", pontuacao: 0 },
      { texto: "Investiria em um negócio próprio.", pontuacao: 10 },
      { texto: "Continuaria trabalhando por hobby.", pontuacao: 5 },
      { texto: "Viajaria o mundo.", pontuacao: 2 }
    ]
  },
  {
    pergunta: "22. O que mais te irrita no trabalho?",
    opcoes: [
      { texto: "Gente lenta ou incompetente.", pontuacao: 5 },
      { texto: "Falta de processos claros.", pontuacao: 10 },
      { texto: "Ter que trabalhar muito.", pontuacao: 0 },
      { texto: "Injustiça.", pontuacao: 5 }
    ]
  },
  {
    pergunta: "23. Você prefere ser reconhecido como:",
    opcoes: [
      { texto: "O mais inteligente (Gênio).", pontuacao: 5 },
      { texto: "O mais esforçado (Trabalhador).", pontuacao: 5 },
      { texto: "O que mais gera lucro (Resultado).", pontuacao: 10 },
      { texto: "O mais amigo (Popular).", pontuacao: 2 }
    ]
  },
  {
    pergunta: "24. Se pudesse mudar algo no seu último emprego:",
    opcoes: [
      { texto: "O salário.", pontuacao: 5 },
      { texto: "O chefe.", pontuacao: 2 },
      { texto: "A cultura/organização.", pontuacao: 10 },
      { texto: "Nada.", pontuacao: 5 }
    ]
  },
  {
    pergunta: "25. Por que devemos te contratar?",
    opcoes: [
      { texto: "Preciso muito da oportunidade.", pontuacao: 0 },
      { texto: "Sou proativo e visto a camisa.", pontuacao: 5 },
      { texto: "Tenho muita experiência técnica.", pontuacao: 5 },
      { texto: "Porque vou me pagar em 3 meses trazendo o resultado X e resolvendo o problema Y.", pontuacao: 10 }
    ]
  }
];

export default function VagaQuiz() {
  const params = useParams();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  
  // ESTADOS DO FORMULÁRIO
  const [step, setStep] = useState<'intro' | 'quiz' | 'finish'>('intro');
  
  // DADOS DO CANDIDATO (Agora com WhatsApp!)
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // NOVO CAMPO
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [respostasSalvas, setRespostasSalvas] = useState<string[]>([]);

  // 1. CARREGAR VAGA
  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
      try {
        const q = query(collection(db, "jobs"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setJob({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (error) {
        console.error("Erro", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [slug]);

  // 2. LÓGICA DE RESPOSTA
  const handleAnswer = (pontos: number, textoResposta: string) => {
    const novaPontuacao = scoreTotal + pontos;
    setScoreTotal(novaPontuacao);
    setRespostasSalvas([...respostasSalvas, textoResposta]);

    if (currentQuestion < PERGUNTAS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      salvarResultado(novaPontuacao);
    }
  };

  // 3. SALVAR NO BANCO (Agora salva o WhatsApp!)
  const salvarResultado = async (pontosFinais: number) => {
    if (!job?.id) return;

    // Se você não copiou as 25 perguntas, ajuste o divisor aqui!
    // Ex: Se tem 25 perguntas, o máximo é 250 pontos.
    const maximoPontos = PERGUNTAS.length * 10; 
    const porcentagem = Math.round((pontosFinais / maximoPontos) * 100);

    try {
      await addDoc(collection(db, "candidates"), {
        jobId: job.id,
        jobTitle: job.title,
        name: name,
        whatsapp: whatsapp,       // SALVANDO O ZAP AQUI!
        answers: respostasSalvas, 
        score: porcentagem,       
        createdAt: new Date().toISOString(),
        status: 'new'
      });
      setStep('finish');
    } catch (error) {
      alert("Erro ao enviar: " + error);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!job) return <div className="p-10 text-center">Vaga não encontrada.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <p className="opacity-90 text-sm">Teste de Perfil Profissional</p>
        </div>

        <div className="p-8">
          
          {/* TELA 1: IDENTIFICAÇÃO (ATUALIZADA) */}
          {step === 'intro' && (
            <div className="text-center space-y-5">
              <h2 className="text-xl font-semibold text-gray-800">Vamos começar?</h2>
              <p className="text-gray-600">Preencha seus dados para iniciar o teste.</p>
              
              <div className="space-y-3 text-left">
                <div>
                  <label className="block text-sm font-bold text-gray-700 ml-1">Nome Completo</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: João da Silva"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 ml-1">WhatsApp / Celular</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Ex: (27) 99999-9999"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                  />
                </div>
              </div>
              
              <button
                disabled={name.length < 3 || whatsapp.length < 8}
                onClick={() => setStep('quiz')}
                className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-4"
              >
                INICIAR TESTE AGORA ➤
              </button>
            </div>
          )}

          {/* TELA 2: PERGUNTAS */}
          {step === 'quiz' && (
            <div>
              <div className="mb-4 flex justify-between text-sm text-gray-500 font-bold">
                <span>Questão {currentQuestion + 1} de {PERGUNTAS.length}</span>
                <span>{Math.round(((currentQuestion) / PERGUNTAS.length) * 100)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / PERGUNTAS.length) * 100}%` }}></div>
              </div>

              <h2 className="text-lg font-bold text-gray-800 mb-6 leading-relaxed">
                {PERGUNTAS[currentQuestion].pergunta}
              </h2>

              <div className="space-y-3">
                {PERGUNTAS[currentQuestion].opcoes.map((opcao, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(opcao.pontuacao, opcao.texto)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-sm md:text-base text-gray-700 font-medium"
                  >
                    {opcao.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TELA 3: FINAL */}
          {step === 'finish' && (
            <div className="text-center py-10 animate-fade-in">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Teste Finalizado!</h2>
              <p className="text-gray-600">Obrigado, <strong>{name}</strong>.</p>
              <p className="text-gray-500 text-sm mt-4">Nossa equipe entrará em contato pelo WhatsApp caso seu perfil seja selecionado.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}