# from django.contrib import admin
# from django.urls import path
# from user_app import views

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', views.login_page, name='login'),
#     path('dashboard/', views.dashboard, name='dashboard'),
# ]

from django.contrib import admin
from django.urls import path
from user_app import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_page, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_user, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    # path('logout/', auth_views.LogoutView.as_view(), name='logout'),
]
