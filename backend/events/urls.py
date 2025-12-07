from django.urls import path
from .views import ticket_list_view

urlpatterns = [
    path('', ticket_list_view, name='ticket-list'),
]
