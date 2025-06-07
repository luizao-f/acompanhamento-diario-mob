
import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import CalendarGrid from '@/components/CalendarGrid';
import DayFormModal from '@/components/DayFormModal';
import CalendarLegend from '@/components/CalendarLegend';
import { ChevronLeft, ChevronRight, LogOut, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <CalendarIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Método Billings</h1>
          </div>
          <div className="flex items-center gap-4">
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
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
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

        {/* Calendar and Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <CalendarGrid
              days={days}
              currentDate={currentDate}
              onDayClick={handleDayClick}
            />
          </div>
          <div className="lg:col-span-1">
            <CalendarLegend />
          </div>
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
