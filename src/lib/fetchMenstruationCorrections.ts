import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface MenstruationCorrection {
  id: string;
  user_id: string;
  created_at: string;
  correction_date: string;
  original_prediction: string;
  actual_result: string;
  correction_type: 'delay' | 'anticipation';
}

/**
 * Busca as correções de menstruação do usuário no Supabase.
 * @param userId string - ID do usuário
 * @returns Promise<MenstruationCorrection[]>
 */
export async function fetchMenstruationCorrections(userId: string): Promise<MenstruationCorrection[]> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('menstruation_corrections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar correções:', error);
    return [];
  }

  return (data as MenstruationCorrection[]) || [];
}