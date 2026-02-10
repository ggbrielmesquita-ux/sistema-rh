"use client";

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// SUAS PERGUNTAS FIXAS (BACKUP)
const PERGUNTAS_PADRAO = [
  {
    pergunta: "1. Erro no processo vs Prazo pessoal...",
    opcoes: [{ texto: "Foco nas entregas", pontuacao: 2 }, { texto: "Corrijo erro", pontuacao: 7 }] 
    // ... (Mantenha sua lista completa aqui para segurança)
  }
];

export default function VagaQuiz() {
  const { slug } = useParams();
  const [job, setJob] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]); // <--- LISTA DINÂMICA
  
  // ... (Estados de form iguais: name, whatsapp, step...)
  const [step, setStep] = useState('intro');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scoreTotal, setScoreTotal] = useState(0);
  const [respostasSalvas, setRespostasSalvas] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    const fetchJob = async () => {
       const q = query(collection(db, "jobs"), where("slug", "==", slug));
       const snap = await getDocs(q);
       if (!snap.empty) {
           const data = snap.docs[0].data();
           setJob({ id: snap.docs[0].id, ...data });
           
           // AQUI A MÁGICA: Se tiver IA, usa IA. Se não, usa Padrão.
           if (data.questions && data.questions.length > 0) {
               setQuestions(data.questions);
           } else {
               setQuestions(PERGUNTAS_PADRAO);
           }
       }
    };
    fetchJob();
  }, [slug]);

  const handleAnswer = (pontos: number, texto: string) => {
    const novoScore = scoreTotal + pontos;
    setScoreTotal(novoScore);
    setRespostasSalvas([...respostasSalvas, texto]);

    if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
    } else {
        salvar(novoScore);
    }
  };

  const salvar = async (finalScore: number) => {
      // Cálculo percentual dinâmico (baseado no nº de perguntas da IA)
      const maximo = questions.length * 10;
      const percentual = Math.round((finalScore / maximo) * 100);

      await addDoc(collection(db, "candidates"), {
          jobId: job.id,
          jobTitle: job.title,
          name, whatsapp,
          answers: respostasSalvas,
          score: percentual,
          createdAt: new Date().toISOString()
      });
      setStep('finish');
  };

  if (!job) return <div>Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
       <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white text-center">
             <h1 className="text-2xl font-bold">{job.title}</h1>
             <p>{job.companyName}</p>
          </div>
          
          <div className="p-8">
             {step === 'intro' && (
                <div>
                   {/* Inputs de Nome/Zap iguais ao seu */}
                   <input className="w-full p-3 border rounded mb-4" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
                   <input className="w-full p-3 border rounded mb-4" placeholder="WhatsApp" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                   <button onClick={() => setStep('quiz')} className="w-full bg-blue-600 text-white p-4 rounded font-bold">INICIAR TESTE IA</button>
                </div>
             )}

             {step === 'quiz' && questions.length > 0 && (
                <div>
                   <div className="mb-4 text-sm font-bold text-gray-500">Questão {currentQuestion + 1}/{questions.length}</div>
                   <h2 className="text-xl font-bold mb-6">{questions[currentQuestion].pergunta}</h2>
                   <div className="space-y-3">
                      {questions[currentQuestion].opcoes.map((opt: any, idx: number) => (
                          <button key={idx} onClick={() => handleAnswer(opt.pontuacao, opt.texto)} className="w-full text-left p-4 border rounded hover:bg-blue-50 transition">
                             {opt.texto}
                          </button>
                      ))}
                   </div>
                </div>
             )}

             {step === 'finish' && (
                <div className="text-center">
                   <h2 className="text-2xl font-bold">Pronto!</h2>
                   <p>Seus dados foram enviados.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}