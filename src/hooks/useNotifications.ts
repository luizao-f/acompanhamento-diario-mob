// src/hooks/useNotifications.ts
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  reminderTime: string;
}

export const useNotifications = () => {
  const [config, setConfig] = useState<NotificationConfig>({
    enabled: false,
    botToken: '',
    chatId: '',
    reminderTime: '18:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadConfig();
    setupNotificationSystem();
  }, []);

  const loadConfig = () => {
    const saved = localStorage.getItem('notification_config');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Erro ao carregar configurações de notificação:', error);
      }
    }
  };

  const setupNotificationSystem = () => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado para notificações');
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });

      // Listener para mensagens do Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'DAILY_REMINDER') {
          handleDailyReminder();
        }
      });
    }

    // Verificação manual do horário (fallback)
    const checkTimeInterval = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = config.reminderTime.split(':').map(Number);
      
      if (now.getHours() === hours && now.getMinutes() === minutes) {
        handleDailyReminder();
      }
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(checkTimeInterval);
  };

  const handleDailyReminder = async () => {
    if (!config.enabled || !config.botToken || !config.chatId) {
      return;
    }

    const success = await sendTelegramMessage(createReminderMessage());
    
    if (success) {
      toast({
        title: "Lembrete enviado!",
        description: "Notificação do Método Billings enviada via Telegram",
      });
    }
  };

  const createReminderMessage = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
🌸 <b>Lembrete do Método Billings</b> 🌸

📅 <b>${dateStr}</b>

Olá! É hora de registrar suas observações do dia.

📝 <b>Não esqueça de anotar:</b>
• 🌡️ Sensação (seca, úmida, pegajosa, escorregadia)
• 💧 Muco (características observadas)
• 🩸 Menstruação (se houver)
• ❤️ Relação sexual (se houver)
• 📋 Observações gerais

🔗 <b>Acesse o sistema:</b>
${window.location.origin}

⏰ <i>Lembrete automático às ${config.reminderTime}</i>

💡 <b>Dica:</b> Registre sempre no mesmo horário para melhor controle do seu ciclo!
    `;
  };

  const sendTelegramMessage = async (message: string): Promise<boolean> => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao enviar mensagem Telegram:', error);
      return false;
    }
  };

  const testConnection = async (): Promise<boolean> => {
    if (!config.botToken || !config.chatId) {
      return false;
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  };

  const sendTestMessage = async (): Promise<boolean> => {
    const testMessage = `
🤖 <b>Teste de Conexão</b>

✅ Sua configuração do Telegram está funcionando corretamente!

🎯 Você receberá lembretes diários às <b>${config.reminderTime}</b> para registrar suas observações do Método Billings.

📱 Este é apenas um teste - os lembretes reais serão enviados automaticamente.
    `;

    const success = await sendTelegramMessage(testMessage);
    
    if (success) {
      toast({
        title: "Teste enviado!",
        description: "Mensagem de teste enviada com sucesso",
      });
    } else {
      toast({
        title: "Erro no teste",
        description: "Não foi possível enviar a mensagem de teste",
        variant: "destructive",
      });
    }

    return success;
  };

  const updateConfig = (newConfig: Partial<NotificationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem('notification_config', JSON.stringify(updatedConfig));
  };

  const isConfigured = () => {
    return config.enabled && config.botToken && config.chatId;
  };

  return {
    config,
    updateConfig,
    testConnection,
    sendTestMessage,
    isConfigured: isConfigured(),
    sendReminderNow: handleDailyReminder
  };
};