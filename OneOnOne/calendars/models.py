from django.db import models
from django.contrib.auth.models import User

class Calendar(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(User, related_name='owned_calendars', on_delete=models.CASCADE)
    participants = models.ManyToManyField(User, related_name='participating_calendars', through='Invitation')
    availability = models.TextField(default='[]')  # Stores serialized JSON string

class Invitation(models.Model):
    calendar = models.ForeignKey(Calendar, on_delete=models.CASCADE)
    invitee = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=[('Pending', 'Pending'), ('Accepted', 'Accepted'), ('Declined', 'Declined')])
    availability = models.TextField(default='[]')  # Stores serialized JSON string
