import { ref } from 'vue';
import { useStore } from '@/stores/store';

interface WebSocketMessage {
  type: string;
  data: any;
}

export const useWebSocket = () => {
  const store = useStore();
  const ws = ref<WebSocket | null>(null);
  const isConnected = ref(false);
  const reconnectAttempts = ref(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws.value = new WebSocket(wsUrl);

    ws.value.onopen = () => {
      console.log('WebSocket conectado');
      isConnected.value = true;
      reconnectAttempts.value = 0;

      // Enviar ID de la tienda
      if (ws.value && store.currentStore) {
        ws.value.send(JSON.stringify({
          type: 'auth',
          storeId: store.currentStore.id,
        }));
      }
    };

    ws.value.onclose = () => {
      console.log('WebSocket desconectado');
      isConnected.value = false;

      // Intentar reconectar
      if (reconnectAttempts.value < maxReconnectAttempts) {
        reconnectAttempts.value++;
        setTimeout(connect, 1000 * Math.pow(2, reconnectAttempts.value));
      }
    };

    ws.value.onerror = (error) => {
      console.error('Error en WebSocket:', error);
    };

    ws.value.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error al procesar mensaje:', error);
      }
    };
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'alert':
        // Emitir evento de nueva alerta
        window.dispatchEvent(new CustomEvent('new-alert', {
          detail: message.data,
        }));
        break;
      default:
        console.warn('Tipo de mensaje desconocido:', message.type);
    }
  };

  const disconnect = () => {
    if (ws.value) {
      ws.value.close();
      ws.value = null;
      isConnected.value = false;
    }
  };

  return {
    connect,
    disconnect,
    isConnected,
  };
}; 