-- Agregar campos de preferencias de usuario
ALTER TABLE users
ADD COLUMN avatar VARCHAR(255),
ADD COLUMN dark_mode BOOLEAN DEFAULT false,
ADD COLUMN email_notifications BOOLEAN DEFAULT true,
ADD COLUMN push_notifications BOOLEAN DEFAULT true,
ADD COLUMN language VARCHAR(2) DEFAULT 'es';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_users_email_notifications ON users(email_notifications);
CREATE INDEX idx_users_push_notifications ON users(push_notifications); 