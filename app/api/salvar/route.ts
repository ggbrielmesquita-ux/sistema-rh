import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Cria a conexão direto no servidor
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Tenta salvar
    const { data, error } = await supabase
      .from('candidates')
      .insert([body]);

    if (error) {
      console.error('Erro do Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error('Erro no Servidor:', err);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}