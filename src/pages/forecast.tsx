import React from "react";
import ForecastCalendar from "@/components/ForecastCalendar";
import { useMenstruationHistory } from "@/hooks/useMenstruationHistory";
import { Droplet, CalendarIcon, BarChart3, LogOut } from "lucide-react";
import { Link } from "react-router-dom"; // ou use 'next/link' se for Next.js
import { Button } from "@/components/ui/button";

export default function ForecastPage() {
  const { history, loading } = useMenstruationHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-full mx-auto p-2 lg:p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center gap-4">
            <Droplet className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Previsão de Menstruação</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Calendário
              </Button>
            </Link>
            <Link to="/comparison">
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Comparação
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => {/* logout logic */}}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
        {/* Conteúdo principal */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          {loading ? (
            <div>Carregando...</div>
          ) : (
            <ForecastCalendar history={history} />
          )}
        </div>
      </div>
    </div>
  );
}