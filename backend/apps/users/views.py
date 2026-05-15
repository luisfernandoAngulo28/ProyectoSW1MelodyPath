from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenBlacklistView
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings

from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    PasswordResetSerializer, UpdateInstrumentSerializer, AdminUserSerializer
)


class RegisterView(APIView):
    """HU-001: Register new user."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """HU-002: Secure login with JWT."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": UserSerializer(user).data,
        })


class MeView(generics.RetrieveUpdateAPIView):
    """Get / update current user profile."""
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class PasswordResetView(APIView):
    """HU-002: Password recovery by email."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        send_mail(
            subject="Recupera tu contraseña — MelodyPath",
            message=f"Visita este enlace para restablecer tu contraseña: {settings.FRONTEND_URL}/reset-password?email={email}",
            from_email="noreply@melodypath.com",
            recipient_list=[email],
            fail_silently=True,
        )
        return Response({"detail": "Correo de recuperación enviado."})


class UpdateInstrumentView(APIView):
    """HU-005, HU-006: Select or change main instrument."""
    def patch(self, request):
        from apps.instruments.models import Instrument
        serializer = UpdateInstrumentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            instrument = Instrument.objects.get(id=serializer.validated_data["instrument"])
        except Instrument.DoesNotExist:
            return Response({"detail": "Instrumento no encontrado."}, status=404)
        request.user.instrument = instrument
        request.user.save(update_fields=["instrument"])
        return Response(UserSerializer(request.user).data)


# ── Admin Views (HU-021) ──────────────────────────────
class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
    search_fields = ["name","email"]
    filterset_fields = ["role","is_active","is_premium"]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()
