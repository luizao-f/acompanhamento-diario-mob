
import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isToday 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PredictionDayCell from './PredictionDayCell';
import { BillingData } from '@/lib/supabase';
import { PredictionData, CorrectionData } from '@/lib/menstruationPrediction';

interface PredictionCalendarGridProps {
  currentDate: Date;
  billingData: BillingData[];
  predictions: PredictionData[];
  corrections: CorrectionData[];
  onDayClick: (day: Date, hasData: boolean, isPrediction: boolean) => void;
}

const PredictionCalendarGrid: React.FC<PredictionCalendarGridProps> = ({
  currentDate,
  billingData,
  predictions,
  corrections,
  onDayClick
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grade do calendário */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayString = format(day, 'yyyy-MM-dd');
          const dayData = billingData.find(data => data.date === dayString);
          const dayPredictions = predictions.filter(pred => pred.date === dayString);
          const dayCorrection = corrections.find(corr => corr.date === dayString);
          
          return (
            <PredictionDayCell
              key={dayString}
              day={day}
              isCurrentMonth={isSameMonth(day, currentDate)}
              isToday={isToday(day)}
              billingData={dayData}
              predictions={dayPredictions}
              correction={dayCorrection}
              onClick={() => onDayClick(day, !!dayData, dayPredictions.length > 0)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PredictionCalendarGrid;
