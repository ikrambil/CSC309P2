from django.urls import path
from .views import CalendarCreateView, CalendarDetailView, UpdateInvitationView, CalendarRecommendationsView, InvitationDetailView

urlpatterns = [
    path('create/', CalendarCreateView.as_view(), name='create-calendar'),
    path('<int:pk>/', CalendarDetailView.as_view(), name='calendar-detail'),
    path('invitations/<uuid:token>/update/', UpdateInvitationView.as_view(), name='update-invitation'),
    path('invitations/<uuid:token>/view/', InvitationDetailView.as_view(), name='invitation-detail'),
    path('<int:calendar_id>/recommendations/', CalendarRecommendationsView.as_view(), name='calendar-recommendations'),
]
