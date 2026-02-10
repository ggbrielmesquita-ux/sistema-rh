"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { CheckCircle, AlertTriangle, User, Phone } from 'lucide-react';

// AS 25 PERGUNTAS ORIGINAIS E DIFÍCEIS
const QUESTIONS = [
  {
    id: 1, text: "1. Você identifica um erro no processo que causa um pequeno prejuízo diário, mas corrigir vai atrasar suas entregas. O que faz?",
    options: [
      { text: "Foco nas minhas entregas para não ser cobrado.", points: 0 },
      { text: "Corrijo imediatamente, mesmo que atrase.", points: 5 },
      { text: "Aviso o superior e aguardo ordem.", points: 3 },
      { text: "Monto um plano, calculo o prejuízo e negocio prioridade.", points: 10 }
    ]
  },
  {
    id: 2, text: "2. O cliente pede uma alteração no projeto que foge do escopo inicial, mas é pequena. Você:",
    options: [
      { text: "Faço para agradar o cliente e evitar conflito.", points: 2 },
      { text: "Nego, pois não está no contrato.", points: 0 },
      { text: "Explico que foge do escopo, mas posso fazer como cortesia única se não impactar o prazo.", points: 10 },
      { text: "Cobro um valor adicional imediatamente.", points: 5 }
    ]
  },
  {
    id: 3, text: "3. Seu chefe esqueceu de te passar uma informação crucial e agora o projeto atrasou. Ele te cobra na frente de todos.",
    options: [
      { text: "Exponho que a culpa foi dele por não passar a informação.", points: 0 },
      { text: "Assumo a culpa para não gerar climão.", points: 3 },
      { text: "Foco na solução imediata e depois converso com ele em particular sobre o processo.", points: 10 },
      { text: "Ignoro e continuo trabalhando.", points: 1 }
    ]
  },
  {
    id: 4, text: "4. A empresa entra em crise e corta o café e o ar condicionado. A equipe está desmotivada.",
    options: [
      { text: "Entro na reclamação coletiva.", points: 0 },
      { text: "Continuo trabalhando quieto.", points: 5 },
      { text: "Tento animar a equipe focando que é uma fase passageira.", points: 8 },
      { text: "Proponho ideias de economia ou melhoria de receita para a direção.", points: 10 }
    ]
  },
  {
    id: 5, text: "5. Você tem uma tarefa repetitiva que toma 2 horas do seu dia.",
    options: [
      { text: "Faço ela conforme fui pago para fazer.", points: 5 },
      { text: "Tento automatizar ou criar um modelo para reduzir o tempo.", points: 10 },
      { text: "Reclamo que é chato.", points: 0 },
      { text: "Delegar para um estagiário se possível.", points: 7 }
    ]
  },
  {
    id: 6, text: "6. Um colega do seu time é muito lento e está prejudicando a meta do grupo.",
    options: [
      { text: "Reclamo dele para o gestor.", points: 2 },
      { text: "Faço a parte dele para garantir a meta.", points: 5 },
      { text: "Pergunto se ele precisa de ajuda e ensino uma forma mais rápida.", points: 10 },
      { text: "Deixo ele se afundar sozinho.", points: 0 }
    ]
  },
  {
    id: 7, text: "7. Numa reunião, dão uma ideia que você sabe que vai dar errado.",
    options: [
      { text: "Fico quieto para não ser o chato.", points: 0 },
      { text: "Falo na hora: 'Isso não vai funcionar'.", points: 3 },
      { text: "Faço perguntas estratégicas que levem eles a perceberem o erro sozinhos.", points: 10 },
      { text: "Espero dar errado para dizer 'eu avisei'.", points: 0 }
    ]
  },
  {
    id: 8, text: "8. Você recebe um feedback negativo injusto na frente da equipe.",
    options: [
      { text: "Discuto e me defendo na hora.", points: 2 },
      { text: "Choro ou fico visivelmente abalado.", points: 0 },
      { text: "Ouço, anoto e depois peço uma reunião privada para apresentar fatos.", points: 10 },
      { text: "Aceito quieto.", points: 5 }
    ]
  },
  {
    id: 9, text: "9. É sexta-feira, 17h50, tem Happy Hour marcado, mas surge uma pendência urgente.",
    options: [
      { text: "Vou pro Happy Hour, segunda eu resolvo.", points: 0 },
      { text: "Fico e resolvo, mesmo bravo.", points: 7 },
      { text: "Analiso a gravidade: se pode esperar, vou. Se não, resolvo e vou depois.", points: 10 },
      { text: "Fingo que não vi.", points: 0 }
    ]
  },
  {
    id: 10, text: "10. Você teve uma ideia brilhante, mas seu colega apresentou como se fosse dele.",
    options: [
      { text: "Desminto ele na hora.", points: 2 },
      { text: "Deixo pra lá, o importante é o resultado da empresa.", points: 5 },
      { text: "Parabenizo pela apresentação e complemento com detalhes que só quem criou sabe.", points: 10 },
      { text: "Nunca mais compartilho ideias com ele.", points: 3 }
    ]
  },
  {
    id: 11, text: "11. A meta do mês parece impossível de bater.",
    options: [
      { text: "Nem tento, já sei que não vai dar.", points: 0 },
      { text: "Faço o meu melhor, se der deu.", points: 5 },
      { text: "Quebro a meta em dias e foco no progresso diário.", points: 10 },
      { text: "Reclamo que a meta é abusiva.", points: 0 }
    ]
  },
  {
    id: 12, text: "12. O concorrente lançou um produto melhor e mais barato.",
    options: [
      { text: "Acho que a empresa vai falir.", points: 0 },
      { text: "Continuo vendendo o meu do mesmo jeito.", points: 3 },
      { text: "Estudo o concorrente e foco nos diferenciais que eles não têm (atendimento, garantia, etc).", points: 10 },
      { text: "Sugiro baixar nosso preço também.", points: 5 }
    ]
  },
  {
    id: 13, text: "13. Você se tornou o único que sabe fazer uma tarefa vital na empresa.",
    options: [
      { text: "Guardo o segredo para ser insubstituível.", points: 2 },
      { text: "Peço aumento ou ameaço sair.", points: 0 },
      { text: "Documento o processo e treino um backup para eu poder crescer.", points: 10 },
      { text: "Faço a tarefa reclamando de sobrecarga.", points: 4 }
    ]
  },
  {
    id: 14, text: "14. Sobrou verba no orçamento do seu projeto no final do ano.",
    options: [
      { text: "Gasto com qualquer coisa para não perder a verba ano que vem.", points: 2 },
      { text: "Devolvo para a empresa.", points: 8 },
      { text: "Invisto em uma melhoria que trará retorno futuro.", points: 10 },
      { text: "Uso para fazer uma festa para a equipe.", points: 5 }
    ]
  },
  {
    id: 15, text: "15. O chefe manda fazer algo que o cliente vai odiar.",
    options: [
      { text: "Faço, ele que manda.", points: 3 },
      { text: "Não faço.", points: 0 },
      { text: "Argumento com dados mostrando o risco de satisfação.", points: 10 },
      { text: "Faço e aviso o cliente 'foi meu chefe que mandou'.", points: 0 }
    ]
  },
  {
    id: 16, text: "16. Para fechar uma venda grande, você precisa omitir um detalhe negativo do produto.",
    options: [
      { text: "Omito, preciso da comissão.", points: 0 },
      { text: "Sou honesto, mesmo que perca a venda.", points: 10 },
      { text: "Falo técnico demais para ele não entender.", points: 2 },
      { text: "Foco nos positivos e rezo para ele não perguntar.", points: 5 }
    ]
  },
  {
    id: 17, text: "17. Você vê um colega levando material de escritório para casa.",
    options: [
      { text: "Não é problema meu.", points: 2 },
      { text: "Denuncio anonimamente.", points: 8 },
      { text: "Falo com ele que isso pode dar justa causa.", points: 10 },
      { text: "Começo a levar também.", points: 0 }
    ]
  },
  {
    id: 18, text: "18. O servidor caiu no fim de semana e você não está de plantão, mas sabe arrumar.",
    options: [
      { text: "Finjo que não vi, não ganho hora extra.", points: 0 },
      { text: "Arrumo e depois aviso para negociar folga.", points: 10 },
      { text: "Aviso o responsável (que vai demorar horas).", points: 5 },
      { text: "Espero segunda-feira.", points: 0 }
    ]
  },
  {
    id: 19, text: "19. A burocracia da empresa trava seu trabalho.",
    options: [
      { text: "Burlo as regras para entregar rápido.", points: 4 },
      { text: "Sigo as regras e entrego atrasado.", points: 5 },
      { text: "Proponho uma mudança oficial no processo.", points: 10 },
      { text: "Reclamo no café.", points: 0 }
    ]
  },
  {
    id: 20, text: "20. Seu chefe pede para você buscar o filho dele na escola (tarefa pessoal).",
    options: [
      { text: "Busco e fico bravo.", points: 2 },
      { text: "Nego, não sou pago para isso.", points: 5 },
      { text: "Busco dessa vez, mas converso para alinhar limites.", points: 8 },
      { text: "Aproveito para sair mais cedo do trabalho.", points: 4 }
    ]
  },
  {
    id: 21, text: "21. Se você ganhasse na loteria hoje.",
    options: [
      { text: "Sumiria sem avisar.", points: 0 },
      { text: "Pediria demissão na hora.", points: 5 },
      { text: "Cumpriria o aviso prévio ou negociaria uma saída limpa.", points: 10 },
      { text: "Investiria na empresa.", points: 8 }
    ]
  },
  {
    id: 22, text: "22. O que mais te irrita no trabalho?",
    options: [
      { text: "Fofoca e gente falsa.", points: 5 },
      { text: "Incompetência e atrasos.", points: 8 },
      { text: "Ter chefe.", points: 0 },
      { text: "Falta de processos claros.", points: 10 }
    ]
  },
  {
    id: 23, text: "23. Que tipo de reconhecimento você prefere?",
    options: [
      { text: "Dinheiro no bolso.", points: 6 },
      { text: "Elogio público.", points: 4 },
      { text: "Novos desafios e crescimento.", points: 10 },
      { text: "Folga.", points: 2 }
    ]
  },
  {
    id: 24, text: "24. Por que saiu (ou quer sair) do emprego anterior?",
    options: [
      { text: "Meu chefe era um idiota.", points: 0 },
      { text: "Ganhar mais.", points: 5 },
      { text: "Busco novos desafios e aprendizado.", points: 10 },
      { text: "A empresa estava falindo.", points: 5 }
    ]
  },
  {
    id: 25, text: "25. Por que devemos te contratar?",
    options: [
      { text: "Preciso pagar contas.", points: 0 },
      { text: "Sou muito esforçado.", points: 5 },
      { text: "Trago resultados e resolvo problemas.", points: 10 },
      { text: "Sou melhor que os outros.", points: 2 }
    ]
  }
];

