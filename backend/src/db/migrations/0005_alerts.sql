-- Crear tabla de alertas de inventario
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('low_stock', 'expiring', 'system')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_inventory_alerts_store_id ON inventory_alerts(store_id);
CREATE INDEX idx_inventory_alerts_product_id ON inventory_alerts(product_id);
CREATE INDEX idx_inventory_alerts_type ON inventory_alerts(type);
CREATE INDEX idx_inventory_alerts_is_read ON inventory_alerts(is_read);
CREATE INDEX idx_inventory_alerts_created_at ON inventory_alerts(created_at);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_inventory_alerts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_inventory_alerts_updated_at
  BEFORE UPDATE ON inventory_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_alerts_updated_at(); 