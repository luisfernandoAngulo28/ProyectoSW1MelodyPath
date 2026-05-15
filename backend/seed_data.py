"""
Script para cargar datos iniciales en MelodyPath.
Ejecutar con: python manage.py shell < seed_data.py
"""
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "melodypath.settings")
django.setup()

from apps.instruments.models import Instrument
from apps.gamification.models import Badge, Challenge
from apps.assessment.models import AssessmentQuestion

# ── Instrumentos ─────────────────────────────────────
instruments_data = [
    {"name": "Piano",    "slug": "piano",    "emoji": "🎹", "category": "keyboard",   "description": "El rey de los instrumentos. Ideal para entender teoría musical.", "order": 1},
    {"name": "Guitarra", "slug": "guitar",   "emoji": "🎸", "category": "string",     "description": "El instrumento más popular del mundo. Versátil y expresivo.",      "order": 2},
    {"name": "Batería",  "slug": "drums",    "emoji": "🥁", "category": "percussion", "description": "El corazón rítmico de la música. Desarrolla la coordinación.",     "order": 3},
    {"name": "Canto",    "slug": "voice",    "emoji": "🎤", "category": "voice",      "description": "Tu voz es tu instrumento. Aprende técnica vocal profesional.",      "order": 4},
    {"name": "Violín",   "slug": "violin",   "emoji": "🎻", "category": "string",     "description": "Instrumento de cuerda con sonido apasionado y expresivo.",         "order": 5},
    {"name": "Trompeta", "slug": "trumpet",  "emoji": "🎺", "category": "wind",       "description": "Instrumento de viento con sonido brillante y poderoso.",           "order": 6},
]

print("Creando instrumentos...")
for data in instruments_data:
    obj, created = Instrument.objects.get_or_create(slug=data["slug"], defaults=data)
    print(f"  {'✓ Creado' if created else '→ Ya existe'}: {obj.emoji} {obj.name}")

# ── Insignias ─────────────────────────────────────────
badges_data = [
    {"slug": "first_lesson",    "name": "Primera Lección",    "icon": "🎵", "description": "Completaste tu primera lección",              "xp_required": 0},
    {"slug": "streak_3",        "name": "Racha de 3 días",    "icon": "🔥", "description": "Practica 3 días consecutivos",                "xp_required": 0},
    {"slug": "streak_7",        "name": "Racha Semanal",       "icon": "⚡", "description": "Practica 7 días consecutivos",                "xp_required": 0},
    {"slug": "perfect_score",   "name": "Puntaje Perfecto",   "icon": "⭐", "description": "Obtén 100% en una evaluación",               "xp_required": 0},
    {"slug": "level_5",         "name": "Nivel 5",             "icon": "🏅", "description": "Alcanzaste el nivel 5",                      "xp_required": 5000},
    {"slug": "level_10",        "name": "Maestro",             "icon": "🎓", "description": "Alcanzaste el nivel 10",                     "xp_required": 10000},
    {"slug": "weekly_champion", "name": "Campeón Semanal",    "icon": "🏆", "description": "Ganaste el reto semanal",                    "xp_required": 0},
    {"slug": "social_star",     "name": "Estrella Social",    "icon": "🌟", "description": "Compartiste 5 logros con la comunidad",      "xp_required": 0},
    {"slug": "early_bird",      "name": "Madrugador",          "icon": "🌅", "description": "Practicaste antes de las 8am",               "xp_required": 0},
    {"slug": "100_exercises",   "name": "Centurión",           "icon": "💯", "description": "Completaste 100 ejercicios",                 "xp_required": 0},
]

print("\nCreando insignias...")
for data in badges_data:
    obj, created = Badge.objects.get_or_create(slug=data["slug"], defaults=data)
    print(f"  {'✓ Creado' if created else '→ Ya existe'}: {obj.icon} {obj.name}")

