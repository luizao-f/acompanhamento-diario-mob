
import React from 'react';
import { isSameMonth, isToday, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import DayCell from './DayCell';
import type { PredictionData } from '@/lib/menstruationPrediction';

interface BillingData {
  date: string;
  menstruacao?: string;
  sensacao?: string[];
  muco?: string[];
  relacao_sexual?: boolean;
}

interface CalendarGridProps {
  days: Date[];
  currentDate: Date;
  onDayClick: (day: Date) => void;
  highlightFilter?: string | null;
  billingData: BillingData[];
  predictions?: PredictionData[];
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days, currentDate, onDayClick, highlightFilter, billingData, predictions = []
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

  const weeks: Date[][] = [];
  for (let i = 0; i < totalDays.length; i += 7) {
    weeks.push(totalDays.slice(i, i + 7));
  }

  const getPredictionForDay = (day: Date): PredictionData | undefined => {
    const dayString = format(day, 'yyyy-MM-dd');
    return predictions.find(p => p.date === dayString);
  };

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
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="relative grid grid-cols-7">
            {week.map((day) => {
              const prediction = getPredictionForDay(day);
              
              return (
                <div key={day.toISOString()} className="relative z-10">
                  <DayCell
                    day={day}
                    isCurrentMonth={isSameMonth(day, currentDate)}
                    isToday={isToday(day)}
                    onClick={isSameMonth(day, currentDate) ? () => onDayClick(day) : undefined}
                    highlightFilter={highlightFilter}
                    prediction={prediction}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarGrid;
