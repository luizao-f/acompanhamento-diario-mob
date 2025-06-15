// src/lib/telegramNotifications.ts
interface TelegramConfig {
  botToken: string;
  chatId: string;
}

class TelegramNotificationService {
  private config: TelegramConfig;
  private baseUrl: string;

  constructor(config: TelegramConfig) {
    this.config = config;
    this.baseUrl = `https://api.telegram.org/bot${config.botToken}`;
  }

  async sendMessage(text: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: this.config.chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem Telegram:', error);
      return false;
    }
  }

  async sendDailyReminder(): Promise<boolean> {
    const message = `
🌸 <b>Lembrete do Método Billings</b> 🌸

Olá! É hora de registrar suas observações do dia.

📝 <b>Não esqueça de anotar:</b>
• Sensação (seca, úmida, pegajosa, escorregadia)
• Muco (características observadas)
• Menstruação (se houver)
• Relação sexual (se houver)
• Observações gerais

🔗 <b>Acesse o sistema:</b>
${window.location.origin}

⏰ <i>Lembrete enviado automaticamente às 18:00</i>
    `;

    return await this.sendMessage(message);
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão Telegram:', error);
      return false;
    }
  }
}

// Configuração do serviço
export const createTelegramService = (botToken: string, chatId: string) => {
  return new TelegramNotificationService({ botToken, chatId });
};

// Hook para usar o serviço no React
import { useState, useEffect } from 'react';

export const useTelegramNotifications = (botToken?: string, chatId?: string) => {
  const [service, setService] = useState<TelegramNotificationService | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (botToken && chatId) {
      const telegramService = createTelegramService(botToken, chatId);
      setService(telegramService);
      setIsConfigured(true);
    }
  }, [botToken, chatId]);

  const sendReminder = async () => {
    if (!service) return false;
    return await service.sendDailyReminder();
  };

  const testConnection = async () => {
    if (!service) return false;
    return await service.testConnection();
  };

  return {
    sendReminder,
    testConnection,
    isConfigured,
  };
};

// Função para agendar notificações diárias
export const scheduleDaily notifications = () => {
  // Verificar se já existe um agendamento
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // Registrar service worker para notificações em background
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado:', registration);
      })
      .catch(error => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  }

  // Configurar timer para verificar horário
  const checkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Verificar se é 18:00
    if (hours === 18 && minutes === 0) {
      // Disparar notificação
      const event = new CustomEvent('daily-reminder', {
        detail: { time: now.toISOString() }
      });
      window.dispatchEvent(event);
    }
  };

  // Verificar a cada minuto
  setInterval(checkTime, 60000);
};

// Componente de configuração
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface TelegramConfigProps {
  onConfigSaved: (botToken: string, chatId: string) => void;
}

export const TelegramConfig: React.FC<TelegramConfigProps> = ({ onConfigSaved }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isTestinng, setIsTesting] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    if (!botToken || !chatId) {
      toast({
        title: "Erro",
        description: "Preencha o Bot Token e Chat ID",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    const service = createTelegramService(botToken, chatId);
    
    try {
      const isConnected = await service.testConnection();
      if (isConnected) {
        const sent = await service.sendMessage('🤖 Teste de conexão realizado com sucesso!');
        if (sent) {
          toast({
            title: "Sucesso!",
            description: "Mensagem de teste enviada com sucesso",
          });
        } else {
          throw new Error('Falha ao enviar mensagem');
        }
      } else {
        throw new Error('Falha na conexão');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao Telegram. Verifique suas credenciais.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!botToken || !chatId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    // Salvar no localStorage
    localStorage.setItem('telegram_bot_token', botToken);
    localStorage.setItem('telegram_chat_id', chatId);
    
    onConfigSaved(botToken, chatId);
    
    toast({
      title: "Configuração salva!",
      description: "As notificações do Telegram foram configuradas",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📱 Configurar Notificações Telegram
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="botToken">Bot Token</Label>
          <Input
            id="botToken"
            type="password"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxyz"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="chatId">Chat ID</Label>
          <Input
            id="chatId"
            value={chatId}
            onChange={(e) => setChatId(e.target.value)}
            placeholder="123456789"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleTest}
            disabled={isTestinng}
          >
            {isTestinng ? 'Testando...' : 'Testar'}
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>

        <div className="text-xs text-gray-600 space-y-2">
          <p><strong>Como obter Bot Token:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o Telegram e procure por @BotFather</li>
            <li>Digite /newbot e siga as instruções</li>
            <li>Copie o token fornecido</li>
          </ol>
          
          <p><strong>Como obter Chat ID:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Envie uma mensagem para seu bot</li>
            <li>Acesse: https://api.telegram.org/bot[SEU_TOKEN]/getUpdates</li>
            <li>Copie o valor de "chat" → "id"</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

// Service Worker para notificações em background
// Arquivo: public/sw.js
export const serviceWorkerCode = `
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
});

// Verificar horário a cada minuto
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  if (hours === 18 && minutes === 0) {
    // Enviar mensagem para o cliente
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DAILY_REMINDER',
          time: now.toISOString()
        });
      });
    });
  }
}, 60000);
`;

// Componente principal de notificações
export const NotificationManager: React.FC = () => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const { sendReminder, testConnection } = useTelegramNotifications(botToken, chatId);
  const { toast } = useToast();

  useEffect(() => {
    // Carregar configurações salvas
    const savedToken = localStorage.getItem('telegram_bot_token');
    const savedChatId = localStorage.getItem('telegram_chat_id');
    
    if (savedToken && savedChatId) {
      setBotToken(savedToken);
      setChatId(savedChatId);
      setIsConfigured(true);
    }

    // Registrar listener para lembretes diários
    const handleDailyReminder = async () => {
      if (savedToken && savedChatId) {
        const success = await sendReminder();
        if (success) {
          toast({
            title: "Lembrete enviado!",
            description: "Notificação do Método Billings enviada via Telegram",
          });
        }
      }
    };

    window.addEventListener('daily-reminder', handleDailyReminder);
    
    // Iniciar verificação de horário
    scheduleDaily notifications();

    return () => {
      window.removeEventListener('daily-reminder', handleDailyReminder);
    };
  }, [sendReminder, toast]);

  const handleConfigSaved = (token: string, chatId: string) => {
    setBotToken(token);
    setChatId(chatId);
    setIsConfigured(true);
  };

  const sendTestReminder = async () => {
    const success = await sendReminder();
    toast({
      title: success ? "Sucesso!" : "Erro",
      description: success 
        ? "Lembrete de teste enviado" 
        : "Falha ao enviar lembrete",
      variant: success ? "default" : "destructive",
    });
  };

  if (!isConfigured) {
    return <TelegramConfig onConfigSaved={handleConfigSaved} />;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>✅ Notificações Configuradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Você receberá lembretes diários às 18:00 para registrar suas observações.
        </p>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={sendTestReminder}>
            Enviar Teste
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsConfigured(false)}
          >
            Reconfigurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};