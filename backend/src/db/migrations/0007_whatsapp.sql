-- Agregar campos de WhatsApp a la tabla de usuarios
ALTER TABLE users
ADD COLUMN phone VARCHAR(20),
ADD COLUMN whatsapp_notifications BOOLEAN DEFAULT false;

-- Crear índice para búsqueda por teléfono
CREATE INDEX idx_users_phone ON users(phone);

-- Actualizar usuarios existentes
UPDATE users
SET whatsapp_notifications = false
WHERE whatsapp_notifications IS NULL; 