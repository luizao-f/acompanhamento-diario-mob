// src/components/MonthInsights.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, TrendingDown, Target, Clock, FastForward } from 'lucide-react';

interface MonthInsightsProps {
  year: number;
  month: number;
  insights: {
    menstruationDays: number;
    predictedDays: number;
    delays: number;
    anticipations: number;
    accuracy: string;
    delayDays?: number;
    anticipationDays?: number;
  };
}

const MonthInsights: React.FC<MonthInsightsProps> = ({ year, month, insights }) => {
  const monthName = new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Insights de {monthName} {year}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{insights.menstruationDays}</div>
            <div className="text-sm text-gray-600">Dias de menstruação</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{insights.accuracy}%</div>
            <div className="text-sm text-gray-600">Precisão das predições</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{insights.delays}</span>
            </div>
            <div className="text-sm text-gray-600">Ocorrências de atraso</div>
          </div>
          
          <div className="text-center p-3 bg-orange-100 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-orange-700" />
              <span className="text-2xl font-bold text-orange-700">{insights.delayDays || 0}</span>
            </div>
            <div className="text-sm text-gray-600">Dias de atraso total</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <FastForward className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">{insights.anticipations}</span>
            </div>
            <div className="text-sm text-gray-600">Ocorrências de antecipação</div>
          </div>
          
          <div className="text-center p-3 bg-purple-100 rounded-lg">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-purple-700" />
              <span className="text-2xl font-bold text-purple-700">{insights.anticipationDays || 0}</span>
            </div>
            <div className="text-sm text-gray-600">Dias de antecipação total</div>
          </div>
        </div>
        
        {/* Detalhamento adicional se houver atrasos ou antecipações */}
        {(insights.delays > 0 || insights.anticipations > 0) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Observações do mês:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              {insights.delays > 0 && (
                <p>• Houve {insights.delays} {insights.delays === 1 ? 'atraso' : 'atrasos'} totalizando {insights.delayDays} {insights.delayDays === 1 ? 'dia' : 'dias'}</p>
              )}
              {insights.anticipations > 0 && (
                <p>• Houve {insights.anticipations} {insights.anticipations === 1 ? 'antecipação' : 'antecipações'} totalizando {insights.anticipationDays} {insights.anticipationDays === 1 ? 'dia' : 'dias'}</p>
              )}
              <p className="text-gray-500 italic mt-2">
                A precisão é calculada considerando todos os dias previstos vs realizados no mês.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthInsights;