
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getBillingData } from '@/lib/supabase';
import { Droplets, Heart, Circle } from 'lucide-react';

interface DayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  onClick: () => void;
}

const DayCell: React.FC<DayCellProps> = ({ day, isCurrentMonth, isToday, onClick }) => {
  const dayString = format(day, 'yyyy-MM-dd');
  
  const { data: billingData } = useQuery({
    queryKey: ['billing', dayString],
    queryFn: () => getBillingData(dayString),
  });

  const getMenstruationColor = () => {
    if (!billingData?.menstruacao || billingData.menstruacao === 'sem_sangramento') return '';
    if (billingData.menstruacao === 'forte') return 'bg-red-500';
    if (billingData.menstruacao === 'manchas') return 'bg-red-300';
    return '';
  };

  const renderIcons = () => {
    if (!billingData) return null;

    const icons = [];

    // Ícones de sensação
    if (billingData.sensacao?.includes('seca')) {
      icons.push(<Circle key="seca" className="h-3 w-3 text-yellow-600" />);
    }
    if (billingData.sensacao?.includes('umida')) {
      icons.push(<Droplets key="umida" className="h-3 w-3 text-blue-400" />);
    }
    if (billingData.sensacao?.includes('pegajosa')) {
      icons.push(<Circle key="pegajosa" className="h-3 w-3 text-orange-500 fill-current" />);
    }
    if (billingData.sensacao?.includes('escorregadia')) {
      icons.push(<Droplets key="escorregadia" className="h-3 w-3 text-blue-600" />);
    }

    // Ícone de relação sexual
    if (billingData.relacao_sexual) {
      icons.push(<Heart key="relacao" className="h-3 w-3 text-pink-500 fill-current" />);
    }

    return icons;
  };

  return (
    <div
      className={cn(
        "min-h-[80px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isToday && "ring-2 ring-primary ring-inset",
        getMenstruationColor()
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
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

        {billingData?.muco && billingData.muco.length > 0 && (
          <div className="mt-1">
            <div className={cn(
              "text-xs px-1 py-0.5 rounded text-center",
              billingData.muco.includes('clara_de_ovo') && "bg-green-200 text-green-800",
              billingData.muco.includes('transparente') && "bg-blue-200 text-blue-800",
              billingData.muco.includes('elastico') && "bg-purple-200 text-purple-800",
              billingData.muco.includes('espesso') && "bg-yellow-200 text-yellow-800",
              billingData.muco.includes('pegajoso') && "bg-orange-200 text-orange-800",
              billingData.muco.includes('branco') && "bg-gray-200 text-gray-800"
            )}>
              {billingData.muco[0]?.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
