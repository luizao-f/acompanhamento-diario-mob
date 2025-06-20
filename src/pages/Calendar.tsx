
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import CalendarGrid from '@/components/CalendarGrid';
import DayFormModal from '@/components/DayFormModal';
import CalendarLegend from '@/components/CalendarLegend';
import FilterButtons from '@/components/FilterButtons';
import { ChevronLeft, ChevronRight, LogOut, BarChart3, Calendar as CalendarIcon, Menu } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import { getBillingDataForMonth } from '@/lib/supabase';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [highlightFilter, setHighlightFilter] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

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

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDay(null);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Buscar dados do mês anterior, atual e seguinte
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  const { data: prevBillingData = [] } = useQuery({
    queryKey: ['billing-month', prevYear, prevMonth],
    queryFn: () => getBillingDataForMonth(prevYear, prevMonth),
  });
  const { data: currentBillingData = [] } = useQuery({
    queryKey: ['billing-month', currentYear, currentMonth],
    queryFn: () => getBillingDataForMonth(currentYear, currentMonth),
  });
  const { data: nextBillingData = [] } = useQuery({
    queryKey: ['billing-month', nextYear, nextMonth],
    queryFn: () => getBillingDataForMonth(nextYear, nextMonth),
  });

  // Junta todos os dados
  const billingData = [...prevBillingData, ...currentBillingData, ...nextBillingData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-full mx-auto p-2 sm:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-primary">Método Billings</h1>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/menstrual-cycle">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ciclo Menstrual
              </Button>
            </Link>
            <Link to="/comparison">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparação
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
              <Link to="/menstrual-cycle" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Ciclo Menstrual
                </Button>
              </Link>
              <Link to="/comparison" className="w-full">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Comparação
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

        {/* Filter Buttons */}
        <div className="mb-3">
          <FilterButtons 
            activeFilter={highlightFilter}
            onFilterChange={setHighlightFilter}
          />
        </div>

        {/* Legenda */}
        <div className="mb-3">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <CalendarLegend />
          </div>
        </div>

        {/* Calendar */}
        <div className="w-full">
          <CalendarGrid
            days={days}
            currentDate={currentDate}
            onDayClick={handleDayClick}
            highlightFilter={highlightFilter}
            billingData={billingData}
          />
        </div>

        {/* Modal */}
        <DayFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          selectedDay={selectedDay}
        />
      </div>
    </div>
  );
};

export default Calendar;
