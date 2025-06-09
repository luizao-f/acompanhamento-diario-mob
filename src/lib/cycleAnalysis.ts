export type PredictionType = 'menstruation' | 'end_menstruation' | 'ovulation' | 'fertile' | 'fertile_window';

export interface PredictionData {
  predicted_date: string; // "YYYY-MM-DD"
  prediction_type: PredictionType;
  confidence_score: number;
  // outros campos conforme sua tabela, se quiser
}

export type CorrectionType = 'delay' | 'anticipation';

export interface CorrectionData {
  user_id: string;
  correction_date: string; // Dia que foi corrigido manualmente
  original_prediction: string; // Data prevista originalmente (pode coincidir com correction_date)
  actual_result: string; // Data real informada pelo usuário
  correction_type: CorrectionType; // 'delay' ou 'anticipation'
  // outros campos conforme sua tabela, se quiser
}

export interface CycleAnalysisResult {
  totalPredictions: number;
  correct: number;
  delays: number;
  anticipations: number;
  accuracy: number;
  delayDays: number;
  anticipationDays: number;
}

/**
 * Analisa o ciclo menstrual, cruzando predições e correções.
 * Retorna blocos de resumo para acertos, atrasos e antecipações.
 */
export function analyzeCycle(
  predictions: PredictionData[],
  corrections: CorrectionData[]
): CycleAnalysisResult {
  let correct = 0;
  let delays = 0;
  let anticipations = 0;
  let delayDays = 0;
  let anticipationDays = 0;

  // Mapeia correções por data prevista
  const correctionMap = new Map<string, CorrectionData>();
  corrections.forEach(corr => {
    correctionMap.set(corr.original_prediction, corr);
  });

  predictions.forEach(pred => {
    // Só considera previsões de menstruação para precisão do ciclo
    if (pred.prediction_type !== 'menstruation') return;

    const correction = correctionMap.get(pred.predicted_date);

    if (!correction) {
      // Se não houve correção, considera acerto (o usuário confirmou ou não alterou)
      correct++;
    } else {
      if (correction.correction_type === 'delay') {
        delays++;
        // Quantos dias de atraso?
        const diff = dateDiffInDays(correction.actual_result, correction.original_prediction);
        if (diff > 0) delayDays += diff;
      } else if (correction.correction_type === 'anticipation') {
        anticipations++;
        // Quantos dias de antecipação?
        const diff = dateDiffInDays(correction.original_prediction, correction.actual_result);
        if (diff > 0) anticipationDays += diff;
      }
    }
  });

  const totalPredictions = correct + delays + anticipations;
  const accuracy = totalPredictions ? (correct / totalPredictions) * 100 : 0;

  return {
    totalPredictions,
    correct,
    delays,
    anticipations,
    accuracy: Math.round(accuracy * 10) / 10, // arredonda para 1 casa
    delayDays,
    anticipationDays
  };
}

// Função para diferença de dias entre datas (YYYY-MM-DD)
function dateDiffInDays(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  const diffTime = dateA.getTime() - dateB.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}