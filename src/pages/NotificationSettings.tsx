// src/pages/NotificationSettings.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, Clock, MessageCircle, CheckCircle, LogOut } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  reminderTime: string;
}

const NotificationSettings = () => {
  const { 
    config, 
    updateConfig, 
    testConnection, 
    sendTestMessage, 
    isConfigured,
    sendReminderNow,
    scheduleTestIn,
    debugInfo,
    clearDebugLog
  } = useNotifications();
  
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [showDebug, setShowDebug] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Configuração já é gerenciada pelo hook useNotifications
    if (config.enabled && config.botToken && config.chatId) {
      testConnectionInternal(config.botToken, config.chatId, false);
    }
  }, [config]);

  const testConnectionInternal = async (botToken?: string, chatId?: string, showToast = true) => {
    const token = botToken || config.botToken;
    const chat = chatId || config.chatId;

    if (!token || !chat) {
      if (showToast) {
        toast({
          title: "Erro",
          description: "Preencha o Bot Token e Chat ID",
          variant: "destructive",
        });
      }
      return false;
    }

    setIsTesting(true);
    
    try {
      const success = await testConnection();
      setConnectionStatus(success ? 'connected' : 'error');
      
      if (showToast) {
        if (success) {
          await sendTestMessage();
        } else {
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao Telegram. Verifique suas credenciais.",
            variant: "destructive",
          });
        }
      }
      return success;
    } catch (error) {
      setConnectionStatus('error');
      if (showToast) {
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao Telegram. Verifique suas credenciais.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  const saveConfig = () => {
    toast({
      title: "Configurações salvas!",
      description: "Suas preferências de notificação foram atualizadas",
    });
  };

  const sendTestReminder = async () => {
    setIsTesting(true);
    await sendReminderNow();
    setIsTesting(false);
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR');
  };

  const getTimeUntilReminder = () => {
    const now = new Date();
    const [hours, minutes] = config.reminderTime.split(':').map(Number);
    const reminderTime = new Date();
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const diff = reminderTime.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <MessageCircle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-4">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Configurações de Notificação</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Configuração Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Ativar Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="notifications-enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => updateConfig({ enabled: checked })}
                />
                <Label htmlFor="notifications-enabled">
                  Receber lembretes diários
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Horário do lembrete
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={config.reminderTime}
                  onChange={(e) => updateConfig({ reminderTime: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuração do Telegram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon()}
                Configuração do Telegram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-token">Bot Token</Label>
                <Input
                  id="bot-token"
                  type="password"
                  value={config.botToken}
                  onChange={(e) => updateConfig({ botToken: e.target.value })}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chat-id">Chat ID</Label>
                <Input
                  id="chat-id"
                  value={config.chatId}
                  onChange={(e) => updateConfig({ chatId: e.target.value })}
                  placeholder="123456789"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => testConnectionInternal()}
                  disabled={isTesting}
                  className="flex-1"
                >
                  {isTesting ? 'Testando...' : 'Testar Conexão'}
                </Button>
                <Button onClick={saveConfig} className="flex-1">
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Instruções */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>📋 Como configurar o Telegram</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">1. Criar um Bot no Telegram:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                  <li>Abra o Telegram e procure por <code className="bg-gray-100 px-1 rounded">@BotFather</code></li>
                  <li>Digite <code className="bg-gray-100 px-1 rounded">/newbot</code> e siga as instruções</li>
                  <li>Escolha um nome e username para seu bot</li>
                  <li>Copie o <strong>Bot Token</strong> fornecido</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">2. Obter o Chat ID:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-4">
                  <li>Envie uma mensagem qualquer para o bot que você criou</li>
                  <li>Acesse no navegador: <code className="bg-gray-100 px-1 rounded">https://api.telegram.org/bot[SEU_TOKEN]/getUpdates</code></li>
                  <li>Substitua <code className="bg-gray-100 px-1 rounded">[SEU_TOKEN]</code> pelo token do seu bot</li>
                  <li>Procure pelo valor <code className="bg-gray-100 px-1 rounded">"id"</code> dentro de <code className="bg-gray-100 px-1 rounded">"chat"</code></li>
                  <li>Copie este número (Chat ID)</li>
                </ol>
              </div>

              {config.enabled && config.botToken && config.chatId && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">✅ Configuração ativa</h4>
                  <p className="text-sm text-green-700">
                    Você receberá lembretes diários às <strong>{config.reminderTime}</strong> no seu Telegram.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={sendTestReminder}
                    disabled={isTesting}
                  >
                    {isTesting ? 'Enviando...' : 'Enviar Teste Agora'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;