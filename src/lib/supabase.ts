
import { supabase } from '@/integrations/supabase/client';

export interface BillingData {
  id?: string;
  date: string;
  sensacao?: string[];
  muco?: string[];
  relacao_sexual?: boolean;
  menstruacao?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const getBillingData = async (date: string): Promise<BillingData | null> => {
  try {
    const { data, error } = await supabase
      .from('billings_data')
      .select('*')
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return null;
  }
};

export const getBillingDataForMonth = async (year: number, month: number): Promise<BillingData[]> => {
  try {
    const actualMonth = month + 1;
    const startDate = `${year}-${String(actualMonth).padStart(2, '0')}-01`;
    
    const nextMonth = actualMonth === 12 ? 1 : actualMonth + 1;
    const nextYear = actualMonth === 12 ? year + 1 : year;
    const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
    const endDate = `${year}-${String(actualMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    console.log(`Fetching data for month: ${year}-${actualMonth} (${startDate} to ${endDate})`);

    const { data, error } = await supabase
      .from('billings_data')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} records for the month ${year}-${actualMonth}:`, data);
    return data || [];
  } catch (error) {
    console.error('Error fetching month billing data:', error);
    return [];
  }
};

export const saveBillingData = async (data: Omit<BillingData, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { error } = await supabase
      .from('billings_data')
      .upsert(data, { onConflict: 'date' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving billing data:', error);
    throw error;
  }
};

// Função para salvar correção manual
export const saveMenstruationCorrection = async (
  date: string, 
  originalPrediction: boolean, 
  actualResult: boolean
) => {
  try {
    const correctionType = originalPrediction && !actualResult 
      ? 'false_positive' 
      : !originalPrediction && actualResult 
        ? 'false_negative' 
        : null;

    if (!correctionType) return;

    const { error } = await supabase
      .from('menstruation_corrections')
      .upsert({
        correction_date: date,
        correction_type: correctionType,
        original_prediction: originalPrediction,
        actual_result: actualResult
      }, { onConflict: 'user_id,correction_date' });

    if (error) throw error;
  } catch (error) {
    console.error('Error saving menstruation correction:', error);
    throw error;
  }
};

export { supabase };
