// Substitua o conteúdo completo do arquivo src/lib/cycleCalculations.ts

import { format, parseISO, differenceInDays, addDays, startOfDay } from 'date-fns';

interface BillingData {
  date: string;
  menstruacao?: string;
  [key: string]: any;
}

// CORRIGIDA: Calcula o dia da fase lútea (pós-ovulatória) - agora funciona no mês atual
export function calculateLutealPhaseDay(targetDate: Date, billingData: BillingData[]): number | null {
  const targetDateString = format(targetDate, 'yyyy-MM-dd');
  const today = startOfDay(new Date());
  
  // Encontrar períodos de menstruação
  const menstruationPeriods = findMenstruationPeriods(billingData);
  
  // Encontrar dias de ovulação
  const ovulationDays = billingData
    .filter(d => 
      d.sensacao?.includes('escorregadia') &&
      d.muco?.some(m => m === 'elastico' || m === 'transparente')
    )
    .map(d => d.date)
    .sort();

  if (ovulationDays.length === 0) return null;

  // Agrupar dias de ovulação consecutivos
  const ovulationGroups = getOvulationGroups(ovulationDays);
  
  // Para cada grupo de ovulação, calcular a fase lútea
  for (const group of ovulationGroups) {
    const lastOvulationDate = parseISO(group[group.length - 1]);
    const lutealPhaseStart = addDays(lastOvulationDate, 4); // 4° dia após ovulação
    
    // CORRIGIDO: Encontrar o próximo período de menstruação após esta ovulação
    const nextMenstruation = menstruationPeriods.find(period => {
      const periodStart = parseISO(period.start);
      return periodStart > lastOvulationDate;
    });
    
    let lutealPhaseEnd: Date;
    
    if (nextMenstruation) {
      // Se há próxima menstruação, termina 1 dia antes
      lutealPhaseEnd = addDays(parseISO(nextMenstruation.start), -1);
    } else {
      // NOVO: Se não há próxima menstruação, vai até hoje (máximo)
      lutealPhaseEnd = today;
    }
    
    const targetDateParsed = parseISO(targetDateString);
    
    // Verificar se a data alvo está dentro desta fase lútea
    if (targetDateParsed >= lutealPhaseStart && targetDateParsed <= lutealPhaseEnd) {
      const dayNumber = differenceInDays(targetDateParsed, lutealPhaseStart) + 1;
      return dayNumber;
    }
  }
  
  return null;
}

// CORRIGIDA: Calcula todos os intervalos da fase lútea - agora inclui período atual
export function getAllLutealPhaseIntervals(billingData: BillingData[]): Array<{start: Date, end: Date}> {
  console.log('=== CALCULANDO INTERVALOS DA FASE LÚTEA (INCLUINDO ATUAL) ===');
  
  const today = startOfDay(new Date());
  const menstruationPeriods = findMenstruationPeriods(billingData);
  const ovulationDays = billingData
    .filter(d => 
      d.sensacao?.includes('escorregadia') &&
      d.muco?.some(m => m === 'elastico' || m === 'transparente')
    )
    .map(d => d.date)
    .sort();

  if (ovulationDays.length === 0) {
    console.log('Não há dados de ovulação');
    return [];
  }

  const ovulationGroups = getOvulationGroups(ovulationDays);
  const intervals: Array<{start: Date, end: Date}> = [];
  
  ovulationGroups.forEach((group, index) => {
    const lastOvulationDate = parseISO(group[group.length - 1]);
    const lutealPhaseStart = addDays(lastOvulationDate, 4); // 4° dia após ovulação
    
    // CORRIGIDO: Encontrar o próximo período de menstruação
    const nextMenstruation = menstruationPeriods.find(period => {
      const periodStart = parseISO(period.start);
      return periodStart > lastOvulationDate;
    });
    
    let lutealPhaseEnd: Date;
    
    if (nextMenstruation) {
      // Se há próxima menstruação, termina 1 dia antes
      lutealPhaseEnd = addDays(parseISO(nextMenstruation.start), -1);
      console.log(`Fase lútea ${index + 1}: ${format(lutealPhaseStart, 'yyyy-MM-dd')} até ${format(lutealPhaseEnd, 'yyyy-MM-dd')} (com próxima menstruação)`);
    } else {
      // NOVO: Se não há próxima menstruação, vai até hoje
      lutealPhaseEnd = today;
      console.log(`Fase lútea ${index + 1}: ${format(lutealPhaseStart, 'yyyy-MM-dd')} até ${format(lutealPhaseEnd, 'yyyy-MM-dd')} (até hoje)`);
    }
    
    // Só adicionar se a fase lútea for válida e não for no futuro
    if (lutealPhaseStart <= lutealPhaseEnd && lutealPhaseStart <= today) {
      // CORRIGIDO: Se o fim for no futuro, limitar ao dia de hoje
      const adjustedEnd = lutealPhaseEnd > today ? today : lutealPhaseEnd;
      
      intervals.push({
        start: lutealPhaseStart,
        end: adjustedEnd
      });
      
      console.log(`Fase lútea adicionada: ${format(lutealPhaseStart, 'yyyy-MM-dd')} até ${format(adjustedEnd, 'yyyy-MM-dd')}`);
    }
  });
  
  console.log(`Total de fases lúteas: ${intervals.length}`);
  return intervals;
}

// Função auxiliar para agrupar dias de ovulação consecutivos
function getOvulationGroups(ovulationDays: string[]): string[][] {
  if (ovulationDays.length === 0) return [];
  
  const groups: string[][] = [];
  let currentGroup = [ovulationDays[0]];
  
  for (let i = 1; i < ovulationDays.length; i++) {
    const prevDate = parseISO(currentGroup[currentGroup.length - 1]);
    const currentDate = parseISO(ovulationDays[i]);
    const daysDiff = differenceInDays(currentDate, prevDate);
    
    if (daysDiff <= 3) {
      currentGroup.push(ovulationDays[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [ovulationDays[i]];
    }
  }
  groups.push(currentGroup);
  
  return groups;
}

// Função auxiliar para encontrar períodos de menstruação
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
      currentPeriod.end = menstruationDays[i];
    } else {
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