// Atualize o arquivo src/components/CalendarGrid.tsx com essas funções corrigidas

import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayCell from './DayCell';

interface BillingData {
  date: string;
  menstruacao?: string;
  sensacao?: string[];
  muco?: string[];
}

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  onDayClick: (day: Date) => void;
  highlightFilter?: string | null;
  billingData: BillingData[];
}

// FUNÇÃO CORRIGIDA: Encontra períodos de menstruação
function findMenstruationPeriods(billingData: BillingData[]): Array<{start: string, end: string}> {
  console.log('=== DETECTANDO PERÍODOS DE MENSTRUAÇÃO ===');
  
  const menstruationDays = billingData
    .filter(d => d.menstruacao === 'forte' || d.menstruacao === 'manchas')
    .map(d => d.date)
    .sort();
  
  console.log('Dias de menstruação encontrados:', menstruationDays);
  
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
      // Novo período (mais de 2 dias de diferença)
      periods.push(currentPeriod);
      console.log('Período detectado:', currentPeriod);
      currentPeriod = { start: menstruationDays[i], end: menstruationDays[i] };
    }
  }
  periods.push(currentPeriod);
  console.log('Último período:', currentPeriod);
  console.log('Total de períodos:', periods.length);
  
  return periods;
}

// FUNÇÃO CORRIGIDA: Encontra TODOS os dias de ovulação
function findOvulationDays(billingData: BillingData[]): string[] {
  console.log('=== DETECTANDO DIAS DE OVULAÇÃO ===');
  
  const ovulationDays = billingData
    .filter(d => 
      d.sensacao?.includes('escorregadia') &&
      d.muco?.some(m => m === 'elastico' || m === 'transparente')
    )
    .map(d => d.date)
    .sort();
  
  console.log('Dias de ovulação encontrados:', ovulationDays);
  return ovulationDays;
}

// FUNÇÃO CORRIGIDA: Calcula TODOS os intervalos de barras do ciclo
function getAllCycleIntervals(billingData: BillingData[]): Array<{start: Date, end: Date}> {
  console.log('=== CALCULANDO INTERVALOS DO CICLO ===');
  
  const menstruationPeriods = findMenstruationPeriods(billingData);
  const ovulationDays = findOvulationDays(billingData);
  
  if (menstruationPeriods.length === 0 || ovulationDays.length === 0) {
    console.log('Não há períodos ou ovulações suficientes');
    return [];
  }
  
  const intervals: Array<{start: Date, end: Date}> = [];
  
  // Para cada período de menstruação, encontrar a ovulação mais próxima APÓS ele
  menstruationPeriods.forEach((period, index) => {
    const periodStart = parseISO(period.start);
    const periodEnd = parseISO(period.end);
    
    console.log(`\nAnalisando período ${index + 1}: ${period.start} a ${period.end}`);
    
    // Encontrar ovulação que acontece DEPOIS do fim da menstruação
    const validOvulations = ovulationDays
      .map(date => parseISO(date))
      .filter(ovulationDate => ovulationDate > periodEnd)
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (validOvulations.length > 0) {
      const nextOvulation = validOvulations[0];
      
      // Verificar se há outro período de menstruação entre este e a ovulação
      const hasIntermediatePeriod = menstruationPeriods.some((otherPeriod, otherIndex) => {
        if (otherIndex === index) return false;
        const otherStart = parseISO(otherPeriod.start);
        return otherStart > periodEnd && otherStart < nextOvulation;
      });
      
      if (!hasIntermediatePeriod) {
        const cycleEnd = addDays(nextOvulation, 3);
        intervals.push({
          start: periodStart,
          end: cycleEnd
        });
        
        console.log(`Ciclo criado: ${period.start} -> ovulação ${nextOvulation.toISOString().split('T')[0]} -> fim ${cycleEnd.toISOString().split('T')[0]}`);
      } else {
        console.log('Período intermediário encontrado, pulando este ciclo');
      }
    } else {
      console.log('Nenhuma ovulação encontrada após este período');
    }
  });
  
  console.log(`Total de ciclos detectados: ${intervals.length}`);
  return intervals;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days, currentDate, onDayClick, highlightFilter, billingData
}) => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const monthStart = days[0];
  const monthEnd = days[days.length - 1];
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const totalDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    totalDays.push(d);
  }

  // CORRIGIDO: Obter TODOS os intervalos de ciclo
  const cycleIntervals = getAllCycleIntervals(billingData);
  const ovulationDays = findOvulationDays(billingData);

  const weeks: Date[][] = [];
  for (let i = 0; i < totalDays.length; i += 7) {
    weeks.push(totalDays.slice(i, i + 7));
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-visible">
      <div className="grid grid-cols-7 bg-primary text-primary-foreground">
        {weekdays.map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>
      <div>
        {weeks.map((week, weekIdx) => {
          const weekStart = week[0];
          const weekEnd = week[week.length - 1];

          // CORRIGIDO: Calcular barras para TODOS os ciclos que intersectam esta semana
          const weekBars = cycleIntervals
            .map((interval, intervalIndex) => {
              const { start: barStart, end: barEnd } = interval;
              
              // Verificar se há interseção com a semana
              if (barEnd < weekStart || barStart > weekEnd) return null;
              
              const segmentStart = isAfter(barStart, weekStart) ? barStart : weekStart;
              const segmentEnd = isBefore(barEnd, weekEnd) ? barEnd : weekEnd;
              
              if (isAfter(segmentStart, segmentEnd)) return null;
              
              const barColStart = week.findIndex(d => d.getTime() === segmentStart.getTime());
              const barColEnd = week.findIndex(d => d.getTime() === segmentEnd.getTime());
              
              const from = barColStart !== -1 ? barColStart : 0;
              const to = barColEnd !== -1 ? barColEnd : 6;
              
              return (
                <div
                  key={`cycle-bar-${intervalIndex}`}
                  className="absolute top-1/2 h-2 bg-red-400 opacity-40 rounded-full z-0"
                  style={{
                    left: `${(from / 7) * 100}%`,
                    width: `${((to - from + 1) / 7) * 100}%`,
                    transform: 'translateY(-50%)'
                  }}
                />
              );
            })
            .filter(Boolean);

          return (
            <div key={weekIdx} className="relative grid grid-cols-7">
              {/* Renderizar todas as barras de ciclo */}
              {weekBars}
              
              {week.map((day) => (
                <div key={day.toISOString()} className="relative z-10">
                  <DayCell
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isToday={isToday(day)}
                    onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                    highlightFilter={highlightFilter}
                    billingData={billingData}
                    ovulationDays={ovulationDays} // NOVA PROP
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;