// src/pages/MenstrualCycle.tsx (SUBSTITUIR TODO O CONTEÚDO)
import React, { useState, useMemo, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getBillingDataForMonth, 
  savePredictionSettings,
  getPredictionSettings,
  savePredictions,
  getPredictions,
  getCorrections,
  MenstruationPrediction
} from '@/lib/supabase';
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
import { useToast } from '@/hooks/use-toast';

const MenstrualCycle = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const { logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Buscar configurações salvas
  const { data: savedSettings } = useQuery({
    queryKey: ['prediction-settings'],
    queryFn: getPredictionSettings,
    onSuccess: (data) => {
      if (data) {
        setLookbackMonths(data.lookback_months);
      }
    }
  });

// Buscar dados históricos para cálculo das predições
const { data: historicalData = [] } = useQuery({
  queryKey: ['historical-billing', lookbackMonths],
  queryFn: async () => {
    const data = [];
    const today = new Date();
    
    // Buscar dados dos últimos X meses
    for (let i = lookbackMonths; i >= 0; i--) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthData = await getBillingDataForMonth(targetDate.getFullYear(), targetDate.getMonth());
      if (monthData.length > 0) {
        data.push(...monthData);
      }
    }
    
    console.log('=== DADOS HISTÓRICOS CARREGADOS ===');
    console.log('Total de registros:', data.length);
    console.log('Períodos com menstruação:', data.filter(d => d.menstruacao && d.menstruacao !== 'sem_sangramento').length);
    console.log('Primeiro registro:', data[0]?.date);
    console.log('Último registro:', data[data.length - 1]?.date);
    
    return data;
  },
});

  // Buscar dados do mês atual
  const { data: currentMonthData = [] } = useQuery({
    queryKey: ['billing-month', currentYear, currentMonth],
    queryFn: () => getBillingDataForMonth(currentYear, currentMonth),
  });

  // Buscar predições salvas do banco
  const { data: savedPredictions = [] } = useQuery({
    queryKey: ['saved-predictions', currentYear, currentMonth],
    queryFn: async () => {
      const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      return getPredictions(monthStart, monthEnd);
    }
  });

  // Buscar correções salvas
  const { data: savedCorrections = [] } = useQuery({
    queryKey: ['saved-corrections', currentYear, currentMonth],
    queryFn: async () => {
      const monthStart = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      return getCorrections(monthStart, monthEnd);
    }
  });

  // Mutation para salvar configurações
  const saveSettingsMutation = useMutation({
    mutationFn: savePredictionSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['prediction-settings']);
    }
  });

  // Mutation para salvar predições
  const savePredictionsMutation = useMutation({
    mutationFn: savePredictions,
    onSuccess: () => {
      queryClient.invalidateQueries(['saved-predictions']);
      toast({
        title: "Predições atualizadas",
        description: "As predições foram recalculadas e salvas com sucesso.",
      });
    }
  });

  // Calcular dados do ciclo
  const cycleData = useMemo(() => {
    console.log('Calculando dados do ciclo com', historicalData.length, 'registros');
    return calculateCycleData(historicalData, lookbackMonths);
  }, [historicalData, lookbackMonths]);

  // Gerar predições
  const generatedPredictions = useMemo(() => {
    console.log('Gerando predições baseado em:', cycleData);
    return generatePredictions(cycleData, 6);
  }, [cycleData]);

  // Salvar predições quando forem geradas
  useEffect(() => {
    if (generatedPredictions.length > 0 && cycleData.periods.length > 0) {
      const predictionsToSave: MenstruationPrediction[] = generatedPredictions.map(pred => ({
        predicted_date: pred.date,
        prediction_type: pred.type,
        confidence_score: pred.confidence,
        based_on_months: lookbackMonths,
        cycle_average: cycleData.averageCycle,
        duration_average: cycleData.averageDuration
      }));
      
      savePredictionsMutation.mutate(predictionsToSave);
    }
  }, [generatedPredictions, cycleData, lookbackMonths]);

  // Usar predições salvas ou geradas
  const allPredictions = savedPredictions.length > 0 
    ? savedPredictions.map(sp => ({
        date: sp.predicted_date,
        type: sp.prediction_type as PredictionData['type'],
        isPrediction: true,
        confidence: sp.confidence_score || 0.8
      }))
    : generatedPredictions;

  // Filtrar predições do mês atual
  const currentMonthPredictions = allPredictions.filter(pred => {
    const predDate = new Date(pred.date);
    return predDate.getFullYear() === currentYear && predDate.getMonth() === currentMonth;
  });

  // Comparar predições com dados reais - SÓ mostrar barras se houver dados reais
  const comparisons = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Só fazer comparações se houver dados reais no mês
    if (currentMonthData.length === 0) {
      return [];
    }
    
    return comparePredictionsWithActual(
      currentMonthPredictions,
      currentMonthData,
      monthStart,
      monthEnd
    );
  }, [currentMonthPredictions, currentMonthData, currentDate]);

  // Calcular atrasos e antecipações considerando dados históricos
  const { delays, anticipations } = useMemo(() => {
    // Incluir dados do mês atual nos históricos para cálculo
    const allData = [...historicalData, ...currentMonthData];
    return calculateDelaysAndAnticipations(allPredictions, allData);
  }, [allPredictions, historicalData, currentMonthData]);

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
    const actualMenstruationDays = currentMonthData.filter(data => 
      data.menstruacao && data.menstruacao !== 'sem_sangramento'
    ).length;

    return {
      menstruationDays: actualMenstruationDays,
      predictedDays: currentMonthPredictions.filter(p => p.type === 'menstruation').length,
      delays: currentMonthDelays.length,
      anticipations: currentMonthAnticipations.length,
      accuracy: currentMonthData.length > 0 ? accuracy.accuracy.toFixed(1) : '100',
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
    saveSettingsMutation.mutate(months);
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
    {/* ADICIONAR AQUI O BOTÃO RECALCULAR */}
<Button 
  variant="outline" 
  size="sm" 
  onClick={async () => {
    // Limpar TODAS as queries
    await queryClient.invalidateQueries();
    
    // Forçar refetch
    queryClient.refetchQueries(['historical-billing']);
    queryClient.refetchQueries(['saved-predictions']);
    queryClient.refetchQueries(['billing-month']);
    
    toast({
      title: "Cache limpo",
      description: "Recarregando todos os dados...",
    });
    
    // Recarregar a página após 1 segundo
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }}
>
  Recalcular
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