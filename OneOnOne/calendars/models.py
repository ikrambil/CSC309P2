import uuid
import json
from django.db import models
from django.contrib.auth.models import User
from django.core.serializers.json import DjangoJSONEncoder

class Calendar(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name='owned_calendars', on_delete=models.CASCADE)
    participants = models.TextField(default='[]')  # To store participant emails as a JSON list
    availability = models.TextField(default='[]')  # Stores serialized JSON string
    finalized = models.BooleanField(default=False)
    finalized_schedule = models.TextField(default='[]', blank=True, null=True) # Stores the finalized schedule as serialized JSON string

    def save(self, *args, **kwargs):
        if isinstance(self.participants, list):  # Check if participants is already a list
            self.participants = json.dumps(self.participants, cls=DjangoJSONEncoder)
        super(Calendar, self).save(*args, **kwargs)

    def get_participant_emails(self):
        return json.loads(self.participants)
    
    def get_finalized_schedule(self):
        return json.loads(self.finalized_schedule)
    
class Invitation(models.Model):
    calendar = models.ForeignKey(Calendar, related_name='invitations', on_delete=models.CASCADE)
    invitee_email = models.EmailField(default='')  # To store invitee's email
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Unique token for invitation link
    status = models.CharField(max_length=10, choices=[('Pending', 'Pending'), ('Accepted', 'Accepted'), ('Declined', 'Declined')])
    availability = models.TextField(default='[]')  # Stores serialized JSON string
