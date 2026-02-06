'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  try {
    // Agora sim: Conecta no Supabase usando suas senhas da Vercel
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('candidates')
      .insert([dados]);

    if (error) {
      console.error('Erro ao salvar no Supabase:', error);
      return { success: false, message: 'Erro no Banco: ' + error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro Geral:', err);
    return { success: false, message: 'Erro interno no servidor' };
  }
}