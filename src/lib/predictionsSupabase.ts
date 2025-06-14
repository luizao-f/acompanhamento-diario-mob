
import { supabase } from './supabase';

export interface PredictionData {
  date: string;
  type: 'menstruation' | 'ovulation' | 'fertile';
  confidence: number;
}

export const savePredictions = async (predictions: PredictionData[]): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const formattedPredictions = predictions.map(prediction => ({
      user_id: user.id,
      predicted_date: prediction.date,
      prediction_type: prediction.type,
      confidence: prediction.confidence,
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('menstruation_predictions')
      .insert(formattedPredictions);

    if (error) {
      console.error('Error saving predictions:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in savePredictions:', error);
    return false;
  }
};

export const saveCorrections = async (corrections: Array<{ date: string; type: 'false_positive' | 'false_negative' }>): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    const formattedCorrections = corrections.map(correction => ({
      user_id: user.id,
      correction_date: correction.date,
      correction_type: correction.type,
      actual_result: correction.type === 'false_negative',
      original_prediction: correction.type === 'false_positive',
      created_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('menstruation_corrections')
      .insert(formattedCorrections);

    if (error) {
      console.error('Error saving corrections:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in saveCorrections:', error);
    return false;
  }
};
