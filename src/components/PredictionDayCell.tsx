// src/components/PredictionDayCell.tsx - VERSÃO COMPLETA COM MELHORIAS
import React from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { BillingData } from '@/lib/supabase';
import { PredictionData } from '@/lib/menstruationPrediction';
import { PredictionComparison } from '@/lib/predictionTracking';
import { Heart, Droplets, Circle } from 'lucide-react';

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
  
  // NOVO: Detectar ovulação MOB (sensação escorregadia + muco elástico/transparente)
  const isMOBOvulation = billingData?.sensacao?.includes('escorregadia') && 
                        billingData?.muco?.some(m => m === 'elastico' || m === 'transparente');
  
  // Determinar cor de fundo baseado na lógica descrita
  const getBackgroundColor = () => {
    // Se tem menstruação confirmada (dados reais)
    if (hasMenstruation) {
      return 'bg-red-500 text-white';
    }
    
    // NOVO: Se é ovulação MOB (dados reais) - azul mais claro
    if (isMOBOvulation) {
      return 'bg-blue-200 text-blue-900';
    }
    
    // Se tem predição de menstruação mas não tem dados reais ainda
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

  // Determinar cor da barra inferior baseado na comparação
  const getBarColor = () => {
    if (!comparison) {
      // Se ainda não há dados reais, mas tem predição
      if (hasPredictedMenstruation && !billingData) {
        return 'bg-red-600';
      }
      return '';
    }
    
    // Falso positivo: sistema previu menstruação mas não aconteceu (atraso)
    if (comparison.type === 'false_positive') {
      return 'bg-orange-500';
    }
    
    // Falso negativo: sistema não previu mas aconteceu (antecipação)
    if (comparison.type === 'false_negative') {
      return 'bg-black';
    }
    
    return '';
  };

  // NOVO: Renderizar todos os ícones de dados reais
  const renderAllIcons = () => {
    if (!billingData) return null;
    const icons = [];

    // Ícones de sensação
    if (billingData.sensacao?.includes('seca')) {
      icons.push(
        <Circle 
          key="seca" 
          className="h-2 w-2 text-yellow-600" 
          title="Seca"
        />
      );
    }
    if (billingData.sensacao?.includes('umida')) {
      icons.push(
        <Droplets 
          key="umida" 
          className="h-2 w-2 text-blue-400" 
          title="Úmida"
        />
      );
    }
    if (billingData.sensacao?.includes('pegajosa')) {
      icons.push(
        <Circle 
          key="pegajosa" 
          className="h-2 w-2 text-orange-500 fill-current" 
          title="Pegajosa"
        />
      );
    }
    if (billingData.sensacao?.includes('escorregadia')) {
      icons.push(
        <Droplets 
          key="escorregadia" 
          className="h-2 w-2 text-blue-600" 
          title="Escorregadia"
        />
      );
    }

    // Ícone de relação sexual
    if (billingData.relacao_sexual) {
      icons.push(
        <Heart 
          key="relacao" 
          className="h-2 w-2 text-pink-500 fill-current" 
          title="Relação Sexual"
        />
      );
    }

    return icons;
  };

  // NOVO: Renderizar tags de muco
  const renderMucoTags = () => {
    if (!billingData?.muco || billingData.muco.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-0.5 mt-1">
        {billingData.muco.map((mucoType: string, index: number) => (
          <div
            key={`${mucoType}-${index}`}
            className={cn(
              'text-xs px-1 py-0.5 rounded text-center text-[9px]',
              mucoType === 'clara_de_ovo' && 'bg-green-200 text-green-800',
              mucoType === 'transparente' && 'bg-blue-200 text-blue-800',
              mucoType === 'elastico' && 'bg-purple-200 text-purple-800',
              mucoType === 'espesso' && 'bg-yellow-200 text-yellow-800',
              mucoType === 'pegajoso' && 'bg-orange-200 text-orange-800',
              mucoType === 'branco' && 'bg-gray-200 text-gray-800',
              mucoType === 'nenhum' && 'bg-gray-100 text-gray-600'
            )}
            title={mucoType?.replace('_', ' ')}
          >
            {mucoType?.replace('_', ' ').substring(0, 10)}
          </div>
        ))}
      </div>
    );
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
        
        {/* NOVO: Mostrar "Ovulação MOB" para dias com dados reais de ovulação */}
        {isMOBOvulation && (
          <div className="text-xs text-blue-700 font-bold mb-1">Ovulação MOB</div>
        )}
        
        {/* MELHORADO: Ícones de todos os dados reais */}
        <div className="flex flex-wrap gap-1 flex-1">
          {renderAllIcons()}
        </div>

        {/* NOVO: Tags de muco */}
        {renderMucoTags()}

        {/* Indicadores de predição */}
        {hasOvulation && !isMOBOvulation && (
          <div className="text-xs text-blue-700 font-medium">Ovulação Tabelinha</div>
        )}
        {hasFertileDays && !hasOvulation && !isMOBOvulation && (
          <div className="text-xs text-green-700">Fértil Tabelinha</div>
        )}
        
        {/* Mostrar tipo de erro se houver comparação */}
        {comparison && (comparison.type === 'false_positive' || comparison.type === 'false_negative') && (
          <div className="text-xs mt-1">
            {comparison.type === 'false_positive' ? 
              <span className="text-orange-600 font-medium">Atraso</span> : 
              <span className="text-black font-medium">Antecipação</span>
            }
          </div>
        )}
        
        {/* NOVO: Observações se houver */}
        {billingData?.observacoes && billingData.observacoes.trim() !== '' && (
          <div className="text-xs text-gray-600 mt-1 truncate" title={billingData.observacoes}>
            {billingData.observacoes.substring(0, 10)}...
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