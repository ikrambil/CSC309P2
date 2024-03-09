from rest_framework import serializers
from .models import Calendar, Invitation
import json
from dateutil import parser
from django.core.exceptions import ValidationError

def validate_availability(availability):
    try:
        availability_list = json.loads(availability)
        if not isinstance(availability_list, list):
            raise ValidationError("Availability must be a list of time ranges.")
        for entry in availability_list:
            if not ('start_time' in entry and 'end_time' in entry):
                raise ValidationError("Each availability entry must include start_time and end_time.")
            start_time = parser.parse(entry['start_time'])
            end_time = parser.parse(entry['end_time'])
            if start_time >= end_time:
                raise ValidationError("start_time must be before end_time.")
    except ValueError as e:
        raise ValidationError(f"Invalid availability data: {str(e)}")
    return json.dumps(availability_list)  # Store as serialized JSON string

class CalendarSerializer(serializers.ModelSerializer):
    availability = serializers.CharField(validators=[validate_availability])

    class Meta:
        model = Calendar
        fields = ['id', 'name', 'description', 'owner', 'availability']

class InvitationSerializer(serializers.ModelSerializer):
    availability = serializers.CharField(validators=[validate_availability])

    class Meta:
        model = Invitation
        fields = ['id', 'calendar', 'invitee', 'status', 'availability']


class InvitationDetailSerializer(serializers.ModelSerializer):
    invitee_username = serializers.ReadOnlyField(source='invitee.username')
    invitee_availability = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = ['invitee_username', 'status', 'invitee_availability']

    def get_invitee_availability(self, obj):
        # Convert the serialized string back to a list for the response
        return json.loads(obj.availability)

class CalendarDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    invitations = InvitationDetailSerializer(many=True, source='invitation_set')
    availability = serializers.SerializerMethodField()

    class Meta:
        model = Calendar
        fields = ['id', 'name', 'description', 'owner_username', 'availability', 'invitations']

    def get_availability(self, obj):
        return json.loads(obj.availability)