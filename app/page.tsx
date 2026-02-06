'use client';
import { useState, useEffect } from 'react';
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
  const [questions, setQuestions] = useState<any[]>(FULL_QUESTIONS);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [result, setResult] = useState<any>(null);
  
  // --- NOVOS CAMPOS (Identificação) ---
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSelect = (questionId: number, option: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const calculateAndSave = async () => {
    // 1. Validação
    if (!candidateName.trim() || !candidateEmail.trim()) {
      alert("⚠️ Por favor, preencha seu NOME e EMAIL no topo da página antes de finalizar!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. Cálculo
    let scores = { dis: 0, rot: 0, res: 0, det: 0, rit: 0, eqp: 0 };
    Object.values(answers).forEach((opt: any) => {
      scores.dis += opt.score_dis || 0;
      scores.rot += opt.score_rot || 0;
      scores.res += opt.score_res || 0;
      scores.det += opt.score_det || 0;
      scores.rit += opt.score_rit || 0;
      scores.eqp += opt.score_eqp || 0;
    });

    const weights = { dis: 3, rot: 3, res: 2, det: 2, rit: 1.5, eqp: 1 };
    let totalScore = 0;
    Object.keys(weights).forEach((k) => {
       totalScore += (scores[k as keyof typeof scores] * weights[k as keyof typeof weights]);
    });

    let percentage = 50 + (totalScore * 1.5); 
    if (percentage > 99) percentage = 99;
    if (percentage < 10) percentage = 10;
    const finalScore = Math.round(percentage);

    setResult({ percentage: finalScore, details: scores });
    setSavingStatus('saving');

    // 3. Salvamento
    try {
      console.log("Iniciando salvamento v2..."); // Log novo para confirmar atualização
      
      const { error } = await supabase
        .from('candidates')
        .insert([
          { 
            name: candidateName, 
            email: candidateEmail, 
            score: finalScore, 
            details: scores 
          }
        ]);

      if (error) throw error;
      
      setSavingStatus('success');

    } catch (err) {
      console.error("Erro ao salvar:", err);
      setSavingStatus('error');
    }

    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black font-sans">
      <div className="max-w-2xl mx-auto">
        {/* MUDANÇA VISUAL AQUI NO TÍTULO 👇 */}
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-900">Teste de Seleção (Versão Final)</h1>
        <p className="text-center text-gray-500 mb-8">Cargo: Auxiliar de Estoque</p>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 mb-8">
          <h3 className="font-bold text-gray-800 mb-4 text-lg">👤 Identificação do Candidato</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nome Completo *</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Digite seu nome..."
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email ou Telefone *</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Digite seu contato..."
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {questions.map((q) => (
          <div key={q.id} className="mb-6 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4 text-gray-800">{q.text}</h2>
            <div className="space-y-3">
              {q.options?.map((opt: any) => (
                <label 
                  key={opt.id} 
                  className={`flex items-center p-3 border rounded cursor-pointer transition-all
                    ${answers[q.id]?.id === opt.id ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="mr-3 h-4 w-4"
                    onChange={() => handleSelect(q.id, opt)}
                  />
                  <span className="text-gray-700 text-sm">{opt.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={calculateAndSave}
          disabled={savingStatus === 'saving' || savingStatus === 'success'}
          className={`w-full py-4 font-bold rounded-lg transition shadow-lg text-lg mt-4
            ${savingStatus === 'success' 
              ? 'bg-green-600 text-white cursor-default' 
              : 'bg-blue-600 text-white hover:bg-blue-700'}`}
        >
          {savingStatus === 'idle' && 'FINALIZAR E ENVIAR TESTE'}
          {savingStatus === 'saving' && 'Salvando... ⏳'}
          {savingStatus === 'success' && '✅ Sucesso! Seus dados foram enviados.'}
          {savingStatus === 'error' && '⚠️ Erro ao Salvar (Tente novamente)'}
        </button>

        {result && (
          <div className="mt-8 p-8 bg-white border-2 border-green-500 rounded-xl text-center shadow-xl animate-bounce-in mb-10">
             {savingStatus === 'error' && (
                <p className="text-red-600 font-bold mb-2">❌ Ocorreu um erro ao salvar no banco. Verifique sua conexão.</p>
             )}
            <h2 className="text-4xl font-extrabold text-green-700 mb-2">{result.percentage}% Compatível</h2>
            <p className="text-gray-500">Obrigado, {candidateName}!</p>
          </div>
        )}
      </div>
    </div>
  );
}