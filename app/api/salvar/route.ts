import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Substitua pelas suas chaves REAIS do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { data, error } = await supabase
      .from('candidates')
      .insert([
        {
          name: body.name,
          email: body.email,
          phone: body.phone,
          role_target: body.role_target,
          final_scores: body.final_scores,
          raw_answers: body.raw_answers
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}