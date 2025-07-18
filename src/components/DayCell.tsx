// Atualize o arquivo src/components/DayCell.tsx para incluir numeração da fase lútea

import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getBillingData } from '@/lib/supabase';
import { Droplets, Heart, Circle } from 'lucide-react';
import { calculateCycleDay, calculateLutealPhaseDay } from '@/lib/cycleCalculations'; // NOVA IMPORTAÇÃO

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick?: () => void;
  highlightFilter?: string | null;
  billingData?: any[];
  ovulationDays?: string[];
}

const DayCell: React.FC<DayCellProps> = ({ 
  day, 
  isCurrentMonth, 
  isToday, 
  onClick, 
  highlightFilter,
  billingData = [],
  ovulationDays = []
}) => {
  const dayString = format(day, 'yyyy-MM-dd');
  
  const { data: dayBillingData } = useQuery({
    queryKey: ['billing', dayString],
    queryFn: () => getBillingData(dayString),
  });

  const cycleDay = calculateCycleDay(day, billingData);
  const lutealPhaseDay = calculateLutealPhaseDay(day, billingData); // NOVA FUNCIONALIDADE
  const isOvulationDay = ovulationDays.includes(dayString);

  const getMenstruationColor = () => {
    if (!dayBillingData?.menstruacao || dayBillingData.menstruacao === 'sem_sangramento') return '';
    if (dayBillingData.menstruacao === 'forte') return 'bg-red-500';
    if (dayBillingData.menstruacao === 'manchas') return 'bg-red-300';
    return '';
  };

  const isHighlighted = () => {
    if (!highlightFilter || !dayBillingData) return false;
    
    switch (highlightFilter) {
      case 'menstruacao':
        return dayBillingData.menstruacao && dayBillingData.menstruacao !== 'sem_sangramento';
      case 'relacao_sexual':
        return dayBillingData.relacao_sexual === true;
      case 'sensacao':
        return dayBillingData.sensacao && dayBillingData.sensacao.length > 0;
      case 'muco':
        return dayBillingData.muco && dayBillingData.muco.length > 0;
      default:
        return false;
    }
  };

  const renderIcons = () => {
    if (!dayBillingData) return null;

    const icons = [];
    const highlighted = isHighlighted();

    if (dayBillingData.sensacao?.includes('seca')) {
      icons.push(
        <Circle 
          key="seca" 
          className={cn(
            "h-3 w-3 text-yellow-600",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-yellow-400 rounded-full"
          )} 
        />
      );
    }
    if (dayBillingData.sensacao?.includes('umida')) {
      icons.push(
        <Droplets 
          key="umida" 
          className={cn(
            "h-3 w-3 text-blue-400",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-blue-200 rounded-full"
          )} 
        />
      );
    }
    if (dayBillingData.sensacao?.includes('pegajosa')) {
      icons.push(
        <Circle 
          key="pegajosa" 
          className={cn(
            "h-3 w-3 text-orange-500 fill-current",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-orange-300 rounded-full"
          )} 
        />
      );
    }
    if (dayBillingData.sensacao?.includes('escorregadia')) {
      icons.push(
        <Droplets 
          key="escorregadia" 
          className={cn(
            "h-3 w-3 text-blue-600",
            highlighted && highlightFilter === 'sensacao' && "ring-1 ring-blue-400 rounded-full"
          )} 
        />
      );
    }

    if (dayBillingData.relacao_sexual) {
      icons.push(
        <Heart 
          key="relacao" 
          className={cn(
            "h-3 w-3 text-pink-500 fill-current",
            highlighted && highlightFilter === 'relacao_sexual' && "ring-1 ring-pink-300 rounded-full"
          )} 
        />
      );
    }

    return icons;
  };

  const renderMucoTags = () => {
    if (!dayBillingData?.muco || dayBillingData.muco.length === 0) return null;

    const highlighted = isHighlighted();

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {dayBillingData.muco.map((mucoType: string, index: number) => (
          <div
            key={`${mucoType}-${index}`}
            className={cn(
              "text-xs px-1 py-0.5 rounded text-center",
              mucoType === 'clara_de_ovo' && "bg-green-200 text-green-800",
              mucoType === 'transparente' && "bg-blue-200 text-blue-800",
              mucoType === 'elastico' && "bg-purple-200 text-purple-800",
              mucoType === 'espesso' && "bg-yellow-200 text-yellow-800",
              mucoType === 'pegajoso' && "bg-orange-200 text-orange-800",
              mucoType === 'branco' && "bg-gray-200 text-gray-800",
              highlighted && highlightFilter === 'muco' && "ring-1 ring-offset-1 ring-primary"
            )}
          >
            {mucoType?.replace('_', ' ')}
          </div>
        ))}
      </div>
    );
  };

  const highlighted = isHighlighted();

  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 relative",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isToday && "ring-2 ring-primary ring-inset",
        getMenstruationColor(),
        highlighted && "ring-2 ring-primary ring-inset"
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        {/* Header apenas com o número do dia */}
        <div className={cn(
          "text-sm font-medium mb-1",
          isToday && "text-primary font-bold",
          getMenstruationColor() && "text-white"
        )}>
          {format(day, 'd')}
        </div>
        
        <div className="flex flex-wrap gap-1 flex-1">
          {renderIcons()}
        </div>

        {renderMucoTags()}

        {/* Número do ciclo no canto inferior direito */}
        {cycleDay && (
          <div className="absolute bottom-1 right-1">
            <span className={cn(
              "text-xs font-medium opacity-60",
              getMenstruationColor() ? "text-white" : "text-gray-500"
            )}>
              {cycleDay}°
            </span>
          </div>
        )}

        {/* NOVA FUNCIONALIDADE: Número da fase lútea no canto inferior esquerdo */}
        {lutealPhaseDay && (
          <div className="absolute bottom-1 left-1">
            <span className={cn(
              "text-xs font-medium opacity-50",
              getMenstruationColor() ? "text-white" : "text-green-600"
            )}>
              {lutealPhaseDay}°
            </span>
          </div>
        )}

        {/* Marcação de ovulação */}
        {isOvulationDay && (
          <div className="absolute bottom-0 left-0 right-0">
            <div className="bg-blue-400 h-0.5 w-full opacity-70"></div>
            <div className="bg-blue-400 text-white text-[10px] px-1 py-0.5 text-center font-medium opacity-90">
              OVULAÇÃO
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;