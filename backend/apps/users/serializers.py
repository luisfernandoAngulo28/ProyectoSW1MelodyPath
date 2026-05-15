from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    avatar_initial = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            "id","name","email","role","avatar","instrument",
            "level","xp","xp_next","streak","is_premium",
            "initial_assessment_done","initial_level",
            "avatar_initial","date_joined",
        ]
        read_only_fields = ["id","level","xp","xp_next","streak","date_joined","avatar_initial"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["name","email","password"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ya existe una cuenta con este correo.")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["email"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Credenciales incorrectas.")
        if not user.is_active:
            raise serializers.ValidationError("Esta cuenta está desactivada.")
        data["user"] = user
        return data


class LoginResponseSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No existe una cuenta con este correo.")
        return value


class UpdateInstrumentSerializer(serializers.Serializer):
    instrument = serializers.IntegerField()


class AdminUserSerializer(serializers.ModelSerializer):
    """Full serializer for admin user management (HU-021)."""
    class Meta:
        model = User
        fields = [
            "id","name","email","role","is_active","is_premium",
            "level","xp","streak","instrument","date_joined",
        ]
