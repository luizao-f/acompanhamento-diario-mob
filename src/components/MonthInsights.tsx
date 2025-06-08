
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, TrendingDown, Target } from 'lucide-react';

interface MonthInsightsProps {
  year: number;
  month: number;
  insights: {
    menstruationDays: number;
    predictedDays: number;
    delays: number;
    anticipations: number;
    accuracy: string;
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{insights.menstruationDays}</div>
            <div className="text-sm text-gray-600">Dias de menstruação</div>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{insights.accuracy}%</div>
            <div className="text-sm text-gray-600">Precisão das predições</div>
          </div>
          
          {insights.delays > 0 && (
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{insights.delays}</span>
              </div>
              <div className="text-sm text-gray-600">Atrasos detectados</div>
            </div>
          )}
          
          {insights.anticipations > 0 && (
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold text-purple-600">{insights.anticipations}</span>
              </div>
              <div className="text-sm text-gray-600">Antecipações detectadas</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthInsights;
