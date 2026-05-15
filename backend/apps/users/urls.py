from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView
from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("login/", views.LoginView.as_view(), name="auth-login"),
    path("logout/", TokenBlacklistView.as_view(), name="auth-logout"),
    path("me/", views.MeView.as_view(), name="auth-me"),
    path("me/instrument/", views.UpdateInstrumentView.as_view(), name="update-instrument"),
    path("password-reset/", views.PasswordResetView.as_view(), name="password-reset"),
]
