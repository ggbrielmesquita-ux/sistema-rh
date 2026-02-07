'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  try {
    const url = "https://mlnumtqkgkrprpsbhys.supabase.co"; 
    const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sbnVtdHFrZ2tycHJwcnNiaHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMjcwNjMsImV4cCI6MjA4NTkwMzA2M30.SKg75x-pV-MJWlIarM45vP7J0t8bpsHRd1SL1yE8AeU"; // Só pra garantir, cole a eyJh... aqui

    // Configuração especial para não dar "fetch failed" na Vercel
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
      },
    });

    const { error } = await supabase.from('candidates').insert([dados]);

    if (error) throw error;
    return { success: true };

  } catch (err: any) {
    console.error('Erro:', err);
    return { success: false, message: `Erro Hardcode: ${err.message}` };
  }
}