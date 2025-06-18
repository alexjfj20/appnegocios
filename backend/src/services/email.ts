import nodemailer from 'nodemailer';
import { FastifyInstance } from 'fastify';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data?: Record<string, any>;
}

export class EmailService {
  private fastify: FastifyInstance;
  private transporter: nodemailer.Transporter;
  private templates: Map<string, HandlebarsTemplateDelegate>;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.templates = new Map();
    this.initializeTransporter();
    this.loadTemplates();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  private loadTemplates() {
    const templatesDir = join(__dirname, '../templates/email');
    const templates = [
      'alert.html',
      'order-confirmation.html',
      'password-reset.html',
      'welcome.html',
    ];

    templates.forEach((template) => {
      const templatePath = join(templatesDir, template);
      const templateContent = readFileSync(templatePath, 'utf-8');
      this.templates.set(template, compile(templateContent));
    });
  }

  async sendEmail({ to, subject, template, data = {} }: EmailOptions) {
    try {
      const templateFn = this.templates.get(template);
      if (!templateFn) {
        throw new Error(`Template ${template} no encontrado`);
      }

      const html = templateFn({
        ...data,
        baseUrl: process.env.FRONTEND_URL,
        storeName: data.storeName || 'Mi Tienda',
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.fastify.log.info('Email enviado:', info.messageId);
      return info;
    } catch (error) {
      this.fastify.log.error('Error al enviar email:', error);
      throw new Error('Error al enviar correo electrónico');
    }
  }

  async sendAlertEmail(storeId: number, alert: any) {
    try {
      // Obtener usuarios de la tienda
      const users = await this.fastify.db.query(
        `SELECT u.email, u.name
         FROM users u
         JOIN store_users su ON u.id = su.user_id
         WHERE su.store_id = $1 AND u.email_notifications = true`,
        [storeId]
      );

      if (users.length === 0) return;

      // Obtener información de la tienda
      const store = await this.fastify.db.query(
        'SELECT name FROM stores WHERE id = $1',
        [storeId]
      );

      // Enviar email a cada usuario
      const emailPromises = users.map((user: any) =>
        this.sendEmail({
          to: user.email,
          subject: `[${store[0].name}] Nueva alerta: ${alert.title}`,
          template: 'alert.html',
          data: {
            userName: user.name,
            storeName: store[0].name,
            alertTitle: alert.title,
            alertMessage: alert.message,
            alertType: alert.type,
            alertDate: new Date(alert.created_at).toLocaleString(),
          },
        })
      );

      await Promise.all(emailPromises);
    } catch (error) {
      this.fastify.log.error('Error al enviar emails de alerta:', error);
    }
  }

  async sendOrderConfirmationEmail(storeId: number, order: any) {
    try {
      // Obtener información de la tienda
      const store = await this.fastify.db.query(
        'SELECT name FROM stores WHERE id = $1',
        [storeId]
      );

      // Enviar email al cliente
      await this.sendEmail({
        to: order.customer_email,
        subject: `[${store[0].name}] Confirmación de Pedido #${order.id}`,
        template: 'order-confirmation.html',
        data: {
          customerName: order.customer_name,
          storeName: store[0].name,
          orderId: order.id,
          orderDate: new Date(order.created_at).toLocaleString(),
          orderTotal: order.total,
          orderItems: order.items,
        },
      });
    } catch (error) {
      this.fastify.log.error('Error al enviar email de confirmación:', error);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    try {
      await this.sendEmail({
        to: email,
        subject: 'Restablecer Contraseña',
        template: 'password-reset.html',
        data: {
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        },
      });
    } catch (error) {
      this.fastify.log.error('Error al enviar email de restablecimiento:', error);
    }
  }

  async sendWelcomeEmail(email: string, name: string, storeName: string) {
    try {
      await this.sendEmail({
        to: email,
        subject: `Bienvenido a ${storeName}`,
        template: 'welcome.html',
        data: {
          userName: name,
          storeName,
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      });
    } catch (error) {
      this.fastify.log.error('Error al enviar email de bienvenida:', error);
    }
  }
} 