'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  try {
    // 1. A URL EU JÁ PREENCHI PRA VOCÊ (Peguei do seu print):
    const url = "https://mlnumtqkgkrprpsbhys.supabase.co"; 
    
    // 2. A CHAVE VOCÊ TEM QUE COLAR AQUI DENTRO DAS ASPAS 👇
    // (Copie aquele código 'eyJh...' do botão 'anon public' do Supabase e cole abaixo)
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbnVtdHFrZ2tycHJwcnNiaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjcwNjMsImV4cCI6MjA4NTkwMzA2M30.SKg75x-pV-MJWlIarM45vP7J0t8bpsHRd1SL1yE8AeU";

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