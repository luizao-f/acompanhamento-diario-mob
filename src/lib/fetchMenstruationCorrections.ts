
import { supabase } from './supabase';

export interface MenstruationCorrection {
  id: string;
  user_id: string;
  correction_date: string;
  original_prediction: string;
  actual_result: boolean;
  correction_type: string;
  created_at: string;
}

export const fetchMenstruationCorrections = async (): Promise<MenstruationCorrection[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return [];
    }

    const { data, error } = await supabase
      .from('menstruation_corrections')
      .select('*')
      .eq('user_id', user.id)
      .order('correction_date', { ascending: false });

    if (error) {
      console.error('Error fetching menstruation corrections:', error);
      return [];
    }

    // Type conversion to match our interface
    return (data || []).map(item => ({
      ...item,
      original_prediction: String(item.original_prediction)
    })) as MenstruationCorrection[];
  } catch (error) {
    console.error('Error in fetchMenstruationCorrections:', error);
    return [];
  }
};
