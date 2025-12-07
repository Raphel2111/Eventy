#!/usr/bin/env python
"""Create or update a Django user from the command line.

Usage:
  python create_user.py <username> <password> [--superuser] [--staff] [--force]

This script must be run from the `backend` folder (where `manage.py` lives), or it will still work
because it sets `DJANGO_SETTINGS_MODULE` to `evento_app.settings`.
"""
import os
import sys

def main(argv):
    if len(argv) < 3:
        print("Usage: python create_user.py <username> <password> [--superuser] [--staff] [--force]")
        return 1

    username = argv[1]
    password = argv[2]
    is_super = '--superuser' in argv
    is_staff = '--staff' in argv or is_super
    force = '--force' in argv

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evento_app.settings')
    try:
        import django
        django.setup()
    except Exception as e:
        print('Error importing Django or configuring settings:', e)
        return 2

    from django.contrib.auth import get_user_model
    User = get_user_model()

    user = None
    try:
        user = User.objects.filter(username=username).first()
    except Exception as e:
        print('Error querying users:', e)
        return 3

    if user and not force:
        print(f"User '{username}' already exists. Updating password and flags.")
    elif user and force:
        print(f"User '{username}' exists; force updating.")
    else:
        print(f"Creating user '{username}'...")
        user = User(username=username)

    user.set_password(password)
    user.is_staff = bool(is_staff)
    user.is_superuser = bool(is_super)
    try:
        user.save()
    except Exception as e:
        print('Error saving user:', e)
        return 4

    print('Done. User:')
    print('  username:', user.username)
    print('  is_staff:', user.is_staff)
    print('  is_superuser:', user.is_superuser)
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv))
