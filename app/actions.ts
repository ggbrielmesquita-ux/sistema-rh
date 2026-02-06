'use server'

import { createClient } from '@supabase/supabase-js';

export async function salvarCandidato(dados: any) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  try {
    // Validação de segurança antes de conectar
    if (!url) throw new Error("A URL do Supabase está VAZIA na Vercel.");
    if (!key) throw new Error("A Chave (Key) do Supabase está VAZIA na Vercel.");

    const supabase = createClient(url, key);

    const { error } = await supabase
      .from('candidates')
      .insert([dados]);

    if (error) throw error;

    return { success: true };

  } catch (err: any) {
    console.error('Erro:', err);
    // Aqui está o segredo: Vamos retornar o motivo exato para aparecer na tela vermelha
    // (Mostrando só o começo da URL para debug)
    const debugUrl = url ? url.substring(0, 20) + "..." : "VAZIO";
    return { 
      success: false, 
      message: `Erro: ${err.message || 'Desconhecido'} (Tentou usar URL: ${debugUrl})`
    };
  }
}