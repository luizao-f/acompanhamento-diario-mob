import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  parseISO,
} from 'date-fns';
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
  anotacao?: string;
  relacao_sexual?: boolean;
  [key: string]: any;
}

function findMenstruationPeriods(billingData: BillingData[]): Array<{start: string, end: string}> {
  const menstruationDays = billingData
    .filter(d => d.menstruacao === 'forte' || d.menstruacao === 'manchas')
    .map(d => d.date)
    .sort();
  
  if (menstruationDays.length === 0) return [];
  
  const periods: Array<{start: string, end: string}> = [];
  let currentPeriod = { start: menstruationDays[0], end: menstruationDays[0] };
  
  for (let i = 1; i < menstruationDays.length; i++) {
    const prevDate = parseISO(currentPeriod.end);
    const currentDate = parseISO(menstruationDays[i]);
    const daysDiff = Math.abs((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 2) {
      // Dias consecutivos ou próximos, estende o período atual
      currentPeriod.end = menstruationDays[i];
    } else {
      // Novo período
      periods.push(currentPeriod);
      currentPeriod = { start: menstruationDays[i], end: menstruationDays[i] };
    }
  }
  periods.push(currentPeriod);
  
  return periods;
}

function findApexDay(billingData: BillingData[]): string | null {
  const item = billingData.find(d =>
    d.sensacao?.includes('escorregadia') &&
    d.muco?.some(m => m === 'elastico' || m === 'transparente')
  );
  return item?.date ?? null;
}


// Função para extrair todos os ciclos (menstruação -> ápice+3)
function getCycles(billingData: BillingData[]): Array<{ start: Date; end: Date }> {
 const menstruationPeriods = findMenstruationPeriods(billingData);
 const apexDay = findApexDay(billingData);
 
 if (menstruationPeriods.length === 0 || !apexDay) return [];
 
 const apexDate = parseISO(apexDay);
 const cycles = [];
 
 // Encontrar o período de menstruação que precede o ápice
 let validPeriod = null;
 for (const period of menstruationPeriods) {
   const periodStart = parseISO(period.start);
   const periodEnd = parseISO(period.end);
   
   // O período deve ser anterior ao ápice
   if (periodEnd < apexDate) {
     // Se ainda não temos um período válido ou este é mais próximo do ápice
     if (!validPeriod || periodStart > parseISO(validPeriod.start)) {
       validPeriod = period;
     }
   }
 }
 
 // Só adiciona o ciclo se encontrou um período válido
 if (validPeriod) {
   const startDate = parseISO(validPeriod.start);
   const endDate = addDays(apexDate, 3);
   cycles.push({ start: startDate, end: endDate });
 }
 
 return cycles;
}

const ComparisonCalendar: React.FC<ComparisonCalendarProps> = ({
  month,
  highlightFilter
}) => {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  // Busca dados do mês anterior, atual e seguinte
  const prevMonthNum = monthStart.getMonth() === 0 ? 11 : monthStart.getMonth() - 1;
  const nextMonthNum = monthStart.getMonth() === 11 ? 0 : monthStart.getMonth() + 1;
  const prevYear =
    monthStart.getMonth() === 0 ? monthStart.getFullYear() - 1 : monthStart.getFullYear();
  const nextYear =
    monthStart.getMonth() === 11 ? monthStart.getFullYear() + 1 : monthStart.getFullYear();

  const { data: prevBillingData = [] } = useQuery({
    queryKey: ['billing-month', prevYear, prevMonthNum],
    queryFn: () => getBillingDataForMonth(prevYear, prevMonthNum)
  });
  const { data: currentBillingData = [] } = useQuery({
    queryKey: ['billing-month', monthStart.getFullYear(), monthStart.getMonth()],
    queryFn: () => getBillingDataForMonth(monthStart.getFullYear(), monthStart.getMonth())
  });
  const { data: nextBillingData = [] } = useQuery({
    queryKey: ['billing-month', nextYear, nextMonthNum],
    queryFn: () => getBillingDataForMonth(nextYear, nextMonthNum)
  });

  const billingData: BillingData[] = [
    ...prevBillingData,
    ...currentBillingData,
    ...nextBillingData
  ];

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

  // Cálculo dos ciclos para as barras
  const cycles = getCycles(billingData);

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getBillingDataForDay = (day: Date) => {
    const dayString = format(day, 'yyyy-MM-dd');
    const data = billingData.find((data) => data.date === dayString);
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
            'h-2 w-2 text-yellow-600',
            highlighted && highlightFilter === 'sensacao' && 'ring-1 ring-yellow-400 rounded-full'
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('umida')) {
      icons.push(
        <Droplets
          key="umida"
          className={cn(
            'h-2 w-2 text-blue-400',
            highlighted && highlightFilter === 'sensacao' && 'ring-1 ring-blue-200 rounded-full'
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('pegajosa')) {
      icons.push(
        <Circle
          key="pegajosa"
          className={cn(
            'h-2 w-2 text-orange-500 fill-current',
            highlighted && highlightFilter === 'sensacao' && 'ring-1 ring-orange-300 rounded-full'
          )}
        />
      );
    }
    if (billingData.sensacao?.includes('escorregadia')) {
      icons.push(
        <Droplets
          key="escorregadia"
          className={cn(
            'h-2 w-2 text-blue-600',
            highlighted && highlightFilter === 'sensacao' && 'ring-1 ring-blue-400 rounded-full'
          )}
        />
      );
    }
    if (billingData.relacao_sexual) {
      icons.push(
        <Heart
          key="relacao"
          className={cn(
            'h-2 w-2 text-pink-500 fill-current',
            highlighted && highlightFilter === 'relacao_sexual' && 'ring-1 ring-pink-300 rounded-full'
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
              'text-xs px-1 py-0.5 rounded text-center text-[10px]',
              mucoType === 'clara_de_ovo' && 'bg-green-200 text-green-800',
              mucoType === 'transparente' && 'bg-blue-200 text-blue-800',
              mucoType === 'elastico' && 'bg-purple-200 text-purple-800',
              mucoType === 'espesso' && 'bg-yellow-200 text-yellow-800',
              mucoType === 'pegajoso' && 'bg-orange-200 text-orange-800',
              mucoType === 'branco' && 'bg-gray-200 text-gray-800',
              highlighted && highlightFilter === 'muco' && 'ring-1 ring-offset-1 ring-primary'
            )}
          >
            {mucoType?.replace('_', ' ').substring(0, 3)}
          </div>
        ))}
      </div>
    );
  };

  // Tooltip customizado
  const renderTooltip = (day: Date, billingData: BillingData | undefined) => {
    if (!billingData) return null;
    const show =
      hoveredDay === format(day, 'yyyy-MM-dd') &&
      (billingData.anotacao ||
        billingData.sensacao?.length ||
        billingData.muco?.length ||
        billingData.menstruacao ||
        billingData.relacao_sexual);

    if (!show) return null;

    return (
      <div
        className="absolute z-20 left-1/2 top-10 -translate-x-1/2 min-w-[180px] max-w-[250px] bg-black/70 text-white text-xs rounded-lg shadow-lg p-3 pointer-events-none"
        style={{ backdropFilter: 'blur(2px)' }}
      >
        <div className="font-semibold mb-1">{format(day, 'PPP', { locale: ptBR })}</div>
        {billingData.anotacao && (
          <div className="mb-1">
            <span className="font-semibold">Anotação: </span>
            <span>{billingData.anotacao}</span>
          </div>
        )}
        {billingData.menstruacao && billingData.menstruacao !== 'sem_sangramento' && (
          <div className="mb-1">
            <span className="font-semibold">Menstruação: </span>
            <span>{billingData.menstruacao}</span>
          </div>
        )}
        {billingData.sensacao?.length > 0 && (
          <div className="mb-1">
            <span className="font-semibold">Sensação: </span>
            <span>{billingData.sensacao.join(', ')}</span>
          </div>
        )}
        {billingData.muco?.length > 0 && (
          <div className="mb-1">
            <span className="font-semibold">Muco: </span>
            <span>{billingData.muco.join(', ')}</span>
          </div>
        )}
        {billingData.relacao_sexual && (
          <div className="mb-1">
            <span className="font-semibold">Relação Sexual: </span>
            <span>Sim</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-full w-full">
      {/* Month Header */}
      <div className="bg-primary text-primary-foreground w-full p-2">
        <div className="flex flex-col items-center space-y-1">
          <h3 className="text-sm font-semibold text-center">
            {format(month, 'MMM yyyy', { locale: ptBR })}
          </h3>
          <p className="text-xs opacity-80 text-center">
            {currentBillingData.length} registros
          </p>
        </div>
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
          // Para cada ciclo, desenhe a barra se ela intersecta a semana
          const bars = cycles
            .map(({ start, end }) => {
              const weekStart = week[0];
              const weekEnd = week[6];
              if (end < weekStart || start > weekEnd) return null;

              // Cálculo de índices na semana
              const fromDate = start < weekStart ? weekStart : start;
              const toDate = end > weekEnd ? weekEnd : end;
              const fromIdx = week.findIndex(
                (d) => d.getTime() === fromDate.getTime()
              );
              const toIdx = week.findIndex(
                (d) => d.getTime() === toDate.getTime()
              );
              return (
                <div
                  key={start.toISOString() + end.toISOString()}
                  className="absolute top-1/2 h-2 bg-red-400 opacity-40 rounded-full z-0"
                  style={{
                    left: `${((fromIdx !== -1 ? fromIdx : 0) / 7) * 100}%`,
                    width: `${(((toIdx !== -1 ? toIdx : 6) - (fromIdx !== -1 ? fromIdx : 0) + 1) / 7) * 100}%`,
                    transform: 'translateY(-50%)'
                  }}
                />
              );
            })
            .filter(Boolean);

          return (
            <div key={weekIdx} className="relative grid grid-cols-7">
              {bars}
              {week.map((day) => {
                const billingData = getBillingDataForDay(day);
                const highlighted = isHighlighted(billingData);
                const dayStr = format(day, 'yyyy-MM-dd');
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-[60px] p-1 border border-gray-100 relative group',
                      !isSameMonth(day, month) && 'text-gray-400 bg-gray-50',
                      getMenstruationColor(billingData),
                      highlighted && 'ring-2 ring-primary ring-inset'
                    )}
                    onMouseEnter={() => setHoveredDay(dayStr)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="flex flex-col h-full">
                      <div
                        className={cn(
                          'text-xs font-medium mb-1 text-center',
                          getMenstruationColor(billingData) && 'text-white'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="flex flex-wrap gap-0.5 justify-center flex-1 items-start">
                        {renderDayIcons(billingData)}
                      </div>
                      {renderMucoTags(billingData)}
                    </div>
                    {renderTooltip(day, billingData)}
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