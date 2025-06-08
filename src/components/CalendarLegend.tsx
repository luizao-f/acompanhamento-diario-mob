
import React from 'react';
import { Droplets, Heart, Circle } from 'lucide-react';

const CalendarLegend = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
      {/* Menstruação */}
      <div>
        <h4 className="font-medium mb-2 text-gray-500 text-[10px] uppercase tracking-wide">Menstruação</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-[10px] text-gray-600">Forte</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-300 rounded"></div>
            <span className="text-[10px] text-gray-600">Manchas</span>
          </div>
        </div>
      </div>

      {/* Sensação */}
      <div>
        <h4 className="font-medium mb-2 text-gray-500 text-[10px] uppercase tracking-wide">Sensação</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 text-yellow-600" />
            <span className="text-[10px] text-gray-600">Seca</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-2 w-2 text-blue-400" />
            <span className="text-[10px] text-gray-600">Úmida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="h-2 w-2 text-orange-500 fill-current" />
            <span className="text-[10px] text-gray-600">Pegajosa</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-2 w-2 text-blue-600" />
            <span className="text-[10px] text-gray-600">Escorregadia</span>
          </div>
        </div>
      </div>

      {/* Muco */}
      <div>
        <h4 className="font-medium mb-2 text-gray-500 text-[10px] uppercase tracking-wide">Muco</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-green-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Clara de ovo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-blue-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Transparente</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-purple-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Elástico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-yellow-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Espesso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-orange-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Pegajoso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-1 bg-gray-200 rounded"></div>
            <span className="text-[10px] text-gray-600">Branco</span>
          </div>
        </div>
      </div>

      {/* Relação Sexual */}
      <div>
        <h4 className="font-medium mb-2 text-gray-500 text-[10px] uppercase tracking-wide">Relação</h4>
        <div className="flex items-center gap-1.5">
          <Heart className="h-2 w-2 text-pink-500 fill-current" />
          <span className="text-[10px] text-gray-600">Relação sexual</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
