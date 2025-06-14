
import React from 'react';
import { format } from 'date-fns';
import { Flower, Leaf, Heart, Sun, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PredictionDayCellProps {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  predictions: {
    isMenstruation: boolean;
    isOvulation: boolean;
    isFertile: boolean;
    type: 'menstruation' | 'ovulation' | 'fertile' | null;
  };
  onDayClick: (date: Date) => void;
}

const PredictionDayCell: React.FC<PredictionDayCellProps> = ({
  date,
  isToday,
  isCurrentMonth,
  predictions,
  onDayClick,
}) => {
  const dayNumber = format(date, 'd');

  const getCellClasses = () => {
    let baseClasses = 'relative h-12 w-12 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer hover:scale-105';
    
    if (!isCurrentMonth) {
      baseClasses += ' text-muted-foreground opacity-50';
    }
    
    if (isToday) {
      baseClasses += ' ring-2 ring-primary ring-offset-2';
    }
    
    if (predictions.isMenstruation) {
      baseClasses += ' bg-destructive text-destructive-foreground shadow-soft';
    } else if (predictions.isOvulation) {
      baseClasses += ' bg-accent text-accent-foreground shadow-soft';
    } else if (predictions.isFertile) {
      baseClasses += ' bg-secondary text-secondary-foreground shadow-soft';
    } else {
      baseClasses += ' bg-background hover:bg-muted/50';
    }
    
    return baseClasses;
  };

  const getIcon = () => {
    if (predictions.isMenstruation) {
      return <Droplets className="h-3 w-3 text-destructive-foreground" />;
    } else if (predictions.isOvulation) {
      return <Sun className="h-3 w-3 text-accent-foreground" />;
    } else if (predictions.isFertile) {
      return <Leaf className="h-3 w-3 text-secondary-foreground" />;
    }
    return null;
  };

  return (
    <div
      className={cn(getCellClasses())}
      onClick={() => onDayClick(date)}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-xs leading-none">{dayNumber}</span>
        {getIcon() && (
          <div className="absolute bottom-1">
            {getIcon()}
          </div>
        )}
      </div>
      
      {/* Prediction indicator bar */}
      {predictions.isMenstruation && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-destructive rounded-full opacity-80" />
      )}
    </div>
  );
};

export default PredictionDayCell;
