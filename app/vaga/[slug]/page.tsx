"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
// Importa as ações Server-Side da IA
import { analisarPerfilIA } from '../../actions/analisarCandidato'; 
import { QUESTIONS_DB } from '../../questions'; 
import { CheckCircle, AlertTriangle, User, Phone, Loader2 } from 'lucide-react';

export default function VagaPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Novo estado para loading do envio
  const [job, setJob] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function loadJob() {
      if (!params.slug) return;
      try {
        const q = query(collection(db, "jobs"), where("slug", "==", params.slug));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const jobData = querySnapshot.docs[0].data();
          setJob({ id: querySnapshot.docs[0].id, ...jobData });
          
          // Se a vaga tem perguntas da IA, usa elas. Se não, usa as fixas.
          if (jobData.questions && jobData.questions.length > 0) {
            setQuestions(jobData.questions);
          } else {
            setQuestions(QUESTIONS_DB);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar vaga", error);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [params.slug]);

  const handleOptionSelect = (questionId: number, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (!name || !whatsapp) return alert("Preencha seus dados!");
    if (Object.keys(answers).length < questions.length) return alert("Responda todas as perguntas!");

    setSubmitting(true); // Começa o loading de análise

    try {
      // 1. CÁLCULO MATEMÁTICO (Simples, para ordenação na tabela)
      // Aqui somamos pontos se as perguntas tiverem 'scores' (vindo da IA ou do fixo)
      let totalPoints = 0;
      let maxPoints = 0;

      questions.forEach(q => {
          const selectedOpt = q.options.find((o:any) => o.id === answers[q.id]);
          if (selectedOpt && selectedOpt.scores) {
              // Soma todos os valores positivos como "acertos" para simplificar a %
              const values = Object.values(selectedOpt.scores) as number[];
              const optionScore = values.reduce((a, b) => a + b, 0);
              if (optionScore > 0) totalPoints += optionScore;
          }
          maxPoints += 3; // Média de 3 pontos por questão
      });

      const percentage = Math.min(100, Math.max(0, Math.round((totalPoints / maxPoints) * 100)));

      // 2. ANÁLISE DE IA (O Pulo do Gato)
      // Chamamos a função que criamos no passo anterior para gerar o texto
      const analiseIA = await analisarPerfilIA(job.title, answers, questions);

      // 3. SALVAR NO FIREBASE
      await addDoc(collection(db, "candidates"), {
        name,
        whatsapp,
        jobId: job.id,
        jobTitle: job.title,
        answers, // O que ele marcou (IDs)
        score: percentage, // Nota 0-100 para a tabela
        profileResult: analiseIA, // O Relatório da IA (Veredito, Pontos Fortes/Fracos)
        createdAt: new Date().toISOString()
      });

      setCompleted(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar teste. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Carregando teste...</div>;
  if (!job) return <div className="min-h-screen flex items-center justify-center text-red-500">Vaga não encontrada.</div>;

  if (completed) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md border border-green-100">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Recebido!</h1>
          <p className="text-gray-600 mb-6">Suas respostas foram enviadas para a <strong>{job.companyName}</strong>.</p>
          <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 font-medium">
             Obrigado pelo seu tempo, {name.split(' ')[0]}! 
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        
        {/* Header Vaga */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
          <h1 className="text-2xl md:text-3xl font-bold relative z-10">{job.title}</h1>
          <p className="opacity-80 mt-2 text-lg relative z-10">{job.companyName}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
            <AlertTriangle size={12} className="text-yellow-400" />
            Teste de Perfil Comportamental
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Inputs do Candidato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nome Completo</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 transition">
                <User size={18} className="text-gray-400 mr-2"/>
                <input 
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent" placeholder="Seu nome"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">WhatsApp</label>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 transition">
                <Phone size={18} className="text-gray-400 mr-2"/>
                <input 
                  value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
                  className="w-full outline-none text-sm bg-transparent" placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Lista de Perguntas */}
          <div className="space-y-10">
            {questions.map((q, index) => (
              <div key={q.id || index} className="animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                <p className="font-bold text-gray-800 mb-4 text-lg leading-snug">
                  <span className="text-purple-600 font-black mr-2 text-xl">{index + 1}.</span>
                  {q.text}
                </p>
                <div className="space-y-3 pl-2 md:pl-6 border-l-2 border-gray-100">
                  {q.options.map((opt: any) => (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(q.id, opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
                        answers[q.id] === opt.id 
                          ? 'bg-purple-50 border-purple-500 shadow-md ring-1 ring-purple-500 z-10' 
                          : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative z-10 flex items-start gap-3">
                          <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${answers[q.id] === opt.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'}`}>
                              {answers[q.id] === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full"/>}
                          </div>
                          <span className={`text-sm md:text-base ${answers[q.id] === opt.id ? 'text-purple-900 font-medium' : 'text-gray-600'}`}>
                            {opt.text}
                          </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Envio com Loading */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-xl shadow-purple-600/20 transition-all transform hover:scale-[1.01] flex items-center justify-center gap-3
                ${submitting ? 'bg-purple-400 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'}
              `}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analisando Perfil...
                </>
              ) : (
                "Finalizar Teste"
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Loader2 size={10} className="animate-spin text-purple-400"/> IA analisando respostas em tempo real
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}