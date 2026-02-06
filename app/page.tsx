'use client';
import { useState, useEffect } from 'react';

// === BANCO DE DADOS LOCAL (AS 25 PERGUNTAS COMPLETAS) ===
const FULL_QUESTIONS = [
  // --- BLOCO A: SITUACIONAL ---
  {
    id: 1, order_index: 1, category: 'Situacional',
    text: 'Faltam 10 minutos para o fim do turno. Um caminhão chega para descarregar, mas a nota fiscal tem um código errado. O que você faz?',
    options: [
      { id: 101, text: 'Recebo a mercadoria para não atrasar e deixo um bilhete para o supervisor.', score_rit: 2, score_dis: -2, score_res: -1 },
      { id: 102, text: 'Peço ao motorista para aguardar e procuro um responsável, mesmo gerando hora extra.', score_rit: -1, score_dis: 1, score_res: 2 },
      { id: 103, text: 'Recuso a entrada até que o supervisor autorize, mesmo que o motorista fique bravo.', score_dis: 2, score_det: 1, score_eqp: -1 },
      { id: 104, text: 'Confiro a carga física. Se bater com o pedido, libero e ignoro o erro da nota.', score_rit: 1, score_dis: -1, score_det: -2 }
    ]
  },
  {
    id: 2, order_index: 2, category: 'Situacional',
    text: 'Você precisa embalar 50 caixas por hora. Na caixa 45, a fita adesiva acaba. Trocar a fita vai fazer você perder a meta.',
    options: [
      { id: 201, text: 'Passo uma camada extra da fita velha e sigo rápido para bater a meta.', score_rit: 2, score_res: -1, score_det: -2 },
      { id: 202, text: 'Paro, troco a fita e refaço a caixa, mesmo perdendo a meta.', score_rit: -1, score_res: 1, score_det: 2 },
      { id: 203, text: 'Deixo essa caixa de lado para arrumar no fim do dia e continuo as próximas.', score_rit: 1, score_dis: 1, score_det: -1 },
      { id: 204, text: 'Peço fita emprestada ao colega do lado sem parar, mesmo atrapalhando ele.', score_rit: 1, score_res: 1, score_eqp: -2 }
    ]
  },
  {
    id: 3, order_index: 3, category: 'Situacional',
    text: 'O procedimento diz que é obrigatório usar luvas, mas elas fazem a mão suar e escorregar, atrasando o serviço. O supervisor saiu.',
    options: [
      { id: 301, text: 'Tiro as luvas para trabalhar mais rápido, mas coloco se vir o supervisor.', score_rit: 2, score_dis: -2, score_res: -1 },
      { id: 302, text: 'Continuo com as luvas, mesmo produzindo menos. Regra é regra.', score_rit: -2, score_dis: 2, score_res: 1 },
      { id: 303, text: 'Paro o serviço e vou procurar um par de luvas melhor ou talco.', score_rit: -2, score_dis: 1, score_res: 1 },
      { id: 304, text: 'Tiro as luvas apenas nas partes mais difíceis e coloco nas fáceis.', score_rit: 1, score_dis: -1, score_det: 1 }
    ]
  },
  {
    id: 4, order_index: 4, category: 'Situacional',
    text: 'Você recebe um lote do setor anterior com 10% das peças com defeito. Devolver vai parar a linha toda.',
    options: [
      { id: 401, text: 'Separo as peças com defeito num canto, processo as boas e aviso depois.', score_rit: 1, score_res: 1 },
      { id: 402, text: 'Paro a linha e devolvo o lote inteiro. Não vou assumir erro dos outros.', score_dis: 2, score_det: 2, score_eqp: -2 },
      { id: 403, text: 'Tento consertar os defeitos rapidamente enquanto trabalho para ninguém perceber.', score_det: -1, score_eqp: 2 },
      { id: 404, text: 'Processo tudo junto. O controle de qualidade final é que tem de ver isso.', score_rit: 2, score_res: -2, score_det: -2 }
    ]
  },
  {
    id: 5, order_index: 5, category: 'Situacional',
    text: 'Sexta-feira, faltam 5 min para sair. Chega um pedido urgente de 40 min. A empresa paga hora extra.',
    options: [
      { id: 501, text: 'Fico e faço. Dinheiro extra é bom e a empresa precisa.', score_dis: 1, score_res: 2, score_eqp: 1 },
      { id: 502, text: 'Explico que tenho compromisso e passo a bola para o colega do próximo turno.', score_res: -1 },
      { id: 503, text: 'Faço correndo em 20 min, mesmo que fique meio desorganizado, para sair logo.', score_rit: 2, score_det: -2 },
      { id: 504, text: 'Só fico se o supervisor mandar. Se pedir "por favor", eu vou embora.', score_dis: -1, score_eqp: -1 }
    ]
  },
  {
    id: 6, order_index: 6, category: 'Situacional',
    text: 'Dia fraco. Supervisor pede para "varrer o estoque" para passar o tempo. O chão já parece limpo.',
    options: [
      { id: 601, text: 'Varro bem devagar para a hora passar.', score_rit: -2, score_dis: -1 },
      { id: 602, text: 'Varro rápido e depois pergunto se posso adiantar o serviço de amanhã.', score_rit: 2, score_res: 2, score_rot: -1 },
      { id: 603, text: 'Aproveito para organizar as prateleiras bagunçadas, já que varrer não precisa.', score_dis: -1, score_res: 2, score_det: 1 },
      { id: 604, text: 'Faço exatamente o que foi pedido. Se mandou varrer, eu varro.', score_dis: 2, score_rot: 2 }
    ]
  },
  {
    id: 7, order_index: 7, category: 'Situacional',
    text: 'Um motorista externo grita com você porque a nota está demorando. Ele ameaça reclamar com seu patrão.',
    options: [
      { id: 701, text: 'Grito de volta. Ninguém me falta ao respeito.', score_dis: -2 },
      { id: 702, text: 'Ignoro totalmente e continuo trabalhando no meu ritmo normal.', score_eqp: -1, score_rot: 1 },
      { id: 703, text: 'Explico com calma que o sistema é assim e tento agilizar o que posso.', score_rit: 1, score_dis: 1, score_res: 1 },
      { id: 704, text: 'Libero a carga sem conferir tudo só para ele calar a boca.', score_rit: 1, score_res: -2, score_det: -2 }
    ]
  },
  {
    id: 8, order_index: 8, category: 'Situacional',
    text: 'Você perdeu o estilete da empresa. Sabe que se avisar vai levar uma advertência.',
    options: [
      { id: 801, text: 'Pego o de outro setor quando ninguém estiver vendo.', score_res: -2, score_eqp: -2 },
      { id: 802, text: 'Trago um de casa amanhã e finjo que é o da empresa.', score_dis: -1, score_res: 1 },
      { id: 803, text: 'Aviso o supervisor e peço outro, assumindo o erro.', score_dis: 1, score_res: 2 },
      { id: 804, text: 'Trabalho sem ele, improvisando com uma chave.', score_rit: -1, score_dis: -1, score_det: -1 }
    ]
  },
  // --- BLOCO B: PERFIL ---
  {
    id: 9, order_index: 9, category: 'Perfil',
    text: 'Prefiro um trabalho onde eu faça a mesma tarefa repetitiva e vire especialista nela, do que mudar toda hora.',
    options: [
      { id: 901, text: 'Discordo Totalmente', score_rot: -2 },
      { id: 902, text: 'Concordo Totalmente', score_rot: 2 },
      { id: 903, text: 'Neutro', score_rot: 0 }
    ]
  },
  {
    id: 10, order_index: 10, category: 'Perfil',
    text: 'Se vejo uma etiqueta torta ou caixa mal empilhada, aquilo me incomoda até eu arrumar.',
    options: [
      { id: 1001, text: 'Discordo Totalmente', score_rit: 1, score_det: -2 },
      { id: 1002, text: 'Concordo Totalmente', score_rit: -1, score_det: 2 },
      { id: 1003, text: 'Neutro', score_det: 0 }
    ]
  },
  {
    id: 11, order_index: 11, category: 'Perfil',
    text: 'Se uma regra de segurança atrapalha minha velocidade e ninguém vê, prefiro ignorar para produzir mais.',
    options: [
      { id: 1101, text: 'Discordo Totalmente', score_rit: -1, score_dis: 2, score_res: 1 },
      { id: 1102, text: 'Concordo Totalmente', score_rit: 2, score_dis: -2, score_res: -1 },
      { id: 1103, text: 'Depende da situação', score_rit: 1, score_dis: -1 }
    ]
  },
  {
    id: 12, order_index: 12, category: 'Perfil',
    text: 'Não me importo de ficar em pé 8 horas ou carregar peso se o ambiente for organizado.',
    options: [
      { id: 1201, text: 'Discordo Totalmente', score_rot: -2 },
      { id: 1202, text: 'Concordo Totalmente', score_rot: 2 },
      { id: 1203, text: 'Neutro', score_rot: 0 }
    ]
  },
  {
    id: 13, order_index: 13, category: 'Perfil',
    text: 'Prefiro trabalhar sozinho com fones de ouvido do que em grupo conversando.',
    options: [
      { id: 1301, text: 'Concordo (Prefiro sozinho)', score_rit: 1, score_det: 1, score_eqp: -2 },
      { id: 1302, text: 'Discordo (Prefiro grupo)', score_rit: -1, score_eqp: 2 },
      { id: 1303, text: 'Tanto faz', score_eqp: 0 }
    ]
  },
  {
    id: 14, order_index: 14, category: 'Perfil',
    text: 'Prefiro ganhar por produção (quanto mais faço, mais ganho) do que salário fixo.',
    options: [
      { id: 1401, text: 'Concordo (Produção)', score_rit: 2 },
      { id: 1402, text: 'Discordo (Fixo)', score_rit: -1, score_rot: 1 },
      { id: 1403, text: 'Tanto faz', score_rit: 0 }
    ]
  },
  {
    id: 15, order_index: 15, category: 'Perfil',
    text: 'Quando erro, prefiro consertar sozinho antes que alguém veja, do que avisar o chefe.',
    options: [
      { id: 1501, text: 'Concordo', score_dis: -1, score_res: 1 },
      { id: 1502, text: 'Discordo (Aviso sempre)', score_dis: 1 }
    ]
  },
  {
    id: 16, order_index: 16, category: 'Perfil',
    text: 'Acredito que a maioria dos acidentes de trabalho acontece por descuido do funcionário, não azar.',
    options: [
      { id: 1601, text: 'Concordo', score_dis: 1, score_res: 1 },
      { id: 1602, text: 'Discordo', score_dis: -1, score_res: -1 }
    ]
  },
  {
    id: 17, order_index: 17, category: 'Perfil',
    text: 'Fico estressado se tiver que fazer duas coisas ao mesmo tempo.',
    options: [
      { id: 1701, text: 'Concordo', score_rit: -1, score_det: 1 },
      { id: 1702, text: 'Discordo', score_rit: 1, score_det: -1 }
    ]
  },
  {
    id: 18, order_index: 18, category: 'Perfil',
    text: 'Se um colega pede ajuda, paro o que estou fazendo na hora, mesmo que eu me atrase.',
    options: [
      { id: 1801, text: 'Concordo', score_rit: -1, score_eqp: 2 },
      { id: 1802, text: 'Discordo', score_rit: 1, score_eqp: -1 }
    ]
  },
  // --- BLOCO C: LÓGICA E ATENÇÃO ---
  {
    id: 19, order_index: 19, category: 'Logica',
    text: 'Código correto: XJ-909-L. Qual das opções abaixo está ERRADA?',
    options: [
      { id: 1901, text: 'XJ-909-L', score_det: -1 },
      { id: 1902, text: 'XJ-906-L', score_det: 2 },
      { id: 1903, text: 'XJ-909-L', score_det: -1 }
    ]
  },
  {
    id: 20, order_index: 20, category: 'Logica',
    text: 'Qual a ordem correta para empilhar: Sabão (Pesado), Batatas (Médio), Ovos (Leve)?',
    options: [
      { id: 2001, text: 'Ovos, Batatas, Sabão', score_det: -2 },
      { id: 2002, text: 'Sabão, Batatas, Ovos', score_det: 2 },
      { id: 2003, text: 'Sabão, Ovos, Batatas', score_det: -2 }
    ]
  },
  {
    id: 21, order_index: 21, category: 'Logica',
    text: 'Uma caixa grande leva 4 médias. Cada média leva 10 produtos. Quantos produtos na caixa grande?',
    options: [
      { id: 2101, text: '14', score_det: -1 },
      { id: 2102, text: '40', score_det: 1, score_rit: 1 },
      { id: 2103, text: '44', score_det: -1 }
    ]
  },
  {
    id: 22, order_index: 22, category: 'Logica',
    text: 'Sequência de entrega: Segunda, Quarta, Sexta... Qual o próximo dia?',
    options: [
      { id: 2201, text: 'Sábado', score_det: -1 },
      { id: 2202, text: 'Terça', score_det: -1 },
      { id: 2203, text: 'Domingo', score_det: 1 }
    ]
  },
  // --- BLOCO D: ESTRATÉGICA ---
  {
    id: 23, order_index: 23, category: 'Estrategica',
    text: 'Um chefe manda fazer de um jeito. Outro chefe chega depois e manda fazer o contrário. O que faz?',
    options: [
      { id: 2301, text: 'Faço o que o último mandou.', score_dis: -1, score_res: -1 },
      { id: 2302, text: 'Coloco os dois para conversar ou aviso o segundo do pedido do primeiro.', score_dis: 2, score_res: 1 },
      { id: 2303, text: 'Fico estressado e reclamo com colegas.', score_dis: -1, score_eqp: -1 }
    ]
  },
  {
    id: 24, order_index: 24, category: 'Estrategica',
    text: 'Imagine colocar a mesma tampa em 2.000 garrafas todo dia. Como não errar?',
    options: [
      { id: 2401, text: 'Ouço música e penso na vida para o tempo passar.', score_dis: -1, score_det: -1 },
      { id: 2402, text: 'Crio metas por hora e confiro a cada 100 garrafas.', score_rit: 1, score_dis: 1, score_rot: 2, score_det: 1 },
      { id: 2403, text: 'Converso com o colega do lado.', score_det: -1, score_eqp: 1 }
    ]
  },
  {
    id: 25, order_index: 25, category: 'Estrategica',
    text: 'Você acha uma caneta da empresa no seu bolso ao chegar em casa. O que faz?',
    options: [
      { id: 2501, text: 'Devolvo no dia seguinte.', score_dis: 1, score_res: 2 },
      { id: 2502, text: 'Fico com ela, é só uma caneta barata.', score_dis: -1, score_res: -1 },
      { id: 2503, text: 'Jogo fora para não dar problema.', score_res: -1 }
    ]
  }
];

