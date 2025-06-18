-- Agregar campos de configuración de la tienda
ALTER TABLE stores
ADD COLUMN contact_email VARCHAR(255),
ADD COLUMN primary_color VARCHAR(7) DEFAULT '#3B82F6',
ADD COLUMN favicon VARCHAR(255),
ADD COLUMN whatsapp_api_key VARCHAR(255),
ADD COLUMN google_analytics_id VARCHAR(50),
ADD COLUMN facebook_pixel_id VARCHAR(50),
ADD COLUMN payment_methods VARCHAR(50)[] DEFAULT '{}',
ADD COLUMN stripe_api_key VARCHAR(255),
ADD COLUMN stripe_public_key VARCHAR(255),
ADD COLUMN bank_account VARCHAR(50);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_stores_contact_email ON stores(contact_email);
CREATE INDEX idx_stores_payment_methods ON stores USING GIN(payment_methods); 