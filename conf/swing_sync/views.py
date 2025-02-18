from django.shortcuts import render, HttpResponseRedirect, redirect, HttpResponse
from django.contrib.auth.decorators import login_required
from .models import User
from django.contrib.auth import authenticate, login, logout as auth_logout
from .forms import CustomUserCreationForm, EmailAuthenticationForm

def home(request):
    if request.user.is_authenticated:

        return render(request, "home.html")
    else:
        return redirect("login")
    
def login_view(request):
    if request.method == "POST":
        form = EmailAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            email = form.cleaned_data.get("username")
            password = form.cleaned_data.get("password")
            user = authenticate(
                request,
                username=User.objects.get(email=email).username,
                password=password,
            )
            if user is not None:
                login(request, user)
                return redirect("home")
    else:
        form = EmailAuthenticationForm()
    return render(request, "login.html", {"form": form})

def register(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect("login_view")
    else:
        form = CustomUserCreationForm()
    return render(request, "register.html", {"form": form})

@login_required
def account(request):
    return render(request, "account.html", {"user": request.user})

@login_required
def logout(request):
    auth_logout(request)
    return redirect("login")

    
@login_required
def search(request):
    ...

