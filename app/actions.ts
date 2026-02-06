'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  // Isso roda 100% no servidor, invisível para o navegador
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase
      .from('candidates')
      .insert([dados]);

    if (error) {
      console.error('Erro Supabase:', error);
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro Servidor:', err);
    return { success: false, message: 'Erro interno no servidor' };
  }
}