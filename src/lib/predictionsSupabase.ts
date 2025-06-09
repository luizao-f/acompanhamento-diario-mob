import { supabase } from "@/integrations/supabase/client";
import { PredictionData, CorrectionData } from "./menstruationPrediction";

/**
 * Salva predições na tabela 'menstruation_predictions' do Supabase.
 * Usa upsert para evitar duplicidades por data/tipo.
 */
export async function savePredictions(predictions: PredictionData[]) {
  if (!predictions.length) return;
  const { error } = await supabase
    .from("menstruation_predictions")
    .upsert(predictions, { onConflict: "date,type" }); // ajuste conforme sua tabela
  if (error) {
    console.error("Erro ao salvar predições:", error);
    throw error;
  }
}

/**
 * Salva correções na tabela 'menstruation_corrections' do Supabase.
 * Usa upsert para evitar duplicidades por data/tipo.
 */
export async function saveCorrections(corrections: CorrectionData[]) {
  if (!corrections.length) return;
  const { error } = await supabase
    .from("menstruation_corrections")
    .upsert(corrections, { onConflict: "date,type" }); // ajuste conforme sua tabela
  if (error) {
    console.error("Erro ao salvar correções:", error);
    throw error;
  }
}