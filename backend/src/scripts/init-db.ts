import { Pool } from 'pg';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  try {
    // Leer y ejecutar migraciones en orden
    const migrations = [
      '001_create_users.sql',
      '002_create_stores.sql',
      '003_add_notification_settings.sql',
      '004_add_user_preferences.sql',
      '005_create_roles_and_permissions.sql',
      '006_add_store_config.sql',
      '007_add_store_config.sql',
    ];

    for (const migration of migrations) {
      console.log(`Ejecutando migración: ${migration}`);
      const sql = readFileSync(join(__dirname, '../migrations', migration), 'utf8');
      await pool.query(sql);
    }

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase(); 