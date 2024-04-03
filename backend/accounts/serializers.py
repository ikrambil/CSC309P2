from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from .models import Contact

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(**data)
        
        if not user or not user.is_active:
            raise serializers.ValidationError('Incorrect credentials')

        data['user'] = user
        return data

class EditProfileSerializer(serializers.ModelSerializer):
    # contact = serializers.CharField(max_length=120, required=False)
    class Meta:
        model = User
        fields = ('password', 'email', 'first_name', 'last_name')
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def validate_password(self, value):
        # Allow leaving password field empty
        return value

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = self.get_token(self.user)

        # Add the custom data
        data['user_email'] = self.user.email
        data['username'] = self.user.username

        return data

class AddContactSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(max_length=120, required=True)
    contact_email = serializers.EmailField(max_length=120, required=True)

    class Meta:
        model = Contact
        fields = ('contact_name', 'contact_email')


class DeleteContactSerializer(serializers.ModelSerializer):
    contact_email = serializers.EmailField(max_length=120, required=True)

    class Meta:
        model = Contact
        fields = ('contact_email',)

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email']