export default function Home() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    // Carrega TODAS as 25 perguntas instantaneamente
    setQuestions(FULL_QUESTIONS);
  }, []);

  const handleSelect = (questionId: number, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateScore = () => {
    let scores = { dis: 0, rot: 0, res: 0, det: 0, rit: 0, eqp: 0 };
    
    // Soma os pontos
    Object.values(answers).forEach((opt: any) => {
      scores.dis += opt.score_dis || 0;
      scores.rot += opt.score_rot || 0;
      scores.res += opt.score_res || 0;
      scores.det += opt.score_det || 0;
      scores.rit += opt.score_rit || 0;
      scores.eqp += opt.score_eqp || 0;
    });

    // Pesos (Displina, Rotina, Resiliência, Detalhe, Ritmo, Equipe)
    const weights = { dis: 3, rot: 3, res: 2, det: 2, rit: 1.5, eqp: 1 };
    
    // Simulação do cálculo de porcentagem ponderado
    let totalScore = 0;
    let maxTheoretical = 0; // Usado para estimar o 100%

    Object.keys(weights).forEach((trait) => {
       const k = trait as keyof typeof scores;
       const weight = weights[k];
       const val = scores[k];

       // Normalização simples: Imaginamos que 10 a 15 pontos é o "máximo saudável" por traço
       // Se o candidato fizer muitos pontos positivos, sobe a %. Se fizer negativos, desce.
       totalScore += (val * weight);
    });

    // Fórmula ajustada para o MVP: Base 50% + Pontos
    // (Pontuações negativas derrubam a nota, positivas sobem)
    let percentage = 50 + (totalScore * 1.5); 

    // Travas de segurança (para não dar menos de 0 nem mais de 100)
    if (percentage > 98) percentage = 99;
    if (percentage < 10) percentage = 15;

    setResult({ percentage: Math.round(percentage), details: scores });
    
    // Rola a tela para o resultado
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">Teste de Seleção</h1>
        <p className="text-center text-gray-500 mb-4">Cargo: Auxiliar de Estoque</p>
        
        <div className="bg-blue-50 p-3 text-sm text-center text-blue-800 mb-8 rounded border border-blue-200">
          📝 <strong>Instruções:</strong> Responda todas as 25 perguntas com honestidade.
        </div>
        
        {questions.map((q) => (
          <div key={q.id} className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
               <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded mr-3">
                 {q.category.toUpperCase()}
               </span>
               <h2 className="text-lg font-bold text-gray-800">
                Questão {q.order_index}
              </h2>
            </div>
            
            <p className="text-gray-700 mb-4 font-medium">{q.text}</p>
            
            <div className="space-y-3">
              {q.options?.map((opt: any) => (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-3 border rounded cursor-pointer transition-all duration-200
                    ${answers[q.id]?.id === opt.id 
                      ? 'bg-blue-50 border-blue-500 shadow-inner' 
                      : 'hover:bg-gray-50 border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="mr-3 h-4 w-4 text-blue-600 accent-blue-600"
                    onChange={() => handleSelect(q.id, opt)}
                  />
                  <span className="text-gray-700 text-sm">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <div className="sticky bottom-4 pt-4">
            <button
            onClick={calculateScore}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg text-lg"
            >
            FINALIZAR TESTE E VER RESULTADO
            </button>
        </div>

        {result && (
          <div className="mt-8 p-8 bg-white border-2 border-green-500 rounded-xl text-center shadow-2xl animate-fade-in mb-10">
            <h2 className="text-4xl font-extrabold text-green-700 mb-2">{result.percentage}% Compatível</h2>
            <p className="text-gray-500 mb-6">Resultado preliminar baseado nas respostas fornecidas.</p>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div 
                className="bg-green-600 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${result.percentage}%` }}
              ></div>
            </div>

            <div className="bg-gray-50 p-4 rounded text-left text-xs font-mono text-gray-600 overflow-x-auto">
              <strong>Debug (Pontos Brutos):</strong> {JSON.stringify(result.details)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}