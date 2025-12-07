# 🚀 Guía de Despliegue de EventoApp

Esta guía te ayudará a desplegar EventoApp en la nube usando **Render** (backend) y **Vercel** (frontend).

## 📋 Requisitos Previos

1. Cuenta en GitHub: https://github.com
2. Cuenta en Render: https://render.com
3. Cuenta en Vercel: https://vercel.com
4. Git instalado en tu PC

## 📦 Paso 1: Subir el código a GitHub

### 1.1 Inicializar Git (si no está inicializado)

```powershell
cd C:\Users\Rafa\Desktop\EventoApp_Full
git init
git add .
git commit -m "Initial commit - EventoApp"
```

### 1.2 Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `eventoapp`
3. Descripción: `Event management application with Django and React`
4. Público o Privado (tu elección)
5. **NO** marques "Initialize with README"
6. Clic en **Create repository**

### 1.3 Conectar tu código local con GitHub

Copia y pega los comandos que GitHub te muestra (serán algo como):

```powershell
git remote add origin https://github.com/TU_USUARIO/eventoapp.git
git branch -M main
git push -u origin main
```

## 🗄️ Paso 2: Desplegar Backend en Render

### 2.1 Crear cuenta y nuevo servicio

1. Ve a https://render.com y crea una cuenta (puedes usar tu cuenta de GitHub)
2. Clic en **New** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio `eventoapp`

### 2.2 Configurar el servicio

- **Name**: `eventoapp-backend`
- **Region**: Elige el más cercano (US East recomendado)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: 
  ```
  pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate
  ```
- **Start Command**: 
  ```
  gunicorn evento_app.wsgi:application
  ```

### 2.3 Configurar Variables de Entorno

En la sección **Environment Variables**, añade:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `SECRET_KEY` | Clic en "Generate" |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `.onrender.com` |
| `FRONTEND_URL` | `https://TU_APP.vercel.app` (lo obtendrás después) |
| `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY` | Tu Client ID de Google |
| `SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET` | Tu Client Secret de Google |

### 2.4 Crear Base de Datos PostgreSQL

1. En Render, ve a **Dashboard** → **New** → **PostgreSQL**
2. **Name**: `eventoapp-db`
3. **Database Name**: `eventoapp`
4. **User**: `eventoapp`
5. **Region**: El mismo que el backend
6. Clic en **Create Database**

### 2.5 Conectar Backend con la Base de Datos

1. Ve a tu servicio web backend
2. En **Environment**, añade:
   - **Key**: `DATABASE_URL`
   - **Value**: Copia la **Internal Database URL** de tu base de datos PostgreSQL

3. Clic en **Deploy**

**Espera 5-10 minutos** mientras Render construye y despliega tu backend. Una vez completado, obtendrás una URL como:
```
https://eventoapp-backend.onrender.com
```

## 🎨 Paso 3: Desplegar Frontend en Vercel

### 3.1 Actualizar configuración del frontend

Antes de desplegar, necesitas actualizar la URL del backend en el frontend.

1. Abre `frontend_web/src/api.js`
2. Cambia `http://localhost:8000` por tu URL de Render:

```javascript
const API = axios.create({
    baseURL: 'https://eventoapp-backend.onrender.com',
    // ... resto del código
});
```

3. Guarda y haz commit:

```powershell
git add .
git commit -m "Update backend URL for production"
git push
```

### 3.2 Desplegar en Vercel

1. Ve a https://vercel.com y crea una cuenta (puedes usar GitHub)
2. Clic en **Add New** → **Project**
3. Importa tu repositorio `eventoapp`
4. **Framework Preset**: Detectará automáticamente Vite
5. **Root Directory**: `frontend_web`
6. **Build Command**: `npm run build` (ya está configurado)
7. **Output Directory**: `dist` (ya está configurado)
8. Clic en **Deploy**

