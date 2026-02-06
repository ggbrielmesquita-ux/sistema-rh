'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

// === DADOS DAS PERGUNTAS ===
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
  
  // ESTADO NOVO PARA MOSTRAR O ERRO REAL
  const [errorMsg, setErrorMsg] = useState('');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSelect = (questionId: number, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateAndSave = async () => {
    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert("⚠️ Preencha NOME e EMAIL!");
      return;
    }

    // Cálculo simplificado
    let scores = { dis: 0, rot: 0, res: 0, det: 0, rit: 0, eqp: 0 };
    Object.values(answers).forEach((opt: any) => {
      scores.dis += opt.score_dis || 0;
      // ... (outros scores)
    });
    
    // Simula pontuação só para testar
    const finalScore = 50; 
    setResult({ percentage: finalScore, details: scores });
    setSavingStatus('saving');
    setErrorMsg(''); // Limpa erro anterior

    try {
      console.log("Tentando salvar...");
      
      const { error } = await supabase
        .from('candidates')
        .insert([{ 
            name: candidateName, 
            email: candidateEmail, 
            score: finalScore, 
            details: scores 
        }]);

      if (error) throw error;
      
      setSavingStatus('success');

    } catch (err: any) {
      console.error("Erro capturado:", err);
      // AQUI ESTÁ O SEGREDO: Pega a mensagem do erro e salva
      setErrorMsg(err.message || JSON.stringify(err));
      setSavingStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        {/* TÍTULO PARA CONFIRMAR VERSÃO */}
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">Versão de Teste (Erro Visível)</h1>
        
        <div className="bg-white p-6 rounded-lg mb-8 shadow">
          <label className="block font-bold">Nome</label>
          <input className="w-full p-2 border rounded mb-4" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
          <label className="block font-bold">Email</label>
          <input className="w-full p-2 border rounded" value={candidateEmail} onChange={e => setCandidateEmail(e.target.value)} />
        </div>

        <button onClick={calculateAndSave} className="w-full py-4 bg-blue-600 text-white font-bold rounded">
          {savingStatus === 'saving' ? 'Salvando...' : 'ENVIAR AGORA'}
        </button>

        {savingStatus === 'error' && (
          <div className="mt-8 p-6 bg-red-100 border-2 border-red-500 rounded-xl text-center text-red-900">
            <h3 className="text-xl font-bold mb-2">❌ Deu Erro! Me mande o print disso:</h3>
            <p className="text-lg font-mono bg-white p-2 rounded border border-red-200">
              {errorMsg || "Erro desconhecido (sem mensagem)"}
            </p>
          </div>
        )}

        {savingStatus === 'success' && (
          <div className="mt-8 p-6 bg-green-100 border-2 border-green-500 rounded text-center">
            <h3 className="text-xl font-bold text-green-800">✅ SUCESSO!</h3>
          </div>
        )}
      </div>
    </div>
  );
}