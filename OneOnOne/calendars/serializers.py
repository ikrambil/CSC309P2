from rest_framework import serializers
from .models import Calendar, Invitation
import json
from dateutil import parser
from django.core.exceptions import ValidationError
from django.core.serializers.json import DjangoJSONEncoder
# TODO: from accounts.models import Contact

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
    participants = serializers.ListField(child=serializers.EmailField(), required=False)
    requests = serializers.ListField(child=serializers.EmailField(), required=False)

    class Meta:
        model = Calendar
        fields = ['id', 'name', 'description', 'owner', 'participants', 'availability', 'requests']
        extra_kwargs = {'owner': {'read_only': True}}  # Make owner read-only to avoid it being required in the input

    def create(self, validated_data):
        participants = validated_data.pop('participants', [])
        print(participants)
        # Serialize participants list to JSON string before saving, if not using ArrayField
        participants_json = json.dumps(participants, cls=DjangoJSONEncoder)
        requests_json = json.dumps([], cls=DjangoJSONEncoder)
        calendar = Calendar.objects.create(**validated_data, participants=participants_json, requests=requests_json)
        return calendar
    
    # TODO: uncomment this when the Contact model is done and pushed.
    # def validate_participants(self, participants):
    #     # Check that all participant emails are in the Contact table
    #     for email in participants:
    #         if not Contact.objects.filter(email=email).exists():
    #             raise serializers.ValidationError(f"The user ({email}) does not exist in your contacts.")
    #     return participants

class InvitationSerializer(serializers.ModelSerializer):
    availability = serializers.CharField(validators=[validate_availability], allow_blank=True)

    class Meta:
        model = Invitation
        fields = ['id', 'calendar', 'invitee_email', 'status', 'availability']

class InvitationDetailSerializer(serializers.ModelSerializer):
    # This serializer will be used to show each invitation's details within a calendar detail view
    
    class Meta:
        model = Invitation
        fields = ['invitee_email', 'status', 'availability','calendar']
        # availability field is included in case you also want to show this

    def get_availability(self, obj):
        # Parse and return the availability JSON string as a Python object (list)
        # This makes it easier to work with in the frontend
        return json.loads(obj.availability) if obj.availability else []

class CalendarDetailSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')
    invitations = InvitationDetailSerializer(many=True, read_only=True)
    availability = serializers.SerializerMethodField()
    pendingInvitationsCount = serializers.SerializerMethodField()
    acceptedInvitationsCount = serializers.SerializerMethodField()

    class Meta:
        model = Calendar
        fields = ['id', 'name', 'description', 'owner_username', 'participants', 'requests', 'availability', 'invitations', 'finalized', 'finalized_schedule', 'pendingInvitationsCount', 
            'acceptedInvitationsCount']

    
    def get_pendingInvitationsCount(self, obj):
        return obj.get_pending_invitations_count()

    def get_acceptedInvitationsCount(self, obj):
        return obj.get_accepted_invitations_count()
    

    def get_availability(self, obj):
        # Assuming availability is stored as a JSON string in the database
        return json.loads(obj.availability)