// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker ativado');
  event.waitUntil(self.clients.claim());
});

// Verificar horário a cada minuto
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Verificar se é 18:00 (6 PM)
  if (hours === 18 && minutes === 0) {
    console.log('Horário do lembrete diário detectado:', now.toISOString());
    
    // Enviar mensagem para todos os clientes ativos
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'DAILY_REMINDER',
          time: now.toISOString()
        });
      });
    });
  }
}, 60000); // Verificar a cada minuto

// Listener para mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Interceptar fetches (opcional, para cache)
self.addEventListener('fetch', (event) => {
  // Deixar passar todas as requisições normalmente
  // Aqui você poderia implementar cache se necessário
});