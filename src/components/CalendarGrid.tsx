
import React from 'react';
import { format, isSameMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import DayCell from './DayCell';

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  onDayClick: (day: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, currentDate, onDayClick }) => {
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            isCurrentMonth={isSameMonth(day, currentDate)}
            isToday={isToday(day)}
            onClick={() => onDayClick(day)}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
