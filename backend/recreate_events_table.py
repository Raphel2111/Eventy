import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evento_app.settings')
django.setup()

from django.db import connection
from events.models import Event

# Drop the table if it exists and recreate it
with connection.schema_editor() as schema_editor:
    try:
        schema_editor.delete_model(Event)
        print("Tabla events_event eliminada (si existía)")
    except:
        print("Tabla no existía, creando nueva...")
    
    schema_editor.create_model(Event)
    print("Tabla events_event creada exitosamente")

print("\nVerificando tabla...")
with connection.cursor() as cursor:
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='events_event';")
    result = cursor.fetchone()
    if result:
        print(f"✓ Tabla '{result[0]}' existe en la base de datos")
    else:
        print("✗ No se pudo crear la tabla")
