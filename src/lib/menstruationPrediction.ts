import { format, addDays, addMonths, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { BillingData } from './supabase';

export interface CycleData {
  averageCycle: number;
  averageDuration: number;
  periods: Array<{
    startDate: string;
    endDate: string;
    duration: number;
  }>;
}

// Ajustado para refletir os nomes e valores aceitos pelo banco Supabase
export interface PredictionData {
  predicted_date: string;
  prediction_type: 'menstruation' | 'end_menstruation' | 'ovulation' | 'fertile';
  isPrediction: boolean;
  confidence: number;
}

export interface CorrectionData {
  date: string;
  type: 'delay' | 'anticipation';
  corrected_date: string;
}

// Em menstruationPrediction.ts, na função calculateCycleData:
export const calculateCycleData = (billingData: BillingData[], lookbackMonths: number = 6): CycleData => {
  console.log('=== CALCULANDO DADOS DO CICLO ===');
  console.log('Total de dados recebidos:', billingData.length);
  
  // IMPORTANTE: Use a data atual real, não do futuro
  const today = new Date();
  const cutoffDate = new Date(today.getFullYear(), today.getMonth() - lookbackMonths, 1);
  console.log('Data de corte:', format(cutoffDate, 'yyyy-MM-dd'));
  
  const menstruationData = billingData
    .filter(data => {
      const hasM = data.menstruacao && data.menstruacao !== 'sem_sangramento';
      const dataDate = new Date(data.date);
      const isAfterCutoff = dataDate >= cutoffDate;
      const isBeforeToday = dataDate <= today; // Não incluir dados futuros
      return hasM && isAfterCutoff && isBeforeToday;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (menstruationData.length === 0) {
    return { averageCycle: 28, averageDuration: 5, periods: [] };
  }

  // Agrupar dias consecutivos de menstruação em períodos
  const periods: Array<{ startDate: string; endDate: string; duration: number }> = [];
  let currentPeriod: { startDate: string; endDate: string } | null = null;

  menstruationData.forEach((data, index) => {
    const currentDate = new Date(data.date);
    const prevDate = index > 0 ? new Date(menstruationData[index - 1].date) : null;
    if (!currentPeriod || (prevDate && differenceInDays(currentDate, prevDate) > 1)) {
      if (currentPeriod) {
        periods.push({
          ...currentPeriod,
          duration: differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate)) + 1
        });
      }
      currentPeriod = { startDate: data.date, endDate: data.date };
    } else {
      currentPeriod.endDate = data.date;
    }
  });

  // Adicionar o último período
  if (currentPeriod) {
    periods.push({
      ...currentPeriod,
      duration: differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate)) + 1
    });
  }

  // Calcular médias
  const cycleLengths: number[] = [];
  for (let i = 1; i < periods.length; i++) {
    const daysBetween = differenceInDays(new Date(periods[i].startDate), new Date(periods[i - 1].startDate));
    cycleLengths.push(daysBetween);
  }

  const averageCycle = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
    : 28;

  const averageDuration = periods.length > 0
    ? Math.round(periods.reduce((sum, period) => sum + period.duration, 0) / periods.length)
    : 5;

  return { averageCycle, averageDuration, periods };
};

// src/lib/menstruationPrediction.ts
// SUBSTITUA a função generatePredictions por esta versão corrigida:

export const generatePredictions = (cycleData: CycleData, months: number = 6): PredictionData[] => {
  console.log('=== GERANDO PREDIÇÕES ===');
  console.log('Ciclo médio:', cycleData.averageCycle);
  console.log('Duração média:', cycleData.averageDuration);
  console.log('Períodos encontrados:', cycleData.periods);
  
  const predictions: PredictionData[] = [];
  const { averageCycle, averageDuration, periods } = cycleData;
  
  if (periods.length === 0) {
    console.log('ERRO: Nenhum período encontrado!');
    return predictions;
  }

  // Começar a partir do último período conhecido
  const lastPeriod = periods[periods.length - 1];
  console.log('Último período:', lastPeriod.startDate);
  
  let nextPeriodStart = addDays(new Date(lastPeriod.startDate), averageCycle);
  console.log('Próxima menstruação prevista:', format(nextPeriodStart, 'yyyy-MM-dd'));
  
  // Gerar predições para os próximos X meses
  const endDate = addMonths(new Date(), months);
  
  while (nextPeriodStart <= endDate) {
    // Predizer período menstrual
    for (let day = 0; day < averageDuration; day++) {
      const predictionDate = addDays(nextPeriodStart, day);
      predictions.push({
        date: format(predictionDate, 'yyyy-MM-dd'),
        type: 'menstruation', // REMOVIDO 'end_menstruation' que estava causando erro
        isPrediction: true,
        confidence: 0.8
      });
    }

    // Predizer ovulação (meio do ciclo)
    const ovulationDay = addDays(nextPeriodStart, Math.floor(averageCycle / 2));
    predictions.push({
      date: format(ovulationDay, 'yyyy-MM-dd'),
      type: 'ovulation',
      isPrediction: true,
      confidence: 0.7
    });

    // Predizer dias férteis (3 dias antes e depois da ovulação)
    for (let day = -3; day <= 3; day++) {
      if (day !== 0) { // Não incluir o dia da ovulação
        const fertileDay = addDays(ovulationDay, day);
        predictions.push({
          date: format(fertileDay, 'yyyy-MM-dd'),
          type: 'fertile',
          isPrediction: true,
          confidence: 0.6
        });
      }
    }

    // Próximo ciclo
    nextPeriodStart = addDays(nextPeriodStart, averageCycle);
  }

  console.log('Predições geradas:', predictions.length);
  return predictions;
};

export const calculateMonthInsights = (
  year: number,
  month: number,
  billingData: BillingData[],
  predictions: PredictionData[],
  corrections: CorrectionData[]
) => {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(new Date(year, month, 1));

  // Filtrar dados do mês
  const monthData = billingData.filter(data => {
    const dataDate = new Date(data.date);
    return dataDate >= monthStart && dataDate <= monthEnd;
  });

  const monthPredictions = predictions.filter(pred => {
    const predDate = new Date(pred.predicted_date);
    return predDate >= monthStart && predDate <= monthEnd && pred.prediction_type === 'menstruation';
  });

  const monthCorrections = corrections.filter(corr => {
    const corrDate = new Date(corr.date);
    return corrDate >= monthStart && corrDate <= monthEnd;
  });

  // Contar dias de menstruação reais
  const actualMenstruationDays = monthData.filter(data =>
    data.menstruacao && data.menstruacao !== 'sem_sangramento'
  ).length;

  // Calcular atrasos e antecipações
  const delays = monthCorrections.filter(corr => corr.type === 'delay').length;
  const anticipations = monthCorrections.filter(corr => corr.type === 'anticipation').length;

  // Calcular precisão
  const totalPredictions = monthPredictions.length;
  const correctPredictions = totalPredictions - monthCorrections.length;
  const accuracy = totalPredictions > 0 ?
    ((correctPredictions / totalPredictions) * 100).toFixed(1) : '100';

  return {
    menstruationDays: actualMenstruationDays,
    predictedDays: monthPredictions.length,
    delays,
    anticipations,
    accuracy
  };
};