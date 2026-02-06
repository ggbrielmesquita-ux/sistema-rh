'use server'

export async function salvarCandidato(dados: any) {
  // Vamos simular um atraso de 1 segundo para parecer real
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log("O servidor recebeu:", dados.name);
  
  // Retorna sucesso FALSO (fake) só para testar a comunicação
  return { success: true, message: "Conexão Servidor OK! O problema é o Banco." };
}