
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BillingData } from '@/lib/supabase';
import { PredictionData, CorrectionData } from '@/lib/menstruationPrediction';
import { Heart, Droplets } from 'lucide-react';

interface PredictionDayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  billingData?: BillingData;
  predictions: PredictionData[];
  correction?: CorrectionData;
  onClick: () => void;
}

const PredictionDayCell: React.FC<PredictionDayCellProps> = ({
  day,
  isCurrentMonth,
  isToday,
  billingData,
  predictions,
  correction,
  onClick
}) => {
  const hasMenstruation = billingData?.menstruacao && billingData.menstruacao !== 'sem_sangramento';
  const hasPredictedMenstruation = predictions.some(pred => pred.type === 'menstruation');
  const hasOvulation = predictions.some(pred => pred.type === 'ovulation');
  const hasFertileDays = predictions.some(pred => pred.type === 'fertile');
  
  // Determinar cor de fundo baseado na lógica descrita
  const getBackgroundColor = () => {
    // Se tem menstruação confirmada (dados reais)
    if (hasMenstruation) {
      return 'bg-red-500 text-white';
    }
    
    // Se tem predição de menstruação mas não tem dados reais
    if (hasPredictedMenstruation && !hasMenstruation) {
      return 'bg-red-400 text-white';
    }
    
    // Se tem ovulação prevista
    if (hasOvulation) {
      return 'bg-blue-100';
    }
    
    // Se tem dias férteis previstos
    if (hasFertileDays) {
      return 'bg-green-100';
    }
    
    return '';
  };

  // Determinar cor da barra inferior baseado nas correções
  const getBarColor = () => {
    if (correction) {
      // Falso positivo: sistema previu menstruação mas não aconteceu
      if (correction.type === 'false_positive') {
        return 'bg-orange-500';
      }
      // Falso negativo: sistema não previu mas aconteceu (atraso/antecipação)
      if (correction.type === 'false_negative') {
        return 'bg-black';
      }
    }
    
    // Barra vermelha forte para predições de menstruação
    if (hasPredictedMenstruation && !hasMenstruation) {
      return 'bg-red-600';
    }
    
    return '';
  };

  const barColor = getBarColor();

  return (
    <div
      className={cn(
        "min-h-[80px] p-2 border border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 relative",
        !isCurrentMonth && "text-gray-400 bg-gray-50",
        isToday && "ring-2 ring-primary ring-inset",
        getBackgroundColor()
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className={cn(
          "text-sm font-medium mb-1",
          isToday && "font-bold"
        )}>
          {format(day, 'd')}
        </div>
        
        {/* Ícones de dados reais */}
        <div className="flex flex-wrap gap-1 flex-1">
          {billingData?.relacao_sexual && (
            <Heart className="h-3 w-3 text-pink-500 fill-current" />
          )}
          {billingData?.sensacao?.includes('umida') && (
            <Droplets className="h-3 w-3 text-blue-400" />
          )}
          {billingData?.sensacao?.includes('escorregadia') && (
            <Droplets className="h-3 w-3 text-blue-600" />
          )}
        </div>

        {/* Indicadores de predição */}
        {hasOvulation && (
          <div className="text-xs text-blue-700 font-medium">Ovulação</div>
        )}
        {hasFertileDays && !hasOvulation && (
          <div className="text-xs text-green-700">Fértil</div>
        )}
      </div>

      {/* Barra inferior para predições e correções */}
      {barColor && (
        <div className={cn("absolute bottom-0 left-0 right-0 h-1", barColor)} />
      )}
    </div>
  );
};

export default PredictionDayCell;
