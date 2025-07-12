// Adicione esta função no arquivo src/lib/cycleCalculations.ts (crie este arquivo)

import { format, parseISO, differenceInDays, addDays } from 'date-fns';

interface BillingData {
  date: string;
  menstruacao?: string;
  [key: string]: any;
}

/**
 * Encontra todos os períodos de menstruação nos dados
 */
function findMenstruationPeriods(billingData: BillingData[]): Array<{start: string, end: string}> {
  const menstruationDays = billingData
    .filter(d => d.menstruacao === 'forte' || d.menstruacao === 'manchas')
    .map(d => d.date)
    .sort();
  
  if (menstruationDays.length === 0) return [];
  
  const periods: Array<{start: string, end: string}> = [];
  let currentPeriod = { start: menstruationDays[0], end: menstruationDays[0] };
  
  for (let i = 1; i < menstruationDays.length; i++) {
    const prevDate = parseISO(currentPeriod.end);
    const currentDate = parseISO(menstruationDays[i]);
    const daysDiff = Math.abs(differenceInDays(currentDate, prevDate));
    
    if (daysDiff <= 2) {
      // Dias consecutivos ou próximos, estende o período atual
      currentPeriod.end = menstruationDays[i];
    } else {
      // Novo período
      periods.push(currentPeriod);
      currentPeriod = { start: menstruationDays[i], end: menstruationDays[i] };
    }
  }
  periods.push(currentPeriod);
  
  return periods;
}

/**
 * Calcula o dia do ciclo para uma data específica
 * Retorna null se a data não estiver dentro de um ciclo válido
 */
export function calculateCycleDay(targetDate: Date, billingData: BillingData[]): number | null {
  const targetDateString = format(targetDate, 'yyyy-MM-dd');
  const periods = findMenstruationPeriods(billingData);
  
  if (periods.length === 0) return null;
  
  // Encontrar o período de menstruação que inicia o ciclo da data alvo
  let cycleStartPeriod = null;
  
  for (let i = 0; i < periods.length; i++) {
    const currentPeriod = periods[i];
    const nextPeriod = periods[i + 1];
    
    const currentStart = parseISO(currentPeriod.start);
    const targetDateParsed = parseISO(targetDateString);
    
    // Se há um próximo período
    if (nextPeriod) {
      const nextStart = parseISO(nextPeriod.start);
      
      // Verifica se a data alvo está entre este período e o próximo
      if (targetDateParsed >= currentStart && targetDateParsed < nextStart) {
        cycleStartPeriod = currentPeriod;
        break;
      }
    } else {
      // É o último período, verifica se a data está após este período
      // Assume um ciclo de até 60 dias para evitar números muito altos
      const maxCycleEnd = addDays(currentStart, 60);
      if (targetDateParsed >= currentStart && targetDateParsed <= maxCycleEnd) {
        cycleStartPeriod = currentPeriod;
        break;
      }
    }
  }
  
  if (!cycleStartPeriod) return null;
  
  // Calcula quantos dias se passaram desde o início da menstruação
  const cycleStart = parseISO(cycleStartPeriod.start);
  const targetDateParsed = parseISO(targetDateString);
  const daysDiff = differenceInDays(targetDateParsed, cycleStart) + 1; // +1 porque o primeiro dia é dia 1, não 0
  
  return daysDiff > 0 ? daysDiff : null;
}