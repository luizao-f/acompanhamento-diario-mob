
import React from 'react';
import { Button } from '@/components/ui/button';
import { Droplets, Heart, Circle, Calendar } from 'lucide-react';

interface FilterButtonsProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'menstruacao', label: 'Menstruação', icon: Calendar, color: 'text-red-500' },
    { id: 'relacao_sexual', label: 'Relação Sexual', icon: Heart, color: 'text-pink-500' },
    { id: 'sensacao', label: 'Sensação', icon: Circle, color: 'text-blue-500' },
    { id: 'muco', label: 'Muco', icon: Droplets, color: 'text-green-500' },
  ];

  return (
    <div className="flex flex-wrap gap-2 bg-white rounded-lg shadow-sm p-3">
      <span className="text-sm font-medium text-gray-600 self-center mr-2">Destacar:</span>
      
      <Button
        variant={activeFilter === null ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange(null)}
        className="text-xs"
      >
        Todos
      </Button>
      
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.id}
            variant={activeFilter === filter.id ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className="text-xs"
          >
            <Icon className={`h-3 w-3 mr-1 ${filter.color}`} />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
};

export default FilterButtons;
