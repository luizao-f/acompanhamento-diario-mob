// src/lib/predictionTracking.ts
import { format, differenceInDays, parseISO } from 'date-fns';
import { BillingData } from './supabase';
import { PredictionData } from './menstruationPrediction';

export interface PredictionComparison {
  date: string;
  predicted: boolean;
  actual: boolean;
  type: 'correct' | 'false_positive' | 'false_negative' | 'true_negative';
  daysDifference?: number; // Para atrasos/antecipações
}

export interface PredictionAccuracy {
  accuracy: number;
  totalDays: number;
  correctPredictions: number;
  falsePositives: number; // Previu mas não aconteceu (atraso)
  falseNegatives: number; // Não previu mas aconteceu (antecipação)
  delayDays: number; // Total de dias de atraso
  anticipationDays: number; // Total de dias de antecipação
}

// Função para comparar predições com dados reais
export const comparePredictionsWithActual = (
  predictions: PredictionData[],
  actualData: BillingData[],
  startDate: Date,
  endDate: Date
): PredictionComparison[] => {
  const comparisons: PredictionComparison[] = [];
  
  // Criar um mapa de dados reais para acesso rápido
  const actualMap = new Map<string, BillingData>();
  actualData.forEach(data => {
    actualMap.set(data.date, data);
  });
  
  // Criar um mapa de predições
  const predictionMap = new Map<string, PredictionData>();
  predictions
    .filter(p => p.type === 'menstruation')
    .forEach(pred => {
      predictionMap.set(pred.date, pred);
    });
  
  // Iterar por todos os dias no período
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const prediction = predictionMap.get(dateStr);
    const actual = actualMap.get(dateStr);
    
    const predicted = !!prediction;
    const actualMenstruation = actual?.menstruacao && actual.menstruacao !== 'sem_sangramento';
    
    let type: PredictionComparison['type'];
    if (predicted && actualMenstruation) {
      type = 'correct';
    } else if (predicted && !actualMenstruation) {
      type = 'false_positive'; // Previu mas não aconteceu
    } else if (!predicted && actualMenstruation) {
      type = 'false_negative'; // Não previu mas aconteceu
    } else {
      type = 'true_negative';
    }
    
    comparisons.push({
      date: dateStr,
      predicted,
      actual: !!actualMenstruation,
      type
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return comparisons;
};

// Função para calcular atrasos e antecipações
export const calculateDelaysAndAnticipations = (
  predictions: PredictionData[],
  actualData: BillingData[]
): { delays: Array<{date: string, days: number}>, anticipations: Array<{date: string, days: number}> } => {
  const delays: Array<{date: string, days: number}> = [];
  const anticipations: Array<{date: string, days: number}> = [];
  
  // Agrupar predições e dados reais por períodos
  const predictedPeriods = groupIntoPeriods(
    predictions.filter(p => p.type === 'menstruation').map(p => p.date)
  );
  
  const actualPeriods = groupIntoPeriods(
    actualData
      .filter(d => d.menstruacao && d.menstruacao !== 'sem_sangramento')
      .map(d => d.date)
  );
  
  // Comparar cada período previsto com o real mais próximo
  predictedPeriods.forEach(predictedPeriod => {
    const predictedStart = parseISO(predictedPeriod.start);
    
    // Encontrar o período real mais próximo
    let closestActual = null;
    let minDiff = Infinity;
    
    actualPeriods.forEach(actualPeriod => {
      const actualStart = parseISO(actualPeriod.start);
      const diff = Math.abs(differenceInDays(actualStart, predictedStart));
      
      if (diff < minDiff && diff <= 7) { // Considera apenas diferenças de até 7 dias
        minDiff = diff;
        closestActual = actualPeriod;
      }
    });
    
    if (closestActual) {
      const actualStart = parseISO(closestActual.start);
      const daysDiff = differenceInDays(actualStart, predictedStart);
      
      if (daysDiff > 0) {
        // Atraso: menstruação veio depois do previsto
        delays.push({
          date: predictedPeriod.start,
          days: daysDiff
        });
      } else if (daysDiff < 0) {
        // Antecipação: menstruação veio antes do previsto
        anticipations.push({
          date: closestActual.start,
          days: Math.abs(daysDiff)
        });
      }
    }
  });
  
  return { delays, anticipations };
};

// Função auxiliar para agrupar datas consecutivas em períodos
function groupIntoPeriods(dates: string[]): Array<{start: string, end: string}> {
  if (dates.length === 0) return [];
  
  const sortedDates = [...dates].sort();
  const periods: Array<{start: string, end: string}> = [];
  
  let currentPeriod = { start: sortedDates[0], end: sortedDates[0] };
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(currentPeriod.end);
    const currentDate = parseISO(sortedDates[i]);
    const daysDiff = differenceInDays(currentDate, prevDate);
    
    if (daysDiff === 1) {
      // Dia consecutivo, estende o período
      currentPeriod.end = sortedDates[i];
    } else {
      // Novo período
      periods.push(currentPeriod);
      currentPeriod = { start: sortedDates[i], end: sortedDates[i] };
    }
  }
  
  periods.push(currentPeriod);
  return periods;
}

// Função para calcular métricas de precisão
export const calculatePredictionAccuracy = (
  comparisons: PredictionComparison[],
  delays: Array<{date: string, days: number}>,
  anticipations: Array<{date: string, days: number}>
): PredictionAccuracy => {
  const menstruationComparisons = comparisons.filter(
    c => c.predicted || c.actual
  );
  
  const correctPredictions = menstruationComparisons.filter(
    c => c.type === 'correct'
  ).length;
  
  const falsePositives = menstruationComparisons.filter(
    c => c.type === 'false_positive'
  ).length;
  
  const falseNegatives = menstruationComparisons.filter(
    c => c.type === 'false_negative'
  ).length;
  
  const totalDays = menstruationComparisons.length;
  const accuracy = totalDays > 0 ? (correctPredictions / totalDays) * 100 : 100;
  
  const delayDays = delays.reduce((sum, d) => sum + d.days, 0);
  const anticipationDays = anticipations.reduce((sum, a) => sum + a.days, 0);
  
  return {
    accuracy,
    totalDays,
    correctPredictions,
    falsePositives,
    falseNegatives,
    delayDays,
    anticipationDays
  };
};