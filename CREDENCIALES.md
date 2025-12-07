# 📝 Cuentas de Usuario - EventoApp

## Cuentas Disponibles

Todas las cuentas han sido reseteadas con la contraseña: **`123456`**

| Usuario  | Email                      | Contraseña | Rol    |
|----------|--------------------------|-----------|---------|
| Admin21  | ragilo2111@gmail.com    | 123456    | Admin   |
| Admin    | admin21@gmail.com       | 123456    | Admin   |
| Hola     | hola32@gmail.com        | 123456    | User    |
| admin    | admin@ejemplo.com       | 123456    | Admin   |
| tester   | (sin email)             | 123456    | User    |

## Cómo iniciar sesión

1. Ve a http://localhost:5173 (o la URL del frontend)
2. Haz clic en "Crear cuenta" si no tienes cuenta, o en el botón de login
3. Ingresa el **usuario** (no email) y **contraseña**
4. Ejemplo: 
   - Usuario: `Admin21`
   - Contraseña: `123456`

## Para cambiar contraseña

Puedes actualizar tu contraseña en la sección de **Perfil** (icono de usuario en la esquina superior)

## Servidor Backend

- URL: http://127.0.0.1:8000
- API: http://127.0.0.1:8000/api/
- Admin: http://127.0.0.1:8000/admin/
- Documentación API: http://127.0.0.1:8000/api/ (con interfaz de DRF)

## Servidor Frontend

- URL: http://localhost:5173
- Puerto: 5173
- Entorno: Vite (desarrollo en caliente)

## Troubleshooting

### Si no puedes iniciar sesión:
1. Verifica que el backend esté corriendo: `python manage.py runserver 127.0.0.1:8000`
2. Verifica que el frontend esté corriendo: `npm run dev`
3. Abre la consola del navegador (F12) para ver errores específicos
4. Prueba usar un username exacto de la tabla anterior

### Si tienes problemas con avatares:
- Los avatares se almacenan en `backend/media/avatars/`
- Asegúrate de que el servidor está sirviendo archivos estáticos correctamente
