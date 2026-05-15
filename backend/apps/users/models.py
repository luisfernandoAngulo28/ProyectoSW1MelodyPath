from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra):
        if not email:
            raise ValueError("El correo es obligatorio")
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra):
        extra.setdefault("role", "admin")
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(email, name, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [("user", "Usuario"), ("admin", "Administrador"), ("premium", "Premium")]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="user")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    # Musical profile
    instrument = models.ForeignKey(
        "instruments.Instrument", null=True, blank=True,
        on_delete=models.SET_NULL, related_name="users"
    )
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)
    xp_next = models.PositiveIntegerField(default=1000)
    streak = models.PositiveIntegerField(default=0)
    last_practice = models.DateField(null=True, blank=True)

    # Premium
    is_premium = models.BooleanField(default=False)
    premium_until = models.DateTimeField(null=True, blank=True)

    # Initial assessment
    initial_assessment_done = models.BooleanField(default=False)
    initial_level = models.CharField(max_length=20, blank=True,
        choices=[("beginner","Principiante"),("intermediate","Intermedio"),("advanced","Avanzado")])

    # Django required
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.name} <{self.email}>"

    def add_xp(self, amount: int):
        self.xp += amount
        while self.xp >= self.xp_next:
            self.xp -= self.xp_next
            self.level += 1
            self.xp_next = int(self.xp_next * 1.5)
        self.save(update_fields=["xp", "level", "xp_next"])
        return self.level

    @property
    def avatar_initial(self):
        return self.name[0].upper() if self.name else "?"
