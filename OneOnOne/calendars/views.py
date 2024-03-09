import json

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from .models import Calendar, Invitation
from .serializers import CalendarSerializer, CalendarDetailSerializer, InvitationSerializer

class CalendarCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CalendarDetailView(RetrieveAPIView):
    queryset = Calendar.objects.all()
    serializer_class = CalendarDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Calendar.objects.filter(owner=self.request.user)


class UpdateInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, format=None):
        # Fetch the invitation instance; ensure the user is the invitee and the status is Pending
        try:
            invitation = Invitation.objects.get(pk=pk, invitee=request.user, status='Pending')
        except Invitation.DoesNotExist:
            return Response({'message': 'Invitation not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)

        # Parse and validate the availability data from the request
        availability_data = request.data.get('availability', '[]')
        try:
            # Ensure it's a valid JSON string representing a list
            availability_list = json.loads(availability_data)
            if not isinstance(availability_list, list):
                raise ValueError
            # Optionally, further validate the content of availability_list here
        except ValueError:
            return Response({'message': 'Invalid availability format.'}, status=status.HTTP_400_BAD_REQUEST)

        # Update the invitation status and availability
        invitation.status = 'Accepted'
        invitation.availability = json.dumps(availability_list)  # Serialize the list back to a string
        invitation.save()

        # Respond with the updated invitation data
        serializer = InvitationSerializer(invitation)
        return Response(serializer.data, status=status.HTTP_200_OK)