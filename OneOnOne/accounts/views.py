from django.contrib.auth import get_user_model, authenticate, logout, login
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from django.contrib.auth import update_session_auth_hash
from rest_framework.views import APIView
from django.core import serializers
from .models import Contact

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer

class LoginView(generics.CreateAPIView):
    serializer_class = LoginSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data.get('username')
        password = serializer.validated_data.get('password')

        if username == "" or password == "":
            return Response({'error_message': "Username or password is invalid."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({'detail': 'Login successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'error_message': "Username or password is invalid."}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        logout(request)
        return Response({'detail': 'Logout successful'}, status=status.HTTP_200_OK)

    def get(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)


class EditProfileView(generics.UpdateAPIView):
    serializer_class = EditProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        original_data = self.get_serializer(instance).data  # Get the original data before update

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Handle password update separately
        if 'password' in serializer.validated_data and serializer.validated_data['password']:
            instance.set_password(serializer.validated_data['password'])
            update_session_auth_hash(request, instance)

        self.perform_update(serializer)

        # Return updated profile details along with unchanged fields
        updated_data = serializer.data
        response_data = {'detail': 'Profile updated successfully', 'profile': {}}

        # Include unchanged fields from the original profile data
        for key, value in original_data.items():
            response_data['profile'][key] = updated_data.get(key, value)

        return Response(response_data, status=status.HTTP_200_OK)


class ContactView(APIView):

    def get(self, request):
        contacts = Contact.objects.filter(owner=request.user).values()
        newContacts = []
        for x in contacts:
            new = dict(list(x.items())[-2:])
            newContacts.append(new)

        #qs_json = serializers.serialize('json', contacts)
        return Response({"contacts": newContacts})


class AddContactView(generics.UpdateAPIView):
    serializer_class = AddContactSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data)
        print(self.request.user)
        if not serializer.is_valid():
            response_data = {'detail': 'Both fields are required'}
            return Response(response_data)

        self.perform_update(serializer)

        # Return updated profile details along with unchanged fields
        updated_data = serializer.data
        response_data = {'detail': 'Contact added successfully', 'contacts': {}}

        # Include unchanged fields from the original profile data
        name = updated_data['contact_name']
        email = updated_data['contact_email']
        response_data['contacts'][name] = email

        newContact = Contact.create(self.request.user, name, email)
        newContact.save()

        return Response(response_data, status=status.HTTP_200_OK)


class DeleteContactView(generics.UpdateAPIView):
    serializer_class = DeleteContactSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        instance = self.get_object()

        serializer = self.get_serializer(instance, data=request.data)
        if not serializer.is_valid():
            response_data = {'detail': 'Email field is required'}
            return Response(response_data)

        self.perform_update(serializer)

        # Return updated profile details along with unchanged fields
        updated_data = serializer.data
        response_data = {'detail': 'Contact removed successfully', 'contacts': {}}

        email = updated_data['contact_email']

        if not Contact.objects.filter(email=email):
            response_data = {'detail': 'No contact with that email exists'}
            return Response(response_data, status=status.HTTP_200_OK)

        Contact.objects.filter(email=email).delete()

        return Response(response_data, status=status.HTTP_200_OK)

# if User.objects.exclude(pk=self.get_serializer(instance).pk).filter(username="nealon").exists():
#     print("user exists")