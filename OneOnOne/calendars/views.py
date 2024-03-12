import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView

from django.urls import reverse
from django.core.mail import send_mail

from .models import Calendar, Invitation
from .serializers import CalendarSerializer, CalendarDetailSerializer, InvitationSerializer
from .scheduler import schedule_invitations

class CalendarCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CalendarSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            calendar = serializer.save(owner=request.user)
            participant_emails = calendar.get_participant_emails()
            for email in participant_emails:
                invitation = Invitation.objects.create(calendar=calendar, invitee_email=email, status='Pending')
                availability_url = request.build_absolute_uri(reverse('update-invitation', kwargs={'token': invitation.token}))
                
                # Send an email to the participant
                send_mail(
                    'You are invited to submit your availability',
                    f'Please submit your availability by following this link: {availability_url}',
                    'from@example.com',  # Use your actual email
                    [email],
                    fail_silently=False,
                )

                Invitation.objects.create(calendar=calendar, invitee_email=email, status='Pending')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CalendarDetailView(RetrieveAPIView):
    queryset = Calendar.objects.all()
    serializer_class = CalendarDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Calendar.objects.filter(owner=self.request.user)

class CalendarRecommendationsView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, calendar_id, format=None):
        # Ensure the calendar exists and the request user has permission to access it
        try:
            calendar = Calendar.objects.get(pk=calendar_id)
        except Calendar.DoesNotExist:
            return Response({'message': 'Calendar not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Temporarily commented out to focus on the logic; uncomment in actual use
        # if calendar.owner != request.user:
        #     return Response({'message': 'You do not have permission to access this calendar.'}, status=status.HTTP_403_FORBIDDEN)

        # Fetch accepted invitations for the calendar
        invitations = Invitation.objects.filter(calendar=calendar, status='Accepted')
        if not invitations.exists():
            return Response({'message': 'There are no accepted invitations for this calendar.'}, status=status.HTTP_400_BAD_REQUEST)

        # Call the scheduling function with prepared data
        schedules = schedule_invitations(calendar.availability, invitations)
        
        if schedules:
            return Response(schedules, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Unable to generate scheduling options due to conflicting or insufficient availabilities.'}, status=status.HTTP_400_BAD_REQUEST)


class UpdateInvitationView(APIView):
    permission_classes = []

    def patch(self, request, token, format=None):
        try:
            invitation = Invitation.objects.get(token=token)
        except Invitation.DoesNotExist:
            return Response({'message': 'Invitation not found.'}, status=status.HTTP_404_NOT_FOUND)

        availability_data = request.data.get('availability')
        try:
            availability_list = json.loads(availability_data)
            if not isinstance(availability_list, list):
                raise ValueError
        except ValueError:
            return Response({'message': 'Invalid availability format.'}, status=status.HTTP_400_BAD_REQUEST)

        invitation.status = 'Accepted'
        invitation.availability = json.dumps(availability_list)
        invitation.save()

        return Response({'message': 'Availability updated successfully.'}, status=status.HTTP_200_OK)

class InvitationDetailView(RetrieveAPIView):
    queryset = Invitation.objects.all()
    serializer_class = InvitationSerializer
    lookup_field = 'token'  # Use the invitation's token to retrieve it
    permission_classes = []
