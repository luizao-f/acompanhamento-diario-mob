// Atualize o arquivo src/components/CalendarGrid.tsx para incluir fase lútea

import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays, parseISO, isAfter, isBefore, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayCell from './DayCell';
import { getAllLutealPhaseIntervals } from '@/lib/cycleCalculations'; // NOVA IMPORTAÇÃO

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

// Encontra períodos de menstruação
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

// Encontra TODOS os dias de ovulação
function findOvulationDays(billingData: BillingData[]): string[] {
  const ovulationDays = billingData
    .filter(d => 
      d.sensacao?.includes('escorregadia') &&
      d.muco?.some(m => m === 'elastico' || m === 'transparente')
    )
    .map(d => d.date)
    .sort();
  
  return ovulationDays;
}

// Agrupa dias de ovulação consecutivos e retorna o último de cada grupo
function getLastOvulationOfEachPeriod(ovulationDays: string[]): string[] {
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
  
  return groups.map(group => group[group.length - 1]);
}

// Calcula intervalos do ciclo (menstruação até 3 dias após ovulação)
function getAllCycleIntervals(billingData: BillingData[]): Array<{start: Date, end: Date}> {
  const menstruationPeriods = findMenstruationPeriods(billingData);
  const allOvulationDays = findOvulationDays(billingData);
  const lastOvulationDays = getLastOvulationOfEachPeriod(allOvulationDays);
  
  if (menstruationPeriods.length === 0 || lastOvulationDays.length === 0) {
    return [];
  }
  
  const intervals: Array<{start: Date, end: Date}> = [];
  
  menstruationPeriods.forEach((period) => {
    const periodStart = parseISO(period.start);
    const periodEnd = parseISO(period.end);
    
    const validOvulations = lastOvulationDays
      .map(date => parseISO(date))
      .filter(ovulationDate => ovulationDate > periodEnd)
      .sort((a, b) => a.getTime() - b.getTime());
    
    if (validOvulations.length > 0) {
      const nextOvulation = validOvulations[0];
      
      const hasIntermediatePeriod = menstruationPeriods.some((otherPeriod) => {
        const otherStart = parseISO(otherPeriod.start);
        return otherStart > periodEnd && otherStart < nextOvulation;
      });
      
      if (!hasIntermediatePeriod) {
        const cycleEnd = addDays(nextOvulation, 3);
        intervals.push({
          start: periodStart,
          end: cycleEnd
        });
      }
    }
  });
  
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

  const cycleIntervals = getAllCycleIntervals(billingData);
  const lutealPhaseIntervals = getAllLutealPhaseIntervals(billingData); // NOVA FUNCIONALIDADE
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

          // Barras vermelhas do ciclo (menstruação até 3 dias após ovulação)
          const cycleWeekBars = cycleIntervals
            .map((interval, intervalIndex) => {
              const { start: barStart, end: barEnd } = interval;
              
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

          // NOVA FUNCIONALIDADE: Barras verdes da fase lútea
          const lutealWeekBars = lutealPhaseIntervals
            .map((interval, intervalIndex) => {
              const { start: barStart, end: barEnd } = interval;
              
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
                  key={`luteal-bar-${intervalIndex}`}
                  className="absolute bottom-1 h-0.5 bg-green-500 opacity-50 rounded-full z-0"
                  style={{
                    left: `${(from / 7) * 100}%`,
                    width: `${((to - from + 1) / 7) * 100}%`
                  }}
                />
              );
            })
            .filter(Boolean);

          return (
            <div key={weekIdx} className="relative grid grid-cols-7">
              {/* Barras vermelhas do ciclo */}
              {cycleWeekBars}
              
              {/* NOVA: Barras verdes da fase lútea */}
              {lutealWeekBars}
              
              {week.map((day) => (
                <div key={day.toISOString()} className="relative z-10">
                  <DayCell
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isToday={isToday(day)}
                    onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                    highlightFilter={highlightFilter}
                    billingData={billingData}
                    ovulationDays={ovulationDays}
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