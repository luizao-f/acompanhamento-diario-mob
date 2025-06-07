
import React from 'react';
import { Droplets, Heart, Circle } from 'lucide-react';

const CalendarLegend = () => {
  return (
    <div className="space-y-3 text-xs">
      {/* Menstruação */}
      <div>
        <h4 className="font-medium mb-1 text-gray-600 text-xs">Menstruação</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs">Forte</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-300 rounded"></div>
            <span className="text-xs">Manchas</span>
          </div>
        </div>
      </div>

      {/* Sensação */}
      <div>
        <h4 className="font-medium mb-1 text-gray-600 text-xs">Sensação</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-yellow-600" />
            <span className="text-xs">Seca</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-3 w-3 text-blue-400" />
            <span className="text-xs">Úmida</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-orange-500 fill-current" />
            <span className="text-xs">Pegajosa</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-3 w-3 text-blue-600" />
            <span className="text-xs">Escorregadia</span>
          </div>
        </div>
      </div>

      {/* Muco */}
      <div>
        <h4 className="font-medium mb-1 text-gray-600 text-xs">Muco</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-green-200 rounded"></div>
            <span className="text-xs">Clara de ovo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-blue-200 rounded"></div>
            <span className="text-xs">Transparente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-purple-200 rounded"></div>
            <span className="text-xs">Elástico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-yellow-200 rounded"></div>
            <span className="text-xs">Espesso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-orange-200 rounded"></div>
            <span className="text-xs">Pegajoso</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1.5 bg-gray-200 rounded"></div>
            <span className="text-xs">Branco</span>
          </div>
        </div>
      </div>

      {/* Relação Sexual */}
      <div>
        <h4 className="font-medium mb-1 text-gray-600 text-xs">Relação</h4>
        <div className="flex items-center gap-2">
          <Heart className="h-3 w-3 text-pink-500 fill-current" />
          <span className="text-xs">Relação sexual</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarLegend;
