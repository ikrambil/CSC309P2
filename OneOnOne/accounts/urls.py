from django.urls import path
from .views import RegisterView, LoginView, LogoutView, EditProfileView

app_name = 'accounts'
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/edit/', EditProfileView.as_view(), name='edit_profile'),
]
