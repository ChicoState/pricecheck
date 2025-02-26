# pricechecker/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.search_product, name='search_product'),  # Ensures 'search/' triggers the correct view
]
