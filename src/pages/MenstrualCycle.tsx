
// src/pages/MenstrualCycle.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, ArrowLeft, Menu } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';
import { 
  calculateCycleData, 
  generatePredictions, 
  PredictionData,
  CorrectionData 
} from '@/lib/menstruationPrediction';
import { 
  comparePredictionsWithActual, 
  calculateDelaysAndAnticipations,
  calculatePredictionAccuracy 
} from '@/lib/predictionTracking';
import PredictionCalendarGrid from '@/components/PredictionCalendarGrid';
import MonthInsights from '@/components/MonthInsights';
import PredictionSettings from '@/components/PredictionSettings';
import { savePredictions } from '@/lib/predictionsSupabase'; // <-- IMPORTAÇÃO ADICIONADA

const MenstrualCycle = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
  console.log('=== MENSTRUAL CYCLE PAGE DEBUG ===');
  console.log('Historical data length:', historicalData.length);
  console.log('Lookback months:', lookbackMonths);
  console.log('Historical data sample:', historicalData.slice(0, 5));
  
  console.log('Calculando dados do ciclo com', historicalData.length, 'registros');
  const result = calculateCycleData(historicalData, lookbackMonths);
  
  console.log('Resultado do cálculo do ciclo:');
  console.log('- Ciclo médio:', result.averageCycle, 'dias');
  console.log('- Duração média:', result.averageDuration, 'dias');
  console.log('- Períodos encontrados:', result.periods.length);
  
  if (result.periods.length > 0) {
    const lastPeriod = result.periods[result.periods.length - 1];
    console.log('- Último período:');
    console.log('  - Início:', lastPeriod.startDate);
    console.log('  - Fim:', lastPeriod.endDate);
    console.log('  - Duração:', lastPeriod.duration, 'dias');
    
    // Calcular manualmente quando deveria ser a próxima menstruação
    const lastStart = new Date(lastPeriod.startDate);
    const expectedNext = addDays(lastStart, result.averageCycle);
    console.log('- Próxima menstruação esperada:', format(expectedNext, 'yyyy-MM-dd'));
  }
  
  console.log('=== FIM MENSTRUAL CYCLE PAGE DEBUG ===');
  return result;
}, [historicalData, lookbackMonths]);

  const allPredictions = useMemo(() => {
    console.log('Gerando predições baseado em:', cycleData);
    return generatePredictions(cycleData, 6);
  }, [cycleData]);

  // --- USEEFFECT PARA SALVAR AS PREDIÇÕES NO BANCO ---
useEffect(() => {
  console.log("Rodando useEffect para salvar predições", allPredictions);
  if (!allPredictions || allPredictions.length === 0) return;
  savePredictions(allPredictions).catch(err => {
    console.error("Erro ao salvar predições no banco:", err);
  });
}, [allPredictions]);
  // ---------------------------------------------------

  // Filtrar predições do mês atual
  const currentMonthPredictions = allPredictions.filter(pred => {
    const predDate = new Date(pred.date);
    return predDate.getFullYear() === currentYear && predDate.getMonth() === currentMonth;
  });

  // Comparar predições com dados reais
  const comparisons = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return comparePredictionsWithActual(
      currentMonthPredictions,
      currentMonthData,
      monthStart,
      monthEnd
    );
  }, [currentMonthPredictions, currentMonthData, currentDate]);

  // Calcular atrasos e antecipações
  const { delays, anticipations } = useMemo(() => {
    return calculateDelaysAndAnticipations(allPredictions, historicalData);
  }, [allPredictions, historicalData]);

  // Filtrar atrasos e antecipações do mês atual
  const currentMonthDelays = delays.filter(d => {
    const date = new Date(d.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });

  const currentMonthAnticipations = anticipations.filter(a => {
    const date = new Date(a.date);
    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
  });

  // Calcular métricas de precisão
  const accuracy = useMemo(() => {
    return calculatePredictionAccuracy(comparisons, currentMonthDelays, currentMonthAnticipations);
  }, [comparisons, currentMonthDelays, currentMonthAnticipations]);

  // Calcular insights do mês
  const monthInsights = useMemo(() => {
    // Contar dias de menstruação reais
    const actualMenstruationDays = currentMonthData.filter(data => 
      data.menstruacao && data.menstruacao !== 'sem_sangramento'
    ).length;

    return {
      menstruationDays: actualMenstruationDays,
      predictedDays: currentMonthPredictions.filter(p => p.type === 'menstruation').length,
      delays: currentMonthDelays.length,
      anticipations: currentMonthAnticipations.length,
      accuracy: accuracy.accuracy.toFixed(1),
      delayDays: currentMonthDelays.reduce((sum, d) => sum + d.days, 0),
      anticipationDays: currentMonthAnticipations.reduce((sum, a) => sum + a.days, 0)
    };
  }, [currentMonthData, currentMonthPredictions, currentMonthDelays, currentMonthAnticipations, accuracy]);

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
    // TODO: Implementar modal para editar correções
  };

  const handleLookbackChange = (months: number) => {
    setLookbackMonths(months);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-full mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-primary">Ciclo Menstrual</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mb-3 bg-white rounded-lg shadow-sm p-3">
            <div className="flex flex-col gap-2">
              <Link to="/" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Configurações de Predição */}
        <div className="mb-3">
          <PredictionSettings 
            lookbackMonths={lookbackMonths}
            onLookbackChange={handleLookbackChange}
          />
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3 gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="flex-1 sm:flex-none">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth} className="flex-1 sm:flex-none">
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleTodayClick} className="flex-1 sm:flex-none">
              Hoje
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h2 className="text-lg sm:text-xl font-semibold text-primary text-center">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            
            <div className="flex items-center gap-2">
              <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {format(new Date(2024, i, 1), 'MMM', { locale: ptBR })}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-red-600"></div>
                <span>Predição de menstruação</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-orange-500"></div>
                <span>Atraso (previsto mas não ocorreu)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-black"></div>
                <span>Antecipação (não previsto mas ocorreu)</span>
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
            comparisons={comparisons}
            onDayClick={handleDayClick}
          />
        </div>

        {/* Resumo das Predições */}
        <div className="mt-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-sm font-medium mb-2 text-gray-700">Resumo das Predições</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
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
