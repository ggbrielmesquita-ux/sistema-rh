"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase"; 
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { 
  LayoutDashboard, Briefcase, Users, LogOut, 
  Plus, Search, Trash2, Eye 
} from "lucide-react";

// --- TIPOS ---
interface Job {
  id: string;
  title: string;
  companyName: string;
  slug: string;
  createdAt: string;
}

interface Candidate {
  id: string;
  name: string;
  phone: string;
  jobTitle: string;
  score: number;
  createdAt: string;
  jobId: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Dados
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stats, setStats] = useState({ active: 0, totalCandidates: 0, recommended: 0 });

  // Modal de Criação
  const [showModal, setShowModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [creating, setCreating] = useState(false);

  const SUGESTOES = ["Vendedor", "Atendente", "Gerente", "Motorista", "Estoquista", "Recepcionista", "Auxiliar Adm"];

  // --- 1. CARREGAMENTO ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
      } else {
        setUser(currentUser);
        await loadDashboardData(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      // A. Buscar VAGAS
      const qJobs = query(collection(db, "jobs"), where("ownerId", "==", userId));
      const jobsSnap = await getDocs(qJobs);
      
      const jobsList: Job[] = [];
      const jobsMap: Record<string, string> = {}; 

      jobsSnap.forEach((doc) => {
        const data = doc.data();
        // Garante que os campos existam para não quebrar
        jobsList.push({ 
            id: doc.id, 
            title: data.title || "Sem título", 
            companyName: data.companyName || "", 
            slug: data.slug || "",
            createdAt: data.createdAt || "" 
        } as Job);
        jobsMap[doc.id] = data.title;
      });

      // B. Buscar CANDIDATOS
      let candidatesList: Candidate[] = [];
      let recommendedCount = 0;

      if (jobsList.length > 0) {
         // Tenta ordenar, mas se falhar por falta de índice, pega sem ordem
         try {
             const qCandidates = query(collection(db, "candidates"), orderBy("createdAt", "desc"));
             const candSnap = await getDocs(qCandidates);
             candSnap.forEach((doc) => {
                processCandidate(doc, jobsMap, candidatesList);
             });
         } catch (err) {
             console.log("Erro de ordenação (falta index?), tentando sem ordem...", err);
             const qCandidates = collection(db, "candidates");
             const candSnap = await getDocs(qCandidates);
             candSnap.forEach((doc) => {
                processCandidate(doc, jobsMap, candidatesList);
             });
         }
      }

      // Conta os recomendados
      candidatesList.forEach(c => {
          if (c.score >= 70) recommendedCount++;
      });

      setJobs(jobsList);
      setCandidates(candidatesList);
      setStats({
        active: jobsList.length,
        totalCandidates: candidatesList.length,
        recommended: recommendedCount
      });

    } catch (error) {
      console.error("Erro geral no dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para processar candidato sem quebrar
  const processCandidate = (doc: any, jobsMap: any, list: any[]) => {
      const data = doc.data();
      if (jobsMap[data.jobId]) {
          list.push({
              id: doc.id,
              name: data.name || "Sem Nome", // Proteção
              phone: data.phone || "",       // Proteção
              jobTitle: jobsMap[data.jobId],
              score: Number(data.score) || 0, // Garante que seja numero
              createdAt: data.createdAt || "",
              jobId: data.jobId
          });
      }
  };

  // --- 2. CRIAR NOVA VAGA ---
  const handleCreateJob = async () => {
    if (!newJobTitle.trim() || !user) return;
    setCreating(true);

    try {
        const slug = newJobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
        
        const PERGUNTAS_PADRAO = [
            { pergunta: "Disponibilidade de horário?", opcoes: [{texto: "Total", pontuacao: 10}, {texto: "Parcial", pontuacao: 5}] },
            { pergunta: "Experiência anterior?", opcoes: [{texto: "Sim", pontuacao: 10}, {texto: "Não", pontuacao: 0}] }
        ];

        await addDoc(collection(db, "jobs"), {
            ownerId: user.uid,
            title: newJobTitle,
            companyName: companyName || "Sua Empresa",
            slug: slug,
            questions: PERGUNTAS_PADRAO,
            createdAt: new Date().toISOString()
        });

        setNewJobTitle("");
        setCompanyName("");
        setShowModal(false);
        await loadDashboardData(user.uid); 
        alert("Vaga criada com sucesso!");

    } catch (error) {
        console.error("Erro ao criar vaga:", error);
        alert("Erro ao criar vaga.");
    } finally {
        setCreating(false);
    }
  };

  // --- 3. DELETAR VAGA ---
  const handleDeleteJob = async (id: string) => {
    if (confirm("Tem certeza?")) {
        await deleteDoc(doc(db, "jobs", id));
        if (user) loadDashboardData(user.uid);
    }
  };

  const handleLogout = () => {
    signOut(auth);
    router.push("/login");
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">Carregando Painel...</div>;

  return (
    <div className="flex min-h-screen bg-[#F3F4F6]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col justify-between fixed h-full z-10">
        <div>
            <div className="p-6 flex items-center gap-2">
                <div className="bg-blue-600 text-white p-2 rounded-lg font-bold">MR</div>
                <h1 className="text-xl font-bold text-gray-800">MixRH</h1>
            </div>
            <nav className="mt-4 px-4 space-y-2">
                <button className="flex items-center gap-3 w-full px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg">
                    <LayoutDashboard size={20} /> Dashboard
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition">
                    <Briefcase size={20} /> Vagas
                </button>
                <button className="flex items-center gap-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-lg transition">
                    <Users size={20} /> Candidatos
                </button>
            </nav>
        </div>
        <div className="p-4 border-t border-gray-100">
             <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition">
                <LogOut size={16} /> Sair
            </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-8 md:ml-64">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">Painel RH</h2>
                <p className="text-gray-500">Gestão inteligente de vagas.</p>
            </div>
            <button onClick={handleLogout} className="md:hidden text-gray-500 font-bold">Sair</button>
        </header>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Vagas Ativas</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.active}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg text-blue-600"><Briefcase size={24}/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Candidatos</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.totalCandidates}</h3>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg text-purple-600"><Users size={24}/></div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Recomendados</p>
                        <h3 className="text-3xl font-bold text-green-600">{stats.recommended}</h3>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg text-green-600"><Users size={24}/></div>
                </div>
            </div>
        </div>

        {/* INPUT DE CRIAÇÃO RÁPIDA */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full">
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Criar Nova Vaga</label>
                <div className="relative">
                    <input 
                        className="w-full pl-4 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cargo (ex: Vendedor...)"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        list="cargos-sugestoes"
                    />
                    <datalist id="cargos-sugestoes">
                        {SUGESTOES.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
            </div>
            <button onClick={() => { if(newJobTitle) setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-blue-200 flex items-center gap-2 transition w-full md:w-auto justify-center mt-6 md:mt-0">
                <Plus size={18} /> Continuar
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LISTA DE VAGAS */}
            <div className="lg:col-span-1 space-y-4">
                <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wider">Suas Vagas</h3>
                <div className="space-y-3">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group relative">
                            <h4 className="font-bold text-gray-800">{job.title}</h4>
                            <p className="text-xs text-gray-400">{job.companyName}</p>
                            <div className="mt-3 flex justify-between items-center">
                                <a href={`/vaga/${job.slug}`} target="_blank" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">Ver Vaga <Eye size={12}/></a>
                                <button onClick={() => handleDeleteJob(job.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {jobs.length === 0 && <p className="text-gray-400 text-sm text-center py-4">Nenhuma vaga criada.</p>}
                </div>
            </div>

            {/* TABELA DE CANDIDATOS (COM PROTEÇÃO CONTRA ERROS) */}
            <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100"><h3 className="font-bold text-gray-800">Últimos Candidatos</h3></div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Nome</th>
                                    <th className="px-6 py-3">Vaga</th>
                                    <th className="px-6 py-3 text-center">Score</th>
                                    <th className="px-6 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {candidates.map(candidate => {
                                    // PREVINE ERRO DE TELEFONE VAZIO
                                    const safePhone = candidate.phone ? candidate.phone.replace(/\D/g, "") : "";
                                    const zapLink = safePhone ? `https://wa.me/55${safePhone}` : "#";
                                    
                                    return (
                                    <tr key={candidate.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{candidate.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{candidate.jobTitle}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${candidate.score >= 70 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {candidate.score}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {safePhone ? (
                                                <a href={zapLink} target="_blank" className="text-blue-600 font-bold hover:underline">WhatsApp</a>
                                            ) : (
                                                <span className="text-gray-300">Sem Zap</span>
                                            )}
                                        </td>
                                    </tr>
                                )})}
                                {candidates.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">Nenhum candidato ainda.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                <h3 className="text-xl font-bold mb-4">Configurar Vaga</h3>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label><input value={newJobTitle} disabled className="w-full bg-gray-100 border rounded-lg p-3 font-bold text-gray-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Padaria do Zé" className="w-full border rounded-lg p-3 outline-none" /></div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancelar</button>
                        <button onClick={handleCreateJob} disabled={creating} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg">{creating ? "Criando..." : "Publicar"}</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}