'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; 
import { salvarCandidato } from '../actions'; 
import { QUESTIONS_DB } from '../questions'; 

// --- TIPO DE DADOS ---
type TraitScores = {
  disciplina?: number;
  detalhe?: number;
  responsabilidade?: number;
  ritmo?: number;
  equipe?: number;
  rotina?: number;
  resiliencia?: number;
  proatividade?: number;
  honestidade?: number;
  resolucao?: number;
  autonomia?: number;
  flexibilidade?: number;
  atitude?: number;
  negociacao?: number;
  empatia?: number;
  clima?: number;
  organizacao?: number;
  esforco?: number;
  seguranca?: number;
  vendas?: number;
  lealdade?: number;
  inteligencia?: number;
  lideranca?: number;
  bom_senso?: number;
  postura?: number;
  processos?: number;
  foco?: number;
  etica?: number;
  inovacao?: number;
  atencao?: number;
  paciencia?: number;
  visao_dono?: number;
  interesse?: number;
  omissao?: number;
  confianca?: number;
  conhecimento?: number;
  longo_prazo?: number;
  qualidade?: number;
  autoestima?: number;
  ousadia?: number;
  comunicacao?: number;
  fofoca?: number;
  construtividade?: number;
  controle?: number;
  calma?: number;
  persistencia?: number;
  gratidao?: number;
  generosidade?: number;
  transparencia?: number;
  capricho?: number;
  dependencia?: number;
  gestao_tempo?: number;
  educacao?: number;
  visao_curta?: number;
  roubo?: number;
  argumentacao?: number;
  passividade?: number;
  humildade?: number;
  preguiça?: number;
  comprometimento?: number;
};

// --- COMPONENTE PRINCIPAL ---
export default function Home() {
  const params = useParams(); // Pega os dados da URL
  // Garante que o slug é uma string (evita erro de array)
  const empresaSlug = Array.isArray(params?.empresa) ? params.empresa[0] : params?.empresa;

  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Se não tiver slug na URL
  if (!empresaSlug) {
      return <div className="p-10 text-center text-red-500 font-bold">Erro: Nenhuma empresa especificada na URL.</div>;
  }

  const handleSelect = (questionId: number, option: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    
    setTimeout(() => {
        // Correção para não passar do limite
        if (currentQuestionIndex < QUESTIONS_DB.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    }, 250);
  };

  const finishTest = async () => {
    setStatus('saving');

    // 1. Cálculo de Pontos
    let traitTotals: Record<string, number> = {};

    Object.values(answers).forEach((ans: any) => {
        const scores = ans.scores as TraitScores;
        Object.entries(scores).forEach(([trait, value]) => {
            // @ts-ignore
            traitTotals[trait] = (traitTotals[trait] || 0) + (value as number);
        });
    });

    // 2. Montar Payload
    const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        raw_answers: answers,
        final_scores: traitTotals,
        role_target: 'Vendedor / Atendente', // Ajustado para Comércio Mix
        created_at: new Date().toISOString()
    };

    // 3. Enviar (AGORA PASSANDO O SLUG DA EMPRESA)
    const result = await salvarCandidato(payload, empresaSlug);

    if (result.success) {
        setStatus('success');
        setStep('result');
    } else {
        setStatus('error');
        setErrorMsg(result.message || 'Erro desconhecido');
    }
  };

  // --- RENDERIZAÇÃO ---
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-8 border-blue-600">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Avaliação de Perfil</h1>
          <p className="text-sm text-gray-400 mb-6 uppercase tracking-wider font-bold">Vaga na: {empresaSlug}</p>
          
          <div className="space-y-4">
            <input 
              placeholder="Nome Completo" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-black"
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
            <input 
              placeholder="Email" 
              type="email"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition text-black"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
            <input 
              placeholder="WhatsApp / Celular" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-blue-500 transition text-black"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
            
            <button 
              onClick={() => setStep('test')}
              disabled={!formData.name || !formData.email}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              COMEÇAR AVALIAÇÃO
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Obrigado, {formData.name.split(' ')[0]}!</h2>
          <p className="text-gray-500 mt-4 text-lg">Sua candidatura para <b>{empresaSlug}</b> foi enviada!</p>
        </div>
      </div>
    );
  }

  // --- CÓDIGO DAS PERGUNTAS (COM SEGURANÇA) ---
  const question = QUESTIONS_DB[currentQuestionIndex];
  
  if (!question) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
           <h2 className="text-xl font-bold">Carregando Pergunta...</h2>
           <button onClick={() => window.location.reload()} className="mt-4 text-blue-500 underline">Recarregar</button>
        </div>
     );
  }

  const progress = ((currentQuestionIndex + 1) / QUESTIONS_DB.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Questão {currentQuestionIndex + 1}/{QUESTIONS_DB.length}</span>
        <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="max-w-3xl w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 leading-tight">
                {question.text}
            </h2>

            <div className="grid gap-4">
                {question.options.map((opt, index) => {
                    const isSelected = answers[question.id]?.id === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => handleSelect(question.id, opt)}
                            className={`
                                w-full text-left p-6 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
                                ${isSelected 
                                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-200' 
                                    : 'border-white bg-white shadow-sm hover:border-blue-300 hover:shadow-md'}
                            `}
                        >
                            <div className="relative z-10 flex items-center">
                                <div className={`
                                    w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors
                                    ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 text-gray-300 group-hover:border-blue-400'}
                                `}>
                                    {isSelected ? '✓' : String.fromCharCode(65 + index)}
                                </div>
                                <span className={`text-lg ${isSelected ? 'text-blue-900 font-semibold' : 'text-gray-700'}`}>
                                    {opt.text}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {currentQuestionIndex === QUESTIONS_DB.length - 1 && (
                <div className="mt-8 text-center">
                    <button 
                        onClick={finishTest}
                        disabled={!answers[question.id] || status === 'saving'}
                        className="bg-green-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'saving' ? 'ENVIANDO...' : 'FINALIZAR AVALIAÇÃO'}
                    </button>
                    {status === 'error' && <p className="text-red-500 mt-2 font-bold">{errorMsg}</p>}
                </div>
            )}
        </div>
      </div>
    </div>
  );
}