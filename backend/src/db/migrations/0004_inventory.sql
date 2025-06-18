-- Tabla de categorías de productos
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(50) UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de movimientos de inventario
CREATE TABLE inventory_movements (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('entry', 'exit', 'adjustment')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de alertas de inventario
CREATE TABLE inventory_alerts (
  id SERIAL PRIMARY KEY,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('low_stock', 'out_of_stock', 'expiring')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_inventory_movements_store_id ON inventory_movements(store_id);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_alerts_store_id ON inventory_alerts(store_id);
CREATE INDEX idx_inventory_alerts_product_id ON inventory_alerts(product_id);

-- Trigger para actualizar el stock
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'entry' THEN
    NEW.new_stock := NEW.previous_stock + NEW.quantity;
  ELSIF NEW.type = 'exit' THEN
    NEW.new_stock := NEW.previous_stock - NEW.quantity;
  ELSE
    NEW.new_stock := NEW.quantity;
  END IF;
  
  -- Actualizar el stock del producto
  UPDATE products
  SET stock = NEW.new_stock,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.product_id;
  
  -- Crear alerta si el stock está bajo el mínimo
  IF NEW.new_stock <= (SELECT min_stock FROM products WHERE id = NEW.product_id) THEN
    INSERT INTO inventory_alerts (store_id, product_id, type, message)
    VALUES (
      NEW.store_id,
      NEW.product_id,
      'low_stock',
      'El producto ' || (SELECT name FROM products WHERE id = NEW.product_id) || 
      ' tiene stock bajo. Cantidad actual: ' || NEW.new_stock
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_inventory_movement
BEFORE INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock(); 