**Espera 2-3 minutos**. Una vez completado, obtendrás una URL como:
```
https://eventoapp-abc123.vercel.app
```

### 3.3 Actualizar configuración del backend

Ahora que tienes la URL de Vercel, actualiza el backend:

1. Ve a Render → Tu servicio backend → **Environment**
2. Actualiza `FRONTEND_URL` con tu URL de Vercel
3. Actualiza `ALLOWED_HOSTS` para incluir tu dominio de Vercel:
   ```
   .onrender.com,.vercel.app
   ```
4. Guarda y el servicio se redesplegará automáticamente

### 3.4 Actualizar Google OAuth

1. Ve a Google Cloud Console → Tu proyecto EventoApp
2. **Credentials** → Tu OAuth Client ID
3. En **Authorized redirect URIs**, añade:
   ```
   https://eventoapp-backend.onrender.com/auth/complete/google-oauth2/
   ```
4. Guarda

## ✅ Paso 4: Crear un usuario administrador

1. Ve a Render → Tu backend → **Shell**
2. Ejecuta:
   ```bash
   python manage.py createsuperuser
   ```
3. Ingresa username, email y password

## 🧪 Paso 5: Probar la aplicación

1. Abre tu URL de Vercel: `https://eventoapp-abc123.vercel.app`
2. Deberías ver la aplicación funcionando
3. Prueba:
   - Login con OAuth (Google)
   - Login tradicional con el superuser que creaste
   - Crear eventos, grupos, etc.

## 📝 Notas Importantes

### Limitaciones del plan gratuito de Render:

- ⚠️ **El servicio "duerme" después de 15 minutos de inactividad**
- La primera petición después de dormir puede tardar 30-60 segundos
- Para mantenerlo activo 24/7, necesitas el plan de pago ($7/mes)
- Alternativa gratuita: Usa un servicio como **UptimeRobot** para hacer ping cada 10 minutos

### Base de datos:

- PostgreSQL gratuito en Render expira después de 90 días
- Haz backups regulares si es importante
- Para producción seria, considera Railway o un plan de pago

### Dominio personalizado (opcional):

**Para el backend:**
1. Render → Tu servicio → **Settings** → **Custom Domain**
2. Añade tu dominio (ej: `api.tudominio.com`)
3. Configura los registros DNS según las instrucciones

**Para el frontend:**
1. Vercel → Tu proyecto → **Settings** → **Domains**
2. Añade tu dominio (ej: `tudominio.com`)
3. Configura los registros DNS según las instrucciones

## 🔄 Actualizaciones Futuras

Para actualizar tu aplicación:

```powershell
# Hacer cambios en el código
git add .
git commit -m "Descripción de los cambios"
git push
```

- **Vercel** se actualizará automáticamente en 1-2 minutos
- **Render** se actualizará automáticamente en 5-10 minutos

## 🆘 Solución de Problemas

### Backend no inicia:

1. Ve a Render → Tu servicio → **Logs**
2. Busca errores en los logs
3. Verifica que todas las variables de entorno estén configuradas

### Frontend no se conecta al backend:

1. Abre la consola del navegador (F12)
2. Busca errores de CORS
3. Verifica que `ALLOWED_HOSTS` y `CORS_ALLOWED_ORIGINS` estén correctamente configurados en Render

### OAuth no funciona:

1. Verifica que la URL de redirect en Google Cloud Console sea la de producción
2. Verifica que las variables `SOCIAL_AUTH_GOOGLE_OAUTH2_KEY` y `SECRET` estén configuradas en Render
3. Verifica que `FRONTEND_URL` apunte a tu URL de Vercel

## 📧 Soporte

Si tienes problemas, revisa:
- Logs en Render (backend)
- Console del navegador (frontend)
- Documentación de Render: https://render.com/docs
- Documentación de Vercel: https://vercel.com/docs

---

¡Felicitaciones! 🎉 Tu aplicación está ahora desplegada en la nube y accesible desde cualquier parte del mundo.
