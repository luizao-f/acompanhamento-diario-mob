
import React from 'react';
import { Circle, Square, Heart, Droplets, Calendar } from 'lucide-react';

const CalendarLegend = () => {
  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-3 border border-pink-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Legenda</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
        {/* Menstruação */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border-b-2 border-red-700"></div>
          <span className="text-gray-600">Menstruação (real)</span>
        </div>

        {/* Predição de menstruação */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-300 rounded border-b-2 border-red-500"></div>
          <span className="text-gray-600">Predição menstrual</span>
        </div>

        {/* Correção - falso positivo */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 rounded border-b-2 border-orange-500"></div>
          <span className="text-gray-600">Predição incorreta</span>
        </div>

        {/* Correção - falso negativo */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border-b-2 border-black"></div>
          <span className="text-gray-600">Variação do ciclo</span>
        </div>

        {/* Relação sexual */}
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-pink-500" />
          <span className="text-gray-600">Relação sexual</span>
        </div>

        {/* Muco */}
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-green-500" />
          <span className="text-gray-600">Muco cervical</span>
        </div>

        {/* Sensação */}
        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-blue-500" />
          <span className="text-gray-600">Sensação</span>
        </div>

        {/* Hoje */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-500 rounded"></div>
          <span className="text-gray-600">Hoje</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
