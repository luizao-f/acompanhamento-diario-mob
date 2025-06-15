// src/components/NotificationIndicator.tsx
import React from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface NotificationIndicatorProps {
  variant?: 'compact' | 'full';
}

const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ variant = 'compact' }) => {
  const { config, isConfigured } = useNotifications();

  if (variant === 'compact') {
    return (
      <Link to="/notifications">
        <Button variant="outline" size="sm" className="relative">
          {isConfigured ? (
            <>
              <Bell className="h-4 w-4 mr-2 text-green-600" />
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-3 w-3 p-0 flex items-center justify-center">
                ✓
              </Badge>
            </>
          ) : (
            <BellOff className="h-4 w-4 mr-2 text-gray-400" />
          )}
          Notificações
        </Button>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isConfigured ? (
            <Bell className="h-5 w-5 text-green-600" />
          ) : (
            <BellOff className="h-5 w-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-medium">
              {isConfigured ? 'Notificações Ativadas' : 'Notificações Desativadas'}
            </h3>
            {isConfigured ? (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>Lembrete diário às {config.reminderTime}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Configure para receber lembretes diários
              </p>
            )}
          </div>
        </div>
        
        <Link to="/notifications">
          <Button variant={isConfigured ? "outline" : "default"} size="sm">
            {isConfigured ? 'Configurar' : 'Ativar'}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotificationIndicator;