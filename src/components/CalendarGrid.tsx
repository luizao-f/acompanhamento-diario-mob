import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays, isWithinInterval, parseISO } from 'date-fns';
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

// Encontra o primeiro dia de menstruação (forte ou manchas)
function findFirstMenstruationDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d => d.menstruacao === 'forte' || d.menstruacao === 'manchas');
  return item?.date ?? null;
}

// Encontra o dia do ápice (escorregadia + elastico/transparente)
function findApexDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d =>
    d.sensacao?.includes('escorregadia') &&
    d.muco?.some(m => m === 'elastico' || m === 'transparente')
  );
  return item?.date ?? null;
}

// Retorna intervalo de datas para a barra
function getBarInterval(billingData: BillingData[]): [Date | null, Date | null] {
  const start = findFirstMenstruationDay(billingData);
  const apex = findApexDay(billingData);
  if (!start || !apex) return [null, null];
  const startDate = parseISO(start);
  const apexDate = parseISO(apex);
  const endDate = addDays(apexDate, 3); // 3 dias após ápice
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

  // Todos os dias exibidos no grid
  const totalDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    totalDays.push(d);
  }

  // Calcula o intervalo da barra global (pode começar/terminar fora do mês)
  const [barStart, barEnd] = getBarInterval(billingData);

  // Divide em semanas
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
          // A semana tem barra se qualquer parte dela estiver dentro do intervalo
          const weekStart = week[0];
          const weekEnd = week[week.length - 1];
          const weekHasBar = barStart && barEnd &&
            (
              isWithinInterval(weekStart, { start: barStart, end: barEnd }) ||
              isWithinInterval(weekEnd, { start: barStart, end: barEnd }) ||
              (barStart < weekStart && barEnd > weekEnd)
            );

          return (
            <div key={weekIdx} className="relative grid grid-cols-7">
              {weekHasBar && (
                <div
                  className="absolute left-0 right-0 top-1/2 h-2 bg-red-400 opacity-40 rounded-full z-0"
                  style={{ transform: 'translateY(-50%)' }}
                />
              )}
              {week.map((day) => (
                <div key={day.toISOString()} className="relative z-10">
                  <DayCell
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isToday={isToday(day)}
                    onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                    highlightFilter={highlightFilter}
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