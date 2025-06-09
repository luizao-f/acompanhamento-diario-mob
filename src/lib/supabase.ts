// src/lib/supabase.ts

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

// Interfaces para as novas tabelas
export interface PredictionSettings {
  id?: string;
  user_id?: string;
  lookback_months: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenstruationPrediction {
  id?: string;
  user_id?: string;
  predicted_date: string;
  prediction_type: 'menstruation' | 'ovulation' | 'fertile';
  confidence_score?: number;
  based_on_months?: number;
  cycle_average?: number;
  duration_average?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MenstruationCorrection {
  id?: string;
  user_id?: string;
  correction_date: string;
  correction_type: 'false_positive' | 'false_negative';
  original_prediction: boolean;
  actual_result: boolean;
  created_at?: string;
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
    // Corrigir o cálculo do mês para usar o índice correto (month é 0-based)
    const actualMonth = month + 1;
    const startDate = `${year}-${String(actualMonth).padStart(2, '0')}-01`;
    
    // Calcular o último dia do mês corretamente
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

// Função para salvar configurações de predição (ATUALIZADA)
export const savePredictionSettings = async (lookbackMonths: number) => {
  try {
    // Primeiro tenta buscar se já existe
    const { data: existing } = await supabase
      .from('prediction_settings')
      .select('*')
      .limit(1)
      .single();

    if (existing) {
      // Atualiza o existente
      const { data, error } = await supabase
        .from('prediction_settings')
        .update({ 
          lookback_months: lookbackMonths,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) throw error;
      console.log('Prediction settings updated successfully');
      return data;
    } else {
      // Cria novo sem user_id
      const { data, error } = await supabase
        .from('prediction_settings')
        .insert({ 
          lookback_months: lookbackMonths,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      console.log('Prediction settings created successfully');
      return data;
    }
  } catch (error) {
    console.error('Error saving prediction settings:', error);
    throw error;
  }
};

// Função para buscar configurações de predição
export const getPredictionSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('prediction_settings')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching prediction settings:', error);
    return null;
  }
};

// Função para salvar predições (ATUALIZADA)
export const savePredictions = async (predictions: Omit<MenstruationPrediction, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
  try {
    if (predictions.length === 0) {
      console.log('No predictions to save');
      return [];
    }

    // Deletar todas as predições futuras
    const today = new Date().toISOString().split('T')[0];
    console.log('Deleting predictions from:', today);
    
    const { error: deleteError } = await supabase
      .from('menstruation_predictions')
      .delete()
      .gte('predicted_date', today);

    if (deleteError) {
      console.error('Error deleting old predictions:', deleteError);
      throw deleteError;
    }

    // Adicionar timestamps e remover user_id
    const predictionsWithTimestamps = predictions.map(pred => ({
      ...pred,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    console.log('Inserting predictions:', predictionsWithTimestamps.length);

    // Inserir novas predições
    const { data, error } = await supabase
      .from('menstruation_predictions')
      .insert(predictionsWithTimestamps);

    if (error) {
      console.error('Error inserting predictions:', error);
      throw error;
    }
    
    console.log('Predictions saved successfully:', predictionsWithTimestamps.length);
    return data || [];
  } catch (error) {
    console.error('Error saving predictions:', error);
    throw error;
  }
};

// Função para buscar predições (ATUALIZADA)
export const getPredictions = async (startDate: string, endDate: string) => {
  try {
    console.log('Fetching predictions from', startDate, 'to', endDate);
    
    const { data, error } = await supabase
      .from('menstruation_predictions')
      .select('*')
      .gte('predicted_date', startDate)
      .lte('predicted_date', endDate)
      .order('predicted_date');

    if (error) throw error;
    
    console.log('Found predictions:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return [];
  }
};

// Função para salvar correção (ATUALIZADA)
export const saveCorrection = async (correction: Omit<MenstruationCorrection, 'id' | 'user_id' | 'created_at'>) => {
  try {
    const correctionWithTimestamp = {
      ...correction,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('menstruation_corrections')
      .upsert(correctionWithTimestamp, { 
        onConflict: 'correction_date' 
      });

    if (error) throw error;
    console.log('Correction saved successfully');
    return data;
  } catch (error) {
    console.error('Error saving correction:', error);
    throw error;
  }
};

// Função para buscar correções
export const getCorrections = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('menstruation_corrections')
      .select('*')
      .gte('correction_date', startDate)
      .lte('correction_date', endDate)
      .order('correction_date');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching corrections:', error);
    return [];
  }
};

// Export the supabase client for direct use if needed
export { supabase };