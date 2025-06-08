
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp } from 'lucide-react';
import { updateLookbackMonths, getLookbackMonths, calculateCycleData, generatePredictions } from '@/lib/menstruationPrediction';
import { useToast } from '@/hooks/use-toast';

const PredictionSettings: React.FC = () => {
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      const months = await getLookbackMonths();
      setLookbackMonths(months);
    };
    loadSettings();
  }, []);

  const handleUpdateLookback = async (months: string) => {
    const monthsNum = parseInt(months);
    setIsUpdating(true);
    
    try {
      await updateLookbackMonths(monthsNum);
      setLookbackMonths(monthsNum);
      
      toast({
        title: 'Configurações atualizadas',
        description: `Predições baseadas nos últimos ${monthsNum} meses`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as configurações',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRecalculate = async () => {
    setIsUpdating(true);
    
    try {
      const cycleData = await calculateCycleData(lookbackMonths);
      if (cycleData) {
        await generatePredictions(cycleData);
        toast({
          title: 'Predições atualizadas',
          description: 'Sistema recalculou as predições baseado no histórico',
        });
      } else {
        toast({
          title: 'Dados insuficientes',
          description: 'Não há dados suficientes para gerar predições',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível recalcular as predições',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
      <Settings className="h-4 w-4 text-pink-600" />
      <span className="text-sm font-medium text-gray-700">Análise baseada em:</span>
      
      <Select value={lookbackMonths.toString()} onValueChange={handleUpdateLookback} disabled={isUpdating}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 24 }, (_, i) => i + 1).map(month => (
            <SelectItem key={month} value={month.toString()}>
              {month} {month === 1 ? 'mês' : 'meses'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRecalculate}
        disabled={isUpdating}
        className="h-8 text-xs"
      >
        <TrendingUp className="h-3 w-3 mr-1" />
        {isUpdating ? 'Calculando...' : 'Recalcular'}
      </Button>
    </div>
  );
};

export default PredictionSettings;
