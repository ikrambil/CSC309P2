import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import RetrieveAPIView

from django.urls import reverse
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404


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

class CalendarUpdateAvailabilityView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, *args, **kwargs):
        calendar = get_object_or_404(Calendar, pk=pk, owner=request.user)  # Ensure the user owns the calendar
        # Load the current availability data and update it with the new data provided in the request
        new_availability = request.data.get('availability')
        if new_availability is None:
            return Response({'error': 'Availability data is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Assuming the availability data is sent as a serialized JSON string and the Calendar model
        # expects it in the same format. Validate the data as necessary before saving.
        calendar.availability = new_availability
        calendar.save()

        # Optionally, return the updated calendar data using a serializer
        serializer = CalendarSerializer(calendar)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CalendarRecommendationsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, calendar_id, format=None):
        # Ensure the calendar exists and the request user has permission to access it
        try:
            calendar = Calendar.objects.get(pk=calendar_id)
        except Calendar.DoesNotExist:
            return Response({'message': 'Calendar not found.'}, status=status.HTTP_404_NOT_FOUND)

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

class FinalizeCalendarView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, calendar_id):
        calendar = get_object_or_404(Calendar, id=calendar_id)

        # Ensure that only the calendar owner can finalize it
        if calendar.owner != request.user:
            return Response({'message': 'You do not have permission to finalize this calendar.'}, status=status.HTTP_403_FORBIDDEN)

        # Update the calendar's finalized status and finalized_schedule
        finalized_schedule = request.data.get('finalized_schedule')
        if finalized_schedule:
            calendar.finalized = True
            calendar.finalized_schedule = finalized_schedule
            calendar.save()
            return Response({'message': 'Calendar finalized successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'Finalized schedule data is required.'}, status=status.HTTP_400_BAD_REQUEST)

class SendReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        calendar_id = request.data.get('calendar_id')

        if not email or not calendar_id:
            return Response({'message': 'Email address and calendar ID are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            calendar = Calendar.objects.get(id=calendar_id)
        except Calendar.DoesNotExist:
            return Response({'message': 'Calendar not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the specified email is a participant in the calendar
        participants_json = calendar.participants  # Assuming this is stored as a JSON string
        participants = json.loads(participants_json)
        if email not in participants:
            return Response({'message': 'The specified email is not a participant in the given calendar.'}, status=status.HTTP_404_NOT_FOUND)

        # Fetch the invitation for the specified email and calendar
        invitation = Invitation.objects.filter(calendar=calendar, invitee_email=email, status='Pending').first()
        if not invitation:
            return Response({'message': 'No pending invitation found for this email in the given calendar.'}, status=status.HTTP_404_NOT_FOUND)

        # Send a reminder email
        availability_url = request.build_absolute_uri(reverse('update-invitation', kwargs={'token': invitation.token}))
        send_mail(
            'Reminder: Please submit your availability',
            f'This is a reminder that you have been invited to submit your availability! Please submit your availability by following this link: {availability_url}',
            'from@example.com',  # Use your actual email
            [email],
            fail_silently=False,
        )

        return Response({'message': f'Reminder sent to {email}.'}, status=status.HTTP_200_OK)

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
