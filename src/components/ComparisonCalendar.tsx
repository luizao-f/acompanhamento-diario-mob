import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, addDays, parseISO, isAfter, isBefore } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Droplets, Heart, Circle } from 'lucide-react';

interface ComparisonCalendarProps {
  month: Date;
  highlightFilter?: string | null;
}

interface BillingData {
  date: string;
  menstruacao?: string;
  sensacao?: string[];
  muco?: string[];
  [key: string]: any;
}

function findFirstMenstruationDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d => d.menstruacao === 'forte' || d.menstruacao === 'manchas');
  return item?.date ?? null;
}

function findApexDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d =>
    d.sensacao?.includes('escorregadia') &&
    d.muco?.some((m: string) => m === 'elastico' || m === 'transparente')
  );
  return item?.date ?? null;
}

function getBarInterval(billingData: BillingData[]): [Date | null, Date | null] {
  const start = findFirstMenstruationDay(billingData);
  const apex = findApexDay(billingData);
  if (!start || !apex) return [null, null];
  const startDate = parseISO(start);
  const apexDate = parseISO(apex);
  const endDate = addDays(apexDate, 3);
  return [startDate, endDate];
}

const ComparisonCalendar: React.FC<ComparisonCalendarProps> = ({ month, highlightFilter }) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Busca dados do mês anterior, atual e seguinte
  const prevMonthNum = monthStart.getMonth() === 0 ? 11 : monthStart.getMonth() - 1;
  const nextMonthNum = monthStart.getMonth() === 11 ? 0 : monthStart.getMonth() + 1;
  const prevYear = monthStart.getMonth() === 0 ? monthStart.getFullYear() - 1 : monthStart.getFullYear();
  const nextYear = monthStart.getMonth() === 11 ? monthStart.getFullYear() + 1 : monthStart.getFullYear();

  const { data: prevBillingData = [] } = useQuery({
    queryKey: ['billing-month', prevYear, prevMonthNum],
    queryFn: () => getBillingDataForMonth(prevYear, prevMonthNum),
  });
  const { data: currentBillingData = [] } = useQuery({
    queryKey: ['billing-month', monthStart.getFullYear(), monthStart.getMonth()],
    queryFn: () => getBillingDataForMonth(monthStart.getFullYear(), monthStart.getMonth()),
  });
  const { data: nextBillingData = [] } = useQuery({
    queryKey: ['billing-month', nextYear, nextMonthNum],
    queryFn: () => getBillingDataForMonth(nextYear, nextMonthNum),
  });

  const billingData: BillingData[] = [...prevBillingData, ...currentBillingData, ...nextBillingData];

  // Gera todos os dias do grid, incluindo início/fim de semana
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const totalDays: Date[] = [];
  for (let d = calendarStart; d <= calendarEnd; d = addDays(d, 1)) {
    totalDays.push(d);
  }

  // Divide em semanas
  const weeks: Date[][] = [];
  for (let i = 0; i < totalDays.length; i += 7) {
    weeks.push(totalDays.slice(i, i + 7));
  }

  // Intervalo da barra
  const [barStart, barEnd] = getBarInterval(billingData);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getBillingDataForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const data = billingData.find(data => data.date === dayString);
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

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-visible min-h-full">
      {/* Month Header */}
      <div className="bg-primary text-primary-foreground p-3 text-center flex flex-col items-center justify-center sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-4">
        <h3 className="text-base font-semibold break-words text-center sm:text-left w-full sm:w-auto text-ellipsis overflow-hidden whitespace-nowrap">
          {format(month, 'MMMM yyyy', { locale: ptBR })}
        </h3>
        <p className="text-xs opacity-80 mt-0 sm:mt-0 w-full sm:w-auto text-center sm:text-right">
          {currentBillingData.length} registros encontrados
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

      {/* Weeks Grid */}
      <div>
        {weeks.map((week, weekIdx) => {
          if (!barStart || !barEnd) {
            return (
              <div key={weekIdx} className="relative grid grid-cols-7">
                {week.map((day) => {
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
            );
          }

          // Barra: calcula início/fim na semana
          const weekStart = week[0];
          const weekEnd = week[week.length - 1];
          const segmentStart = isAfter(barStart, weekStart) ? barStart : weekStart;
          const segmentEnd = isBefore(barEnd, weekEnd) ? barEnd : weekEnd;

          if (isAfter(segmentStart, segmentEnd)) {
            // Não há barra nesta semana
            return (
              <div key={weekIdx} className="relative grid grid-cols-7">
                {week.map((day) => {
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
            );
          }

          // Índices de início/fim da barra na semana (corrigido para cobrir toda a linha se necessário)
          const barColStart = week.findIndex(d => d.getTime() === segmentStart.getTime());
          const barColEnd = week.findIndex(d => d.getTime() === segmentEnd.getTime());
          const from = barColStart !== -1 ? barColStart : 0;
          // AJUSTE: se a barra termina no último dia do calendário, forçar até o final da grid
          let to = barColEnd !== -1 ? barColEnd : 6;
          if (
            barEnd &&
            weekIdx === weeks.length - 1 &&
            segmentEnd.getTime() === week[week.length - 1].getTime()
          ) {
            to = 6;
          }

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
              {week.map((day) => {
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
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonCalendar;