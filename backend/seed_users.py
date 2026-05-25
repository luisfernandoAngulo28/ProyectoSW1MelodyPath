"""
Script para crear usuarios de prueba en MelodyPath.
Ejecutar con: python manage.py shell < seed_users.py

Usuarios creados:
  admin@melodypath.com   / Admin123!   → Administrador
  luis@melodypath.com    / Test123!    → Premium  (Piano,    nivel 7)
  fernando@melodypath.com/ Test123!    → Premium  (Guitarra, nivel 5)
  maria@melodypath.com   / Test123!    → Usuario  (Canto,    nivel 3)
  carlos@melodypath.com  / Test123!    → Usuario  (Batería,  nivel 2)
  ana@melodypath.com     / Test123!    → Usuario  (Violín,   nivel 4)
  diego@melodypath.com   / Test123!    → Usuario  (Trompeta, nivel 1)
  sofia@melodypath.com   / Test123!    → Premium  (Piano,    nivel 6)
"""
import django, os
from datetime import date, timedelta

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "melodypath.settings")
django.setup()

from apps.users.models import User
from apps.instruments.models import Instrument

def get_instrument(slug):
    try:
        return Instrument.objects.get(slug=slug)
    except Instrument.DoesNotExist:
        print(f"  ⚠ Instrumento '{slug}' no encontrado. Ejecuta seed_data.py primero.")
        return None

users_data = [
    {
        "email": "admin@melodypath.com",
        "name": "Admin MelodyPath",
        "password": "Admin123!",
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "instrument_slug": None,
        "level": 10,
        "xp": 5000,
        "xp_next": 25628,
        "streak": 30,
        "last_practice": date.today(),
        "is_premium": True,
        "initial_assessment_done": True,
        "initial_level": "advanced",
    },
    {
        "email": "luis@melodypath.com",
        "name": "Luis Fernando",
        "password": "Test123!",
        "role": "premium",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "piano",
        "level": 7,
        "xp": 3500,
        "xp_next": 11390,
        "streak": 15,
        "last_practice": date.today(),
        "is_premium": True,
        "initial_assessment_done": True,
        "initial_level": "intermediate",
    },
    {
        "email": "fernando@melodypath.com",
        "name": "Fernando Dev",
        "password": "Test123!",
        "role": "premium",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "guitar",
        "level": 5,
        "xp": 2200,
        "xp_next": 7594,
        "streak": 7,
        "last_practice": date.today(),
        "is_premium": True,
        "initial_assessment_done": True,
        "initial_level": "intermediate",
    },
    {
        "email": "maria@melodypath.com",
        "name": "María García",
        "password": "Test123!",
        "role": "user",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "voice",
        "level": 3,
        "xp": 600,
        "xp_next": 3375,
        "streak": 3,
        "last_practice": date.today() - timedelta(days=1),
        "is_premium": False,
        "initial_assessment_done": True,
        "initial_level": "beginner",
    },
    {
        "email": "carlos@melodypath.com",
        "name": "Carlos Ruiz",
        "password": "Test123!",
        "role": "user",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "drums",
        "level": 2,
        "xp": 800,
        "xp_next": 2250,
        "streak": 0,
        "last_practice": date.today() - timedelta(days=5),
        "is_premium": False,
        "initial_assessment_done": True,
        "initial_level": "beginner",
    },
    {
        "email": "ana@melodypath.com",
        "name": "Ana Pérez",
        "password": "Test123!",
        "role": "user",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "violin",
        "level": 4,
        "xp": 900,
        "xp_next": 5062,
        "streak": 5,
        "last_practice": date.today(),
        "is_premium": False,
        "initial_assessment_done": True,
        "initial_level": "intermediate",
    },
    {
        "email": "diego@melodypath.com",
        "name": "Diego Torres",
        "password": "Test123!",
        "role": "user",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "trumpet",
        "level": 1,
        "xp": 200,
        "xp_next": 1000,
        "streak": 1,
        "last_practice": date.today(),
        "is_premium": False,
        "initial_assessment_done": False,
        "initial_level": "beginner",
    },
    {
        "email": "sofia@melodypath.com",
        "name": "Sofía López",
        "password": "Test123!",
        "role": "premium",
        "is_staff": False,
        "is_superuser": False,
        "instrument_slug": "piano",
        "level": 6,
        "xp": 4000,
        "xp_next": 7594,
        "streak": 10,
        "last_practice": date.today(),
        "is_premium": True,
        "initial_assessment_done": True,
        "initial_level": "advanced",
    },
]

print("Creando usuarios de prueba...\n")

created_count = 0
skipped_count = 0

for data in users_data:
    instrument_slug = data.pop("instrument_slug")
    password = data.pop("password")

    if User.objects.filter(email=data["email"]).exists():
        print(f"  → Ya existe: {data['email']}")
        skipped_count += 1
        data["instrument_slug"] = instrument_slug
        data["password"] = password
        continue

    instrument = get_instrument(instrument_slug) if instrument_slug else None

    user = User.objects.create_user(
        email=data["email"],
        name=data["name"],
        password=password,
        role=data["role"],
        is_staff=data["is_staff"],
        is_superuser=data["is_superuser"],
        instrument=instrument,
        level=data["level"],
        xp=data["xp"],
        xp_next=data["xp_next"],
        streak=data["streak"],
        last_practice=data["last_practice"],
        is_premium=data["is_premium"],
        initial_assessment_done=data["initial_assessment_done"],
        initial_level=data["initial_level"],
    )

    role_icon = {"admin": "👑", "premium": "⭐", "user": "👤"}[user.role]
    instr_name = instrument.name if instrument else "Sin instrumento"
    print(f"  ✓ Creado {role_icon} {user.name} | {user.email} | {instr_name} | Nivel {user.level}")
    created_count += 1

print(f"\n✅ Usuarios listos.")
print(f"   Creados:  {created_count}")
print(f"   Ya existían: {skipped_count}")
print(f"   Total en BD: {User.objects.count()}")
print()
print("📋 Credenciales:")
print("   admin@melodypath.com    → Admin123!  (admin + superuser)")
print("   luis@melodypath.com     → Test123!   (premium)")
print("   fernando@melodypath.com → Test123!   (premium)")
print("   maria@melodypath.com    → Test123!   (user)")
print("   carlos@melodypath.com   → Test123!   (user)")
print("   ana@melodypath.com      → Test123!   (user)")
print("   diego@melodypath.com    → Test123!   (user)")
print("   sofia@melodypath.com    → Test123!   (premium)")
