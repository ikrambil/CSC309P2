from django.urls import path
from .views import CalendarCreateView, CalendarDetailView, UpdateInvitationView, CalendarRecommendationsView, InvitationDetailView, SendReminderView, FinalizeCalendarView, CalendarUpdateAvailabilityView

urlpatterns = [
    path('create/', CalendarCreateView.as_view(), name='create-calendar'),
    path('<int:pk>/', CalendarDetailView.as_view(), name='calendar-detail'),
    path('<int:pk>/update-availability/', CalendarUpdateAvailabilityView.as_view(), name='update-calendar-availability'),
    path('send-reminder/', SendReminderView.as_view(), name='send-reminder'),
    path('invitations/<uuid:token>/update/', UpdateInvitationView.as_view(), name='update-invitation'),
    path('invitations/<uuid:token>/view/', InvitationDetailView.as_view(), name='invitation-detail'),
    path('<int:calendar_id>/recommendations/', CalendarRecommendationsView.as_view(), name='calendar-recommendations'),
    path('<int:calendar_id>/finalize/', FinalizeCalendarView.as_view(), name='finalize-calendar'),
]
