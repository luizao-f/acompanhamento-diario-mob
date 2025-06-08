
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface PredictionSettingsProps {
  lookbackMonths: number;
  onLookbackChange: (months: number) => void;
}

const PredictionSettings: React.FC<PredictionSettingsProps> = ({
  lookbackMonths,
  onLookbackChange
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Settings className="h-4 w-4" />
          Configurações de Predição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-600">
            Análise retroativa:
          </label>
          <Select value={lookbackMonths.toString()} onValueChange={(value) => onLookbackChange(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => i + 1).map((months) => (
                <SelectItem key={months} value={months.toString()}>
                  {months} {months === 1 ? 'mês' : 'meses'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          O sistema usará os dados dos últimos {lookbackMonths} {lookbackMonths === 1 ? 'mês' : 'meses'} para calcular as predições.
        </p>
      </CardContent>
    </Card>
  );
};

export default PredictionSettings;
