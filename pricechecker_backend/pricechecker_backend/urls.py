# pricechecker_backend/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('search/', include('pricechecker.urls')),  # Correctly includes 'pricechecker.urls'
]
