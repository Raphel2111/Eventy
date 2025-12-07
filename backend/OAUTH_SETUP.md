# Configuración de OAuth (Google y Facebook)

Este documento explica cómo configurar la autenticación OAuth con Google y Facebook para EventoApp.

## ¿Por qué OAuth?

OAuth permite a los usuarios iniciar sesión con sus cuentas de Google o Facebook sin necesidad de crear una contraseña nueva. Los beneficios incluyen:

- ✅ **Verificación automática**: El email ya está verificado por Google/Facebook
- ✅ **Más seguro**: No guardamos contraseñas de terceros
- ✅ **Experiencia de usuario mejorada**: Login con un solo clic
- ✅ **Menos fricciones**: No hay que recordar otra contraseña

## Configuración de Google OAuth

### 1. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"

### 2. Crear credenciales OAuth 2.0

1. Haz clic en "Create Credentials" > "OAuth client ID"
2. Si es la primera vez, deberás configurar la pantalla de consentimiento:
   - Tipo: Externo
   - Nombre de la app: EventoApp
   - Email de soporte: tu email
   - Dominios autorizados: localhost (para desarrollo)
   
3. Tipo de aplicación: **Web application**
4. Nombre: EventoApp
5. **Authorized redirect URIs** (IMPORTANTE):
   ```
   http://localhost:8000/auth/complete/google-oauth2/
   ```
   
   Para producción también añade:
   ```
   https://tu-dominio.com/auth/complete/google-oauth2/
   ```

6. Guarda y copia el **Client ID** y **Client Secret**

### 3. Configurar en Django

En tu archivo `.env` (créalo si no existe copiando `.env.example`):

```bash
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=TU_CLIENT_ID_AQUI
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=TU_CLIENT_SECRET_AQUI
```

## Configuración de Facebook OAuth

### 1. Crear app en Facebook Developers

1. Ve a [Facebook Developers](https://developers.facebook.com/apps/)
2. Haz clic en "Create App" o "Crear aplicación"
3. Selecciona el tipo: **Consumer** (Consumidor)
4. Nombre de la app: EventoApp
5. Email de contacto: tu email

### 2. Configurar Facebook Login

1. En el panel de tu app, añade el producto **Facebook Login**
2. Ve a Facebook Login > Settings
3. En **Valid OAuth Redirect URIs** añade:
   ```
   http://localhost:8000/auth/complete/facebook/
   ```
   
   Para producción también añade:
   ```
   https://tu-dominio.com/auth/complete/facebook/
   ```

4. En Settings > Basic, copia:
   - **App ID** 
   - **App Secret** (haz clic en "Show" para verlo)

### 3. Configurar en Django

En tu archivo `.env`:

```bash
SOCIAL_AUTH_FACEBOOK_KEY=TU_APP_ID_AQUI
SOCIAL_AUTH_FACEBOOK_SECRET=TU_APP_SECRET_AQUI
```

## Modo de prueba vs Producción

### Desarrollo (localhost)

- ✅ Funciona inmediatamente
- ⚠️ Solo tú (creador de la app) puedes acceder
- Para agregar testers:
  - **Google**: Añadir emails en "OAuth consent screen" > "Test users"
  - **Facebook**: Settings > Roles > Test Users

### Producción

Para permitir que cualquier usuario se autentifique:

#### Google
1. En "OAuth consent screen"
2. Cambiar de "Testing" a "In production"
3. Puede requerir verificación de Google (si pides permisos sensibles)

#### Facebook
1. En el panel de la app
2. Settings > Basic
3. Cambiar el App Mode de "Development" a "Live"
4. Completar la "App Review" si es necesario

## Probar OAuth

1. Asegúrate de que Django esté corriendo: `python manage.py runserver`
2. Asegúrate de que el frontend esté corriendo: `npm run dev`
3. Ve a http://localhost:5173
4. Haz clic en "Continuar con Google" o "Continuar con Facebook"
5. Completa el flujo de autenticación
6. Deberías ser redirigido de vuelta a la app, ya autenticado

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URI de redirección en Google/Facebook coincida EXACTAMENTE con la configurada
- No olvides el `/` al final
- Usa `http://` para localhost, no `https://`

### Error: "App Not Setup"
- Verifica que copiaste correctamente App ID y Secret
- Asegúrate de que el archivo `.env` existe y está en el directorio correcto
- Reinicia el servidor Django después de cambiar `.env`

### Usuario no se crea o no está verificado
- Verifica que el pipeline `users.pipeline.auto_verify_email` esté en settings.py
- Revisa los logs del servidor Django

### OAuth funciona pero no recibo JWT tokens
- Verifica que `OAuthCallbackView` esté correctamente configurada en urls.py
- Revisa el middleware que permite acceso a `/auth/` paths

## Remover sistema antiguo de verificación (Opcional)

Si deseas eliminar completamente el sistema de códigos de verificación por email:

1. Elimina el modelo `VerificationCode` de `users/models.py`
2. Crea una migración: `python manage.py makemigrations`
3. Aplica la migración: `python manage.py migrate`
4. Elimina los endpoints de verificación de `users/views.py`:
   - `send_email_verification`
   - `verify_email`
   - `send_phone_verification`
   - `verify_phone`
5. Actualiza el componente `ProfileSettings` en el frontend para remover formularios de verificación

## Referencias

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [Python Social Auth Documentation](https://python-social-auth.readthedocs.io/)