export default function VagaPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [totalScore, setTotalScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!params.slug) return;
      try {
        const q = query(collection(db, "jobs"), where("slug", "==", params.slug));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setJob({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    loadJob();
  }, [params.slug]);

  const handleOptionSelect = (questionId: number, optionText: string, points: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionText }));
    // Armazena pontos temporariamente no estado (complexo) ou recalcula no final
    // Aqui vamos recalcular tudo no final para ser seguro
  };

  const handleSubmit = async () => {
    if (!name || !whatsapp) return alert("Preencha seus dados!");
    if (Object.keys(answers).length < QUESTIONS.length) return alert("Responda todas as perguntas!");

    setLoading(true);

    // CALCULAR SCORE (0 a 100%)
    let points = 0;
    QUESTIONS.forEach((q, index) => {
       const answerText = answers[q.id];
       const selectedOption = q.options.find(opt => opt.text === answerText);
       if (selectedOption) points += selectedOption.points;
    });

    const maxPoints = QUESTIONS.length * 10; // 25 * 10 = 250
    const percentage = Math.round((points / maxPoints) * 100);

    try {
      await addDoc(collection(db, "candidates"), {
        name,
        whatsapp,
        jobId: job.id,
        jobTitle: job.title,
        answers, // Salva o texto das respostas
        score: percentage,
        createdAt: new Date().toISOString()
      });
      setCompleted(true);
    } catch (error) {
      alert("Erro ao enviar.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Carregando...</div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center text-red-500">Vaga não encontrada.</div>;

  if (completed) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-2xl shadow-lg max-w-md">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sucesso!</h1>
          <p className="text-gray-600">Teste enviado com sucesso.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="bg-blue-900 p-8 text-white">
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm opacity-80">
            <AlertTriangle size={14} /> Teste Técnico e Comportamental
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
              <div className="flex items-center bg-white border rounded px-3 py-2">
                <User size={18} className="text-gray-400 mr-2"/>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full outline-none text-sm" placeholder="Seu nome"/>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">WhatsApp</label>
              <div className="flex items-center bg-white border rounded px-3 py-2">
                <Phone size={18} className="text-gray-400 mr-2"/>
                <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full outline-none text-sm" placeholder="Seu número"/>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {QUESTIONS.map((q, index) => (
              <div key={q.id}>
                <p className="font-semibold text-gray-800 mb-3 text-lg">
                  <span className="text-blue-900 font-bold mr-2">{index + 1}.</span> {q.text}
                </p>
                <div className="space-y-2 pl-4 border-l-2 border-gray-100">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(q.id, opt.text, opt.points)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        answers[q.id] === opt.text
                          ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500 text-blue-900 font-medium' 
                          : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-6 border-t">
            <button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg transition-all"
            >
              Finalizar Teste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}