
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import ComparisonCalendar from '@/components/ComparisonCalendar';
import CalendarLegend from '@/components/CalendarLegend';
import FilterButtons from '@/components/FilterButtons';

const Comparison = () => {
  const [baseDate, setBaseDate] = useState(new Date());
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);
  const { logout } = useAuth();

  const months = [
    subMonths(baseDate, 3),
    subMonths(baseDate, 2),
    subMonths(baseDate, 1),
    baseDate,
  ];

  const handlePreviousMonths = () => {
    setBaseDate(subMonths(baseDate, 4));
  };

  const handleNextMonths = () => {
    setBaseDate(addMonths(baseDate, 4));
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(baseDate);
    newDate.setFullYear(parseInt(year));
    setBaseDate(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newDate = new Date(baseDate);
    newDate.setMonth(parseInt(month));
    setBaseDate(newDate);
  };

  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Comparação de Meses</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonths}>
              <ChevronLeft className="h-4 w-4" />
              4 Meses Anteriores
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonths}>
              Próximos 4 Meses
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-primary">
              Comparação: {format(months[0], 'MMM', { locale: ptBR })} - {format(months[3], 'MMM yyyy', { locale: ptBR })}
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

        {/* Filter Buttons */}
        <div className="mb-4">
          <FilterButtons 
            activeFilter={highlightFilter}
            onFilterChange={setHighlightFilter}
          />
        </div>

        {/* Comparison Grid and Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Calendários - 2x2 Grid */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
              {months.map((month, index) => (
                <div key={month.toISOString()} className="h-[400px]">
                  <ComparisonCalendar 
                    month={month} 
                    highlightFilter={highlightFilter}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Legenda - mais sutil */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-lg shadow-sm p-3">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Legenda</h3>
                <CalendarLegend />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
