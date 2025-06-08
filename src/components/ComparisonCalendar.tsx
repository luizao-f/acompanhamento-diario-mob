import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Droplets, Heart, Circle } from 'lucide-react';

interface ComparisonCalendarProps {
  month: Date;
  highlightFilter?: string | null;
}

const ComparisonCalendar: React.FC<ComparisonCalendarProps> = ({ month, highlightFilter }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  // Gera os dias do mês normalmente
  const daysOfMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Gera um grid completo, preenchendo início/fim até domingo/sábado
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const totalDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    totalDays.push(d);
  }

  const { data: monthData = [], isLoading, error } = useQuery({
    queryKey: ['billing-month', month.getFullYear(), month.getMonth()],
    queryFn: () => getBillingDataForMonth(month.getFullYear(), month.getMonth()),
  });

  // ...demais funções e lógica do componente continuam iguais

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex items-center justify-center">
        <div className="text-red-500">Erro ao carregar dados</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full">
      {/* Month Header */}
      <div className="bg-primary text-primary-foreground p-3 text-center">
        <h3 className="text-base font-semibold">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <p className="text-xs opacity-80 mt-1">
          {monthData.length} registros encontrados
        </p>
      </div>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 bg-gray-50">
        {weekdays.map((day) => (
          <div key={day} className="p-2 text-center font-medium text-xs text-gray-600">
            {day}
          </div>
        ))}
      </div>
      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {totalDays.map((day) => {
          const billingData = getBillingDataForDay(day);
          const highlighted = isHighlighted(billingData);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[80px] p-1.5 border border-gray-100 relative",
                !isSameMonth(day, month) && "text-gray-400 bg-gray-50",
                getMenstruationColor(billingData),
                highlighted && "ring-2 ring-primary ring-inset"
              )}
            >
              <div className="flex flex-col h-full">
                {/* ...restante do seu conteúdo existente... */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCalendar;