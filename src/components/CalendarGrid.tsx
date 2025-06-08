import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayCell from './DayCell';

interface CalendarGridProps {
  days: Date[]; // dias do mês
  currentDate: Date;
  onDayClick: (day: Date) => void;
  highlightFilter?: string | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, currentDate, onDayClick, highlightFilter }) => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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
      <div className="grid grid-cols-7 bg-primary text-primary-foreground">
        {weekdays.map((day) => (
          <div key={day} className="p-3 text-center font-semibold text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {totalDays.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            onClick={onDayClick}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isToday(day)}
            highlightFilter={highlightFilter}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;