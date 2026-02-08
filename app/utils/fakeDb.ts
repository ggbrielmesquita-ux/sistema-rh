// app/utils/fakeDb.ts

const CANDIDATES_KEY = 'rh_system_candidates';
const JOBS_KEY = 'rh_system_jobs';

// --- GERENCIAMENTO DE VAGAS (JOBS) ---

export const saveJob = (title: string) => {
  if (typeof window === 'undefined') return;

  const currentJobs = JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
  
  // Cria um ID curto e único para a vaga (ex: "vendas-123")
  const id = title.toLowerCase().replace(/\s/g, '-') + '-' + Math.floor(Math.random() * 1000);

  const newJob = {
    id: id,
    title: title,
    createdAt: new Date().toLocaleString(),
    link: `${window.location.origin}/vaga/${id}` // Gera o link completo
  };

  const updatedJobs = [...currentJobs, newJob];
  localStorage.setItem(JOBS_KEY, JSON.stringify(updatedJobs));
  return newJob;
};

export const getJobs = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(JOBS_KEY) || '[]');
};

// --- GERENCIAMENTO DE CANDIDATOS ---

export const saveCandidateResult = (name: string, result: any, jobId: string = 'geral') => {
  if (typeof window === 'undefined') return;

  const currentData = JSON.parse(localStorage.getItem(CANDIDATES_KEY) || '[]');
  
  const newEntry = {
    id: Date.now(),
    jobId: jobId, // Agora sabemos de qual vaga ele veio
    name: name,
    date: new Date().toLocaleString(),
    result: result
  };

  const updatedData = [...currentData, newEntry];
  localStorage.setItem(CANDIDATES_KEY, JSON.stringify(updatedData));
};

export const getCandidates = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(CANDIDATES_KEY) || '[]');
};