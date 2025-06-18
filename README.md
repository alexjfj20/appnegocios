# Sistema de Gestión para Pymes

Sistema completo para la gestión de pequeñas y medianas empresas, incluyendo control de inventario, ventas, notificaciones y más.

## Características

- Gestión de inventario
- Control de ventas
- Notificaciones por email, push y WhatsApp
- Panel de administración
- Tienda online personalizable
- Roles y permisos
- Integración con servicios externos

## Requisitos

- Node.js >= 16
- PostgreSQL >= 13
- Cuenta de AWS (para almacenamiento de archivos)
- Cuenta de Firebase (para notificaciones push)
- Cuenta de WhatsApp Business API (opcional)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/pymes.git
cd pymes
```

2. Instalar dependencias:
```bash
# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env` en el directorio `backend`
   - Copiar `.env.example` a `.env` en el directorio `frontend`
   - Actualizar las variables con tus credenciales

4. Inicializar la base de datos:
```bash
cd backend
npm run init-db
```

5. Iniciar los servidores:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Estructura del Proyecto

```
.
├── backend/           # API y lógica del servidor
│   ├── src/
│   │   ├── migrations/    # Migraciones de la base de datos
│   │   ├── routes/        # Endpoints de la API
│   │   ├── services/      # Servicios y lógica de negocio
│   │   └── utils/         # Utilidades y helpers
│   └── tests/        # Pruebas del backend
│
└── frontend/         # Aplicación web
    ├── src/
    │   ├── components/    # Componentes reutilizables
    │   ├── views/         # Vistas principales
    │   ├── stores/        # Estado global (Pinia)
    │   └── plugins/       # Plugins y configuraciones
    └── public/       # Archivos estáticos
```

## Uso

1. Acceder a la aplicación:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api

2. Crear una cuenta de administrador:
   - Usar el endpoint `/api/auth/register` con el rol "admin"

3. Configurar la tienda:
   - Acceder al panel de administración
   - Configurar información general
   - Personalizar apariencia
   - Configurar integraciones

## Desarrollo

- Backend:
  ```bash
  cd backend
  npm run dev        # Desarrollo
  npm run build     # Compilar
  npm run test      # Ejecutar pruebas
  ```

- Frontend:
  ```bash
  cd frontend
  npm run dev       # Desarrollo
  npm run build    # Compilar
  npm run test     # Ejecutar pruebas
  ```

## Contribuir

1. Fork el repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Despliegue en Vercel

### Requisitos Previos
- Cuenta en Vercel
- Cuenta en GitHub
- Base de datos PostgreSQL (puede ser local o en la nube)
- Cuenta en AWS para almacenamiento de archivos
- Cuenta en Firebase para notificaciones push
- Cuenta en WhatsApp Business API (opcional)

### Pasos para el Despliegue

1. **Preparación de los Repositorios**
   ```bash
   # Clonar los repositorios
   git clone https://github.com/tu-usuario/pymes-frontend.git
   git clone https://github.com/tu-usuario/pymes-backend.git
   ```

2. **Configuración de Vercel**
   - Crear dos proyectos en Vercel:
     - pymes-frontend
     - pymes-backend
   - Conectar cada proyecto con su respectivo repositorio

3. **Configuración de Variables de Entorno**

   En el proyecto backend de Vercel:
   ```
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/pymes_db
   JWT_SECRET=tu_secreto_jwt_super_seguro
   JWT_EXPIRES_IN=7d
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=tu_access_key
   AWS_SECRET_ACCESS_KEY=tu_secret_key
   AWS_BUCKET_NAME=tu_bucket_name
   WHATSAPP_API_KEY=tu_api_key
   FIREBASE_PROJECT_ID=tu_project_id
   FIREBASE_PRIVATE_KEY=tu_private_key
   FIREBASE_CLIENT_EMAIL=tu_client_email
   ```

   En el proyecto frontend de Vercel:
   ```
   VITE_API_URL=https://pymes-backend.vercel.app/api
   VITE_FIREBASE_API_KEY=tu_api_key
   VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
   VITE_FIREBASE_PROJECT_ID=tu_project_id
   VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
   VITE_FIREBASE_APP_ID=tu_app_id
   VITE_FIREBASE_VAPID_KEY=tu_vapid_key
   VITE_STRIPE_PUBLIC_KEY=tu_stripe_public_key
   ```

4. **Despliegue**
   - Vercel detectará automáticamente la configuración y desplegará la aplicación
   - El frontend estará disponible en: https://pymes-frontend.vercel.app
   - El backend estará disponible en: https://pymes-backend.vercel.app

5. **Verificación**
   - Acceder a la aplicación frontend
   - Crear una cuenta de administrador
   - Verificar que todas las funcionalidades estén operativas

### Solución de Problemas

1. **Errores de Conexión a la Base de Datos**
   - Verificar que la URL de la base de datos sea correcta
   - Asegurarse de que la base de datos esté accesible desde Vercel

2. **Errores de Autenticación**
   - Verificar que las variables de entorno de JWT estén configuradas correctamente
   - Comprobar que las credenciales de Firebase sean válidas

3. **Problemas con el Almacenamiento**
   - Verificar las credenciales de AWS
   - Comprobar los permisos del bucket S3 

git branch -M main
git push -u origin main 