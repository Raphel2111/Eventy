#!/usr/bin/env python
"""
Script para probar el endpoint de login del API
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evento_app.settings')
django.setup()

import json
from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

# Crear cliente de prueba
client = Client()

# Probar con un usuario existente
username = 'Admin21'
password = '123456'

# Verificar que el usuario existe
try:
    user = User.objects.get(username=username)
    print(f"✓ Usuario '{username}' encontrado en BD")
    print(f"  - Email: {user.email}")
    print(f"  - ID: {user.id}")
    print(f"  - Is active: {user.is_active}")
except User.DoesNotExist:
    print(f"✗ Usuario '{username}' NO encontrado en BD")
    exit(1)

# Intentar login
print("\nIntentando login...")
response = client.post('/api/token/', 
    json.dumps({'username': username, 'password': password}),
    content_type='application/json'
)

print(f"Status Code: {response.status_code}")
print(f"Response: {response.json()}")

if response.status_code == 200:
    data = response.json()
    print(f"\n✓ Login exitoso!")
    print(f"  - Access token: {data.get('access', 'N/A')[:50]}...")
    print(f"  - Refresh token: {data.get('refresh', 'N/A')[:50]}...")
else:
    print(f"\n✗ Login fallido")
    print(f"Error details: {response.json()}")
