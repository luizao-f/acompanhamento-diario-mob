import { supabase } from '@/integrations/supabase/client';

// ---------------- BILLINGS DATA (já estava) ----------------
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

// ---------------- PREDICTION DATA ----------------
export interface PredictionData {
  id?: string;
  date: string;
  predicted: boolean; // true se previsto que será menstruação
  created_at?: string;
}

// Busca todas predições de um mês
export const getPredictionsForMonth = async (year: number, month: number): Promise<PredictionData[]> => {
  try {
    const actualMonth = month + 1;
    const startDate = `${year}-${String(actualMonth).padStart(2, '0')}-01`;

    const nextMonth = actualMonth === 12 ? 1 : actualMonth + 1;
    const nextYear = actualMonth === 12 ? year + 1 : year;
    const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
    const endDate = `${year}-${String(actualMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('menstruation_predictions')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

// Salva/atualiza várias predições de uma vez (upsert)
export const savePredictions = async (predictions: Omit<PredictionData, 'id' | 'created_at'>[]) => {
  try {
    const { error } = await supabase
      .from('menstruation_predictions')
      .upsert(predictions, { onConflict: 'date' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving predictions:', error);
    throw error;
  }
};

// ---------------- CORRECTIONS DATA ----------------
export interface CorrectionData {
  id?: string;
  date: string;
  type: 'delay' | 'anticipation'; // atraso ou antecipação
  corrected_date: string; // data real corrigida
  created_at?: string;
}

// Busca todas correções de um mês
export const getCorrectionsForMonth = async (year: number, month: number): Promise<CorrectionData[]> => {
  try {
    const actualMonth = month + 1;
    const startDate = `${year}-${String(actualMonth).padStart(2, '0')}-01`;

    const nextMonth = actualMonth === 12 ? 1 : actualMonth + 1;
    const nextYear = actualMonth === 12 ? year + 1 : year;
    const lastDay = new Date(nextYear, nextMonth - 1, 0).getDate();
    const endDate = `${year}-${String(actualMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('menstruation_corrections')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error('Error fetching corrections:', error);
    return [];
  }
};

// Salva/atualiza uma correção (upsert)
export const saveCorrection = async (correction: Omit<CorrectionData, 'id' | 'created_at'>) => {
  try {
    const { error } = await supabase
      .from('menstruation_corrections')
      .upsert(correction, { onConflict: 'date' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving correction:', error);
    throw error;
  }
};

// ---------------- PREDICTION SETTINGS (opcional) ----------------
export interface PredictionSettings {
  id?: string;
  user_id?: string;
  average_cycle_length?: number;
  average_menstruation_length?: number;
  created_at?: string;
}

// Busca as configurações de predição
export const getPredictionSettings = async (user_id: string): Promise<PredictionSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('prediction_settings')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching prediction settings:', error);
    return null;
  }
};

// Salva/atualiza configurações
export const savePredictionSettings = async (settings: Omit<PredictionSettings, 'id' | 'created_at'>) => {
  try {
    const { error } = await supabase
      .from('prediction_settings')
      .upsert(settings, { onConflict: 'user_id' });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving prediction settings:', error);
    throw error;
  }
};

// Export the supabase client for direct use if needed
export { supabase };