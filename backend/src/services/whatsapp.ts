import axios from 'axios';
import { FastifyInstance } from 'fastify';

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: string;
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export class WhatsAppService {
  private fastify: FastifyInstance;
  private apiUrl: string;
  private token: string;
  private phoneNumberId: string;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.apiUrl = 'https://graph.facebook.com/v17.0';
    this.token = process.env.WHATSAPP_TOKEN || '';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
  }

  private async sendMessage(message: WhatsAppMessage) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/${this.phoneNumberId}/messages`,
        message,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.fastify.log.info('Mensaje de WhatsApp enviado:', response.data);
      return response.data;
    } catch (error) {
      this.fastify.log.error('Error al enviar mensaje de WhatsApp:', error);
      throw new Error('Error al enviar mensaje de WhatsApp');
    }
  }

  async sendAlert(storeId: number, alert: any) {
    try {
      // Obtener usuarios de la tienda con WhatsApp habilitado
      const users = await this.fastify.db.query(
        `SELECT u.phone, u.name
         FROM users u
         JOIN store_users su ON u.id = su.user_id
         WHERE su.store_id = $1 
         AND u.whatsapp_notifications = true
         AND u.phone IS NOT NULL`,
        [storeId]
      );

      if (users.length === 0) return;

      // Obtener información de la tienda
      const store = await this.fastify.db.query(
        'SELECT name FROM stores WHERE id = $1',
        [storeId]
      );

      // Enviar mensaje a cada usuario
      const messagePromises = users.map((user: any) =>
        this.sendMessage({
          to: user.phone,
          type: 'template',
          template: {
            name: 'inventory_alert',
            language: {
              code: 'es',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: user.name,
                  },
                  {
                    type: 'text',
                    text: store[0].name,
                  },
                  {
                    type: 'text',
                    text: alert.title,
                  },
                  {
                    type: 'text',
                    text: alert.message,
                  },
                ],
              },
            ],
          },
        })
      );

      await Promise.all(messagePromises);
    } catch (error) {
      this.fastify.log.error('Error al enviar alertas por WhatsApp:', error);
    }
  }

  async sendOrderConfirmation(storeId: number, order: any) {
    try {
      if (!order.customer_phone) return;

      // Obtener información de la tienda
      const store = await this.fastify.db.query(
        'SELECT name FROM stores WHERE id = $1',
        [storeId]
      );

      // Enviar mensaje al cliente
      await this.sendMessage({
        to: order.customer_phone,
        type: 'template',
        template: {
          name: 'order_confirmation',
          language: {
            code: 'es',
          },
          components: [
            {
              type: 'body',
              parameters: [
                {
                  type: 'text',
                  text: order.customer_name,
                },
                {
                  type: 'text',
                  text: store[0].name,
                },
                {
                  type: 'text',
                  text: order.id.toString(),
                },
                {
                  type: 'text',
                  text: order.total.toString(),
                },
              ],
            },
          ],
        },
      });
    } catch (error) {
      this.fastify.log.error('Error al enviar confirmación por WhatsApp:', error);
    }
  }

  async sendLowStockAlert(storeId: number, product: any) {
    try {
      // Obtener usuarios de la tienda con WhatsApp habilitado
      const users = await this.fastify.db.query(
        `SELECT u.phone, u.name
         FROM users u
         JOIN store_users su ON u.id = su.user_id
         WHERE su.store_id = $1 
         AND u.whatsapp_notifications = true
         AND u.phone IS NOT NULL`,
        [storeId]
      );

      if (users.length === 0) return;

      // Obtener información de la tienda
      const store = await this.fastify.db.query(
        'SELECT name FROM stores WHERE id = $1',
        [storeId]
      );

      // Enviar mensaje a cada usuario
      const messagePromises = users.map((user: any) =>
        this.sendMessage({
          to: user.phone,
          type: 'template',
          template: {
            name: 'low_stock_alert',
            language: {
              code: 'es',
            },
            components: [
              {
                type: 'body',
                parameters: [
                  {
                    type: 'text',
                    text: user.name,
                  },
                  {
                    type: 'text',
                    text: store[0].name,
                  },
                  {
                    type: 'text',
                    text: product.name,
                  },
                  {
                    type: 'text',
                    text: product.stock.toString(),
                  },
                  {
                    type: 'text',
                    text: product.min_stock.toString(),
                  },
                ],
              },
            ],
          },
        })
      );

      await Promise.all(messagePromises);
    } catch (error) {
      this.fastify.log.error('Error al enviar alertas de stock por WhatsApp:', error);
    }
  }
} 