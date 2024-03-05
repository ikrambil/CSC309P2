from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.views.generic.edit import CreateView, FormView
from django.views import View
from django.urls import reverse_lazy
from . import forms
from django.contrib.auth import authenticate, login, update_session_auth_hash, logout

# Create your views here.
class RegisterView(CreateView):
    form_class = forms.RegisterForm
    template_name = 'accounts/register.html'
    success_url = reverse_lazy('accounts:login')
        
class LoginView(View):
    template_name = 'accounts/login.html'
    success_url ='accounts:view_profile'

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name, {'form': forms.LoginForm()})

    def post(self, request, *args, **kwargs):
        form = forms.LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            
            if username == "" or password == "":
                return render(request, self.template_name, {'form': form, 'error_message': "Username or password is invalid."})

            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect(self.success_url)
        
        return render(request, self.template_name, {'form': form, 'error_message': "Username or password is invalid."})
    
class LogoutView(View):
    def get(self, request):
        if request.user.is_authenticated:
            logout(request)
        return redirect('accounts:login')

class ViewView(View):
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponse('UNAUTHORIZED', status=401)
        
    def get(self, request):
        user = request.user
        user_data = {
            "id": user.id,
            "username": user.username,
            "email": user.email, 
            "first_name": user.first_name,
            "last_name": user.last_name,
        }
        return JsonResponse(user_data)

    
class EditView(FormView):
    form_class = forms.EditForm
    template_name = 'accounts/profile.html'
    success_url = reverse_lazy('accounts:view_profile')

    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            return super().dispatch(request, *args, **kwargs)
        else:
            return HttpResponse('UNAUTHORIZED', status=401)
        
    def get_initial(self):
        initial = super().get_initial()
        initial['email'] = self.request.user.email
        initial['first_name'] = self.request.user.first_name
        initial['last_name'] = self.request.user.last_name
        return initial.copy()
    
    def form_valid(self, form, **kwargs):
        user = self.request.user
        if 'password1' in form.cleaned_data and form.cleaned_data['password1'] != "":
            if 'password2' in form.cleaned_data and form.cleaned_data['password2'] != form.cleaned_data['password1']:
                context = self.get_context_data(**kwargs)
                context['error_message'] = "The two password fields didn't match"
                return self.render_to_response(context)
            else:
                if len(form.cleaned_data['password1']) < 8: 
                    context = self.get_context_data(**kwargs)
                    context['error_message'] = "This password is too short. It must contain at least 8 characters"
                    return self.render_to_response(context)
                else:
                    user.set_password(form.cleaned_data['password1'])

        if 'email' in form.cleaned_data:
            if '@' in form.cleaned_data['email'] or form.cleaned_data['email']=="":
                user.email = form.cleaned_data['email']
            else:
                context['error_message'] = "Enter a valid email address"
                return self.render_to_response(context)
            
        if 'first_name' in form.cleaned_data:
            user.first_name = form.cleaned_data['first_name']

        if 'last_name' in form.cleaned_data:
            user.last_name = form.cleaned_data['last_name']

        user.save()
        update_session_auth_hash(self.request, user)
        return super().form_valid(form)