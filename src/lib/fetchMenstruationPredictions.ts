import { supabase } from "@/integrations/supabase/client";

export interface MenstruationPrediction {
  id: string;
  user_id: string;
  predicted_date: string;
  prediction_type: string;
  confidence_score: number;
  created_at: string;
  // ... adicione outros campos relevantes se precisar
}

export async function fetchMenstruationPredictions(userId: string): Promise<MenstruationPrediction[]> {
  const { data, error } = await supabase
    .from('menstruation_predictions')
    .select('*')
    .eq('user_id', userId)
    .order('predicted_date', { ascending: true });

  if (error) {
    console.error('Erro ao buscar predições:', error);
    return [];
  }

  return (data as MenstruationPrediction[]) || [];
}