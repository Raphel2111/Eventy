from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Create superuser from environment variables'

    def handle(self, *args, **options):
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')
        
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            # Ensure the user is verified
            if not user.email_verified:
                user.email_verified = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'User {username} verified'))
            else:
                self.stdout.write(self.style.WARNING(f'User {username} already exists and is verified'))
            return
        
        user = User.objects.create_superuser(username=username, email=email, password=password)
        user.email_verified = True
        user.save()
        self.stdout.write(self.style.SUCCESS(f'Superuser {username} created and verified successfully'))
