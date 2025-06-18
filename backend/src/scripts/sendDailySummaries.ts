import { build } from '../app';
import { NotificationService } from '../services/notifications';

async function sendDailySummaries() {
  const app = await build();
  const notificationService = new NotificationService(app);

  try {
    // Obtener todos los usuarios que tienen habilitado el resumen diario
    const users = await app.db.query(
      `SELECT id
       FROM users
       WHERE email_daily_summary = true OR whatsapp_notifications = true`
    );

    // Enviar resumen a cada usuario
    for (const user of users) {
      try {
        await notificationService.sendDailySummary(user.id);
        app.log.info(`Resumen diario enviado al usuario ${user.id}`);
      } catch (error) {
        app.log.error(`Error al enviar resumen al usuario ${user.id}:`, error);
      }
    }

    app.log.info('Proceso de envío de resúmenes diarios completado');
  } catch (error) {
    app.log.error('Error en el proceso de envío de resúmenes diarios:', error);
  } finally {
    await app.close();
  }
}

// Ejecutar el script
sendDailySummaries().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
}); 