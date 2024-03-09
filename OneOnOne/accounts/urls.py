from django.urls import path
from . import views

app_name = 'accounts'
urlpatterns = [
    path('register/', views.RegisterAPIView.as_view(), name = 'register'),
    path('login/', views.LoginAPIView.as_view(), name='login'),
    path('profile/edit/', views.EditProfileAPIView.as_view(), name='edit'),
    path('profile/view/', views.ViewProfileAPIView.as_view(), name='view_profile'),
    path('logout/', views.LogoutAPIView.as_view(), name = 'logout'),
]