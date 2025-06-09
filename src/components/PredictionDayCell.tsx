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
  const hasPredictedMenstruation = predictions.some(pred => pred.predicted === true);
  const hasOvulation = predictions.some(pred => pred.type === 'ovulation');
  const hasFertileDays = predictions.some(pred => pred.type === 'fertile');

  // Determinar cor de fundo baseado na lógica descrita
  const getBackgroundColor = () => {
    if (hasMenstruation) {
      return 'bg-red-500 text-white';
    }
    if (hasPredictedMenstruation && !hasMenstruation) {
      return 'bg-red-400 text-white';
    }
    if (hasOvulation) {
      return 'bg-blue-100';
    }
    if (hasFertileDays) {
      return 'bg-green-100';
    }
    return '';
  };

  // Determinar cor e barra inferior baseado em correções do banco
  const getBarColor = () => {
    if (correction) {
      if (correction.type === 'delay') {
        return 'bg-orange-500'; // Barra laranja para atraso
      }
      if (correction.type === 'anticipation') {
        return 'bg-black'; // Barra preta para antecipação
      }
    }
    if (hasPredictedMenstruation && !hasMenstruation) {
      // Só mostra barra vermelha forte se for predição futura e não tiver correção
      return 'bg-red-600';
    }
    return '';
  };

  const getBarLabel = () => {
    if (correction) {
      if (correction.type === 'delay') return 'Atraso';
      if (correction.type === 'anticipation') return 'Antecipação';
    }
    return '';
  };

  const barColor = getBarColor();
  const barLabel = getBarLabel();

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
        <div className={cn("absolute bottom-0 left-0 right-0 h-1 flex items-center justify-center", barColor)}>
          {barLabel && (
            <span className="text-[10px] ml-1 text-white font-bold">{barLabel}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionDayCell;