import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays, isWithinInterval, parseISO, isAfter, isBefore } from 'date-fns';
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
    const daysDiff = Math.abs((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
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

function findApexDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d =>
    d.sensacao?.includes('escorregadia') &&
    d.muco?.some(m => m === 'elastico' || m === 'transparente')
  );
  return item?.date ?? null;
}

function getBarInterval(billingData: BillingData[]): [Date | null, Date | null] {
  const menstruationPeriods = findMenstruationPeriods(billingData);
  const apexDay = findApexDay(billingData);
  
  if (menstruationPeriods.length === 0 || !apexDay) return [null, null];
  
  const apexDate = parseISO(apexDay);
  
  // Encontrar o período de menstruação que precede o ápice
  let validPeriod = null;
  for (const period of menstruationPeriods) {
    const periodStart = parseISO(period.start);
    const periodEnd = parseISO(period.end);
    
    // O período deve ser anterior ao ápice
    if (periodEnd < apexDate) {
      // Se ainda não temos um período válido ou este é mais próximo do ápice
      if (!validPeriod || parseISO(period.start) > parseISO(validPeriod.start)) {
        validPeriod = period;
      }
    }
  }
  
  if (!validPeriod) return [null, null];
  
  const startDate = parseISO(validPeriod.start);
  const endDate = addDays(apexDate, 3);
  
  return [startDate, endDate];
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

  const [barStart, barEnd] = getBarInterval(billingData);

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
          if (!barStart || !barEnd) {
            return (
              <div key={weekIdx} className="relative grid grid-cols-7">
                {week.map((day) => (
                  <div key={day.toISOString()} className="relative z-10">
                    <DayCell
                      day={day}
                      isCurrentMonth={isSameMonth(day, currentDate)}
                      isToday={isToday(day)}
                      onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                      highlightFilter={highlightFilter}
                      billingData={billingData}
                    />
                  </div>
                ))}
              </div>
            );
          }

          const weekStart = week[0];
          const weekEnd = week[week.length - 1];

          // Calcula onde a barra começa e termina dentro da semana
          const segmentStart = isAfter(barStart, weekStart) ? barStart : weekStart;
          const segmentEnd = isBefore(barEnd, weekEnd) ? barEnd : weekEnd;

          // Se não há interseção, não desenha barra
          if (isAfter(segmentStart, segmentEnd)) {
            return (
              <div key={weekIdx} className="relative grid grid-cols-7">
                {week.map((day) => (
                  <div key={day.toISOString()} className="relative z-10">
                    <DayCell
                      day={day}
                      isCurrentMonth={isSameMonth(day, currentDate)}
                      isToday={isToday(day)}
                      onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                      highlightFilter={highlightFilter}
                      billingData={billingData}
                    />
                  </div>
                ))}
              </div>
            );
          }

          // Índices da barra na semana (0 a 6)
          const barColStart = week.findIndex(d => d.getTime() === segmentStart.getTime());
          const barColEnd = week.findIndex(d => d.getTime() === segmentEnd.getTime());

          const from = barColStart !== -1 ? barColStart : 0;
          const to = barColEnd !== -1 ? barColEnd : 6;

          return (
            <div key={weekIdx} className="relative grid grid-cols-7">
              <div
                className="absolute top-1/2 h-2 bg-red-400 opacity-40 rounded-full z-0"
                style={{
                  left: `${(from / 7) * 100}%`,
                  width: `${((to - from + 1) / 7) * 100}%`,
                  transform: 'translateY(-50%)'
                }}
              />
              {week.map((day) => (
                <div key={day.toISOString()} className="relative z-10">
                  <DayCell
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isToday={isToday(day)}
                    onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                    highlightFilter={highlightFilter}
                    billingData={billingData}
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