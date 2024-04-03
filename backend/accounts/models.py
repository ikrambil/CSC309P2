from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Contact(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=120)
    email = models.EmailField(max_length=120)

    @classmethod
    def create(cls, owner, name, email):
        contact = cls(owner=owner, name=name, email=email)
        return contact
