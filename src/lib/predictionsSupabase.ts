import { supabase } from "@/integrations/supabase/client";
import { PredictionData, CorrectionData } from "./menstruationPrediction";

/**
 * Salva predições na tabela 'menstruation_predictions' do Supabase.
 * Usa upsert para evitar duplicidades por date/prediction_type.
 */
export async function savePredictions(predictions: PredictionData[]) {
  if (!predictions.length) return;
  // Mapeia os campos do objeto para os nomes reais do banco e garante predicted_date
  const predictionsToSave = predictions.map(p => ({
    date: p.date, // deve existir no objeto PredictionData
    prediction_type: p.type, // 'type' vira 'prediction_type'
    isprediction: p.isPrediction, // 'isPrediction' vira 'isprediction'
    confidence_score: p.confidence, // 'confidence' vira 'confidence_score'
    predicted_date: p.predictedDate ?? p.date, // Usa p.predictedDate, se não existir usa p.date
    // Adicione outros campos se necessário
  }));

  const { error } = await supabase
    .from("menstruation_predictions")
    .upsert(predictionsToSave, { onConflict: "date,prediction_type" }); // ajuste para as colunas corretas!
  if (error) {
    console.error("Erro ao salvar predições:", error);
    throw error;
  }
}

/**
 * Salva correções na tabela 'menstruation_corrections' do Supabase.
 * Usa upsert para evitar duplicidades por date/type.
 * (Ajuste para prediction_type/isprediction/confidence_score se necessário!)
 */
export async function saveCorrections(corrections: CorrectionData[]) {
  if (!corrections.length) return;
  // Mapeie os campos se necessário, igual ao savePredictions acima
  const correctionsToSave = corrections.map(c => ({
    date: c.date,
    type: c.type, // ajuste se no banco for prediction_type!
    // Adicione outros campos conforme necessário!
  }));

  const { error } = await supabase
    .from("menstruation_corrections")
    .upsert(correctionsToSave, { onConflict: "date,type" }); // ajuste conforme as colunas reais!
  if (error) {
    console.error("Erro ao salvar correções:", error);
    throw error;
  }
}