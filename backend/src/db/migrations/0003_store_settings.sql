-- Crear tabla para temas de tienda
CREATE TABLE store_themes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  primary_color VARCHAR(7) NOT NULL DEFAULT '#4F46E5',
  font VARCHAR(20) NOT NULL DEFAULT 'inter',
  button_style VARCHAR(20) NOT NULL DEFAULT 'rounded',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Crear tabla para configuración de WhatsApp
CREATE TABLE store_whatsapp (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  number VARCHAR(20) NOT NULL,
  default_message TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Crear índices
CREATE INDEX idx_store_themes_user_id ON store_themes(user_id);
CREATE INDEX idx_store_whatsapp_user_id ON store_whatsapp(user_id); 