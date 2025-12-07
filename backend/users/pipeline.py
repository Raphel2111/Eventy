"""
Custom social auth pipeline for EventoApp
"""
from django.shortcuts import redirect
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)


def auto_verify_email(backend, user, response, *args, **kwargs):
    """
    Auto-verify email for users who login via OAuth.
    Since the OAuth provider (Google/Facebook) has already verified the email,
    we can trust it and mark the user as verified.
    """
    logger.info(f"OAuth Pipeline - User: {user.username if user else 'None'}, Email: {user.email if user else 'None'}, ID: {user.id if user else 'None'}")
    logger.info(f"OAuth Response: {response}")
    
    if user and not user.email_verified:
        user.email_verified = True
        user.save(update_fields=['email_verified'])
        logger.info(f"Auto-verified email for OAuth user: {user.username}")
    
    return {'user': user}


def redirect_with_jwt(backend, user, response, *args, **kwargs):
    """
    After OAuth authentication, generate JWT tokens and redirect to frontend.
    This is the final step in the pipeline.
    """
    if user and user.is_authenticated:
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        logger.info(f"Generated JWT tokens for OAuth user: {user.username}")
        
        # Store tokens in session for our callback view to retrieve
        request = kwargs.get('request')
        if request:
            request.session['oauth_access_token'] = access_token
            request.session['oauth_refresh_token'] = refresh_token
            logger.info(f"Stored tokens in session for user: {user.username}")
    
    return {'user': user}

