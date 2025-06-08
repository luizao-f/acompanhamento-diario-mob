
import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateMonthInsights, MonthInsights as MonthInsightsType } from '@/lib/menstruationPrediction';

interface MonthInsightsProps {
  year: number;
  month: number;
}

const MonthInsights: React.FC<MonthInsightsProps> = ({ year, month }) => {
  const [insights, setInsights] = useState<MonthInsightsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true);
      const data = await calculateMonthInsights(year, month);
      setInsights(data);
      setLoading(false);
    };
    
    loadInsights();
  }, [year, month]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg shadow-sm p-4 border border-pink-200">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-pink-600" />
        <h3 className="font-semibold text-gray-800">Insights do Mês</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-red-500" />
          <div>
            <p className="font-medium text-gray-700">Dias de menstruação</p>
            <p className="text-lg font-bold text-red-600">{insights.menstruationDays}</p>
          </div>
        </div>

        {insights.corrections > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-700">Correções</p>
              <p className="text-lg font-bold text-orange-600">{insights.corrections}</p>
            </div>
          </div>
        )}

        {insights.delays > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <div>
              <p className="font-medium text-gray-700">Predições incorretas</p>
              <p className="text-lg font-bold text-orange-600">{insights.delays}</p>
            </div>
          </div>
        )}

        {insights.advances > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500" />
            <div>
              <p className="font-medium text-gray-700">Variações</p>
              <p className="text-lg font-bold text-blue-600">{insights.advances}</p>
            </div>
          </div>
        )}

        {insights.corrections === 0 && insights.delays === 0 && insights.advances === 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <p className="font-medium text-gray-700">Predições</p>
              <p className="text-lg font-bold text-green-600">Precisas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthInsights;
