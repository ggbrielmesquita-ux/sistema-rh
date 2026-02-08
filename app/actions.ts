'use server';

import { createClient } from '@supabase/supabase-js';

// Agora ele pega as chaves do arquivo .env.local automaticamente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function salvarCandidato(dados: any, empresaSlug: string) {
  try {
    console.log(`🔍 Buscando empresa: ${empresaSlug}`);

    // 1. Achar a empresa pelo "Apelido" (slug) que está na URL
    const { data: empresa, error: erroEmpresa } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', empresaSlug)
      .single();

    if (erroEmpresa || !empresa) {
      console.error('❌ Empresa não encontrada:', erroEmpresa);
      return { success: false, message: 'Empresa não cadastrada no sistema.' };
    }

    console.log(`✅ Empresa encontrada ID: ${empresa.id}`);

    // 2. Salvar o candidato vinculado a essa empresa
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name: dados.name,
          email: dados.email,
          phone: dados.phone,
          role_target: dados.role_target,
          final_scores: dados.final_scores,
          raw_answers: dados.raw_answers,
          company_id: empresa.id // <--- VINCULA O CANDIDATO AQUI
        }
      ])
      .select();

    if (error) {
      console.error('❌ Erro Supabase:', error);
      return { success: false, message: 'Erro ao salvar no banco.' };
    }

    return { success: true };
  } catch (err) {
    console.error('❌ Erro Geral:', err);
    return { success: false, message: 'Erro interno no servidor.' };
  }
}