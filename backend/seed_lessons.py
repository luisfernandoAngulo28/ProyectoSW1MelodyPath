"""
Seed: Lecciones y ejercicios de prueba para MelodyPath.
Ejecutar con: python seed_lessons.py
"""
import django, os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "melodypath.settings")
django.setup()

from apps.instruments.models import Instrument
from apps.lessons.models import Lesson
from apps.exercises.models import Exercise
from apps.users.models import User

piano = Instrument.objects.filter(slug="piano").first()
guitar = Instrument.objects.filter(slug="guitar").first()
drums = Instrument.objects.filter(slug="drums").first()
admin_user = User.objects.filter(role="admin").first()

# ── Lecciones ─────────────────────────────────────────
lessons_data = [
    # Piano – Principiante
    {
        "title":"Las notas musicales",
        "description":"Aprende las 7 notas básicas: Do, Re, Mi, Fa, Sol, La, Si",
        "instrument":piano,"level":"beginner","lesson_type":"theory","order":1,
        "xp_reward":50,"duration_minutes":15,
        "video_url":"https://www.youtube.com/watch?v=Y2V-gBcMkKY",
        "content":"# Las Notas Musicales\n\nLas notas musicales son los sonidos básicos de la música occidental.\n\n## Las 7 notas\n- **Do (C)** — La más baja de la escala\n- **Re (D)** — Segunda nota\n- **Mi (E)** — Tercera nota\n- **Fa (F)** — Cuarta nota\n- **Sol (G)** — Quinta nota\n- **La (A)** — Sexta nota\n- **Si (B)** — Séptima nota\n\n## En el piano\nEn el piano, las notas blancas representan estas 7 notas. Las teclas negras representan sostenidos (#) y bemoles (b).",
    },
    {
        "title":"El ritmo y el compás",
        "description":"Entiende qué es el compás 4/4 y cómo leer el ritmo",
        "instrument":piano,"level":"beginner","lesson_type":"theory","order":2,
        "xp_reward":50,"duration_minutes":20,
        "video_url":"https://www.youtube.com/watch?v=mvuAHFdHoKQ",
        "content":"# El Ritmo y el Compás\n\n## ¿Qué es el ritmo?\nEl ritmo es la organización de los sonidos en el tiempo.\n\n## El compás 4/4\nEl compás más común. Significa **4 tiempos** por cada compás, donde cada tiempo vale una **negra**.\n\n## Figuras rítmicas\n- **Redonda** = 4 tiempos\n- **Blanca** = 2 tiempos\n- **Negra** = 1 tiempo\n- **Corchea** = 1/2 tiempo",
    },
    {
        "title":"Postura y posición en el piano",
        "description":"Aprende la postura correcta para tocar piano sin lesiones",
        "instrument":piano,"level":"beginner","lesson_type":"practice","order":3,
        "xp_reward":60,"duration_minutes":25,
        "video_url":"https://www.youtube.com/watch?v=Cj-NKH1i-Gs",
        "content":"# Postura y Posición en el Piano\n\n## Postura del cuerpo\n- Siéntate derecho con los pies apoyados en el suelo\n- La espalda recta, ligeramente inclinada hacia adelante\n- Distancia: los codos deben estar al nivel de las teclas\n\n## Posición de las manos\n- Dedos curvados como si sostuvieras una pelota\n- Muñecas relajadas y a nivel de las teclas\n- Numeración: pulgar=1, índice=2, medio=3, anular=4, meñique=5",
    },
    # Guitarra – Principiante
    {
        "title":"Partes de la guitarra",
        "description":"Conoce las partes principales de tu guitarra",
        "instrument":guitar,"level":"beginner","lesson_type":"theory","order":1,
        "xp_reward":40,"duration_minutes":10,
        "video_url":"https://www.youtube.com/watch?v=hFCNdAHAQNw",
        "content":"# Partes de la Guitarra\n\n## Cuerpo\nLa caja resonante que amplifica el sonido.\n\n## Mástil y trastes\nEl mástil tiene **trastes** metálicos que dividen en semitonos. Una guitarra estándar tiene 19-24 trastes.\n\n## Cuerdas\nUna guitarra estándar tiene **6 cuerdas**:\n- 6ª (más gruesa): Mi grave (E2)\n- 5ª: La (A2)\n- 4ª: Re (D3)\n- 3ª: Sol (G3)\n- 2ª: Si (B3)\n- 1ª (más fina): Mi agudo (E4)",
    },
    {
        "title":"Tu primer acorde: La Mayor",
        "description":"Aprende a tocar el acorde de La Mayor (A)",
        "instrument":guitar,"level":"beginner","lesson_type":"practice","order":2,
        "xp_reward":75,"duration_minutes":30,
        "video_url":"https://www.youtube.com/watch?v=RRf1hG5juzc",
        "content":"# El Acorde de La Mayor (A)\n\n## ¿Qué es un acorde?\nUn acorde son **3 o más notas** tocadas simultáneamente.\n\n## Digitación del La Mayor\n```\nCuerda: 6  5  4  3  2  1\nTraste: X  0  2  2  2  0\n```\n- X = No tocar\n- 0 = Cuerda al aire\n- 2 = Segundo traste\n\n## Dedos usados\n- Índice (1): 4ª cuerda, 2° traste\n- Medio (2): 3ª cuerda, 2° traste\n- Anular (3): 2ª cuerda, 2° traste",
    },
    # Batería – Principiante
    {
        "title":"Coordinación básica de batería",
        "description":"Desarrolla la coordinación mano-pie para tocar batería",
        "instrument":drums,"level":"beginner","lesson_type":"practice","order":1,
        "xp_reward":60,"duration_minutes":20,
        "video_url":"https://www.youtube.com/watch?v=AgHJcj-Gvs0",
        "content":"# Coordinación Básica de Batería\n\n## Los elementos básicos\n- **Bombo** (pie derecho): el latido principal\n- **Caja/Redoblante** (mano izquierda): el contratiempo\n- **Hi-Hat** (pie izquierdo + mano derecha): el pulso constante\n\n## El patrón básico de rock\n```\nHi-Hat:  X - X - X - X -\nCaja:    - - X - - - X -\nBombo:   X - - - X - - -\nTiempo:  1   2   3   4\n```\n\nPractica lentamente a 60 BPM antes de aumentar la velocidad.",
    },
    # Avanzado – Teoría general
    {
        "title":"Escalas mayores y menores",
        "description":"Domina las escalas mayores y menores en cualquier instrumento",
        "instrument":piano,"level":"intermediate","lesson_type":"theory","order":10,
        "xp_reward":100,"duration_minutes":30,"is_premium":False,
        "video_url":"https://www.youtube.com/watch?v=4jT-3jAPkBg",
        "content":"# Escalas Mayores y Menores\n\n## Escala Mayor\nPatrón de tonos (T) y semitonos (S): **T-T-S-T-T-T-S**\n\nEjemplo: Do Mayor\nDo-Re-Mi-Fa-Sol-La-Si-Do\n\n## Escala Menor Natural\nPatrón: **T-S-T-T-S-T-T**\n\nEjemplo: La Menor\nLa-Si-Do-Re-Mi-Fa-Sol-La\n\n## Relación entre mayor y menor\nCada escala mayor tiene una **relativa menor** que comparte las mismas notas.",
    },
]

