// src/lib/menstruationPrediction.ts - VERSÃO CORRIGIDA COMPLETA

import { format, addDays, addMonths, differenceInDays, parseISO, startOfMonth, endOfMonth } from 'date-fns';
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

export interface PredictionData {
  date: string;
  type: 'menstruation' | 'fertile' | 'ovulation';
  isPrediction: boolean;
  confidence: number;
}

export interface CorrectionData {
  date: string;
  type: 'false_positive' | 'false_negative';
  originalPrediction: boolean;
  actualResult: boolean;
}

export const calculateCycleData = (billingData: BillingData[], lookbackMonths: number = 6): CycleData => {
  console.log('=== CYCLE CALCULATION DEBUG ===');
  console.log('Dados recebidos:', billingData.length, 'registros');
  console.log('Lookback months:', lookbackMonths);
  
  // Filtrar apenas dados com menstruação dos últimos X meses
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - lookbackMonths);
  
  console.log('Data de corte:', format(cutoffDate, 'yyyy-MM-dd'));
  
  const menstruationData = billingData
    .filter(data => data.menstruacao && data.menstruacao !== 'sem_sangramento')
    .filter(data => new Date(data.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log('Dados de menstruação filtrados:', menstruationData.length);
  console.log('Primeiros 10 registros:', menstruationData.slice(0, 10).map(d => `${d.date} (${d.menstruacao})`));

  if (menstruationData.length === 0) {
    console.log('Nenhum dado encontrado, retornando valores padrão');
    return { averageCycle: 28, averageDuration: 5, periods: [] };
  }

  // Agrupar dias consecutivos de menstruação em períodos
  const periods: Array<{ startDate: string; endDate: string; duration: number }> = [];
  let currentPeriod: { startDate: string; endDate: string } | null = null;

  menstruationData.forEach((data, index) => {
    const currentDate = new Date(data.date);
    const prevDate = index > 0 ? new Date(menstruationData[index - 1].date) : null;
    
    // Se é o primeiro registro ou há mais de 1 dia de diferença, inicia novo período
    if (!currentPeriod || (prevDate && differenceInDays(currentDate, prevDate) > 1)) {
      // Finaliza período anterior se existir
      if (currentPeriod) {
        const duration = differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate)) + 1;
        periods.push({
          ...currentPeriod,
          duration
        });
        console.log(`Período finalizado: ${currentPeriod.startDate} a ${currentPeriod.endDate} (${duration} dias)`);
      }
      // Inicia novo período
      currentPeriod = { startDate: data.date, endDate: data.date };
      console.log(`Novo período iniciado: ${data.date}`);
    } else {
      // Estende período atual
      currentPeriod.endDate = data.date;
      console.log(`Período estendido até: ${data.date}`);
    }
  });

  // Adicionar o último período
  if (currentPeriod) {
    const duration = differenceInDays(new Date(currentPeriod.endDate), new Date(currentPeriod.startDate)) + 1;
    periods.push({
      ...currentPeriod,
      duration
    });
    console.log(`Último período: ${currentPeriod.startDate} a ${currentPeriod.endDate} (${duration} dias)`);
  }

  console.log('Total de períodos identificados:', periods.length);
  console.log('Períodos completos:', periods);

  // CORREÇÃO: Calcular ciclos (diferença entre inícios de períodos consecutivos)
  const cycleLengths: number[] = [];
  for (let i = 1; i < periods.length; i++) {
    const currentStart = new Date(periods[i].startDate);
    const prevStart = new Date(periods[i - 1].startDate);
    const daysBetween = differenceInDays(currentStart, prevStart);
    cycleLengths.push(daysBetween);
    console.log(`Ciclo ${i}: ${periods[i-1].startDate} -> ${periods[i].startDate} = ${daysBetween} dias`);
  }

  const averageCycle = cycleLengths.length > 0 
    ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
    : 28;

  const averageDuration = periods.length > 0
    ? Math.round(periods.reduce((sum, period) => sum + period.duration, 0) / periods.length)
    : 5;

  console.log('RESULTADO FINAL:');
  console.log('- Ciclos calculados:', cycleLengths);
  console.log('- Ciclo médio:', averageCycle, 'dias');
  console.log('- Duração média:', averageDuration, 'dias');
  console.log('- Períodos analisados:', periods.length);
  console.log('=== FIM CYCLE CALCULATION ===');

  return { averageCycle, averageDuration, periods };
};

export const generatePredictions = (cycleData: CycleData, months: number = 6): PredictionData[] => {
  const predictions: PredictionData[] = [];
  const { averageCycle, averageDuration, periods } = cycleData;
  
  console.log('=== PREDICTION GENERATION DEBUG ===');
  console.log('Gerando predições com:', { averageCycle, averageDuration, periodsCount: periods.length });
  
  if (periods.length === 0) {
    console.log('Nenhum período encontrado, retornando predições vazias');
    return predictions;
  }

  // CORREÇÃO CRÍTICA: Usar o INÍCIO do último período + ciclo médio
  const lastPeriod = periods[periods.length - 1];
  const lastPeriodStart = parseISO(lastPeriod.startDate);
  
  // ERRO CORRIGIDO: A próxima menstruação deve ser calculada baseada no INÍCIO do período anterior
  let nextPeriodStart = addDays(lastPeriodStart, averageCycle);
  
  console.log('Último período:', lastPeriod);
  console.log('Data de início do último período:', format(lastPeriodStart, 'yyyy-MM-dd'));
  console.log('Próxima menstruação calculada para:', format(nextPeriodStart, 'yyyy-MM-dd'));
  console.log('Cálculo: ', format(lastPeriodStart, 'yyyy-MM-dd'), '+', averageCycle, 'dias =', format(nextPeriodStart, 'yyyy-MM-dd'));
  
  // Gerar predições para os próximos X meses
  const endDate = addMonths(new Date(), months);
  let cycleCount = 0;
  
  while (nextPeriodStart <= endDate && cycleCount < 12) { // Limite de segurança
    cycleCount++;
    console.log(`\n--- CICLO ${cycleCount} ---`);
    console.log('Início da menstruação prevista:', format(nextPeriodStart, 'yyyy-MM-dd'));
    
    // 1. Predizer período menstrual
    for (let day = 0; day < averageDuration; day++) {
      const predictionDate = addDays(nextPeriodStart, day);
      predictions.push({
        date: format(predictionDate, 'yyyy-MM-dd'),
        type: 'menstruation',
        isPrediction: true,
        confidence: 0.8
      });
    }
    
    // 2. CORREÇÃO: Calcular ovulação corretamente (14 dias antes da PRÓXIMA menstruação)
    const nextCycleStart = addDays(nextPeriodStart, averageCycle);
    const ovulationDay = addDays(nextCycleStart, -14); // 14 dias antes da próxima menstruação
    
    console.log('Ovulação calculada para:', format(ovulationDay, 'yyyy-MM-dd'));
    console.log('Próximo ciclo começará em:', format(nextCycleStart, 'yyyy-MM-dd'));
    
    // Só adicionar ovulação se for no futuro e não conflitar com menstruação
    const menstruationEnd = addDays(nextPeriodStart, averageDuration - 1);
    if (ovulationDay > menstruationEnd && ovulationDay < nextCycleStart) {
      predictions.push({
        date: format(ovulationDay, 'yyyy-MM-dd'),
        type: 'ovulation',
        isPrediction: true,
        confidence: 0.7
      });

      // 3. Predizer dias férteis (3 dias antes e depois da ovulação)
      for (let day = -3; day <= 3; day++) {
        if (day !== 0) { // Não incluir o dia da ovulação
          const fertileDay = addDays(ovulationDay, day);
          // Só adicionar se não conflitar com menstruação
          if (fertileDay > menstruationEnd && fertileDay < nextCycleStart) {
            predictions.push({
              date: format(fertileDay, 'yyyy-MM-dd'),
              type: 'fertile',
              isPrediction: true,
              confidence: 0.6
            });
          }
        }
      }
    }

    // CORREÇÃO: Próximo ciclo baseado no início do ciclo atual
    nextPeriodStart = nextCycleStart;
  }

  console.log('Total de predições geradas:', predictions.length);
  console.log('Predições de menstruação:', predictions.filter(p => p.type === 'menstruation').length);
  console.log('Primeiras 10 predições:');
  predictions.slice(0, 10).forEach(p => {
    console.log(`  ${p.date}: ${p.type}`);
  });
  console.log('=== FIM PREDICTION GENERATION ===');
  
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
  
  console.log('=== MONTH INSIGHTS DEBUG ===');
  console.log('Analisando mês:', format(monthStart, 'yyyy-MM'));
  
  // Filtrar dados do mês
  const monthData = billingData.filter(data => {
    const dataDate = new Date(data.date);
    return dataDate >= monthStart && dataDate <= monthEnd;
  });

  const monthPredictions = predictions.filter(pred => {
    const predDate = new Date(pred.date);
    return predDate >= monthStart && predDate <= monthEnd && pred.type === 'menstruation';
  });

  const monthCorrections = corrections.filter(corr => {
    const corrDate = new Date(corr.date);
    return corrDate >= monthStart && corrDate <= monthEnd;
  });

  console.log('Dados do mês:', monthData.length);
  console.log('Predições do mês:', monthPredictions.length);
  console.log('Correções do mês:', monthCorrections.length);

  // Contar dias de menstruação reais
  const actualMenstruationDays = monthData.filter(data => 
    data.menstruacao && data.menstruacao !== 'sem_sangramento'
  ).length;

  // CORREÇÃO: Calcular atrasos e antecipações corretamente
  const delays = monthCorrections.filter(corr => corr.type === 'false_positive').length; // Previu mas não aconteceu
  const anticipations = monthCorrections.filter(corr => corr.type === 'false_negative').length; // Não previu mas aconteceu

  // Calcular precisão
  const totalPredictions = monthPredictions.length;
  const correctPredictions = totalPredictions - monthCorrections.length;
  const accuracy = totalPredictions > 0 ? 
    ((correctPredictions / totalPredictions) * 100).toFixed(1) : '100';

  const result = {
    menstruationDays: actualMenstruationDays,
    predictedDays: monthPredictions.length,
    delays,
    anticipations,
    accuracy
  };

  console.log('Resultado insights:', result);
  console.log('=== FIM MONTH INSIGHTS ===');

  return result;
};