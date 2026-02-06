'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  try {
    // 1. A URL EU JÁ PREENCHI PRA VOCÊ (Peguei do seu print):
    const url = "https://mlnumtqkgkrprpsbhys.supabase.co"; 
    
    // 2. A CHAVE VOCÊ TEM QUE COLAR AQUI DENTRO DAS ASPAS 👇
    // (Copie aquele código 'eyJh...' do botão 'anon public' do Supabase e cole abaixo)
    const key = "COLE_SUA_CHAVE_GIGANTE_AQUI";

    // ---------------------------------------------
    console.log("Testando conexão Hardcode...");
    const supabase = createClient(url, key);

    const { error } = await supabase
      .from('candidates')
      .insert([dados]);

    if (error) throw error;

    return { success: true };

  } catch (err: any) {
    console.error('Erro:', err);
    // Se der erro, vai aparecer esta mensagem específica:
    return { 
      success: false, 
      message: `Erro Hardcode: ${err.message}`
    };
  }
}