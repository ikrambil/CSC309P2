from django.http import JsonResponse
from django.views import View
from django.contrib.auth import authenticate, login, update_session_auth_hash, logout
from rest_framework import generics, permissions
from .serializers import UserSerializer

# Create your views here.
class RegisterAPIView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class LoginAPIView(View):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']

            if username == "" or password == "":
                return JsonResponse({'error_message': "Username or password is invalid."}, status=400)
            
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': "Login successful."})
            
        return JsonResponse({'error_message': "Username or password is invalid."})
    
class LogoutAPIView(generics.RetrieveAPIView):
    def get(self, request):
        if request.user.is_authenticated:
            logout(request)
            return JsonResponse({'message': "Logout successful."})
        return JsonResponse({'error_message': "User not authenticated."}, status=401)
        
class ViewProfileAPIView(View):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
class EditProfileAPIView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
    
    def perform_update(self, serializer):
        user = serializer.save()
        update_session_auth_hash(self.request, user)