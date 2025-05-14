from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

def login_page(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    context = {}
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            context["error"] = "Invalid credentials."
    return render(request, 'login.html', context)

def signup(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    context = {}
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        password_confirm = request.POST.get("password_confirm")
        
        if password != password_confirm:
            context["error"] = "Passwords do not match."
        elif User.objects.filter(username=username).exists():
            context["error"] = "Username already exists."
        else:
            user = User.objects.create_user(username=username, password=password)
            login(request, user)
            return redirect('dashboard')
    
    return render(request, 'signup.html', context)

@login_required
def dashboard(request):
    context = {
        'user_spent': 350.00,
        'user_saved': 45.75,
        'purchases': [
            {"name": "Headphones", "price": 50.00, "saved": 5.00},
            {"name": "Monitor",    "price": 300.00, "saved": 30.00},
            {"name": "USB Cable",  "price": 0.00,   "saved": 10.75},
        ]
    }
    return render(request, 'dashboard.html', context)

@login_required
def logout_user(request):
    logout(request)
    return redirect('login')
