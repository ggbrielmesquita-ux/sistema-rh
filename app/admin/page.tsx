"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { Trash2, ExternalLink, Smartphone, LogOut, Plus, Eye, X, MessageCircle, TriangleAlert, Sparkles, Loader2 } from 'lucide-react';
import { gerarPerguntasIA } from '../actions/gerarPerguntas'; // <--- IMPORTANDO A IA

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  
  // ESTADOS DA IA
  const [newJobTitle, setNewJobTitle] = useState('');
  const [companyName, setCompanyName] = useState(''); // Novo campo Empresa
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);

  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean; type: 'job' | 'candidate' | null; id: string | null; title: string;}>({ isOpen: false, type: null, id: null, title: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) router.push('/login');
      else { setUser(u); loadData(); }
    });
    return () => unsubscribe();
  }, [router]);

  const loadData = async () => {
    try {
      const jobsSnap = await getDocs(query(collection(db, "jobs"), orderBy("createdAt", "desc")));
      setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      const candSnap = await getDocs(query(collection(db, "candidates"), orderBy("createdAt", "desc")));
      setCandidates(candSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // --- FUNÇÃO MÁGICA DA IA ---
  const handleGenerateAI = async () => {
    if (!newJobTitle.trim()) return alert("Digite o cargo primeiro!");
    setIsGenerating(true);
    try {
        const perguntas = await gerarPerguntasIA(newJobTitle, companyName || "Sua Empresa");
        if (perguntas) {
            setGeneratedQuestions(perguntas);
            alert(`Sucesso! ${perguntas.length} perguntas criadas especificamente para ${newJobTitle}.`);
        } else {
            alert("A IA falhou. Tente de novo.");
        }
    } catch (e) { alert("Erro na IA."); } finally { setIsGenerating(false); }
  };

  const handleCreateJob = async () => {
    if (!newJobTitle.trim()) return;
    
    // Se não gerou com IA, usa null (para a página pública usar o padrão)
    const questionsToSave = generatedQuestions.length > 0 ? generatedQuestions : null;

    try {
      const slug = newJobTitle.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000);
      await addDoc(collection(db, "jobs"), {
          title: newJobTitle, 
          companyName: companyName,
          slug, 
          questions: questionsToSave, // <--- SALVANDO AS PERGUNTAS DA IA
          createdAt: new Date().toISOString(),
          ownerId: user.uid
      });
      setNewJobTitle(''); setCompanyName(''); setGeneratedQuestions([]);
      loadData();
    } catch (error) { alert("Erro ao criar vaga."); }
  };

  // ... (RESTO DO CÓDIGO DE MODAL E DELETE IGUAL AO SEU ANTERIOR) ...
  // Vou manter o render simplificado aqui para caber na resposta, mas a lógica de delete é a mesma
  
  const confirmDeleteJob = (id: string, title: string) => setDeleteModal({ isOpen: true, type: 'job', id, title: `Vaga ${title}` });
  const confirmDeleteCandidate = (id: string, name: string, e: any) => { e.stopPropagation(); setDeleteModal({ isOpen: true, type: 'candidate', id, title: `Candidato ${name}` }); };
  const executeDelete = async () => {
    if (!deleteModal.id) return;
    await deleteDoc(doc(db, deleteModal.type === 'job' ? "jobs" : "candidates", deleteModal.id));
    setDeleteModal({ ...deleteModal, isOpen: false }); loadData();
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">Painel RH <span className="text-purple-600 text-sm">AI Powered</span></h1>
            <button onClick={() => signOut(auth)} className="flex gap-2 text-red-500 font-bold"><LogOut size={20}/> Sair</button>
        </div>

        {/* ÁREA DE CRIAÇÃO INTELIGENTE */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Criar Nova Vaga com IA</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
             <input className="p-3 border rounded-lg" placeholder="Cargo (ex: Padeiro)" value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} />
             <input className="p-3 border rounded-lg" placeholder="Empresa (ex: Padaria do Zé)" value={companyName} onChange={e => setCompanyName(e.target.value)} />
             
             {/* BOTÃO DA IA */}
             <button onClick={handleGenerateAI} disabled={isGenerating || !newJobTitle} className="bg-purple-100 text-purple-700 font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-purple-200 transition">
                {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>}
                {isGenerating ? "Criando Teste..." : "Gerar Perguntas IA"}
             </button>
          </div>
          
          {generatedQuestions.length > 0 && (
             <div className="mb-4 text-xs text-green-600 font-bold bg-green-50 p-2 rounded">
                ✅ {generatedQuestions.length} perguntas geradas para {newJobTitle}! Pronto para publicar.
             </div>
          )}

          <button onClick={handleCreateJob} className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700">Publicar Vaga</button>
        </div>

        {/* ... (LISTAGEM DE VAGAS E CANDIDATOS IGUAL AO SEU CÓDIGO ANTERIOR) ... */}
        {/* Adicione aqui o código de listagem que você já tem */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-bold text-gray-400 mb-2">Vagas</h3>
                {jobs.map(j => (
                    <div key={j.id} className="bg-white p-4 border rounded-lg mb-2 flex justify-between">
                        <div>
                            <p className="font-bold">{j.title}</p>
                            <a href={`/vaga/${j.slug}`} target="_blank" className="text-xs text-blue-500 flex items-center gap-1"><ExternalLink size={10}/> Link</a>
                        </div>
                        <button onClick={() => confirmDeleteJob(j.id, j.title)} className="text-red-300 hover:text-red-500"><Trash2/></button>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold text-gray-400 mb-2">Candidatos</h3>
                {candidates.map(c => (
                    <div key={c.id} className="bg-white p-4 border rounded-lg mb-2 flex justify-between items-center cursor-pointer" onClick={() => setSelectedCandidate(c)}>
                        <div>
                            <p className="font-bold">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.jobTitle} - Score: {c.score}%</p>
                        </div>
                        <a href={`https://wa.me/55${c.whatsapp?.replace(/\D/g,'')}`} target="_blank" onClick={e => e.stopPropagation()} className="text-green-500"><Smartphone/></a>
                    </div>
                ))}
            </div>
        </div>

        {/* MODAL DELETAR (Copie o seu aqui) */}
        {deleteModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                    <h3 className="font-bold mb-4">Excluir {deleteModal.title}?</h3>
                    <div className="flex gap-2 justify-center">
                        <button onClick={() => setDeleteModal({...deleteModal, isOpen: false})} className="px-4 py-2 border rounded">Cancelar</button>
                        <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white rounded">Excluir</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}