# ── Retos ─────────────────────────────────────────────
challenges_data = [
    {"title": "Práctica Diaria",        "description": "Completa 1 lección hoy",           "frequency": "daily",  "xp_reward": 50,  "target_count": 1, "action_type": "complete_lesson"},
    {"title": "Ejercitación Diaria",    "description": "Completa 3 ejercicios hoy",         "frequency": "daily",  "xp_reward": 30,  "target_count": 3, "action_type": "complete_exercise"},
    {"title": "Maratón Semanal",        "description": "Completa 5 lecciones esta semana",  "frequency": "weekly", "xp_reward": 200, "target_count": 5, "action_type": "complete_lesson"},
    {"title": "Reto de Precisión",      "description": "Obtén 80%+ en 3 evaluaciones",      "frequency": "weekly", "xp_reward": 150, "target_count": 3, "action_type": "pass_evaluation"},
    {"title": "Racha de Práctica",      "description": "Practica 5 días consecutivos",      "frequency": "weekly", "xp_reward": 300, "target_count": 5, "action_type": "daily_streak"},
]

print("\nCreando retos...")
from datetime import date
for data in challenges_data:
    obj, created = Challenge.objects.get_or_create(title=data["title"], defaults=data)
    print(f"  {'✓ Creado' if created else '→ Ya existe'}: {obj.title} (+{obj.xp_reward} XP)")

# ── Preguntas de Evaluación Inicial ──────────────────
questions_data = [
    {"question": "¿Cuántas notas tiene la escala musical occidental?",    "category": "theory",  "options": ["5", "7", "8", "12"],    "correct_answer": "7",          "level_indicator": "beginner",     "order": 1},
    {"question": "¿Cuál es la nota que corresponde al DO?",               "category": "notes",   "options": ["A", "B", "C", "D"],     "correct_answer": "C",          "level_indicator": "beginner",     "order": 2},
    {"question": "¿Qué indica el compás 4/4?",                            "category": "rhythm",  "options": ["4 corcheas por compás","4 negras por compás","4 redondas","4 blancas"], "correct_answer": "4 negras por compás", "level_indicator": "intermediate","order": 3},
    {"question": "¿Qué es una escala pentatónica?",                       "category": "theory",  "options": ["De 5 notas","De 7 notas","De 12 notas","De 3 notas"],   "correct_answer": "De 5 notas",  "level_indicator": "intermediate", "order": 4},
    {"question": "¿Cuántas cuerdas tiene una guitarra estándar?",         "category": "instruments","options": ["4","5","6","7"],      "correct_answer": "6",          "level_indicator": "beginner",     "order": 5},
    {"question": "¿Qué es un acorde?",                                    "category": "theory",  "options": ["Una nota sola","Tres o más notas sonando juntas","Un ritmo","Una escala"], "correct_answer": "Tres o más notas sonando juntas", "level_indicator": "beginner", "order": 6},
    {"question": "¿Qué significa BPM en música?",                         "category": "rhythm",  "options": ["Beats Por Minuto","Bajo Piano Mayor","Blancas Por Medida","Notas Por Minuto"], "correct_answer": "Beats Por Minuto", "level_indicator": "beginner", "order": 7},
    {"question": "¿Cuál es la diferencia entre sostenido (#) y bemol (b)?","category": "theory", "options": ["# sube, b baja medio tono","# baja, b sube medio tono","Son iguales","Solo cambia el nombre"], "correct_answer": "# sube, b baja medio tono", "level_indicator": "intermediate", "order": 8},
    {"question": "¿Qué es el solfeo?",                                    "category": "theory",  "options": ["Cantar con letras de notas","Tocar sin partitura","Un ritmo especial","Un instrumento"], "correct_answer": "Cantar con letras de notas", "level_indicator": "beginner", "order": 9},
    {"question": "¿Qué escala tiene la estructura T-T-S-T-T-T-S?",        "category": "theory",  "options": ["Menor natural","Mayor","Pentatónica","Cromática"], "correct_answer": "Mayor", "level_indicator": "advanced", "order": 10},
]

print("\nCreando preguntas de evaluación inicial...")
for data in questions_data:
    obj, created = AssessmentQuestion.objects.get_or_create(order=data["order"], defaults=data)
    print(f"  {'✓ Creado' if created else '→ Ya existe'}: Q{obj.order}. {obj.question[:50]}...")

print("\n✅ Datos iniciales cargados correctamente.")
print(f"   Instrumentos: {Instrument.objects.count()}")
print(f"   Insignias:    {Badge.objects.count()}")
print(f"   Retos:        {Challenge.objects.count()}")
print(f"   Preguntas:    {AssessmentQuestion.objects.count()}")
