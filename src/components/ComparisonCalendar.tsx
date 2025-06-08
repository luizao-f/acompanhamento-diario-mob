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

  const getBillingDataForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const data = monthData.find((data: any) => data.date === dayString);
    return data;
  };

  const getMenstruationColor = (billingData: any) => {
    if (!billingData?.menstruacao || billingData.menstruacao === 'sem_sangramento') return '';
    if (billingData.menstruacao === 'forte') return 'bg-red-500';
    if (billingData.menstruacao === 'manchas') return 'bg-red-300';
    return '';
  };

  const isHighlighted = (billingData: any) => {
    if (!highlightFilter || !billingData) return false;
    switch (highlightFilter) {
      case 'menstruacao':
        return billingData.menstruacao && billingData.menstruacao !== 'sem_sangramento';
      case 'relacao_sexual':
        return billingData.relacao_sexual === true;
      case 'sensacao':
        return billingData.sensacao && billingData.sensacao.length > 0;
      case 'muco':
        return billingData.muco && billingData.muco.length > 0;
      default:
        return false;
    }
  };

  const renderDayIcons = (billingData: any) => {
    if (!billingData) return null;
    const icons = [];
    const highlighted = isHighlighted(billingData);

    // Ícones de sensação
    if (billingData.sensacao?.includes('seca')) {
      icons.push(
        <Circle
          key="seca"
          className={cn(
            "h-2 w-2 text-yellow-600",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-yellow-400 rounded-full"
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('umida')) {
      icons.push(
        <Droplets
          key="umida"
          className={cn(
            "h-2 w-2 text-blue-400",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-blue-200 rounded-full"
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('pegajosa')) {
      icons.push(
        <Circle
          key="pegajosa"
          className={cn(
            "h-2 w-2 text-orange-500 fill-current",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-orange-300 rounded-full"
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('escorregadia')) {
      icons.push(
        <Droplets
          key="escorregadia"
          className={cn(
            "h-2 w-2 text-blue-600",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-blue-400 rounded-full"
          )}
        />
      );
    }

    // Ícone de relação sexual
    if (billingData.relacao_sexual) {
      icons.push(
        <Heart
          key="relacao"
          className={cn(
            "h-2 w-2 text-pink-500 fill-current",
            highlighted && highlightFilter === 'relacao_sexual' && "ring-1 ring-pink-300 rounded-full"
          )}
        />
      );
    }

    return icons;
  };

  const renderMucoTags = (billingData: any) => {
    if (!billingData?.muco || billingData.muco.length === 0) return null;
    const highlighted = isHighlighted(billingData);

    return (
      <div className="flex flex-wrap gap-0.5 mt-1">
        {billingData.muco.map((mucoType: string, index: number) => (
          <div
            key={`${mucoType}-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded text-center text-[10px]",
              mucoType === 'clara_de_ovo' && "bg-green-200 text-green-800",
              mucoType === 'transparente' && "bg-blue-200 text-blue-800",
              mucoType === 'elastico' && "bg-purple-200 text-purple-800",
              mucoType === 'espesso' && "bg-yellow-200 text-yellow-800",
              mucoType === 'pegajoso' && "bg-orange-200 text-orange-800",
              mucoType === 'branco' && "bg-gray-200 text-gray-800",
              highlighted && highlightFilter === 'muco' && "ring-1 ring-offset-1 ring-primary"
            )}
          >
            {mucoType?.replace('_', ' ').substring(0, 3)}
          </div>
        ))}
      </div>
    );
  };

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
                <div className={cn(
                  "text-xs font-medium mb-1 text-center",
                  getMenstruationColor(billingData) && "text-white"
                )}>
                  {format(day, 'd')}
                </div>
                <div className="flex flex-wrap gap-0.5 justify-center flex-1">
                  {renderDayIcons(billingData)}
                </div>
                {renderMucoTags(billingData)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCalendar;