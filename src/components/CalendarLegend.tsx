
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Heart, Circle } from 'lucide-react';

const CalendarLegend = () => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Legenda</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Menstruação */}
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Menstruação</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Forte</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded"></div>
              <span>Manchas</span>
            </div>
          </div>
        </div>

        {/* Sensação */}
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Sensação</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-yellow-600" />
              <span>Seca</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-400" />
              <span>Úmida</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-orange-500 fill-current" />
              <span>Pegajosa</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span>Escorregadia</span>
            </div>
          </div>
        </div>

        {/* Muco */}
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Muco</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-200 rounded"></div>
              <span className="text-xs">Clara de ovo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-blue-200 rounded"></div>
              <span className="text-xs">Transparente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-purple-200 rounded"></div>
              <span className="text-xs">Elástico</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-yellow-200 rounded"></div>
              <span className="text-xs">Espesso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-orange-200 rounded"></div>
              <span className="text-xs">Pegajoso</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-gray-200 rounded"></div>
              <span className="text-xs">Branco</span>
            </div>
          </div>
        </div>

        {/* Relação Sexual */}
        <div>
          <h4 className="font-medium mb-2 text-gray-700">Relação</h4>
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-pink-500 fill-current" />
            <span>Relação sexual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarLegend;
