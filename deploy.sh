#!/bin/bash
# Script de despliegue para producción

echo "🚀 Iniciando despliegue..."

# Instalar dependencias backend
cd backend
pip install -r requirements.txt

# Recolectar archivos estáticos
python manage.py collectstatic --noinput

# Aplicar migraciones
python manage.py migrate

echo "✅ Despliegue completado!"
