import sqlite3

# Conectar a ambas bases de datos
old_db = sqlite3.connect('db.sqlite3.locked')
new_db = sqlite3.connect('db.sqlite3')

# Copiar datos de las tablas principales
tables_to_copy = [
    'users_user',
    'events_event',
    'events_registration',
    'events_distributiongroup',
    'events_groupaccesstoken',
    'events_groupinvitation',
    'events_emaillog',
]

for table in tables_to_copy:
    try:
        # Obtener todos los datos de la tabla
        cursor = old_db.execute(f'SELECT * FROM {table}')
        rows = cursor.fetchall()
        
        if not rows:
            print(f'{table}: 0 registros')
            continue
            
        # Obtener nombres de columnas
        column_names = [description[0] for description in cursor.description]
        placeholders = ','.join(['?'] * len(column_names))
        columns_str = ','.join(column_names)
        
        # Insertar en la nueva BD
        new_db.executemany(
            f'INSERT OR REPLACE INTO {table} ({columns_str}) VALUES ({placeholders})',
            rows
        )
        print(f'{table}: {len(rows)} registros copiados')
    except Exception as e:
        print(f'Error en {table}: {e}')

# Copiar relaciones many-to-many
m2m_tables = [
    'events_event_admins',
    'events_distributiongroup_creators',
    'events_distributiongroup_members',
]

for table in m2m_tables:
    try:
        cursor = old_db.execute(f'SELECT * FROM {table}')
        rows = cursor.fetchall()
        
        if not rows:
            print(f'{table}: 0 registros')
            continue
            
        column_names = [description[0] for description in cursor.description]
        placeholders = ','.join(['?'] * len(column_names))
        columns_str = ','.join(column_names)
        
        new_db.executemany(
            f'INSERT OR REPLACE INTO {table} ({columns_str}) VALUES ({placeholders})',
            rows
        )
        print(f'{table}: {len(rows)} registros copiados')
    except Exception as e:
        print(f'Error en {table}: {e}')

new_db.commit()
old_db.close()
new_db.close()

print('\n¡Copia completada!')
