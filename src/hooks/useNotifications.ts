// src/hooks/useNotifications.ts - VERSÃO CORRIGIDA
import { useState, useEffect, useCallback } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { toast } = useToast();

  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugInfo(prev => [...prev.slice(-9), logMessage]); // Manter últimas 10 mensagens
  }, []);

  const loadConfig = useCallback(() => {
    const saved = localStorage.getItem('notification_config');
    if (saved) {
      try {
        const parsedConfig = JSON.parse(saved);
        setConfig(parsedConfig);
        addDebugLog(`Configuração carregada: ${parsedConfig.enabled ? 'ATIVA' : 'INATIVA'} às ${parsedConfig.reminderTime}`);
        return parsedConfig;
      } catch (error) {
        addDebugLog('Erro ao carregar configurações');
        console.error('Erro ao carregar configurações de notificação:', error);
      }
    }
    return null;
  }, [addDebugLog]);

  const sendTelegramMessage = useCallback(async (message: string): Promise<boolean> => {
    if (!config.botToken || !config.chatId) {
      addDebugLog('Erro: Token ou Chat ID não configurados');
      return false;
    }

    try {
      addDebugLog('Enviando mensagem para Telegram...');
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

      if (response.ok) {
        addDebugLog('✅ Mensagem enviada com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        addDebugLog(`❌ Erro na API: ${response.status} - ${errorText}`);
        return false;
      }
    } catch (error) {
      addDebugLog(`❌ Erro de rede: ${error}`);
      console.error('Erro ao enviar mensagem Telegram:', error);
      return false;
    }
  }, [config.botToken, config.chatId, addDebugLog]);

  const createReminderMessage = useCallback(() => {
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

Olá Luiz! É hora de registrar suas observações do dia.

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
  }, [config.reminderTime]);

  const handleDailyReminder = useCallback(async () => {
    if (!config.enabled || !config.botToken || !config.chatId) {
      addDebugLog('❌ Lembrete cancelado: configuração incompleta');
      return;
    }

    addDebugLog('🔔 Enviando lembrete diário...');
    const success = await sendTelegramMessage(createReminderMessage());
    
    if (success) {
      addDebugLog('✅ Lembrete diário enviado com sucesso');
      toast({
        title: "Lembrete enviado!",
        description: "Notificação do Método Billings enviada via Telegram",
      });
    } else {
      addDebugLog('❌ Falha ao enviar lembrete diário');
    }
  }, [config.enabled, config.botToken, config.chatId, sendTelegramMessage, createReminderMessage, addDebugLog, toast]);

  const checkTimeAndSendReminder = useCallback(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    addDebugLog(`Verificando horário: ${currentTime} vs ${config.reminderTime}`);
    
    if (config.enabled && currentTime === config.reminderTime) {
      addDebugLog('⏰ Horário do lembrete detectado!');
      handleDailyReminder();
    }
  }, [config.enabled, config.reminderTime, handleDailyReminder, addDebugLog]);

  useEffect(() => {
    const savedConfig = loadConfig();
    
    // Configurar verificação a cada minuto
    const intervalId = setInterval(() => {
      checkTimeAndSendReminder();
    }, 60000); // 60 segundos

    addDebugLog('🚀 Sistema de notificações iniciado');
    
    // Verificação imediata (útil para testes)
    checkTimeAndSendReminder();

    return () => {
      clearInterval(intervalId);
      addDebugLog('🛑 Sistema de notificações parado');
    };
  }, [loadConfig, checkTimeAndSendReminder, addDebugLog]);

  // Atualizar verificação quando a configuração mudar
  useEffect(() => {
    if (config.enabled) {
      addDebugLog(`⚙️ Configuração atualizada: Lembrete às ${config.reminderTime}`);
    }
  }, [config, addDebugLog]);

  const testConnection = async (): Promise<boolean> => {
    if (!config.botToken || !config.chatId) {
      addDebugLog('❌ Teste cancelado: configuração incompleta');
      return false;
    }

    try {
      addDebugLog('🧪 Testando conexão...');
      const response = await fetch(`https://api.telegram.org/bot${config.botToken}/getMe`);
      const success = response.ok;
      addDebugLog(success ? '✅ Conexão OK' : '❌ Falha na conexão');
      return success;
    } catch (error) {
      addDebugLog(`❌ Erro de conexão: ${error}`);
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  };

  const sendTestMessage = async (): Promise<boolean> => {
    const testMessage = `
🤖 <b>Teste de Conexão - ${new Date().toLocaleTimeString('pt-BR')}</b>

✅ Sua configuração do Telegram está funcionando corretamente!

🎯 Você receberá lembretes diários às <b>${config.reminderTime}</b> para registrar suas observações do Método Billings.

📱 Este é apenas um teste - os lembretes reais serão enviados automaticamente.

⏰ Próximo lembrete programado para hoje às ${config.reminderTime}
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
    addDebugLog(`⚙️ Configuração salva: ${updatedConfig.enabled ? 'ATIVA' : 'INATIVA'} às ${updatedConfig.reminderTime}`);
  };

  const isConfigured = () => {
    return config.enabled && config.botToken && config.chatId;
  };

  // Função para testar agora (independente do horário)
  const sendReminderNow = () => {
    addDebugLog('🧪 Enviando lembrete de teste...');
    handleDailyReminder();
  };

  // Função para definir próximo teste em X minutos
  const scheduleTestIn = (minutes: number) => {
    const now = new Date();
    const testTime = new Date(now.getTime() + minutes * 60000);
    const timeStr = `${testTime.getHours().toString().padStart(2, '0')}:${testTime.getMinutes().toString().padStart(2, '0')}`;
    
    updateConfig({ reminderTime: timeStr });
    addDebugLog(`⏰ Teste agendado para ${timeStr} (em ${minutes} minutos)`);
  };

  return {
    config,
    updateConfig,
    testConnection,
    sendTestMessage,
    isConfigured: isConfigured(),
    sendReminderNow,
    scheduleTestIn,
    debugInfo,
    clearDebugLog: () => setDebugInfo([])
  };
};