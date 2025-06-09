import { supabase } from "@/integrations/supabase/client";
import { PredictionData, CorrectionData } from "./menstruationPrediction";

/**
 * Salva predições na tabela 'menstruation_predictions' do Supabase.
 * Usa upsert para evitar duplicidades por date/prediction_type.
 */
export async function savePredictions(predictions: PredictionData[]) {
  if (!predictions.length) return;
  // Mapeia os campos do objeto para os nomes reais do banco
  const predictionsToSave = predictions.map(p => ({
    ...p,
    date: p.date, // deve existir no objeto PredictionData
    prediction_type: p.type, // 'type' vira 'prediction_type'
    isprediction: p.isPrediction, // 'isPrediction' vira 'isprediction'
    confidence_score: p.confidence, // 'confidence' vira 'confidence_score'
    // Ajuste os demais campos se necessário
  }));

  // Remove os campos camelCase originais que não existem no banco
  predictionsToSave.forEach(p => {
    delete p.type;
    delete p.isPrediction;
    delete p.confidence;
  });

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
    ...c,
    date: c.date,
    type: c.type, // ajuste se no banco for prediction_type!
  }));

  correctionsToSave.forEach(c => {
    // delete c.type; // só delete se precisar!
  });

  const { error } = await supabase
    .from("menstruation_corrections")
    .upsert(correctionsToSave, { onConflict: "date,type" }); // ajuste conforme as colunas reais!
  if (error) {
    console.error("Erro ao salvar correções:", error);
    throw error;
  }
}