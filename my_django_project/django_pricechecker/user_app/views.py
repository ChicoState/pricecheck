# # from django.shortcuts import render, redirect
# # from django.contrib.auth import authenticate, login
# # from django.contrib.auth.models import User

# # def index(request):
# #     return render(request, 'index.html')

# # def login_page(request):
# #     if request.method == "POST":
# #         username = request.POST.get("username")
# #         password = request.POST.get("password")
# #         user = authenticate(request, username=username, password=password)
# #         if user:
# #             login(request, user)
# #             return redirect('dashboard')
# #         else:
# #             return render(request, 'login.html', {"error": "Invalid credentials."})
# #     return render(request, 'login.html')

# # def dashboard(request):
# #     if not request.user.is_authenticated:
# #         return redirect('login')
# #     context = {
# #         'user_spent': 350.00,
# #         'user_saved': 45.75,
# #         'purchases': [
# #             {"name": "Headphones", "price": 50.00, "saved": 5.00},
# #             {"name": "Monitor", "price": 300.00, "saved": 30.00},
# #             {"name": "USB Cable", "price": 0.00, "saved": 10.75},
# #         ]
# #     }
# #     return render(request, 'dashboard.html', context)
# from django.shortcuts import render, redirect
# from django.contrib.auth import authenticate, login
# from django.contrib.auth.decorators import login_required
# from django.contrib.auth.models import User

# def login_page(request):
#     """
#     A simple login page. If the user is authenticated, redirect to dashboard.
#     Otherwise, prompt for username/password.
#     """
#     if request.user.is_authenticated:
#         return redirect('dashboard')

#     if request.method == "POST":
#         username = request.POST.get("username")
#         password = request.POST.get("password")

#         user = authenticate(request, username=username, password=password)
#         if user:
#             login(request, user)
#             return redirect('dashboard')
#         else:
#             return render(request, 'login.html', {"error": "Invalid credentials."})

#     return render(request, 'login.html')

# @login_required
# def dashboard(request):
#     """
#     A dashboard that displays user-specific data:
#       - total spent
#       - total saved
#       - purchases
#       - and a chart of total saved
#     For now, this is all mock data.
#     """
#     # Example mock data
#     context = {
#         'user_spent': 350.00,
#         'user_saved': 45.75,
#         'purchases': [
#             {"name": "Headphones", "price": 50.00, "saved": 5.00},
#             {"name": "Monitor",    "price": 300.00, "saved": 30.00},
#             {"name": "USB Cable",  "price": 0.00,   "saved": 10.75},
#         ]
#     }
#     return render(request, 'dashboard.html', context)

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

def login_page(request):
    """
    A simple login page. If the user is authenticated, redirect to dashboard.
    Otherwise, prompt for username/password.
    """
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {"error": "Invalid credentials."})

    return render(request, 'login.html')

@login_required
def dashboard(request):
    """
    A dashboard that displays user-specific data:
      - total spent
      - total saved
      - purchases
      - and a chart of total saved
    For now, this is all mock data.
    """
    # Example mock data
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