print("Creando lecciones...")
created_lessons = []
for d in lessons_data:
    lesson, created = Lesson.objects.get_or_create(
        title=d["title"],
        defaults={**d, "is_active": True, "created_by": admin_user}
    )
    created_lessons.append(lesson)
    print(f"  {'✓' if created else '→'} {lesson.title}")

# ── Ejercicios ────────────────────────────────────────
exercises_data = [
    {"title":"¿Cuántos semitonos hay en una octava?","exercise_type":"ear_training","difficulty":"easy","lesson":created_lessons[0],"question":"¿Cuántos semitonos hay en una octava completa?","options":["7","10","12","8"],"correct_answer":"12","explanation":"Una octava tiene 12 semitonos: las 7 notas naturales más los 5 sostenidos/bemoles.","xp_reward":10},
    {"title":"¿Qué nota es el DO en inglés?","exercise_type":"note_recognition","difficulty":"easy","lesson":created_lessons[0],"question":"¿Cómo se llama la nota DO en la notación anglosajona?","options":["A","B","C","D"],"correct_answer":"C","explanation":"En la notación anglosajona: Do=C, Re=D, Mi=E, Fa=F, Sol=G, La=A, Si=B.","xp_reward":10},
    {"title":"¿Qué nota es el LA en inglés?","exercise_type":"note_recognition","difficulty":"easy","lesson":created_lessons[0],"question":"¿Cómo se llama la nota LA en notación anglosajona?","options":["A","B","F","G"],"correct_answer":"A","explanation":"LA = A en la notación anglosajona o cifrado americano.","xp_reward":10},
    {"title":"El compás 4/4","exercise_type":"rhythm","difficulty":"easy","lesson":created_lessons[1],"question":"En un compás de 4/4, ¿cuántas negras caben?","options":["2","3","4","8"],"correct_answer":"4","explanation":"4/4 significa 4 tiempos por compás, cada tiempo vale una negra.","xp_reward":10},
    {"title":"Valor de la redonda","exercise_type":"rhythm","difficulty":"easy","lesson":created_lessons[1],"question":"¿Cuántos tiempos vale una redonda?","options":["1","2","4","8"],"correct_answer":"4","explanation":"La redonda vale 4 tiempos en el compás de 4/4.","xp_reward":10},
    {"title":"Dedos en el piano","exercise_type":"ear_training","difficulty":"easy","lesson":created_lessons[2],"question":"¿Qué número se le asigna al dedo pulgar en el piano?","options":["1","2","3","5"],"correct_answer":"1","explanation":"La numeración es: pulgar=1, índice=2, medio=3, anular=4, meñique=5.","xp_reward":10},
    {"title":"Cuerdas de la guitarra","exercise_type":"note_recognition","difficulty":"easy","lesson":created_lessons[3],"question":"¿Cuántas cuerdas tiene una guitarra estándar?","options":["4","5","6","7"],"correct_answer":"6","explanation":"La guitarra estándar tiene 6 cuerdas: Mi-La-Re-Sol-Si-Mi.","xp_reward":10},
    {"title":"Acorde de La Mayor","exercise_type":"chord","difficulty":"easy","lesson":created_lessons[4],"question":"¿En qué traste se forman los dedos para el acorde de La Mayor (A)?","options":["Traste 1","Traste 2","Traste 3","Traste 4"],"correct_answer":"Traste 2","explanation":"El acorde de La Mayor se forma en el traste 2 de las cuerdas 2, 3 y 4.","xp_reward":15},
    {"title":"Patrón de escala mayor","exercise_type":"ear_training","difficulty":"medium","lesson":created_lessons[6],"question":"¿Cuál es el patrón de tonos y semitonos de la escala mayor?","options":["T-S-T-T-S-T-T","T-T-S-T-T-T-S","S-T-T-S-T-T-T","T-T-T-S-T-T-S"],"correct_answer":"T-T-S-T-T-T-S","explanation":"La escala mayor sigue el patrón T-T-S-T-T-T-S.","xp_reward":20},
    {"title":"Tempo: BPM","exercise_type":"rhythm","difficulty":"easy","lesson":created_lessons[1],"question":"¿Qué significa BPM en música?","options":["Bajo Piano Mayor","Beats Por Minuto","Blancas Por Medida","Bajos Por Mezcla"],"correct_answer":"Beats Por Minuto","explanation":"BPM = Beats Per Minute, indica el tempo de una pieza musical.","xp_reward":10},
]

print("\nCreando ejercicios...")
for d in exercises_data:
    ex, created = Exercise.objects.get_or_create(
        title=d["title"],
        defaults={**d, "is_active": True, "instrument": d.get("instrument")}
    )
    print(f"  {'✓' if created else '→'} {ex.title}")

print(f"\n✅ Seed completado.")
print(f"   Lecciones: {Lesson.objects.count()}")
print(f"   Ejercicios: {Exercise.objects.count()}")
