
import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Droplets, Heart, Circle } from 'lucide-react';

interface ComparisonCalendarProps {
  month: Date;
}

const ComparisonCalendar: React.FC<ComparisonCalendarProps> = ({ month }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const { data: monthData = [] } = useQuery({
    queryKey: ['billing-month', month.getFullYear(), month.getMonth()],
    queryFn: () => getBillingDataForMonth(month.getFullYear(), month.getMonth()),
  });

  const getBillingDataForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    return monthData.find(data => data.date === dayString);
  };

  const getMenstruationColor = (billingData: any) => {
    if (!billingData?.menstruacao || billingData.menstruacao === 'sem_sangramento') return '';
    if (billingData.menstruacao === 'forte') return 'bg-red-500';
    if (billingData.menstruacao === 'manchas') return 'bg-red-300';
    return '';
  };

  const renderDayIcons = (billingData: any) => {
    if (!billingData) return null;

    const icons = [];

    // Ícones de sensação
    if (billingData.sensacao?.includes('seca')) {
      icons.push(<Circle key="seca" className="h-2 w-2 text-yellow-600" />);
    }
    if (billingData.sensacao?.includes('umida')) {
      icons.push(<Droplets key="umida" className="h-2 w-2 text-blue-400" />);
    }
    if (billingData.sensacao?.includes('pegajosa')) {
      icons.push(<Circle key="pegajosa" className="h-2 w-2 text-orange-500 fill-current" />);
    }
    if (billingData.sensacao?.includes('escorregadia')) {
      icons.push(<Droplets key="escorregadia" className="h-2 w-2 text-blue-600" />);
    }

    // Ícone de relação sexual
    if (billingData.relacao_sexual) {
      icons.push(<Heart key="relacao" className="h-2 w-2 text-pink-500 fill-current" />);
    }

    return icons;
  };

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Month Header */}
      <div className="bg-primary text-primary-foreground p-3 text-center">
        <h3 className="text-lg font-semibold">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h3>
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
        {days.map((day) => {
          const billingData = getBillingDataForDay(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[60px] p-1 border border-gray-100",
                !isSameMonth(day, month) && "text-gray-400 bg-gray-50",
                getMenstruationColor(billingData)
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

                {billingData?.muco && billingData.muco.length > 0 && (
                  <div className="mt-1">
                    <div className={cn(
                      "text-xs px-1 py-0.5 rounded text-center text-[10px]",
                      billingData.muco.includes('clara_de_ovo') && "bg-green-200 text-green-800",
                      billingData.muco.includes('transparente') && "bg-blue-200 text-blue-800",
                      billingData.muco.includes('elastico') && "bg-purple-200 text-purple-800",
                      billingData.muco.includes('espesso') && "bg-yellow-200 text-yellow-800",
                      billingData.muco.includes('pegajoso') && "bg-orange-200 text-orange-800",
                      billingData.muco.includes('branco') && "bg-gray-200 text-gray-800"
                    )}>
                      {billingData.muco[0]?.replace('_', ' ').substring(0, 3)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCalendar;
