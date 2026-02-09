"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; 
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function VagaPage() {
  const { slug } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enviado, setEnviado] = useState(false);

  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [phone, setPhone] = useState(""); 
  const [respostas, setRespostas] = useState<Record<number, number>>({});

  useEffect(() => {
    async function loadJob() {
      if (!slug) return;
      try {
        const q = query(collection(db, "jobs"), where("slug", "==", slug));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data();
          setJob({ id: snapshot.docs[0].id, ...docData });
        }
      } catch (error) {
        console.error("Erro ao carregar vaga:", error);
      } finally {
        setLoading(false);
      }
    }
    loadJob();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    // Calcular Score
    let totalPontos = 0;
    const values = Object.values(respostas);
    values.forEach((ponto: any) => totalPontos += Number(ponto));
    
    // Evita divisão por zero
    const maximo = (job.questions?.length || 1) * 10;
    const scoreFinal = Math.round((totalPontos / maximo) * 100);

    try {
      await addDoc(collection(db, "candidates"), {
        jobId: job.id,
        name: nome,
        phone: phone, // Salva o que foi digitado
        answers: respostas,
        score: scoreFinal || 0,
        createdAt: new Date().toISOString()
      });
      setEnviado(true);
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar. Tente novamente.");
    }
  };

  if (loading) return <div className="text-center p-10 font-bold">Carregando vaga...</div>;
  if (!job) return <div className="text-center p-10 font-bold text-red-500">Vaga não encontrada ou link quebrado.</div>;
  
  if (enviado) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-green-200">
            <h2 className="text-2xl font-bold text-green-600 mb-2">Sucesso! 🎉</h2>
            <p className="text-gray-700">Sua candidatura para <strong>{job.title}</strong> foi enviada.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        
        <div className="bg-blue-600 p-6 text-white text-center">
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="opacity-90">{job.companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {/* DADOS PESSOAIS */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-bold text-gray-800 border-b pb-2">Seus Dados</h3>
                
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo</label>
                    <input 
                        required
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Digite seu nome"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">WhatsApp / Celular</label>
                    <input 
                        required
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="(DDD) 99999-9999"
                    />
                </div>
            </div>

            {/* PERGUNTAS */}
            {job.questions && job.questions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-800">Questionário</h3>
                    {job.questions.map((q: any, index: number) => (
                        <div key={index} className="bg-white p-4 border rounded-lg shadow-sm">
                            <p className="font-medium text-gray-900 mb-3">{index + 1}. {q.pergunta}</p>
                            <div className="space-y-2">
                                {q.opcoes.map((opt: any, optIndex: number) => (
                                    <label key={optIndex} className="flex items-center gap-3 p-2 hover:bg-blue-50 rounded cursor-pointer border border-transparent hover:border-blue-100 transition">
                                        <input 
                                            type="radio" 
                                            name={`q-${index}`} 
                                            required
                                            className="w-4 h-4 text-blue-600"
                                            onChange={() => setRespostas(prev => ({...prev, [index]: opt.pontuacao}))}
                                        />
                                        <span className="text-sm text-gray-700">{opt.texto}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg text-lg transition">
                Enviar Candidatura
            </button>
        </form>
      </div>
    </div>
  );
}