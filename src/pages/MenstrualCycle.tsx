
import React, { useState, useMemo } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';
import { 
  calculateCycleData, 
  generatePredictions, 
  calculateMonthInsights,
  PredictionData,
  CorrectionData 
} from '@/lib/menstruationPrediction';
import PredictionCalendarGrid from '@/components/PredictionCalendarGrid';
import MonthInsights from '@/components/MonthInsights';
import PredictionSettings from '@/components/PredictionSettings';

const MenstrualCycle = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const [corrections, setCorrections] = useState<CorrectionData[]>([]);
  const { logout } = useAuth();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Buscar dados históricos para cálculo das predições
  const { data: historicalData = [] } = useQuery({
    queryKey: ['historical-billing', lookbackMonths],
    queryFn: async () => {
      const data = [];
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - lookbackMonths);
      
      // Buscar dados dos últimos X meses + próximos 6 meses para visualização
      for (let i = -lookbackMonths; i <= 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() + i);
        const monthData = await getBillingDataForMonth(date.getFullYear(), date.getMonth());
        data.push(...monthData);
      }
      console.log('Dados históricos carregados:', data.length, 'registros');
      return data;
    },
  });

  // Buscar dados do mês atual para exibição
  const { data: currentMonthData = [] } = useQuery({
    queryKey: ['billing-month', currentYear, currentMonth],
    queryFn: () => getBillingDataForMonth(currentYear, currentMonth),
  });

  // Calcular dados do ciclo e predições
  const cycleData = useMemo(() => {
    console.log('Calculando dados do ciclo com', historicalData.length, 'registros');
    return calculateCycleData(historicalData, lookbackMonths);
  }, [historicalData, lookbackMonths]);

  const predictions = useMemo(() => {
    console.log('Gerando predições baseado em:', cycleData);
    return generatePredictions(cycleData, 6);
  }, [cycleData]);

  // Filtrar predições do mês atual
  const currentMonthPredictions = predictions.filter(pred => {
    const predDate = new Date(pred.date);
    return predDate.getFullYear() === currentYear && predDate.getMonth() === currentMonth;
  });

  // Calcular insights do mês
  const monthInsights = useMemo(() => {
    return calculateMonthInsights(
      currentYear, 
      currentMonth, 
      currentMonthData, 
      currentMonthPredictions, 
      corrections
    );
  }, [currentYear, currentMonth, currentMonthData, currentMonthPredictions, corrections]);

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(year));
    setCurrentDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(month));
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: Date, hasData: boolean, isPrediction: boolean) => {
    const dayString = format(day, 'yyyy-MM-dd');
    console.log('Clicou no dia:', dayString, { hasData, isPrediction });
    // TODO: Implementar lógica para editar correções
  };

  const handleLookbackChange = (months: number) => {
    setLookbackMonths(months);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-full mx-auto p-2 lg:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Ciclo Menstrual</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Configurações de Predição */}
        <div className="mb-3">
          <PredictionSettings 
            lookbackMonths={lookbackMonths}
            onLookbackChange={handleLookbackChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTodayClick}>
              Hoje
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-primary">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            
            <div className="flex items-center gap-2">
              <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currentYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = currentYear - 5 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Insights do Mês */}
        <div className="mb-3">
          <MonthInsights 
            year={currentYear}
            month={currentMonth}
            insights={monthInsights}
          />
        </div>

        {/* Legenda */}
        <div className="mb-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Legenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Menstruação confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded"></div>
                <span>Menstruação prevista</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded border"></div>
                <span>Ovulação prevista</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded border"></div>
                <span>Período fértil</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-600"></div>
                <span>Predição de menstruação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span>Falso positivo (corrigido)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-black"></div>
                <span>Falso negativo (corrigido)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="w-full">
          <PredictionCalendarGrid
            currentDate={currentDate}
            billingData={currentMonthData}
            predictions={currentMonthPredictions}
            corrections={corrections}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Resumo das Predições */}
        <div className="mt-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Resumo das Predições</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Ciclo médio:</span> {cycleData.averageCycle} dias
              </div>
              <div>
                <span className="font-medium">Duração média:</span> {cycleData.averageDuration} dias
              </div>
              <div>
                <span className="font-medium">Períodos analisados:</span> {cycleData.periods.length}
              </div>
            </div>
            {cycleData.periods.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                <span className="font-medium">Último período:</span> {cycleData.periods[cycleData.periods.length - 1]?.startDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenstrualCycle;
