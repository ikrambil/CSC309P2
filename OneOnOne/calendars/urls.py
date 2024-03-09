from django.urls import path
from .views import CalendarCreateView, CalendarDetailView, UpdateInvitationView

urlpatterns = [
    path('create/', CalendarCreateView.as_view(), name='create-calendar'),
    path('<int:pk>/', CalendarDetailView.as_view(), name='calendar-detail'),
    path('invitations/<int:pk>/update/', UpdateInvitationView.as_view(), name='update-invitation'),
]
