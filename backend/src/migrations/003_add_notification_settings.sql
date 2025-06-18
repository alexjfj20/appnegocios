-- Agregar campos de configuración de notificaciones
ALTER TABLE users
ADD COLUMN email_notifications BOOLEAN DEFAULT false,
ADD COLUMN email_inventory_alerts BOOLEAN DEFAULT false,
ADD COLUMN email_new_orders BOOLEAN DEFAULT false,
ADD COLUMN email_daily_summary BOOLEAN DEFAULT false,
ADD COLUMN push_notifications BOOLEAN DEFAULT false,
ADD COLUMN push_inventory_alerts BOOLEAN DEFAULT false,
ADD COLUMN push_new_orders BOOLEAN DEFAULT false,
ADD COLUMN whatsapp_notifications BOOLEAN DEFAULT false,
ADD COLUMN whatsapp_inventory_alerts BOOLEAN DEFAULT false,
ADD COLUMN whatsapp_new_orders BOOLEAN DEFAULT false,
ADD COLUMN phone VARCHAR(20);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_users_email_notifications ON users(email_notifications);
CREATE INDEX idx_users_push_notifications ON users(push_notifications);
CREATE INDEX idx_users_whatsapp_notifications ON users(whatsapp_notifications); 