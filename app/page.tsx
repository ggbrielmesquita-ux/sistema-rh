'use client';

import { useState } from 'react';
import { QUESTIONS_DB } from './questions';
import { calculateProfile } from './utils/scoring';
import { saveCandidateResult } from './utils/fakeDb';

export default function CandidateQuiz() {
  // Estados
  const [candidateName, setCandidateName] = useState('');
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [finished, setFinished] = useState(false);

  const currentQuestion = QUESTIONS_DB[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUESTIONS_DB.length) * 100;

  // Começar o teste
  const handleStart = () => {
    if (candidateName.trim().length > 2) {
      setStarted(true);
    } else {
      alert("Por favor, digite seu nome completo.");
    }
  };

  // Responder pergunta
  const handleOptionSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (currentQuestionIndex < QUESTIONS_DB.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newAnswers);
    }
  };

  // Finalizar e Salvar
  const finishQuiz = (finalAnswers: Record<number, string>) => {
    // 1. Calcula o perfil (Internamente)
    const finalProfile = calculateProfile(finalAnswers);
    
    // 2. Salva no "Banco de Dados" para o Admin ver depois
    saveCandidateResult(candidateName, finalProfile);

    // 3. Mostra tela de agradecimento
    setFinished(true);
  };

  // --- TELA 1: IDENTIFICAÇÃO ---
  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Processo Seletivo</h1>
          <p className="text-gray-500 mb-6">Vaga: Vendedor Interno / Atendimento</p>
          
          <input
            type="text"
            placeholder="Digite seu Nome Completo"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-black"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
          />
          
          <button 
            onClick={handleStart}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
          >
            Iniciar Teste
          </button>
        </div>
      </main>
    );
  }

  // --- TELA 3: FINALIZADO (O que o candidato vê) ---
  if (finished) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-lg bg-white p-10 rounded-xl shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Teste Finalizado!</h2>
          <p className="text-gray-600 text-lg mb-6">
            Obrigado, <strong>{candidateName}</strong>. Suas respostas foram registradas com sucesso em nosso sistema.
          </p>
          <p className="text-sm text-gray-400">
            Nossa equipe de RH analisará seu perfil e entrará em contato caso você seja selecionado para a próxima etapa.
          </p>
        </div>
      </main>
    );
  }

  // --- TELA 2: PERGUNTAS (Quiz) ---
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="w-full h-2 bg-gray-200">
          <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-8">
          <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase mb-2 block">
            Questão {currentQuestionIndex + 1} de {QUESTIONS_DB.length}
          </span>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
            {currentQuestion.text}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white font-bold">
                    {option.id.replace(/[0-9]/g, '').toUpperCase()}
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-blue-900 text-lg">
                    {option.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}