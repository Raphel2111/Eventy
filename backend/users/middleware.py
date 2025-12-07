from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


class EmailVerificationMiddleware:
    """
    Middleware que requiere verificación de email para acceder a los endpoints protegidos.
    Permite acceso sin verificación a:
    - Endpoints de autenticación (login, registro)
    - Endpoints de verificación de email
    - Admin de Django
    - Usuarios staff/superuser
    """
    
    ALLOWED_PATHS = [
        '/api/users/login/',
        '/api/users/register/',
        '/api/users/send-email-verification/',
        '/api/users/verify-email/',
        '/api/users/send-phone-verification/',
        '/api/users/verify-phone/',
        '/api/token/',
        '/api/token/refresh/',
        '/admin/',
        '/api/users/me/',
        '/media/',
        '/static/',
        '/auth/',  # OAuth paths
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.jwt_authenticator = JWTAuthentication()

    def __call__(self, request):
        # Permitir acceso a rutas permitidas primero
        if any(request.path.startswith(path) for path in self.ALLOWED_PATHS):
            return self.get_response(request)
        
        # Intentar autenticar con JWT si no hay usuario autenticado
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            try:
                # Intentar obtener el usuario del token JWT
                auth_header = request.headers.get('Authorization', '')
                if auth_header.startswith('Bearer '):
                    user_auth_tuple = self.jwt_authenticator.authenticate(request)
                    if user_auth_tuple is not None:
                        request.user, _ = user_auth_tuple
            except (AuthenticationFailed, Exception) as e:
                # Si falla la autenticación JWT, continuar sin bloquear
                pass
        
        # Si el usuario está autenticado
        if hasattr(request, 'user') and request.user.is_authenticated:
            # Permitir acceso al admin de Django para staff/superusuarios
            if request.path.startswith('/admin/'):
                if request.user.is_staff or request.user.is_superuser:
                    return self.get_response(request)
            
            # TODOS los usuarios deben verificar su email para usar la API
            if not getattr(request.user, 'email_verified', False):
                return JsonResponse({
                    'detail': 'Debe verificar su correo electrónico antes de acceder a este servicio.',
                    'error_code': 'EMAIL_NOT_VERIFIED',
                    'email_verified': False
                }, status=403)
        
        return self.get_response(request)
