
import { supabase } from '@/integrations/supabase/client';
import { format, addDays, subMonths, startOfMonth, endOfMonth, differenceInDays, parseISO } from 'date-fns';

export interface MenstruationPeriod {
  startDate: Date;
  endDate: Date;
  duration: number;
}

export interface CycleData {
  averageCycle: number;
  averageDuration: number;
  periods: MenstruationPeriod[];
}

export interface PredictionData {
  date: string;
  isPredicted: boolean;
  isActual: boolean;
  correctionType?: 'false_positive' | 'false_negative' | null;
}

export interface MonthInsights {
  menstruationDays: number;
  delays: number;
  advances: number;
  averageDelay: number;
  averageAdvance: number;
  corrections: number;
}

// Calcular dados do ciclo baseado no histórico
export const calculateCycleData = async (lookbackMonths: number = 6): Promise<CycleData | null> => {
  try {
    const startDate = format(subMonths(new Date(), lookbackMonths), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');

    const { data, error } = await supabase
      .from('billings_data')
      .select('date, menstruacao')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date');

    if (error) throw error;
    if (!data || data.length === 0) return null;

    // Encontrar períodos de menstruação
    const periods: MenstruationPeriod[] = [];
    let currentPeriod: { start: Date; end?: Date } | null = null;

    for (const record of data) {
      const isMenstruation = record.menstruacao && record.menstruacao !== 'sem_sangramento';
      const recordDate = parseISO(record.date);

      if (isMenstruation && !currentPeriod) {
        // Início de um novo período
        currentPeriod = { start: recordDate };
      } else if (!isMenstruation && currentPeriod && !currentPeriod.end) {
        // Fim do período atual
        currentPeriod.end = addDays(recordDate, -1);
        periods.push({
          startDate: currentPeriod.start,
          endDate: currentPeriod.end,
          duration: differenceInDays(currentPeriod.end, currentPeriod.start) + 1
        });
        currentPeriod = null;
      }
    }

    // Se ainda há um período ativo, finalizar com a data atual
    if (currentPeriod && !currentPeriod.end) {
      currentPeriod.end = new Date();
      periods.push({
        startDate: currentPeriod.start,
        endDate: currentPeriod.end,
        duration: differenceInDays(currentPeriod.end, currentPeriod.start) + 1
      });
    }

    if (periods.length < 2) return null;

    // Calcular médias
    const cycles = [];
    for (let i = 1; i < periods.length; i++) {
      const cycleDays = differenceInDays(periods[i].startDate, periods[i - 1].startDate);
      cycles.push(cycleDays);
    }

    const averageCycle = cycles.reduce((sum, cycle) => sum + cycle, 0) / cycles.length;
    const averageDuration = periods.reduce((sum, period) => sum + period.duration, 0) / periods.length;

    return {
      averageCycle,
      averageDuration,
      periods
    };
  } catch (error) {
    console.error('Error calculating cycle data:', error);
    return null;
  }
};

// Gerar predições para os próximos 6 meses
export const generatePredictions = async (cycleData: CycleData): Promise<void> => {
  try {
    const lastPeriod = cycleData.periods[cycleData.periods.length - 1];
    if (!lastPeriod) return;

    // Limpar predições existentes futuras
    await supabase
      .from('menstruation_predictions')
      .delete()
      .gte('predicted_date', format(new Date(), 'yyyy-MM-dd'));

    const predictions = [];
    let nextPredictedStart = addDays(lastPeriod.startDate, Math.round(cycleData.averageCycle));

    // Gerar predições para 6 meses à frente
    for (let i = 0; i < 6; i++) {
      // Predição do início da menstruação
      predictions.push({
        predicted_date: format(nextPredictedStart, 'yyyy-MM-dd'),
        prediction_type: 'menstruation',
        confidence_score: 0.8,
        based_on_months: 6,
        cycle_average: cycleData.averageCycle,
        duration_average: cycleData.averageDuration
      });

      // Predições para cada dia do período de menstruação
      for (let day = 1; day < Math.round(cycleData.averageDuration); day++) {
        const menstruationDay = addDays(nextPredictedStart, day);
        predictions.push({
          predicted_date: format(menstruationDay, 'yyyy-MM-dd'),
          prediction_type: 'menstruation',
          confidence_score: 0.8,
          based_on_months: 6,
          cycle_average: cycleData.averageCycle,
          duration_average: cycleData.averageDuration
        });
      }

      nextPredictedStart = addDays(nextPredictedStart, Math.round(cycleData.averageCycle));
    }

    // Salvar predições
    const { error } = await supabase
      .from('menstruation_predictions')
      .insert(predictions);

    if (error) throw error;
  } catch (error) {
    console.error('Error generating predictions:', error);
  }
};

// Buscar predições para um mês específico
export const getPredictionsForMonth = async (year: number, month: number): Promise<PredictionData[]> => {
  try {
    const startDate = format(startOfMonth(new Date(year, month)), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(new Date(year, month)), 'yyyy-MM-dd');

    const [predictionsResponse, correctionsResponse, actualResponse] = await Promise.all([
      supabase
        .from('menstruation_predictions')
        .select('predicted_date')
        .gte('predicted_date', startDate)
        .lte('predicted_date', endDate)
        .eq('prediction_type', 'menstruation'),
      
      supabase
        .from('menstruation_corrections')
        .select('correction_date, correction_type, original_prediction, actual_result')
        .gte('correction_date', startDate)
        .lte('correction_date', endDate),
      
      supabase
        .from('billings_data')
        .select('date, menstruacao')
        .gte('date', startDate)
        .lte('date', endDate)
    ]);

    const predictions = predictionsResponse.data || [];
    const corrections = correctionsResponse.data || [];
    const actual = actualResponse.data || [];

    const result: PredictionData[] = [];
    const currentDate = new Date(year, month, 1);
    const lastDay = endOfMonth(currentDate).getDate();

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
      
      const isPredicted = predictions.some(p => p.predicted_date === dateStr);
      const actualRecord = actual.find(a => a.date === dateStr);
      const isActual = actualRecord && actualRecord.menstruacao && actualRecord.menstruacao !== 'sem_sangramento';
      const correction = corrections.find(c => c.correction_date === dateStr);

      result.push({
        date: dateStr,
        isPredicted,
        isActual: !!isActual,
        correctionType: correction?.correction_type as 'false_positive' | 'false_negative' | null || null
      });
    }

    return result;
  } catch (error) {
    console.error('Error getting predictions for month:', error);
    return [];
  }
};

