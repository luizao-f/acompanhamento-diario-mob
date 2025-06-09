// src/components/PredictionDayCell.tsx
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BillingData } from '@/lib/supabase';
import { PredictionData } from '@/lib/menstruationPrediction';
import { PredictionComparison } from '@/lib/predictionTracking';
import { Heart, Droplets } from 'lucide-react';

interface PredictionDayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  billingData?: BillingData;
  predictions: PredictionData[];
  comparison?: PredictionComparison;
  onClick: () => void;
}

const PredictionDayCell: React.FC<PredictionDayCellProps> = ({
  day,
  isCurrentMonth,
  isToday,
  billingData,
  predictions,
  comparison,
  onClick
}) => {
  const hasMenstruation = billingData?.menstruacao && billingData.menstruacao !== 'sem_sangramento';
  const hasPredictedMenstruation = predictions.some(pred => pred.type === 'menstruation');
  const hasOvulation = predictions.some(pred => pred.type === 'ovulation');
  const hasFertileDays = predictions.some(pred => pred.type === 'fertile');
  
  // Determinar cor de fundo
  const getBackgroundColor = () => {
    // Se tem menstruação confirmada (dados reais)
    if (hasMenstruation) {
      return 'bg-red-500 text-white';
    }
    
    // Se tem predição de menstruação (e ainda não tem dados reais)
    if (hasPredictedMenstruation && !billingData) {
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

  // Determinar cor da barra inferior
  const getBarColor = () => {
    // SÓ mostrar barra de erro se houver comparação (ou seja, dados reais para comparar)
    if (comparison) {
      // Falso positivo: previu mas não aconteceu (atraso)
      if (comparison.type === 'false_positive') {
        return 'bg-orange-500';
      }
      
      // Falso negativo: não previu mas aconteceu (antecipação)
      if (comparison.type === 'false_negative') {
        return 'bg-black';
      }
    }
    
    // Barra vermelha forte APENAS para predições futuras (sem dados reais ainda)
    if (hasPredictedMenstruation && !billingData) {
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
        
        {/* Mostrar tipo de erro APENAS se houver comparação com erro */}
        {comparison && (comparison.type === 'false_positive' || comparison.type === 'false_negative') && (
          <div className="text-xs mt-1">
            {comparison.type === 'false_positive' ? 
              <span className="text-orange-600 font-medium">Atraso</span> : 
              <span className="text-black font-medium">Antecipação</span>
            }
          </div>
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