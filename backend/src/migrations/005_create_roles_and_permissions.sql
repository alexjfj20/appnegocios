-- Crear tabla de permisos
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de relación roles-permisos
CREATE TABLE role_permissions (
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Crear tabla de relación usuarios-roles
CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- Insertar permisos básicos
INSERT INTO permissions (name, description) VALUES
  ('users.view', 'Ver usuarios'),
  ('users.create', 'Crear usuarios'),
  ('users.edit', 'Editar usuarios'),
  ('users.delete', 'Eliminar usuarios'),
  ('roles.view', 'Ver roles'),
  ('roles.create', 'Crear roles'),
  ('roles.edit', 'Editar roles'),
  ('roles.delete', 'Eliminar roles'),
  ('products.view', 'Ver productos'),
  ('products.create', 'Crear productos'),
  ('products.edit', 'Editar productos'),
  ('products.delete', 'Eliminar productos'),
  ('orders.view', 'Ver órdenes'),
  ('orders.create', 'Crear órdenes'),
  ('orders.edit', 'Editar órdenes'),
  ('orders.delete', 'Eliminar órdenes'),
  ('inventory.view', 'Ver inventario'),
  ('inventory.create', 'Crear movimientos de inventario'),
  ('inventory.edit', 'Editar movimientos de inventario'),
  ('inventory.delete', 'Eliminar movimientos de inventario');

-- Insertar roles del sistema
INSERT INTO roles (name, description, is_system) VALUES
  ('admin', 'Administrador del sistema', true),
  ('manager', 'Gerente de tienda', true),
  ('employee', 'Empleado', true);

-- Asignar todos los permisos al rol de administrador
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Asignar permisos básicos al rol de gerente
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions
WHERE name IN (
  'products.view', 'products.create', 'products.edit',
  'orders.view', 'orders.create', 'orders.edit',
  'inventory.view', 'inventory.create', 'inventory.edit'
);

-- Asignar permisos limitados al rol de empleado
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions
WHERE name IN (
  'products.view',
  'orders.view', 'orders.create',
  'inventory.view'
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id); 