// Calcular insights do mês
export const calculateMonthInsights = async (year: number, month: number): Promise<MonthInsights> => {
  try {
    const predictions = await getPredictionsForMonth(year, month);
    
    let menstruationDays = 0;
    let delays = 0;
    let advances = 0;
    let corrections = 0;
    let totalDelayDays = 0;
    let totalAdvanceDays = 0;

    predictions.forEach(pred => {
      if (pred.isActual) menstruationDays++;
      if (pred.correctionType) corrections++;
      
      if (pred.correctionType === 'false_positive') {
        // Sistema previu mas não aconteceu
        delays++;
      } else if (pred.correctionType === 'false_negative') {
        // Sistema não previu mas aconteceu
        advances++;
      }
    });

    return {
      menstruationDays,
      delays,
      advances,
      averageDelay: delays > 0 ? totalDelayDays / delays : 0,
      averageAdvance: advances > 0 ? totalAdvanceDays / advances : 0,
      corrections
    };
  } catch (error) {
    console.error('Error calculating month insights:', error);
    return {
      menstruationDays: 0,
      delays: 0,
      advances: 0,
      averageDelay: 0,
      averageAdvance: 0,
      corrections: 0
    };
  }
};

// Atualizar configurações de lookback
export const updateLookbackMonths = async (months: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('prediction_settings')
      .upsert({ lookback_months: months }, { onConflict: 'user_id' });

    if (error) throw error;

    // Recalcular predições com novo lookback
    const cycleData = await calculateCycleData(months);
    if (cycleData) {
      await generatePredictions(cycleData);
    }
  } catch (error) {
    console.error('Error updating lookback months:', error);
  }
};

// Buscar configurações de lookback
export const getLookbackMonths = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('prediction_settings')
      .select('lookback_months')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    return data?.lookback_months || 6;
  } catch (error) {
    console.error('Error getting lookback months:', error);
    return 6;
  }
};
