
import React, { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, LogOut, Calendar as CalendarIcon, BarChart3, Menu } from 'lucide-react';
import ComparisonCalendar from '@/components/ComparisonCalendar';
import CalendarLegend from '@/components/CalendarLegend';
import FilterButtons from '@/components/FilterButtons';

const Comparison = () => {
  const [baseDate, setBaseDate] = useState(new Date());
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);
  const [monthsToShow, setMonthsToShow] = useState(4);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  // Gerar os meses baseado na quantidade selecionada
  const generateMonths = (baseDate: Date, count: number) => {
    const months = [];
    for (let i = count - 1; i >= 0; i--) {
      months.push(subMonths(baseDate, i));
    }
    return months;
  };

  const months = generateMonths(baseDate, monthsToShow);

  const handlePreviousMonths = () => {
    setBaseDate(subMonths(baseDate, monthsToShow));
  };

  const handleNextMonths = () => {
    setBaseDate(addMonths(baseDate, monthsToShow));
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

  const handleMonthsToShowChange = (value: string) => {
    setMonthsToShow(parseInt(value));
  };

  const currentYear = baseDate.getFullYear();
  const currentMonth = baseDate.getMonth();

  // Definir grid layout baseado na quantidade de meses
  const getGridCols = () => {
    switch (monthsToShow) {
      case 4: return 'lg:grid-cols-2 xl:grid-cols-4';
      case 6: return 'lg:grid-cols-2 xl:grid-cols-3';
      case 8: return 'lg:grid-cols-2 xl:grid-cols-4';
      case 10: return 'lg:grid-cols-2 xl:grid-cols-5';
      case 12: return 'lg:grid-cols-3 xl:grid-cols-4';
      default: return 'lg:grid-cols-2 xl:grid-cols-4';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-full mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-primary">Comparação de Meses</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
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
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendário
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={logout} className="w-full justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3 gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={handlePreviousMonths} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{monthsToShow} Meses Anteriores</span>
              <span className="sm:hidden">Anterior</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonths} className="flex-1 sm:flex-none text-xs sm:text-sm">
              <span className="hidden sm:inline">Próximos {monthsToShow} Meses</span>
              <span className="sm:hidden">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h2 className="text-sm sm:text-lg font-semibold text-primary text-center">
              Comparação: {format(months[0], 'MMM', { locale: ptBR })} - {format(months[months.length - 1], 'MMM yyyy', { locale: ptBR })}
            </h2>
            
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Seletor de quantidade de meses */}
              <Select value={monthsToShow.toString()} onValueChange={handleMonthsToShowChange}>
                <SelectTrigger className="w-20 sm:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="8">8 meses</SelectItem>
                  <SelectItem value="10">10 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>

              <Select value={currentMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-24 sm:w-32">
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
                <SelectTrigger className="w-16 sm:w-20">
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
        <div className="mb-3">
          <FilterButtons 
            activeFilter={highlightFilter}
            onFilterChange={setHighlightFilter}
          />
        </div>

        {/* Legenda acima dos gráficos */}
        <div className="mb-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <CalendarLegend />
          </div>
        </div>

        {/* Calendários de comparação ocupando toda a largura */}
        <div className={`grid grid-cols-1 ${getGridCols()} gap-3`}>
          {months.map((month, index) => (
            <div key={month.toISOString()} className="h-[350px] sm:h-[450px]">
              <ComparisonCalendar 
                month={month} 
                highlightFilter={highlightFilter}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Comparison;
