
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
    // Ajustar para usar o formato correto de data
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

    console.log(`Fetching data for month: ${year}-${month + 1} (${startDate} to ${endDate})`);

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

    console.log(`Found ${data?.length || 0} records for the month`);
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

// Export the supabase client for direct use if needed
export { supabase };
