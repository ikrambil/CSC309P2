from django.urls import reverse
from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']

    def create(self, validated_data):
        password = validated_data.pop('password')

        # Check if 'username' is present in validated_data
        if 'username' not in validated_data:
            raise serializers.ValidationError("Username is required.")

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Do not return a dictionary, let the instance be created
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
