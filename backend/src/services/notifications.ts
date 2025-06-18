import { FastifyInstance } from 'fastify';
import { EmailService } from './email';
import { WhatsAppService } from './whatsapp';
import { PushNotificationService } from './push';

export class NotificationService {
  private emailService: EmailService;
  private whatsappService: WhatsAppService;
  private pushService: PushNotificationService;

  constructor(private fastify: FastifyInstance) {
    this.emailService = new EmailService(fastify);
    this.whatsappService = new WhatsAppService(fastify);
    this.pushService = new PushNotificationService(fastify);
  }

  async sendDailySummary(userId: number): Promise<void> {
    try {
      // Obtener configuración del usuario
      const user = await this.fastify.db.query(
        `SELECT email, phone, email_daily_summary, whatsapp_notifications
         FROM users
         WHERE id = $1`,
        [userId]
      );

      if (user.length === 0) return;

      const userConfig = user[0];

      // Obtener resumen del día
      const summary = await this.getDailySummary(userId);

      // Enviar por email si está habilitado
      if (userConfig.email_daily_summary) {
        await this.emailService.sendDailySummary(userConfig.email, summary);
      }

      // Enviar por WhatsApp si está habilitado
      if (userConfig.whatsapp_notifications && userConfig.phone) {
        await this.whatsappService.sendDailySummary(userConfig.phone, summary);
      }
    } catch (error) {
      this.fastify.log.error(error);
      throw new Error('Error al enviar resumen diario');
    }
  }

  private async getDailySummary(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Obtener ventas del día
    const sales = await this.fastify.db.query(
      `SELECT COUNT(*) as total_orders, SUM(total) as total_sales
       FROM orders
       WHERE user_id = $1 AND created_at >= $2`,
      [userId, today]
    );

    // Obtener alertas de inventario
    const alerts = await this.fastify.db.query(
      `SELECT COUNT(*) as total_alerts
       FROM inventory_alerts
       WHERE user_id = $1 AND created_at >= $2 AND read = false`,
      [userId, today]
    );

    // Obtener productos con bajo stock
    const lowStock = await this.fastify.db.query(
      `SELECT COUNT(*) as total_low_stock
       FROM products
       WHERE user_id = $1 AND stock <= min_stock`,
      [userId]
    );

    return {
      date: today.toISOString().split('T')[0],
      sales: {
        total_orders: parseInt(sales[0].total_orders) || 0,
        total_sales: parseFloat(sales[0].total_sales) || 0,
      },
      inventory: {
        alerts: parseInt(alerts[0].total_alerts) || 0,
        low_stock: parseInt(lowStock[0].total_low_stock) || 0,
      },
    };
  }
} 