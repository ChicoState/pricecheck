# from django.contrib import admin
# from django.urls import path
# from user_app.views import index, login_page, dashboard

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', index, name='index'),          # if you want index for "/"
#     path('login/', login_page, name='login'),
#     path('dashboard/', dashboard, name='dashboard'),
# ]

from django.contrib import admin
from django.urls import path
from user_app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_page, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
]
