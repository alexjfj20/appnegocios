import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Server } from 'ws';
import { WebSocket } from 'ws';

declare module 'fastify' {
  interface FastifyInstance {
    ws: {
      server: Server;
      clients: Map<string, WebSocket>;
      broadcast: (message: any) => void;
      sendToStore: (storeId: string, message: any) => void;
    };
  }
}

const websocketPlugin: FastifyPluginAsync = async (fastify) => {
  const wss = new Server({ noServer: true });
  const clients = new Map<string, WebSocket>();

  // Manejar conexiones WebSocket
  wss.on('connection', (ws: WebSocket, storeId: string) => {
    clients.set(storeId, ws);

    ws.on('close', () => {
      clients.delete(storeId);
    });

    ws.on('error', (error) => {
      fastify.log.error(error);
      clients.delete(storeId);
    });
  });

  // Función para enviar mensaje a todos los clientes
  const broadcast = (message: any) => {
    const data = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };

  // Función para enviar mensaje a una tienda específica
  const sendToStore = (storeId: string, message: any) => {
    const client = clients.get(storeId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  };

  // Agregar WebSocket al servidor HTTP
  fastify.server.on('upgrade', (request, socket, head) => {
    const storeId = request.headers['x-store-id'] as string;
    if (!storeId) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, storeId);
    });
  });

  // Decorar fastify con el servidor WebSocket
  fastify.decorate('ws', {
    server: wss,
    clients,
    broadcast,
    sendToStore,
  });
};

export default fp(websocketPlugin, {
  name: 'websocket',
}); 