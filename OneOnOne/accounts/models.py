from django.db import models
from django.contrib.auth.models import User
from jsonfield import JSONField

# Create your models here.


class Contact(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=120)
