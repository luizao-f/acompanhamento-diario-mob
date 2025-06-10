// src/lib/predictionTracking.ts - VERSÃO CORRIGIDA COMPLETA
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

// Função para comparar predições com dados reais - CORRIGIDA
export const comparePredictionsWithActual = (
  predictions: PredictionData[],
  actualData: BillingData[],
  startDate: Date,
  endDate: Date
): PredictionComparison[] => {
  const comparisons: PredictionComparison[] = [];
  
  console.log('=== COMPARISON DEBUG ===');
  console.log('Período de comparação:', format(startDate, 'yyyy-MM-dd'), 'até', format(endDate, 'yyyy-MM-dd'));
  
  // Filtrar predições de menstruação para o período específico
  const menstruationPredictions = predictions.filter(p => {
    const predDate = new Date(p.date);
    return p.type === 'menstruation' && 
           predDate >= startDate && 
           predDate <= endDate;
  });
  
  console.log('Predições de menstruação no período:', menstruationPredictions.length);
  if (menstruationPredictions.length > 0) {
    console.log('Datas previstas:', menstruationPredictions.map(p => p.date));
  }
  
  // Filtrar dados reais de menstruação para o período específico
  const actualMenstruation = actualData.filter(d => {
    const actualDate = new Date(d.date);
    return d.menstruacao && 
           d.menstruacao !== 'sem_sangramento' &&
           actualDate >= startDate && 
           actualDate <= endDate;
  });
  
  console.log('Dados reais de menstruação no período:', actualMenstruation.length);
  if (actualMenstruation.length > 0) {
    console.log('Datas reais:', actualMenstruation.map(d => d.date));
  }
  
  // Criar mapas para acesso rápido
  const actualMap = new Map<string, BillingData>();
  actualData.forEach(data => {
    actualMap.set(data.date, data);
  });
  
  const predictionMap = new Map<string, PredictionData>();
  menstruationPredictions.forEach(pred => {
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
      type = 'false_positive'; // Previu mas não aconteceu (possível atraso)
    } else if (!predicted && actualMenstruation) {
      type = 'false_negative'; // Não previu mas aconteceu (possível antecipação)
    } else {
      type = 'true_negative'; // Não previu e não aconteceu
    }
    
    // CORREÇÃO: Só adicionar comparações relevantes (que têm predição OU dados reais)
    if (predicted || actualMenstruation) {
      comparisons.push({
        date: dateStr,
        predicted,
        actual: !!actualMenstruation,
        type
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  console.log('Comparações geradas:', comparisons.length);
  console.log('- Corretas:', comparisons.filter(c => c.type === 'correct').length);
  console.log('- Falsos positivos (atraso):', comparisons.filter(c => c.type === 'false_positive').length);
  console.log('- Falsos negativos (antecipação):', comparisons.filter(c => c.type === 'false_negative').length);
  console.log('- Verdadeiros negativos:', comparisons.filter(c => c.type === 'true_negative').length);
  console.log('=== FIM COMPARISON DEBUG ===');
  
  return comparisons;
};

// Função para calcular atrasos e antecipações - MELHORADA
export const calculateDelaysAndAnticipations = (
  predictions: PredictionData[],
  actualData: BillingData[]
): { delays: Array<{date: string, days: number}>, anticipations: Array<{date: string, days: number}> } => {
  const delays: Array<{date: string, days: number}> = [];
  const anticipations: Array<{date: string, days: number}> = [];
  
  console.log('=== DELAYS & ANTICIPATIONS DEBUG ===');
  
  // Agrupar predições e dados reais por períodos
  const predictedPeriods = groupIntoPeriods(
    predictions.filter(p => p.type === 'menstruation').map(p => p.date)
  );
  
  const actualPeriods = groupIntoPeriods(
    actualData
      .filter(d => d.menstruacao && d.menstruacao !== 'sem_sangramento')
      .map(d => d.date)
  );
  
  console.log('Períodos previstos:', predictedPeriods.length);
  console.log('Períodos reais:', actualPeriods.length);
  
  // Comparar cada período previsto com o real mais próximo
  predictedPeriods.forEach((predictedPeriod, index) => {
    const predictedStart = parseISO(predictedPeriod.start);
    
    console.log(`\nAnalisando período previsto ${index + 1}:`, predictedPeriod.start);
    
    // Encontrar o período real mais próximo
    let closestActual = null;
    let minDiff = Infinity;
    
    actualPeriods.forEach(actualPeriod => {
      const actualStart = parseISO(actualPeriod.start);
      const diff = Math.abs(differenceInDays(actualStart, predictedStart));
      
      console.log(`  - Comparando com período real ${actualPeriod.start}: diff = ${diff} dias`);
      
      if (diff < minDiff && diff <= 10) { // Aumentei para 10 dias de tolerância
        minDiff = diff;
        closestActual = actualPeriod;
      }
    });
    
    if (closestActual) {
      const actualStart = parseISO(closestActual.start);
      const daysDiff = differenceInDays(actualStart, predictedStart);
      
      console.log(`  - Melhor match: ${closestActual.start}, diferença: ${daysDiff} dias`);
      
      if (daysDiff > 1) { // Tolerância de 1 dia
        // Atraso: menstruação veio depois do previsto
        delays.push({
          date: predictedPeriod.start,
          days: daysDiff
        });
        console.log(`  - ATRASO: ${daysDiff} dias`);
      } else if (daysDiff < -1) { // Tolerância de 1 dia
        // Antecipação: menstruação veio antes do previsto
        anticipations.push({
          date: closestActual.start,
          days: Math.abs(daysDiff)
        });
        console.log(`  - ANTECIPAÇÃO: ${Math.abs(daysDiff)} dias`);
      } else {
        console.log(`  - CORRETO: diferença dentro da tolerância (${daysDiff} dia)`);
      }
    } else {
      console.log(`  - Nenhum período real próximo encontrado`);
    }
  });
  
  console.log('\nRESULTADO FINAL:');
  console.log('- Atrasos:', delays.length, delays);
  console.log('- Antecipações:', anticipations.length, anticipations);
  console.log('=== FIM DELAYS & ANTICIPATIONS DEBUG ===');
  
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
      // Novo período (mais de 1 dia de diferença)
      periods.push(currentPeriod);
      currentPeriod = { start: sortedDates[i], end: sortedDates[i] };
    }
  }
  
  periods.push(currentPeriod);
  return periods;
}

// Função para calcular métricas de precisão - APRIMORADA
export const calculatePredictionAccuracy = (
  comparisons: PredictionComparison[],
  delays: Array<{date: string, days: number}>,
  anticipations: Array<{date: string, days: number}>
): PredictionAccuracy => {
  // Só considerar comparações relevantes (que têm predição OU dados reais)
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
  
  console.log('=== ACCURACY CALCULATION ===');
  console.log('Total comparações:', totalDays);
  console.log('Corretas:', correctPredictions);
  console.log('Falsos positivos:', falsePositives);
  console.log('Falsos negativos:', falseNegatives);
  console.log('Precisão calculada:', accuracy.toFixed(1) + '%');
  console.log('=== FIM ACCURACY ===');
  
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