# EventoApp - Sistema de Gestión de Eventos

Aplicación web completa para gestión de eventos con sistema de QR personal, grupos de distribución e invitaciones.

## 🚀 Características

- ✅ Autenticación JWT con registro de usuarios
- ✅ Gestión de eventos con límites de QR
- ✅ Códigos QR personales por usuario/evento
- ✅ Validación de QR para admins
- ✅ Grupos de distribución
- ✅ Sistema de invitaciones compartibles (WhatsApp/Email)
- ✅ Panel de administración Django

## 📦 Stack Tecnológico

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL (producción) / SQLite (desarrollo)
- JWT Authentication
- QRCode + Pillow

**Frontend:**
- React 18 + Vite
- Axios
- CSS moderno con variables

## 🛠️ Instalación Local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend_web
npm install
npm run dev
```

Accede a:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/

## 🌐 Despliegue en Producción

### Variables de Entorno Requeridas

```env
# Django
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,*.railway.app
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# CORS
CORS_ALLOWED_ORIGINS=https://tu-frontend.com

# Frontend
FRONTEND_URL=https://tu-frontend.com

# JWT (opcional)
JWT_ACCESS_MINUTES=60
JWT_REFRESH_DAYS=7
```

### Deploy en Railway

1. Crea cuenta en https://railway.app
2. Conecta tu repositorio GitHub
3. Crea nuevo proyecto desde GitHub
4. Añade PostgreSQL database
5. Configura variables de entorno
6. Deploy automático ✅

### Deploy Frontend (Vercel/Netlify)

**Vercel:**
```bash
cd frontend_web
npm run build
vercel --prod
```

**Netlify:**
```bash
cd frontend_web
npm run build
netlify deploy --prod --dir=dist
```

## 📱 Uso de la Aplicación

### Para Usuarios
1. Registro con email/teléfono
2. Unirse a grupos vía invitación
3. Ver eventos del grupo
4. Generar QR personal para cada evento
5. Presentar QR al admin para validación

### Para Admins
1. Crear grupos
2. Crear eventos en grupos
3. Generar invitaciones compartibles
4. Escanear/validar QR de usuarios
5. Gestionar miembros y eventos

## 🔐 Credenciales Admin (desarrollo)

```
Usuario: admin
Contraseña: admin123
```

## 📄 Licencia

MIT License
