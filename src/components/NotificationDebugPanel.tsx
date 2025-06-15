// src/components/NotificationDebugPanel.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bug, 
  Clock, 
  RefreshCw, 
  Play, 
  Trash2, 
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';

const NotificationDebugPanel: React.FC = () => {
  const { 
    config, 
    debugInfo, 
    clearDebugLog, 
    sendReminderNow, 
    scheduleTestIn,
    testConnection 
  } = useNotifications();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR');
  };

  const getTimeUntilReminder = () => {
    const now = new Date();
    const [hours, minutes] = config.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, considerar amanhã
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const diff = reminderTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  const handleQuickTest = (minutes: number) => {
    scheduleTestIn(minutes);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug de Notificações
            {config.enabled && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                ATIVO
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Minimizar' : 'Expandir'}
          </Button>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Status Atual */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-sm font-medium">Horário Atual</div>
              <div className="text-lg font-bold text-blue-600">{getCurrentTime()}</div>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Timer className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <div className="text-sm font-medium">Próximo Lembrete</div>
              <div className="text-lg font-bold text-orange-600">{config.reminderTime}</div>
              <div className="text-xs text-gray-600">em {getTimeUntilReminder()}</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center">
                {config.enabled ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="text-sm font-medium">Status</div>
              <div className={`text-lg font-bold ${config.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {config.enabled ? 'Ativo' : 'Inativo'}
              </div>
            </div>
          </div>

          {/* Ações de Teste */}
          <div className="space-y-2">
            <h4 className="font-medium">Testes Rápidos:</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={sendReminderNow}
              >
                <Play className="h-4 w-4 mr-1" />
                Enviar Agora
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest(1)}
              >
                <Timer className="h-4 w-4 mr-1" />
                Teste em 1min
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest(2)}
              >
                <Timer className="h-4 w-4 mr-1" />
                Teste em 2min
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={testConnection}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Testar Conexão
              </Button>
            </div>
          </div>

          {/* Log de Debug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Log de Atividades:</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearDebugLog}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
              {debugInfo.length === 0 ? (
                <p className="text-gray-500 text-sm">Nenhuma atividade registrada</p>
              ) : (
                <div className="space-y-1">
                  {debugInfo.map((log, index) => (
                    <div
                      key={index}
                      className={`text-xs font-mono ${
                        log.includes('✅') ? 'text-green-600' :
                        log.includes('❌') ? 'text-red-600' :
                        log.includes('🔔') || log.includes('⏰') ? 'text-blue-600' :
                        'text-gray-600'
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Informações de Configuração */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Configuração Atual:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <div>• Bot Token: {config.botToken ? '✅ Configurado' : '❌ Não configurado'}</div>
              <div>• Chat ID: {config.chatId ? '✅ Configurado' : '❌ Não configurado'}</div>
              <div>• Horário: {config.reminderTime}</div>
              <div>• Status: {config.enabled ? '✅ Ativo' : '❌ Inativo'}</div>
            </div>
          </div>

          {/* Dicas de Troubleshooting */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Dicas:</h4>
            <div className="text-sm text-yellow-700 space-y-1">
              <div>• Use "Teste em 1min" para verificar se o sistema funciona</div>
              <div>• Mantenha a aba aberta para garantir funcionamento</div>
              <div>• Verifique o log para ver atividades do sistema</div>
              <div>• O horário é verificado a cada minuto exato</div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default NotificationDebugPanel;