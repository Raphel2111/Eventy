# Sistema de Invitaciones de Grupos

## Descripción General

El sistema de invitaciones permite a los administradores de grupos generar enlaces compartibles que otros usuarios pueden usar para unirse al grupo automáticamente mediante WhatsApp o Email.

## Características Implementadas

### Backend (Django)

1. **Modelo GroupInvitation** (`events/models.py`)
   - `token`: Token único generado automáticamente (32 caracteres URL-safe)
   - `group`: Referencia al grupo
   - `created_by`: Usuario que creó la invitación
   - `expires_at`: Fecha de expiración
   - `max_uses`: Número máximo de usos (null = ilimitado)
   - `use_count`: Contador de usos actuales
   - `active`: Estado activo/inactivo
   - `is_valid()`: Método para validar si la invitación es válida

2. **API Endpoints** (DistributionGroupViewSet)
   - `POST /api/groups/{id}/create_invitation/`
     - Crea una nueva invitación
     - Parámetros opcionales:
       - `expires_in_days`: Días hasta expiración (default: 7)
       - `max_uses`: Máximo de usos (default: ilimitado)
     - Solo admins/creators del grupo
     - Retorna: token, URL, expires_at, max_uses, use_count

   - `POST /api/groups/accept_invitation/`
     - Acepta una invitación y une al usuario al grupo
     - Parámetro: `token`
     - Valida expiración y límite de usos
     - Retorna: detail, group_id, group_name

   - `GET /api/groups/{id}/invitations/`
     - Lista invitaciones activas del grupo
     - Solo admins/creators del grupo
     - Retorna array con info de cada invitación

   - `GET /api/groups/invitation-info/{token}/`
     - Obtiene información pública de una invitación (sin autenticación)
     - Usado para preview antes de aceptar
     - Retorna: valid, group_name, group_description, created_by, expires_at, max_uses, use_count

3. **Configuración**
   - `FRONTEND_URL` en settings.py (default: http://localhost:5173)
   - Usado para generar URLs completas de invitación

### Frontend (React)

1. **Componente GroupDetail** (`components/GroupDetail.jsx`)
   - Sección "Invitaciones" (solo admins)
   - Formulario para crear invitación con:
     - Días de expiración (default: 7)
     - Máximo de usos (opcional)
   - Lista de invitaciones activas mostrando:
     - URL completa
     - Fecha de creación y expiración
     - Contador de usos (X/Y o X/∞)
     - Estado (válida/expirada)
   - Botones para compartir:
     - 📋 Copiar al portapapeles
     - WhatsApp (abre WhatsApp Web con mensaje pre-rellenado)
     - 📧 Email (abre cliente de email con asunto y cuerpo)

2. **Componente JoinGroup** (`components/JoinGroup.jsx`)
   - Página para aceptar invitaciones
   - Muestra información del grupo antes de unirse
   - Valida estado de la invitación
   - Requiere autenticación
   - Maneja errores (invitación expirada, inválida, etc.)

3. **App.jsx**
   - Hash routing para URLs de invitación
   - Detecta rutas `#/join/{token}`
   - Renderiza JoinGroup component
   - Callbacks para éxito/cancelación

## Flujo de Uso

### Para Administradores (Crear y Compartir)

1. Administrador va a "Mis Grupos" → Selecciona un grupo
2. En GroupDetail, hace clic en "Gestionar invitaciones"
3. Configura parámetros de invitación:
   - Días de expiración (ej: 7 días)
   - Máximo de usos (opcional, ej: 50 personas)
4. Hace clic en "Generar enlace de invitación"
5. El sistema genera un enlace único: `http://localhost:5173/#/join/{token}`
6. Administrador puede:
   - Copiar el enlace
   - Compartir por WhatsApp (abre WhatsApp con mensaje: "¡Únete a mi grupo 'X' en EventoApp! {url}")
   - Compartir por Email (abre cliente de email con asunto e instrucciones)

### Para Usuarios (Unirse a Grupo)

1. Usuario recibe enlace de invitación (WhatsApp/Email)
2. Hace clic en el enlace
3. La aplicación muestra información del grupo:
   - Nombre del grupo
   - Descripción
   - Quién invitó
   - Fecha de expiración
4. Si no está autenticado, se le pide iniciar sesión
5. Usuario hace clic en "✅ Unirse al grupo"
6. El sistema:
   - Valida la invitación (no expirada, no alcanzó límite)
   - Añade al usuario a `group.members`
   - Incrementa contador de usos
   - Redirige a "Mis Grupos"

## Validaciones y Seguridad

- ✅ Tokens únicos de 32 caracteres (URL-safe)
- ✅ Expiración automática después de N días
- ✅ Límite de usos opcional
- ✅ Solo admins pueden crear invitaciones
- ✅ Validación de invitación antes de aceptar
- ✅ Prevención de usuarios duplicados (ya miembro)
- ✅ Estado activo/inactivo para deshabilitar invitaciones

## Ejemplo de Uso Completo

```bash
# Backend
POST /api/groups/1/create_invitation/
{
  "expires_in_days": 7,
  "max_uses": 50
}

# Respuesta:
{
  "token": "abc123...",
  "url": "http://localhost:5173/#/join/abc123...",
  "expires_at": "2024-01-15T10:00:00Z",
  "max_uses": 50,
  "use_count": 0
}

# Usuario visita: http://localhost:5173/#/join/abc123...
# Frontend hace GET /api/groups/invitation-info/abc123.../
# Usuario hace clic en "Unirse"
# Frontend hace POST /api/groups/accept_invitation/ { token: "abc123..." }

# Respuesta:
{
  "detail": "Successfully joined the group",
  "group_id": 1,
  "group_name": "Mi Grupo de Eventos"
}
```

## Próximas Mejoras (Opcional)

- [ ] Deshabilitar invitación manualmente antes de expiración
- [ ] Estadísticas de quiénes se unieron mediante cada invitación
- [ ] Notificaciones al admin cuando alguien se une
- [ ] QR code para invitaciones (además de enlace)
- [ ] Invitaciones por rol (auto-asignar admin vs member)
