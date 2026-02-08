// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
// ÍCONES
import { Trash2, ExternalLink, Smartphone, LogOut, Plus, Eye, X, MessageCircle, TriangleAlert } from 'lucide-react';

const PERGUNTAS_REF = [
  "1. Erro no processo vs Prazo pessoal",
  "2. Cliente pede alteração fora do escopo",
  "3. Chefe esqueceu informação (Culpa)",
  "4. Crise na empresa (Atitude)",
  "5. Tarefa repetitiva (Automação)",
  "6. Colega lento prejudicando time",
  "7. Ideia ruim em reunião",
  "8. Feedback injusto em público",
  "9. Happy Hour vs Pendência",
  "10. Colega roubou crédito",
  "11. Meta impossível",
  "12. Concorrência melhor",
  "13. Profissional insubstituível",
  "14. Sobra de orçamento",
  "15. Chefe vs Cliente",
  "16. Mentira na venda",
  "17. Colega desviando material",
  "18. Servidor caiu fds",
  "19. Burocracia inútil",
  "20. Tarefa pessoal do chefe",
  "21. Loteria",
  "22. O que te irrita",
  "23. Tipo de reconhecimento",
  "24. Mudança no ex-emprego",
  "25. Pitch final (Por que contratar)"
];

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  const [newJobTitle, setNewJobTitle] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // ESTADO PARA O MODAL DE EXCLUSÃO
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'job' | 'candidate' | null;
    id: string | null;
    title: string;
  }>({ isOpen: false, type: null, id: null, title: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login');
      else loadData();
    });
    return () => unsubscribe();
  }, [router]);

  const loadData = async () => {
    try {
      const jobsSnap = await getDocs(query(collection(db, "jobs"), orderBy("createdAt", "desc")));
      setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const candSnap = await getDocs(query(collection(db, "candidates"), orderBy("createdAt", "desc")));
      setCandidates(candSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!newJobTitle.trim()) return;
    try {
      const slug = newJobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
      const newJob = {
          title: newJobTitle, 
          slug, 
          createdAt: new Date().toISOString(),
          link: `${window.location.origin}/vaga/${slug}`
      };
      await addDoc(collection(db, "jobs"), newJob);
      setNewJobTitle('');
      loadData();
    } catch (error) {
      alert("Erro ao criar vaga.");
    }
  };

  // --- FUNÇÕES DE EXCLUSÃO COM MODAL ---
  
  // 1. Abre o modal para Vaga
  const confirmDeleteJob = (jobId: string, jobTitle: string) => {
    setDeleteModal({ isOpen: true, type: 'job', id: jobId, title: `A vaga "${jobTitle}"` });
  };

  // 2. Abre o modal para Candidato
  const confirmDeleteCandidate = (candId: string, candName: string, e: any) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, type: 'candidate', id: candId, title: `O candidato "${candName}"` });
  };

  // 3. Executa a exclusão de verdade
  const executeDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;

    try {
      if (deleteModal.type === 'job') {
        await deleteDoc(doc(db, "jobs", deleteModal.id));
      } else {
        await deleteDoc(doc(db, "candidates", deleteModal.id));
      }
      loadData();
      setDeleteModal({ isOpen: false, type: null, id: null, title: '' }); // Fecha modal
    } catch (error) {
      alert("Erro ao apagar.");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-700 bg-green-50 border-green-200";
    if (score >= 50) return "text-yellow-700 bg-yellow-50 border-yellow-200";
    return "text-red-700 bg-red-50 border-red-200";
  };

  const getWhatsAppLink = (phone: string) => {
    if (!phone) return "#";
    const cleanNumber = phone.replace(/\D/g, '');
    return `https://wa.me/55${cleanNumber}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* TOPO */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Painel RH</h1>
            <p className="text-sm text-gray-500 mt-1">Gestão de talentos e processos</p>
          </div>
          <button 
            onClick={() => signOut(auth)} 
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} />
            Sair
          </button>
        </div>

        {/* CRIAR VAGA */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nova Oportunidade</label>
          <div className="flex gap-3">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition"
              placeholder="Nome do cargo (ex: Analista Comercial)"
              value={newJobTitle}
              onChange={e => setNewJobTitle(e.target.value)}
            />
            <button 
              onClick={handleCreateJob} 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 text-sm shadow-sm"
            >
              <Plus size={18} />
              Criar Vaga
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LISTA DE VAGAS */}
          <div className="lg:col-span-1">
            <h3 className="font-bold text-gray-400 uppercase text-xs mb-4 tracking-wider">Vagas Ativas</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {jobs.map(job => (
                <div key={job.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 flex justify-between items-center group transition">
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="font-medium text-gray-800 block truncate text-sm">{job.title}</span>
                    <a 
                      href={`/vaga/${job.slug}`} 
                      target="_blank" 
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1 font-medium"
                    >
                      Acessar Link <ExternalLink size={10} />
                    </a>
                  </div>
                  <button 
                    onClick={() => confirmDeleteJob(job.id, job.title)} // ALTERADO PARA ABRIR MODAL
                    className="text-gray-300 hover:text-red-500 p-2 rounded-md transition"
                    title="Excluir Vaga"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {jobs.length === 0 && <div className="p-8 text-center text-gray-400 text-xs">Nenhuma vaga ativa.</div>}
            </div>
          </div>

          {/* LISTA DE CANDIDATOS */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-gray-400 uppercase text-xs mb-4 tracking-wider">Últimos Candidatos</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-200">
                    <tr>
                      <th className="p-4 font-semibold">Candidato</th>
                      <th className="p-4 font-semibold">Contato</th>
                      <th className="p-4 font-semibold">Vaga</th>
                      <th className="p-4 font-semibold text-center">Score</th>
                      <th className="p-4 font-semibold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {candidates.map((cand) => (
                      <tr key={cand.id} className="hover:bg-blue-50/50 transition cursor-pointer group" onClick={() => setSelectedCandidate(cand)}>
                        <td className="p-4 text-sm font-medium text-gray-900">{cand.name}</td>
                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                          {cand.whatsapp ? (
                            <a 
                              href={getWhatsAppLink(cand.whatsapp)} 
                              target="_blank" 
                              className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 text-sm border border-gray-200 bg-white px-2.5 py-1.5 rounded-md w-fit hover:border-green-300 transition shadow-sm"
                            >
                              <Smartphone size={14} />
                              <span className="text-xs font-medium">{cand.whatsapp}</span>
                            </a>
                          ) : <span className="text-gray-400 text-xs">-</span>}
                        </td>
                        <td className="p-4 text-sm text-gray-500">{cand.jobTitle}</td>
                        <td className="p-4 text-center">
                          {cand.score !== undefined ? (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(cand.score)}`}>
                              {cand.score}%
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-4 text-right flex justify-end items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition" title="Ver Detalhes">
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={(e) => confirmDeleteCandidate(cand.id, cand.name, e)} // ALTERADO PARA ABRIR MODAL
                            className="text-gray-300 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {candidates.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400 text-sm">Nenhum candidato recebido.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* --- MODAL DE DETALHES DO CANDIDATO --- */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40 backdrop-blur-sm transition-opacity">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ring-1 ring-black/5 animate-fade-in">
              
              {/* Header Modal */}
              <div className="bg-slate-900 p-6 text-white flex justify-between items-start flex-shrink-0">
                <div>
                  <h2 className="text-xl font-bold">{selectedCandidate.name}</h2>
                  <div className="flex items-center gap-3 mt-2 text-slate-300 text-sm">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-xs uppercase tracking-wide">{selectedCandidate.jobTitle}</span>
                    <span className="flex items-center gap-1"><Smartphone size={14}/> {selectedCandidate.whatsapp}</span>
                  </div>
                </div>
                <div className="text-center bg-white/10 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10">
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Compatibilidade</div>
                  <div className={`text-2xl font-bold ${selectedCandidate.score >= 80 ? 'text-emerald-400' : selectedCandidate.score >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {selectedCandidate.score || 0}%
                  </div>
                </div>
              </div>

              {/* Corpo Modal */}
              <div className="p-8 overflow-y-auto bg-gray-50/50">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">Análise Comportamental</h3>
                <div className="space-y-4">
                  {selectedCandidate.answers && Array.isArray(selectedCandidate.answers) ? (
                    selectedCandidate.answers.map((resp: string, index: number) => (
                      <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-600 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">{index + 1}</span>
                          {PERGUNTAS_REF[index] || "Questão"}
                        </p>
                        <p className="text-gray-900 text-sm leading-relaxed border-l-2 border-blue-500 pl-3">
                          {resp}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-sm">Dados detalhados indisponíveis.</p>
                  )}
                </div>
              </div>

              {/* Footer Modal */}
              <div className="bg-white p-4 border-t border-gray-100 flex justify-between items-center flex-shrink-0">
                 <a 
                    href={getWhatsAppLink(selectedCandidate.whatsapp)} 
                    target="_blank"
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-sm hover:shadow-md"
                 >
                   <MessageCircle size={18} />
                   Chamar no WhatsApp
                 </a>
                <button 
                  onClick={() => setSelectedCandidate(null)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg font-medium text-sm transition hover:bg-gray-100"
                >
                  <X size={18} />
                  Fechar
                </button>
              </div>

            </div>
          </div>
        )}

        {/* --- NOVO MODAL DE EXCLUSÃO (BONITO) --- */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 text-center transform transition-all scale-100">
              
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TriangleAlert className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">
                Tem certeza?
              </h3>
              
              <p className="text-sm text-gray-500 mb-6">
                Você está prestes a excluir permanentemente <strong>{deleteModal.title}</strong>. Essa ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}