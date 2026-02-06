'use client';
import { useState } from 'react';
// NÃO importamos mais o supabase aqui. O navegador não toca mais no banco.

const FULL_QUESTIONS = [
  { id: 1, order_index: 1, category: 'Situacional', text: 'Faltam 10 minutos para o fim do turno. Um caminhão chega com nota errada. O que faz?', options: [{ id: 101, text: 'Recebo para não atrasar e deixo bilhete.', score_rit: 2, score_dis: -2 }, { id: 102, text: 'Peço para aguardar e procuro responsável.', score_res: 2 }, { id: 103, text: 'Recuso a entrada até autorização.', score_dis: 2 }, { id: 104, text: 'Confiro a carga física e libero.', score_det: -2 }] },
  { id: 2, order_index: 2, category: 'Situacional', text: 'A fita adesiva acaba no meio da meta. O que faz?', options: [{ id: 201, text: 'Passo fita velha e sigo.', score_rit: 2 }, { id: 202, text: 'Paro e troco.', score_det: 2 }, { id: 203, text: 'Deixo de lado.', score_dis: 1 }, { id: 204, text: 'Peço emprestado.', score_eqp: -1 }] },
  { id: 3, order_index: 3, category: 'Situacional', text: 'Lote com defeito. Devolver para a linha?', options: [{ id: 401, text: 'Separo e aviso.', score_res: 1 }, { id: 402, text: 'Devolvo tudo.', score_dis: 2 }, { id: 403, text: 'Conserto rápido.', score_eqp: 2 }, { id: 404, text: 'Processo junto.', score_rit: 2 }] },
  { id: 4, order_index: 4, category: 'Perfil', text: 'Prefiro tarefa repetitiva para virar especialista.', options: [{ id: 901, text: 'Discordo', score_rot: -2 }, { id: 902, text: 'Concordo', score_rot: 2 }, { id: 903, text: 'Neutro', score_rot: 0 }] },
  { id: 5, order_index: 5, category: 'Lógica', text: 'Sequência: Seg, Qua, Sex... Próximo?', options: [{ id: 2201, text: 'Sábado', score_det: -1 }, { id: 2202, text: 'Domingo', score_det: 1 }, { id: 2203, text: 'Terça', score_det: -1 }] }
];

export default function Home() {
  const [questions] = useState<any[]>(FULL_QUESTIONS);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [result, setResult] = useState<any>(null);
  
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelect = (questionId: number, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateAndSave = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert("⚠️ Preencha NOME e EMAIL!");
      return;
    }

    // Calcula nota (simplificado)
    let scores = { dis: 0, rot: 0, res: 0, det: 0, rit: 0, eqp: 0 };
    Object.values(answers).forEach((opt: any) => {
      scores.dis += opt.score_dis || 0; 
      scores.rot += opt.score_rot || 0;
      scores.res += opt.score_res || 0; 
      scores.det += opt.score_det || 0;
      scores.rit += opt.score_rit || 0; 
      scores.eqp += opt.score_eqp || 0;
    });

    // Simulação da nota para o teste
    const finalScore = 50 + (scores.res * 2); 

    setResult({ percentage: finalScore, details: scores });
    setSavingStatus('saving');
    setErrorMsg('');

    try {
      console.log("Enviando para o Túnel API...");

      // AQUI ESTÁ A MÁGICA: Chamamos a nossa própria API, não o Supabase direto
      const response = await fetch('/api/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: candidateName,
          email: candidateEmail,
          score: finalScore,
          details: scores
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na resposta da API');
      }
      
      setSavingStatus('success');

    } catch (err: any) {
      console.error("Erro no envio:", err);
      setErrorMsg(err.message || "Erro desconhecido");
      setSavingStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">Teste (Via Túnel API)</h1>
        
        <div className="bg-white p-6 rounded-lg mb-8 shadow border-l-4 border-purple-500">
          <label className="block font-bold">Nome</label>
          <input className="w-full p-2 border rounded mb-4" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
          <label className="block font-bold">Email</label>
          <input className="w-full p-2 border rounded" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} />
        </div>

        {questions.map((q) => (
          <div key={q.id} className="mb-4 p-4 bg-white rounded shadow-sm">
             <h3 className="font-bold">{q.text}</h3>
             <div className="flex gap-2 mt-2">
                {q.options.map((opt:any) => (
                    <button key={opt.id} onClick={() => handleSelect(q.id, opt)}
                    className={`p-2 border rounded ${answers[q.id]?.id === opt.id ? 'bg-blue-100 border-blue-500' : ''}`}>
                        {opt.text}
                    </button>
                ))}
             </div>
          </div>
        ))}

        <button onClick={calculateAndSave} className="w-full py-4 bg-purple-600 text-white font-bold rounded mt-4">
          {savingStatus === 'saving' ? 'Enviando...' : 'ENVIAR VIA TÚNEL'}
        </button>

        {savingStatus === 'error' && (
          <div className="mt-4 p-4 bg-red-100 text-red-900 border border-red-300 rounded">
            ❌ Erro: {errorMsg}
          </div>
        )}

        {savingStatus === 'success' && (
          <div className="mt-4 p-4 bg-green-100 text-green-900 border border-green-300 rounded font-bold text-center">
            ✅ SUCESSO! DADO SALVO NO BANCO!
          </div>
        )}
      </div>
    </div>
  );
}