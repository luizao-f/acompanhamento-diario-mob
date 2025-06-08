import React from 'react';
import { startOfWeek, endOfWeek, addDays, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayCell from './DayCell';

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  onDayClick: (day: Date) => void;
  highlightFilter?: string | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, currentDate, onDayClick, highlightFilter }) => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Preenche o grid para alinhar corretamente o 1º dia do mês
  const monthStart = days[0];
  const monthEnd = days[days.length - 1];
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });

  const totalDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    totalDays.push(d);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header dos dias da semana */}
      <div className="grid grid-cols-7 bg-primary text-primary-foreground">
        {weekdays.map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Grid dos dias */}
      <div className="grid grid-cols-7">
        {totalDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isToday(day)}
            onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
            highlightFilter={highlightFilter}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;